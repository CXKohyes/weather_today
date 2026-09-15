# 技术设计

## 技术栈

- React + TypeScript + Vite
- Tailwind CSS
- OpenWeatherMap API（免费版）
- LocalStorage（收藏城市持久化）

## 项目结构

```
src/
  components/
    SearchBar.tsx         # 城市搜索框
    CurrentWeather.tsx    # 当前天气卡片
    ForecastList.tsx      # 未来几天预报列表
    FavoriteCities.tsx    # 收藏城市列表
    WeatherIcon.tsx       # 天气图标
    LoadingSpinner.tsx    # 加载动画
    ErrorMessage.tsx      # 错误提示
  hooks/
    useWeather.ts         # 天气数据获取 Hook
    useGeolocation.ts     # 自动定位 Hook
    useFavorites.ts       # 收藏城市管理 Hook
  services/
    weatherApi.ts         # OpenWeatherMap API 封装
  types/
    weather.ts            # 天气数据类型定义
  utils/
    storage.ts            # LocalStorage 工具函数
  App.tsx
  main.tsx
```

## API 设计

查询链路：城市名搜索时先走 Geocoding API 转为经纬度，再统一用经纬度查询天气接口。

### 地理编码：城市名 → 经纬度 + 本地化名称
GET `https://api.openweathermap.org/geo/1.0/direct?q={city}&limit=5&appid={API_KEY}`

### 反向地理编码：经纬度 → 城市（自动定位后用）
GET `https://api.openweathermap.org/geo/1.0/reverse?lat={lat}&lon={lon}&limit=1&appid={API_KEY}`

### 按经纬度查询当前天气
GET `https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}&units=metric&lang=zh_cn`

### 按经纬度查询未来 5 天预报（3 小时间隔）
GET `https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API_KEY}&units=metric&lang=zh_cn`

### 空气质量（AQI 展示用）
GET `https://api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lon}&appid={API_KEY}`

说明：
- `units=metric` 使用摄氏度、米/秒
- `lang=zh_cn` 只影响天气描述的中文化；城市名取 Geocoding 返回的 `local_names.zh`，无中文时回退为英文名
- 免费地理编码不支持省级行政区（如「四川」会按拼音误匹配到甘肃的「司川」）：查询时先经过本地「省份 → 省会」映射表（`src/utils/provinceCapitals.ts`），再按省会查询天气；并从结果中挑选与查询词最匹配的一项
- 5 天预报数据按天分组，取每天的最高/最低温度展示

## 错误处理

在 `weatherApi.ts` 中统一捕获错误并映射为友好的中文提示：

| 错误情况 | 检测方式 | 用户提示 |
| -------- | -------- | -------- |
| 城市不存在 | HTTP 404 | 未找到该城市，请检查城市名称 |
| API Key 无效 | HTTP 401 | 天气服务暂时不可用，请稍后再试 |
| 请求过于频繁 | HTTP 429 | 请求过于频繁，请稍后再试 |
| 网络错误 | fetch 抛出的网络异常 | 网络连接失败，请检查网络设置 |
| 其他错误 | 其他 HTTP 状态码 | 查询失败，请稍后再试 |

## API Key 安全

- 创建 `.env.local` 文件存放 API Key：`VITE_OPENWEATHER_API_KEY=你的key`
- 代码中通过 `import.meta.env.VITE_OPENWEATHER_API_KEY` 读取，禁止硬编码
- 在 `.gitignore` 中添加 `.env.local`，确保不会提交到 Git

## 数据管理

- 收藏城市列表保存在 LocalStorage，key 为 `favorite_cities`
- 数据结构：数组，元素为 `{ id, name, country }`
- 通过自定义 Hook `useFavorites` 统一读写，读取失败时容错为空列表
- 自动定位通过浏览器 Geolocation API 实现，失败时不阻塞主流程
