import { useCallback, useEffect, useState } from 'react';
import { loadFromStorage, saveToStorage } from '../utils/storage';

/** 收藏的城市 */
export interface FavoriteCity {
  /** 城市 ID（来自 OpenWeatherMap，唯一） */
  id: number;
  /** 城市名称 */
  name: string;
  /** 国家代码 */
  country: string;
}

/** LocalStorage 存储键名 */
const STORAGE_KEY = 'favorite_cities';

interface UseFavoritesResult {
  /** 收藏的城市列表 */
  favorites: FavoriteCity[];
  /** 判断城市是否已收藏 */
  isFavorite: (id: number) => boolean;
  /** 收藏 / 取消收藏（按城市 ID 去重） */
  toggleFavorite: (city: FavoriteCity) => void;
  /** 删除收藏 */
  removeFavorite: (id: number) => void;
}

/**
 * 城市收藏 Hook
 * 收藏列表持久化到 LocalStorage，读取失败时容错为空列表
 */
export function useFavorites(): UseFavoritesResult {
  // 惰性初始化：从 LocalStorage 读取，失败或损坏时容错为空列表
  const [favorites, setFavorites] = useState<FavoriteCity[]>(() =>
    loadFromStorage<FavoriteCity[]>(STORAGE_KEY, []),
  );

  // 收藏列表变化时自动写入 LocalStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEY, favorites);
  }, [favorites]);

  const isFavorite = useCallback(
    (id: number) => favorites.some((city) => city.id === id),
    [favorites],
  );

  const toggleFavorite = useCallback((city: FavoriteCity) => {
    setFavorites((prev) => {
      const exists = prev.some((item) => item.id === city.id);
      // 已收藏则移除，未收藏则加入
      return exists
        ? prev.filter((item) => item.id !== city.id)
        : [...prev, city];
    });
  }, []);

  const removeFavorite = useCallback((id: number) => {
    setFavorites((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return { favorites, isFavorite, toggleFavorite, removeFavorite };
}
