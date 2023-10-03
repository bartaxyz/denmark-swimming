import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Position } from "geojson";
import { useEffect, useMemo, useRef, useState } from "react";
import {
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
import {
  BeachDetail,
  HEADER_HEIGHT,
  SHEET_TOP_PADDING,
} from "../src/components/BeachDetail";
import { BeachMarker } from "../src/components/BeachMarker";
import { IconButton } from "../src/components/IconButton";
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
import { useBeachesData } from "../src/useBeachesData";
import { useLocation } from "../src/useLocation";
import { getCluster } from "../src/utils/getCluster";

const initialCamera = {
  center: denmarkCenter,
  zoom: 7,
  heading: 0,
  pitch: 0,
};

export default () => {
  const { background, foreground } = usePalette();
  const { location } = useLocation();
  const { beaches } = useBeachesData();
  const mapViewRef = useRef<MapView>(null);
  const colorScheme = useColorScheme();

  const setSelectedBeachId = useSelectedBeach(
    (state) => state.setSelectedBeachId
  );
  const mapProvider = usePreferences((state) => state.mapsProvider);

  const dimensions = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const locate = () => {
    if (location) {
      mapViewRef.current?.animateCamera({
        center: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        zoom: 12,
      });
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

    let coordinates = [];

    if (location) {
      coordinates = [
        {
          latitude: selectedBeach.latitude,
          longitude: selectedBeach.longitude,
        },
        {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
      ];
    } else {
      // fit all beaches
      coordinates = beaches.map((beach) => ({
        latitude: beach.latitude,
        longitude: beach.longitude,
      }));
    }

    const index = sheetIndexRef.current;
    const padding = index === 1 ? 24 : 120;

    mapViewRef.current?.fitToCoordinates(coordinates, {
      edgePadding: {
        top: padding + insets.top,
        right: padding + insets.right,
        bottom:
          index === 0
            ? HEADER_HEIGHT + insets.bottom + padding
            : index === 1
            ? dimensions.height - SHEET_TOP_PADDING + padding
            : padding + insets.bottom,
        left: padding + insets.left,
      },
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
  const { cluster, markers } = getCluster(beaches, region);

  return (
    <>
      <StatusBar style="auto" />

      <MapView
        ref={mapViewRef}
        style={styles.map}
        userInterfaceStyle={colorScheme || "light"}
        minZoomLevel={6.5}
        zoomControlEnabled={false}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={false}
        showsBuildings={true}
        showsIndoors={false}
        showsIndoorLevelPicker={false}
        customMapStyle={colorScheme === "dark" ? mapDarkStyle : mapLightStyle}
        provider={mapProvider}
        onPress={onMapPress}
        initialCamera={initialCamera}
        onRegionChangeComplete={setRegion}
      >
        {cluster &&
          markers.map((marker, index) => {
            if (marker.properties.cluster) {
              const leaves = cluster.getLeaves(marker.id as number, Infinity);

              return (
                <BeachCluster
                  key={marker.id}
                  cluster={marker}
                  onPress={mapZoomIn(marker.geometry.coordinates)}
                  leaves={leaves}
                />
              );
            }

            return (
              <BeachMarker
                key={`beach-${marker.properties.beach.id}`}
                beach={marker.properties.beach as any}
              />
            );
          })}
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