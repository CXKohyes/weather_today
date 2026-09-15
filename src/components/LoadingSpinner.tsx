interface LoadingSpinnerProps {
  /** 加载时的提示文字 */
  text?: string;
}

/**
 * 加载动画
 * 请求过程中展示，让用户知道正在查询
 */
export function LoadingSpinner({ text = '正在查询天气…' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/30 border-t-white" />
      <p className="text-white/80">{text}</p>
    </div>
  );
}
