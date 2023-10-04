import { format, formatRelative } from "date-fns";
import { rgba } from "polished";
import { memo, useEffect, useRef } from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Beach } from "../../types";
import { useSelectedBeach } from "../state/useSelectedBeach";
import { usePalette } from "../theme/usePalette";
import { getWeatherIcon } from "../utils/getWeatherIcon";
import { WaterQualityIndicatorBox } from "./WaterQualityIndicatorBox";

export interface BeachDetailInfoProps {
  beach?: Beach;
}

export const BeachDetailInfo = memo<BeachDetailInfoProps>(
  ({ beach }) => {
    const { foreground, isDark } = usePalette();
    const dimensions = useWindowDimensions();
    const inset = useSafeAreaInsets();

    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
      useSelectedBeach.subscribe(({ selectedBeachId }) => {
        /**
         * If completely de-selected, scroll to the start
         */
        if (!selectedBeachId) {
          flatListRef.current?.scrollToOffset({
            offset: 0,
            animated: false,
          });
        }
      });
    }, []);

    const styles = StyleSheet.create({
      container: {
        paddingBottom: inset.bottom,
        flex: 1,
        marginBottom: 16,
      },
      almostFullWidth: {
        width: dimensions.width - 48,
        borderColor: rgba(foreground, isDark ? 0.15 : 0.1),
        borderWidth: 1,
        borderRadius: 12,
        marginHorizontal: 4,
        backgroundColor: rgba(foreground, isDark ? 0.1 : 0),
        overflow: "hidden",
        padding: 16,
        paddingVertical: 12,
        paddingBottom: 0,
        marginBottom: 24,
      },
      header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      },
      title: {
        fontSize: 12,
        fontWeight: "bold",
        color: foreground,
        textTransform: "uppercase",
        opacity: 0.5,
        marginBottom: 16,
      },
      waterQualityContainer: {
        marginBottom: 16,
      },
      mainRow: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        marginBottom: 16,
        minHeight: 64,
      },
      infoBox: {
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-around",
        gap: 4,
      },
      infoBoxTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: foreground,
      },
      infoBoxValue: {
        fontSize: 14,
        color: foreground,
        fontWeight: "bold",
      },
      infoBoxLabel: {
        fontSize: 11,
        color: foreground,
        opacity: 0.5,
      },
      verticalDivider: {
        height: "100%",
        width: 1,
        backgroundColor: rgba(foreground, isDark ? 0.15 : 0.1),
      },
      row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderColor: rgba(foreground, isDark ? 0.15 : 0.1),
        borderTopWidth: 1,
        paddingVertical: 16,
      },
      infoLabel: {
        fontSize: 14,
        color: foreground,
        opacity: 0.5,
      },
      infoTitle: {
        fontSize: 14,
        color: foreground,
        fontWeight: "bold",
      },
    });

    if (!beach) {
      return null;
    }

    return (
      <View style={styles.container}>
        <FlatList<Beach["data"][number]>
          ref={flatListRef}
          data={beach?.data}
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          keyExtractor={(item) => item.date}
          contentContainerStyle={{
            paddingLeft: 20,
            paddingRight: 20,
          }}
          renderItem={({ item, index }) => {
            const date = new Date(item.date);
            const relativeDateLabel = formatRelative(date, new Date());
            const relativeDateFirstWord = relativeDateLabel.split(" ")[0];

            const formattedDate = format(date, "d. MMM. yyyy");

            return (
              <View style={styles.almostFullWidth}>
                <View style={styles.header}>
                  <Text style={styles.title}>{relativeDateFirstWord}</Text>
                  <Text style={styles.title}>{formattedDate}</Text>
                </View>

                <View style={styles.waterQualityContainer}>
                  <WaterQualityIndicatorBox waterQuality={item.water_quality} />
                </View>

                <View style={styles.mainRow}>
                  <View style={styles.infoBox}>
                    <Text style={styles.infoBoxTitle}>
                      {getWeatherIcon(item.weather_type)}
                    </Text>
                    <Text style={styles.infoBoxLabel}>Air temp.</Text>
                    <Text style={styles.infoBoxValue}>
                      {item.air_temperature} °C
                    </Text>
                  </View>

                  <View style={styles.verticalDivider} />

                  <View style={styles.infoBox}>
                    <Text style={styles.infoBoxTitle}>💧</Text>
                    <Text style={styles.infoBoxLabel}>Water temp.</Text>
                    <Text style={styles.infoBoxValue}>
                      {item.water_temperature} °C
                    </Text>
                  </View>

                  <View style={styles.verticalDivider} />

                  <View style={styles.infoBox}>
                    <Text style={styles.infoBoxTitle}>🌬️</Text>
                    <Text style={styles.infoBoxLabel}>Wind speed</Text>
                    <Text style={styles.infoBoxValue}>
                      {item.wind_speed} m/s
                    </Text>
                  </View>
                </View>

                <View style={styles.row}>
                  <Text style={styles.infoLabel}>Wind direction</Text>
                  <Text style={styles.infoTitle}>{item.wind_direction} °</Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.infoLabel}>Wind direction display</Text>
                  <Text style={styles.infoTitle}>
                    {item.wind_direction_display}
                  </Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.infoLabel}>Current direction</Text>
                  <Text style={styles.infoTitle}>
                    {item.current_direction} °
                  </Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.infoLabel}>Current speed</Text>
                  <Text style={styles.infoTitle}>{item.current_speed} m/s</Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.infoLabel}>Precipitation</Text>
                  <Text style={styles.infoTitle}>{item.precipitation}</Text>
                </View>
              </View>
            );
          }}
        />
      </View>
    );
  },
  (prevProps, nextProps) => {
    return prevProps.beach?.id === nextProps.beach?.id;
  }
);
