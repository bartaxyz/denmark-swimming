import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { FC, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Route } from "../icons/Route";
import { useSelectedBeach } from "../state/useSelectedBeach";
import { usePalette } from "../theme/usePalette";
import { useDenmarkBeachesData } from "../utils/useDenmarkBeachesData";
import { BeachDetailHeader, HEADER_HEIGHT } from "./BeachDetailHeader";
import { BeachDetailInfo } from "./BeachDetailInfo";
import { Button } from "./Button";
import { getSheetDetents } from "../utils/getSheetDetents";

export const SHEET_TOP_PADDING = 256;

export interface BeachDetailProps {
  onChange?: (index: number) => void;
}

export const BeachDetail: FC<BeachDetailProps> = ({ onChange }) => {
  const { foreground } = usePalette();
  const insets = useSafeAreaInsets();
  const sheetDetents = getSheetDetents();

  const { beaches, isLoading } = useDenmarkBeachesData();
  const selectedBeachId = useSelectedBeach((state) => state.selectedBeachId);

  const selectedBeach = beaches.find((beach) => beach.id === selectedBeachId);
  const today = selectedBeach?.data?.[0];

  const sheetRef = useRef<TrueSheet>(null);

  const toggleBeachDetail = () => {
    sheetRef.current?.resize(1).catch(() => {});
  };

  const headerContent = selectedBeach ? (
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
  );

  return (
    <TrueSheet
      ref={sheetRef}
      name="beach-sheet"
      detents={sheetDetents}
      initialDetentIndex={-1}
      grabber={true}
      dimmed={false}
      dismissible={false}
      scrollable
      onDetentChange={(e) => onChange?.(e.nativeEvent.index)}
      header={headerContent}
      headerStyle={styles.headerContainer}
    >
      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom,
        }}
      >
        <View style={styles.contentContainer}>
          <View style={styles.actionsBar}>
            {selectedBeach?.latitude && selectedBeach?.longitude && (
              <Button
                onPress={() => {
                  Linking.openURL(
                    `https://www.google.com/maps/dir/?api=1&destination=${selectedBeach?.latitude},${selectedBeach?.longitude}`,
                  );
                }}
                leadingIcon={
                  <Route stroke={foreground} width={16} height={16} />
                }
                style={styles.actionsBarAction}
              >
                Directions
              </Button>
            )}

            {selectedBeach?.municipality_url && (
              <Button
                onPress={() => {
                  const url =
                    selectedBeach?.municipality_url.match(
                      /href=["'](.*)["']/,
                    )?.[1] || undefined;

                  if (!url) return;

                  Linking.openURL(url);
                }}
                style={styles.actionsBarAction}
              >
                {selectedBeach?.municipality} Website
              </Button>
            )}
          </View>
        </View>

        <BeachDetailInfo beach={selectedBeach} />
      </ScrollView>
    </TrueSheet>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    minHeight: HEADER_HEIGHT,
  },
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
