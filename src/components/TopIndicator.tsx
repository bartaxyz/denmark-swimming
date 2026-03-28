import { rgba } from "polished";
import { FC, PropsWithChildren } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePalette } from "../theme/usePalette";
import { GlassView } from "expo-glass-effect";

export interface TopIndicatorProps extends PropsWithChildren {
  title?: string;
  subtitle?: string;
  onPress?: () => void;
  isLoading?: boolean;
}

export const TopIndicator: FC<TopIndicatorProps> = ({
  title,
  subtitle,
  onPress,
  children,
  isLoading,
}) => {
  const { foreground, background, isDark } = usePalette();

  const borderRadius = subtitle ? 40 : 24;

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    innerContainer: {
      backgroundColor: background,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      borderRadius,
      marginTop: 16,
      overflow: "hidden",
      ...Platform.select({
        android: {
          elevation: 8,
        },
        default: {
          borderColor: rgba(foreground, isDark ? 0.15 : 0.1),
          borderWidth: 1,
        },
      }),
    },
    loadingContainer: {
      height: 32,
      width: 32,
    },
    headerInfo: {
      minHeight: 32,
      padding: 4,
      paddingLeft: 16,
      paddingRight: 16,
      justifyContent: "center",
      alignItems: "center",
    },
    title: {
      color: foreground,
      fontSize: 14,
      fontWeight: "500",
      textAlign: "center",
    },
    subtitle: {
      color: rgba(foreground, 0.5),
      fontSize: 12,
      textAlign: "center",
    },
  });

  return (
    <SafeAreaView>
      <View style={styles.container}>
        {isLoading ? (
          <View style={[styles.innerContainer, styles.loadingContainer]}>
            <ActivityIndicator />
          </View>
        ) : (
          <View style={styles.innerContainer}>
            <Pressable
              android_ripple={{
                color: rgba(foreground, 0.2),
                foreground: true,
              }}
              onPress={onPress}
            >
              <GlassView style={styles.headerInfo}>
                {title && <Text style={styles.title}>{title}</Text>}
                {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                {children}
              </GlassView>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};
