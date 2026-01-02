import { ExpoConfig } from "expo/config";
import { version as packageVersion } from "./package.json";

const userInterfaceStyle = "automatic";
const splash = {
  image: "./assets/splash.png",
  resizeMode: "contain",
  backgroundColor: "#ffffff",
  dark: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#000000",
  },
} as const;

/**
 * Android version code will be generated from current timestamp
 * to ensure that each build has unique version code.
 */
const versionCode = Math.floor(Date.now() / 1000 / 60 / 1);

/**
 * Version will be generated from package.json version and
 * current timestamp to ensure that each build has unique version.
 */
const version = `${
  /**
   * Removes last version number, e.g. 1.2.3 -> 1.2
   */
  packageVersion.split(".").slice(0, -1).join(".")
}.${versionCode}`;

const expo: ExpoConfig = {
  name: "Swimming Water Quality Denmark",
  slug: "denmark-swimming",
  scheme: "denmark-swimming",
  version,
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle,
  assetBundlePatterns: ["**/*"],
  splash,
  ios: {
    icon: "./assets/icon.icon",
    bundleIdentifier: "com.ondrejbarta.denmarkswimming",
    buildNumber: version,
    supportsTablet: true,
    config: {
      googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS,
    },
    splash,
    userInterfaceStyle,
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        "Your location makes it easier to find the water quality & tempearture of beaches near you.",
      NSLocationAlwaysAndWhenInUseUsageDescription:
        "Your location makes it easier to find the water quality & tempearture of beaches near you.",
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: "com.ondrejbarta.denmarkswimming",
    versionCode,
    adaptiveIcon: {
      foregroundImage: "./assets/icon.png",
      backgroundColor: "#ffffff",
    },
    splash,
    userInterfaceStyle,
    config: {
      googleMaps: {
        apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID,
      },
    },
  },
  web: { favicon: "./assets/favicon.png" },
  extra: { eas: { projectId: "a4e906d9-0345-4542-bf99-d44e10d445cf" } },
  plugins: [
    [
      "expo-location",
      {
        locationAlwaysAndWhenInUsePermission:
          "Your location makes it easier to find the water quality & tempearture of beaches near you.",
      },
    ],
  ],
};

export default { expo };
