import { useEffect, useRef } from "react";
import { SafeAreaView, StyleSheet, View, useColorScheme } from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import mapDarkStyle from "./assets/theme/map/dark.json";
import mapLightStyle from "./assets/theme/map/light.json";
import { BeachDetail, HEADER_HEIGHT } from "./src/components/BeachDetail";
import { BeachMarker } from "./src/components/BeachMarker";
import { IconButton } from "./src/components/IconButton";
import { denmarkNorthEast, denmarkSouthWest } from "./src/constants";
import { Mark } from "./src/icons/Mark";
import { Settings01 } from "./src/icons/Settings01";
import { usePalette } from "./src/theme/usePalette";
import { useBeachesData } from "./src/useBeachesData";
import { useLocation } from "./src/useLocation";

export const App = () => {
  const { background, foreground } = usePalette();
  const { location } = useLocation();
  const { beaches } = useBeachesData();
  const mapViewRef = useRef<MapView>(null);
  const colorScheme = useColorScheme();

  const locate = () => {
    if (location) {
      mapViewRef.current?.animateCamera({
        center: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        zoom: 12,
      });

      mapViewRef.current?.fitToSuppliedMarkers;
    }
  };

  useEffect(() => {
    // locate();
  }, [location]);

  useEffect(() => {
    mapViewRef.current?.setMapBoundaries(denmarkNorthEast, denmarkSouthWest);
  }, [mapViewRef]);

  return (
    <>
      <MapView
        ref={mapViewRef}
        style={styles.map}
        userInterfaceStyle={colorScheme || "light"}
        minZoomLevel={6.5}
        zoomControlEnabled={true}
        showsUserLocation={true}
        showsCompass={true}
        showsScale={true}
        showsBuildings={true}
        provider={PROVIDER_GOOGLE}
        customMapStyle={colorScheme === "dark" ? mapDarkStyle : mapLightStyle}
      >
        {beaches.map((beach) => (
          <BeachMarker key={beach.id} beach={beach} />
        ))}
      </MapView>

      <SafeAreaView style={styles.fillNoPointerEvents}>
        <View style={styles.fillRelativeNoPointerEvents}>
          <IconButton
            style={{
              backgroundColor: background,
              position: "absolute",
              bottom: 24 + HEADER_HEIGHT,
              left: 24,
            }}
            onPress={locate}
            size="L"
          >
            <Settings01 stroke={foreground} />
          </IconButton>

          <IconButton
            style={{
              backgroundColor: background,
              position: "absolute",
              bottom: 24 + HEADER_HEIGHT,
              right: 24,
            }}
            onPress={locate}
            size="L"
          >
            <Mark stroke={foreground} />
          </IconButton>
        </View>
      </SafeAreaView>

      <View style={styles.fillNoPointerEvents}>
        <BeachDetail />
      </View>
    </>
  );
}

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
