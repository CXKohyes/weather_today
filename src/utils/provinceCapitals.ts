/**
 * 中国省级行政区 → 省会城市映射
 * OpenWeatherMap 免费地理编码不支持省级行政区查询：
 * 如搜「四川」不会返回四川省，而是按拼音模糊匹配到甘肃的「司川」，
 * 因此遇到省份名时先映射到省会城市，再查询省会的天气
 */

const PROVINCE_CAPITALS: Record<string, string> = {
  北京: '北京',
  天津: '天津',
  上海: '上海',
  重庆: '重庆',
  河北: '石家庄',
  山西: '太原',
  辽宁: '沈阳',
  吉林: '长春',
  黑龙江: '哈尔滨',
  江苏: '南京',
  浙江: '杭州',
  安徽: '合肥',
  福建: '福州',
  江西: '南昌',
  山东: '济南',
  河南: '郑州',
  湖北: '武汉',
  湖南: '长沙',
  广东: '广州',
  海南: '海口',
  四川: '成都',
  贵州: '贵阳',
  云南: '昆明',
  陕西: '西安',
  甘肃: '兰州',
  青海: '西宁',
  台湾: '台北',
  内蒙古: '呼和浩特',
  广西: '南宁',
  西藏: '拉萨',
  宁夏: '银川',
  新疆: '乌鲁木齐',
  香港: '香港',
  澳门: '澳门',
};

/** 常见省级行政区后缀（长的在前，先匹配长后缀） */
const SUFFIXES = [
  '特别行政区',
  '维吾尔自治区',
  '壮族自治区',
  '回族自治区',
  '自治区',
  '省',
  '市',
];

/**
 * 把查询词解析为省会城市名（用于查询天气）
 * 如「四川」「四川省」→「成都」；「北京」「北京市」→「北京」
 * 不是省级行政区时返回 null
 */
export function resolveProvinceCapital(query: string): string | null {
  let name = query.trim();
  for (const suffix of SUFFIXES) {
    if (name.endsWith(suffix)) {
      name = name.slice(0, -suffix.length);
      break;
    }
  }
  return PROVINCE_CAPITALS[name] ?? null;
}
