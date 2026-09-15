/**
 * 天气图标的可复用 SVG 片段
 * 每个片段返回一个 <g>，由 WeatherIcon 按天气族组合成完整图标，避免 9 个图标各写一遍动画。
 * 动画一律由 CSS 驱动（keyframes 见 src/index.css），并带 motion-reduce:animate-none：
 * prefers-reduced-motion 只作用于这些装饰性动效，不会连带冻结加载动画的旋转。
 *
 * 注意：CSS transform 的优先级高于 SVG 的 transform 属性，
 * 因此需要「先定位、再动画」时一律用嵌套 <g>——外层放 transform 属性定位，内层挂动画类名。
 */
import type { CSSProperties } from 'react';

/** 旋转动画的基准样式：显式指定变换原点与参照系，避免依赖浏览器默认的 transform-box */
function rotateAround(x: number, y: number): CSSProperties {
  return { transformOrigin: `${x}px ${y}px`, transformBox: 'view-box' };
}

interface PartProps {
  /** 附加类名，用于微调位置或尺寸 */
  className?: string;
}

/** 太阳光线的角度（八方位） */
const SUN_RAY_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

/** 太阳：光芒缓慢自转，本体静止 */
export function Sun({ className = '' }: PartProps) {
  return (
    <g className={className}>
      <g
        className="animate-turn motion-reduce:animate-none"
        style={rotateAround(32, 32)}
      >
        {SUN_RAY_ANGLES.map((deg) => (
          <line
            key={deg}
            x1="32"
            y1="11"
            x2="32"
            y2="17"
            stroke="#FFD166"
            strokeWidth="2.5"
            strokeLinecap="round"
            transform={`rotate(${deg} 32 32)`}
          />
        ))}
      </g>
      <circle cx="32" cy="32" r="11" fill="#FFD166" />
    </g>
  );
}

/** 月亮：一弯新月，本身不做动画 */
export function Moon({ className = '' }: PartProps) {
  return (
    <g className={className}>
      <path
        d="M 38 20 A 14 14 0 1 0 38 44 A 11 11 0 1 1 38 20 Z"
        fill="#E8EEF7"
      />
    </g>
  );
}

interface CloudProps extends PartProps {
  /** 云的颜色 */
  fill?: string;
  /** 是否让云轻微浮动 */
  float?: boolean;
  /** 浮动动画的延迟（秒），多朵云错开可避免同步摆动显得机械 */
  delay?: number;
}

/** 云：由三个圆与一个圆角矩形叠成的一体轮廓 */
export function Cloud({
  className = '',
  fill = '#F2F6FA',
  float = true,
  delay = 0,
}: CloudProps) {
  const shape = (
    <g fill={fill}>
      <circle cx="22" cy="34" r="9" />
      <circle cx="34" cy="29" r="13" />
      <circle cx="44" cy="35" r="8" />
      <rect x="14" y="34" width="32" height="10" rx="5" />
    </g>
  );

  // 浮动动画挂在内层，避免与外层的 transform 属性互相覆盖
  return (
    <g className={className}>
      {float ? (
        <g
          className="animate-sway motion-reduce:animate-none"
          style={delay ? { animationDelay: `${delay}s` } : undefined}
        >
          {shape}
        </g>
      ) : (
        shape
      )}
    </g>
  );
}

/** 云下的雨滴：三滴错开下落 */
export function RainDrops({ className = '' }: PartProps) {
  return (
    <g className={className}>
      {[0, 1, 2].map((i) => (
        <line
          key={i}
          x1={23 + i * 9}
          y1="46"
          x2={23 + i * 9}
          y2="52"
          stroke="#7FC4E8"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="animate-drip motion-reduce:animate-none"
          style={{ animationDelay: `${i * 0.35}s` }}
        />
      ))}
    </g>
  );
}

/** 云下的雪花：三片错开飘落 */
export function SnowFlakes({ className = '' }: PartProps) {
  return (
    <g className={className}>
      {[0, 1, 2].map((i) => (
        <circle
          key={i}
          cx={23 + i * 9}
          cy="48"
          r="2"
          fill="#EAF3FB"
          className="animate-flake motion-reduce:animate-none"
          style={{ animationDelay: `${i * 0.7}s` }}
        />
      ))}
    </g>
  );
}

/** 闪电：云下的折线闪电，呼吸式明灭 */
export function Lightning({ className = '' }: PartProps) {
  return (
    <g className={className}>
      <polygon
        points="33,45 27,55 31,55 28,62 37,52 33,52 36,45"
        fill="#FFD166"
        className="animate-flash motion-reduce:animate-none"
      />
    </g>
  );
}

/** 雾：三条虚实不一的横向带，轻微左右浮动 */
export function MistBands({ className = '' }: PartProps) {
  return (
    <g className={className}>
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={12 + i * 5}
          y={26 + i * 9}
          width={40 - i * 8}
          height="4"
          rx="2"
          fill="#DCE9F5"
          opacity="0.85"
          className="animate-sway motion-reduce:animate-none"
          style={{ animationDelay: `${i * 0.5}s` }}
        />
      ))}
    </g>
  );
}
