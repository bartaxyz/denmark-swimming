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
};

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

export default {
  expo: {
    name: "Swimming Water Quality Denmark",
    slug: "denmark-swimming",
    scheme: "denmark-swimming",
    version,
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle,
    assetBundlePatterns: ["**/*"],
    ios: {
      bundleIdentifier: "com.ondrejbarta.denmarkswimming",
      buildNumber: version,
      supportsTablet: true,
      config: {
        googleMapsApiKey: "AIzaSyBPRgL0OzSfECEnv0la6U5wQVs8V8qk8ao",
      },
      splash,
      userInterfaceStyle,
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
          apiKey: "AIzaSyCjETzb2N3cq014e71xEqvTGX3pNQlLq4E",
        },
      },
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    extra: {
      eas: {
        projectId: "a4e906d9-0345-4542-bf99-d44e10d445cf",
      },
    },
    plugins: [
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission:
            "Allow $(PRODUCT_NAME) to use your location.",
        },
      ],
    ],
  },
};
