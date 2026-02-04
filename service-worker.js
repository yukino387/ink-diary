/**
 * 墨记 - Service Worker
 * 实现PWA离线缓存策略
 * 
 * 缓存策略说明：
 * - 静态资源：Cache First（优先从缓存读取，回退到网络）
 * - API请求：Network First（优先从网络获取，失败时回退到缓存）
 * - 字体文件：Cache First（长期缓存）
 */

const CACHE_NAME = 'ink-diary-v3-1'
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/main.js',
  '/src/App.vue'
]

// 安装事件：预缓存核心静态资源
self.addEventListener('install', (event) => {
  console.log('[Service Worker] 安装中...')
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] 缓存核心资源')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('[Service Worker] 跳过等待，立即激活')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('[Service Worker] 预缓存失败:', error)
      })
  )
})

// 激活事件：清理旧版本缓存
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] 激活中...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('[Service Worker] 删除旧缓存:', name)
              return caches.delete(name)
            })
        )
      })
      .then(() => {
        console.log('[Service Worker] 控制客户端')
        return self.clients.claim()
      })
  )
})

// 获取事件：拦截请求并应用缓存策略
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // 跳过非GET请求和chrome扩展程序
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return
  }
  
  // 策略1：字体文件 - Cache First（长期缓存）
  if (url.hostname.includes('fonts.googleapis.com') || 
      url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(cacheFirst(request, 'google-fonts-cache'))
    return
  }
  
  // 策略2：静态资源（JS/CSS/图片）- Cache First
  if (request.destination === 'script' || 
      request.destination === 'style' || 
      request.destination === 'image' ||
      request.destination === 'font') {
    event.respondWith(cacheFirst(request, CACHE_NAME))
    return
  }
  
  // 策略3：HTML页面 - Network First（确保获取最新版本）
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(networkFirst(request, CACHE_NAME))
    return
  }
  
  // 默认策略：Stale While Revalidate
  event.respondWith(staleWhileRevalidate(request, CACHE_NAME))
})

/**
 * Cache First 策略
 * 优先从缓存获取，未命中则从网络获取并缓存
 */
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cachedResponse = await cache.match(request)
  
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.error('[Service Worker] 网络请求失败:', error)
    // 返回离线页面或错误响应
    return new Response('离线模式 - 资源暂不可用', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' }
    })
  }
}

/**
 * Network First 策略
 * 优先从网络获取，失败时回退到缓存
 */
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.log('[Service Worker] 网络失败，尝试缓存:', request.url)
    const cachedResponse = await cache.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    // 返回简单的离线页面
    return new Response(`
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>墨记 - 离线模式</title>
        <style>
          body {
            font-family: "LXGW WenKai", "Microsoft YaHei", sans-serif;
            background: #fefcf5;
            color: #2c3e50;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
            text-align: center;
          }
          h1 { font-size: 2rem; margin-bottom: 1rem; }
          p { font-size: 1.1rem; color: #666; }
          .icon { font-size: 4rem; margin-bottom: 1rem; }
        </style>
      </head>
      <body>
        <div class="icon">📜</div>
        <h1>当前处于离线状态</h1>
        <p>请检查网络连接</p>
        <p>墨记会保留您的日记，待联网后同步</p>
      </body>
      </html>
    `, {
      status: 200,
      headers: { 'Content-Type': 'text/html;charset=UTF-8' }
    })
  }
}

/**
 * Stale While Revalidate 策略
 * 立即返回缓存（如有），同时在后台更新缓存
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cachedResponse = await cache.match(request)
  
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone())
      }
      return networkResponse
    })
    .catch((error) => {
      console.log('[Service Worker] 后台更新失败:', error)
    })
  
  // 返回缓存，如无缓存则等待网络请求
  return cachedResponse || fetchPromise
}

// 消息处理：响应应用的指令
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting()
  }
  
  if (event.data.type === 'CACHE_NEW_DIARY') {
    // 可以在这里处理新日记的缓存逻辑
    console.log('[Service Worker] 收到新日记通知')
  }
})

// 后台同步：在重新联网时执行同步操作
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-diaries') {
    console.log('[Service Worker] 执行日记同步')
    // 在这里实现后台同步逻辑
  }
})

console.log('[Service Worker] 脚本已加载')
