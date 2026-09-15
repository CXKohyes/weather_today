/**
 * 空气质量换算
 * 免费接口只提供 PM2.5 等浓度，这里按美国 EPA 分段线性公式换算为 AQI（0-500），
 * 并给出中文等级与出行建议
 */

export interface AirQualityInfo {
  /** 空气质量指数（0-500） */
  aqi: number;
  /** 中文等级（优 / 良 / 轻度污染 …） */
  label: string;
  /** 等级徽章的 Tailwind 类名 */
  badgeClass: string;
  /** 出行建议 */
  advice: string;
  /** PM2.5 浓度（µg/m³） */
  pm25: number;
}

/** PM2.5 浓度分段：[浓度下限, 浓度上限, AQI 下限, AQI 上限] */
const PM25_BREAKPOINTS: Array<[number, number, number, number]> = [
  [0, 12.0, 0, 50],
  [12.1, 35.4, 51, 100],
  [35.5, 55.4, 101, 150],
  [55.5, 150.4, 151, 200],
  [150.5, 250.4, 201, 300],
  [250.5, 350.4, 301, 400],
  [350.5, 500.4, 401, 500],
];

/** PM2.5 浓度换算为 AQI（分段线性插值） */
export function pm25ToAqi(pm25: number): number {
  for (const [cLow, cHigh, iLow, iHigh] of PM25_BREAKPOINTS) {
    if (pm25 <= cHigh) {
      return Math.round(((iHigh - iLow) / (cHigh - cLow)) * (pm25 - cLow) + iLow);
    }
  }
  return 500;
}

/** 根据 AQI 给出等级、颜色与建议 */
function toLevel(aqi: number): Pick<AirQualityInfo, 'label' | 'badgeClass' | 'advice'> {
  if (aqi <= 50) {
    return { label: '优', badgeClass: 'bg-emerald-400 text-emerald-950', advice: '适宜户外运动' };
  }
  if (aqi <= 100) {
    return { label: '良', badgeClass: 'bg-amber-300 text-amber-950', advice: '适宜户外运动' };
  }
  if (aqi <= 150) {
    return { label: '轻度污染', badgeClass: 'bg-orange-400 text-orange-950', advice: '敏感人群减少户外活动' };
  }
  if (aqi <= 200) {
    return { label: '中度污染', badgeClass: 'bg-red-400 text-red-950', advice: '建议减少户外活动' };
  }
  if (aqi <= 300) {
    return { label: '重度污染', badgeClass: 'bg-purple-400 text-purple-950', advice: '建议留在室内' };
  }
  return { label: '严重污染', badgeClass: 'bg-rose-600 text-white', advice: '避免户外活动' };
}

/** 由 PM2.5 浓度构建完整的空气质量信息 */
export function buildAirQualityInfo(pm25: number): AirQualityInfo {
  const aqi = pm25ToAqi(pm25);
  return { aqi, pm25, ...toLevel(aqi) };
}
