interface ErrorMessageProps {
  /** 友好的中文错误提示 */
  message: string;
}

/**
 * 错误提示
 * 展示查询失败的原因（城市不存在、网络错误等）
 */
export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="rounded-3xl bg-white/15 px-6 py-12 text-center backdrop-blur">
      <p className="text-5xl">⚠️</p>
      <p className="mt-4 text-lg font-medium text-white">{message}</p>
    </div>
  );
}
