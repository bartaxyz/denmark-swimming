import { Beach, Beaches, Datum, WaterQuality, WeatherType, CurrentSpeed } from "../../types";

// New API response types
interface ApiBeach {
  id: number;
  countryCode?: string;
  municipalityName: string;
  municipalityUrl: string;
  beachName: string;
  description: string;
  latitude: number;
  longitude: number;
  comments: string;
  facilities: string | null;
  links: string;
  data: ApiDatum[];
}

interface ApiDatum {
  date: string;
  waterQualityOriginalValue?: number;
  waterQuality: number;
  waterTemperature: number;
  currentSpeed: number;
  currentDirection: number;
  airTemperature: number;
  windSpeed: number;
  windDirection: number;
  windDirectionDisplay: number;
}

// Map numeric water quality to string enum
function mapWaterQuality(value: number): WaterQuality {
  switch (value) {
    case 1:
      return WaterQuality.Bad;
    case 2:
      return WaterQuality.Good;
    case 4:
      return WaterQuality.Closed;
    case 3:
    default:
      return WaterQuality.Unknown;
  }
}

// Format number to string with comma decimal separator
function formatNumber(value: number | undefined | null): string {
  if (value === undefined || value === null) return "";
  return value.toFixed(1).replace(".", ",");
}

// Transform a single datum
function transformDatum(apiDatum: ApiDatum): Datum {
  return {
    date: apiDatum.date,
    water_quality: mapWaterQuality(apiDatum.waterQuality),
    water_temperature: Math.round(apiDatum.waterTemperature).toString(),
    current_speed: formatNumber(apiDatum.currentSpeed) as CurrentSpeed,
    current_direction: Math.round(apiDatum.currentDirection).toString(),
    air_temperature: Math.round(apiDatum.airTemperature).toString(),
    wind_speed: Math.round(apiDatum.windSpeed).toString(),
    wind_direction: Math.round(apiDatum.windDirection).toString(),
    wind_direction_display: apiDatum.windDirectionDisplay > 360
      ? ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][Math.round((apiDatum.windDirection % 360) / 45) % 8]
      : Math.round(apiDatum.windDirectionDisplay).toString(),
    weather_type: WeatherType.PartlyCloudy, // Default - not provided by new API
    precipitation: "", // Not provided by new API
  };
}

// Transform a single beach
function transformBeach(apiBeach: ApiBeach): Beach {
  return {
    id: apiBeach.id,
    municipality: apiBeach.municipalityName,
    municipality_url: apiBeach.municipalityUrl
      ? `<a target='_blank' href='${apiBeach.municipalityUrl}'>Hjemmeside</a>`
      : "",
    name: apiBeach.beachName,
    description: apiBeach.description,
    latitude: apiBeach.latitude,
    longitude: apiBeach.longitude,
    comments: apiBeach.comments,
    facilities: apiBeach.facilities,
    links: apiBeach.links ? [apiBeach.links] : [],
    data: apiBeach.data.map(transformDatum),
  };
}

// Transform the full API response
export function transformApiResponse(apiBeaches: ApiBeach[]): Beaches {
  return apiBeaches.map(transformBeach);
}
