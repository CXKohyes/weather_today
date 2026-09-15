import { useCallback, useRef, useState } from 'react';
import {
  getCurrentWeather,
  getForecast,
  reverseGeocode,
  searchCity,
  WeatherApiError,
} from '../services/weatherApi';
import type { WeatherQuery } from '../services/weatherApi';
import type { CurrentWeather, Forecast, GeocodingResult } from '../types/weather';

interface UseWeatherResult {
  /** 当前天气数据，尚未查询成功时为 null */
  current: CurrentWeather | null;
  /** 未来 5 天预报数据，尚未查询成功时为 null */
  forecast: Forecast | null;
  /** 展示用的本地化城市名（中文优先，来自 Geocoding 的 local_names.zh） */
  cityName: string | null;
  /** 是否正在请求中 */
  loading: boolean;
  /** 友好的中文错误提示，无错误时为 null */
  error: string | null;
  /** 按城市名称查询：先地理编码转经纬度，再查询天气 */
  searchByCity: (city: string) => Promise<void>;
  /** 按经纬度查询（自动定位）：反向地理编码取中文城市名 */
  searchByCoords: (lat: number, lon: number) => Promise<void>;
}

/** 从 Geocoding 结果取中文城市名，没有中文时回退为英文名 */
function pickLocalizedName(result: GeocodingResult): string {
  return result.local_names?.zh ?? result.name;
}

/**
 * 天气查询 Hook
 * 封装请求状态（loading / error / data），组件只负责展示
 */
export function useWeather(): UseWeatherResult {
  const [current, setCurrent] = useState<CurrentWeather | null>(null);
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [cityName, setCityName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // 请求序号：连续搜索时只采纳最后一次请求的结果，避免旧请求覆盖新结果
  const requestIdRef = useRef(0);

  /**
   * 统一的查询入口
   * @param work 第一步：解析出查询目标（搜索时地理编码、定位时反向地理编码）
   */
  const run = useCallback(
    async (work: () => Promise<{ query: WeatherQuery; name?: string }>) => {
      const requestId = ++requestIdRef.current;
      setLoading(true);
      setError(null);

      try {
        // 第一步：解析查询目标（含本地化城市名）
        const { query, name } = await work();

        // 第二步：用经纬度并行查询当前天气与预报（请求自带 lang=zh_cn）
        const [currentData, forecastData] = await Promise.all([
          getCurrentWeather(query),
          getForecast(query),
        ]);

        // 仅当本次请求仍是最新请求时才更新界面
        if (requestId !== requestIdRef.current) return;
        setCurrent(currentData);
        setForecast(forecastData);
        // 展示名：Geocoding 得到的中文名优先，否则回退为接口返回的城市名
        setCityName(name ?? currentData.name);
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        // WeatherApiError 已携带友好中文提示
        setError(err instanceof Error ? err.message : '查询失败，请稍后再试');
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [],
  );

  /** 按城市名查询：先用 Geocoding API 把城市名转为经纬度，再用经纬度查天气 */
  const searchByCity = useCallback(
    (city: string) =>
      run(async () => {
        const places = await searchCity(city);
        if (places.length === 0) {
          throw new WeatherApiError('未找到该城市，请检查城市名称');
        }
        const place = places[0];
        return {
          query: { lat: place.lat, lon: place.lon },
          name: pickLocalizedName(place),
        };
      }),
    [run],
  );

  /** 按经纬度查询（自动定位）：反向地理编码取中文城市名，失败不阻塞主流程 */
  const searchByCoords = useCallback(
    (lat: number, lon: number) =>
      run(async () => {
        let name: string | undefined;
        try {
          const places = await reverseGeocode(lat, lon);
          name = places.length > 0 ? pickLocalizedName(places[0]) : undefined;
        } catch {
          // 反向地理编码失败时回退为接口返回的城市名
          name = undefined;
        }
        return { query: { lat, lon }, name };
      }),
    [run],
  );

  return { current, forecast, cityName, loading, error, searchByCity, searchByCoords };
}
