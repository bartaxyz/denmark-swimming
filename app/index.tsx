import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Position } from "geojson";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Linking,
  SafeAreaView,
  StyleSheet,
  View,
  useColorScheme,
  useWindowDimensions,
} from "react-native";
import MapView, {
  MapPressEvent,
  PROVIDER_GOOGLE,
  Region,
} from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import mapDarkStyle from "../assets/theme/map/dark.json";
import mapLightStyle from "../assets/theme/map/light.json";
import { BeachCluster } from "../src/components/BeachCluster";
import { BeachDetail, SHEET_TOP_PADDING } from "../src/components/BeachDetail";
import { HEADER_HEIGHT } from "../src/components/BeachDetailHeader";
import { BeachMarker } from "../src/components/BeachMarker";
import { DistanceIndicator } from "../src/components/DistanceIndicator";
import { IconButton } from "../src/components/IconButton";
import { LoadingIndicator } from "../src/components/LoadingIndicator";
import { Route } from "../src/components/Route";
import {
  denmarkCenter,
  denmarkNorthEast,
  denmarkSouthWest,
} from "../src/constants";
import { Mark } from "../src/icons/Mark";
import { Settings01 } from "../src/icons/Settings01";
import { usePreferences } from "../src/state/usePreferences";
import { useSelectedBeach } from "../src/state/useSelectedBeach";
import { usePalette } from "../src/theme/usePalette";
import { getCluster } from "../src/utils/getCluster";
import {
  ThresholdType,
  getPassedDistanceThreshold,
} from "../src/utils/getPassedDistanceThreshold";
import { getWaterQualityCounts } from "../src/utils/getWaterQualityCounts";
import { useDenmarkBeachesData } from "../src/utils/useDenmarkBeachesData";
import { useLocation } from "../src/utils/useLocation";
import { Beaches } from "../types";

const initialCamera = {
  center: denmarkCenter,
  zoom: 7,
  heading: 0,
  pitch: 0,
};

export default () => {
  const { background, foreground } = usePalette();
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
    (state) => state.setSelectedBeachId
  );
  const mapProvider = usePreferences((state) => state.mapsProvider);
  const disableCustomMapStyles = usePreferences(
    (state) => state.disableCustomMapStyles
  );

  const dimensions = useWindowDimensions();
  const insets = useSafeAreaInsets();

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
        ]
      );
      return;
    }

    if (location) {
      mapViewRef.current?.animateCamera({
        heading: 0,
        pitch: 0,
        center: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        zoom: 12,
      });
    } else {
      retryRequestPermissions();
    }
  };

  useEffect(() => {
    if (mapProvider === PROVIDER_GOOGLE) {
      mapViewRef.current?.setMapBoundaries(denmarkNorthEast, denmarkSouthWest);
    }
  }, [mapViewRef, mapProvider]);

  const sheetIndexRef = useRef(0);

  const recenterMap = () => {
    const selectedBeachId = useSelectedBeach.getState().selectedBeachId;
    const selectedBeach = beaches.find((beach) => beach.id === selectedBeachId);

    if (!selectedBeach) {
      return;
    }

    let { latitude, longitude } = selectedBeach;
    let coordinates = [{ latitude, longitude }];

    const locationPosition: GeoJSON.Position | undefined = location?.coords
      ? [location.coords.longitude, location.coords.latitude]
      : undefined;
    const beachPosition: GeoJSON.Position = [longitude, latitude];

    /**
     * If the distance between a beach & location is too large,
     * zooming in is not practical.
     */
    const hasPassedDistanceThreshold = getPassedDistanceThreshold(
      ThresholdType.Zoom,
      locationPosition,
      beachPosition
    );

    if (location && !hasPassedDistanceThreshold) {
      coordinates.push({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } else {
      coordinates.push({
        latitude: latitude - 0.02,
        longitude: longitude - 0.02,
      });
      coordinates.push({
        latitude: latitude + 0.02,
        longitude: longitude + 0.02,
      });
    }

    const index = sheetIndexRef.current;
    const padding = index === 1 ? 40 : 80;
    const top = padding + insets.top;

    const edgePadding = {
      top,
      right: padding + insets.right,
      bottom:
        index === 0
          ? HEADER_HEIGHT + insets.bottom + padding
          : index === 1
          ? dimensions.height - SHEET_TOP_PADDING - insets.top + padding
          : padding,
      left: padding + insets.left,
    };

    mapViewRef.current?.fitToCoordinates(coordinates, {
      edgePadding,
      animated: true,
    });
  };

  const handleSheetChange = (index: number) => {
    if (sheetIndexRef.current !== index) {
      sheetIndexRef.current = index;
      recenterMap();
    }
  };

  const settingsButtonStyles = useMemo(
    () => ({
      backgroundColor: background,
      position: "absolute",
      bottom: 24 + HEADER_HEIGHT,
      left: 24,
    }),
    [background]
  );
  const locateButtonStyles = useMemo(
    () => ({
      backgroundColor: background,
      position: "absolute",
      bottom: 24 + HEADER_HEIGHT,
      right: 24,
    }),
    [background]
  );

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

  const [region, setRegion] = useState<Region | undefined>(undefined);
  const { cluster, markers } = getCluster(beaches, region, performanceMode);

  return (
    <>
      <StatusBar style="auto" />

      <MapView
        ref={mapViewRef}
        style={styles.map}
        userInterfaceStyle={colorScheme || "light"}
        minZoomLevel={6.5}
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
          markers.map((marker) => {
            if (marker.properties.cluster) {
              const leavesData = cluster.getLeaves(
                marker.id as number,
                Infinity
              );
              const beaches = leavesData.map(
                (leave) => leave.properties.beach
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

            const today = marker.properties.beach.data[0];

            return (
              <BeachMarker
                key={`beach-${marker.properties.beach.id}`}
                beachId={marker.properties.beach.id}
                coordinates={marker.geometry.coordinates}
                todayWaterQuality={today.water_quality}
                todayWaterTemperature={today.water_temperature}
              />
            );
          })}

        <Route />
      </MapView>

      <SafeAreaView style={styles.fillNoPointerEvents}>
        <View style={styles.fillRelativeNoPointerEvents}>
          <Link href="/settings" asChild={true}>
            <IconButton style={settingsButtonStyles} size="L">
              <Settings01 stroke={foreground} />
            </IconButton>
          </Link>

          <IconButton style={locateButtonStyles} onPress={locate} size="L">
            <Mark stroke={foreground} />
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
