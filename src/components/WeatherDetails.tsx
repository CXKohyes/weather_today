import type { CurrentWeather as CurrentWeatherData } from '../types/weather';
import { formatClock } from '../utils/format';
import {
  formatVisibility,
  toBeaufortLevel,
  toDewPoint,
  toFeelsLikeLabel,
  toVisibilityLabel,
  toWindDirection,
} from '../utils/weather';

interface WeatherDetailsProps {
  /** 当前天气数据 */
  data: CurrentWeatherData;
}

/** 单个详细数据卡片 */
function DetailCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: string;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl bg-white/15 p-4 backdrop-blur-sm">
      <p className="text-xs text-white/80">
        {icon} {label}
      </p>
      <p className="mt-2 text-3xl font-medium text-white">{value}</p>
      <p className="mt-1 truncate text-xs text-white/70">{sub}</p>
    </div>
  );
}

/**
 * 详细数据（第三页）
 * 气压、日出日落、风、湿度、能见度、体感，两列网格展示
 */
export function WeatherDetails({ data }: WeatherDetailsProps) {
  const { main, wind, sys, timezone, visibility } = data;

  return (
    <div className="text-white">
      <h2 className="px-1 text-2xl font-semibold">详细数据</h2>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <DetailCard
          icon="📈"
          label="气压"
          value={`${main.pressure}`}
          sub="百帕 hPa"
        />
        <DetailCard
          icon="🌇"
          label="日落"
          value={formatClock(sys.sunset, timezone)}
          sub={`日出 ${formatClock(sys.sunrise, timezone)}`}
        />
        <DetailCard
          icon="💨"
          label="风"
          value={`${toBeaufortLevel(wind.speed)}级`}
          sub={toWindDirection(wind.deg)}
        />
        <DetailCard
          icon="💧"
          label="湿度"
          value={`${main.humidity}%`}
          sub={`露点 ${toDewPoint(main.temp, main.humidity)}°`}
        />
        <DetailCard
          icon="👁"
          label="能见度"
          value={formatVisibility(visibility)}
          sub={toVisibilityLabel(visibility)}
        />
        <DetailCard
          icon="🌡"
          label="体感"
          value={`${Math.round(main.feels_like)}°`}
          sub={toFeelsLikeLabel(main.feels_like)}
        />
      </div>
    </div>
  );
}
