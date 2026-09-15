import type { CurrentWeather as CurrentWeatherData } from '../types/weather';
import type { AirQualityInfo } from '../utils/airQuality';

interface CurrentWeatherProps {
  /** 当前天气数据 */
  data: CurrentWeatherData;
  /** 展示用的城市名（本地化，中文优先） */
  name: string;
  /** 该城市是否已收藏 */
  isFavorite: boolean;
  /** 点击星标收藏 / 取消收藏 */
  onToggleFavorite: () => void;
  /** 空气质量信息（接口失败时为 null） */
  airQuality?: AirQualityInfo | null;
}

/**
 * 当前天气主视觉（第一页）
 * 城市、天气状况、大号温度、最高/最低温与空气质量
 */
export function CurrentWeather({
  data,
  name,
  isFavorite,
  onToggleFavorite,
  airQuality = null,
}: CurrentWeatherProps) {
  const condition = data.weather[0];
  // 城市名过长时自动缩小字号，避免换行挤压布局
  const nameSizeClass =
    name.length > 12 ? 'text-2xl' : name.length > 6 ? 'text-3xl' : 'text-4xl';

  return (
    <div className="flex w-full flex-col px-2 text-center text-white">
      {/* 城市名与收藏星标 */}
      <div className="flex items-center justify-center gap-2 pt-4">
        <h2 className={`${nameSizeClass} font-semibold`}>{name}</h2>
        <button
          type="button"
          onClick={onToggleFavorite}
          title={isFavorite ? '取消收藏' : '收藏城市'}
          className={`shrink-0 text-2xl leading-none transition hover:scale-110 ${
            isFavorite ? 'text-amber-300' : 'text-white/60'
          }`}
        >
          {isFavorite ? '★' : '☆'}
        </button>
      </div>
      <p className="mt-2 text-lg text-white/85">{condition.description}</p>

      {/* 大号温度与最高/最低温 */}
      <div className="flex flex-1 flex-col items-center justify-center py-8">
        <p className="text-[7rem] leading-none font-extralight">
          {Math.round(data.main.temp)}
          <span className="align-super text-4xl font-light">°</span>
        </p>
        <p className="mt-8 text-white/85">
          最高 {Math.round(data.main.temp_max)}° 最低 {Math.round(data.main.temp_min)}°
        </p>
      </div>

      {/* 空气质量：AQI 数值 + 等级徽章 + 出行建议 */}
      {airQuality && (
        <div className="mt-2 flex items-center justify-between gap-3 rounded-2xl bg-white/15 px-4 py-3 text-sm backdrop-blur-sm">
          <span className="flex items-center gap-2">
            <span className="text-white/85">AQI {airQuality.aqi}</span>
            <span className={`rounded-md px-1.5 py-0.5 text-xs font-medium ${airQuality.badgeClass}`}>
              {airQuality.label}
            </span>
          </span>
          <span className="truncate text-white/75">{airQuality.advice}</span>
        </div>
      )}
    </div>
  );
}
