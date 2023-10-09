import { rgba } from "polished";
import { FC } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TransportationMode, usePreferences } from "../state/usePreferences";
import { usePalette } from "../theme/usePalette";
import { useSelectedRoute } from "../utils/useSelectedRoute";

const labelMap: Record<TransportationMode, string> = {
  driving: "by car",
  walking: "on foot",
  bicycling: "by bike",
  transit: "by public transport",
};

export const DistanceIndicator: FC = () => {
  const { foreground, background, isDark } = usePalette();
  const { distance, duration } = useSelectedRoute();
  const transportationMode = usePreferences(
    (state) => state.transportationMode
  );

  if (!distance || !duration) {
    return null;
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    headerInfo: {
      backgroundColor: background,
      height: 32,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 24,
      marginTop: 24,
      paddingLeft: 16,
      paddingRight: 16,
      borderColor: rgba(foreground, isDark ? 0.15 : 0.1),
      borderWidth: 1,
    },
    headerInfoText: {
      display: "flex",
      color: foreground,
      fontSize: 14,
      fontWeight: "500",
    },
  });

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <View style={styles.headerInfo}>
          <Text style={styles.headerInfoText}>
            {distance.text} • {duration.text} {labelMap[transportationMode]}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};
