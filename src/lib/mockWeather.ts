// Deterministic mock environmental data generator.
// Same seed always produces the same "weather," so the chat's
// recommendation text and the dashboard's charts never disagree.

export interface HourlyPoint {
  time: string;
  precipitationMm: number;
  precipitationChancePct: number;
  tempF: number;
}

export type UvCategory = "Low" | "Moderate" | "High" | "Very High" | "Extreme";
export type AqiCategory = "Good" | "Moderate" | "Unhealthy for Sensitive Groups" | "Unhealthy" | "Very Unhealthy";

export interface EnvironmentalData {
  seed: string;
  hourly: HourlyPoint[];
  tempHighF: number;
  tempLowF: number;
  uv: { current: number; peak: number; category: UvCategory };
  airQuality: { aqi: number; category: AqiCategory; dominantPollutant: string };
  sun: { sunrise: string; sunset: string; daylightHours: number };
}

// xmur3 string hash -> 32-bit seed
function xmur3(str: string) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
}

// mulberry32 PRNG -> deterministic [0, 1) stream from a 32-bit seed
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function uvCategoryFor(uv: number): UvCategory {
  if (uv <= 2) return "Low";
  if (uv <= 5) return "Moderate";
  if (uv <= 7) return "High";
  if (uv <= 10) return "Very High";
  return "Extreme";
}

function aqiCategoryFor(aqi: number): AqiCategory {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive Groups";
  if (aqi <= 200) return "Unhealthy";
  return "Very Unhealthy";
}

const HOUR_LABELS = ["6 AM", "8 AM", "10 AM", "12 PM", "2 PM", "4 PM", "6 PM", "8 PM"];

export function generateMockEnvironmentalData(seed: string): EnvironmentalData {
  const rand = mulberry32(xmur3(seed)());

  const baseTemp = 55 + rand() * 35; // 55-90F base
  const baseRainChance = rand() * 60; // 0-60% base chance
  const rainy = rand() < 0.4;

  const hourly: HourlyPoint[] = HOUR_LABELS.map((time, i) => {
    const curve = Math.sin((i / (HOUR_LABELS.length - 1)) * Math.PI); // peaks midday
    const tempF = Math.round(baseTemp + curve * 12 - 4 + (rand() - 0.5) * 3);
    const precipitationChancePct = Math.max(
      0,
      Math.min(100, Math.round(baseRainChance + (rainy ? rand() * 40 : -baseRainChance * 0.5) + (rand() - 0.5) * 10))
    );
    const precipitationMm = Math.round((precipitationChancePct / 100) * (rainy ? rand() * 6 : rand() * 1.5) * 10) / 10;
    return { time, precipitationMm, precipitationChancePct, tempF };
  });

  const tempHighF = Math.max(...hourly.map((h) => h.tempF));
  const tempLowF = Math.min(...hourly.map((h) => h.tempF));

  const uvPeak = Math.round(Math.min(11, Math.max(1, (tempHighF - 40) / 6 + rand() * 2)));
  const uvCurrent = Math.max(0, Math.round(uvPeak * (0.5 + rand() * 0.5)));

  const aqi = Math.round(20 + rand() * 110);
  const pollutants = ["Ozone", "PM2.5", "PM10", "NO2"];

  const sunriseHour = 5 + Math.round(rand() * 2);
  const sunsetHour = 18 + Math.round(rand() * 3);

  return {
    seed,
    hourly,
    tempHighF,
    tempLowF,
    uv: { current: uvCurrent, peak: uvPeak, category: uvCategoryFor(uvPeak) },
    airQuality: {
      aqi,
      category: aqiCategoryFor(aqi),
      dominantPollutant: pollutants[Math.floor(rand() * pollutants.length)],
    },
    sun: {
      sunrise: `${sunriseHour > 12 ? sunriseHour - 12 : sunriseHour}:${rand() < 0.5 ? "12" : "47"} AM`,
      sunset: `${sunsetHour > 12 ? sunsetHour - 12 : sunsetHour}:${rand() < 0.5 ? "18" : "05"} PM`,
      daylightHours: Math.round((sunsetHour - sunriseHour) * 10) / 10,
    },
  };
}
