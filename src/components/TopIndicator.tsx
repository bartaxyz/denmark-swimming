import { rgba } from "polished";
import { FC, PropsWithChildren } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePalette } from "../theme/usePalette";

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

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    innerContainer: {
      backgroundColor: background,
      justifyContent: "center",
      alignItems: "center",
      borderRadius: subtitle ? 40 : 24,
      marginTop: 24,
      borderColor: rgba(foreground, isDark ? 0.15 : 0.1),
      borderWidth: 1,
    },
    loadingContainer: {
      height: 32,
      width: 32,
    },
    headerInfo: {
      minHeight: 32,
      padding: subtitle ? 8 : 4,
      paddingLeft: subtitle ? 24 : 16,
      paddingRight: subtitle ? 24 : 16,
      gap: 2,
    },
    title: {
      display: "flex",
      color: foreground,
      fontSize: 14,
      fontWeight: "500",
    },
    subtitle: {
      color: rgba(foreground, 0.5),
      fontSize: 12,
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
          <Pressable
            style={({ pressed }) => [
              styles.innerContainer,
              styles.headerInfo,
              {
                opacity: pressed ? 0.5 : 1,
              },
            ]}
            onPress={onPress}
          >
            {title && <Text style={styles.title}>{title}</Text>}
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

            {children}
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
};
