import { parseIconCode } from '../utils/weatherIcon';
import type { WeatherFamily } from '../utils/weatherIcon';
import {
  Cloud,
  Lightning,
  MistBands,
  Moon,
  RainDrops,
  SnowFlakes,
  Sun,
} from './weather-icons/parts';

interface WeatherIconProps {
  /** OpenWeatherMap 图标编号，如 01d（晴·白天）、10n（雨·夜晚） */
  icon: string;
  /** 天气描述，作为图标的无障碍标签 */
  alt: string;
  /** 图标尺寸 */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const SIZE_CLASSES: Record<NonNullable<WeatherIconProps['size']>, string> = {
  xs: 'h-8 w-8',
  sm: 'h-10 w-10',
  md: 'h-16 w-16',
  lg: 'h-24 w-24',
  xl: 'h-32 w-32',
};

/** 白天云的颜色 */
const CLOUD_DAY = '#F2F6FA';
/** 夜晚云的颜色：压暗一档，读起来才像夜色 */
const CLOUD_NIGHT = '#D5E0EC';

/**
 * 图标的中心点：所有片段都画在以 (32,32) 为中心的 64×64 坐标系里，
 * 该函数把片段缩放到指定大小并移动中心到 (cx, cy)，便于组合。
 */
function place(cx: number, cy: number, scale = 1): string {
  return `translate(${cx} ${cy}) scale(${scale}) translate(-32 -32)`;
}

/** 按天气族组合出图标内容 */
function renderFamily(family: WeatherFamily, isNight: boolean) {
  const cloudFill = isNight ? CLOUD_NIGHT : CLOUD_DAY;
  // 晴夜用月亮，其余白天/夜晚的天体都用太阳或月亮打底
  const sky = isNight ? <Moon /> : <Sun />;

  switch (family) {
    case 'clear':
      return sky;

    case 'fewClouds':
      // 天体偏左上，一朵小云压在右下
      return (
        <>
          <g transform={place(24, 23, 0.68)}>{sky}</g>
          <g transform={place(38, 41, 0.78)}>
            <Cloud fill={cloudFill} />
          </g>
        </>
      );

    case 'scatteredClouds':
      // 天体露出一角，云更大
      return (
        <>
          <g transform={place(21, 21, 0.6)}>{sky}</g>
          <g transform={place(35, 37, 0.92)}>
            <Cloud fill={cloudFill} />
          </g>
        </>
      );

    case 'brokenClouds':
      // 两朵云，后一朵错开延迟浮动
      return (
        <>
          <g transform={place(28, 27, 0.8)}>
            <Cloud fill={cloudFill} />
          </g>
          <g transform={place(40, 43, 0.66)}>
            <Cloud fill={cloudFill} delay={1.2} />
          </g>
        </>
      );

    case 'showerRain':
      return (
        <g transform={place(32, 29, 0.92)}>
          <Cloud fill={cloudFill} />
          <RainDrops />
        </g>
      );

    case 'rain':
      return (
        <g transform={place(32, 28, 0.95)}>
          <Cloud fill={cloudFill} />
          <RainDrops />
        </g>
      );

    case 'thunderstorm':
      return (
        <g transform={place(32, 28, 0.95)}>
          <Cloud fill={cloudFill} />
          <Lightning />
          <RainDrops />
        </g>
      );

    case 'snow':
      return (
        <g transform={place(32, 29, 0.92)}>
          <Cloud fill={cloudFill} />
          <SnowFlakes />
        </g>
      );

    case 'mist':
      return (
        <>
          <g transform={place(32, 26, 0.7)}>
            <Cloud fill={cloudFill} float={false} />
          </g>
          <MistBands />
        </>
      );
  }
}

/**
 * 天气图标
 * 自绘的动画 SVG，替代原先指向 OpenWeatherMap CDN 的 PNG：
 * 既去掉了外部依赖，也让图标内部元素可以各自做微动画。
 */
export function WeatherIcon({ icon, alt, size = 'md' }: WeatherIconProps) {
  const { family, isNight } = parseIconCode(icon);

  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label={alt}
      className={`${SIZE_CLASSES[size]} shrink-0`}
    >
      {renderFamily(family, isNight)}
    </svg>
  );
}
