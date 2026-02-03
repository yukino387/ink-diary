<template>
  <div class="diary-list">
    <!-- 页面标题栏 -->
    <header class="diary-list__header">
      <h1 class="page-title">日记阁</h1>
      <p class="page-subtitle">
        共 {{ filteredDiaries.length }} 篇
        <span v-if="activeFiltersCount > 0">（筛选中）</span>
        <span v-else>· 记录时光流转</span>
      </p>
    </header>
    
    <!-- 搜索与筛选栏 -->
    <div class="diary-list__filters">
      <!-- 搜索框 -->
      <div class="search-box">
        <span class="search-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索标题、内容、标签..."
          class="search-input"
          @input="handleSearch"
        />
        <button 
          v-if="searchQuery" 
          class="search-clear" 
          @click="clearSearch"
          title="清除搜索"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6 6 18"></path>
            <path d="m6 6 12 12"></path>
          </svg>
        </button>
      </div>
      
      <!-- 筛选器按钮组 -->
      <div class="filter-buttons">
        <button 
          class="filter-btn"
          :class="{ active: showTagFilter }"
          @click="showTagFilter = !showTagFilter; showMoodFilter = false; showDateFilter = false"
        >
          <span class="filter-icon">🏷️</span>
          <span class="filter-text">标签</span>
          <span v-if="selectedTag" class="filter-badge">1</span>
        </button>
        <button 
          class="filter-btn"
          :class="{ active: showMoodFilter }"
          @click="showMoodFilter = !showMoodFilter; showTagFilter = false; showDateFilter = false"
        >
          <span class="filter-icon">😊</span>
          <span class="filter-text">心情</span>
          <span v-if="selectedMood" class="filter-badge">1</span>
        </button>
        <button 
          class="filter-btn"
          :class="{ active: showDateFilter }"
          @click="showDateFilter = !showDateFilter; showTagFilter = false; showMoodFilter = false"
        >
          <span class="filter-icon">📅</span>
          <span class="filter-text">日期</span>
          <span v-if="dateRange.start || dateRange.end" class="filter-badge">1</span>
        </button>
        <button 
          v-if="activeFiltersCount > 0"
          class="filter-btn clear-all"
          @click="clearAllFilters"
        >
          <span class="filter-icon">✕</span>
          <span class="filter-text">清除</span>
        </button>
      </div>
      
      <!-- 标签筛选面板 -->
      <div v-if="showTagFilter" class="filter-panel">
        <div class="filter-panel-header">
          <span>选择标签</span>
          <button class="close-btn" @click="showTagFilter = false">?</button>
        </div>
        <div class="filter-options">
          <button
            v-for="tagInfo in allTags"
            :key="tagInfo.tag"
            :class="['filter-option', { active: selectedTag === tagInfo.tag }]"
            @click="selectTag(tagInfo.tag)"
          >
            <span class="option-name">{{ tagInfo.tag }}</span>
            <span class="option-count">{{ tagInfo.count }}</span>
          </button>
          <p v-if="allTags.length === 0" class="filter-empty">
            暂无标签数据
          </p>
        </div>
      </div>
      
      <!-- 心情筛选面板 -->
      <div v-if="showMoodFilter" class="filter-panel">
        <div class="filter-panel-header">
          <span>选择心情</span>
          <button class="close-btn" @click="showMoodFilter = false">?</button>
        </div>
        <div class="filter-options mood-options">
          <button
            v-for="moodInfo in allMoods"
            :key="moodInfo.mood"
            :class="['filter-option mood-option', { active: selectedMood === moodInfo.mood }]"
            @click="selectMood(moodInfo.mood)"
          >
            <span class="mood-icon">{{ moodInfo.moodIcon }}</span>
            <span class="option-name">{{ moodInfo.mood }}</span>
            <span class="option-count">{{ moodInfo.count }}</span>
          </button>
          <p v-if="allMoods.length === 0" class="filter-empty">
            暂无心情数据
          </p>
        </div>
      </div>
      
      <!-- 日期筛选面板 -->
      <div v-if="showDateFilter" class="filter-panel">
        <div class="filter-panel-header">
          <span>选择日期范围</span>
          <button class="close-btn" @click="showDateFilter = false">?</button>
        </div>
        <div class="date-range-inputs">
          <div class="date-input-group">
            <label>开始日期</label>
            <input
              v-model="dateRange.start"
              type="date"
              class="date-input"
              @change="applyDateFilter"
            />
          </div>
          <span class="date-separator">至</span>
          <div class="date-input-group">
            <label>结束日期</label>
            <input
              v-model="dateRange.end"
              type="date"
              class="date-input"
              @change="applyDateFilter"
            />
          </div>
        </div>
        <div class="date-presets">
          <button class="preset-btn" @click="setDatePreset('today')">今天</button>
          <button class="preset-btn" @click="setDatePreset('week')">本周</button>
          <button class="preset-btn" @click="setDatePreset('month')">本月</button>
          <button class="preset-btn" @click="setDatePreset('year')">今年</button>
        </div>
      </div>
      
      <!-- 排序选项 -->
      <div class="sort-options">
        <InkButton
          text="最新"
          size="small"
          :variant="sortBy === 'createTime' ? 'primary' : 'ghost'"
          @click="setSort('createTime')"
        />
        <InkButton
          text="标题"
          size="small"
          :variant="sortBy === 'title' ? 'primary' : 'ghost'"
          @click="setSort('title')"
        />
        <InkButton
          text="更新"
          size="small"
          :variant="sortBy === 'updateTime' ? 'primary' : 'ghost'"
          @click="setSort('updateTime')"
        />
      </div>
    </div>
    
    <!-- 已选筛选条件展示 -->
    <div v-if="activeFiltersCount > 0" class="active-filters">
      <span class="active-filters-label">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
        </svg>
        已选筛选
      </span>
      <span v-if="selectedTag" class="active-filter-tag">
        <span class="tag-icon">🏷️</span>
        <span class="tag-text">{{ selectedTag }}</span>
        <button @click="selectedTag = ''; applyFilters()" title="移除">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <path d="M18 6 6 18"></path>
            <path d="m6 6 12 12"></path>
          </svg>
        </button>
      </span>
      <span v-if="selectedMood" class="active-filter-tag">
        <span class="tag-icon">😊</span>
        <span class="tag-text">{{ selectedMood }}</span>
        <button @click="selectedMood = ''; applyFilters()" title="移除">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <path d="M18 6 6 18"></path>
            <path d="m6 6 12 12"></path>
          </svg>
        </button>
      </span>
      <span v-if="dateRange.start || dateRange.end" class="active-filter-tag">
        <span class="tag-icon">📅</span>
        <span class="tag-text">{{ dateRange.start || '开始' }} ~ {{ dateRange.end || '现在' }}</span>
        <button @click="clearDateFilter" title="移除">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <path d="M18 6 6 18"></path>
            <path d="m6 6 12 12"></path>
          </svg>
        </button>
      </span>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="diary-list__loading">
      <div class="loading-ink">
        <div class="ink-drop"></div>
        <p>正在载入...</p>
      </div>
    </div>
    
    <!-- 空状态 -->
    <div v-else-if="filteredDiaries.length === 0" class="diary-list__empty">
      <div class="empty-content">
        <div class="empty-illustration">
          <span class="empty-icon">📜</span>
          <div class="empty-ink-wash"></div>
        </div>
        <h3>{{ hasFilters ? '未找到匹配的日记' : '日记阁空空如也' }}</h3>
        <p>{{ hasFilters ? '尝试调整筛选条件' : '点击左侧"新建"开始您的第一篇章' }}</p>
        <InkButton
          v-if="!hasFilters"
          text="立即创作"
          variant="primary"
          icon="✍️"
          @click="goToCreate"
        />
        <InkButton
          v-else
          text="清除筛选"
          variant="primary"
          @click="clearAllFilters"
        />
      </div>
    </div>
    
    <!-- 日记列表 -->
    <div v-else class="diary-list__grid">
      <PaperCard
        v-for="diary in filteredDiaries"
        :key="diary.id"
        :title="diary.title"
        :date="formatChineseDate(diary.createTime)"
        :excerpt="diary.summary || getExcerpt(diary.htmlContent)"
        :mood="diary.mood"
        :mood-icon="diary.moodIcon"
        :tags="diary.tags"
        :show-seal="true"
        :seal-text="getSealText(diary)"
        :seal-filled="isRecent(diary.createTime)"
        :vertical="false"
        :hoverable="true"
        :clickable="true"
        height="260px"
        @click="viewDiary(diary.id)"
      />
    </div>
    
    <!-- 底部信息 -->
    <footer v-if="filteredDiaries.length > 0" class="diary-list__footer">
      <p class="footer-text">
        {{ hasFilters ? `筛选结果：${filteredDiaries.length} 篇` : `已展示全部 ${diaries.length} 篇日记` }}
      </p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  getAllDiaries, 
  searchDiaries, 
  searchDiariesByTag,
  searchDiariesByMood,
  searchDiariesByDateRange,
  getAllTags,
  getAllMoods,
  formatChineseDate 
} from '../modules/db.js'
import PaperCard from '../components/PaperCard.vue'
import InkButton from '../components/InkButton.vue'

/**
 * DiaryList - 日记列表视图
 * 
 * 功能：
 * - 展示所有日记的卡片列表
 * - 支持按标题、日期、内容、标签、摘要搜索
 * - 支持按标签、心情、日期范围筛选
 * - 支持按创建时间、更新时间、标题排序
 * - 显示日记缩略信息、心情图标、标签和印章装饰
 */

const router = useRouter()

// 响应式状态
const diaries = ref([])
const loading = ref(true)
const searchQuery = ref('')
const sortBy = ref('createTime')
const sortOrder = ref('desc')

// 筛选状态
const showTagFilter = ref(false)
const showMoodFilter = ref(false)
const showDateFilter = ref(false)
const selectedTag = ref('')
const selectedMood = ref('')
const dateRange = ref({ start: '', end: '' })
const allTags = ref([])
const allMoods = ref([])

// 防抖定时器
let searchTimeout = null

// 计算属性
const hasFilters = computed(() => {
  return selectedTag.value || selectedMood.value || dateRange.value.start || dateRange.value.end
})

const activeFiltersCount = computed(() => {
  let count = 0
  if (selectedTag.value) count++
  if (selectedMood.value) count++
  if (dateRange.value.start || dateRange.value.end) count++
  return count
})

// 过滤后的日记列表
const filteredDiaries = computed(() => {
  let result = [...diaries.value]
  
  // 排序
  result.sort((a, b) => {
    if (sortBy.value === 'title') {
      return sortOrder.value === 'asc' 
        ? a.title.localeCompare(b.title, 'zh-CN')
        : b.title.localeCompare(a.title, 'zh-CN')
    } else {
      const dateA = new Date(a[sortBy.value] || a.createTime)
      const dateB = new Date(b[sortBy.value] || b.createTime)
      return sortOrder.value === 'asc' ? dateA - dateB : dateB - dateA
    }
  })
  
  return result
})

// 加载日记列表
async function loadDiaries() {
  loading.value = true
  try {
    diaries.value = await getAllDiaries({
      sortBy: sortBy.value,
      order: sortOrder.value
    })
    console.log('[DiaryList] 加载日记:', diaries.value.length, '篇')
  } catch (error) {
    console.error('[DiaryList] 加载日记失败:', error)
    alert('加载日记失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

// 加载筛选数据
async function loadFilterData() {
  try {
    allTags.value = await getAllTags()
    allMoods.value = await getAllMoods()
  } catch (error) {
    console.error('[DiaryList] 加载筛选数据失败:', error)
  }
}

// 搜索处理（带防抖）
function handleSearch() {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  
  searchTimeout = setTimeout(async () => {
    await applyFilters()
  }, 300)
}

// 清除搜索
function clearSearch() {
  searchQuery.value = ''
  applyFilters()
}

// 应用所有筛选条件
async function applyFilters() {
  loading.value = true
  
  try {
    let result = []
    
    // 首先应用搜索
    if (searchQuery.value.trim()) {
      result = await searchDiaries(searchQuery.value)
    } else {
      result = await getAllDiaries()
    }
    
    // 然后应用标签筛选
    if (selectedTag.value) {
      result = result.filter(diary => 
        diary.tags && diary.tags.includes(selectedTag.value)
      )
    }
    
    // 应用心情筛选
    if (selectedMood.value) {
      result = result.filter(diary => diary.mood === selectedMood.value)
    }
    
    // 应用日期筛选
    if (dateRange.value.start || dateRange.value.end) {
      const start = dateRange.value.start ? new Date(dateRange.value.start + 'T00:00:00') : null
      const end = dateRange.value.end ? new Date(dateRange.value.end + 'T23:59:59') : null
      
      result = result.filter(diary => {
        const diaryDate = new Date(diary.createTime)
        if (start && diaryDate < start) return false
        if (end && diaryDate > end) return false
        return true
      })
    }
    
    diaries.value = result
  } catch (error) {
    console.error('[DiaryList] 应用筛选失败:', error)
  } finally {
    loading.value = false
  }
}

// 选择标签
function selectTag(tag) {
  if (selectedTag.value === tag) {
    selectedTag.value = ''
  } else {
    selectedTag.value = tag
  }
  showTagFilter.value = false
  applyFilters()
}

// 选择心情
function selectMood(mood) {
  if (selectedMood.value === mood) {
    selectedMood.value = ''
  } else {
    selectedMood.value = mood
  }
  showMoodFilter.value = false
  applyFilters()
}

// 应用日期筛选
function applyDateFilter() {
  applyFilters()
}

// 清除日期筛选
function clearDateFilter() {
  dateRange.value = { start: '', end: '' }
  applyFilters()
}

// 设置日期预设
function setDatePreset(preset) {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  
  switch (preset) {
    case 'today':
      dateRange.value = {
        start: `${year}-${month}-${day}`,
        end: `${year}-${month}-${day}`
      }
      break
    case 'week':
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - today.getDay())
      dateRange.value = {
        start: formatDateInput(weekStart),
        end: `${year}-${month}-${day}`
      }
      break
    case 'month':
      dateRange.value = {
        start: `${year}-${month}-01`,
        end: `${year}-${month}-${day}`
      }
      break
    case 'year':
      dateRange.value = {
        start: `${year}-01-01`,
        end: `${year}-${month}-${day}`
      }
      break
  }
  
  applyFilters()
}

// 格式化日期为 YYYY-MM-DD
function formatDateInput(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 清除所有筛选
function clearAllFilters() {
  selectedTag.value = ''
  selectedMood.value = ''
  dateRange.value = { start: '', end: '' }
  searchQuery.value = ''
  showTagFilter.value = false
  showMoodFilter.value = false
  showDateFilter.value = false
  applyFilters()
}

// 设置排序
function setSort(field) {
  if (sortBy.value === field) {
    // 切换排序方向
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = field
    sortOrder.value = field === 'title' ? 'asc' : 'desc'
  }
  // 重新排序当前列表
  const sorted = [...diaries.value]
  sorted.sort((a, b) => {
    if (sortBy.value === 'title') {
      return sortOrder.value === 'asc' 
        ? a.title.localeCompare(b.title, 'zh-CN')
        : b.title.localeCompare(a.title, 'zh-CN')
    } else {
      const dateA = new Date(a[sortBy.value] || a.createTime)
      const dateB = new Date(b[sortBy.value] || b.createTime)
      return sortOrder.value === 'asc' ? dateA - dateB : dateB - dateA
    }
  })
  diaries.value = sorted
}

// 查看日记详情
function viewDiary(id) {
  router.push(`/diary/${id}`)
}

// 前往创建页面
function goToCreate() {
  router.push('/create')
}

// 获取摘要（从HTML内容中提取纯文本）
function getExcerpt(htmlContent) {
  if (!htmlContent) return ''
  
  // 创建临时元素来提取纯文本
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = htmlContent
  const text = tempDiv.textContent || tempDiv.innerText || ''
  
  // 截取前80个字符
  return text.trim().substring(0, 80) + (text.length > 80 ? '...' : '')
}

// 获取印章文字
function getSealText(diary) {
  // 优先使用心情
  if (diary.mood) {
    const moodMap = {
      'happy': '悦',
      'calm': '宁',
      'thoughtful': '思',
      'grateful': '恩',
      'excited': '兴',
      'tired': '倦',
      'sad': '忧',
      'anxious': '虑',
      'angry': '愤',
      'loved': '爱',
      'creative': '创',
      'nostalgic': '忆'
    }
    if (moodMap[diary.mood]) return moodMap[diary.mood]
  }
  
  // 根据日记标题或内容生成印章文字
  const title = diary.title || ''
  if (title.includes('春')) return '春'
  if (title.includes('夏')) return '夏'
  if (title.includes('秋')) return '秋'
  if (title.includes('冬')) return '冬'
  if (title.includes('雨')) return '雨'
  if (title.includes('雪')) return '雪'
  if (title.includes('月')) return '月'
  if (title.includes('山')) return '山'
  if (title.includes('水')) return '水'
  if (title.includes('花')) return '花'
  if (title.includes('梦')) return '梦'
  if (title.includes('思')) return '思'
  if (title.includes('闲')) return '闲'
  if (title.includes('静')) return '静'
  
  // 默认返回"记"
  return '记'
}

// 判断是否最近创建（7天内）
function isRecent(createTime) {
  const createDate = new Date(createTime)
  const now = new Date()
  const diffDays = (now - createDate) / (1000 * 60 * 60 * 24)
  return diffDays <= 7
}

// 组件挂载时加载数据
onMounted(() => {
  loadDiaries()
  loadFilterData()
})
</script>

<style scoped>
/* 日记列表容器 */
.diary-list {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* 页面标题栏 */
.diary-list__header {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--ink-rice);
}

.page-title {
  font-family: "LXGW WenKai", serif;
  font-size: 2.5rem;
  font-weight: 400;
  color: var(--ink-dark);
  letter-spacing: 0.15em;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-family: "LXGW WenKai", serif;
  font-size: 1rem;
  color: var(--ink-sandalwood);
  letter-spacing: 0.05em;
}

/* 筛选栏 */
.diary-list__filters {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

/* 搜索框 */
.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1rem;
  color: var(--ink-sandalwood);
  display: flex;
  align-items: center;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.875rem 2.75rem;
  font-family: "LXGW WenKai", serif;
  font-size: 1rem;
  background: linear-gradient(135deg, var(--ink-paper) 0%, rgba(255, 255, 255, 0.8) 100%);
  border: 1px solid var(--ink-rice);
  border-radius: 8px;
  outline: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.search-input::placeholder {
  color: var(--ink-sandalwood);
  opacity: 0.7;
}

.search-input:focus {
  border-color: var(--ink-ochre);
  box-shadow: 
    0 0 0 3px rgba(139, 69, 19, 0.1),
    0 2px 8px rgba(139, 69, 19, 0.08);
  background: var(--ink-paper);
}

.search-clear {
  position: absolute;
  right: 1rem;
  background: rgba(139, 69, 19, 0.08);
  border: none;
  color: var(--ink-sandalwood);
  cursor: pointer;
  padding: 0.375rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.search-clear:hover {
  background: rgba(139, 69, 19, 0.15);
  color: var(--ink-ochre);
  transform: scale(1.1);
}

/* 筛选按钮组 */
.filter-buttons {
  display: flex;
  gap: 0.625rem;
  flex-wrap: wrap;
}

.filter-btn {
  font-family: "LXGW WenKai", serif;
  font-size: 0.875rem;
  padding: 0.5rem 0.875rem;
  background: linear-gradient(135deg, var(--ink-paper) 0%, rgba(255, 255, 255, 0.8) 100%);
  border: 1px solid var(--ink-rice);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  color: var(--ink-sandalwood);
}

.filter-btn:hover {
  border-color: var(--ink-ochre);
  background: linear-gradient(135deg, rgba(139, 69, 19, 0.05) 0%, rgba(139, 69, 19, 0.02) 100%);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
  color: var(--ink-dark);
}

.filter-btn.active {
  background: linear-gradient(135deg, var(--ink-ochre) 0%, #a0522d 100%);
  color: var(--ink-paper);
  border-color: var(--ink-ochre);
  box-shadow: 0 2px 6px rgba(139, 69, 19, 0.3);
}

.filter-btn.clear-all {
  background: transparent;
  color: var(--ink-sandalwood);
  border-color: var(--ink-rice);
}

.filter-btn.clear-all:hover {
  background: linear-gradient(135deg, rgba(220, 20, 60, 0.08) 0%, rgba(220, 20, 60, 0.02) 100%);
  border-color: rgba(220, 20, 60, 0.5);
  color: crimson;
}

.filter-icon {
  font-size: 0.9rem;
}

.filter-text {
  font-size: 0.875rem;
}

.filter-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  background: linear-gradient(135deg, crimson 0%, #dc143c 100%);
  color: white;
  border-radius: 9px;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0 5px;
}

.filter-btn.active .filter-badge {
  background: var(--ink-paper);
  color: var(--ink-ochre);
}

/* 筛选面板 */
.filter-panel {
  background: var(--ink-paper);
  border: 1px solid var(--ink-rice);
  border-radius: 4px;
  padding: 1rem;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.filter-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  font-family: "LXGW WenKai", serif;
  font-size: 0.875rem;
  color: var(--ink-dark);
}

.close-btn {
  background: none;
  border: none;
  color: var(--ink-sandalwood);
  cursor: pointer;
  font-size: 1rem;
  padding: 0.25rem;
  transition: color 0.3s;
}

.close-btn:hover {
  color: var(--ink-ochre);
}

/* 筛选选项 */
.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: var(--ink-hover);
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: "LXGW WenKai", serif;
  font-size: 0.875rem;
}

.filter-option:hover {
  border-color: var(--ink-ochre);
}

.filter-option.active {
  background: var(--ink-ochre);
  color: var(--ink-paper);
}

.filter-option .option-name {
  color: inherit;
}

.filter-option .option-count {
  font-size: 0.75rem;
  opacity: 0.7;
  background: rgba(0, 0, 0, 0.1);
  padding: 0.125rem 0.375rem;
  border-radius: 3px;
}

.filter-option.active .option-count {
  background: rgba(255, 255, 255, 0.2);
}

/* 心情选项 */
.mood-options {
  gap: 0.625rem;
}

.mood-option {
  padding: 0.5rem 0.875rem;
}

.mood-option .mood-icon {
  font-size: 1.125rem;
}

.filter-empty {
  width: 100%;
  text-align: center;
  color: var(--ink-sandalwood);
  font-size: 0.875rem;
  padding: 1rem;
  font-family: "LXGW WenKai", serif;
}

/* 日期范围输入 */
.date-range-inputs {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.date-input-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.date-input-group label {
  font-family: "LXGW WenKai", serif;
  font-size: 0.75rem;
  color: var(--ink-sandalwood);
}

.date-input {
  padding: 0.5rem;
  font-family: "LXGW WenKai", serif;
  font-size: 0.875rem;
  background: var(--ink-paper);
  border: 1px solid var(--ink-rice);
  border-radius: 4px;
  outline: none;
}

.date-input:focus {
  border-color: var(--ink-ochre);
}

.date-separator {
  font-family: "LXGW WenKai", serif;
  color: var(--ink-sandalwood);
  margin-top: 1rem;
}

/* 日期预设按钮 */
.date-presets {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.preset-btn {
  padding: 0.375rem 0.75rem;
  font-family: "LXGW WenKai", serif;
  font-size: 0.875rem;
  color: var(--ink-sandalwood);
  background: var(--ink-hover);
  border: 1px solid var(--ink-rice);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.preset-btn:hover {
  border-color: var(--ink-ochre);
  color: var(--ink-dark);
}

/* 排序选项 */
.sort-options {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

/* 已选筛选条件 */
.active-filters {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  flex-wrap: wrap;
  padding: 0.875rem 1rem;
  background: linear-gradient(135deg, rgba(139, 69, 19, 0.04) 0%, rgba(139, 69, 19, 0.02) 100%);
  border-radius: 8px;
  border: 1px solid rgba(139, 69, 19, 0.1);
}

.active-filters-label {
  font-family: "LXGW WenKai", serif;
  font-size: 0.875rem;
  color: var(--ink-sandalwood);
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  margin-right: 0.25rem;
}

.active-filter-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.625rem 0.375rem 0.5rem;
  background: linear-gradient(135deg, var(--ink-ochre) 0%, #a0522d 100%);
  color: var(--ink-paper);
  border-radius: 16px;
  font-family: "LXGW WenKai", serif;
  font-size: 0.8125rem;
  box-shadow: 0 1px 3px rgba(139, 69, 19, 0.2);
  transition: all 0.2s ease;
}

.active-filter-tag:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(139, 69, 19, 0.3);
}

.active-filter-tag .tag-icon {
  font-size: 0.8rem;
}

.active-filter-tag .tag-text {
  font-size: 0.8125rem;
}

.active-filter-tag button {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 0.125rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
  transition: all 0.2s ease;
  margin-left: 0.125rem;
}

.active-filter-tag button:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.35);
  transform: scale(1.1);
}

/* 加载状态 */
.diary-list__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
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

/* 空状态 */
.diary-list__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.empty-content {
  text-align: center;
}

.empty-illustration {
  position: relative;
  margin-bottom: 2rem;
}

.empty-icon {
  font-size: 5rem;
  display: block;
  margin-bottom: 1rem;
}

.empty-ink-wash {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 120px;
  background: radial-gradient(ellipse at center, rgba(139, 69, 19, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  z-index: -1;
}

.empty-content h3 {
  font-family: "LXGW WenKai", serif;
  font-size: 1.5rem;
  font-weight: 400;
  color: var(--ink-dark);
  margin-bottom: 0.5rem;
}

.empty-content p {
  font-family: "LXGW WenKai", serif;
  color: var(--ink-sandalwood);
  margin-bottom: 1.5rem;
}

/* 日记网格 */
.diary-list__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 2rem;
}

/* 卡片动画 */
.diary-list__grid > * {
  animation: fadeInUp 0.5s ease forwards;
  opacity: 0;
}

.diary-list__grid > *:nth-child(1) { animation-delay: 0.05s; }
.diary-list__grid > *:nth-child(2) { animation-delay: 0.1s; }
.diary-list__grid > *:nth-child(3) { animation-delay: 0.15s; }
.diary-list__grid > *:nth-child(4) { animation-delay: 0.2s; }
.diary-list__grid > *:nth-child(5) { animation-delay: 0.25s; }
.diary-list__grid > *:nth-child(6) { animation-delay: 0.3s; }

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 底部信息 */
.diary-list__footer {
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--ink-rice);
  text-align: center;
}

.footer-text {
  font-family: "LXGW WenKai", serif;
  font-size: 0.875rem;
  color: var(--ink-sandalwood);
}

/* 响应式 */
@media (max-width: 768px) {
  .diary-list {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .diary-list__grid {
    grid-template-columns: 1fr;
  }
  
  .filter-buttons {
    justify-content: center;
  }
  
  .sort-options {
    justify-content: center;
  }
  
  .date-range-inputs {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .date-separator {
    margin-top: 0;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.75rem;
  }
  
  .empty-icon {
    font-size: 4rem;
  }
  
  .filter-btn {
    padding: 0.375rem 0.75rem;
    font-size: 0.8rem;
  }
}
</style>
