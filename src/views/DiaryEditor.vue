<template>
  <div class="diary-editor">
    <!-- 顶部操作栏 -->
    <header class="diary-editor__header">
      <div class="header-left">
        <InkButton
          text="返回"
          icon="←"
          icon-position="left"
          variant="ghost"
          size="small"
          @click="goBack"
        />
      </div>
      
      <div class="header-center">
        <h1 class="editor-title">{{ isEditMode ? '编辑日记' : '文思 - AI润色日记' }}</h1>
      </div>
      
      <div class="header-right">
        <InkButton
          text="保存"
          icon="✓"
          variant="primary"
          size="small"
          :loading="saving"
          @click="saveDiary"
        />
      </div>
    </header>
    
    <!-- 墨迹分隔线 -->
    <div class="ink-divider-ink"></div>
    
    <!-- 三栏布局主体 -->
    <div class="diary-editor__body">
      <!-- 左侧：AI参数设置 -->
      <div class="editor-panel panel-left" :style="{ width: leftPanelWidth + 'px' }">
        <div class="panel-header">
          <span class="panel-icon">⚙️</span>
          <span class="panel-title">AI 参数设置</span>
        </div>
        
        <div class="panel-content">
          <!-- 心情选择器 -->
          <div class="setting-group">
            <label class="setting-label">
              <span class="label-icon">💭</span>
              <span>心情</span>
            </label>
            <div class="setting-grid mood-grid">
              <button
                v-for="mood in moodOptions"
                :key="mood.value"
                :class="['setting-card', 'mood-card', { active: diaryForm.mood === mood.value }]"
                @click="diaryForm.mood = mood.value"
                :title="mood.label"
              >
                <span class="card-icon">{{ mood.icon }}</span>
                <span class="card-name">{{ mood.label }}</span>
              </button>
            </div>
          </div>
          
          <!-- 风格选择器 -->
          <div class="setting-group">
            <label class="setting-label">
              <span class="label-icon">🎨</span>
              <span>风格</span>
            </label>
            <div class="setting-grid style-grid">
              <button
                v-for="style in styleOptions"
                :key="style.value"
                :class="['setting-card', 'style-card', { active: diaryForm.style === style.value }]"
                @click="diaryForm.style = style.value"
                :title="style.description"
              >
                <span class="card-icon">{{ style.icon }}</span>
                <span class="card-name">{{ style.label }}</span>
              </button>
            </div>
          </div>
          
          <!-- 自定义预设/额外要求 -->
          <div class="setting-group">
            <label class="setting-label">
              <span class="label-icon">✏️</span>
              <span>{{ diaryForm.style === 'none' ? '自定义风格' : '额外要求' }}</span>
              <span v-if="diaryForm.style === 'none'" class="label-required">*</span>
            </label>
            <textarea
              v-model="diaryForm.preset"
              :placeholder="diaryForm.style === 'none' ? '请描述您想要的风格...' : '如：希望多使用比喻修辞...'"
              class="setting-textarea"
              rows="3"
            ></textarea>
          </div>
          
          <!-- 生成设置 -->
          <div class="setting-group">
            <label class="setting-label">
              <span class="label-icon">🔧</span>
              <span>生成选项</span>
            </label>
            <div class="checkbox-group">
              <label class="checkbox-item">
                <input v-model="generationSettings.saveOriginal" type="checkbox" />
                <span>保存原文</span>
              </label>
              <label class="checkbox-item">
                <input v-model="generationSettings.streaming" type="checkbox" />
                <span>流式输出</span>
              </label>
            </div>
          </div>
          
          <!-- AI 配置提示 -->
          <div v-if="!aiConfigured" class="ai-warning">
            <span class="warning-icon">⚠️</span>
            <span>请先在设置中配置 AI API</span>
          </div>
          
          <!-- 生成按钮 -->
          <div class="generate-action">
            <InkButton
              text="✨ 开始润色"
              variant="primary"
              :loading="generating"
              :disabled="!canGenerate"
              @click="generateContent"
              class="generate-btn"
            />
          </div>
        </div>
      </div>
      
      <!-- 左侧分割线 -->
      <div 
        class="resizer resizer-left" 
        @mousedown="startResizeLeft"
        v-if="!isMobile"
      ></div>
      
      <!-- 中间：文本编辑器 -->
      <div class="editor-panel panel-center">
        <div class="panel-header">
          <span class="panel-icon">📝</span>
          <span class="panel-title">日记内容</span>
        </div>
        
        <div class="panel-content editor-scrollable">
          <!-- 模式切换标签 -->
          <div class="mode-tabs">
            <button
              v-for="mode in editModes"
              :key="mode.value"
              :class="['mode-tab', { active: currentMode === mode.value }]"
              @click="switchMode(mode.value)"
            >
              <span class="tab-icon">{{ mode.icon }}</span>
              <span class="tab-label">{{ mode.label }}</span>
            </button>
          </div>
          
          <!-- 文思模式：标题、日期、正文 -->
          <template v-if="currentMode === 'wenxin'">
            <!-- 标题和日期 -->
            <div class="editor-fields">
              <div class="field-group">
                <label>标题 <span class="label-hint">必填</span></label>
                <input
                  v-model="diaryForm.title"
                  type="text"
                  placeholder="给你的日记起个标题..."
                  class="form-input title-input"
                />
              </div>
              <div class="field-group date-field">
                <label>日期</label>
                <input
                  v-model="diaryForm.date"
                  type="date"
                  class="form-input date-input"
                />
              </div>
            </div>
            
            <!-- 正文输入 -->
            <div class="content-editor-wrapper">
              <div class="content-header">
                <label>正文 <span class="label-hint">至少10字</span></label>
                <span class="char-count" :class="{ 'is-valid': diaryForm.content.length >= 10 }">
                  {{ diaryForm.content.length }} 字
                </span>
              </div>
              <textarea
                v-model="diaryForm.content"
                class="content-textarea"
                placeholder="在这里写下你的日记内容...&#10;&#10;AI会根据你的原文进行润色排版，生成精美的HTML日记。请放心，AI会尊重你的原意，只做适当的优化和美化。"
              ></textarea>
            </div>
          </template>
          
          <!-- 上传模式：文件上传 -->
          <template v-if="currentMode === 'upload'">
            <div class="upload-section">
              <div class="editor-fields">
                <div class="field-group" style="flex: 1;">
                  <label>标题</label>
                  <input
                    v-model="diaryForm.title"
                    type="text"
                    placeholder="给你的日记起个标题..."
                    class="form-input title-input"
                  />
                </div>
              </div>
              
              <div 
                class="upload-area"
                :class="{ 'drag-over': isDragging }"
                @dragenter.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @dragover.prevent
                @drop.prevent="handleDrop"
                @click="triggerFileInput"
              >
                <input
                  ref="fileInput"
                  type="file"
                  accept=".html,.htm"
                  class="file-input"
                  @change="handleFileSelect"
                />
                <div class="upload-content">
                  <span class="upload-icon">📁</span>
                  <p class="upload-text">点击或拖拽 HTML 文件到此处</p>
                  <p class="upload-hint">支持 .html、.htm 格式</p>
                </div>
              </div>
            </div>
          </template>
          
          <!-- 代码模式：直接编辑HTML -->
          <template v-if="currentMode === 'code'">
            <div class="code-edit-section">
              <div class="editor-fields">
                <div class="field-group" style="flex: 1;">
                  <label>标题</label>
                  <input
                    v-model="diaryForm.title"
                    type="text"
                    placeholder="给你的日记起个标题..."
                    class="form-input title-input"
                  />
                </div>
              </div>
              
              <div class="code-edit-hint">
                <span class="hint-icon">💡</span>
                <span class="hint-text">在此直接编辑 HTML 代码，右侧可实时预览</span>
              </div>
            </div>
          </template>
          
          <!-- 元信息面板 -->
          <div class="meta-section">
            <div class="meta-row">
              <div class="meta-item">
                <div class="meta-header">
                  <span class="meta-label">🏷️ 标签</span>
                  <button
                    class="meta-btn"
                    :disabled="!canGenerateMeta || generatingTags"
                    @click="generateTagsOnly"
                  >
                    {{ generatingTags ? '生成中...' : '生成' }}
                  </button>
                </div>
                <div v-if="generatedMeta.tags.length > 0" class="meta-tags">
                  <span v-for="tag in generatedMeta.tags" :key="tag" class="meta-tag">{{ tag }}</span>
                </div>
                <div v-else class="meta-empty">暂无标签</div>
              </div>
              
              <div class="meta-item">
                <div class="meta-header">
                  <span class="meta-label">📝 摘要</span>
                  <button
                    class="meta-btn"
                    :disabled="!canGenerateMeta || generatingSummary"
                    @click="generateSummaryOnly"
                  >
                    {{ generatingSummary ? '生成中...' : '生成' }}
                  </button>
                </div>
                <div v-if="generatedMeta.summary" class="meta-summary">{{ generatedMeta.summary }}</div>
                <div v-else class="meta-empty">暂无摘要</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 右侧分割线 -->
      <div 
        class="resizer resizer-right" 
        @mousedown="startResizeRight"
        v-if="!isMobile"
      ></div>
      
      <!-- 右侧：代码与预览 -->
      <div class="editor-panel panel-right" :style="{ width: rightPanelWidth + 'px' }">
        <div class="panel-header">
          <span class="panel-icon">👁️</span>
          <span class="panel-title">代码与预览</span>
        </div>
        
        <div class="panel-content panel-full">
          <!-- 视图切换标签 -->
          <div class="view-tabs">
            <button
              :class="['view-tab', { active: viewMode === 'code' }]"
              @click="viewMode = 'code'"
            >
              <span class="tab-icon">&lt;/&gt;</span>
              <span>代码</span>
            </button>
            <button
              :class="['view-tab', { active: viewMode === 'preview' }]"
              @click="viewMode = 'preview'"
            >
              <span class="tab-icon">👁</span>
              <span>预览</span>
            </button>
            <div class="view-actions">
              <button v-if="htmlContent && viewMode === 'code'" class="view-action-btn" @click="copyHtmlContent" title="复制代码">
                📋
              </button>
              <button v-if="htmlContent" class="view-action-btn" @click="clearContent" title="清空内容">
                🗑️
              </button>
            </div>
          </div>
          
          <!-- 工作区内容 -->
          <div class="workspace-content">
            <!-- 代码视图 -->
            <div v-show="viewMode === 'code'" class="code-view">
              <div class="code-header">
                <span class="code-title">HTML 代码</span>
                <div class="code-status">
                  <span v-if="generating" class="typing-indicator">
                    <span class="dot"></span>
                    <span class="dot"></span>
                    <span class="dot"></span>
                  </span>
                  <span v-if="generating" class="status-text">{{ currentStepLabel }}</span>
                  <span v-if="generationSpeed > 0 && generating" class="speed-tag">{{ generationSpeed.toFixed(1) }} 字/秒</span>
                  <span v-if="!generating && htmlContent" class="code-stats">{{ htmlContent.length.toLocaleString() }} 字</span>
                </div>
              </div>
              <div class="code-editor-wrapper">
                <textarea
                  v-if="!generating"
                  v-model="htmlContent"
                  class="code-editor"
                  placeholder="在此输入 HTML 代码..."
                  spellcheck="false"
                ></textarea>
                <pre v-else class="stream-display"><code>{{ streamContent || '等待生成内容...' }}</code></pre>
              </div>
            </div>
            
            <!-- 预览视图 -->
            <div v-show="viewMode === 'preview'" class="preview-view">
              <div class="preview-header">
                <span class="preview-title">预览</span>
              </div>
              <div class="preview-container">
                <SandboxRenderer
                  v-if="htmlContent"
                  :html-content="htmlContent"
                  title="预览"
                  :show-security-notice="false"
                  height="100%"
                />
                <div v-else class="preview-empty">
                  <span class="empty-icon">👁</span>
                  <p>预览区域</p>
                  <p class="empty-hint">
                    {{ currentMode === 'wenxin' ? '点击"开始润色"生成日记预览' : '在代码视图中编辑内容后将显示预览' }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 自定义确认弹窗 -->
  <div v-if="showConfirmDialog" class="dialog-overlay" @click.self="closeConfirmDialog">
    <div class="confirm-dialog">
      <div class="dialog-icon">{{ dialogConfig.icon }}</div>
      <h3 class="dialog-title">{{ dialogConfig.title }}</h3>
      <p class="dialog-message">{{ dialogConfig.message }}</p>
      <div class="dialog-actions">
        <button 
          class="dialog-btn dialog-btn-secondary" 
          @click="closeConfirmDialog"
        >
          {{ dialogConfig.cancelText || '取消' }}
        </button>
        <button 
          class="dialog-btn dialog-btn-primary" 
          :class="dialogConfig.confirmClass"
          @click="handleConfirm"
        >
          {{ dialogConfig.confirmText || '确定' }}
        </button>
      </div>
    </div>
  </div>

  <!-- 自定义提示弹窗 -->
  <div v-if="showAlertDialog" class="dialog-overlay" @click.self="closeAlertDialog">
    <div class="confirm-dialog alert-dialog">
      <div class="dialog-icon">{{ dialogConfig.icon }}</div>
      <h3 class="dialog-title">{{ dialogConfig.title }}</h3>
      <p class="dialog-message">{{ dialogConfig.message }}</p>
      <div class="dialog-actions">
        <button 
          class="dialog-btn dialog-btn-primary" 
          @click="closeAlertDialog"
        >
          {{ dialogConfig.confirmText || '确定' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createDiary, updateDiary, getDiary, getConfig, formatDate } from '../modules/db.js'
import { 
  generateDiaryContent, 
  generateDiaryContentStream,
  generateTags,
  generateSummary,
  STYLE_OPTIONS, 
  MOOD_OPTIONS,
  getMoodByValue,
  getStyleByValue
} from '../modules/ai-client.js'
import SandboxRenderer from '../components/SandboxRenderer.vue'
import InkButton from '../components/InkButton.vue'

/**
 * DiaryEditor - 日记编辑器视图（优化版）
 * 
 * 布局特点：
 * - 左侧：AI参数设置面板（心情、风格、额外要求）
 * - 中间：文本编辑器（支持文思/上传/代码三种模式）
 * - 右侧：代码与预览切换窗口
 * - 可拖动分割线调整面板大小（桌面端）
 * - 移动端自动切换为单栏布局
 */

const route = useRoute()
const router = useRouter()

const styleOptions = STYLE_OPTIONS
const moodOptions = MOOD_OPTIONS

// 编辑模式
const editModes = [
  { value: 'wenxin', label: '文思', icon: '✨' },
  { value: 'upload', label: '上传', icon: '📁' },
  { value: 'code', label: '代码', icon: '</>' }
]

// 响应式状态
const currentMode = ref('wenxin')
const viewMode = ref('code') // 'code' | 'preview'
const saving = ref(false)
const generating = ref(false)
const generatingTags = ref(false)
const generatingSummary = ref(false)
const isDragging = ref(false)
const aiConfigured = ref(false)
const fileInput = ref(null)
const htmlContent = ref('')
const streamContent = ref('')

// 面板宽度状态
const leftPanelWidth = ref(280)
const rightPanelWidth = ref(450)
const isMobile = ref(false)

// 拖拽状态
const isResizingLeft = ref(false)
const isResizingRight = ref(false)
const resizeStartX = ref(0)
const resizeStartWidth = ref(0)

// 弹窗状态
const showConfirmDialog = ref(false)
const showAlertDialog = ref(false)
const dialogConfig = ref({
  title: '提示',
  message: '',
  icon: '💭',
  confirmText: '确定',
  cancelText: '取消',
  confirmClass: ''
})
let confirmCallback = null
let cancelCallback = null
let alertCallback = null

// 生成步骤
const generationSteps = [
  { id: 'analyze', label: '分析原文' },
  { id: 'polish', label: '润色排版' },
  { id: 'tags', label: '生成标签' },
  { id: 'complete', label: '完成' }
]
const currentStep = ref('analyze')
const completedSteps = ref([])
const generationSpeed = ref(0)
let generationStartTime = null
let lastChunkTime = null
let chunkCount = 0

// 当前步骤标签
const currentStepLabel = computed(() => {
  const step = generationSteps.find(s => s.id === currentStep.value)
  return step ? step.label : '生成中...'
})

// 日记表单数据
const diaryForm = ref({
  title: '',
  mood: 'calm',
  date: formatDate(new Date().toISOString()),
  content: '',
  style: 'none',
  preset: ''
})

// 生成设置
const generationSettings = ref({
  saveOriginal: true,
  streaming: true
})

// 生成的元数据
const generatedMeta = ref({
  tags: [],
  summary: ''
})

// 判断是否为编辑模式
const isEditMode = computed(() => !!route.params.id)

// 判断是否可以生成
const canGenerate = computed(() => {
  const hasBasicInfo = aiConfigured.value && 
         diaryForm.value.title.trim() && 
         diaryForm.value.content.trim().length >= 10
  
  if (diaryForm.value.style === 'none') {
    return hasBasicInfo && diaryForm.value.preset.trim().length >= 5
  }
  
  return hasBasicInfo
})

// 判断是否可以生成标签和摘要
const canGenerateMeta = computed(() => {
  if (currentMode.value === 'wenxin') {
    return aiConfigured.value && 
           diaryForm.value.title.trim() && 
           diaryForm.value.content.trim().length >= 5
  }
  return aiConfigured.value && 
         diaryForm.value.title.trim() && 
         htmlContent.value.trim().length >= 50
})

// 切换模式
function switchMode(mode) {
  currentMode.value = mode
  // 切换到代码模式时，自动切换到代码视图
  if (mode === 'code') {
    viewMode.value = 'code'
  }
}

// 检查移动端
function checkMobile() {
  isMobile.value = window.innerWidth <= 1024
  if (isMobile.value) {
    leftPanelWidth.value = 0
    rightPanelWidth.value = 0
  }
}

// 左侧分割线拖拽
function startResizeLeft(e) {
  if (isMobile.value) return
  isResizingLeft.value = true
  resizeStartX.value = e.clientX
  resizeStartWidth.value = leftPanelWidth.value
  document.addEventListener('mousemove', handleResizeLeft)
  document.addEventListener('mouseup', stopResizeLeft)
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
}

function handleResizeLeft(e) {
  if (!isResizingLeft.value) return
  const delta = e.clientX - resizeStartX.value
  const newWidth = Math.max(200, Math.min(500, resizeStartWidth.value + delta))
  leftPanelWidth.value = newWidth
}

function stopResizeLeft() {
  isResizingLeft.value = false
  document.removeEventListener('mousemove', handleResizeLeft)
  document.removeEventListener('mouseup', stopResizeLeft)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

// 右侧分割线拖拽
function startResizeRight(e) {
  if (isMobile.value) return
  isResizingRight.value = true
  resizeStartX.value = e.clientX
  resizeStartWidth.value = rightPanelWidth.value
  document.addEventListener('mousemove', handleResizeRight)
  document.addEventListener('mouseup', stopResizeRight)
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
}

function handleResizeRight(e) {
  if (!isResizingRight.value) return
  const delta = resizeStartX.value - e.clientX
  const newWidth = Math.max(400, Math.min(800, resizeStartWidth.value + delta))
  rightPanelWidth.value = newWidth
}

function stopResizeRight() {
  isResizingRight.value = false
  document.removeEventListener('mousemove', handleResizeRight)
  document.removeEventListener('mouseup', stopResizeRight)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

// 检查 AI 配置
async function checkAIConfig() {
  const apiBaseUrl = await getConfig('apiBaseUrl', '')
  const apiKey = await getConfig('apiKey', '')
  aiConfigured.value = !!(apiBaseUrl && apiKey)
}

// 加载日记（编辑模式）
async function loadDiary() {
  const id = route.params.id
  if (!id) {
    diaryForm.value.date = formatDate(new Date().toISOString())
    return
  }
  
  try {
    const diary = await getDiary(id)
    if (diary) {
      diaryForm.value.title = diary.title || ''
      diaryForm.value.mood = diary.mood || 'calm'
      diaryForm.value.date = formatDate(diary.createTime)
      diaryForm.value.style = diary.style || 'classical'
      diaryForm.value.preset = diary.preset || ''
      diaryForm.value.content = diary.originalContent || ''
      
      htmlContent.value = diary.htmlContent || ''
      generatedMeta.value.tags = diary.tags || []
      generatedMeta.value.summary = diary.summary || ''
      
      console.log('[DiaryEditor] 加载日记:', diary.title)
    } else {
      showAlert({
        title: '日记不存在',
        message: '该日记可能已被删除或无法访问',
        icon: '📭',
        onConfirm: () => router.push('/')
      })
    }
  } catch (error) {
    console.error('[DiaryEditor] 加载日记失败:', error)
    showAlert({
      title: '加载失败',
      message: error.message,
      icon: '❌'
    })
  }
}

// 保存日记
async function saveDiary() {
  if (!diaryForm.value.title.trim()) {
    showAlert({
      title: '提示',
      message: '请输入日记标题',
      icon: '📝'
    })
    return
  }

  if (!htmlContent.value.trim()) {
    showAlert({
      title: '提示',
      message: '请先生成或输入日记内容',
      icon: '📄'
    })
    return
  }
  
  saving.value = true
  
  try {
    const moodInfo = getMoodByValue(diaryForm.value.mood)
    const styleInfo = getStyleByValue(diaryForm.value.style)
    
    const diaryData = {
      title: diaryForm.value.title.trim(),
      htmlContent: htmlContent.value.trim(),
      tags: generatedMeta.value.tags,
      mood: diaryForm.value.mood,
      moodIcon: moodInfo.icon,
      summary: generatedMeta.value.summary,
      style: diaryForm.value.style,
      preset: diaryForm.value.preset,
      originalContent: generationSettings.value.saveOriginal ? diaryForm.value.content : ''
    }
    
    let result
    if (isEditMode.value) {
      result = await updateDiary(route.params.id, diaryData)
      console.log('[DiaryEditor] 日记已更新:', result.id)
    } else {
      result = await createDiary(diaryData)
      console.log('[DiaryEditor] 日记已创建:', result.id)
    }
    
    clearDraft()
    router.push('/')
  } catch (error) {
    console.error('[DiaryEditor] 保存失败:', error)
    showAlert({
      title: '保存失败',
      message: error.message,
      icon: '❌'
    })
  } finally {
    saving.value = false
  }
}

// 返回上一页
function goBack() {
  showConfirm({
    title: '放弃编辑',
    message: '确定要放弃当前编辑吗？未保存的内容将会丢失。',
    icon: '⚠️',
    confirmText: '放弃',
    cancelText: '继续编辑',
    confirmClass: 'dialog-btn-danger',
    onConfirm: () => router.back()
  })
}

// 触发文件选择
function triggerFileInput() {
  fileInput.value?.click()
}

// 处理文件选择
function handleFileSelect(event) {
  const file = event.target.files[0]
  if (file) {
    readFile(file)
  }
}

// 处理拖拽文件
function handleDrop(event) {
  isDragging.value = false
  const file = event.dataTransfer.files[0]
  if (file && (file.name.endsWith('.html') || file.name.endsWith('.htm'))) {
    readFile(file)
  } else {
    showAlert({
      title: '文件格式错误',
      message: '请选择 HTML 文件（.html 或 .htm 格式）',
      icon: '📄'
    })
  }
}

// 读取文件内容
function readFile(file) {
  const reader = new FileReader()
  reader.onload = (e) => {
    htmlContent.value = e.target.result
    if (!diaryForm.value.title) {
      diaryForm.value.title = file.name.replace(/\.html?$/i, '')
    }
    viewMode.value = 'preview'
    console.log('[DiaryEditor] 文件已读取:', file.name)
  }
  reader.onerror = () => {
    showAlert({
      title: '读取失败',
      message: '文件读取失败，请检查文件是否损坏',
      icon: '❌'
    })
  }
  reader.readAsText(file)
}

// 复制HTML内容
async function copyHtmlContent() {
  try {
    await navigator.clipboard.writeText(htmlContent.value)
    showAlert({
      title: '复制成功',
      message: 'HTML内容已复制到剪贴板',
      icon: '✅',
      confirmClass: 'dialog-btn-success'
    })
  } catch (err) {
    console.error('[DiaryEditor] 复制失败:', err)
    showAlert({
      title: '复制失败',
      message: '复制失败，请手动复制',
      icon: '❌'
    })
  }
}

// 更新生成步骤
function updateGenerationStep(content) {
  const length = content.length
  if (length < 50) {
    currentStep.value = 'analyze'
  } else if (length < 500) {
    currentStep.value = 'polish'
    if (!completedSteps.value.includes('analyze')) {
      completedSteps.value.push('analyze')
    }
  } else if (!content.includes('</html>') && !content.includes('</body>')) {
    currentStep.value = 'tags'
    if (!completedSteps.value.includes('polish')) {
      completedSteps.value.push('polish')
    }
  } else {
    currentStep.value = 'complete'
    if (!completedSteps.value.includes('tags')) {
      completedSteps.value.push('tags')
    }
  }
}

// AI 生成内容
async function generateContent() {
  if (!canGenerate.value) return
  
  generating.value = true
  streamContent.value = ''
  viewMode.value = 'code' // 自动切换到代码视图
  currentStep.value = 'analyze'
  completedSteps.value = []
  generationSpeed.value = 0
  generationStartTime = Date.now()
  lastChunkTime = generationStartTime
  chunkCount = 0
  
  const moodInfo = getMoodByValue(diaryForm.value.mood)
  const styleInfo = getStyleByValue(diaryForm.value.style)
  
  const params = {
    title: diaryForm.value.title,
    mood: diaryForm.value.mood,
    moodLabel: moodInfo.label,
    moodIcon: moodInfo.icon,
    date: diaryForm.value.date,
    content: diaryForm.value.content,
    style: diaryForm.value.style,
    styleLabel: styleInfo.label,
    preset: diaryForm.value.preset
  }
  
  try {
    if (generationSettings.value.streaming) {
      await generateDiaryContentStream(
        params,
        (chunk) => {
          streamContent.value += chunk
          chunkCount++
          
          const now = Date.now()
          const elapsed = (now - generationStartTime) / 1000
          if (elapsed > 0) {
            generationSpeed.value = streamContent.value.length / elapsed
          }
          lastChunkTime = now
          
          updateGenerationStep(streamContent.value)
          
          if (streamContent.value.length > 100 && streamContent.value.includes('<')) {
            htmlContent.value = streamContent.value
          }
        },
        (result) => {
          htmlContent.value = result.html
          generatedMeta.value.tags = result.tags
          generatedMeta.value.summary = result.summary
          streamContent.value = ''
          generating.value = false
          currentStep.value = 'complete'
          completedSteps.value = ['analyze', 'polish', 'tags', 'complete']
          generationSpeed.value = 0
          console.log('[DiaryEditor] AI 流式生成完成')
        },
        (error) => {
          console.error('[DiaryEditor] AI 流式生成失败:', error)
          showAlert({
            title: '生成失败',
            message: error.message,
            icon: '❌'
          })
          generating.value = false
          generationSpeed.value = 0
        }
      )
    } else {
      currentStep.value = 'polish'
      const result = await generateDiaryContent(params)
      htmlContent.value = result.html
      generatedMeta.value.tags = result.tags
      generatedMeta.value.summary = result.summary
      generating.value = false
      currentStep.value = 'complete'
      completedSteps.value = ['analyze', 'polish', 'tags', 'complete']
      console.log('[DiaryEditor] AI 生成成功')
    }
  } catch (error) {
    console.error('[DiaryEditor] AI 生成失败:', error)
    showAlert({
      title: '生成失败',
      message: error.message,
      icon: '❌'
    })
    generating.value = false
    generationSpeed.value = 0
  }
}

// 清空内容
function clearContent() {
  showConfirm({
    title: '清空内容',
    message: '确定要清空当前内容吗？此操作不可恢复。',
    icon: '🗑️',
    confirmText: '清空',
    cancelText: '保留',
    confirmClass: 'dialog-btn-danger',
    onConfirm: () => {
      htmlContent.value = ''
      streamContent.value = ''
      generatedMeta.value.tags = []
      generatedMeta.value.summary = ''
    }
  })
}

// 独立生成标签
async function generateTagsOnly() {
  if (!canGenerateMeta.value) return
  
  generatingTags.value = true
  try {
    let params
    if (currentMode.value === 'wenxin') {
      const moodInfo = getMoodByValue(diaryForm.value.mood)
      params = {
        title: diaryForm.value.title,
        content: diaryForm.value.content,
        moodLabel: moodInfo.label
      }
    } else {
      const plainText = extractTextFromHtml(htmlContent.value)
      params = {
        title: diaryForm.value.title,
        content: plainText,
        moodLabel: ''
      }
    }
    
    const tags = await generateTags(params)
    generatedMeta.value.tags = tags
    console.log('[DiaryEditor] 标签生成完成:', tags)
  } catch (error) {
    console.error('[DiaryEditor] 生成标签失败:', error)
    showAlert({
      title: '生成标签失败',
      message: error.message,
      icon: '❌'
    })
  } finally {
    generatingTags.value = false
  }
}

// 独立生成摘要
async function generateSummaryOnly() {
  if (!canGenerateMeta.value) return

  generatingSummary.value = true
  try {
    let params
    if (currentMode.value === 'wenxin') {
      const moodInfo = getMoodByValue(diaryForm.value.mood)
      params = {
        title: diaryForm.value.title,
        content: diaryForm.value.content,
        moodLabel: moodInfo.label
      }
    } else {
      const plainText = extractTextFromHtml(htmlContent.value)
      params = {
        title: diaryForm.value.title,
        content: plainText,
        moodLabel: ''
      }
    }

    const summary = await generateSummary(params)
    generatedMeta.value.summary = summary
    console.log('[DiaryEditor] 摘要生成完成:', summary)
  } catch (error) {
    console.error('[DiaryEditor] 生成摘要失败:', error)
    showAlert({
      title: '生成摘要失败',
      message: error.message,
      icon: '❌'
    })
  } finally {
    generatingSummary.value = false
  }
}

// 从HTML提取纯文本
function extractTextFromHtml(html) {
  if (!html) return ''
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html
  return tempDiv.textContent || tempDiv.innerText || ''
}

// 自动保存草稿
let autoSaveInterval = null
const DRAFT_KEY = 'ink_diary_draft'

function saveDraft() {
  if (!isEditMode.value && (diaryForm.value.title || diaryForm.value.content)) {
    const draft = {
      ...diaryForm.value,
      htmlContent: htmlContent.value,
      generatedMeta: generatedMeta.value,
      savedAt: new Date().toISOString()
    }
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  }
}

function loadDraft() {
  const draftJson = localStorage.getItem(DRAFT_KEY)
  if (draftJson && !isEditMode.value) {
    try {
      const draft = JSON.parse(draftJson)
      const savedTime = new Date(draft.savedAt)
      const now = new Date()
      const hoursDiff = (now - savedTime) / (1000 * 60 * 60)
      
      if (hoursDiff < 24) {
        // 延迟显示弹窗，确保页面先渲染完成
        setTimeout(() => {
          showConfirm({
            title: '恢复草稿',
            message: `检测到 ${Math.round(hoursDiff * 10) / 10} 小时前的未保存草稿，是否恢复？`,
            icon: '📄',
            confirmText: '恢复',
            cancelText: '丢弃',
            onConfirm: () => {
              diaryForm.value = {
                title: draft.title || '',
                mood: draft.mood || 'calm',
                date: draft.date || formatDate(new Date().toISOString()),
                content: draft.content || '',
                style: draft.style || 'none',
                preset: draft.preset || ''
              }
              htmlContent.value = draft.htmlContent || ''
              generatedMeta.value = draft.generatedMeta || { tags: [], summary: '' }
            },
            onCancel: () => {
              localStorage.removeItem(DRAFT_KEY)
            }
          })
        }, 500)
      } else {
        localStorage.removeItem(DRAFT_KEY)
      }
    } catch (e) {
      console.error('[DiaryEditor] 加载草稿失败:', e)
    }
  }
}

function clearDraft() {
  localStorage.removeItem(DRAFT_KEY)
}

// 显示确认弹窗
function showConfirm(options) {
  dialogConfig.value = {
    title: options.title || '确认',
    message: options.message || '',
    icon: options.icon || '❓',
    confirmText: options.confirmText || '确定',
    cancelText: options.cancelText || '取消',
    confirmClass: options.confirmClass || ''
  }
  confirmCallback = options.onConfirm || null
  cancelCallback = options.onCancel || null
  showConfirmDialog.value = true
}

// 显示提示弹窗
function showAlert(options) {
  dialogConfig.value = {
    title: options.title || '提示',
    message: options.message || '',
    icon: options.icon || '💭',
    confirmText: options.confirmText || '确定',
    confirmClass: options.confirmClass || ''
  }
  alertCallback = options.onConfirm || null
  showAlertDialog.value = true
}

// 关闭确认弹窗
function closeConfirmDialog() {
  showConfirmDialog.value = false
  if (cancelCallback) {
    cancelCallback()
    cancelCallback = null
  }
  confirmCallback = null
}

// 关闭提示弹窗
function closeAlertDialog() {
  showAlertDialog.value = false
  if (alertCallback) {
    alertCallback()
    alertCallback = null
  }
}

// 处理确认
function handleConfirm() {
  showConfirmDialog.value = false
  if (confirmCallback) {
    confirmCallback()
    confirmCallback = null
  }
  cancelCallback = null
}

// 键盘快捷键处理
function handleKeyboardShortcuts(e) {
  // Ctrl/Cmd + S: 保存
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault()
    if (!saving.value && htmlContent.value) {
      saveDiary()
    }
  }
  
  // Ctrl/Cmd + Enter: 开始润色
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && currentMode.value === 'wenxin') {
    e.preventDefault()
    if (canGenerate.value && !generating.value) {
      generateContent()
    }
  }
  
  // Esc: 返回（需确认）
  if (e.key === 'Escape') {
    e.preventDefault()
    goBack()
  }
}

// 窗口大小变化处理
function handleResize() {
  checkMobile()
}

// 组件挂载时初始化
onMounted(() => {
  checkAIConfig()
  checkMobile()
  loadDraft()
  loadDiary()
  
  autoSaveInterval = setInterval(saveDraft, 30000)
  document.addEventListener('keydown', handleKeyboardShortcuts)
  window.addEventListener('resize', handleResize)
})

// 组件卸载时清理
onUnmounted(() => {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval)
  }
  document.removeEventListener('keydown', handleKeyboardShortcuts)
  window.removeEventListener('resize', handleResize)
  saveDraft()
})
</script>

<style scoped>
/* 页面进入动画 */
@keyframes pageEnter {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 编辑器容器 */
.diary-editor {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--ink-paper);
  animation: pageEnter 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 顶部操作栏 */
.diary-editor__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background-color: var(--ink-paper);
  flex-shrink: 0;
}

.header-left,
.header-right {
  flex: 0 0 auto;
}

.header-center {
  flex: 1;
  text-align: center;
}

.editor-title {
  font-family: "LXGW WenKai", serif;
  font-size: 1.5rem;
  font-weight: 400;
  color: var(--ink-dark);
  letter-spacing: 0.1em;
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
  flex-shrink: 0;
}

/* 三栏布局主体 */
.diary-editor__body {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
}

/* 面板通用样式 */
.editor-panel {
  display: flex;
  flex-direction: column;
  background: var(--ink-paper);
  min-height: 0;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, rgba(139, 69, 19, 0.05) 0%, rgba(139, 69, 19, 0.02) 100%);
  border-bottom: 1px solid var(--ink-rice);
  flex-shrink: 0;
}

.panel-icon {
  font-size: 1.125rem;
}

.panel-title {
  font-family: "LXGW WenKai", serif;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--ink-dark);
}

.panel-content {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  min-height: 0;
}

.panel-full {
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
}

/* 左侧面板 */
.panel-left {
  flex-shrink: 0;
  border-right: 1px solid var(--ink-rice);
}

/* 中间面板 */
.panel-center {
  flex: 1;
  min-width: 0;
}

.editor-scrollable {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* 右侧面板 */
.panel-right {
  flex-shrink: 0;
  border-left: 1px solid var(--ink-rice);
}

/* 分割线 */
.resizer {
  width: 6px;
  background: transparent;
  cursor: col-resize;
  position: relative;
  flex-shrink: 0;
  transition: background 0.2s ease;
}

.resizer:hover,
.resizer.active {
  background: var(--ink-ochre);
}

.resizer::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 2px;
  height: 24px;
  background: var(--ink-rice);
  border-radius: 1px;
}

.resizer:hover::after,
.resizer.active::after {
  background: var(--ink-paper);
}

/* 模式切换标签 */
.mode-tabs {
  display: flex;
  gap: 0.5rem;
  border-bottom: 1px solid var(--ink-rice);
  padding-bottom: 0.5rem;
  flex-shrink: 0;
}

.mode-tab {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  font-family: "LXGW WenKai", serif;
  font-size: 0.875rem;
  color: var(--ink-sandalwood);
  background: none;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.mode-tab:hover {
  color: var(--ink-dark);
  background-color: var(--ink-hover);
}

.mode-tab.active {
  background-color: var(--ink-ochre);
  color: var(--ink-paper);
}

.tab-icon {
  font-size: 1rem;
}

/* 设置组样式 */
.setting-group {
  margin-bottom: 1.25rem;
}

.setting-label {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-family: "LXGW WenKai", serif;
  font-size: 0.8125rem;
  color: var(--ink-dark);
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.label-icon {
  font-size: 1rem;
}

.label-required {
  color: #ef4444;
  font-size: 0.75rem;
}

.setting-grid {
  display: grid;
  gap: 0.5rem;
}

.mood-grid {
  grid-template-columns: repeat(2, 1fr);
}

.style-grid {
  grid-template-columns: repeat(2, 1fr);
}

.setting-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.5rem;
  background: var(--ink-paper);
  border: 2px solid var(--ink-rice);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 50px;
}

.setting-card:hover {
  transform: translateY(-2px);
  border-color: var(--ink-sandalwood);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.setting-card.active {
  background: linear-gradient(135deg, var(--ink-ochre) 0%, #a0522d 100%);
  border-color: var(--ink-ochre);
  color: var(--ink-paper);
  box-shadow: 0 4px 12px rgba(139, 69, 19, 0.3);
}

.card-icon {
  font-size: 1.25rem;
  line-height: 1;
  transition: transform 0.3s ease;
}

.setting-card:hover .card-icon {
  transform: scale(1.1);
}

.card-name {
  font-family: "LXGW WenKai", serif;
  font-size: 0.6875rem;
  white-space: nowrap;
  font-weight: 500;
}

.style-card.active {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  border-color: #2c3e50;
}

/* 设置文本框 */
.setting-textarea {
  width: 100%;
  padding: 0.625rem;
  font-family: "LXGW WenKai", serif;
  font-size: 0.875rem;
  line-height: 1.6;
  background-color: var(--ink-paper);
  border: 2px solid var(--ink-rice);
  border-radius: 8px;
  outline: none;
  resize: vertical;
  transition: all 0.3s ease;
  min-height: 60px;
}

.setting-textarea:focus {
  border-color: var(--ink-ochre);
  box-shadow: 0 0 0 3px rgba(139, 69, 19, 0.1);
}

.setting-textarea::placeholder {
  color: var(--ink-sandalwood);
  opacity: 0.7;
}

/* 复选框组 */
.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--ink-dark);
  cursor: pointer;
  font-family: "LXGW WenKai", serif;
  transition: color 0.3s ease;
}

.checkbox-item:hover {
  color: var(--ink-ochre);
}

.checkbox-item input[type="checkbox"] {
  cursor: pointer;
  width: 16px;
  height: 16px;
  accent-color: var(--ink-ochre);
}

/* AI 警告 */
.ai-warning {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem;
  background: rgba(239, 68, 68, 0.08);
  border-radius: 6px;
  font-size: 0.8125rem;
  color: #ef4444;
  font-family: "LXGW WenKai", serif;
  margin-bottom: 1rem;
}

.warning-icon {
  font-size: 1rem;
}

/* 生成按钮 */
.generate-action {
  margin-top: auto;
  padding-top: 0.5rem;
}

.generate-btn {
  width: 100%;
}

/* 中间编辑器字段 */
.editor-fields {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.field-group label {
  font-family: "LXGW WenKai", serif;
  font-size: 0.8125rem;
  color: var(--ink-dark);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.label-hint {
  font-size: 0.6875rem;
  color: var(--ink-sandalwood);
  font-weight: 400;
  background: rgba(139, 69, 19, 0.06);
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
}

.field-group:first-child {
  flex: 2;
}

.date-field {
  flex: 1;
  min-width: 140px;
}

.form-input {
  padding: 0.625rem 0.875rem;
  font-family: "LXGW WenKai", serif;
  font-size: 1rem;
  background-color: var(--ink-paper);
  border: 2px solid var(--ink-rice);
  border-radius: 8px;
  outline: none;
  transition: all 0.3s ease;
  width: 100%;
}

.form-input:focus {
  border-color: var(--ink-ochre);
  box-shadow: 0 0 0 3px rgba(139, 69, 19, 0.1);
}

.form-input::placeholder {
  color: var(--ink-sandalwood);
  opacity: 0.7;
}

.title-input {
  font-size: 1.125rem;
}

/* 内容编辑器 */
.content-editor-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
  min-height: 0;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.content-header label {
  font-family: "LXGW WenKai", serif;
  font-size: 0.8125rem;
  color: var(--ink-dark);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.char-count {
  font-size: 0.75rem;
  color: var(--ink-sandalwood);
  transition: color 0.3s ease;
  font-family: "LXGW WenKai", serif;
}

.char-count.is-valid {
  color: #22c55e;
  font-weight: 500;
}

.content-textarea {
  flex: 1;
  width: 100%;
  min-height: 200px;
  padding: 1rem;
  font-family: "LXGW WenKai", serif;
  font-size: 1rem;
  line-height: 1.8;
  background-color: var(--ink-paper);
  border: 2px solid var(--ink-rice);
  border-radius: 8px;
  outline: none;
  resize: none;
  transition: all 0.3s ease;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.02);
}

.content-textarea:focus {
  border-color: var(--ink-ochre);
  box-shadow: 0 0 0 3px rgba(139, 69, 19, 0.1), inset 0 2px 4px rgba(0, 0, 0, 0.02);
}

.content-textarea::placeholder {
  color: var(--ink-sandalwood);
  opacity: 0.7;
}

/* 上传区域 */
.upload-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.upload-area {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed var(--ink-rice);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 200px;
  background: linear-gradient(135deg, rgba(139, 69, 19, 0.02) 0%, transparent 100%);
}

.upload-area:hover,
.upload-area.drag-over {
  border-color: var(--ink-ochre);
  background-color: var(--ink-hover);
}

.file-input {
  display: none;
}

.upload-content {
  text-align: center;
}

.upload-icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 0.75rem;
}

.upload-text {
  font-family: "LXGW WenKai", serif;
  font-size: 1rem;
  color: var(--ink-dark);
  margin-bottom: 0.25rem;
}

.upload-hint {
  font-family: "LXGW WenKai", serif;
  font-size: 0.8125rem;
  color: var(--ink-sandalwood);
}

/* 代码编辑提示 */
.code-edit-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.code-edit-hint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(59, 130, 246, 0.08);
  border-radius: 8px;
  font-size: 0.875rem;
  color: #3b82f6;
  font-family: "LXGW WenKai", serif;
}

.hint-icon {
  font-size: 1rem;
}

/* 元信息区域 */
.meta-section {
  background: linear-gradient(135deg, rgba(139, 69, 19, 0.02) 0%, transparent 100%);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid var(--ink-rice);
  flex-shrink: 0;
}

.meta-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.meta-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.meta-label {
  font-family: "LXGW WenKai", serif;
  font-size: 0.8125rem;
  color: var(--ink-sandalwood);
}

.meta-btn {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  background: rgba(139, 69, 19, 0.08);
  border: 1px solid var(--ink-rice);
  border-radius: 4px;
  color: var(--ink-ochre);
  cursor: pointer;
  font-family: "LXGW WenKai", serif;
  transition: all 0.2s ease;
}

.meta-btn:hover:not(:disabled) {
  background: var(--ink-ochre);
  color: var(--ink-paper);
  border-color: var(--ink-ochre);
}

.meta-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.meta-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.meta-tag {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  background: rgba(139, 69, 19, 0.1);
  color: var(--ink-ochre);
  border-radius: 3px;
  font-family: "LXGW WenKai", serif;
}

.meta-summary {
  font-family: "LXGW WenKai", serif;
  font-size: 0.8125rem;
  color: var(--ink-dark);
  line-height: 1.5;
  padding: 0.5rem;
  background: rgba(139, 69, 19, 0.03);
  border-radius: 4px;
}

.meta-empty {
  font-family: "LXGW WenKai", serif;
  font-size: 0.8125rem;
  color: var(--ink-sandalwood);
  font-style: italic;
  padding: 0.5rem;
}

/* 视图切换标签 */
.view-tabs {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem;
  background: linear-gradient(135deg, rgba(139, 69, 19, 0.03) 0%, rgba(139, 69, 19, 0.01) 100%);
  border-bottom: 1px solid var(--ink-rice);
  flex-shrink: 0;
}

.view-tab {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  font-family: "LXGW WenKai", serif;
  font-size: 0.8125rem;
  color: var(--ink-sandalwood);
  background: none;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.view-tab:hover {
  color: var(--ink-dark);
  background-color: rgba(139, 69, 19, 0.05);
}

.view-tab.active {
  background-color: var(--ink-ochre);
  color: var(--ink-paper);
}

.view-actions {
  margin-left: auto;
  display: flex;
  gap: 0.25rem;
}

.view-action-btn {
  width: 26px;
  height: 26px;
  border: 1px solid var(--ink-rice);
  background: var(--ink-paper);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8125rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.view-action-btn:hover {
  background: var(--ink-hover);
  border-color: var(--ink-ochre);
}

/* 工作区内容 */
.workspace-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

/* 代码视图 */
.code-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  background: rgba(139, 69, 19, 0.03);
  border-bottom: 1px solid var(--ink-rice);
  flex-shrink: 0;
}

.code-title {
  font-family: "LXGW WenKai", serif;
  font-size: 0.8125rem;
  color: var(--ink-dark);
  font-weight: 500;
}

.code-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.code-stats {
  font-size: 0.75rem;
  color: var(--ink-sandalwood);
  background: rgba(139, 69, 19, 0.08);
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
}

.code-editor-wrapper {
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

.code-editor {
  width: 100%;
  height: 100%;
  padding: 0.75rem;
  font-family: "Fira Code", "Consolas", "Monaco", monospace;
  font-size: 0.8125rem;
  line-height: 1.6;
  background-color: #1e1e1e;
  color: #d4d4d4;
  border: none;
  outline: none;
  resize: none;
  white-space: pre;
  overflow-wrap: normal;
  overflow: auto;
}

.stream-display {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0.75rem;
  white-space: pre-wrap;
  word-break: break-all;
  font-family: "Fira Code", "Consolas", "Monaco", monospace;
  font-size: 0.8125rem;
  line-height: 1.6;
  color: #d4d4d4;
  background-color: #1e1e1e;
  overflow: auto;
}

.typing-indicator {
  display: flex;
  gap: 0.25rem;
}

.typing-indicator .dot {
  width: 6px;
  height: 6px;
  background: #22c55e;
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-indicator .dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator .dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-4px); }
}

.status-text {
  font-family: "LXGW WenKai", serif;
  font-size: 0.8125rem;
  color: #888;
}

.speed-tag {
  font-size: 0.75rem;
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-weight: 500;
}

/* 预览视图 */
.preview-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  background: rgba(139, 69, 19, 0.03);
  border-bottom: 1px solid var(--ink-rice);
  flex-shrink: 0;
}

.preview-title {
  font-family: "LXGW WenKai", serif;
  font-size: 0.8125rem;
  color: var(--ink-dark);
  font-weight: 500;
}

.preview-container {
  flex: 1;
  padding: 0.75rem;
  background: var(--ink-hover);
  overflow: auto;
  min-height: 0;
}

.preview-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--ink-sandalwood);
}

.empty-icon {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
  opacity: 0.5;
}

.preview-empty p {
  font-family: "LXGW WenKai", serif;
  font-size: 0.9375rem;
  margin-bottom: 0.375rem;
}

.empty-hint {
  font-size: 0.8125rem;
  opacity: 0.7;
}

/* 响应式适配 - 平板 */
@media (max-width: 1024px) {
  .diary-editor__body {
    flex-direction: column;
    overflow-y: auto;
  }
  
  .editor-panel {
    width: 100% !important;
    flex: none;
  }
  
  .panel-left,
  .panel-right {
    border: none;
    border-bottom: 1px solid var(--ink-rice);
  }
  
  .resizer {
    display: none;
  }
  
  .panel-content {
    max-height: none;
  }
  
  .content-textarea {
    min-height: 150px;
  }
}

/* 响应式适配 - 手机 */
@media (max-width: 768px) {
  .diary-editor__header {
    flex-wrap: wrap;
    padding: 0.75rem 1rem;
    gap: 0.5rem;
  }
  
  .header-center {
    order: -1;
    width: 100%;
    text-align: left;
  }
  
  .editor-title {
    font-size: 1.25rem;
  }
  
  .panel-header {
    padding: 0.625rem 0.875rem;
  }
  
  .panel-content {
    padding: 0.875rem;
  }
  
  .mode-tabs {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  
  .mode-tabs::-webkit-scrollbar {
    display: none;
  }
  
  .editor-fields {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .date-field {
    min-width: auto;
  }
  
  .mood-grid,
  .style-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .setting-card {
    min-height: 45px;
    padding: 0.375rem;
  }
  
  .card-icon {
    font-size: 1.125rem;
  }
  
  .card-name {
    font-size: 0.625rem;
  }
  
  .meta-row {
    grid-template-columns: 1fr;
  }
  
  .content-textarea {
    min-height: 120px;
  }
  
  .view-tabs {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  
  .view-tabs::-webkit-scrollbar {
    display: none;
  }
}

@media (max-width: 480px) {
  .diary-editor__header {
    padding: 0.75rem;
  }
  
  .editor-title {
    font-size: 1.125rem;
  }
  
  .panel-content {
    padding: 0.75rem;
  }
  
  .mood-grid,
  .style-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .mode-tab,
  .view-tab {
    padding: 0.375rem 0.625rem;
    font-size: 0.75rem;
  }
}

/* ========================================
   自定义弹窗样式 - 国风风格
   ======================================== */

/* 弹窗遮罩层 */
.dialog-overlay {
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
  animation: fadeIn 0.2s ease;
  backdrop-filter: blur(2px);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 弹窗容器 */
.confirm-dialog {
  background: linear-gradient(135deg, var(--ink-paper) 0%, #fdfbf5 100%);
  padding: 2rem 2.5rem;
  border-radius: 12px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(139, 69, 19, 0.1);
  text-align: center;
  max-width: 400px;
  width: 90%;
  animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 弹窗图标 */
.dialog-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  animation: bounceIn 0.5s ease;
}

@keyframes bounceIn {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

/* 弹窗标题 */
.dialog-title {
  font-family: "LXGW WenKai", serif;
  font-size: 1.375rem;
  font-weight: 500;
  color: var(--ink-dark);
  margin-bottom: 0.75rem;
  letter-spacing: 0.05em;
}

/* 弹窗消息 */
.dialog-message {
  font-family: "LXGW WenKai", serif;
  font-size: 0.9375rem;
  color: var(--ink-sandalwood);
  margin-bottom: 1.75rem;
  line-height: 1.7;
}

/* 弹窗按钮组 */
.dialog-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

/* 弹窗按钮基础样式 */
.dialog-btn {
  font-family: "LXGW WenKai", serif;
  font-size: 0.9375rem;
  padding: 0.625rem 1.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  outline: none;
  letter-spacing: 0.05em;
}

/* 主要按钮 */
.dialog-btn-primary {
  background: linear-gradient(135deg, var(--ink-ochre) 0%, #a0522d 100%);
  color: var(--ink-paper);
  box-shadow: 0 4px 12px rgba(139, 69, 19, 0.3);
}

.dialog-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(139, 69, 19, 0.4);
}

.dialog-btn-primary:active {
  transform: translateY(0);
}

/* 次要按钮 */
.dialog-btn-secondary {
  background: transparent;
  color: var(--ink-sandalwood);
  border: 1px solid var(--ink-rice);
}

.dialog-btn-secondary:hover {
  border-color: var(--ink-ochre);
  color: var(--ink-ochre);
  background: rgba(139, 69, 19, 0.05);
}

/* 危险操作按钮 */
.dialog-btn-danger {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%) !important;
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3) !important;
}

.dialog-btn-danger:hover {
  box-shadow: 0 6px 16px rgba(220, 53, 69, 0.4) !important;
}

/* 成功按钮 */
.dialog-btn-success {
  background: linear-gradient(135deg, #28a745 0%, #218838 100%) !important;
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3) !important;
}

.dialog-btn-success:hover {
  box-shadow: 0 6px 16px rgba(40, 167, 69, 0.4) !important;
}

/* 提示弹窗特殊样式 */
.alert-dialog .dialog-icon {
  color: var(--ink-ochre);
}

/* 弹窗关闭动画 */
.dialog-overlay.closing .confirm-dialog {
  animation: slideDown 0.2s ease forwards;
}

@keyframes slideDown {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(10px) scale(0.95);
  }
}

/* 弹窗响应式适配 */
@media (max-width: 480px) {
  .confirm-dialog {
    padding: 1.5rem 1.75rem;
    margin: 1rem;
    width: calc(100% - 2rem);
  }
  
  .dialog-icon {
    font-size: 2.5rem;
  }
  
  .dialog-title {
    font-size: 1.25rem;
  }
  
  .dialog-message {
    font-size: 0.875rem;
  }
  
  .dialog-actions {
    flex-direction: column-reverse;
    gap: 0.75rem;
  }
  
  .dialog-btn {
    width: 100%;
    padding: 0.75rem 1.5rem;
  }
}
</style>
