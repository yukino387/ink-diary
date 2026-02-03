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
    
    <!-- 编辑器主体 -->
    <div class="diary-editor__body">
      <!-- 左侧：编辑区 -->
      <div class="editor-panel">
        <!-- 模式切换标签 -->
        <div class="mode-tabs">
          <button
            v-for="mode in editModes"
            :key="mode.value"
            :class="['mode-tab', { active: currentMode === mode.value }]"
            @click="currentMode = mode.value"
          >
            <span class="tab-icon">
              <svg v-if="mode.value === 'wenxin'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
              </svg>
              <svg v-else-if="mode.value === 'upload'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <svg v-else-if="mode.value === 'code'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="16 18 22 12 16 6"></polyline>
                <polyline points="8 6 2 12 8 18"></polyline>
              </svg>
            </span>
            <span class="tab-label">{{ mode.label }}</span>
          </button>
        </div>
        
        <!-- 模式一：文思（AI润色） -->
        <div v-if="currentMode === 'wenxin'" class="mode-panel">
          <div class="wenxin-form">
            <!-- 标题输入 -->
            <div class="form-group">
              <label>标题</label>
              <input
                v-model="diaryForm.title"
                type="text"
                placeholder="给你的日记起个标题..."
                class="form-input"
              />
            </div>
            
            <!-- 心情选择 -->
            <div class="form-group">
              <label>心情</label>
              <div class="mood-selector">
                <button
                  v-for="mood in moodOptions"
                  :key="mood.value"
                  :class="['mood-btn', { active: diaryForm.mood === mood.value }]"
                  @click="diaryForm.mood = mood.value"
                  :title="mood.label"
                >
                  <span class="mood-icon">{{ mood.icon }}</span>
                  <span class="mood-label">{{ mood.label }}</span>
                </button>
              </div>
            </div>
            
            <!-- 日期选择 -->
            <div class="form-group">
              <label>日期</label>
              <input
                v-model="diaryForm.date"
                type="date"
                class="form-input"
              />
            </div>
            
            <!-- 正文输入 -->
            <div class="form-group">
              <label>正文</label>
              <textarea
                v-model="diaryForm.content"
                class="content-editor"
                placeholder="在这里写下你的日记内容...&#10;&#10;AI会根据你的原文进行润色排版，生成精美的HTML日记。请放心，AI会尊重你的原意，只做适当的优化和美化。"
                rows="8"
              ></textarea>
              <span class="char-count">{{ diaryForm.content.length }} 字</span>
            </div>
            
            <!-- 风格选择 -->
            <div class="form-group">
              <label>视觉风格</label>
              <div class="style-selector">
                <select v-model="diaryForm.style" class="form-select">
                  <option 
                    v-for="style in styleOptions" 
                    :key="style.value" 
                    :value="style.value"
                  >
                    {{ style.icon || '◆' }} {{ style.label }} - {{ style.description }}
                  </option>
                </select>
                <div class="style-preview" :class="diaryForm.style">
                  <span v-if="diaryForm.style === 'none'">无风格 - 请在下方自定义</span>
                  <span v-else>预览样式</span>
                </div>
              </div>
            </div>
            
            <!-- 自定义预设 -->
            <div class="form-group">
              <label>
                {{ diaryForm.style === 'none' ? '自定义风格（必填）' : '额外要求（可选）' }}
              </label>
              <textarea
                v-model="diaryForm.preset"
                :placeholder="diaryForm.style === 'none' 
                  ? '请描述您想要的风格，如：古风诗意、简约现代、文艺清新、科技感...' 
                  : '如：希望多使用比喻修辞、想要更抒情的表达...'"
                class="form-input"
                rows="3"
              ></textarea>
              <span v-if="diaryForm.style === 'none'" class="preset-hint">
                💡 选择"无风格"后，请在此详细描述您想要的视觉风格和排版要求
              </span>
            </div>
            
            <!-- 生成设置 -->
            <div class="form-group settings-group">
              <label class="settings-label">
                <input
                  v-model="generationSettings.saveOriginal"
                  type="checkbox"
                />
                保存原文
              </label>
              <label class="settings-label">
                <input
                  v-model="generationSettings.streaming"
                  type="checkbox"
                />
                流式输出
              </label>
            </div>
            
            <!-- 操作按钮组 -->
            <div class="action-buttons">
              <InkButton
                text="✨ 开始润色"
                variant="primary"
                :loading="generating"
                :disabled="!canGenerate"
                block
                @click="generateContent"
              />
              <InkButton
                v-if="htmlContent && !generating"
                text="🔄 重新生成"
                variant="default"
                block
                @click="generateContent"
              />
              <InkButton
                v-if="htmlContent"
                text="💾 保存日记"
                variant="primary"
                :loading="saving"
                block
                @click="saveDiary"
              >
                <template #icon>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                  </svg>
                </template>
              </InkButton>
            </div>
            
            <!-- AI 配置提示 -->
            <p v-if="!aiConfigured" class="ai-notice">
              ⚠️ 请先在设置中配置 AI API 才能使用润色功能
            </p>
            
            <!-- 生成进度/流式输出显示 -->
            <div v-if="generating || streamContent" class="generation-status">
              <div class="status-header">
                <span class="status-label">
                  {{ generating ? '正在润色中...' : '润色完成' }}
                </span>
                <span v-if="generating" class="typing-indicator">
                  <span class="dot"></span>
                  <span class="dot"></span>
                  <span class="dot"></span>
                </span>
              </div>
              <div v-if="streamContent" class="stream-preview">
                <pre>{{ streamContent }}</pre>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 模式二：文件上传 -->
        <div v-else-if="currentMode === 'upload'" class="mode-panel">
          <div class="form-group">
            <label>标题</label>
            <input
              v-model="diaryForm.title"
              type="text"
              placeholder="给你的日记起个标题..."
              class="form-input"
            />
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
          
          <!-- 操作按钮组 -->
          <div class="action-buttons">
            <InkButton
              text="🏷️ 生成标签"
              variant="default"
              :loading="generatingTags"
              :disabled="!canGenerateMetaForCode"
              block
              @click="generateTagsForCode"
            />
            <InkButton
              text="📝 生成摘要"
              variant="default"
              :loading="generatingSummary"
              :disabled="!canGenerateMetaForCode"
              block
              @click="generateSummaryForCode"
            />
          </div>
          
          <p v-if="!aiConfigured" class="ai-notice">
            ⚠️ 请先在设置中配置 AI API 才能使用生成标签和摘要功能
          </p>
        </div>
        
        <!-- 模式三：代码编辑 -->
        <div v-else-if="currentMode === 'code'" class="mode-panel">
          <div class="form-group">
            <label>标题</label>
            <input
              v-model="diaryForm.title"
              type="text"
              placeholder="给你的日记起个标题..."
              class="form-input"
            />
          </div>
          
          <div class="form-group">
            <label>HTML 代码</label>
            <textarea
              v-model="htmlContent"
              class="code-editor"
              placeholder="在此输入 HTML 代码..."
              spellcheck="false"
              rows="12"
            ></textarea>
          </div>
          
          <!-- 操作按钮组 -->
          <div class="action-buttons">
            <InkButton
              text="🏷️ 生成标签"
              variant="default"
              :loading="generatingTags"
              :disabled="!canGenerateMetaForCode"
              block
              @click="generateTagsForCode"
            />
            <InkButton
              text="📝 生成摘要"
              variant="default"
              :loading="generatingSummary"
              :disabled="!canGenerateMetaForCode"
              block
              @click="generateSummaryForCode"
            />
          </div>
          
          <p v-if="!aiConfigured" class="ai-notice">
            ⚠️ 请先在设置中配置 AI API 才能使用生成标签和摘要功能
          </p>
        </div>
        
        <!-- 生成结果编辑区（文思模式下显示） -->
        <div v-if="currentMode === 'wenxin' && htmlContent && !generating" class="result-editor">
          <div class="result-header">
            <span class="result-label">生成结果（可编辑）</span>
            <InkButton
              text="清空"
              variant="ghost"
              size="small"
              @click="clearContent"
            />
          </div>
          <textarea
            v-model="htmlContent"
            class="code-editor"
            spellcheck="false"
            rows="6"
          ></textarea>
        </div>
      </div>
      
      <!-- 右侧：预览区 -->
      <div class="preview-panel">
        <div class="preview-header">
          <span class="preview-title">实时预览</span>
          <div class="preview-actions">
            <InkButton
              text="刷新"
              icon="↻"
              variant="ghost"
              size="small"
              @click="refreshPreview"
            />
          </div>
        </div>
        <div class="preview-content">
          <SandboxRenderer
            v-if="htmlContent"
            :html-content="htmlContent"
            title="预览"
            :show-security-notice="false"
            height="100%"
            style="min-height: 500px;"
          />
          <div v-else class="preview-empty">
            <span class="empty-icon">👁</span>
            <p>预览区域</p>
            <p class="empty-hint">
              {{ currentMode === 'wenxin' ? '点击"开始润色"生成日记预览' : '在左侧编辑内容后将在此显示预览' }}
            </p>
          </div>
        </div>
        
        <!-- 生成的元信息展示 -->
        <div class="meta-panel">
          <!-- 标签区域 -->
          <div class="meta-section">
            <div class="meta-header">
              <span class="meta-label">标签：</span>
              <InkButton
                text="🏷️ 生成标签"
                variant="ghost"
                size="small"
                :loading="generatingTags"
                :disabled="!canGenerateMeta"
                @click="generateTagsOnly"
              />
            </div>
            <div v-if="generatedMeta.tags.length > 0" class="meta-tags">
              <span v-for="tag in generatedMeta.tags" :key="tag" class="meta-tag">{{ tag }}</span>
            </div>
            <div v-else class="meta-empty">暂无标签</div>
          </div>
          
          <!-- 摘要区域 -->
          <div class="meta-section">
            <div class="meta-header">
              <span class="meta-label">摘要：</span>
              <InkButton
                text="📝 生成摘要"
                variant="ghost"
                size="small"
                :loading="generatingSummary"
                :disabled="!canGenerateMeta"
                @click="generateSummaryOnly"
              />
            </div>
            <div v-if="generatedMeta.summary" class="meta-summary">{{ generatedMeta.summary }}</div>
            <div v-else class="meta-empty">暂无摘要</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
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
 * DiaryEditor - 日记编辑器视图
 * 
 * 功能：
 * - 三种编辑模式：文思（AI润色）、文件上传、代码编辑
 * - 文思模式支持标题、心情、日期、正文、风格、预设
 * - AI根据用户原文润色生成精美HTML日记
 * - 自动生成标签、摘要
 * - 支持流式输出
 * - 实时预览编辑内容
 * - 支持新建和编辑两种模式
 */

const route = useRoute()
const router = useRouter()

// 编辑模式
const editModes = [
  { value: 'wenxin', label: '文思', icon: '✨' },
  { value: 'upload', label: '上传', icon: '📁' },
  { value: 'code', label: '代码', icon: '</>' }
]

const styleOptions = STYLE_OPTIONS
const moodOptions = MOOD_OPTIONS

// 响应式状态
const currentMode = ref('wenxin') // 默认文思模式
const saving = ref(false)
const generating = ref(false)
const generatingTags = ref(false)
const generatingSummary = ref(false)
const isDragging = ref(false)
const aiConfigured = ref(false)
const fileInput = ref(null)
const htmlContent = ref('')
const streamContent = ref('')

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
  
  // 如果选择无风格，必须有自定义风格描述
  if (diaryForm.value.style === 'none') {
    return hasBasicInfo && diaryForm.value.preset.trim().length >= 5
  }
  
  return hasBasicInfo
})

// 判断是否可以生成标签和摘要（只需要标题和内容）
const canGenerateMeta = computed(() => {
  return aiConfigured.value && 
         diaryForm.value.title.trim() && 
         diaryForm.value.content.trim().length >= 5
})

// 判断代码/上传模式是否可以生成标签和摘要（需要标题和HTML内容）
const canGenerateMetaForCode = computed(() => {
  return aiConfigured.value && 
         diaryForm.value.title.trim() && 
         htmlContent.value.trim().length >= 50
})

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
    // 新建模式，初始化默认值
    diaryForm.value.date = formatDate(new Date().toISOString())
    return
  }
  
  try {
    const diary = await getDiary(id)
    if (diary) {
      // 填充表单
      diaryForm.value.title = diary.title || ''
      diaryForm.value.mood = diary.mood || 'calm'
      diaryForm.value.date = formatDate(diary.createTime)
      diaryForm.value.style = diary.style || 'classical'
      diaryForm.value.preset = diary.preset || ''
      diaryForm.value.content = diary.originalContent || ''
      
      // 填充生成内容
      htmlContent.value = diary.htmlContent || ''
      generatedMeta.value.tags = diary.tags || []
      generatedMeta.value.summary = diary.summary || ''
      
      console.log('[DiaryEditor] 加载日记:', diary.title)
    } else {
      alert('日记不存在')
      router.push('/')
    }
  } catch (error) {
    console.error('[DiaryEditor] 加载日记失败:', error)
    alert('加载失败: ' + error.message)
  }
}

// 保存日记
async function saveDiary() {
  if (!diaryForm.value.title.trim()) {
    alert('请输入日记标题')
    return
  }
  
  if (!htmlContent.value.trim()) {
    alert('请先生成或输入日记内容')
    return
  }
  
  saving.value = true
  
  try {
    const moodInfo = getMoodByValue(diaryForm.value.mood)
    const styleInfo = getStyleByValue(diaryForm.value.style)
    
    const diaryData = {
      title: diaryForm.value.title.trim(),
      htmlContent: htmlContent.value.trim(),
      // 新增字段
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
    
    // 保存成功后返回列表
    router.push('/')
  } catch (error) {
    console.error('[DiaryEditor] 保存失败:', error)
    alert('保存失败: ' + error.message)
  } finally {
    saving.value = false
  }
}

// 返回上一页
function goBack() {
  if (confirm('确定要放弃当前编辑吗？')) {
    router.back()
  }
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
    alert('请选择 HTML 文件')
  }
}

// 读取文件内容
function readFile(file) {
  const reader = new FileReader()
  reader.onload = (e) => {
    htmlContent.value = e.target.result
    // 尝试从文件名提取标题
    if (!diaryForm.value.title) {
      diaryForm.value.title = file.name.replace(/\.html?$/i, '')
    }
    console.log('[DiaryEditor] 文件已读取:', file.name)
  }
  reader.onerror = () => {
    alert('文件读取失败')
  }
  reader.readAsText(file)
}

// AI 生成内容
async function generateContent() {
  if (!canGenerate.value) return
  
  generating.value = true
  streamContent.value = ''
  
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
      // 流式生成
      await generateDiaryContentStream(
        params,
        // onChunk
        (chunk) => {
          streamContent.value += chunk
          // 实时更新预览（每收到一定长度内容就更新）
          if (streamContent.value.length > 100 && streamContent.value.includes('<')) {
            htmlContent.value = streamContent.value
          }
        },
        // onComplete
        (result) => {
          htmlContent.value = result.html
          generatedMeta.value.tags = result.tags
          generatedMeta.value.summary = result.summary
          streamContent.value = ''
          generating.value = false
          console.log('[DiaryEditor] AI 流式生成完成')
        },
        // onError
        (error) => {
          console.error('[DiaryEditor] AI 流式生成失败:', error)
          alert('生成失败: ' + error.message)
          generating.value = false
        }
      )
    } else {
      // 非流式生成
      const result = await generateDiaryContent(params)
      htmlContent.value = result.html
      generatedMeta.value.tags = result.tags
      generatedMeta.value.summary = result.summary
      generating.value = false
      console.log('[DiaryEditor] AI 生成成功')
    }
  } catch (error) {
    console.error('[DiaryEditor] AI 生成失败:', error)
    alert('生成失败: ' + error.message)
    generating.value = false
  }
}

// 清空内容
function clearContent() {
  if (confirm('确定要清空当前内容吗？')) {
    htmlContent.value = ''
    streamContent.value = ''
    generatedMeta.value.tags = []
    generatedMeta.value.summary = ''
  }
}

// 刷新预览
function refreshPreview() {
  // SandboxRenderer 会自动响应 htmlContent 变化
  // 这里可以添加额外的刷新逻辑
}

// 独立生成标签
async function generateTagsOnly() {
  if (!canGenerateMeta.value) return
  
  generatingTags.value = true
  try {
    const moodInfo = getMoodByValue(diaryForm.value.mood)
    const params = {
      title: diaryForm.value.title,
      content: diaryForm.value.content,
      moodLabel: moodInfo.label
    }
    
    const tags = await generateTags(params)
    generatedMeta.value.tags = tags
    console.log('[DiaryEditor] 标签生成完成:', tags)
  } catch (error) {
    console.error('[DiaryEditor] 生成标签失败:', error)
    alert('生成标签失败: ' + error.message)
  } finally {
    generatingTags.value = false
  }
}

// 独立生成摘要
async function generateSummaryOnly() {
  if (!canGenerateMeta.value) return
  
  generatingSummary.value = true
  try {
    const moodInfo = getMoodByValue(diaryForm.value.mood)
    const params = {
      title: diaryForm.value.title,
      content: diaryForm.value.content,
      moodLabel: moodInfo.label
    }
    
    const summary = await generateSummary(params)
    generatedMeta.value.summary = summary
    console.log('[DiaryEditor] 摘要生成完成:', summary)
  } catch (error) {
    console.error('[DiaryEditor] 生成摘要失败:', error)
    alert('生成摘要失败: ' + error.message)
  } finally {
    generatingSummary.value = false
  }
}

// 代码/上传模式：从HTML提取纯文本
function extractTextFromHtml(html) {
  if (!html) return ''
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html
  return tempDiv.textContent || tempDiv.innerText || ''
}

// 代码/上传模式：生成标签
async function generateTagsForCode() {
  if (!canGenerateMetaForCode.value) return
  
  generatingTags.value = true
  try {
    // 从HTML提取纯文本
    const plainText = extractTextFromHtml(htmlContent.value)
    
    const params = {
      title: diaryForm.value.title,
      content: plainText,
      moodLabel: ''
    }
    
    const tags = await generateTags(params)
    generatedMeta.value.tags = tags
    console.log('[DiaryEditor] 标签生成完成:', tags)
  } catch (error) {
    console.error('[DiaryEditor] 生成标签失败:', error)
    alert('生成标签失败: ' + error.message)
  } finally {
    generatingTags.value = false
  }
}

// 代码/上传模式：生成摘要
async function generateSummaryForCode() {
  if (!canGenerateMetaForCode.value) return
  
  generatingSummary.value = true
  try {
    // 从HTML提取纯文本
    const plainText = extractTextFromHtml(htmlContent.value)
    
    const params = {
      title: diaryForm.value.title,
      content: plainText,
      moodLabel: ''
    }
    
    const summary = await generateSummary(params)
    generatedMeta.value.summary = summary
    console.log('[DiaryEditor] 摘要生成完成:', summary)
  } catch (error) {
    console.error('[DiaryEditor] 生成摘要失败:', error)
    alert('生成摘要失败: ' + error.message)
  } finally {
    generatingSummary.value = false
  }
}

// 组件挂载时初始化
onMounted(() => {
  checkAIConfig()
  loadDiary()
})
</script>

<style scoped>
/* 编辑器容器 */
.diary-editor {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--ink-paper);
}

/* 顶部操作栏 */
.diary-editor__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background-color: var(--ink-paper);
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
}

/* 编辑器主体 */
.diary-editor__body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* 左侧面板 */
.editor-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  border-right: 1px solid var(--ink-rice);
  overflow-y: auto;
  max-width: 50%;
  min-width: 400px;
}

/* 模式切换标签 */
.mode-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--ink-rice);
  padding-bottom: 0.5rem;
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
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mode-tab:hover {
  background-color: var(--ink-hover);
  color: var(--ink-dark);
}

.mode-tab.active {
  background-color: var(--ink-ochre);
  color: var(--ink-paper);
}

.tab-icon {
  font-size: 1rem;
}

/* 模式面板 */
.mode-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
}

/* 文思表单 */
.wenxin-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.form-group label {
  font-family: "LXGW WenKai", serif;
  font-size: 0.875rem;
  color: var(--ink-dark);
  font-weight: 500;
}

.form-input,
.form-select {
  padding: 0.625rem 0.875rem;
  font-family: "LXGW WenKai", serif;
  font-size: 0.9375rem;
  background-color: var(--ink-paper);
  border: 1px solid var(--ink-rice);
  border-radius: 2px;
  outline: none;
  transition: all 0.3s ease;
}

.form-input:focus,
.form-select:focus {
  border-color: var(--ink-ochre);
  box-shadow: 0 0 0 3px rgba(139, 69, 19, 0.1);
}

.form-input::placeholder {
  color: var(--ink-sandalwood);
}

/* 心情选择器 */
.mood-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.mood-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  background: var(--ink-paper);
  border: 1px solid var(--ink-rice);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 60px;
}

.mood-btn:hover {
  background: var(--ink-hover);
  border-color: var(--ink-ochre);
}

.mood-btn.active {
  background: var(--ink-ochre);
  border-color: var(--ink-ochre);
  color: var(--ink-paper);
}

.mood-icon {
  font-size: 1.25rem;
}

.mood-label {
  font-size: 0.75rem;
  font-family: "LXGW WenKai", serif;
}

/* 正文编辑器 */
.content-editor {
  width: 100%;
  min-height: 150px;
  padding: 1rem;
  font-family: "LXGW WenKai", serif;
  font-size: 0.9375rem;
  line-height: 1.8;
  background-color: var(--ink-paper);
  border: 1px solid var(--ink-rice);
  border-radius: 2px;
  outline: none;
  resize: vertical;
  transition: all 0.3s ease;
}

.content-editor:focus {
  border-color: var(--ink-ochre);
  box-shadow: 0 0 0 3px rgba(139, 69, 19, 0.1);
}

.char-count {
  text-align: right;
  font-size: 0.75rem;
  color: var(--ink-sandalwood);
}

.preset-hint {
  font-size: 0.8rem;
  color: var(--ink-ochre);
  font-family: "LXGW WenKai", serif;
  margin-top: 0.25rem;
}

/* 风格选择器 */
.style-selector {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.style-preview {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-align: center;
  font-size: 0.875rem;
  font-family: "LXGW WenKai", serif;
}

.style-preview.classical {
  background: linear-gradient(to bottom, #faf8f3, #f5f0e8);
  color: #8b4513;
  border: 1px solid #d4c4b0;
}

.style-preview.minimal {
  background: #ffffff;
  color: #333333;
  border: 1px solid #ecf0f1;
}

.style-preview.literary {
  background: #f7f3e9;
  color: #9c6644;
  border: 1px solid #e6d5c3;
}

.style-preview.nature {
  background: linear-gradient(135deg, #f1f8e9 0%, #e8f5e9 100%);
  color: #558b2f;
  border: 1px solid #c5e1a5;
}

.style-preview.dreamy {
  background: linear-gradient(180deg, #f3e5f5 0%, #e8eaf6 50%, #e3f2fd 100%);
  color: #7b1fa2;
  border: 1px solid #e1bee7;
}

.style-preview.japanese {
  background: #fefefe;
  color: #e74c3c;
  border: 1px solid #ecf0f1;
}

.style-preview.ink {
  background: radial-gradient(ellipse at top, #f5f5f5, #e8e8e8);
  color: #1a1a1a;
  border: 1px solid #cccccc;
}

/* 设置组 */
.settings-group {
  flex-direction: row;
  gap: 1.5rem;
}

.settings-label {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  color: var(--ink-sandalwood);
  cursor: pointer;
}

.settings-label input[type="checkbox"] {
  cursor: pointer;
}

/* 操作按钮组 */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
  padding: 1rem;
  background-color: var(--ink-hover);
  border-radius: 4px;
  border: 1px solid var(--ink-rice);
}

/* AI 提示 */
.ai-notice {
  font-family: "LXGW WenKai", serif;
  font-size: 0.875rem;
  color: var(--ink-ochre);
  text-align: center;
  margin-top: 0.5rem;
}

/* 生成状态 */
.generation-status {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(139, 69, 19, 0.05);
  border-radius: 4px;
  border: 1px solid var(--ink-rice);
}

.status-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.status-label {
  font-family: "LXGW WenKai", serif;
  font-size: 0.875rem;
  color: var(--ink-dark);
}

.typing-indicator {
  display: flex;
  gap: 0.25rem;
}

.typing-indicator .dot {
  width: 6px;
  height: 6px;
  background: var(--ink-ochre);
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

.stream-preview {
  max-height: 150px;
  overflow-y: auto;
  background: var(--ink-paper);
  padding: 0.5rem;
  border-radius: 2px;
  font-size: 0.75rem;
  color: var(--ink-sandalwood);
}

.stream-preview pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  font-family: "Fira Code", monospace;
}

/* 上传区域 */
.upload-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed var(--ink-rice);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 200px;
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
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.upload-text {
  font-family: "LXGW WenKai", serif;
  font-size: 1rem;
  color: var(--ink-dark);
  margin-bottom: 0.5rem;
}

.upload-hint {
  font-family: "LXGW WenKai", serif;
  font-size: 0.875rem;
  color: var(--ink-sandalwood);
}

/* 代码编辑器 */
.code-editor {
  width: 100%;
  min-height: 150px;
  padding: 1rem;
  font-family: "Fira Code", "Consolas", monospace;
  font-size: 0.875rem;
  line-height: 1.6;
  background-color: #f8f6f0;
  color: var(--ink-dark);
  border: 1px solid var(--ink-rice);
  border-radius: 2px;
  outline: none;
  resize: vertical;
  transition: all 0.3s ease;
}

.code-editor:focus {
  border-color: var(--ink-ochre);
  box-shadow: 0 0 0 3px rgba(139, 69, 19, 0.1);
}

/* 结果编辑器 */
.result-editor {
  margin-top: 1rem;
  border-top: 1px solid var(--ink-rice);
  padding-top: 1rem;
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.result-label {
  font-family: "LXGW WenKai", serif;
  font-size: 0.875rem;
  color: var(--ink-sandalwood);
}

/* 右侧面板 */
.preview-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--ink-hover);
  min-height: 600px;
}

.preview-panel .preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--ink-rice);
}

.preview-title {
  font-family: "LXGW WenKai", serif;
  font-size: 1rem;
  color: var(--ink-dark);
}

.preview-actions {
  display: flex;
  gap: 0.5rem;
}

.preview-content {
  flex: 1;
  padding: 1.5rem;
  overflow: auto;
  min-height: 500px;
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
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.preview-empty p {
  font-family: "LXGW WenKai", serif;
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.empty-hint {
  font-size: 0.875rem;
  opacity: 0.7;
}

/* 元信息面板 */
.meta-panel {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--ink-rice);
  background: var(--ink-paper);
}

.meta-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.meta-section:last-child {
  margin-bottom: 0;
}

.meta-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.meta-label {
  font-family: "LXGW WenKai", serif;
  font-size: 0.875rem;
  color: var(--ink-sandalwood);
  flex-shrink: 0;
}

.meta-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.meta-tag {
  font-size: 0.75rem;
  padding: 0.25rem 0.625rem;
  background: rgba(139, 69, 19, 0.1);
  color: var(--ink-ochre);
  border-radius: 3px;
  font-family: "LXGW WenKai", serif;
}

.meta-summary {
  font-family: "LXGW WenKai", serif;
  font-size: 0.875rem;
  color: var(--ink-dark);
  line-height: 1.5;
  padding: 0.5rem;
  background: rgba(139, 69, 19, 0.03);
  border-radius: 4px;
}

.meta-empty {
  font-family: "LXGW WenKai", serif;
  font-size: 0.875rem;
  color: var(--ink-sandalwood);
  font-style: italic;
  padding: 0.5rem;
}

/* 响应式 */
@media (max-width: 1024px) {
  .diary-editor__body {
    flex-direction: column;
  }
  
  .editor-panel {
    max-width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--ink-rice);
  }
  
  .preview-panel {
    min-height: 400px;
  }
}

@media (max-width: 768px) {
  .diary-editor__header {
    flex-wrap: wrap;
    padding: 1rem;
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
  
  .editor-panel,
  .preview-content {
    padding: 1rem;
  }
  
  .mode-tabs {
    overflow-x: auto;
  }
  
  .mood-selector {
    justify-content: center;
  }
  
  .mood-btn {
    min-width: 50px;
    padding: 0.375rem 0.5rem;
  }
  
  .mood-label {
    font-size: 0.7rem;
  }
}
</style>
