/**
 * 开发辅助脚本：用无头 Chrome 截取应用页面，验证 UI 渲染
 * 用法：先启动带 --remote-debugging-port=9222 的 Chrome，再执行 node .dev-tools/screenshot.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const CDP_HTTP = 'http://127.0.0.1:9222';
const APP_URL = 'http://localhost:5173/';
const OUT_DIR = '.shots';

/** 等待 DevTools 端口就绪并返回页面 target */
async function waitForTarget() {
  for (let i = 0; i < 60; i += 1) {
    try {
      const res = await fetch(`${CDP_HTTP}/json/list`);
      const targets = await res.json();
      const page = targets.find((t) => t.type === 'page');
      if (page?.webSocketDebuggerUrl) return page;
    } catch {
      // 端口还没起来，继续重试
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('DevTools 端口未就绪');
}

/** 极简 CDP 客户端 */
class CDP {
  constructor(ws) {
    this.ws = ws;
    this.seq = 0;
    this.pending = new Map();
    this.events = [];
    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
      } else if (msg.method) {
        this.events.push(msg);
      }
    };
  }

  static async connect(url) {
    const ws = new WebSocket(url);
    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = (e) => reject(new Error(`WebSocket 连接失败: ${e.message ?? ''}`));
    });
    return new CDP(ws);
  }

  send(method, params = {}) {
    const id = ++this.seq;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const target = await waitForTarget();
const cdp = await CDP.connect(target.webSocketDebuggerUrl);
await cdp.send('Page.enable');
await cdp.send('Runtime.enable');
await cdp.send('Network.enable');

// 授权定位并注入上海坐标，模拟手机视口
await cdp.send('Browser.grantPermissions', {
  origin: 'http://localhost:5173',
  permissions: ['geolocation'],
});
await cdp.send('Emulation.setGeolocationOverride', {
  latitude: 31.2304,
  longitude: 121.4737,
  accuracy: 100,
});
await cdp.send('Emulation.setDeviceMetricsOverride', {
  width: 430,
  height: 932,
  deviceScaleFactor: 2,
  mobile: true,
});

await cdp.send('Page.navigate', { url: APP_URL });
// 确保目标页在前台渲染，否则截图会是空白
await cdp.send('Page.bringToFront');

/** 轮询等待页面渲染出搜索框并加载完天气数据 */
async function waitForReady(timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const { result } = await cdp.send('Runtime.evaluate', {
      expression: `(() => {
        const input = document.querySelector('input[type="text"]');
        const busy = !!document.querySelector('.animate-spin');
        return { ready: !!input && !busy, url: location.href, state: document.readyState };
      })()`,
      returnByValue: true,
    });
    if (result.value?.ready) return result.value;
    await sleep(500);
  }
  return { ready: false, url: '超时', state: '未知' };
}

console.log('页面状态:', JSON.stringify(await waitForReady()));
await sleep(1500); // 等待空气质量等附加请求返回

await mkdir(OUT_DIR, { recursive: true });

async function shot(name) {
  const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' });
  await writeFile(path.join(OUT_DIR, name), Buffer.from(data, 'base64'));
  console.log(`已保存 ${name}`);
}

/** 读取页面可见文本，便于判断数据是否加载成功 */
async function visibleText() {
  const { result } = await cdp.send('Runtime.evaluate', {
    expression: 'document.body.innerText',
    returnByValue: true,
  });
  return result.value ?? '';
}

console.log('--- 页面文本 ---');
console.log(await visibleText());

const failed = cdp.events
  .filter((e) => e.method === 'Network.loadingFailed')
  .map((e) => `${e.params.errorText} ${e.params.type}`);
console.log('--- 网络失败 ---');
console.log(failed.length ? failed.join('\n') : '无');

await shot('page1.png');

// 点击页面圆点切到第二、三页
for (const [index, name] of [[1, 'page2.png'], [2, 'page3.png']]) {
  await cdp.send('Runtime.evaluate', {
    expression: `document.querySelectorAll('[aria-label^="切换到第"]')[${index}]?.click()`,
  });
  await sleep(1500);
  await shot(name);
}

// 测试搜索中文城市名：验证 Geocoding → 经纬度 → 天气的完整链路
await cdp.send('Runtime.evaluate', {
  expression: `(() => {
    const input = document.querySelector('input[type="text"]');
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(input, '北京');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  })()`,
});
await sleep(6000);
console.log('--- 搜索「北京」后 ---');
console.log(await visibleText());
await shot('city-beijing.png');

process.exit(0);
