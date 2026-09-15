import type { FavoriteCity } from '../hooks/useFavorites';

interface FavoriteCitiesProps {
  /** 收藏的城市列表 */
  favorites: FavoriteCity[];
  /** 点击收藏城市时触发（快速查询） */
  onSelect: (city: FavoriteCity) => void;
  /** 点击删除按钮时触发 */
  onRemove: (id: number) => void;
}

/**
 * 收藏城市列表
 * 以标签形式展示，点击城市名快速查询，点击 ✕ 删除收藏
 */
export function FavoriteCities({ favorites, onSelect, onRemove }: FavoriteCitiesProps) {
  // 没有收藏时不渲染，保持界面简洁
  if (favorites.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <span className="text-xs text-white/70">收藏</span>
      {favorites.map((city) => (
        <div
          key={city.id}
          className="flex items-center overflow-hidden rounded-full bg-white/15 backdrop-blur-sm transition hover:bg-white/25"
        >
          {/* 点击城市名快速查询 */}
          <button
            type="button"
            onClick={() => onSelect(city)}
            title={`查询 ${city.name}`}
            className="px-3.5 py-1 text-sm text-white"
          >
            {city.name}
          </button>
          {/* 删除收藏 */}
          <button
            type="button"
            onClick={() => onRemove(city.id)}
            title="删除收藏"
            className="pr-2.5 pl-0.5 text-white/60 transition hover:text-white"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
