import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Position } from "geojson";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Linking, StyleSheet, View, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, {
  MapPressEvent,
  PROVIDER_GOOGLE,
  Region,
} from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import mapDarkStyle from "../assets/theme/map/dark.json";
import mapLightStyle from "../assets/theme/map/light.json";
import { BackgroundDataLoader } from "../src/components/BackgroundDataLoader";
import { BeachCluster } from "../src/components/BeachCluster";
import { BeachDetail } from "../src/components/BeachDetail";
import { CaptchaModal } from "../src/components/CaptchaModal";
import { HEADER_HEIGHT } from "../src/components/BeachDetailHeader";
import { BeachMarker } from "../src/components/BeachMarker";
import { DistanceIndicator } from "../src/components/DistanceIndicator";
import { IconButton } from "../src/components/IconButton";
import { LoadingIndicator } from "../src/components/LoadingIndicator";
import { Route } from "../src/components/Route";
import {
  boundingBoxOfDenmark,
  denmarkCenter,
  denmarkNorthEast,
  denmarkSouthWest,
} from "../src/constants";
import { DENMARK_ZOOM, LOCATE_ZOOM } from "../src/constants/map";
import { Mark } from "../src/icons/Mark";
import { Settings01 } from "../src/icons/Settings01";
import { PlatformIcon } from "../src/components/PlatformIcon";
import { usePreferences } from "../src/state/usePreferences";
import { useSelectedBeach } from "../src/state/useSelectedBeach";
import { usePalette } from "../src/theme/usePalette";
import { getCluster } from "../src/utils/getCluster";
import { useMapRecenter } from "../src/utils/useMapRecenter";
import { getWaterQualityCounts } from "../src/utils/getWaterQualityCounts";
import { useDenmarkBeachesData } from "../src/utils/useDenmarkBeachesData";
import { useLocation } from "../src/utils/useLocation";
import { Beaches } from "../types";
import { getSheetDetents } from "../src/utils/getSheetDetents";

const initialCamera = {
  center: denmarkCenter,
  zoom: DENMARK_ZOOM,
  heading: 0,
  pitch: 0,
};

export default () => {
  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  const [showCaptchaModal, setShowCaptchaModal] = useState(false);
  const { foreground } = usePalette();
  const {
    location,
    status: locationStatus,
    retryRequestPermissions,
  } = useLocation();
  const { beaches } = useDenmarkBeachesData();
  const mapViewRef = useRef<MapView>(null);
  const colorScheme = useColorScheme();

  const performanceMode = usePreferences((state) => state.performanceMode);
  const setSelectedBeachId = useSelectedBeach(
    (state) => state.setSelectedBeachId,
  );
  const mapProvider = usePreferences((state) => state.mapsProvider);
  const disableCustomMapStyles = usePreferences(
    (state) => state.disableCustomMapStyles,
  );

  const sheetDetents = getSheetDetents();
  const sheetIndexRef = useRef(0);
  const [region, setRegion] = useState<Region | undefined>(undefined);

  useEffect(() => {
    if (mapProvider === PROVIDER_GOOGLE) {
      mapViewRef.current?.setMapBoundaries(denmarkNorthEast, denmarkSouthWest);
    }
  }, [mapViewRef, mapProvider]);

  const buttonBottom = HEADER_HEIGHT;

  const settingsButtonStyles = useMemo(
    () => ({
      position: "absolute" as const,
      bottom: buttonBottom,
      left: 24,
    }),
    [buttonBottom],
  );

  const locateButtonStyles = useMemo(
    () => ({
      position: "absolute" as const,
      bottom: buttonBottom,
      right: 24,
    }),
    [buttonBottom],
  );

  // Callbacks for BackgroundDataLoader
  const handleNeedsCaptcha = useCallback(() => {
    setShowCaptchaModal(true);
  }, []);

  const handleCaptchaSuccess = useCallback(() => {
    setShowCaptchaModal(false);
  }, []);

  const locate = async () => {
    if (
      !location &&
      locationStatus === "denied" &&
      !(await retryRequestPermissions())
    ) {
      Alert.alert(
        "Enable location permissions",
        "Please enable location permissions in your settings to use this feature",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open settings", onPress: Linking.openSettings },
        ],
      );
      return;
    }

    if (location) {
      const { latitude, longitude } = location.coords;
      const inDenmark =
        latitude >= boundingBoxOfDenmark.latitudeSouth &&
        latitude <= boundingBoxOfDenmark.latitudeNorth &&
        longitude >=
          Math.min(
            boundingBoxOfDenmark.longitudeWest,
            boundingBoxOfDenmark.longitudeEast,
          ) &&
        longitude <=
          Math.max(
            boundingBoxOfDenmark.longitudeWest,
            boundingBoxOfDenmark.longitudeEast,
          );

      if (inDenmark) {
        mapViewRef.current?.animateCamera({
          heading: 0,
          pitch: 0,
          center: { latitude, longitude },
          zoom: LOCATE_ZOOM,
        });
      } else {
        mapViewRef.current?.animateCamera({
          heading: 0,
          pitch: 0,
          center: denmarkCenter,
          zoom: DENMARK_ZOOM,
        });
      }
    } else {
      retryRequestPermissions();
    }
  };

  const { recenterMap } = useMapRecenter(
    mapViewRef,
    sheetDetents,
    sheetIndexRef,
  );

  const handleSheetChange = (index: number) => {
    if (sheetIndexRef.current !== index) {
      sheetIndexRef.current = index;
      recenterMap(true);
    }
  };

  const onMapPress = (event: MapPressEvent) => {
    if (event.nativeEvent.action !== "marker-press") {
      setSelectedBeachId();
    }
  };

  const mapZoomIn = (coordinates: Position) => async () => {
    const camera = await mapViewRef.current?.getCamera();

    mapViewRef.current?.animateCamera({
      center: {
        latitude: coordinates[1],
        longitude: coordinates[0],
      },
      zoom: camera?.zoom ? camera.zoom + 2 : 8,
    });
  };

  const { cluster, markers } = getCluster(beaches, region, performanceMode);

  return (
    <>
      <StatusBar style="auto" />

      <BackgroundDataLoader
        onNeedsCaptcha={handleNeedsCaptcha}
        onSuccess={handleCaptchaSuccess}
      />

      <CaptchaModal
        visible={showCaptchaModal}
        onClose={() => setShowCaptchaModal(false)}
        onSuccess={handleCaptchaSuccess}
      />

      <MapView
        ref={mapViewRef}
        style={styles.map}
        userInterfaceStyle={colorScheme === "dark" ? "dark" : "light"}
        minZoomLevel={6.5}
        maxZoomLevel={20}
        zoomControlEnabled={false}
        showsUserLocation={!!location}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={false}
        showsBuildings={true}
        showsIndoors={false}
        showsIndoorLevelPicker={false}
        customMapStyle={
          disableCustomMapStyles
            ? undefined
            : colorScheme === "dark"
              ? mapDarkStyle
              : mapLightStyle
        }
        provider={mapProvider}
        onPress={onMapPress}
        initialCamera={initialCamera}
        onRegionChangeComplete={setRegion}
      >
        {cluster &&
          markers
            .filter((marker) => {
              // Filter out individual beach markers without data
              // (clusters always have data, so only check non-cluster markers)
              if (!marker.properties.cluster) {
                const beach = marker.properties.beach;
                if (!beach.data?.[0]) {
                  console.warn(
                    `[Map] Beach ${beach.id} (${beach.name}) has no data array`,
                  );
                  return false;
                }
              }
              return true;
            })
            .map((marker) => {
              if (marker.properties.cluster) {
                const leavesData = cluster.getLeaves(
                  marker.id as number,
                  Infinity,
                );
                const beaches = leavesData.map(
                  (leave) => leave.properties.beach,
                ) as Beaches;
                const waterQualityCounts = getWaterQualityCounts(beaches);

                return (
                  <BeachCluster
                    key={marker.id}
                    id={marker.id}
                    pointsCount={marker.properties.point_count}
                    coordinates={marker.geometry.coordinates}
                    beachIds={beaches.map((beach) => beach.id)}
                    waterQualityCounts={waterQualityCounts}
                    onPress={mapZoomIn(marker.geometry.coordinates)}
                  />
                );
              }

              const beach = marker.properties.beach;
              const today = beach.data[0];

              return (
                <BeachMarker
                  key={`beach-${beach.id}`}
                  beachId={beach.id}
                  coordinates={marker.geometry.coordinates}
                  todayWaterQuality={today.water_quality}
                  todayWaterTemperature={today.water_temperature ?? "?"}
                />
              );
            })}

        <Route />
      </MapView>

      <SafeAreaView style={styles.fillNoPointerEvents}>
        <View style={styles.fillRelativeNoPointerEvents}>
          <IconButton
            style={settingsButtonStyles}
            size="L"
            onPress={() => {
              router.push("/settings");
            }}
          >
            <PlatformIcon
              iosName="gearshape"
              fallback={<Settings01 stroke={foreground} />}
              color={foreground}
            />
          </IconButton>

          <IconButton style={locateButtonStyles} onPress={locate} size="L">
            <PlatformIcon
              iosName="location"
              fallback={<Mark stroke={foreground} />}
              color={foreground}
            />
          </IconButton>
        </View>
      </SafeAreaView>

      <View style={styles.fillNoPointerEvents}>
        <LoadingIndicator />
        <DistanceIndicator />
      </View>

      <View style={styles.fillNoPointerEvents}>
        <BeachDetail onChange={handleSheetChange} />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: "100%",
  },
  fillNoPointerEvents: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    flex: 1,
    pointerEvents: "box-none",
  },
  fillRelativeNoPointerEvents: {
    position: "relative",
    pointerEvents: "box-none",
    width: "100%",
    height: "100%",
    paddingBottom: HEADER_HEIGHT,
  },
});
