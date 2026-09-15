import type { Forecast } from '../types/weather';

interface PrecipitationCardProps {
  /** 预报数据（用于计算未来降水概率） */
  forecast: Forecast;
}

/**
 * 降雨预报卡片
 * 免费接口不提供分钟级降水，这里用未来 12 小时（4 个时段）的降水概率代替
 */
export function PrecipitationCard({ forecast }: PrecipitationCardProps) {
  const nextSlots = forecast.list.slice(0, 4);
  if (nextSlots.length === 0) return null;

  const maxPop = Math.max(...nextSlots.map((item) => item.pop ?? 0));
  const text =
    maxPop < 0.2
      ? '未来 12 小时内降水概率较低。'
      : `未来 12 小时内降水概率最高 ${Math.round(maxPop * 100)}%。`;

  return (
    <section className="rounded-2xl bg-white/15 p-4 backdrop-blur-sm">
      <h3 className="text-sm text-white/85">🌧 降雨预报</h3>
      <p className="mt-2 text-white">{text}</p>
    </section>
  );
}
