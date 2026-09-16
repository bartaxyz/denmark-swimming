import { Link, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Position } from "geojson";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefCallback,
} from "react";
import { StyleSheet, View, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, {
  Details,
  MapPressEvent,
  Marker,
  PROVIDER_GOOGLE,
  Region,
} from "react-native-maps";
import mapDarkStyle from "../../assets/theme/map/dark.json";
import mapLightStyle from "../../assets/theme/map/light.json";
import { BackgroundDataLoader } from "../../src/components/BackgroundDataLoader";
import {
  DebugFitAreaPolygon,
  DebugInfoHUD,
  DebugViewportRect,
} from "../../src/components/DebugOverlay";
import { BeachCluster } from "../../src/components/BeachCluster";
import { BeachMarker } from "../../src/components/BeachMarker";
import { DistanceIndicator } from "../../src/components/DistanceIndicator";
import { IconButton } from "../../src/components/IconButton";
import { LoadingIndicator } from "../../src/components/LoadingIndicator";
import { PlatformIcon } from "../../src/components/PlatformIcon";
import { Route } from "../../src/components/Route";
import {
  denmarkCenter,
  denmarkNorthEast,
  denmarkSouthWest,
} from "../../src/constants";
import { DENMARK_ZOOM } from "../../src/constants/map";
import { usePreferences } from "../../src/state/usePreferences";
import { useSelectedBeach } from "../../src/state/useSelectedBeach";
import { getCluster } from "../../src/utils/getCluster";
import { useMapRef } from "../../src/state/useMapRef";
import { getWaterQualityCounts } from "../../src/utils/getWaterQualityCounts";
import { useDenmarkBeachesData } from "../../src/utils/useDenmarkBeachesData";
import { useLocation } from "../../src/utils/useLocation";
import { Beaches } from "../../types";
import { useMapActions } from "../../src/state/useMapActions";
import { Mark } from "../../src/icons/Mark";
import { Settings01 } from "../../src/icons/Settings01";
import { usePalette } from "../../src/theme/usePalette";
import { useLocate } from "../../src/utils/useLocate";

const initialCamera = {
  center: denmarkCenter,
  zoom: DENMARK_ZOOM,
  heading: 0,
  pitch: 0,
};

const initialRegion = {
  ...denmarkCenter,
  latitudeDelta: 3.8,
  longitudeDelta: 5.6,
};

export default () => {
  const { foreground } = usePalette();
  const { location } = useLocation();
  const { beaches } = useDenmarkBeachesData();
  const debugMode = usePreferences((s) => s.debugMode);
  const isDebugLocation = __DEV__ && debugMode;
  const mapViewRef = useRef<MapView>(null);
  const setMapView = useMapRef((s) => s.setMapView);
  const mapRefCallback: RefCallback<MapView> = useCallback(
    (instance) => {
      mapViewRef.current = instance;
      setMapView(instance);
    },
    [setMapView],
  );
  const colorScheme = useColorScheme();

  const { performanceMode, mapsProvider, disableCustomMapStyles } =
    usePreferences();
  const isGoogleMaps = mapsProvider === PROVIDER_GOOGLE;
  const setSelectedBeachId = useSelectedBeach(
    (state) => state.setSelectedBeachId,
  );
  const locate = useLocate();

  const [region, setRegion] = useState<Region | undefined>(undefined);

  const onRegionChangeComplete = (region: Region, details: Details) => {
    setRegion(region);
    if (details.isGesture) {
      useMapActions.getState().markUserMoved();
    }
  };

  useEffect(() => {
    if (isGoogleMaps) {
      mapViewRef.current?.setMapBoundaries(denmarkNorthEast, denmarkSouthWest);
    }
  }, [mapViewRef, isGoogleMaps]);

  const handleNeedsCaptcha = useCallback(() => {
    router.push("/captcha");
  }, []);

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

  const { cluster, markers } = useMemo(() => {
    return getCluster(beaches, region, performanceMode);
  }, [beaches, region, performanceMode]);

  return (
    <>
      <StatusBar style="auto" />

      <BackgroundDataLoader onNeedsCaptcha={handleNeedsCaptcha} />

      <MapView
        ref={mapRefCallback}
        style={styles.map}
        userInterfaceStyle={colorScheme === "dark" ? "dark" : "light"}
        cameraZoomRange={
          isGoogleMaps
            ? {
                minCenterCoordinateDistance: 6.5,
                maxCenterCoordinateDistance: 20,
                animated: true,
              }
            : undefined
        }
        zoomControlEnabled={true}
        showsUserLocation={!!location && !isDebugLocation}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={false}
        showsBuildings={true}
        showsIndoors={false}
        showsIndoorLevelPicker={false}
        customMapStyle={
          disableCustomMapStyles
            ? undefined
            : isGoogleMaps
              ? colorScheme === "dark"
                ? mapDarkStyle
                : mapLightStyle
              : undefined
        }
        provider={mapsProvider}
        onPress={onMapPress}
        initialCamera={isGoogleMaps ? initialCamera : undefined}
        initialRegion={isGoogleMaps ? undefined : initialRegion}
        onRegionChangeComplete={onRegionChangeComplete}
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

        {isDebugLocation && location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Debug Location"
            pinColor="blue"
          />
        )}

        <Route />
        <DebugFitAreaPolygon />
      </MapView>

      <View style={styles.fillNoPointerEvents}>
        <LoadingIndicator />
        <DistanceIndicator />
        <DebugInfoHUD />
        <DebugViewportRect />

        <SafeAreaView style={styles.fillNoPointerEvents}>
          <View style={styles.topControls}>
            <Link href="/settings" asChild>
              <IconButton size="L">
                <PlatformIcon
                  iosName="gearshape"
                  fallback={<Settings01 stroke={foreground} />}
                  color={foreground}
                />
              </IconButton>
            </Link>

            <IconButton onPress={locate} size="L">
              <PlatformIcon
                iosName="location"
                fallback={<Mark stroke={foreground} />}
                color={foreground}
              />
            </IconButton>
          </View>
        </SafeAreaView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: "100%",
  },
  topControls: {
    paddingTop: 8,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    pointerEvents: "box-none",
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
});
