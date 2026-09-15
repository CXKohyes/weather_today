import type { Forecast } from '../types/weather';
import { WeatherIcon } from './WeatherIcon';
import { formatHourLabel } from '../utils/format';

interface HourlyForecastProps {
  /** 预报数据（3 小时间隔） */
  forecast: Forecast;
  /** 展示的时段数量 */
  count?: number;
}

/**
 * 每小时预报卡片
 * 免费接口为 3 小时间隔，展示「现在」及之后若干时段
 */
export function HourlyForecast({ forecast, count = 6 }: HourlyForecastProps) {
  const timezone = forecast.city.timezone;
  const items = forecast.list.slice(0, count);
  if (items.length === 0) return null;

  return (
    <section className="rounded-2xl bg-white/15 p-4 backdrop-blur-sm">
      <h3 className="text-sm text-white/85">🕐 每小时预报</h3>
      <div className="mt-3 flex justify-between gap-1">
        {items.map((item, index) => (
          <div key={item.dt} className="flex min-w-0 flex-1 flex-col items-center gap-1">
            <span className="text-xs text-white/70">
              {formatHourLabel(item.dt, timezone, index === 0)}
            </span>
            <WeatherIcon
              icon={item.weather[0].icon}
              alt={item.weather[0].description}
              size="xs"
            />
            <span className="text-sm font-medium text-white">
              {Math.round(item.main.temp)}°
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
