<template>
  <Transition name="panel-fade">
    <div class="ai-thinking-panel" :class="panelClass">
      <!-- 微妙背景 -->
      <div class="panel-bg"></div>

      <!-- 头部 -->
      <div class="thinking-header">
        <div class="thinking-title">
          <div class="ai-avatar-wrapper">
            <div class="avatar-ring" :class="{ 'active': !isIdle && !isCompleted }"></div>
            <span class="ai-avatar" :class="{ 'thinking': !isIdle && !isCompleted, 'completed': isCompleted, 'error': isError }">
              {{ isError ? '⚠️' : isCompleted ? '✨' : '🤖' }}
            </span>
            <div v-if="!isIdle && !isCompleted" class="thinking-pulse"></div>
          </div>
          <div class="title-content">
            <div class="title-row">
              <span class="title-text">{{ titleText }}</span>
              <span v-if="currentRound > 0" class="round-badge" :class="{ 'completed': isCompleted }">
                {{ currentRound }}
              </span>
            </div>
            <span v-if="searchQuery" class="query-text" :title="searchQuery">
              {{ truncateText(searchQuery, 35) }}
            </span>
          </div>
        </div>
        <div class="thinking-status" :class="statusClass">
          <span class="status-icon">{{ statusIcon }}</span>
          <span class="status-text">{{ statusText }}</span>
          <div v-if="!isIdle && !isCompleted" class="status-dots">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>

      <!-- 进度条 -->
      <div class="progress-section" v-if="!isIdle">
        <div class="progress-bar-wrapper">
          <div class="progress-bar-track">
            <div class="progress-bar" :style="progressBarStyle" :class="{ 'completed': isCompleted }"></div>
          </div>
          <div class="progress-steps">
            <div v-for="n in 4" :key="n" class="step-dot" :class="{ 'active': progressPercent >= (n-1) * 33 }"></div>
          </div>
        </div>
        <div class="progress-info">
          <span class="stat-percent">{{ progressPercent }}%</span>
          <div v-if="thoughtConfidence > 0" class="info-divider"></div>
          <div v-if="thoughtConfidence > 0" class="confidence-info">
            <span class="confidence-label">信心</span>
            <span class="confidence-value-inline" :class="getConfidenceClass(thoughtConfidence)">{{ thoughtConfidence }}%</span>
          </div>
          <div class="info-divider"></div>
          <span v-if="elapsedTime" class="stat-time">{{ elapsedTime }}s</span>
          <div v-if="intermediateResult.found_count !== undefined" class="info-divider"></div>
          <div v-if="intermediateResult.found_count !== undefined" class="found-info">
            <span class="found-count">{{ intermediateResult.found_count }}</span>
            <span class="found-label">条</span>
          </div>
        </div>
      </div>

      <!-- 空闲状态 -->
      <Transition name="content-fade" mode="out-in">
        <div v-if="isIdle" key="idle" class="idle-state">
          <div class="idle-content">
            <span class="idle-icon">🔍</span>
            <p class="idle-title">输入搜索内容，AI将帮您查找日记</p>
          </div>
          <div class="idle-examples">
            <span v-for="(example, index) in examples" :key="index" class="example-chip" @click="$emit('example-click', example)">
              {{ example }}
            </span>
          </div>
        </div>

        <!-- 思考气泡 -->
        <div v-else-if="currentThought" key="thinking" class="thought-bubble">
          <div class="thought-header">
            <div class="thought-icon-wrapper">
              <span class="thought-icon">💭</span>
            </div>
            <div class="thought-meta">
              <span class="thought-label">AI 思考中</span>
              <span class="thought-time">{{ currentTime }}</span>
            </div>
          </div>
          <div class="thought-content">
            <div class="thought-text-wrapper">
              <div class="thought-text" v-html="formattedThought"></div>
              <div v-if="isTyping" class="typing-cursor"></div>
            </div>
            <div v-if="thoughtReasoning" class="thought-reasoning">
              <div class="reasoning-header">
                <span class="reasoning-icon">🧠</span>
                <span class="reasoning-title">推理过程</span>
              </div>
              <div class="reasoning-content">{{ thoughtReasoning }}</div>
            </div>
          </div>
        </div>
      </Transition>

      <!-- 工具调用 -->
      <Transition name="slide-up">
        <div v-if="currentToolCalls && currentToolCalls.length > 0" class="tool-call-section">
          <div class="tool-call-header" @click="toggleToolDetails">
            <div class="tool-header-left">
              <div class="tool-icon-wrapper">
                <span class="tool-icon">🔧</span>
              </div>
              <span class="tool-name">{{ toolNameDisplay }}</span>
              <span v-if="currentToolCalls.length > 1" class="tool-count">+{{ currentToolCalls.length - 1 }}</span>
            </div>
            <div class="tool-header-right">
              <span class="tool-status">{{ showToolDetails ? '收起' : '展开' }}</span>
              <svg class="tool-toggle" :class="{ 'expanded': showToolDetails }" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
          </div>
          
          <Transition name="expand">
            <div v-show="showToolDetails" class="tool-details">
              <div v-for="(toolCall, index) in currentToolCalls" :key="index" class="tool-item">
                <div class="tool-item-header">
                  <span class="tool-item-name">{{ toolCall.tool }}</span>
                  <svg class="tool-item-status" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <pre class="tool-params"><code>{{ formatParams(toolCall.params) }}</code></pre>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>

      <!-- 中间结果 -->
      <Transition name="slide-up">
        <div v-if="hasIntermediateResults" class="intermediate-results">
          <div class="results-grid">
            <div v-if="intermediateResult.matched_tags?.length" class="result-item">
              <div class="result-icon-wrapper">
                <span class="result-icon">🏷️</span>
              </div>
              <div class="result-tags">
                <span v-for="tag in intermediateResult.matched_tags.slice(0, 2)" :key="tag" class="result-tag">{{ tag }}</span>
                <span v-if="intermediateResult.matched_tags.length > 2" class="tag-more">+{{ intermediateResult.matched_tags.length - 2 }}</span>
              </div>
            </div>
            <div v-if="intermediateResult.matched_moods?.length" class="result-item">
              <div class="result-icon-wrapper moods">
                <span class="result-icon">😊</span>
              </div>
              <div class="result-moods">
                <span v-for="mood in intermediateResult.matched_moods.slice(0, 2)" :key="mood" class="result-mood">{{ mood }}</span>
              </div>
            </div>
            <div v-if="intermediateResult.time_range" class="result-item">
              <div class="result-icon-wrapper time">
                <span class="result-icon">📅</span>
              </div>
              <span class="result-value">{{ intermediateResult.time_range }}</span>
            </div>
          </div>
        </div>
      </Transition>

      <!-- 时间线 -->
      <Transition name="slide-up">
        <div v-if="thoughtHistory.length > 1" class="thought-timeline">
          <div class="timeline-header">
            <span class="timeline-title">思考过程</span>
            <span class="timeline-count">{{ thoughtHistory.length - 1 }} 轮</span>
          </div>
          <div class="timeline-list">
            <div v-for="(item, index) in thoughtHistory.slice(0, -1)" :key="index" class="timeline-item" :class="{ 'expanded': expandedHistory === index }">
              <div class="timeline-main" @click="toggleHistory(index)">
                <div class="timeline-dot">{{ index + 1 }}</div>
                <div class="timeline-content">
                  <div class="timeline-row">
                    <span v-if="item.toolCall" class="timeline-tool">{{ item.toolCall.tool }}</span>
                    <span class="timeline-time">{{ formatTime(item.time) }}</span>
                  </div>
                  <span class="timeline-thought" :class="{ 'truncated': expandedHistory !== index }">{{ item.thought?.current }}</span>
                </div>
                <svg class="timeline-expand-icon" :class="{ 'expanded': expandedHistory === index }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </Transition>

      <!-- 最终答案 -->
      <Transition name="answer-reveal">
        <div v-if="finalAnswer && isCompleted" class="final-answer">
          <div class="answer-header">
            <div class="answer-icon-wrapper">
              <span class="answer-icon">🎯</span>
            </div>
            <span class="answer-title">搜索结果</span>
            <span v-if="totalTime" class="answer-time">{{ totalTime }}s</span>
          </div>
          <div class="answer-content" v-html="formattedAnswer"></div>
          <div v-if="suggestions.length" class="answer-suggestions">
            <span v-for="(suggestion, index) in suggestions" :key="index" class="suggestion-chip" @click="$emit('suggestion-click', suggestion)">
              {{ suggestion }}
            </span>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  status: {
    type: Object,
    default: () => ({
      round: 0,
      thought: null,
      progress: null,
      toolCall: null,
      intermediateResult: null,
      query: ''
    })
  },
  isCompleted: { type: Boolean, default: false },
  isError: { type: Boolean, default: false },
  finalAnswer: { type: String, default: '' },
  suggestions: { type: Array, default: () => [] }
})

defineEmits(['suggestion-click', 'example-click'])

const showToolDetails = ref(false)
const thoughtHistory = ref([])
const isTyping = ref(false)
const currentTime = ref('')
const startTime = ref(null)
const elapsedTime = ref(0)
const totalTime = ref(0)
const expandedHistory = ref(null)

const examples = ['今天发生了什么', '上周开心的时候', '关于工作的记录']

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const updateElapsedTime = () => {
  if (startTime.value && !props.isCompleted) {
    elapsedTime.value = ((Date.now() - startTime.value) / 1000).toFixed(1)
  }
}

let timeInterval, elapsedInterval

onMounted(() => {
  timeInterval = setInterval(updateTime, 1000)
  elapsedInterval = setInterval(updateElapsedTime, 100)
})

onUnmounted(() => {
  clearInterval(timeInterval)
  clearInterval(elapsedInterval)
})

const currentRound = computed(() => props.status?.round || 0)
const isIdle = computed(() => !props.status?.stage || props.status.stage === 'idle')
const searchQuery = computed(() => props.status?.query || '')

const panelClass = computed(() => ({
  'completed': props.isCompleted,
  'error': props.isError,
  'idle': isIdle.value,
  'thinking': !isIdle.value && !props.isCompleted
}))

const titleText = computed(() => {
  if (isIdle.value) return 'AI 搜索就绪'
  if (props.isCompleted) return '搜索完成'
  if (props.isError) return '搜索出错'
  return 'AI 正在思考'
})

const currentThought = computed(() => props.status?.thought)
const thoughtReasoning = computed(() => currentThought.value?.reasoning || '')
const thoughtConfidence = computed(() => currentThought.value?.confidence || 0)

const formattedThought = computed(() => {
  const text = currentThought.value?.current || ''
  return text
    .replace(/(今天|昨天|上周|本月|最近|之前)/g, '<span class="highlight-time">$1</span>')
    .replace(/(开心|难过|工作|学习|生活|旅行)/g, '<span class="highlight-keyword">$1</span>')
})

const currentProgress = computed(() => props.status?.progress)
const progressPercent = computed(() => currentProgress.value?.percent || 0)
const progressBarStyle = computed(() => ({ width: progressPercent.value + '%' }))
const statusStage = computed(() => currentProgress.value?.stage || 'analyzing')
const statusMessage = computed(() => currentProgress.value?.message || '思考中...')

const currentToolCalls = computed(() => {
  const toolCall = props.status?.toolCall
  if (!toolCall) return []
  if (Array.isArray(toolCall)) return toolCall
  if (toolCall.tool) return [toolCall]
  return []
})

const toolNameDisplay = computed(() => {
  const tools = currentToolCalls.value
  if (tools.length === 0) return ''
  if (tools.length === 1) {
    const toolNames = {
      'get_all_tags': '获取标签', 'get_all_moods': '获取心情',
      'search_by_tags': '标签搜索', 'search_by_mood': '心情搜索',
      'search_by_date': '日期搜索', 'search_by_keyword': '关键词搜索',
      'get_diary_detail': '获取详情', 'get_original_content': '获取原文',
      'smart_find': '智能查找', 'get_diary_statistics': '统计分析',
      'parse_time_expression': '解析时间', 'finish_search': '完成搜索'
    }
    return toolNames[tools[0].tool] || tools[0].tool
  }
  return `${tools.length} 个工具`
})

const getConfidenceClass = (confidence) => {
  if (confidence >= 80) return 'high'
  if (confidence >= 50) return 'medium'
  return 'low'
}

const intermediateResult = computed(() => props.status?.intermediateResult || {})
const hasIntermediateResults = computed(() => {
  const r = intermediateResult.value
  return r.found_count !== undefined || (r.matched_tags?.length > 0) || (r.matched_moods?.length > 0) || r.time_range
})

const statusClass = computed(() => {
  if (props.isCompleted) return 'completed'
  if (props.isError) return 'error'
  return statusStage.value
})

const statusIcon = computed(() => {
  if (props.isCompleted) return '✓'
  if (props.isError) return '!'
  if (isIdle.value) return '○'
  const icons = { 'analyzing': '◐', 'searching': '◑', 'filtering': '◒', 'reasoning': '◓', 'finishing': '◔' }
  return icons[statusStage.value] || '◌'
})

const statusText = computed(() => {
  if (props.isCompleted) return '完成'
  if (props.isError) return '出错'
  if (isIdle.value) return '等待'
  return statusMessage.value
})

const formattedAnswer = computed(() => props.finalAnswer.replace(/\n/g, '<br>'))

function toggleToolDetails() { showToolDetails.value = !showToolDetails.value }
function toggleHistory(index) {
  expandedHistory.value = expandedHistory.value === index ? null : index
}
function truncateText(text, maxLength = 50) {
  if (!text) return ''
  return text.length <= maxLength ? text : text.substring(0, maxLength) + '...'
}
function formatParams(params) { return JSON.stringify(params, null, 2) }
function formatTime(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

watch(() => props.status, (newStatus, oldStatus) => {
  if (!isIdle.value && !startTime.value) {
    startTime.value = Date.now()
  }
  if (newStatus?.thought && oldStatus?.thought !== newStatus.thought) {
    thoughtHistory.value.push({ 
      round: newStatus.round, 
      thought: newStatus.thought, 
      toolCall: newStatus.toolCall,
      time: Date.now()
    })
    if (thoughtHistory.value.length > 5) thoughtHistory.value.shift()
    isTyping.value = true
    setTimeout(() => isTyping.value = false, 300)
  }
}, { deep: true })

watch(() => props.isCompleted, (completed) => {
  if (completed && startTime.value) {
    totalTime.value = ((Date.now() - startTime.value) / 1000).toFixed(1)
  }
  if (!completed) {
    thoughtHistory.value = []
    startTime.value = null
    elapsedTime.value = 0
    totalTime.value = 0
  }
})
</script>

<style scoped>
/* ==================== 设计系统变量 ==================== */
:root {
  --primary: #6366f1;
  --primary-light: #818cf8;
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --bg-subtle: rgba(255, 255, 255, 0.6);
  --bg-elevated: rgba(255, 255, 255, 0.85);
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --text-tertiary: #9ca3af;
  --border: rgba(0, 0, 0, 0.06);
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
  --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05);
  --shadow-lg: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
  --radius-sm: 6px;
  --radius: 10px;
  --radius-lg: 14px;
}

/* ==================== 基础样式 ==================== */
.ai-thinking-panel {
  position: relative;
  background: var(--bg-elevated);
  border-radius: var(--radius-lg);
  padding: 14px;
  margin: 10px 0;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border);
  overflow: hidden;
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
}

.ai-thinking-panel.thinking {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.04) 0%, rgba(139, 92, 246, 0.02) 100%);
  border-color: rgba(99, 102, 241, 0.12);
}

.ai-thinking-panel.completed {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.04) 0%, rgba(5, 150, 105, 0.02) 100%);
  border-color: rgba(16, 185, 129, 0.12);
}

.ai-thinking-panel.error {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.04) 0%, rgba(220, 38, 38, 0.02) 100%);
  border-color: rgba(239, 68, 68, 0.12);
}

.panel-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(600px circle at 80% 20%, rgba(99, 102, 241, 0.06), transparent 40%);
  pointer-events: none;
}

/* ==================== 头部 ==================== */
.thinking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: var(--radius);
  border: 1px solid var(--border);
}

.thinking-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ai-avatar-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
}

.avatar-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 1.5px solid transparent;
}

.avatar-ring.active {
  border-color: rgba(99, 102, 241, 0.25);
  animation: ring-spin 2s linear infinite;
}

@keyframes ring-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.ai-avatar {
  position: relative;
  z-index: 2;
  font-size: 20px;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.ai-avatar.thinking {
  animation: avatar-bounce 1s ease-in-out infinite;
}

.ai-avatar.completed {
  animation: avatar-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.ai-avatar.error {
  animation: avatar-shake 0.4s ease-in-out;
}

@keyframes avatar-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}

@keyframes avatar-pop {
  0% { transform: scale(0.5); filter: blur(4px); opacity: 0; }
  70% { transform: scale(1.1); filter: blur(0); }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes avatar-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  75% { transform: translateX(2px); }
}

.thinking-pulse {
  position: absolute;
  width: 36px;
  height: 36px;
  background: rgba(99, 102, 241, 0.2);
  border-radius: 50%;
  animation: pulse-blur 1.5s ease-out infinite;
  filter: blur(1px);
}

@keyframes pulse-blur {
  0% { transform: scale(1); opacity: 0.5; }
  100% { transform: scale(1.5); opacity: 0; }
}

.title-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-text {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.round-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  background: var(--primary);
  color: white;
  padding: 0 6px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
}

.round-badge.completed {
  background: var(--success);
}

.query-text {
  font-size: 12px;
  color: var(--text-secondary);
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.thinking-status {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid var(--border);
  font-size: 12px;
}

.thinking-status.completed { 
  background: rgba(16, 185, 129, 0.08); 
  border-color: rgba(16, 185, 129, 0.15);
  color: var(--success); 
}

.thinking-status.error { 
  background: rgba(239, 68, 68, 0.08); 
  border-color: rgba(239, 68, 68, 0.15);
  color: var(--error); 
}

.status-icon {
  font-size: 13px;
  font-weight: 600;
}

.status-text {
  font-weight: 500;
  color: var(--text-secondary);
}

.status-dots {
  display: flex;
  gap: 3px;
}

.status-dots span {
  width: 4px;
  height: 4px;
  background: var(--primary);
  border-radius: 50%;
  animation: dot-bounce 1.2s ease-in-out infinite both;
}

.status-dots span:nth-child(1) { animation-delay: -0.3s; }
.status-dots span:nth-child(2) { animation-delay: -0.15s; }

@keyframes dot-bounce {
  0%, 80%, 100% { transform: scale(0.4); opacity: 0.3; }
  40% { transform: scale(1); opacity: 1; }
}

/* ==================== 进度条 ==================== */
.progress-section {
  background: rgba(255, 255, 255, 0.5);
  border-radius: var(--radius);
  padding: 12px;
  border: 1px solid var(--border);
  margin-bottom: 10px;
}

.progress-bar-wrapper {
  margin-bottom: 10px;
}

.progress-bar-track {
  position: relative;
  height: 5px;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--primary) 0%, #8b5cf6 100%);
  border-radius: 3px;
  transition: width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.progress-bar.completed {
  background: linear-gradient(90deg, var(--success) 0%, #34d399 100%);
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  padding: 0 2px;
}

.step-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.step-dot.active {
  background: var(--primary);
  transform: scale(1.4);
}

.progress-info {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
}

.stat-percent {
  font-size: 16px;
  font-weight: 700;
  color: var(--primary);
}

.info-divider {
  width: 1px;
  height: 12px;
  background: var(--border);
}

.stat-time {
  color: var(--text-tertiary);
  font-weight: 500;
}

.found-info {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.found-count {
  font-size: 15px;
  font-weight: 700;
  color: var(--primary);
}

.found-label {
  color: var(--text-tertiary);
  font-size: 11px;
}

.confidence-info {
  display: flex;
  align-items: center;
  gap: 4px;
}

.confidence-label {
  font-size: 11px;
  color: var(--text-tertiary);
}

.confidence-value-inline {
  font-size: 13px;
  font-weight: 600;
  min-width: 28px;
}

.confidence-value-inline.high { color: var(--success); }
.confidence-value-inline.medium { color: var(--warning); }
.confidence-value-inline.low { color: var(--error); }

/* ==================== 空闲状态 ==================== */
.idle-state {
  background: rgba(255, 255, 255, 0.5);
  border-radius: var(--radius);
  padding: 20px 16px;
  border: 1px solid var(--border);
  margin-bottom: 10px;
}

.idle-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.idle-icon {
  font-size: 32px;
  opacity: 0.7;
}

.idle-title {
  font-size: 13px;
  color: var(--text-secondary);
  text-align: center;
}

.idle-examples {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.example-chip {
  padding: 6px 12px;
  background: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.15);
  color: var(--primary);
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.example-chip:hover {
  background: var(--primary);
  color: white;
  border-color: transparent;
  transform: translateY(-1px);
}

/* ==================== 思考气泡 ==================== */
.thought-bubble {
  background: rgba(255, 255, 255, 0.6);
  border-radius: var(--radius);
  padding: 14px;
  border: 1px solid var(--border);
  border-left: 2px solid var(--primary);
  margin-bottom: 10px;
}

.thought-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.thought-icon-wrapper {
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, var(--primary) 0%, #8b5cf6 100%);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(99, 102, 241, 0.2);
}

.thought-icon {
  font-size: 14px;
}

.thought-meta {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.thought-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--primary);
}

.thought-time {
  font-size: 11px;
  color: var(--text-tertiary);
}

.thought-content {
  padding-left: 38px;
}

.thought-text-wrapper {
  position: relative;
  margin-bottom: 12px;
  max-height: 180px;
  overflow-y: auto;
  padding-right: 4px;
}

.thought-text-wrapper::-webkit-scrollbar {
  width: 4px;
}

.thought-text-wrapper::-webkit-scrollbar-track {
  background: transparent;
}

.thought-text-wrapper::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 2px;
}

.thought-text {
  font-size: 13px;
  line-height: 1.8;
  color: var(--text-primary);
  white-space: pre-wrap;
  word-break: break-word;
}

.thought-text :deep(.highlight-time) {
  color: #dc2626;
  font-weight: 600;
  background: rgba(220, 38, 38, 0.06);
  padding: 1px 4px;
  border-radius: 4px;
}

.thought-text :deep(.highlight-keyword) {
  color: var(--primary);
  font-weight: 600;
  background: rgba(99, 102, 241, 0.06);
  padding: 1px 4px;
  border-radius: 4px;
}

.typing-cursor {
  display: inline-block;
  width: 2px;
  height: 14px;
  background: var(--primary);
  margin-left: 2px;
  animation: cursor-blink 0.8s infinite;
  vertical-align: middle;
}

@keyframes cursor-blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.thought-reasoning {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.06) 0%, rgba(99, 102, 241, 0.04) 100%);
  border-radius: var(--radius-sm);
  padding: 12px;
  margin-bottom: 10px;
  border: 1px solid rgba(139, 92, 246, 0.1);
}

.reasoning-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.reasoning-icon {
  font-size: 13px;
}

.reasoning-title {
  font-size: 11px;
  font-weight: 600;
  color: #8b5cf6;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.reasoning-content {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.7;
  max-height: 120px;
  overflow-y: auto;
  padding-right: 4px;
  white-space: pre-wrap;
  word-break: break-word;
}

.reasoning-content::-webkit-scrollbar {
  width: 3px;
}

.reasoning-content::-webkit-scrollbar-thumb {
  background: rgba(139, 92, 246, 0.2);
  border-radius: 2px;
}

/* ==================== 工具调用 ==================== */
.tool-call-section {
  background: rgba(255, 255, 255, 0.6);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  overflow: hidden;
  margin-bottom: 10px;
}

.tool-call-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.tool-call-header:hover {
  background: rgba(99, 102, 241, 0.04);
}

.tool-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tool-icon-wrapper {
  width: 26px;
  height: 26px;
  background: linear-gradient(135deg, var(--primary) 0%, #8b5cf6 100%);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(99, 102, 241, 0.18);
}

.tool-icon {
  font-size: 13px;
}

.tool-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
}

.tool-count {
  background: rgba(99, 102, 241, 0.1);
  color: var(--primary);
  padding: 2px 7px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
}

.tool-header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tool-status {
  font-size: 11px;
  color: var(--text-tertiary);
}

.tool-toggle {
  color: var(--text-tertiary);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.tool-toggle.expanded {
  transform: rotate(180deg);
}

.tool-details {
  padding: 0 12px 10px;
}

.tool-item {
  border-bottom: 1px solid var(--border);
  padding: 10px 0;
}

.tool-item:last-child {
  border-bottom: none;
}

.tool-item-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.tool-item-name {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
  font-family: 'JetBrains Mono', monospace;
}

.tool-item-status {
  margin-left: auto;
  color: var(--success);
}

.tool-params {
  background: #0f172a;
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  overflow-x: auto;
}

.tool-params code {
  color: #e2e8f0;
  font-size: 10px;
  line-height: 1.5;
  font-family: 'JetBrains Mono', monospace;
}

/* ==================== 中间结果 ==================== */
.intermediate-results {
  background: rgba(255, 255, 255, 0.6);
  border-radius: var(--radius);
  padding: 12px;
  border: 1px solid var(--border);
  margin-bottom: 10px;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
  gap: 8px;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
}

.result-icon-wrapper {
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, var(--primary) 0%, #8b5cf6 100%);
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 1px 4px rgba(99, 102, 241, 0.15);
}

.result-icon-wrapper.moods {
  background: linear-gradient(135deg, #ec4899 0%, #f472b6 100%);
  box-shadow: 0 1px 4px rgba(236, 72, 153, 0.15);
}

.result-icon-wrapper.time {
  background: linear-gradient(135deg, var(--success) 0%, #34d399 100%);
  box-shadow: 0 1px 4px rgba(16, 185, 129, 0.15);
}

.result-icon {
  font-size: 12px;
}

.result-tags, .result-moods {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  flex: 1;
}

.result-tag, .result-mood {
  background: rgba(245, 158, 11, 0.1);
  color: #b45309;
  padding: 2px 7px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 500;
}

.result-mood {
  background: rgba(236, 72, 153, 0.1);
  color: #be185d;
}

.tag-more {
  background: rgba(0, 0, 0, 0.05);
  color: var(--text-tertiary);
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 10px;
}

.result-value {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-secondary);
}

/* ==================== 时间线 ==================== */
.thought-timeline {
  background: rgba(255, 255, 255, 0.5);
  border-radius: var(--radius);
  padding: 12px;
  border: 1px solid var(--border);
  margin-bottom: 10px;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.timeline-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
}

.timeline-count {
  font-size: 11px;
  color: var(--text-tertiary);
  padding: 2px 8px;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 10px;
}

.timeline-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.timeline-item {
  border-radius: var(--radius-sm);
  transition: background 0.2s ease;
}

.timeline-item:hover {
  background: rgba(0, 0, 0, 0.02);
}

.timeline-main {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px;
  cursor: pointer;
}

.timeline-dot {
  width: 20px;
  height: 20px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: var(--success);
  font-weight: 600;
  flex-shrink: 0;
  margin-top: 2px;
}

.timeline-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.timeline-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.timeline-tool {
  font-size: 10px;
  color: var(--primary);
  font-weight: 500;
  font-family: 'JetBrains Mono', monospace;
  background: rgba(99, 102, 241, 0.08);
  padding: 2px 6px;
  border-radius: 4px;
}

.timeline-time {
  font-size: 10px;
  color: var(--text-tertiary);
}

.timeline-thought {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  transition: all 0.3s ease;
}

.timeline-thought.truncated {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.timeline-expand-icon {
  color: var(--text-tertiary);
  flex-shrink: 0;
  margin-top: 4px;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.timeline-expand-icon.expanded {
  transform: rotate(180deg);
}

/* ==================== 最终答案 ==================== */
.final-answer {
  background: rgba(255, 255, 255, 0.8);
  border-radius: var(--radius-lg);
  padding: 14px;
  margin-top: 10px;
  border: 1px solid rgba(16, 185, 129, 0.12);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.06);
}

.answer-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.answer-icon-wrapper {
  width: 30px;
  height: 30px;
  background: linear-gradient(135deg, var(--success) 0%, #34d399 100%);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.2);
}

.answer-icon {
  font-size: 15px;
}

.answer-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--success);
  flex: 1;
}

.answer-time {
  font-size: 11px;
  color: var(--success);
  padding: 3px 8px;
  background: rgba(16, 185, 129, 0.08);
  border-radius: 10px;
}

.answer-content {
  font-size: 13px;
  line-height: 1.75;
  color: var(--text-primary);
  background: rgba(16, 185, 129, 0.02);
  border-radius: var(--radius-sm);
  padding: 12px;
  border: 1px solid rgba(16, 185, 129, 0.06);
}

.answer-suggestions {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(16, 185, 129, 0.08);
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.suggestion-chip {
  padding: 5px 11px;
  background: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.12);
  color: var(--primary);
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.suggestion-chip:hover {
  background: var(--primary);
  color: white;
  border-color: transparent;
}

/* ==================== 过渡动画 ==================== */
.panel-fade-enter-active,
.panel-fade-leave-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.panel-fade-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.97);
  filter: blur(6px);
}

.panel-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
  filter: blur(3px);
}

.content-fade-enter-active,
.content-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.content-fade-enter-from {
  opacity: 0;
  transform: translateX(12px);
  filter: blur(3px);
}

.content-fade-leave-to {
  opacity: 0;
  transform: translateX(-8px);
  filter: blur(2px);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(12px);
  filter: blur(3px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  max-height: 400px;
  opacity: 1;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  filter: blur(2px);
}

.answer-reveal-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.answer-reveal-enter-from {
  opacity: 0;
  transform: translateY(16px) scale(0.96);
  filter: blur(5px);
}

/* ==================== 响应式 ==================== */
@media (max-width: 640px) {
  .ai-thinking-panel {
    padding: 12px;
    margin: 8px 0;
  }
  
  .thinking-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .thought-content {
    padding-left: 0;
  }
  
  .results-grid {
    grid-template-columns: 1fr;
  }
  
  .query-text {
    max-width: 100%;
  }
}

/* ==================== 暗色模式 ==================== */
@media (prefers-color-scheme: dark) {
  .ai-thinking-panel {
    background: rgba(17, 24, 39, 0.7);
    border-color: rgba(255, 255, 255, 0.06);
  }
  
  .thinking-header,
  .progress-section,
  .idle-state,
  .thought-bubble,
  .tool-call-section,
  .intermediate-results,
  .thought-timeline,
  .final-answer {
    background: rgba(31, 41, 55, 0.5);
    border-color: rgba(255, 255, 255, 0.06);
  }
  
  .title-text,
  .timeline-title,
  .answer-title {
    color: #f9fafb;
  }
  
  .thought-text,
  .timeline-thought,
  .answer-content {
    color: #e5e7eb;
  }
  
  .status-text,
  .found-label,
  .reasoning-text,
  .timeline-thought {
    color: #9ca3af;
  }
  
  .query-text {
    color: #6b7280;
  }
  
  .progress-bar-track,
  .confidence-bar-bg {
    background: rgba(255, 255, 255, 0.06);
  }
  
  .step-dot {
    background: rgba(255, 255, 255, 0.1);
  }
}
</style>
