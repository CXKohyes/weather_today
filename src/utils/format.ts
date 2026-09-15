/**
 * 时间格式化工具
 * OpenWeatherMap 返回的时间戳为 UTC 秒，加上城市时区偏移后再用 UTC 时区格式化，
 * 即可得到该城市的当地时间
 */

/** 按城市时区格式化日期时间，如 "8月15日 周五 14:30" */
export function formatLocalDateTime(dt: number, timezone: number): string {
  return new Date((dt + timezone) * 1000).toLocaleString('zh-CN', {
    timeZone: 'UTC',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** 格式化为时钟时间，如 "18:42" */
export function formatClock(dt: number, timezone: number): string {
  return new Date((dt + timezone) * 1000).toLocaleTimeString('zh-CN', {
    timeZone: 'UTC',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/** 小时标签，如 "15时"；isNow 为 true 时返回 "现在" */
export function formatHourLabel(dt: number, timezone: number, isNow = false): string {
  if (isNow) return '现在';
  const hour = new Date((dt + timezone) * 1000).getUTCHours();
  return `${hour}时`;
}

/** 星期标签，如 "周三" */
export function formatWeekday(date: number): string {
  return new Date(date).toLocaleDateString('zh-CN', { timeZone: 'UTC', weekday: 'short' });
}
