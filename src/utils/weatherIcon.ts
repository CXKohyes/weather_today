/**
 * 天气图标编号解析
 * OpenWeatherMap 的图标编号格式为「两位数字 + d|n」，如 01d（晴·白天）、10n（雨·夜晚）：
 * 前两位数字表示天气族，后缀 d / n 表示白天 / 夜晚。
 * 这里把编号解析为图标组件与背景组件共用的结构化信息。
 */

/** 天气族（对应 OWM 图标编号的前两位数字） */
export type WeatherFamily =
  | 'clear'
  | 'fewClouds'
  | 'scatteredClouds'
  | 'brokenClouds'
  | 'showerRain'
  | 'rain'
  | 'thunderstorm'
  | 'snow'
  | 'mist';

export interface ParsedIcon {
  /** 天气族 */
  family: WeatherFamily;
  /** 是否为夜晚（编号以 n 结尾） */
  isNight: boolean;
}

/** 编号前两位 → 天气族 */
const FAMILY_BY_CODE: Record<string, WeatherFamily> = {
  '01': 'clear',
  '02': 'fewClouds',
  '03': 'scatteredClouds',
  '04': 'brokenClouds',
  '09': 'showerRain',
  '10': 'rain',
  '11': 'thunderstorm',
  '13': 'snow',
  '50': 'mist',
};

/** 无法识别编号时的回退族：中性且一定有图形可渲染，避免出现空白 */
const FALLBACK_FAMILY: WeatherFamily = 'brokenClouds';

/**
 * 解析 OWM 图标编号
 * 编号缺失或无法识别时回退为 brokenClouds，保证图标与背景永远有内容
 */
export function parseIconCode(code: string | undefined | null): ParsedIcon {
  if (!code) {
    return { family: FALLBACK_FAMILY, isNight: false };
  }
  return {
    family: FAMILY_BY_CODE[code.slice(0, 2)] ?? FALLBACK_FAMILY,
    isNight: code.endsWith('n'),
  };
}
