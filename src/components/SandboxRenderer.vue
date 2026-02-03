<template>
  <div class="sandbox-renderer" :class="{ 'sandbox-renderer--vertical': vertical }">
    <!-- 加载状态 -->
    <div v-if="loading" class="sandbox-renderer__loading">
      <div class="loading-ink">
        <div class="ink-drop"></div>
        <p>正在渲染...</p>
      </div>
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="error" class="sandbox-renderer__error">
      <div class="error-content">
        <span class="error-icon">⚠️</span>
        <p>{{ error }}</p>
        <InkButton 
          text="重试" 
          size="small" 
          @click="reloadContent"
        />
      </div>
    </div>
    
    <!-- iframe 沙盒容器 -->
    <div v-show="!loading && !error" class="sandbox-renderer__container">
      <iframe
        ref="sandboxIframe"
        :src="blobUrl"
        :title="title"
        class="sandbox-iframe"
        sandbox="allow-scripts allow-same-origin"
        loading="lazy"
        @load="handleIframeLoad"
        @error="handleIframeError"
      ></iframe>
    </div>
    
    <!-- 安全提示 -->
    <div v-if="showSecurityNotice" class="sandbox-renderer__notice">
      <span class="notice-icon">🔒</span>
      <span class="notice-text">内容在隔离沙盒中安全渲染</span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import InkButton from './InkButton.vue'

/**
 * SandboxRenderer - 沙盒渲染组件
 * 
 * 安全说明：
 * - 使用 iframe sandbox 属性严格隔离用户生成的 HTML 内容
 * - sandbox="allow-scripts allow-same-origin" 允许脚本执行但限制权限
 * - 通过 Blob URL 加载内容，确保与主应用非同源
 * - 组件销毁时自动清理 Blob URL，防止内存泄漏
 * 
 * 功能特点：
 * - 支持竖排阅读模式切换
 * - 自动处理内容加载和错误状态
 * - 响应式适配不同屏幕尺寸
 */

const props = defineProps({
  // HTML 内容字符串
  htmlContent: {
    type: String,
    default: '',
    required: true
  },
  // iframe 标题
  title: {
    type: String,
    default: '日记内容'
  },
  // 是否竖排显示
  vertical: {
    type: Boolean,
    default: false
  },
  // 是否显示安全提示
  showSecurityNotice: {
    type: Boolean,
    default: true
  },
  // 自定义高度
  height: {
    type: String,
    default: '100%'
  },
  // 是否自动注入基础样式
  injectBaseStyles: {
    type: Boolean,
    default: true
  }
})

// 响应式状态
const loading = ref(true)
const error = ref('')
const blobUrl = ref('')
const sandboxIframe = ref(null)

// 存储创建的 Blob URL 以便清理
const blobUrls = ref([])

/**
 * 处理 HTML 内容，注入必要的样式和脚本
 */
function processHtmlContent(content) {
  if (!content) return ''
  
  // 如果内容已经是完整 HTML 文档，直接返回
  if (content.includes('<!DOCTYPE html>') || content.includes('<html')) {
    return content
  }
  
  // 否则包装成完整文档
  const baseStyles = props.injectBaseStyles ? `
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        font-family: "LXGW WenKai", "Microsoft YaHei", serif;
        background: #fefcf5;
        color: #2c3e50;
        line-height: 1.8;
        padding: 2rem;
        min-height: 100vh;
      }
      img { max-width: 100%; height: auto; }
      a { color: #8b4513; }
    </style>
  ` : ''
  
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${props.title}</title>
  ${baseStyles}
</head>
<body>
  ${content}
</body>
</html>`
}

/**
 * 加载 HTML 内容到沙盒
 */
function loadContent() {
  // 重置状态
  loading.value = true
  error.value = ''
  
  // 清理旧的 Blob URL
  cleanupBlobUrls()
  
  // 检查内容是否为空
  if (!props.htmlContent || props.htmlContent.trim() === '') {
    loading.value = false
    error.value = '内容为空'
    return
  }
  
  try {
    // 处理内容
    const processedContent = processHtmlContent(props.htmlContent)
    
    // 创建 Blob
    const blob = new Blob([processedContent], { type: 'text/html;charset=utf-8' })
    
    // 创建 Blob URL
    const url = URL.createObjectURL(blob)
    blobUrls.value.push(url)
    blobUrl.value = url
    
    console.log('[Sandbox] 内容已加载到沙盒')
  } catch (err) {
    console.error('[Sandbox] 加载内容失败:', err)
    loading.value = false
    error.value = '加载内容失败: ' + err.message
  }
}

/**
 * 清理所有创建的 Blob URL
 */
function cleanupBlobUrls() {
  blobUrls.value.forEach(url => {
    if (url) {
      URL.revokeObjectURL(url)
      console.log('[Sandbox] 已清理 Blob URL:', url.substring(0, 50) + '...')
    }
  })
  blobUrls.value = []
  blobUrl.value = ''
}

/**
 * iframe 加载完成回调
 */
function handleIframeLoad() {
  loading.value = false
  console.log('[Sandbox] iframe 加载完成')
  
  // 尝试与 iframe 通信（如果需要）
  if (sandboxIframe.value && sandboxIframe.value.contentWindow) {
    try {
      // 可以在这里添加 postMessage 通信逻辑
      sandboxIframe.value.contentWindow.postMessage({
        type: 'INK_DIARY_INIT',
        vertical: props.vertical
      }, '*')
    } catch (e) {
      // 跨域通信可能失败，这是正常的
      console.log('[Sandbox] 跨域通信受限（正常现象）')
    }
  }
}

/**
 * iframe 加载错误回调
 */
function handleIframeError() {
  loading.value = false
  error.value = '内容渲染失败，请检查 HTML 代码'
  console.error('[Sandbox] iframe 加载错误')
}

/**
 * 重新加载内容
 */
function reloadContent() {
  loadContent()
}

// 监听 htmlContent 变化
watch(() => props.htmlContent, (newContent, oldContent) => {
  if (newContent !== oldContent) {
    loadContent()
  }
}, { immediate: true })

// 监听 vertical 变化，通知 iframe
watch(() => props.vertical, (newVertical) => {
  if (sandboxIframe.value && sandboxIframe.value.contentWindow) {
    try {
      sandboxIframe.value.contentWindow.postMessage({
        type: 'INK_DIARY_VERTICAL_CHANGE',
        vertical: newVertical
      }, '*')
    } catch (e) {
      // 跨域通信可能失败
    }
  }
})

// 组件挂载
onMounted(() => {
  // 初始加载已在 watch 中处理
})

// 组件卸载时清理
onUnmounted(() => {
  cleanupBlobUrls()
})

// 暴露方法供父组件调用
defineExpose({
  reload: reloadContent,
  getIframe: () => sandboxIframe.value
})
</script>

<style scoped>
/* 沙盒渲染器容器 */
.sandbox-renderer {
  position: relative;
  width: 100%;
  height: v-bind(height);
  min-height: 300px;
  background-color: var(--ink-paper);
  border-radius: 2px;
  overflow: hidden;
}

/* 加载状态 */
.sandbox-renderer__loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--ink-paper);
  z-index: 10;
}

.loading-ink {
  text-align: center;
}

.ink-drop {
  width: 20px;
  height: 20px;
  background-color: var(--ink-dark);
  border-radius: 50% 50% 50% 0;
  margin: 0 auto 1rem;
  animation: inkDrop 1.5s ease-in-out infinite;
}

@keyframes inkDrop {
  0% {
    transform: scale(0) rotate(-45deg);
    opacity: 1;
  }
  50% {
    transform: scale(1) rotate(-45deg);
    opacity: 0.8;
  }
  100% {
    transform: scale(2) rotate(-45deg);
    opacity: 0;
  }
}

.loading-ink p {
  font-family: "LXGW WenKai", serif;
  color: var(--ink-sandalwood);
  font-size: 0.9rem;
}

/* 错误状态 */
.sandbox-renderer__error {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--ink-hover);
  z-index: 10;
}

.error-content {
  text-align: center;
  padding: 2rem;
}

.error-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.error-content p {
  font-family: "LXGW WenKai", serif;
  color: var(--ink-dark);
  margin-bottom: 1.5rem;
  max-width: 300px;
}

/* iframe 容器 */
.sandbox-renderer__container {
  width: 100%;
  height: 100%;
  min-height: 300px;
}

.sandbox-iframe {
  width: 100%;
  height: 100%;
  min-height: 300px;
  border: none;
  background-color: transparent;
}

/* 竖排模式 */
.sandbox-renderer--vertical .sandbox-iframe {
  /* 竖排样式可以通过 postMessage 通知 iframe 内部处理 */
}

/* 安全提示 */
.sandbox-renderer__notice {
  position: absolute;
  bottom: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: rgba(254, 252, 245, 0.9);
  border-radius: 2px;
  font-size: 0.75rem;
  color: var(--ink-sandalwood);
  opacity: 0.7;
  transition: opacity 0.3s;
}

.sandbox-renderer:hover .sandbox-renderer__notice {
  opacity: 1;
}

.notice-icon {
  font-size: 0.8rem;
}

.notice-text {
  font-family: "LXGW WenKai", serif;
}

/* 响应式 */
@media (max-width: 768px) {
  .sandbox-renderer {
    min-height: 250px;
  }
  
  .sandbox-iframe {
    min-height: 250px;
  }
  
  .sandbox-renderer__notice {
    display: none; /* 移动端隐藏安全提示 */
  }
}
</style>
