import { useEffect } from "react";
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTrueSheetNavigation } from "@lodev09/react-native-true-sheet/navigation";
import { Route } from "../../src/icons/Route";
import { useSelectedBeach } from "../../src/state/useSelectedBeach";
import { usePalette } from "../../src/theme/usePalette";
import { useDenmarkBeachesData } from "../../src/utils/useDenmarkBeachesData";
import { BeachDetailHeader, HEADER_HEIGHT } from "../../src/components/BeachDetailHeader";
import { BeachDetailInfo } from "../../src/components/BeachDetailInfo";
import { Button } from "../../src/components/Button";

export default function BeachDetailScreen() {
  const { foreground } = usePalette();
  const insets = useSafeAreaInsets();
  const navigation = useTrueSheetNavigation();

  const { beaches, isLoading } = useDenmarkBeachesData();
  const selectedBeachId = useSelectedBeach((state) => state.selectedBeachId);

  const selectedBeach = beaches.find((beach) => beach.id === selectedBeachId);
  const today = selectedBeach?.data?.[0];

  // Collapse and lock when no beach is selected
  useEffect(() => {
    if (!selectedBeachId) {
      navigation.resize(0);
      navigation.setOptions({ draggable: false });
    } else {
      navigation.setOptions({ draggable: true });
    }
  }, [selectedBeachId, navigation]);

  const toggleBeachDetail = () => {
    navigation.resize(1);
  };

  return (
    <>
      {selectedBeach ? (
        <BeachDetailHeader
          toggleBeachDetail={toggleBeachDetail}
          selectedBeach={selectedBeach}
          today={today}
        />
      ) : (
        <View style={styles.emptyHeader}>
          {isLoading ? (
            <ActivityIndicator />
          ) : (
            <Text style={[styles.emptyHeaderLabel, { color: foreground }]}>
              Select a beach
            </Text>
          )}
        </View>
      )}

      {selectedBeach && (
        <>
          <View style={styles.contentContainer}>
            <View style={styles.actionsBar}>
              <Button
                onPress={() => {
                  Linking.openURL(
                    `https://www.google.com/maps/dir/?api=1&destination=${selectedBeach.latitude},${selectedBeach.longitude}`,
                  );
                }}
                leadingIcon={<Route stroke={foreground} width={16} height={16} />}
                style={styles.actionsBarAction}
              >
                Directions
              </Button>

              {selectedBeach.municipality_url && (
                <Button
                  onPress={() => {
                    const url =
                      selectedBeach.municipality_url.match(
                        /href=["'](.*)["']/,
                      )?.[1] || undefined;

                    if (!url) return;

                    Linking.openURL(url);
                  }}
                  style={styles.actionsBarAction}
                >
                  {selectedBeach.municipality} Website
                </Button>
              )}
            </View>
          </View>

          <ScrollView
            contentContainerStyle={{
              paddingBottom: insets.bottom,
            }}
          >
            <BeachDetailInfo beach={selectedBeach} />
          </ScrollView>
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  emptyHeader: {
    height: HEADER_HEIGHT,
    paddingLeft: 24,
    paddingRight: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyHeaderLabel: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    opacity: 0.5,
  },
  contentContainer: {
    padding: 24,
    paddingTop: 0,
    paddingBottom: 0,
    gap: 4,
  },
  actionsBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
  },
  actionsBarAction: {
    flexGrow: 1,
  },
});
