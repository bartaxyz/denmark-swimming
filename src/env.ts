import { Platform } from "react-native";
import { z } from "zod";

const googleMapsApiKeyAndroid =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID;
const googleMapsApiKeyIos = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS;

const env = {
  googleMapsApiKeyAndroid,
  googleMapsApiKeyIos,
  googleMapsApiKey: Platform.select({
    android: googleMapsApiKeyAndroid,
    ios: googleMapsApiKeyIos,
  }),
};

const envSchema = z.object({
  googleMapsApiKeyAndroid: z.string(),
  googleMapsApiKeyIos: z.string(),
  googleMapsApiKey: z.string(),
});

envSchema.parse(env);

export default env;
