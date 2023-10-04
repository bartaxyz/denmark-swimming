import { darken, lighten, rgba } from "polished";
import { FC, PropsWithChildren } from "react";
import {
  Platform,
  Pressable,
  PressableProps,
  StyleSheet,
  SwitchProps,
  Text,
  View,
} from "react-native";
import { ScrollView, Switch } from "react-native-gesture-handler";
import { PROVIDER_DEFAULT, PROVIDER_GOOGLE } from "react-native-maps";
import { usePreferences } from "../../src/state/usePreferences";
import { usePalette } from "../../src/theme/usePalette";

export default () => {
  const mapsProvider = usePreferences((state) => state.mapsProvider);
  const isGoogleMaps = mapsProvider === PROVIDER_GOOGLE;

  return (
    <>
      <Divider />

      <ScrollView>
        {Platform.OS === "ios" && (
          <>
            <MapsProviderRow />
            <Divider />
          </>
        )}

        <>
          <View
            style={{
              opacity: isGoogleMaps ? 1 : 0.5,
              pointerEvents: isGoogleMaps ? "auto" : "none",
            }}
          >
            <DisableCustomMapStylesRow />
          </View>
          <Divider />
        </>

        <>
          <PerformanceModeRow />
          <Divider />
        </>
      </ScrollView>
    </>
  );
};

const MapsProviderRow: FC<PropsWithChildren> = ({ children }) => {
  const mapsProvider = usePreferences((state) => state.mapsProvider);
  const setMapsProvider = usePreferences((state) => state.setMapsProvider);

  const toggleMapsProvider = () => {
    setMapsProvider(
      mapsProvider === "google" ? PROVIDER_DEFAULT : PROVIDER_GOOGLE
    );
  };

  return (
    <Row
      title="Use Apple MapKit"
      subtitle="Enabling Apple MapKit may improve performance. When disabled, Google Maps will be used."
      onPress={toggleMapsProvider}
    >
      <StyledSwitch
        value={mapsProvider === PROVIDER_DEFAULT}
        onValueChange={toggleMapsProvider}
      />
      {children}
    </Row>
  );
};

const DisableCustomMapStylesRow: FC<PropsWithChildren> = ({ children }) => {
  const disableCustomMapStyles = usePreferences(
    (state) => state.disableCustomMapStyles
  );
  const setDisableCustomMapStyles = usePreferences(
    (state) => state.setDisableCustomMapStyles
  );

  const toggleDisableCustomMapStyles = () => {
    setDisableCustomMapStyles(!disableCustomMapStyles);
  };

  return (
    <Row
      title="Disable Custom Map Styles"
      subtitle="Enabling this option will disable custom monotone map styles."
      onPress={toggleDisableCustomMapStyles}
    >
      <StyledSwitch
        value={disableCustomMapStyles}
        onValueChange={toggleDisableCustomMapStyles}
      />
      {children}
    </Row>
  );
};

const PerformanceModeRow: FC<PropsWithChildren> = ({ children }) => {
  const performanceMode = usePreferences((state) => state.performanceMode);
  const setPerformanceMode = usePreferences(
    (state) => state.setPerformanceMode
  );

  const togglePerformanceMode = () => {
    setPerformanceMode(!performanceMode);
  };

  return (
    <Row
      title="Performance Mode"
      subtitle="Enabling performance mode will disable custom map markers to improve performance."
      onPress={togglePerformanceMode}
    >
      <StyledSwitch
        value={performanceMode}
        onValueChange={togglePerformanceMode}
      />
      {children}
    </Row>
  );
};

const StyledSwitch: FC<SwitchProps> = ({ children, ...props }) => {
  const { foreground, markers } = usePalette();

  return (
    <Switch
      {...props}
      thumbColor={Platform.select({
        android: markers.good,
      })}
      trackColor={Platform.select({
        android: {
          true: rgba(markers.good, 0.25),
          false: rgba(foreground, 0.1),
        },
      })}
    />
  );
};

interface RowProps extends PressableProps {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
}
const Row: FC<RowProps> = ({ children, title, subtitle, onPress }) => {
  const { foreground } = usePalette();
  const styles = StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
      padding: 16,
      paddingHorizontal: 24,
    },
    rowInfo: {
      flexDirection: "column",
      gap: 8,
      flex: 1,
    },
    rowTitle: {
      flexGrow: 1,
      fontSize: 16,
      fontWeight: "500",
      color: foreground,
    },
    rowSubtitle: {
      fontSize: 12,
      opacity: 0.5,
      color: foreground,
      flex: 1,
      maxWidth: 240,
      lineHeight: 16,
    },
    controls: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: 16,
    },
  });

  return (
    <Pressable
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.5 : 1,
        },
        styles.row,
      ]}
      onPress={onPress}
    >
      <View style={styles.rowInfo}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSubtitle}>{subtitle}</Text>
      </View>

      <View style={styles.controls}>{children}</View>
    </Pressable>
  );
};

const Divider = () => {
  const { foreground, isDark } = usePalette();
  const styles = StyleSheet.create({
    divider: {
      height: 1,
      backgroundColor: rgba(foreground, isDark ? 0.15 : 0.1),
    },
  });

  return <View style={styles.divider} />;
};
