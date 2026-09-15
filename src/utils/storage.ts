/**
 * LocalStorage 工具函数
 * 所有读写都做容错处理，失败时不抛出异常、不影响主流程
 */

/** 从 LocalStorage 读取 JSON 数据，失败时返回默认值 */
export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    // 数据损坏、隐私模式禁用存储等情况
    return fallback;
  }
}

/** 把数据以 JSON 形式写入 LocalStorage，失败时静默忽略 */
export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 存储配额满、隐私模式禁用存储等情况，静默失败
  }
}
