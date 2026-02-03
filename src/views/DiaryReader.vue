<template>
  <div class="diary-reader">
    <!-- 顶部操作栏 -->
    <header class="diary-reader__header">
      <div class="header-left">
        <InkButton
          text="返回"
          icon="←"
          icon-position="left"
          variant="ghost"
          size="small"
          @click="goBack"
        />
        <!-- 上一篇/下一篇导航 -->
        <div class="header-nav">
          <button 
            class="nav-btn" 
            :disabled="!prevDiary"
            @click="goToPrev"
            title="上一篇"
          >
            ‹
          </button>
          <button 
            class="nav-btn" 
            :disabled="!nextDiary"
            @click="goToNext"
            title="下一篇"
          >
            ›
          </button>
        </div>
      </div>
      
      <div class="header-center">
        <h1 class="diary-title">{{ diary?.title || '加载中...' }}</h1>
        <div v-if="diary" class="diary-meta">
          <span class="meta-item">
            {{ formatChineseDate(diary.createTime) }}
          </span>
          <span v-if="diary.moodIcon" class="meta-item mood">
            <span class="mood-icon">{{ diary.moodIcon }}</span>
            <span v-if="diary.mood" class="mood-text">{{ diary.mood }}</span>
          </span>
        </div>
        <!-- 标签展示 -->
        <div v-if="diary?.tags?.length" class="diary-tags">
          <span v-for="tag in diary.tags" :key="tag" class="diary-tag">{{ tag }}</span>
        </div>
      </div>
      
      <div class="header-right">
        <InkButton
          text="编辑"
          icon="✎"
          variant="ghost"
          size="small"
          @click="editDiary"
        />
        <InkButton
          text="删除"
          icon="🗑"
          variant="ghost"
          size="small"
          @click="confirmDelete"
        />
      </div>
    </header>
    
    <!-- 墨迹分隔线 -->
    <div class="ink-divider-ink"></div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="diary-reader__loading">
      <div class="loading-ink">
        <div class="ink-drop"></div>
        <p>正在载入...</p>
      </div>
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="error" class="diary-reader__error">
      <div class="error-content">
        <span class="error-icon">📜</span>
        <h3>{{ error }}</h3>
        <InkButton text="返回列表" @click="goBack" />
      </div>
    </div>
    
    <!-- 日记内容渲染区 -->
    <div v-else-if="diary" class="diary-reader__content">
      <SandboxRenderer
        :html-content="diary.htmlContent"
        :title="diary.title"
        :show-security-notice="true"
        height="calc(100vh - 140px)"
      />
    </div>
    
    <!-- 删除确认对话框 -->
    <div v-if="showDeleteConfirm" class="delete-dialog-overlay" @click.self="cancelDelete">
      <div class="delete-dialog">
        <h3>确认删除</h3>
        <p>此操作不可恢复，是否确认删除这篇日记？</p>
        <div class="dialog-actions">
          <InkButton text="取消" variant="ghost" @click="cancelDelete" />
          <InkButton text="确认删除" variant="primary" @click="doDelete" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getDiary, deleteDiary, getAllDiaries, formatChineseDate } from '../modules/db.js'
import SandboxRenderer from '../components/SandboxRenderer.vue'
import InkButton from '../components/InkButton.vue'

/**
 * DiaryReader - 日记阅读视图
 * 
 * 功能：
 * - 在 iframe 沙盒中安全渲染日记 HTML 内容
 * - 提供编辑、删除操作入口
 * - 支持上一篇/下一篇导航
 */

const route = useRoute()
const router = useRouter()

// 响应式状态
const diary = ref(null)
const loading = ref(true)
const error = ref('')
const showDeleteConfirm = ref(false)
const allDiaries = ref([])

// 上一篇/下一篇
const prevDiary = computed(() => {
  if (!diary.value || allDiaries.value.length === 0) return null
  const currentIndex = allDiaries.value.findIndex(d => d.id === diary.value.id)
  if (currentIndex > 0) {
    return allDiaries.value[currentIndex - 1]
  }
  return null
})

const nextDiary = computed(() => {
  if (!diary.value || allDiaries.value.length === 0) return null
  const currentIndex = allDiaries.value.findIndex(d => d.id === diary.value.id)
  if (currentIndex < allDiaries.value.length - 1) {
    return allDiaries.value[currentIndex + 1]
  }
  return null
})

// 闲章文字列表
const sealTexts = [
  '过眼云烟',
  '如是观',
  '浮生若梦',
  '岁月静好',
  '且听风吟',
  '一念花开',
  '云水禅心',
  '墨香留痕',
  '时光不语',
  '素心若雪'
]

// 随机闲章
const randomSeal = computed(() => {
  const index = Math.floor(Math.random() * sealTexts.length)
  return sealTexts[index]
})

// 加载日记
async function loadDiary() {
  const id = route.params.id
  if (!id) {
    error.value = '日记ID无效'
    loading.value = false
    return
  }

  try {
    loading.value = true
    const data = await getDiary(id)

    if (!data) {
      error.value = '日记不存在或已被删除'
    } else {
      diary.value = data
      console.log('[DiaryReader] 加载日记:', data.title)
    }
  } catch (err) {
    console.error('[DiaryReader] 加载日记失败:', err)
    error.value = '加载失败: ' + err.message
  } finally {
    loading.value = false
  }
}

// 加载所有日记（用于导航）
async function loadAllDiaries() {
  try {
    allDiaries.value = await getAllDiaries({
      sortBy: 'createTime',
      order: 'desc'
    })
  } catch (err) {
    console.error('[DiaryReader] 加载日记列表失败:', err)
  }
}

// 跳转到指定日记
function goToDiary(id) {
  if (id) {
    router.push(`/diary/${id}`)
  }
}

// 返回列表
function goBack() {
  router.push('/')
}

// 上一篇
function goToPrev() {
  if (prevDiary.value) {
    router.push(`/diary/${prevDiary.value.id}`)
  }
}

// 下一篇
function goToNext() {
  if (nextDiary.value) {
    router.push(`/diary/${nextDiary.value.id}`)
  }
}

// 编辑日记
function editDiary() {
  if (diary.value) {
    router.push(`/edit/${diary.value.id}`)
  }
}

// 确认删除
function confirmDelete() {
  showDeleteConfirm.value = true
}

// 取消删除
function cancelDelete() {
  showDeleteConfirm.value = false
}

// 执行删除
async function doDelete() {
  if (!diary.value) return
  
  try {
    await deleteDiary(diary.value.id)
    console.log('[DiaryReader] 日记已删除:', diary.value.id)
    router.push('/')
  } catch (err) {
    console.error('[DiaryReader] 删除失败:', err)
    alert('删除失败: ' + err.message)
    showDeleteConfirm.value = false
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadDiary()
  loadAllDiaries()
})

// 监听路由参数变化，当ID改变时重新加载日记
watch(() => route.params.id, (newId, oldId) => {
  if (newId && newId !== oldId) {
    loadDiary()
    // 滚动到顶部
    window.scrollTo(0, 0)
  }
})
</script>

<style scoped>
/* 阅读器容器 */
.diary-reader {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--ink-paper);
}

/* 顶部操作栏 */
.diary-reader__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background-color: var(--ink-paper);
  border-bottom: 1px solid var(--ink-rice);
}

.header-left {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.header-nav .nav-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid var(--ink-rice);
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.25rem;
  color: var(--ink-dark);
  transition: all 0.2s ease;
}

.header-nav .nav-btn:hover:not(:disabled) {
  border-color: var(--ink-ochre);
  background: rgba(139, 69, 19, 0.05);
}

.header-nav .nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.header-center {
  flex: 1;
  text-align: center;
  padding: 0 1rem;
}

.diary-title {
  font-family: "LXGW WenKai", serif;
  font-size: 1.5rem;
  font-weight: 400;
  color: var(--ink-dark);
  letter-spacing: 0.1em;
  margin-bottom: 0.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.diary-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-family: "LXGW WenKai", serif;
  font-size: 0.875rem;
  color: var(--ink-sandalwood);
}

.meta-item svg {
  opacity: 0.7;
}

.meta-item.mood {
  color: var(--ink-ochre);
}

.meta-item .mood-icon {
  font-size: 1rem;
}

.diary-tags {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.diary-tag {
  font-family: "LXGW WenKai", serif;
  font-size: 0.75rem;
  padding: 0.2rem 0.625rem;
  background: linear-gradient(135deg, rgba(139, 69, 19, 0.08) 0%, rgba(139, 69, 19, 0.04) 100%);
  color: var(--ink-ochre);
  border-radius: 12px;
  border: 1px solid rgba(139, 69, 19, 0.15);
}

.header-right {
  flex: 0 0 auto;
  display: flex;
  gap: 0.5rem;
}

/* 墨迹分隔线 */
.ink-divider-ink {
  height: 2px;
  background: linear-gradient(
    to right,
    transparent 0%,
    var(--ink-dark) 10%,
    var(--ink-dark) 30%,
    rgba(44, 62, 80, 0.2) 50%,
    transparent 100%
  );
}

/* 加载状态 */
.diary-reader__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-height: 400px;
}

.loading-ink {
  text-align: center;
}

.ink-drop {
  width: 24px;
  height: 24px;
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
}

/* 错误状态 */
.diary-reader__error {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-height: 400px;
}

.error-content {
  text-align: center;
}

.error-icon {
  font-size: 4rem;
  display: block;
  margin-bottom: 1rem;
}

.error-content h3 {
  font-family: "LXGW WenKai", serif;
  font-size: 1.25rem;
  font-weight: 400;
  color: var(--ink-dark);
  margin-bottom: 1.5rem;
}

/* 内容渲染区 */
.diary-reader__content {
  flex: 1;
  padding: 1.5rem 2rem;
  overflow: auto;
}



/* 删除确认对话框 */
.delete-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(44, 62, 80, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.delete-dialog {
  background-color: var(--ink-paper);
  padding: 2rem;
  border-radius: 2px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  text-align: center;
  max-width: 360px;
  width: 90%;
}

.delete-dialog h3 {
  font-family: "LXGW WenKai", serif;
  font-size: 1.25rem;
  font-weight: 400;
  color: var(--ink-dark);
  margin-bottom: 1rem;
}

.delete-dialog p {
  font-family: "LXGW WenKai", serif;
  color: var(--ink-sandalwood);
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.dialog-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

/* 响应式 */
@media (max-width: 768px) {
  .diary-reader__header {
    flex-wrap: wrap;
    padding: 1rem;
    gap: 0.5rem;
  }
  
  .header-center {
    order: -1;
    width: 100%;
    padding: 0;
  }
  
  .diary-title {
    font-size: 1.25rem;
  }
  
  .header-right {
    width: 100%;
    justify-content: center;
  }
  
  .diary-reader__content {
    padding: 1rem;
  }
  
  .diary-reader__footer {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .header-right {
    flex-wrap: wrap;
  }
  
  .dialog-actions {
    flex-direction: column;
  }
}
</style>
