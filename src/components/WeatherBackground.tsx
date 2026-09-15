import { parseIconCode } from '../utils/weatherIcon';

interface WeatherBackgroundProps {
  /** 当前天气图标编号（如 01d、10n），为空时只保留基础底色 */
  icon?: string | null;
}

/*
 * 降水用「可平铺的 SVG 图案 + 竖直位移」实现，而不是生成成百上千个元素：
 * 图案的竖直周期与 keyframes 的位移量严格相等（雨 60px、雪 80px），因此循环无缝且无接缝。
 * 倾斜则交给外层元素做静态 rotate——不能和动画放在同一个元素上，否则 CSS transform 会互相覆盖。
 */
const RAIN_TILE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='60'%3E%3Crect x='14' y='0' width='2.5' height='16' rx='1.25' fill='%23ffffff' fill-opacity='0.5'/%3E%3C/svg%3E\")";

const SNOW_TILE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='80'%3E%3Ccircle cx='14' cy='14' r='2.6' fill='%23ffffff' fill-opacity='0.75'/%3E%3Ccircle cx='40' cy='44' r='2' fill='%23ffffff' fill-opacity='0.6'/%3E%3Ccircle cx='24' cy='70' r='2.2' fill='%23ffffff' fill-opacity='0.7'/%3E%3C/svg%3E\")";

/** 夜空星点：用径向渐变点出若干颗星，不需要真实 DOM 节点 */
const STARS =
  'radial-gradient(1.5px 1.5px at 18% 16%, rgba(255,255,255,.9), transparent),' +
  'radial-gradient(1.5px 1.5px at 72% 12%, rgba(255,255,255,.75), transparent),' +
  'radial-gradient(2px 2px at 42% 26%, rgba(255,255,255,.85), transparent),' +
  'radial-gradient(1.5px 1.5px at 88% 34%, rgba(255,255,255,.7), transparent),' +
  'radial-gradient(1.5px 1.5px at 28% 42%, rgba(255,255,255,.65), transparent),' +
  'radial-gradient(2px 2px at 62% 50%, rgba(255,255,255,.6), transparent),' +
  'radial-gradient(1.5px 1.5px at 12% 58%, rgba(255,255,255,.55), transparent),' +
  'radial-gradient(1.5px 1.5px at 82% 66%, rgba(255,255,255,.5), transparent)';

/**
 * 全屏氛围背景
 * 根据当前天气叠加不同的装饰层：图层是纯氛围，因此整体 aria-hidden 且不接收指针事件。
 * 渲染在根容器的内容列之前，内容列加 relative 即可覆盖其上，无需 z-index。
 */
export function WeatherBackground({ icon }: WeatherBackgroundProps) {
  const { family, isNight } = parseIconCode(icon);

  const isRain = family === 'rain' || family === 'showerRain';
  const isStorm = family === 'thunderstorm';
  const isSnow = family === 'snow';
  // 除了晴天，天空都有云
  const hasClouds = family !== 'clear';

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* 夜空：整体压暗，让白色文字仍有足够对比度 */}
      {isNight && <div className="absolute inset-0 bg-[#24406e]/45" />}

      {/* 晴·白天：暖色光晕缓慢呼吸 */}
      {family === 'clear' && !isNight && (
        <div
          className="animate-breathe motion-reduce:animate-none absolute left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full"
          style={{
            top: '-14rem',
            background:
              'radial-gradient(circle, rgba(255,209,102,.95) 0%, rgba(255,209,102,0) 68%)',
          }}
        />
      )}

      {/* 晴·夜晚：星点 + 冷色月晕 */}
      {family === 'clear' && isNight && (
        <>
          <div className="absolute inset-0" style={{ backgroundImage: STARS }} />
          <div
            className="animate-breathe motion-reduce:animate-none absolute -top-24 right-2 h-80 w-80 rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(206,226,255,.9) 0%, rgba(206,226,255,0) 70%)',
            }}
          />
        </>
      )}

      {/* 云影：两片模糊云以不同速度横穿，形成视差 */}
      {hasClouds && (
        <>
          <div
            className="animate-drift motion-reduce:animate-none absolute h-40 w-72 rounded-full blur-[40px]"
            style={{ top: '6%', background: 'rgba(255,255,255,.34)' }}
          />
          <div
            className="animate-drift-slow motion-reduce:animate-none absolute h-32 w-60 rounded-full blur-[40px]"
            style={{ top: '30%', background: 'rgba(255,255,255,.24)', animationDelay: '-40s' }}
          />
        </>
      )}

      {/* 雨：两层错速的斜向雨丝 */}
      {(isRain || isStorm) && (
        <>
          <div className="absolute inset-0 rotate-[12deg] scale-125">
            <div
              className="animate-fall motion-reduce:animate-none absolute -top-[60px] -bottom-[60px] left-0 right-0"
              style={{ backgroundImage: RAIN_TILE, backgroundSize: '30px 60px' }}
            />
          </div>
          <div className="absolute inset-0 rotate-[12deg] scale-125">
            <div
              className="animate-fall motion-reduce:animate-none absolute -top-[60px] -bottom-[60px] left-0 right-0 opacity-60"
              style={{
                backgroundImage: RAIN_TILE,
                backgroundSize: '30px 60px',
                animationDuration: '0.95s',
                animationDelay: '-0.4s',
              }}
            />
          </div>
        </>
      )}

      {/* 雪：两层错速飘落 */}
      {isSnow && (
        <>
          <div className="absolute inset-0">
            <div
              className="animate-snowfall motion-reduce:animate-none absolute -top-[80px] -bottom-[80px] left-0 right-0"
              style={{ backgroundImage: SNOW_TILE, backgroundSize: '56px 80px' }}
            />
          </div>
          <div className="absolute inset-0">
            <div
              className="animate-snowfall motion-reduce:animate-none absolute -top-[80px] -bottom-[80px] left-0 right-0 opacity-60"
              style={{
                backgroundImage: SNOW_TILE,
                backgroundSize: '84px 80px',
                animationDuration: '9s',
                animationDelay: '-3s',
              }}
            />
          </div>
        </>
      )}

      {/* 雾：低处几条横向雾带 */}
      {family === 'mist' && (
        <>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute left-0 right-0"
              style={{
                bottom: `${8 + i * 14}%`,
                height: '18%',
                background:
                  'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,.22) 50%, rgba(255,255,255,0) 100%)',
              }}
            />
          ))}
        </>
      )}

      {/* 雷暴：偶发闪光 */}
      {isStorm && (
        <div className="animate-flash motion-reduce:animate-none absolute inset-0 bg-white" />
      )}
    </div>
  );
}
