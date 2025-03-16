import { WeatherType } from "../../types";

const weatherIconMap: Record<WeatherType, string> = {
  [WeatherType.Sun]: "☀️",
  [WeatherType.LightlyCloudy]: "🌤",
  [WeatherType.PartlyCloudy]: "⛅️",
  [WeatherType.Cloudy]: "☁️",
  [WeatherType.IndividualRainShowersPeriodsOfSun]: "🌦",
  [WeatherType.SomeThunderstormsPeriodsOfSunshine]: "⛈",
  [WeatherType.SomeRainOrSleetPeriodsOfSun]: "🌧",
  [WeatherType.SomeSnowPeriodsOfSun]: "🌨",
  [WeatherType.LightRain]: "🌦",
  [WeatherType.Rain]: "🌧",
  [WeatherType.ThunderAndRain]: "⛈",
  [WeatherType.Sludge]: "🌧",
  [WeatherType.Snow]: "🌨",
  [WeatherType.ThunderAndSnow]: "⛈",
  [WeatherType.Fog]: "🌫",
};

export const getWeatherIcon = (weather?: WeatherType) => {
  if (!weather) return weatherIconMap[WeatherType.LightlyCloudy];

  return weatherIconMap[weather];
};
