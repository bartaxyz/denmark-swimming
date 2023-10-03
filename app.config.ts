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

export default {
  expo: {
    name: "Swimming Water Quality Denmark",
    slug: "denmark-swimming",
    scheme: "denmark-swimming",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle,
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.ondrejbarta.denmarkswimming",
      config: {
        googleMapsApiKey: "AIzaSyBPRgL0OzSfECEnv0la6U5wQVs8V8qk8ao",
      },
      splash,
      userInterfaceStyle,
    },
    android: {
      package: "com.ondrejbarta.denmarkswimming",
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
