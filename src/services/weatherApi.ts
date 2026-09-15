/**
 * OpenWeatherMap API 封装
 * 统一管理天气数据请求与错误处理，其他模块只从这里调用 API
 * 城市搜索流程：先用 Geocoding API 把城市名转经纬度，再用经纬度查询天气
 */

import type { AirPollution, CurrentWeather, Forecast, GeocodingResult } from '../types/weather';

/** API 主机 */
const API_HOST = 'https://api.openweathermap.org';

/** API Key（从环境变量读取，禁止硬编码） */
const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY as string | undefined;

/** 查询参数：按城市名称或按经纬度查询，二选一 */
export type WeatherQuery =
  | { city: string }
  | { lat: number; lon: number };

/** 天气 API 错误：携带友好的中文提示，方便界面直接展示 */
export class WeatherApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WeatherApiError';
  }
}

/** 把 HTTP 状态码映射为友好的中文提示 */
function toFriendlyMessage(status: number): string {
  switch (status) {
    case 400:
      return '请求参数有误，请检查城市名称';
    case 401:
      return '天气服务暂时不可用（API Key 无效），请稍后再试';
    case 404:
      return '未找到该城市，请检查城市名称';
    case 429:
      return '请求过于频繁，请稍后再试';
    case 500:
    case 502:
    case 503:
    case 504:
      return '天气服务暂时不可用，请稍后再试';
    default:
      return '查询失败，请稍后再试';
  }
}

/** 把查询参数拼接成 query string */
function buildQueryParams(query: WeatherQuery): string {
  if ('city' in query) {
    return `q=${encodeURIComponent(query.city)}`;
  }
  return `lat=${query.lat}&lon=${query.lon}`;
}

interface RequestOptions {
  /** 附加单位与语言参数（天气接口需要，地理编码接口不需要），默认 true */
  withUnits?: boolean;
  /** 附加查询参数，如 { limit: '5' } */
  params?: Record<string, string>;
}

/**
 * 统一的请求函数：拼接 URL、发起请求并集中处理错误
 * @param path 接口路径（如 /data/2.5/weather、/geo/1.0/direct）
 * @param query 查询参数（城市名称或经纬度）
 * @param options 附加选项
 */
async function request<T>(path: string, query: WeatherQuery, options: RequestOptions = {}): Promise<T> {
  // 未配置 API Key 时尽早报错，提示开发者而非静默失败
  if (!API_KEY) {
    throw new WeatherApiError('未配置 API Key，请在 .env.local 中设置 VITE_OPENWEATHER_API_KEY');
  }

  const { withUnits = true, params = {} } = options;
  const parts = [buildQueryParams(query), `appid=${API_KEY}`];
  // lang=zh_cn 让天气描述返回中文
  if (withUnits) {
    parts.push('units=metric', 'lang=zh_cn');
  }
  for (const [key, value] of Object.entries(params)) {
    parts.push(`${key}=${value}`);
  }
  const url = `${API_HOST}${path}?${parts.join('&')}`;

  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    // fetch 网络层错误：断网、DNS 解析失败、超时等
    throw new WeatherApiError('网络连接失败，请检查网络设置');
  }

  // HTTP 状态码错误：城市不存在、Key 无效、限流等
  if (!response.ok) {
    throw new WeatherApiError(toFriendlyMessage(response.status));
  }

  try {
    return (await response.json()) as T;
  } catch {
    // 返回内容不是合法 JSON
    throw new WeatherApiError('数据解析失败，请稍后再试');
  }
}

/**
 * 地理编码：城市名 → 经纬度（含本地化名称表）
 * 搜索城市的第一步
 */
export function searchCity(city: string, limit = 5): Promise<GeocodingResult[]> {
  return request<GeocodingResult[]>('/geo/1.0/direct', { city }, {
    withUnits: false,
    params: { limit: String(limit) },
  });
}

/**
 * 反向地理编码：经纬度 → 城市（含本地化名称表）
 * 自动定位后获取中文城市名
 */
export function reverseGeocode(lat: number, lon: number, limit = 1): Promise<GeocodingResult[]> {
  return request<GeocodingResult[]>('/geo/1.0/reverse', { lat, lon }, {
    withUnits: false,
    params: { limit: String(limit) },
  });
}

/**
 * 获取当前天气（按经纬度，lang=zh_cn 返回中文描述）
 */
export function getCurrentWeather(query: WeatherQuery): Promise<CurrentWeather> {
  return request<CurrentWeather>('/data/2.5/weather', query);
}

/**
 * 获取未来 5 天天气预报（3 小时间隔，lang=zh_cn 返回中文描述）
 */
export function getForecast(query: WeatherQuery): Promise<Forecast> {
  return request<Forecast>('/data/2.5/forecast', query);
}

/**
 * 获取当前空气质量（免费接口，仅支持经纬度）
 * 用于首页的 AQI 展示
 */
export function getAirPollution(lat: number, lon: number): Promise<AirPollution> {
  return request<AirPollution>('/data/2.5/air_pollution', { lat, lon }, { withUnits: false });
}
