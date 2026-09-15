import type { DailyForecast } from '../types/weather';
import { WeatherIcon } from './WeatherIcon';
import { formatWeekday } from '../utils/format';

interface ForecastListProps {
  /** 按天汇总后的预报数据 */
  daily: DailyForecast[];
}

/**
 * 多天预报卡片
 * 每行：日期、天气图标、温度区间条（渐变）、最低-最高温度
 */
export function ForecastList({ daily }: ForecastListProps) {
  if (daily.length === 0) return null;

  // 所有天的温度范围，用于计算每行温度条的位置与长度
  const globalMin = Math.min(...daily.map((day) => day.tempMin));
  const globalMax = Math.max(...daily.map((day) => day.tempMax));
  const span = Math.max(globalMax - globalMin, 1);

  return (
    <section className="rounded-2xl bg-white/15 p-4 backdrop-blur-sm">
      <h3 className="text-sm text-white/85">📅 {daily.length} 天预报</h3>
      <div className="mt-3 space-y-3">
        {daily.map((day, index) => {
          const left = ((day.tempMin - globalMin) / span) * 100;
          const width = Math.max(((day.tempMax - day.tempMin) / span) * 100, 10);
          return (
            <div key={day.date} className="flex items-center gap-3">
              <span className="w-10 shrink-0 text-sm text-white">
                {index === 0 ? '今天' : index === 1 ? '明天' : formatWeekday(day.date)}
              </span>
              <WeatherIcon icon={day.icon} alt={day.description} size="xs" />
              {/* 温度区间条 */}
              <div className="relative h-1.5 min-w-0 flex-1 rounded-full bg-white/25">
                <div
                  className="absolute top-0 h-full rounded-full bg-gradient-to-r from-sky-200 via-emerald-300 to-amber-400"
                  style={{ left: `${left}%`, width: `${width}%` }}
                />
              </div>
              <span className="w-16 shrink-0 text-right text-xs text-white/85">
                {day.tempMin}-{day.tempMax}°
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
