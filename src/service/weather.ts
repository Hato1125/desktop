import GObject from 'gi://GObject?version=2.0';

import {
  register,
  property,
} from 'ags/gobject';

import fetch from 'gnim/fetch';

const weatherIcons: Map<number, string> = new Map([
  [0, 'clear_day'],
  [1, 'clear_day'],
  [2, 'partly_cloudy_day'],
  [3, 'cloud'],
  [45, 'foggy'],
  [48, 'foggy'],
  [51, 'rainy'],
  [53, 'rainy'],
  [55, 'rainy'],
  [61, 'rainy'],
  [63, 'rainy'],
  [65, 'rainy'],
  [71, 'weather_snowy'],
  [73, 'weather_snowy'],
  [75, 'weather_snowy'],
  [77, 'weather_snowy'],
  [80, 'rainy'],
  [81, 'rainy'],
  [82, 'rainy'],
  [85, 'weather_snowy'],
  [86, 'weather_snowy'],
  [95, 'thunderstorm'],
  [96, 'thunderstorm'],
  [99, 'thunderstorm'],
]);

const INTERVAL = 600_000; // 10 minutes

@register()
export class WeatherService extends GObject.Object {
  static instance: WeatherService;

  static get_default(): WeatherService {
    if (!this.instance) {
      this.instance = new WeatherService();
    }
    return this.instance;
  }

  @property(Number) temperature: number = 0;
  @property(Number) humidity: number = 0;
  @property(Number) windSpeed: number = 0;
  @property(Number) weatherCode: number = 0;
  @property(String) icon: string = 'cloud';
  @property(String) description: string = '';

  private lat: number = 0;
  private lon: number = 0;

  constructor() {
    super();
    this.locateAndFetch();
    setInterval(() => this.fetchWeather(), INTERVAL);
  }

  private async locateAndFetch() {
    try {
      const res = await fetch('http://ip-api.com/json/?fields=lat,lon');
      const data = await res.json();
      this.lat = data.lat;
      this.lon = data.lon;
      await this.fetchWeather();
    } catch (e) {
      console.error('weather: failed to get location', e);
    }
  }

  private async fetchWeather() {
    if (this.lat === 0 && this.lon === 0) return;

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${this.lat}&longitude=${this.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`;
      const res = await fetch(url);
      const data = await res.json();
      const current = data.current;

      this.temperature = current.temperature_2m;
      this.humidity = current.relative_humidity_2m;
      this.windSpeed = current.wind_speed_10m;
      this.weatherCode = current.weather_code;
      this.icon = weatherIcons.get(current.weather_code) ?? 'cloud';
    } catch (e) {
      console.error('weather: failed to fetch', e);
    }
  }
}
