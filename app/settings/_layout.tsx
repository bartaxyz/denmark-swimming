import { router, Slot } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconButton } from "../../src/components/IconButton";
import { ArrowLeft } from "../../src/icons/ArrowLeft";
import { usePalette } from "../../src/theme/usePalette";

export default () => {
  const { background, foreground } = usePalette();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: background,
      flex: 1,
    },
    appBar: {
      backgroundColor: background,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: "600",
      color: foreground,
    },
    iconPlaceholder: {
      width: 24,
      height: 24,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.appBar}>
        <IconButton variant="transparent" onPress={router.back}>
          <ArrowLeft stroke={foreground} />
        </IconButton>

        <Text style={styles.title}>Settings</Text>

        <View style={styles.iconPlaceholder} />
      </View>

      <Slot />
    </SafeAreaView>
  );
};
