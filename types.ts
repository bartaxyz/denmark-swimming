export type Beaches = Beach[];

export interface Beach {
  id: number;
  municipality: string;
  municipality_url: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  comments: string;
  facilities: null | string;
  links: string[];
  data: Datum[];
}

export interface Datum {
  date: string;
  water_quality: WaterQuality;
  water_temperature: string;
  current_speed: CurrentSpeed;
  current_direction: string;
  air_temperature: string;
  wind_speed: string;
  wind_direction: string;
  wind_direction_display: string;
  weather_type: WeatherType;
  precipitation: string;
}

export enum WaterQuality {
  Bad = "1",
  Good = "2",
  Unknown = "3",
  Closed = "4",
}

export enum CurrentSpeed {
  The00 = "0,0",
  The01 = "0,1",
  The02 = "0,2",
  The03 = "0,3",
  The04 = "0,4",
  The05 = "0,5",
  The06 = "0,6",
  The07 = "0,7",
  The08 = "0,8",
  The09 = "0,9",
}

export enum WeatherType {
  Sun = "1",
  LightlyCloudy = "2",
  PartlyCloudy = "3",
  Cloudy = "4",
  IndividualRainShowersPeriodsOfSun = "5",
  SomeThunderstormsPeriodsOfSunshine = "6",
  SomeRainOrSleetPeriodsOfSun = "7",
  SomeSnowPeriodsOfSun = "8",
  LightRain = "9",
  Rain = "10",
  ThunderAndRain = "11",
  Sludge = "12",
  Snow = "13",
  ThunderAndSnow = "14",
  Fog = "15",
}
