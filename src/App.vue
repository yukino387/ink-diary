<template>
  <div class="app" :class="{ 'night-mode': isNightMode }">
    <!-- 侧边导航栏 -->
    <nav class="app-nav" :class="{ 'nav-collapsed': navCollapsed }">
      <!-- Logo 区域 -->
      <div class="nav-logo">
        <span class="logo-icon">📜</span>
        <span v-if="!navCollapsed" class="logo-text">墨记</span>
      </div>
      
      <!-- 墨迹分隔线 -->
      <div class="nav-ink-line"></div>
      
      <!-- 导航菜单 -->
      <ul class="nav-menu">
        <li 
          v-for="item in navItems" 
          :key="item.path"
          class="nav-item"
          :class="{ active: currentRoute === item.path }"
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
        <span>{{ navCollapsed ? '›' : '‹' }}</span>
      </button>
    </nav>
    
    <!-- 主内容区 -->
    <main class="app-main">
      <!-- 顶部墨迹线 -->
      <div class="main-ink-line"></div>
      
      <!-- 路由视图 -->
      <div class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getConfig } from './modules/db.js'

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
 */

const route = useRoute()

// 响应式状态
const navCollapsed = ref(false)
const isNightMode = ref(false)

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

// 组件挂载时初始化
onMounted(() => {
  loadPreferences()
  // Service Worker 已在 index.html 中注册，避免重复注册
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
  transition: width 0.3s ease;
  z-index: 100;
}

.app-nav.nav-collapsed {
  width: 64px;
}

/* Logo 区域 */
.nav-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1.5rem 1rem;
  border-bottom: 1px solid var(--ink-rice);
}

.logo-icon {
  font-size: 1.75rem;
  flex-shrink: 0;
}

.logo-text {
  font-family: "LXGW WenKai", serif;
  font-size: 1.5rem;
  font-weight: 400;
  color: var(--ink-dark);
  letter-spacing: 0.15em;
  transition: opacity 0.3s;
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
}

/* 导航菜单 */
.nav-menu {
  list-style: none;
  padding: 1rem 0;
  flex: 1;
}

.nav-item {
  position: relative;
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background-color: var(--ink-ochre);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 1rem 1.5rem;
  text-decoration: none;
  color: var(--ink-dark);
  transition: all 0.3s ease;
}

.nav-link:hover,
.nav-item.active .nav-link {
  background-color: var(--ink-paper);
  color: var(--ink-ochre);
}

.nav-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
  width: 24px;
  text-align: center;
}

.nav-label {
  font-family: "LXGW WenKai", serif;
  font-size: 1rem;
  letter-spacing: 0.05em;
  transition: opacity 0.3s;
}

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
}

.seal-char {
  font-family: "LXGW WenKai", serif;
  font-size: 1.25rem;
  color: var(--ink-ochre);
}

/* 折叠按钮 */
.nav-toggle {
  position: absolute;
  right: -12px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 48px;
  background-color: var(--ink-paper);
  border: 1px solid var(--ink-rice);
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  color: var(--ink-sandalwood);
  transition: all 0.3s ease;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.05);
}

.nav-toggle:hover {
  background-color: var(--ink-hover);
  color: var(--ink-ochre);
}

.nav-toggle.toggle-collapsed {
  border-radius: 4px 0 0 4px;
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
  margin-left: 64px;
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
   页面切换动画
   ======================================== */

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
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
  }
  
  .nav-item {
    flex: 1;
  }
  
  .nav-item.active::before {
    display: none;
  }
  
  .nav-link {
    flex-direction: column;
    padding: 0.5rem;
    gap: 0.25rem;
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
