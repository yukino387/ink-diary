/**
 * ¨©?? - ????????? (main.js)
 * 
 * ????? Vue 3 ????????¡¤?????????
 */

import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'

import App from './App.vue'

// ??????????
import './assets/styles/global.css'

// ??????????
import DiaryList from './views/DiaryList.vue'
import DiaryReader from './views/DiaryReader.vue'
import DiaryEditor from './views/DiaryEditor.vue'
import PromptSettings from './views/PromptSettings.vue'
import Settings from './views/Settings.vue'

// ========================================
// ¡¤??????
// ========================================

const routes = [
  {
    path: '/',
    name: 'DiaryList',
    component: DiaryList,
    meta: {
      title: '????',
      icon: '?'
    }
  },
  {
    path: '/create',
    name: 'DiaryCreate',
    component: DiaryEditor,
    meta: {
      title: '??????',
      icon: '??'
    }
  },
  {
    path: '/edit/:id',
    name: 'DiaryEdit',
    component: DiaryEditor,
    meta: {
      title: '?????',
      icon: '?'
    }
  },
  {
    path: '/diary/:id',
    name: 'DiaryReader',
    component: DiaryReader,
    meta: {
      title: '??????',
      icon: '?'
    }
  },
  {
    path: '/prompts',
    name: 'PromptSettings',
    component: PromptSettings,
    meta: {
      title: '?????',
      icon: '?'
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: {
      title: '????',
      icon: '??'
    }
  },
  // 404 ?????
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  // ???????
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// ¡¤?????? - ??????????
router.beforeEach((to, from, next) => {
  const title = to.meta.title
  if (title) {
    document.title = `¨©?? - ${title}`
  }
  next()
})

// ========================================
// Pinia ??????
// ========================================

const pinia = createPinia()

// ========================================
// ??????????
// ========================================

const app = createApp(App)

// ??¨°??
app.use(router)
app.use(pinia)

// ????????
app.config.errorHandler = (err, instance, info) => {
  console.error('[App] ??????:', err)
  console.error('[App] ???????:', info)
}

// ???????
app.mount('#app')

console.log('[App] ¨©???????????')
console.log('[App] ?·Ú: 3.0.0')
console.log('[App] ?????: Vue 3 + Vite + Tailwind CSS')
