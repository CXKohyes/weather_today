import { useEffect, useState } from 'react';
import { getAirPollution } from '../services/weatherApi';
import { buildAirQualityInfo } from '../utils/airQuality';
import type { AirQualityInfo } from '../utils/airQuality';

/**
 * 空气质量 Hook
 * 拿到坐标后在后台查询空气质量，属于附加信息：
 * 请求失败时静默返回 null，不影响主流程
 */
export function useAirQuality(lat?: number, lon?: number): AirQualityInfo | null {
  const [info, setInfo] = useState<AirQualityInfo | null>(null);

  useEffect(() => {
    // 还没有坐标（未查询成功）时不请求
    if (lat === undefined || lon === undefined) {
      setInfo(null);
      return;
    }

    let cancelled = false;
    getAirPollution(lat, lon)
      .then((data) => {
        if (cancelled) return;
        const pm25 = data.list[0]?.components.pm2_5;
        setInfo(typeof pm25 === 'number' ? buildAirQualityInfo(pm25) : null);
      })
      .catch(() => {
        // 空气质量为附加信息，失败时静默忽略
        if (!cancelled) setInfo(null);
      });

    return () => {
      cancelled = true;
    };
  }, [lat, lon]);

  return info;
}
