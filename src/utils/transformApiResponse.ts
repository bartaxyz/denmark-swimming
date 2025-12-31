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

/**
 * Map numeric water quality values from the API to WaterQuality enum.
 * API values: 1 = Bad, 2 = Good, 3 = Unknown, 4 = Closed
 */
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

/**
 * Format a number to string with one decimal place and comma separator.
 */
function formatNumber(value: number | undefined | null): string {
  if (value === undefined || value === null) return "";
  return value.toFixed(1).replace(".", ",");
}

/**
 * Convert wind direction in degrees to cardinal direction string.
 * 0° = N, 45° = NE, 90° = E, etc.
 */
function degreesToCardinal(degrees: number): string {
  const cardinals = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round((degrees % 360) / 45) % 8;
  return cardinals[index];
}

/**
 * Get wind direction display value.
 * If windDirectionDisplay > 360, it's an invalid/placeholder value from the API,
 * so we convert the actual wind direction to a cardinal direction instead.
 */
function getWindDirectionDisplay(windDirection: number, windDirectionDisplay: number): string {
  if (windDirectionDisplay > 360) {
    return degreesToCardinal(windDirection);
  }
  return Math.round(windDirectionDisplay).toString();
}

/**
 * Transform a single day's data from API format to app format.
 *
 * Note: weather_type and precipitation are not provided by the new API.
 * We default to PartlyCloudy and empty string respectively.
 * These fields may need to be fetched from a weather API in the future.
 */
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
    wind_direction_display: getWindDirectionDisplay(apiDatum.windDirection, apiDatum.windDirectionDisplay),
    weather_type: WeatherType.PartlyCloudy,
    precipitation: "",
  };
}

/**
 * Sanitize a URL to prevent XSS attacks.
 * Only allows http and https protocols.
 */
function sanitizeUrl(url: string | null | undefined): string {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.href;
    }
    return "";
  } catch {
    return "";
  }
}

/**
 * Transform a single beach from API format to app format.
 */
function transformBeach(apiBeach: ApiBeach): Beach {
  const sanitizedMunicipalityUrl = sanitizeUrl(apiBeach.municipalityUrl);

  return {
    id: apiBeach.id,
    municipality: apiBeach.municipalityName,
    // Store the sanitized URL with HTML wrapper for backwards compatibility
    municipality_url: sanitizedMunicipalityUrl
      ? `<a target='_blank' href='${sanitizedMunicipalityUrl}'>Hjemmeside</a>`
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

/**
 * Transform the full API response from badevand.dk format to app format.
 * Converts camelCase fields to snake_case and maps numeric enums to string enums.
 */
export function transformApiResponse(apiBeaches: ApiBeach[]): Beaches {
  return apiBeaches.map(transformBeach);
}
