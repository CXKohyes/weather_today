interface WeatherIconProps {
  /** OpenWeatherMap 图标编号，如 01d（晴·白天）、10n（雨·夜晚） */
  icon: string;
  /** 图标说明文字（天气描述） */
  alt: string;
  /** 图标尺寸 */
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES: Record<NonNullable<WeatherIconProps['size']>, string> = {
  xs: 'h-8 w-8',
  sm: 'h-10 w-10',
  md: 'h-16 w-16',
  lg: 'h-24 w-24',
};

/**
 * 天气图标
 * 使用 OpenWeatherMap 官方图标，根据图标编号拼接 URL
 */
export function WeatherIcon({ icon, alt, size = 'md' }: WeatherIconProps) {
  return (
    <img
      src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
      alt={alt}
      className={`${SIZE_CLASSES[size]} shrink-0`}
      loading="lazy"
    />
  );
}
