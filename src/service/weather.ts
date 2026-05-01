import GObject from 'gi://GObject?version=2.0';

import {
  register,
  property,
} from 'ags/gobject';
import fetch from 'gnim/fetch';
import { retry } from 'ts-retry-promise';

import { support, makeService } from 'src/feature/feature';

const weatherIcon = (code: number): string => {
  switch (code) {
    case 0: case 1: return 'clear_day';
    case 2: return 'partly_cloudy_day';
    case 45: case 48: return 'foggy';
    case 51: case 53: case 55:
    case 61: case 63: case 65:
    case 80: case 81: case 82: return 'rainy';
    case 71: case 73: case 75: case 77:
    case 85: case 86: return 'weather_snowy';
    case 95: case 96: case 99: return 'thunderstorm';
    default: return 'cloud';
  }
};

const INTERVAL = 600_000;
const LOCATE_RETRY_MIN = 1_000;
const LOCATE_RETRY_MAX = 60_000;

@support()
@register()
class WeatherService extends GObject.Object {
  @property(Number) temperature: number = 0;
  @property(Number) humidity: number = 0;
  @property(Number) windSpeed: number = 0;
  @property(Number) weatherCode: number = 0;
  @property(String) icon: string = 'cloud';

  private lat: number | null = null;
  private lon: number | null = null;

  constructor() {
    super();
    this.locateAndFetch();
    setInterval(() => this.fetchWeather(), INTERVAL);
  }

  private async locateAndFetch() {
    await retry(
      async () => {
        const res = await fetch('http://ip-api.com/json/?fields=lat,lon');
        const data = await res.json();
        this.lat = data.lat;
        this.lon = data.lon;
      },
      {
        retries: 'INFINITELY',
        timeout: 'INFINITELY',
        delay: LOCATE_RETRY_MIN,
        backoff: 'EXPONENTIAL',
        maxBackOff: LOCATE_RETRY_MAX,
        logger: (msg) => console.error(`Weather: ${msg}`),
      },
    );
    await this.fetchWeather();
  }

  private async fetchWeather() {
    if (this.lat === null || this.lon === null) return;

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${this.lat}&longitude=${this.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`;
      const res = await fetch(url);
      const data = await res.json();
      const current = data.current;

      this.temperature = current.temperature_2m;
      this.humidity = current.relative_humidity_2m;
      this.windSpeed = current.wind_speed_10m;
      this.weatherCode = current.weather_code;
      this.icon = weatherIcon(current.weather_code);
    } catch (e) {
      console.error('Weather: failed to fetch', e);
    }
  }
}

export default makeService(WeatherService);
