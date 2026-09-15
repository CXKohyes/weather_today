import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SearchBar } from './components/SearchBar';
import { CurrentWeather } from './components/CurrentWeather';
import { PrecipitationCard } from './components/PrecipitationCard';
import { HourlyForecast } from './components/HourlyForecast';
import { ForecastList } from './components/ForecastList';
import { WeatherDetails } from './components/WeatherDetails';
import { FavoriteCities } from './components/FavoriteCities';
import { PageDots } from './components/PageDots';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { useWeather } from './hooks/useWeather';
import { useGeolocation } from './hooks/useGeolocation';
import { useFavorites } from './hooks/useFavorites';
import { useAirQuality } from './hooks/useAirQuality';
import type { FavoriteCity } from './hooks/useFavorites';
import { groupForecastByDay } from './utils/forecast';

/** 轮播页数：当前天气 / 预报 / 详细数据 */
const PAGE_COUNT = 3;

/**
 * 应用根组件
 * 顶部为搜索与定位工具栏，主体是三页可滑动的天气信息
 */
function App() {
  const { current, forecast, cityName, loading, error, searchByCity, searchByCoords } = useWeather();
  const { coords, status: geoStatus, error: geoError, locate } = useGeolocation();
  const { favorites, isFavorite, toggleFavorite, removeFavorite } = useFavorites();
  // 空气质量为附加信息，失败时返回 null
  const airQuality = useAirQuality(current?.coord.lat, current?.coord.lon);
  // 记录已查询过的坐标，避免重复请求（如 StrictMode 下 effect 执行两次）
  const queriedCoordsRef = useRef<string | null>(null);
  // 横向轮播容器
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);

  // 打开页面时使用缓存的定位结果查询天气（不触发新的定位请求）
  useEffect(() => {
    if (!coords) return;
    const key = `${coords.lat.toFixed(3)},${coords.lon.toFixed(3)}`;
    if (queriedCoordsRef.current === key) return;
    queriedCoordsRef.current = key;
    void searchByCoords(coords.lat, coords.lon);
  }, [coords, searchByCoords]);

  // 查询到新城市后回到第一页
  useEffect(() => {
    scrollerRef.current?.scrollTo({ left: 0 });
    setPage(0);
  }, [current?.id]);

  /** 滑动时同步页码 */
  const handleScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setPage(Math.round(el.scrollLeft / el.clientWidth));
  }, []);

  /** 点击圆点切换页面 */
  const goToPage = useCallback((index: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: 'smooth' });
  }, []);

  // 是否处于“正在定位”阶段（定位中且还没有任何天气数据）
  const isLocating = geoStatus === 'locating' && !loading && !current;

  // 预报数据按天汇总（未来 5 天，不含今天）
  const daily = useMemo(() => (forecast ? groupForecastByDay(forecast, 5) : []), [forecast]);

  // 当前展示的城市名与收藏信息（中文名优先）
  const displayName = cityName ?? current?.name ?? '';
  const currentCity: FavoriteCity | null = current && displayName
    ? { id: current.id, name: displayName, country: current.country }
    : null;

  // 点击收藏城市 → 快速查询
  const handleSelectFavorite = (city: FavoriteCity) => {
    void searchByCity(city.name);
  };

  return (
    <div className="min-h-screen bg-[#58a6e8]">
      <div className="mx-auto w-full max-w-md px-4 pt-6 pb-8">
        {/* 顶部工具栏：搜索 + 定位 */}
        <div className="flex items-center gap-2">
          <SearchBar onSearch={searchByCity} disabled={loading} />
          <button
            type="button"
            onClick={locate}
            disabled={geoStatus === 'locating'}
            title="定位到当前位置"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/20 text-xl backdrop-blur-sm transition hover:bg-white/30 disabled:opacity-50"
          >
            📍
          </button>
        </div>

        {/* 定位失败提示（用户拒绝授权等情况） */}
        {geoStatus === 'error' && geoError && (
          <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-amber-400/25 px-4 py-2.5 backdrop-blur-sm">
            <p className="text-sm text-amber-50">📍 {geoError}</p>
            <button
              type="button"
              onClick={locate}
              className="shrink-0 rounded-full bg-white/20 px-3.5 py-1 text-sm text-white transition hover:bg-white/30"
            >
              重试
            </button>
          </div>
        )}

        {/* 收藏城市列表：点击快速查询，✕ 删除 */}
        <FavoriteCities
          favorites={favorites}
          onSelect={handleSelectFavorite}
          onRemove={removeFavorite}
        />

        {/* 内容区：加载中 / 错误提示 / 三页天气信息 / 初始引导 */}
        <div className="mt-4">
          {loading && <LoadingSpinner text="正在查询天气…" />}
          {!loading && isLocating && <LoadingSpinner text="正在获取您的位置…" />}
          {!loading && !isLocating && error && <ErrorMessage message={error} />}
          {!loading && !isLocating && !error && current && (
            <>
              {/* 横向滑动容器：每页占满宽度，支持滑动或点击圆点切换 */}
              <div
                ref={scrollerRef}
                onScroll={handleScroll}
                className="flex min-h-[max(30rem,calc(100vh-15rem))] snap-x snap-mandatory overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {/* 第一页：当前天气 */}
                <section className="flex w-full shrink-0 snap-center px-1">
                  <CurrentWeather
                    data={current}
                    name={displayName}
                    isFavorite={currentCity ? isFavorite(currentCity.id) : false}
                    onToggleFavorite={() => currentCity && toggleFavorite(currentCity)}
                    airQuality={airQuality}
                  />
                </section>

                {/* 第二页：降雨、每小时、多天预报 */}
                {forecast && (
                  <section className="w-full shrink-0 snap-center space-y-3 px-1">
                    <PrecipitationCard forecast={forecast} />
                    <HourlyForecast forecast={forecast} />
                    <ForecastList daily={daily} />
                  </section>
                )}

                {/* 第三页：详细数据 */}
                <section className="w-full shrink-0 snap-center px-1">
                  <WeatherDetails data={current} />
                </section>
              </div>

              <PageDots count={PAGE_COUNT} active={page} onChange={goToPage} />
            </>
          )}
          {!loading && !isLocating && !error && !current && (
            <div className="rounded-3xl bg-white/15 px-6 py-16 text-center text-white/75 backdrop-blur-sm">
              输入城市名称搜索，或点击右侧 📍 用当前位置查询
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
