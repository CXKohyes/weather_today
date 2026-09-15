/**
 * 天气数据换算工具
 * 把 API 返回的原始数值转换成更易读的中文描述
 */

/** 蒲福风级上限表（m/s） */
const BEAUFORT_UPPER_BOUNDS = [0.3, 1.6, 3.4, 5.5, 8.0, 10.8, 13.9, 17.2, 20.8, 24.5, 28.5, 32.7];

/** 风速（m/s）转蒲福风级（0-12 级） */
export function toBeaufortLevel(speedMs: number): number {
  const index = BEAUFORT_UPPER_BOUNDS.findIndex((bound) => speedMs < bound);
  return index === -1 ? 12 : index;
}

/** 八方位风向中文名 */
const WIND_DIRECTIONS = ['北风', '东北风', '东风', '东南风', '南风', '西南风', '西风', '西北风'];

/** 风向角度转中文（八方位） */
export function toWindDirection(deg: number): string {
  return WIND_DIRECTIONS[Math.round(deg / 45) % 8];
}

/** 由温度与湿度计算露点温度（Magnus 公式） */
export function toDewPoint(tempC: number, humidity: number): number {
  const a = 17.27;
  const b = 237.7;
  const safeHumidity = Math.min(Math.max(humidity, 1), 100);
  const alpha = (a * tempC) / (b + tempC) + Math.log(safeHumidity / 100);
  return Math.round((b * alpha) / (a - alpha));
}

/** 能见度（米）转展示文本，如 "12km" */
export function formatVisibility(meters: number): string {
  const km = Math.round((meters / 1000) * 10) / 10;
  return `${km}km`;
}

/** 能见度描述 */
export function toVisibilityLabel(meters: number): string {
  if (meters >= 10000) return '视野极佳';
  if (meters >= 5000) return '视野良好';
  if (meters >= 2000) return '视野一般';
  return '视野较差';
}

/** 体感温度描述 */
export function toFeelsLikeLabel(feelsLike: number): string {
  if (feelsLike >= 35) return '酷热';
  if (feelsLike >= 28) return '偏热';
  if (feelsLike >= 24) return '舒适';
  if (feelsLike >= 18) return '凉爽';
  if (feelsLike >= 10) return '偏凉';
  if (feelsLike >= 0) return '寒冷';
  return '严寒';
}
