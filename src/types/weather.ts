/**
 * 天气数据类型定义
 * 对应 OpenWeatherMap API 返回的 JSON 结构
 */

/** 天气状况 */
export interface WeatherCondition {
  /** 天气状况类别（如 Clear、Clouds、Rain、Snow） */
  main: string;
  /** 天气描述（lang=zh_cn 时返回中文，如 小雨） */
  description: string;
  /** 图标编号，用于拼接图标 URL */
  icon: string;
}

/** 天气主要数据 */
export interface WeatherMain {
  /** 当前温度（摄氏度） */
  temp: number;
  /** 体感温度（摄氏度） */
  feels_like: number;
  /** 最低温度（摄氏度） */
  temp_min: number;
  /** 最高温度（摄氏度） */
  temp_max: number;
  /** 湿度（%） */
  humidity: number;
  /** 气压（hPa） */
  pressure: number;
}

/** 风 */
export interface Wind {
  /** 风速（米/秒） */
  speed: number;
  /** 风向（度） */
  deg: number;
}

/** 当前天气响应（/weather 接口） */
export interface CurrentWeather {
  /** 城市 ID */
  id: number;
  /** 城市名称 */
  name: string;
  /** 国家代码（如 CN） */
  country: string;
  /** 经纬度（用于查询空气质量等接口） */
  coord: {
    lat: number;
    lon: number;
  };
  /** 天气状况数组 */
  weather: WeatherCondition[];
  /** 主要数据 */
  main: WeatherMain;
  /** 风 */
  wind: Wind;
  /** 能见度（米，最大 10000） */
  visibility: number;
  /** 云量 */
  clouds: {
    /** 云量百分比 */
    all: number;
  };
  /** 数据时间戳（秒） */
  dt: number;
  /** 时区偏移（秒） */
  timezone: number;
  /** 日出日落时间 */
  sys: {
    /** 日出时间戳（秒） */
    sunrise: number;
    /** 日落时间戳（秒） */
    sunset: number;
  };
}

/** 预报列表项（3 小时间隔） */
export interface ForecastItem {
  /** 预报时间戳（秒） */
  dt: number;
  /** 主要数据（含 temp_min/temp_max） */
  main: WeatherMain;
  /** 天气状况数组 */
  weather: WeatherCondition[];
  /** 降水概率（0-1） */
  pop?: number;
}

/** 天气预报响应（/forecast 接口，5 天 / 3 小时间隔） */
export interface Forecast {
  /** 城市信息 */
  city: {
    /** 城市名称 */
    name: string;
    /** 国家代码 */
    country: string;
    /** 时区偏移（秒） */
    timezone: number;
  };
  /** 预报列表（共 40 条，5 天 × 每天 8 条） */
  list: ForecastItem[];
}

/** 按天汇总后的预报（用于未来几天预报展示） */
export interface DailyForecast {
  /** 当地日期（对应 UTC 零点的时间戳，毫秒），仅用于展示日期 */
  date: number;
  /** 当天最低温度（摄氏度） */
  tempMin: number;
  /** 当天最高温度（摄氏度） */
  tempMax: number;
  /** 代表时段的天气图标编号（取当地正午附近的图标） */
  icon: string;
  /** 天气描述 */
  description: string;
}

/** 空气质量响应（/air_pollution 接口） */
export interface AirPollution {
  /** 数据列表（取第一项为当前值） */
  list: Array<{
    /** OpenWeatherMap 自有分级（1-5） */
    main: {
      aqi: number;
    };
    /** 各污染物浓度（µg/m³） */
    components: {
      /** PM2.5 浓度，用于换算 AQI */
      pm2_5: number;
      /** PM10 浓度 */
      pm10: number;
    };
  }>;
}

/** 地理编码响应（/geo/1.0/direct、/geo/1.0/reverse 接口） */
export interface GeocodingResult {
  /** 城市名称（英文） */
  name: string;
  /** 本地化名称表，如 { zh: '上海市' } */
  local_names?: Record<string, string>;
  /** 纬度 */
  lat: number;
  /** 经度 */
  lon: number;
  /** 国家代码 */
  country: string;
  /** 州/省 */
  state?: string;
}
