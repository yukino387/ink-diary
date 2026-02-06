<template>
  <div class="app" :class="{ 'night-mode': isNightMode }">
    <!-- 隐私协议弹窗 -->
    <PrivacyAgreement
      :show="showPrivacyAgreement"
      @accept="handlePrivacyAccept"
      @decline="handlePrivacyDecline"
    />
    
    <!-- 欢迎页面 -->
    <WelcomeGuide
      :show="showWelcomeGuide"
      @close="handleWelcomeClose"
    />
    
    <!-- 侧边导航栏 -->
    <nav class="app-nav" :class="{ 'nav-collapsed': navCollapsed }" v-if="!showPrivacyAgreement && !showWelcomeGuide">
      <!-- Logo 区域 -->
      <div class="nav-logo">
        <span class="logo-icon">📜</span>
        <span v-if="!navCollapsed" class="logo-text">墨记</span>
      </div>
      
      <!-- 墨迹分隔线 -->
      <div class="nav-ink-line"></div>
      
      <!-- 导航菜单 -->
      <ul 
        class="nav-menu" 
        ref="navMenuRef"
        :class="{ 'glass-moving': isGlassMoving }"
      >
        <!-- 浮动磨砂玻璃指示器 -->
        <div 
          class="glass-indicator"
          :style="glassIndicatorStyle"
        ></div>
        <li 
          v-for="(item, index) in navItems" 
          :key="item.path"
          class="nav-item"
          :class="{ active: currentRoute === item.path }"
          :data-index="index"
          ref="navItemsRef"
        >
          <router-link :to="item.path" class="nav-link">
            <span class="nav-icon">{{ item.icon }}</span>
            <span v-if="!navCollapsed" class="nav-label">{{ item.label }}</span>
          </router-link>
        </li>
      </ul>
      
      <!-- 底部印章 -->
      <div class="nav-footer">
        <div class="nav-seal">
          <span class="seal-char">记</span>
        </div>
      </div>
      
      <!-- 折叠按钮 -->
      <button 
        class="nav-toggle"
        :class="{ 'toggle-collapsed': navCollapsed }"
        @click="toggleNav"
      >
        <span>{{ navCollapsed ? '‹' : '›' }}</span>
      </button>
    </nav>
    
    <!-- 主内容区 -->
    <main class="app-main" v-if="!showPrivacyAgreement && !showWelcomeGuide">
      <!-- 顶部墨迹线 -->
      <div class="main-ink-line"></div>
      
      <!-- 路由视图 -->
      <div class="main-content">
        <router-view v-slot="{ Component, route }">
          <transition
            :name="transitionName"
            mode="out-in"
            @before-leave="onBeforeLeave"
            @after-enter="onAfterEnter"
          >
            <component :is="Component" :key="route.path" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getConfig, setConfig } from './modules/db.js'
import PrivacyAgreement from './components/PrivacyAgreement.vue'
import WelcomeGuide from './components/WelcomeGuide.vue'

/**
 * App.vue - 应用根组件
 *
 * 布局结构：
 * - 左侧固定导航栏（可折叠），包含 Logo 和菜单
 * - 右侧主内容区，通过路由切换显示不同页面
 *
 * 功能特性：
 * - 响应式侧边栏
 * - 夜读模式切换
 * - 页面切换动画
 * - 隐私协议确认
 * - 欢迎页面
 */

const route = useRoute()
const router = useRouter()

// 响应式状态
const navCollapsed = ref(false)
const isNightMode = ref(false)
const showPrivacyAgreement = ref(false)
const showWelcomeGuide = ref(false)

// 导航项引用
const navItemsRef = ref([])
const navMenuRef = ref(null)

// 当前选中的导航索引
const activeNavIndex = computed(() => {
  return navItems.findIndex(item => item.path === currentRoute.value)
})

// 滑块位置（响应式）
const glassTop = ref(0)
const glassHeight = ref(48)

// 滑块移动状态
const isGlassMoving = ref(false)
let glassMoveTimeout = null

// 更新滑块位置
async function updateGlassPosition() {
  // 标记滑块开始移动
  isGlassMoving.value = true

  // 清除之前的定时器
  clearTimeout(glassMoveTimeout)

  await nextTick()
  const index = activeNavIndex.value
  if (index === -1 || !navItemsRef.value[index]) {
    return
  }

  const activeItem = navItemsRef.value[index]
  glassTop.value = activeItem.offsetTop
  glassHeight.value = activeItem.offsetHeight

  // 动画结束后清除移动状态
  glassMoveTimeout = setTimeout(() => {
    isGlassMoving.value = false
  }, 450) // 略长于 transition 时间
}

// 磨砂玻璃指示器样式
const glassIndicatorStyle = computed(() => {
  const index = activeNavIndex.value
  if (index === -1) {
    return { opacity: 0 }
  }

  const isMobile = window.innerWidth <= 768

  if (isMobile) {
    // 移动端：水平布局，通过百分比定位
    const totalItems = navItems.length
    const itemPercent = 100 / totalItems
    const leftPercent = index * itemPercent

    return {
      opacity: 1,
      left: `${leftPercent}%`,
      transform: 'translateX(0)',
      transition: 'left 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease'
    }
  } else {
    // 桌面端：垂直布局，直接使用计算的位置
    return {
      opacity: 1,
      top: `${glassTop.value}px`,
      height: `${glassHeight.value}px`,
      transition: 'top 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), height 0.3s ease, opacity 0.3s ease'
    }
  }
})

// 监听折叠状态变化，更新位置
watch(navCollapsed, () => {
  // 等待过渡动画完成后更新位置
  setTimeout(updateGlassPosition, 350)
})

// 监听路由变化，更新滑块位置
watch(() => route.path, () => {
  // 等待DOM更新后计算位置
  setTimeout(updateGlassPosition, 50)
})



// 页面切换动画
const transitionName = ref('slide-fade')
const isNavigating = ref(false)

// 路由顺序映射（用于判断前进/后退）
const routeOrder = {
  '/': 1,
  '/create': 2,
  '/prompts': 3,
  '/console': 4,
  '/settings': 5
}

// 根据路由变化判断切换方向
watch(() => route.path, (newPath, oldPath) => {
  // 编辑和详情页面使用特殊动画
  if (newPath.startsWith('/diary/') || newPath.startsWith('/edit/') || 
      oldPath?.startsWith('/diary/') || oldPath?.startsWith('/edit/')) {
    transitionName.value = 'scale-fade'
    return
  }
  
  const newOrder = routeOrder[newPath] || 0
  const oldOrder = routeOrder[oldPath] || 0
  
  if (newOrder > oldOrder) {
    // 前进 - 从右向左滑入
    transitionName.value = 'slide-left'
  } else if (newOrder < oldOrder) {
    // 后退 - 从左向右滑入
    transitionName.value = 'slide-right'
  } else {
    // 同级切换 - 使用淡入淡出
    transitionName.value = 'fade'
  }
})

// 过渡动画钩子
function onBeforeLeave() {
  isNavigating.value = true
}

function onAfterEnter() {
  isNavigating.value = false
}

// 导航菜单项
const navItems = [
  { path: '/', label: '日记阁', icon: '📚' },
  { path: '/create', label: '新建', icon: '✍️' },
  { path: '/prompts', label: '提示词', icon: '🤖' },
  { path: '/console', label: '控制台', icon: '🖥️' },
  { path: '/settings', label: '设置', icon: '⚙️' }
]

// 当前路由
const currentRoute = computed(() => route.path)

// 切换导航栏折叠状态
function toggleNav() {
  navCollapsed.value = !navCollapsed.value
  // 保存用户偏好
  localStorage.setItem('navCollapsed', navCollapsed.value)
}

// 检查隐私协议
async function checkPrivacyAgreement() {
  const hasAgreed = await getConfig('privacyAgreementAgreed', false)
  if (!hasAgreed) {
    showPrivacyAgreement.value = true
  }
}

// 处理隐私协议同意
async function handlePrivacyAccept() {
  await setConfig('privacyAgreementAgreed', true)
  showPrivacyAgreement.value = false
  console.log('[App] 用户已同意隐私协议')
  // 隐私协议同意后，检查是否需要显示欢迎页面
  await checkWelcomeGuide()
}

// 检查欢迎页面
async function checkWelcomeGuide() {
  const hasSeenWelcome = await getConfig('welcomeGuideSeen', false)
  const dontShowAgain = await getConfig('welcomeGuideDontShowAgain', false)
  if (!hasSeenWelcome && !dontShowAgain) {
    showWelcomeGuide.value = true
  }
}

// 处理欢迎页面关闭
async function handleWelcomeClose(dontShowAgain) {
  showWelcomeGuide.value = false
  await setConfig('welcomeGuideSeen', true)
  if (dontShowAgain) {
    await setConfig('welcomeGuideDontShowAgain', true)
  }
  console.log('[App] 用户已关闭欢迎页面')
}

// 处理隐私协议拒绝
function handlePrivacyDecline() {
  // 关闭应用或显示无法使用的提示
  alert('您必须同意隐私协议才能使用墨记应用。\n\n感谢您的理解，应用即将关闭。')
  // 尝试关闭窗口（在浏览器环境中可能无效）
  window.close()
  // 如果无法关闭，显示提示
  setTimeout(() => {
    document.body.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        background: #fefcf5;
        font-family: 'LXGW WenKai', serif;
        padding: 2rem;
        text-align: center;
      ">
        <div style="font-size: 4rem; margin-bottom: 1rem;">📜</div>
        <h1 style="color: #2c3e50; margin-bottom: 1rem;">无法使用墨记</h1>
        <p style="color: #8b4513; max-width: 400px; line-height: 1.8;">
          您选择不同意隐私协议与用户须知。<br>
          根据协议要求，我们无法为您提供服务。<br><br>
          如需使用，请刷新页面并同意协议。
        </p>
      </div>
    `
  }, 100)
}

// 加载用户偏好设置
async function loadPreferences() {
  // 恢复导航栏状态
  const savedNavState = localStorage.getItem('navCollapsed')
  if (savedNavState !== null) {
    navCollapsed.value = savedNavState === 'true'
  }
  
  // 夜读模式
  const darkMode = await getConfig('darkMode', false)
  isNightMode.value = darkMode
  if (darkMode) {
    document.body.classList.add('night-mode')
  }
}

// 监听路由变化更新标题
watch(() => route.path, (newPath) => {
  const item = navItems.find(i => i.path === newPath)
  if (item) {
    document.title = `墨记 - ${item.label}`
  } else if (newPath.startsWith('/diary/')) {
    document.title = '墨记 - 阅读日记'
  } else if (newPath.startsWith('/edit/')) {
    document.title = '墨记 - 编辑日记'
  }
})

// 处理显示欢迎页面事件
function handleShowWelcomeGuideEvent() {
  showWelcomeGuide.value = true
}

// 组件挂载时初始化
onMounted(() => {
  checkPrivacyAgreement()
  loadPreferences()
  // 监听显示欢迎页面事件
  window.addEventListener('show-welcome-guide', handleShowWelcomeGuideEvent)
  // Service Worker 已在 index.html 中注册，避免重复注册

  // 初始化滑块位置
  setTimeout(updateGlassPosition, 100)
})

// 组件卸载时清理
onUnmounted(() => {
  window.removeEventListener('show-welcome-guide', handleShowWelcomeGuideEvent)
})
</script>

<style>
/* 应用根容器 */
.app {
  display: flex;
  min-height: 100vh;
  background-color: var(--ink-paper);
}

/* ========================================
   侧边导航栏
   ======================================== */

.app-nav {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 200px;
  background-color: var(--ink-hover);
  border-right: 1px solid var(--ink-rice);
  display: flex;
  flex-direction: column;
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 100;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.06);
  will-change: width, box-shadow;
}

.app-nav.nav-collapsed {
  width: 84px;
  box-shadow: 1px 0 4px rgba(0, 0, 0, 0.04);
}

/* Logo 区域 */
.nav-logo {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.75rem;
  padding: 1.5rem 1.25rem;
  border-bottom: 1px solid var(--ink-rice);
  min-height: 80px;
}

/* 折叠状态下 Logo 居中 */
.app-nav.nav-collapsed .nav-logo {
  justify-content: center;
  padding: 1.5rem 0.5rem;
}

.logo-icon {
  font-size: 1.75rem;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  will-change: transform;
}

.app-nav.nav-collapsed .logo-icon {
  transform: rotate(360deg) scale(1.15);
}

.logo-text {
  font-family: "LXGW WenKai", serif;
  font-size: 1.5rem;
  font-weight: 400;
  color: var(--ink-dark);
  letter-spacing: 0.15em;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  will-change: transform, opacity;
  white-space: nowrap;
}

.app-nav.nav-collapsed .logo-text {
  opacity: 0;
  transform: translateX(20px);
}

/* 墨迹分隔线 */
.nav-ink-line {
  height: 2px;
  background: linear-gradient(
    to right,
    transparent 0%,
    var(--ink-dark) 20%,
    var(--ink-dark) 60%,
    transparent 100%
  );
  margin: 0 1rem;
  opacity: 0.3;
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  will-change: opacity, transform, margin;
}

.app-nav.nav-collapsed .nav-ink-line {
  opacity: 0.15;
  margin: 0 0.5rem;
  transform: scaleX(0.8);
}

/* 墨迹分隔线流动动画 */
.nav-ink-line {
  position: relative;
  overflow: hidden;
}

.nav-ink-line::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.4) 50%,
    transparent 100%
  );
  animation: inkFlow 4s ease-in-out infinite;
}

@keyframes inkFlow {
  0%, 100% {
    left: -100%;
  }
  50% {
    left: 100%;
  }
}

/* 导航菜单 */
.nav-menu {
  list-style: none;
  padding: 1rem 0;
  flex: 1;
  position: relative;
}

/* 滑块移动时的导航菜单效果 - 增强模糊 */
.nav-menu.glass-moving .nav-item:not(.active) {
  filter: blur(4px);
  opacity: 0.5;
  transition: filter 0.15s ease, opacity 0.1s ease;
}

/* 保持滑块下方的导航项清晰 */
.nav-menu.glass-moving .nav-item.active {
  filter: blur(0);
  opacity: 1;
  transition: filter 0.05s ease, opacity 0.05s ease;
}

/* 浮动磨砂玻璃指示器 - 增强立体玻璃效果 */
.glass-indicator {
  position: absolute;
  left: 0.75rem;
  right: 0.75rem;
  /* 多层渐变营造玻璃深度感和立体感 */
  background:
    /* 顶部强烈高光 */
    linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.9) 0%,
      rgba(255, 255, 255, 0.5) 15%,
      rgba(255, 255, 255, 0.1) 40%,
      transparent 60%
    ),
    /* 主体渐变 */
    linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.5) 0%,
      rgba(255, 255, 255, 0.2) 40%,
      rgba(139, 69, 19, 0.08) 100%
    ),
    /* 底部暗部 */
    linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.03) 0%,
      transparent 20%
    );
  /* 增强模糊效果 + 色差滤镜 */
  backdrop-filter: blur(0.5px) saturate(200%);
  -webkit-backdrop-filter: blur(1px) saturate(200%);
  /* RGB色差偏移效果 */
  filter: drop-shadow(1px 0 0 rgba(255, 0, 0, 0.15)) drop-shadow(-1px 0 0 rgba(0, 255, 255, 0.15));
  /* 3D立体边框 */
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-top: 1px solid rgba(255, 255, 255, 0.8);
  border-bottom: 1px solid rgba(139, 69, 19, 0.15);
  border-radius: 10px;
  /* 多层阴影营造3D立体感 */
  box-shadow:
    /* 顶部高光边缘 */
    inset 0 1px 0 rgba(255, 255, 255, 0.9),
    /* 内部柔和光 */
    inset 0 0 20px rgba(255, 255, 255, 0.3),
    /* 底部暗部 */
    inset 0 -2px 4px rgba(139, 69, 19, 0.08),
    /* 外发光 */
    0 0 0 1px rgba(255, 255, 255, 0.3),
    /* 主阴影 - 模拟玻璃厚度 */
    0 6px 20px rgba(139, 69, 19, 0.15),
    /* 底部阴影 */
    0 4px 8px rgba(0, 0, 0, 0.08),
    /* 顶部反光 */
    0 -2px 6px rgba(255, 255, 255, 0.5);
  pointer-events: none;
  z-index: 100;
  opacity: 0;
  will-change: top, height, opacity;
  /* 轻微3D倾斜效果 */
  transform-style: preserve-3d;
}

/* 玻璃指示器外发光和厚度效果 */
.glass-indicator::before {
  content: '';
  position: absolute;
  inset: -4px;
  background:
    /* 边缘高光 */
    linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.4) 0%,
      transparent 30%,
      transparent 70%,
      rgba(139, 69, 19, 0.1) 100%
    );
  border-radius: 14px;
  z-index: -1;
  opacity: 0.8;
  filter: blur(3px);
}

/* 玻璃指示器内部立体光泽 */
.glass-indicator::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 8%;
  right: 8%;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 1) 30%,
    rgba(255, 255, 255, 0.9) 50%,
    rgba(255, 255, 255, 1) 70%,
    transparent 100%
  );
  border-radius: 2px;
  box-shadow:
    0 0 4px rgba(255, 255, 255, 0.8),
    0 0 8px rgba(255, 255, 255, 0.4);
}

/* 折叠状态下的玻璃指示器 */
.app-nav.nav-collapsed .glass-indicator {
  left: 0.5rem;
  right: 0.5rem;
  border-radius: 12px;
}

.app-nav.nav-collapsed .glass-indicator::before {
  border-radius: 15px;
}

.app-nav.nav-collapsed .glass-indicator::after {
  left: 15%;
  right: 15%;
}

.nav-item {
  position: relative;
  margin: 0.25rem 0.75rem;
  border-radius: 8px;
  z-index: 1;
}

/* 选中状态 - 仅文字颜色变化，其他效果由磨砂玻璃滑块提供 */
.nav-item.active .nav-link {
  color: var(--ink-ochre);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.875rem 1rem;
  text-decoration: none;
  color: var(--ink-dark);
  border-radius: 8px;
  position: relative;
}

/* 折叠状态下导航链接居中 */
.app-nav.nav-collapsed .nav-link {
  justify-content: center;
  padding: 0.875rem 0.5rem;
}

.nav-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  will-change: transform, width, height, font-size;
  position: relative;
}

/* 折叠状态下图标尺寸 */
.app-nav.nav-collapsed .nav-icon {
  width: 36px;
  height: 36px;
  font-size: 1.5rem;
}

.nav-label {
  font-family: "LXGW WenKai", serif;
  font-size: 1rem;
  letter-spacing: 0.05em;
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  will-change: transform, opacity;
  white-space: nowrap;
}

.app-nav.nav-collapsed .nav-label {
  opacity: 0;
  transform: translateX(10px);
}

/* 导航项交错动画 */
.nav-item {
  opacity: 1;
  transform: translateX(0);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.app-nav.nav-collapsed .nav-item {
  transform: translateX(0);
}

.app-nav:not(.nav-collapsed) .nav-item:nth-child(1) { transition-delay: 0ms; }
.app-nav:not(.nav-collapsed) .nav-item:nth-child(2) { transition-delay: 30ms; }
.app-nav:not(.nav-collapsed) .nav-item:nth-child(3) { transition-delay: 60ms; }
.app-nav:not(.nav-collapsed) .nav-item:nth-child(4) { transition-delay: 90ms; }
.app-nav:not(.nav-collapsed) .nav-item:nth-child(5) { transition-delay: 120ms; }

/* 底部印章 */
.nav-footer {
  padding: 1.5rem;
  display: flex;
  justify-content: center;
}

.nav-seal {
  width: 40px;
  height: 40px;
  border: 2px solid var(--ink-ochre);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.6;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  cursor: pointer;
  will-change: transform, opacity, border-color;
}

.nav-seal:hover {
  opacity: 1;
  transform: scale(0.92);
  border-color: var(--ink-sandalwood);
  box-shadow: 0 0 12px rgba(139, 69, 19, 0.2);
}

.nav-seal:active {
  transform: scale(0.88);
}

.seal-char {
  font-family: "LXGW WenKai", serif;
  font-size: 1.25rem;
  color: var(--ink-ochre);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  will-change: transform;
}

.nav-seal:hover .seal-char {
  color: var(--ink-sandalwood);
  transform: scale(1.1);
}

/* 折叠时印章旋转动画 */
.app-nav.nav-collapsed .nav-seal {
  transform: rotate(0deg);
}

.app-nav:not(.nav-collapsed) .nav-seal {
  animation: sealUnfold 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes sealUnfold {
  0% {
    transform: rotate(-10deg) scale(0.9);
    opacity: 0.4;
  }
  50% {
    transform: rotate(5deg) scale(1.05);
  }
  100% {
    transform: rotate(0deg) scale(1);
    opacity: 0.6;
  }
}

/* 折叠按钮 */
/* 折叠切换按钮 - 极简圆形设计 */
.nav-toggle {
  position: absolute;
  right: -16px;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  background: linear-gradient(
    180deg,
    #ffffff 0%,
    #f8f6f3 100%
  );
  border: 1px solid rgba(139, 69, 19, 0.1);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ink-sandalwood);
  transition: all 0.2s ease;
  box-shadow:
    0 2px 6px rgba(0, 0, 0, 0.04),
    0 4px 12px rgba(139, 69, 19, 0.04);
  will-change: transform, box-shadow;
  z-index: 10;
}

.nav-toggle:hover {
  background: #ffffff;
  color: var(--ink-ochre);
  border-color: rgba(139, 69, 19, 0.15);
  transform: translateY(-50%) scale(1.05);
  box-shadow:
    0 3px 8px rgba(0, 0, 0, 0.06),
    0 6px 16px rgba(139, 69, 19, 0.06);
}

.nav-toggle:active {
  transform: translateY(-50%) scale(0.97);
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.04),
    0 2px 6px rgba(139, 69, 19, 0.04);
}

/* 箭头图标容器 */
.nav-toggle span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 2;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  will-change: transform;
  font-weight: 600;
  font-size: 1rem;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.8);
}

/* 折叠状态 - 箭头指向左侧（展开导航） */
.nav-toggle.toggle-collapsed span {
  transform: translateX(-1px);
}

/* 展开状态 - 箭头指向右侧（折叠导航） */
.nav-toggle:not(.toggle-collapsed) span {
  transform: translateX(1px);
}

/* ========================================
   主内容区
   ======================================== */

.app-main {
  flex: 1;
  margin-left: 200px;
  min-height: 100vh;
  background-color: var(--ink-paper);
  transition: margin-left 0.3s ease;
}

.app-nav.nav-collapsed + .app-main {
  margin-left: 84px;
}

/* 顶部墨迹线 */
.main-ink-line {
  height: 3px;
  background: linear-gradient(
    to right,
    var(--ink-dark) 0%,
    var(--ink-dark) 30%,
    rgba(44, 62, 80, 0.3) 50%,
    transparent 80%
  );
  opacity: 0.2;
}

/* 内容区域 */
.main-content {
  min-height: calc(100vh - 3px);
}

/* ========================================
   页面切换动画 - 优化版
   ======================================== */

/* 
 * 缓动曲线说明：
 * --ease-smooth: 通用平滑曲线，适合大多数过渡
 * --ease-enter: 进入动画，带有轻微回弹
 * --ease-leave: 离开动画，快速淡出
 * --ease-ink: 墨迹效果，先慢后快再慢
 */

/* 基础淡入淡出 - 带模糊效果 */
.fade-enter-active {
  transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform, opacity, filter;
}

.fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 1, 1);
  will-change: transform, opacity, filter;
}

.fade-enter-from {
  opacity: 0;
  filter: blur(12px);
  transform: scale(0.98);
}

.fade-enter-to {
  opacity: 1;
  filter: blur(0);
  transform: scale(1);
}

.fade-leave-from {
  opacity: 1;
  filter: blur(0);
  transform: scale(1);
}

.fade-leave-to {
  opacity: 0;
  filter: blur(8px);
  transform: scale(1.02);
}

/* 向左滑动 - 前进 - 优化曲线和模糊 */
.slide-left-enter-active {
  transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform, opacity, filter;
}

.slide-left-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform, opacity, filter;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(40px);
  filter: blur(10px);
}

.slide-left-enter-to {
  opacity: 1;
  transform: translateX(0);
  filter: blur(0);
}

.slide-left-leave-from {
  opacity: 1;
  transform: translateX(0);
  filter: blur(0);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-50px);
  filter: blur(6px);
}

/* 向右滑动 - 后退 - 优化曲线和模糊 */
.slide-right-enter-active {
  transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform, opacity, filter;
}

.slide-right-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform, opacity, filter;
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-40px);
  filter: blur(10px);
}

.slide-right-enter-to {
  opacity: 1;
  transform: translateX(0);
  filter: blur(0);
}

.slide-right-leave-from {
  opacity: 1;
  transform: translateX(0);
  filter: blur(0);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(50px);
  filter: blur(6px);
}

/* 缩放淡入 - 用于详情/编辑页面 - 弹性效果 */
.scale-fade-enter-active {
  transition: all 0.55s cubic-bezier(0.34, 1.8, 0.64, 1);
  will-change: transform, opacity, filter;
}

.scale-fade-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform, opacity, filter;
}

.scale-fade-enter-from {
  opacity: 0;
  transform: scale(0.92) translateY(20px);
  filter: blur(16px);
}

.scale-fade-enter-to {
  opacity: 1;
  transform: scale(1) translateY(0);
  filter: blur(0);
}

.scale-fade-leave-from {
  opacity: 1;
  transform: scale(1) translateY(0);
  filter: blur(0);
}

.scale-fade-leave-to {
  opacity: 0;
  transform: scale(0.96) translateY(-15px);
  filter: blur(10px);
}

/* 墨迹晕染效果 - 特色动画 - 深度优化 */
.ink-spread-enter-active {
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform, opacity, filter;
}

.ink-spread-leave-active {
  transition: all 0.5s cubic-bezier(0.7, 0, 0.84, 0);
  will-change: transform, opacity, filter;
}

.ink-spread-enter-from {
  opacity: 0;
  transform: scale(0.85);
  filter: blur(20px) brightness(1.2);
}

.ink-spread-enter-to {
  opacity: 1;
  transform: scale(1);
  filter: blur(0) brightness(1);
}

.ink-spread-leave-from {
  opacity: 1;
  transform: scale(1);
  filter: blur(0) brightness(1);
}

.ink-spread-leave-to {
  opacity: 0;
  transform: scale(1.08);
  filter: blur(12px) brightness(0.9);
}

/* 页面内容容器优化 - 添加阴影过渡 */
.main-content > * {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  transform-style: preserve-3d;
}

/* 导航期间防止内容闪烁 */
.main-content {
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
}

/* 动画期间添加微妙阴影增强层次感 */
[class*="-enter-active"],
[class*="-leave-active"] {
  box-shadow: 0 0 0 rgba(0, 0, 0, 0);
  z-index: 200;
}

/* 性能优化：减少动画期间的绘制区域 */
[class*="-enter-from"],
[class*="-leave-to"] {
  pointer-events: none;
  z-index: 200;
}

/* ========================================
   响应式布局
   ======================================== */

@media (max-width: 768px) {
  .app-nav {
    width: 100%;
    height: auto;
    position: fixed;
    bottom: 0;
    top: auto;
    flex-direction: row;
    border-right: none;
    border-top: 1px solid var(--ink-rice);
    z-index: 100;
  }

  .app-nav.nav-collapsed {
    width: 100%;
  }

  .nav-logo,
  .nav-ink-line,
  .nav-footer,
  .nav-toggle {
    display: none;
  }

  .nav-menu {
    display: flex;
    justify-content: space-around;
    width: 100%;
    padding: 0.5rem 0;
    position: relative;
  }

  .nav-item {
    flex: 1;
    margin: 0 0.25rem;
    display: flex;
    justify-content: center;
  }

  /* 移动端磨砂玻璃滑块 - 水平布局 */
  .glass-indicator {
    width: 20%; /* 5个选项，每个20% */
    height: 100%;
    top: 0;
    border-radius: 12px;
    transform: none;
    transition: left 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;
  }

  .nav-link {
    flex-direction: column;
    padding: 0.5rem;
    gap: 0.25rem;
    justify-content: center;
    align-items: center;
  }

  .nav-icon {
    font-size: 1.5rem;
  }

  .nav-label {
    font-size: 0.75rem;
  }

  .app-main {
    margin-left: 0;
    margin-bottom: 70px;
  }

  .app-nav.nav-collapsed + .app-main {
    margin-left: 0;
  }
}

@media (max-width: 480px) {
  .nav-label {
    display: none;
  }
  
  .app-main {
    margin-bottom: 60px;
  }
}
</style>
