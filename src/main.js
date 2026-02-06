/**
 * 墨记 - 主入口文件 (main.js)
 *
 * 初始化 Vue 3 应用，配置路由和状态管理
 */

import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'

import App from './App.vue'

// 导入全局样式
import './assets/styles/global.css'

// 导入页面组件
import DiaryList from './views/DiaryList.vue'
import DiaryReader from './views/DiaryReader.vue'
import DiaryEditor from './views/DiaryEditor.vue'
import PromptSettings from './views/PromptSettings.vue'
import Settings from './views/Settings.vue'
import AIConsole from './views/AIConsole.vue'

// ========================================
// 路由配置
// ========================================

const routes = [
  {
    path: '/',
    name: 'DiaryList',
    component: DiaryList,
    meta: {
      title: '日记阁',
      icon: '?'
    }
  },
  {
    path: '/create',
    name: 'DiaryCreate',
    component: DiaryEditor,
    meta: {
      title: '新建日记',
      icon: '??'
    }
  },
  {
    path: '/edit/:id',
    name: 'DiaryEdit',
    component: DiaryEditor,
    meta: {
      title: '编辑日记',
      icon: '?'
    }
  },
  {
    path: '/diary/:id',
    name: 'DiaryReader',
    component: DiaryReader,
    meta: {
      title: '阅读日记',
      icon: '?'
    }
  },
  {
    path: '/prompts',
    name: 'PromptSettings',
    component: PromptSettings,
    meta: {
      title: '提示词',
      icon: '?'
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: {
      title: '设置',
      icon: '⚙️'
    }
  },
  {
    path: '/console',
    name: 'AIConsole',
    component: AIConsole,
    meta: {
      title: '控制台',
      icon: '🖥️'
    }
  },
  // 404 重定向
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  // 滚动行为
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 路由守卫 - 更新页面标题
router.beforeEach((to, from, next) => {
  const title = to.meta.title
  if (title) {
    document.title = `墨记 - ${title}`
  }
  next()
})

// ========================================
// Pinia 状态管理
// ========================================

const pinia = createPinia()

// ========================================
// 创建并挂载应用
// ========================================

const app = createApp(App)

// 使用插件
app.use(router)
app.use(pinia)

// 全局错误处理
app.config.errorHandler = (err, instance, info) => {
  console.error('[App] 发生错误:', err)
  console.error('[App] 错误信息:', info)
}

// 挂载应用
app.mount('#app')

console.log('[App] 墨记应用已启动')
console.log('[App] 版本: 3.0.0')
console.log('[App] 技术栈: Vue 3 + Vite + Tailwind CSS')
