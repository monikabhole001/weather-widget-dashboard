const cache = require('../cache/weatherCache');
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

function cacheKey(location) {
  return (location || '').trim().toLowerCase();
}

async function getCoordinates(city) {
  const geoRes = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
  );
  const geoData = await geoRes.json();

  if (!geoData.results || geoData.results.length === 0) {
    throw new Error('City not found');
  }
  const { latitude, longitude } = geoData.results[0];
  return { latitude, longitude };
}

function pickHourlyIndex(currentISO, times) {
  if (!currentISO || !Array.isArray(times) || times.length === 0) return -1;

  // 1) exact match (rare because current_weather is 15-min resolution)
  let idx = times.indexOf(currentISO);
  if (idx !== -1) return idx;

  // 2) same hour (HH:00)
  const hourISO = currentISO.slice(0, 13) + ':00';
  idx = times.indexOf(hourISO);
  if (idx !== -1) return idx;

  // 3) nearest timestamp
  const tcur = new Date(currentISO).getTime();
  let best = -1;
  let bestDiff = Infinity;
  for (let i = 0; i < times.length; i++) {
    const d = Math.abs(new Date(times[i]).getTime() - tcur);
    if (d < bestDiff) {
      bestDiff = d;
      best = i;
    }
  }
  return best;
}

async function getWeather(location) {
  const key = cacheKey(location);

  // 1) cache
  const cached = cache.get(key);
  if (cached) return cached;

  // 2) geocode
  const { latitude, longitude } = await getCoordinates(location);

  // 3) fetch forecast with local timezone and needed vars
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${latitude}&longitude=${longitude}` +
    `&current_weather=true` +
    `&hourly=relative_humidity_2m,cloudcover,precipitation,precipitation_probability` +
    `&daily=sunrise,sunset` +
    `&timezone=auto`;

  const response = await fetch(url);
  const data = await response.json();

  if (!data || !data.current_weather) {
    throw new Error('Weather data not available');
  }

  // 4) align hourly values to the current observation time
  const currentTimeISO = data.current_weather.time; // e.g., "2025-08-01T18:30"
  const hourlyTimes = data.hourly?.time || [];
  const idx = pickHourlyIndex(currentTimeISO, hourlyTimes);

  const humidity = idx >= 0 ? data.hourly?.relative_humidity_2m?.[idx] : undefined;
  const cloudcover = idx >= 0 ? data.hourly?.cloudcover?.[idx] : undefined;
  const precipitation = idx >= 0 ? data.hourly?.precipitation?.[idx] : undefined;
  const precipitation_probability =
    idx >= 0 ? data.hourly?.precipitation_probability?.[idx] : undefined;

  // 5) sunrise/sunset for today (index 0)
  const sunrise = data.daily?.sunrise?.[0];
  const sunset = data.daily?.sunset?.[0];

  // 6) flattened payload for the frontend (includes the missing fields)
  const flat = {
    time: currentTimeISO, // local observation time
    temperature: data.current_weather.temperature,
    windspeed: data.current_weather.windspeed,
    winddirection: data.current_weather.winddirection,
    weathercode: data.current_weather.weathercode,
    is_day: data.current_weather.is_day,

    humidity,                          // %
    cloudcover,                        // %
    precipitation,                     // mm
    precipitation_probability,         // %

    sunrise,                           // local ISO
    sunset,                            // local ISO
    timezone: data.timezone,           // e.g., "Asia/Tokyo"
  };

  // 7) cache for 5 minutes
  cache.set(key, flat, 5 * 60 * 1000);
  return flat;
}

module.exports = { getWeather };
