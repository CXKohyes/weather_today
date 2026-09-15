import type { DailyForecast, Forecast, ForecastItem } from '../types/weather';

/** 一天的秒数 */
const SECONDS_PER_DAY = 86400;

/**
 * 把 5 天 / 3 小时间隔的预报数据按天汇总
 * 每天取最高/最低温度和正午附近的天气图标
 * @param forecast 原始预报数据
 * @param days 需要的天数，默认 5
 * @param includeToday 是否包含今天（今天只有当前时段之后的预报，最高/最低为当日剩余时段的值）
 */
export function groupForecastByDay(
  forecast: Forecast,
  days = 5,
  includeToday = false,
): DailyForecast[] {
  const timezone = forecast.city.timezone;
  // 今天在“城市当地时区”的日期序号
  const todayIndex = Math.floor((Date.now() / 1000 + timezone) / SECONDS_PER_DAY);

  // 按当地日期序号分组
  const byDay = new Map<number, ForecastItem[]>();
  for (const item of forecast.list) {
    const dayIndex = Math.floor((item.dt + timezone) / SECONDS_PER_DAY);
    const list = byDay.get(dayIndex);
    if (list) {
      list.push(item);
    } else {
      byDay.set(dayIndex, [item]);
    }
  }

  const result: DailyForecast[] = [];
  for (const [dayIndex, items] of byDay) {
    // 默认跳过今天；includeToday 时从今天开始取
    if (dayIndex < todayIndex) continue;
    if (!includeToday && dayIndex === todayIndex) continue;
    if (result.length >= days) break;

    let tempMin = Infinity;
    let tempMax = -Infinity;
    // 取当地正午（12 点）附近的时段作为当天代表天气
    let noonItem = items[0];
    let noonDistance = Infinity;

    for (const item of items) {
      tempMin = Math.min(tempMin, item.main.temp_min);
      tempMax = Math.max(tempMax, item.main.temp_max);
      const hour = ((item.dt + timezone) % SECONDS_PER_DAY) / 3600;
      const distance = Math.abs(hour - 12);
      if (distance < noonDistance) {
        noonDistance = distance;
        noonItem = item;
      }
    }

    result.push({
      // 当地日期的 UTC 零点时间戳（毫秒），展示时用 UTC 时区格式化
      date: dayIndex * SECONDS_PER_DAY * 1000,
      tempMin: Math.round(tempMin),
      tempMax: Math.round(tempMax),
      icon: noonItem.weather[0].icon,
      description: noonItem.weather[0].description,
    });
  }

  return result;
}
