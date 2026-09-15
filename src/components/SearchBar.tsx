import { useState } from 'react';
import type { FormEvent } from 'react';

interface SearchBarProps {
  /** 提交搜索时触发，参数为输入的城市名称（已去除首尾空格） */
  onSearch: (city: string) => void;
  /** 查询中禁用输入 */
  disabled?: boolean;
}

/**
 * 城市搜索框
 * 支持点击按钮或按回车提交
 */
export function SearchBar({ onSearch, disabled = false }: SearchBarProps) {
  const [value, setValue] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const city = value.trim();
    // 空输入不做任何事
    if (!city) return;
    onSearch(city);
  };

  return (
    <form onSubmit={handleSubmit} className="flex min-w-0 flex-1 gap-2">
      <input
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="搜索城市，如：上海、Tokyo"
        disabled={disabled}
        className="min-w-0 flex-1 rounded-full bg-white/20 px-5 py-2.5 text-white placeholder-white/60 outline-none backdrop-blur-sm transition focus:bg-white/30 disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={disabled}
        className="shrink-0 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-sky-600 transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        搜索
      </button>
    </form>
  );
}
