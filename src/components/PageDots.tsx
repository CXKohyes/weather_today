interface PageDotsProps {
  /** 总页数 */
  count: number;
  /** 当前页索引（从 0 开始） */
  active: number;
  /** 点击圆点时切换页面 */
  onChange: (index: number) => void;
}

/**
 * 页面指示器
 * 点击圆点可切换页面，当前页显示为长条
 */
export function PageDots({ count, active, onChange }: PageDotsProps) {
  return (
    <div className="mt-4 flex justify-center gap-2">
      {Array.from({ length: count }, (_, index) => (
        <button
          key={index}
          type="button"
          onClick={() => onChange(index)}
          aria-label={`切换到第 ${index + 1} 页`}
          className={`h-2 rounded-full transition-all ${
            index === active ? 'w-5 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
          }`}
        />
      ))}
    </div>
  );
}
