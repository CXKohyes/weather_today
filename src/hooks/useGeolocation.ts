import { useCallback, useRef, useState } from 'react';
import { loadFromStorage, saveToStorage } from '../utils/storage';

export interface GeoCoords {
  lat: number;
  lon: number;
}

/** 定位状态 */
export type GeolocationStatus = 'idle' | 'locating' | 'success' | 'error';

interface UseGeolocationResult {
  /** 定位到的经纬度，未成功时为 null */
  coords: GeoCoords | null;
  /** 定位状态 */
  status: GeolocationStatus;
  /** 定位失败的友好提示 */
  error: string | null;
  /** 发起定位（仅由用户点击 📍 按钮触发） */
  locate: () => void;
}

/** 上次定位结果的存储键 */
const COORDS_KEY = 'last_coords';
/** 缓存有效期：24 小时 */
const CACHE_TTL = 24 * 60 * 60 * 1000;

interface CachedCoords extends GeoCoords {
  /** 记录时间（毫秒） */
  ts: number;
}

/** 读取缓存坐标，过期或数据损坏时返回 null */
function readCachedCoords(): GeoCoords | null {
  const cached = loadFromStorage<CachedCoords | null>(COORDS_KEY, null);
  if (!cached || typeof cached.lat !== 'number' || typeof cached.lon !== 'number') return null;
  if (Date.now() - cached.ts > CACHE_TTL) return null;
  return { lat: cached.lat, lon: cached.lon };
}

/** 把浏览器定位错误码映射为友好的中文提示 */
function toFriendlyMessage(err: GeolocationPositionError): string {
  switch (err.code) {
    case err.PERMISSION_DENIED:
      return '您拒绝了定位权限，无法获取当前位置，请手动搜索城市';
    case err.POSITION_UNAVAILABLE:
      return '无法获取当前位置，请稍后重试或手动搜索城市';
    case err.TIMEOUT:
      return '定位超时，请稍后重试或手动搜索城市';
    default:
      return '定位失败，请手动搜索城市';
  }
}

/**
 * 自动定位 Hook
 * 定位策略（应用绝不自动请求定位，避免反复打扰用户）：
 * 1. 打开页面时只读取 24 小时内的缓存坐标，直接展示上次定位的天气
 * 2. 只有用户点击 📍 按钮时才调用浏览器定位
 * 3. 定位成功写入缓存，下次打开无需再次定位
 */
export function useGeolocation(): UseGeolocationResult {
  // 优先使用上次定位结果，刷新页面可直接展示天气
  const [coords, setCoords] = useState<GeoCoords | null>(readCachedCoords);
  const [status, setStatus] = useState<GeolocationStatus>(() => (coords ? 'success' : 'idle'));
  const [error, setError] = useState<string | null>(null);
  // 防止重复请求（StrictMode 下 effect 执行两次、连续点击按钮）
  const locatingRef = useRef(false);

  const locate = useCallback(() => {
    // 已有请求在进行中，直接忽略
    if (locatingRef.current) return;

    // 浏览器不支持定位 API（非 HTTPS/localhost 环境下可能出现）
    if (!('geolocation' in navigator)) {
      setStatus('error');
      setError('当前环境不支持定位，请手动搜索城市');
      return;
    }

    locatingRef.current = true;
    setStatus('locating');
    setError(null);

    navigator.geolocation.getCurrentPosition(
      // 定位成功：保存经纬度并缓存，下次打开无需再次定位
      (position) => {
        locatingRef.current = false;
        const next = { lat: position.coords.latitude, lon: position.coords.longitude };
        setCoords(next);
        setStatus('success');
        saveToStorage<CachedCoords>(COORDS_KEY, { ...next, ts: Date.now() });
      },
      // 定位失败：用户拒绝授权、不可用或超时
      (err) => {
        locatingRef.current = false;
        setStatus('error');
        setError(toFriendlyMessage(err));
      },
      {
        enableHighAccuracy: false,
        timeout: 10000, // 10 秒超时
        maximumAge: 300000, // 5 分钟内的缓存位置可复用
      },
    );
  }, []);

  return { coords, status, error, locate };
}
