<template>
  <div class="ai-thinking-panel modern-panel" :class="{ 'completed': isCompleted, 'error': isError, 'idle': isIdle }">
    <!-- 头部：标题和状态 -->
    <div class="thinking-header modern-header">
      <div class="thinking-title">
        <div class="ai-avatar-wrapper">
          <span class="ai-avatar" :class="{ 'thinking': !isIdle && !isCompleted }">🤖</span>
          <div v-if="!isIdle && !isCompleted" class="thinking-pulse"></div>
        </div>
        <div class="title-content">
          <span class="title-text">{{ isIdle ? 'AI 搜索就绪' : isCompleted ? '搜索完成' : 'AI 正在思考' }}</span>
          <span v-if="currentRound > 0" class="round-badge" :class="{ 'completed': isCompleted }">
            <span class="badge-icon">🔄</span>
            第 {{ currentRound }} 轮
          </span>
        </div>
      </div>
      <div class="thinking-status" :class="statusClass">
        <span class="status-icon">{{ statusIcon }}</span>
        <span class="status-text">{{ statusText }}</span>
      </div>
    </div>

    <!-- 进度条 -->
    <div class="progress-section modern-progress">
      <div class="progress-info">
        <span class="progress-label">搜索进度</span>
        <span class="progress-text">{{ progressPercent }}%</span>
      </div>
      <div class="progress-bar-container">
        <div class="progress-bar-track">
          <div class="progress-bar" :style="{ width: progressPercent + '%' }" :class="{ 'completed': isCompleted }"></div>
        </div>
        <div class="progress-steps">
          <div v-for="n in 5" :key="n" class="step-dot" :class="{ 'active': progressPercent >= (n-1) * 25, 'completed': isCompleted }"></div>
        </div>
      </div>
    </div>

    <!-- 初始状态提示 -->
    <div v-if="isIdle" class="idle-state modern-idle">
      <div class="idle-icon-wrapper">
        <span class="idle-icon">🔍</span>
        <div class="idle-ripple"></div>
      </div>
      <div class="idle-text">
        <p class="idle-title">输入搜索内容，AI将帮您智能查找日记</p>
        <div class="idle-examples">
          <span class="example-chip">今天发生了什么</span>
          <span class="example-chip">上周开心的时候</span>
          <span class="example-chip">关于工作的记录</span>
        </div>
      </div>
    </div>

    <!-- AI思维气泡 -->
    <div v-else-if="currentThought" class="thought-bubble modern-thought">
      <div class="thought-header">
        <div class="thought-icon-wrapper">
          <span class="thought-icon">💭</span>
        </div>
        <span class="thought-label">AI 思考中</span>
      </div>
      <div class="thought-content">
        <div class="thought-text" v-html="formattedThought"></div>
        <div v-if="thoughtReasoning" class="thought-reasoning">
          <span class="reasoning-label">🧠 推理：</span>
          <span class="reasoning-text">{{ thoughtReasoning }}</span>
        </div>
        <div v-if="thoughtConfidence > 0" class="thought-confidence">
          <span class="confidence-label">置信度</span>
          <div class="confidence-bar">
            <div class="confidence-fill" :style="{ width: thoughtConfidence + '%' }" :class="getConfidenceClass(thoughtConfidence)"></div>
          </div>
          <span class="confidence-value" :class="getConfidenceClass(thoughtConfidence)">{{ thoughtConfidence }}%</span>
        </div>
      </div>
    </div>

    <!-- 工具调用展示 -->
    <div v-if="currentToolCalls && currentToolCalls.length > 0" class="tool-call-section modern-tools">
      <div class="tool-call-header" @click="toggleToolDetails">
        <div class="tool-header-left">
          <span class="tool-icon">🔧</span>
          <span class="tool-name">{{ toolNameDisplay }}</span>
          <span v-if="currentToolCalls.length > 1" class="tool-count">+{{ currentToolCalls.length - 1 }}</span>
        </div>
        <span class="tool-toggle">{{ showToolDetails ? '收起 ▼' : '展开 ▶' }}</span>
      </div>
      
      <div v-show="showToolDetails" class="tool-details">
        <div v-for="(toolCall, index) in currentToolCalls" :key="index" class="tool-item">
          <div class="tool-item-header">
            <span class="tool-number">{{ index + 1 }}</span>
            <span class="tool-item-name">{{ toolCall.tool }}</span>
          </div>
          <div class="tool-params">
            <pre class="params-code">{{ JSON.stringify(toolCall.params, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </div>

    <!-- 中间结果展示 -->
    <div v-if="hasIntermediateResults" class="intermediate-results">
      <div class="results-header">
        <span class="results-icon">📊</span>
        <span class="results-title">中间结果</span>
      </div>
      
      <div class="results-grid">
        <div v-if="intermediateResult.found_count !== undefined" class="result-item">
          <span class="result-value">{{ intermediateResult.found_count }}</span>
          <span class="result-label">找到日记</span>
        </div>
        
        <div v-if="intermediateResult.matched_tags?.length" class="result-item">
          <div class="result-tags">
            <span v-for="tag in intermediateResult.matched_tags.slice(0, 3)" :key="tag" class="result-tag">
              {{ tag }}
            </span>
            <span v-if="intermediateResult.matched_tags.length > 3" class="tag-more">
              +{{ intermediateResult.matched_tags.length - 3 }}
            </span>
          </div>
          <span class="result-label">匹配标签</span>
        </div>
        
        <div v-if="intermediateResult.matched_moods?.length" class="result-item">
          <div class="result-moods">
            <span v-for="mood in intermediateResult.matched_moods.slice(0, 3)" :key="mood" class="result-mood">
              {{ mood }}
            </span>
          </div>
          <span class="result-label">匹配心情</span>
        </div>
        
        <div v-if="intermediateResult.time_range" class="result-item">
          <span class="result-value time-range">{{ intermediateResult.time_range }}</span>
          <span class="result-label">时间范围</span>
        </div>
      </div>
    </div>

    <!-- 思考历史时间线 -->
    <div v-if="thoughtHistory.length > 1" class="thought-timeline">
      <div class="timeline-header">
        <span class="timeline-icon">🕐</span>
        <span class="timeline-title">思考过程</span>
      </div>
      
      <div class="timeline-list">
        <div 
          v-for="(item, index) in thoughtHistory.slice(0, -1)" 
          :key="index"
          class="timeline-item"
          :class="{ 'completed': true }"
        >
          <div class="timeline-dot">✓</div>
          <div class="timeline-content">
            <div class="timeline-round">第 {{ item.round }} 轮</div>
            <div class="timeline-thought">{{ truncateThought(item.thought?.current) }}</div>
            <div v-if="item.toolCall" class="timeline-tool">
              调用: {{ item.toolCall.tool }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 最终答案（完成时显示） -->
    <div v-if="finalAnswer && isCompleted" class="final-answer">
      <div class="answer-header">
        <span class="answer-icon">✨</span>
        <span class="answer-title">搜索结果</span>
      </div>
      <div class="answer-content" v-html="formattedAnswer"></div>
      
      <div v-if="suggestions.length" class="answer-suggestions">
        <div class="suggestions-label">相关建议：</div>
        <div class="suggestions-list">
          <span 
            v-for="(suggestion, index) in suggestions" 
            :key="index"
            class="suggestion-chip"
            @click="$emit('suggestion-click', suggestion)"
          >
            {{ suggestion }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  // 当前状态
  status: {
    type: Object,
    default: () => ({
      round: 0,
      thought: null,
      progress: null,
      toolCall: null,
      intermediateResult: null
    })
  },
  // 是否完成
  isCompleted: {
    type: Boolean,
    default: false
  },
  // 是否出错
  isError: {
    type: Boolean,
    default: false
  },
  // 最终答案
  finalAnswer: {
    type: String,
    default: ''
  },
  // 搜索建议
  suggestions: {
    type: Array,
    default: () => []
  }
})

defineEmits(['suggestion-click'])

// 内部状态
const showToolDetails = ref(false)
const thoughtHistory = ref([])

// 计算属性
const currentRound = computed(() => props.status?.round || 0)

const isIdle = computed(() => {
  return !props.status?.stage || props.status.stage === 'idle'
})

const currentThought = computed(() => props.status?.thought)
const thoughtReasoning = computed(() => currentThought.value?.reasoning || '')
const thoughtConfidence = computed(() => currentThought.value?.confidence || 0)
const formattedThought = computed(() => {
  const text = currentThought.value?.current || ''
  // 高亮关键词
  return text
    .replace(/(今天|昨天|上周|本月)/g, '<span class="highlight-time">$1</span>')
    .replace(/(开心|难过|工作|学习)/g, '<span class="highlight-keyword">$1</span>')
})

const currentProgress = computed(() => props.status?.progress)
const progressPercent = computed(() => currentProgress.value?.percent || 0)
const statusStage = computed(() => currentProgress.value?.stage || 'analyzing')
const statusMessage = computed(() => currentProgress.value?.message || '思考中...')

// 支持单工具和多工具调用
const currentToolCalls = computed(() => {
  const toolCall = props.status?.toolCall
  if (!toolCall) return []
  // 如果是数组，直接返回
  if (Array.isArray(toolCall)) return toolCall
  // 如果是单个工具调用对象
  if (toolCall.tool) return [toolCall]
  return []
})

const toolNameDisplay = computed(() => {
  const tools = currentToolCalls.value
  if (tools.length === 0) return ''
  if (tools.length === 1) {
    const toolName = tools[0].tool || ''
    const toolNames = {
      'get_all_tags': '获取标签列表',
      'get_all_moods': '获取心情列表',
      'search_by_tags': '按标签搜索',
      'search_by_mood': '按心情搜索',
      'search_by_date': '按日期搜索',
      'search_by_keyword': '关键词搜索',
      'get_diary_detail': '获取日记详情',
      'get_original_content': '获取原文',
      'smart_find': '智能查找',
      'get_diary_statistics': '统计分析',
      'parse_time_expression': '解析时间',
      'finish_search': '完成搜索'
    }
    return toolNames[toolName] || toolName
  }
  return `并行调用 ${tools.length} 个工具`
})

// 置信度颜色类
const getConfidenceClass = (confidence) => {
  if (confidence >= 80) return 'high'
  if (confidence >= 50) return 'medium'
  return 'low'
}

const intermediateResult = computed(() => props.status?.intermediateResult || {})
const hasIntermediateResults = computed(() => {
  const result = intermediateResult.value
  return result.found_count !== undefined ||
         (result.matched_tags?.length > 0) ||
         (result.matched_moods?.length > 0) ||
         result.time_range
})

const statusClass = computed(() => {
  if (props.isCompleted) return 'completed'
  if (props.isError) return 'error'
  return statusStage.value
})

const statusIcon = computed(() => {
  if (props.isCompleted) return '✅'
  if (props.isError) return '❌'
  if (isIdle.value) return '⏸️'
  const icons = {
    'analyzing': '🤔',
    'searching': '🔍',
    'filtering': '⚡',
    'reasoning': '🧠',
    'finishing': '✨'
  }
  return icons[statusStage.value] || '💭'
})

const statusText = computed(() => {
  if (props.isCompleted) return '搜索完成'
  if (props.isError) return '搜索出错'
  if (isIdle.value) return '等待输入'
  return statusMessage.value
})

const formattedAnswer = computed(() => {
  // 简单格式化：将换行符转为<br>
  return props.finalAnswer.replace(/\n/g, '<br>')
})

// 方法
function toggleToolDetails() {
  showToolDetails.value = !showToolDetails.value
}

function truncateThought(text, maxLength = 50) {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// 监听状态变化，记录历史
watch(() => props.status, (newStatus, oldStatus) => {
  if (newStatus?.thought && oldStatus?.thought !== newStatus.thought) {
    thoughtHistory.value.push({
      round: newStatus.round,
      thought: newStatus.thought,
      toolCall: newStatus.toolCall,
      progress: newStatus.progress
    })
    // 限制历史记录数量
    if (thoughtHistory.value.length > 5) {
      thoughtHistory.value.shift()
    }
  }
}, { deep: true })

// 重置历史
watch(() => props.isCompleted, (completed) => {
  if (!completed) {
    thoughtHistory.value = []
  }
})
</script>

<style scoped>
.ai-thinking-panel {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
  border-radius: 16px;
  padding: 20px;
  margin: 16px 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.6);
}

.ai-thinking-panel.completed {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
}

.ai-thinking-panel.error {
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
}

/* 头部 */
.thinking-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.thinking-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ai-avatar {
  font-size: 24px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.title-text {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.round-badge {
  background: #3498db;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.thinking-status {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.8);
}

.status-icon {
  font-size: 16px;
}

.status-text {
  font-size: 13px;
  color: #666;
}

.thinking-status.completed .status-text {
  color: #27ae60;
}

.thinking-status.error .status-text {
  color: #e74c3c;
}

/* 进度条 */
.progress-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.progress-bar-container {
  flex: 1;
  height: 8px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #3498db, #2ecc71);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 14px;
  font-weight: 600;
  color: #3498db;
  min-width: 40px;
  text-align: right;
}

/* 思维气泡 */
.thought-bubble {
  display: flex;
  gap: 12px;
  background: rgba(255, 255, 255, 0.9);
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 16px;
  border-left: 4px solid #3498db;
}

.thought-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.thought-content {
  flex: 1;
}

.thought-text {
  font-size: 14px;
  line-height: 1.6;
  color: #2c3e50;
  margin-bottom: 8px;
}

.thought-text :deep(.highlight-time) {
  color: #e74c3c;
  font-weight: 600;
}

.thought-text :deep(.highlight-keyword) {
  color: #3498db;
  font-weight: 600;
}

/* 初始状态 */
.idle-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 20px;
  text-align: center;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  margin-bottom: 16px;
}

.idle-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.8;
}

.idle-text p {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 15px;
}

.idle-examples {
  font-size: 13px !important;
  color: #7f8c8d !important;
  font-style: italic;
}

.thought-reasoning {
  font-size: 12px;
  color: #7f8c8d;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #ddd;
}

.reasoning-label {
  font-weight: 600;
}

.thought-confidence {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  font-size: 12px;
}

.confidence-label {
  color: #7f8c8d;
}

.confidence-bar {
  width: 100px;
  height: 6px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.confidence-fill {
  height: 100%;
  background: linear-gradient(90deg, #e74c3c, #f39c12, #27ae60);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.confidence-value {
  color: #27ae60;
  font-weight: 600;
}

/* 工具调用 */
.tool-call-section {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
}

.tool-call-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.tool-call-header:hover {
  background: rgba(0, 0, 0, 0.05);
}

.tool-icon {
  font-size: 16px;
}

.tool-name {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
}

.tool-toggle {
  font-size: 12px;
  color: #7f8c8d;
}

.tool-details {
  padding: 0 16px 16px;
}

.params-label {
  font-size: 12px;
  color: #7f8c8d;
  margin-bottom: 4px;
}

.params-code {
  background: #2c3e50;
  color: #ecf0f1;
  padding: 12px;
  border-radius: 6px;
  font-size: 12px;
  overflow-x: auto;
  margin: 0;
}

/* 中间结果 */
.intermediate-results {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.results-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.results-icon {
  font-size: 18px;
}

.results-title {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
}

.result-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 8px;
  text-align: center;
}

.result-value {
  font-size: 24px;
  font-weight: 700;
  color: #3498db;
}

.result-value.time-range {
  font-size: 14px;
}

.result-label {
  font-size: 12px;
  color: #7f8c8d;
  margin-top: 4px;
}

.result-tags,
.result-moods {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: center;
}

.result-tag,
.result-mood {
  background: #3498db;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
}

.tag-more {
  background: #95a5a6;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
}

/* 时间线 */
.thought-timeline {
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  padding: 16px;
}

.timeline-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.timeline-icon {
  font-size: 16px;
}

.timeline-title {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
}

.timeline-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.timeline-item {
  display: flex;
  gap: 12px;
  opacity: 0.7;
}

.timeline-item.completed {
  opacity: 1;
}

.timeline-dot {
  width: 24px;
  height: 24px;
  background: #27ae60;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  flex-shrink: 0;
}

.timeline-content {
  flex: 1;
}

.timeline-round {
  font-size: 12px;
  color: #7f8c8d;
  margin-bottom: 2px;
}

.timeline-thought {
  font-size: 13px;
  color: #2c3e50;
}

.timeline-tool {
  font-size: 11px;
  color: #3498db;
  margin-top: 2px;
}

/* 最终答案 */
.final-answer {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 20px;
  margin-top: 16px;
  border: 2px solid #27ae60;
}

.answer-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.answer-icon {
  font-size: 20px;
}

.answer-title {
  font-size: 16px;
  font-weight: 600;
  color: #27ae60;
}

.answer-content {
  font-size: 14px;
  line-height: 1.8;
  color: #2c3e50;
  white-space: pre-wrap;
}

.answer-suggestions {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.suggestions-label {
  font-size: 12px;
  color: #7f8c8d;
  margin-bottom: 8px;
}

.suggestions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.suggestion-chip {
  background: #ecf0f1;
  color: #3498db;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.suggestion-chip:hover {
  background: #3498db;
  color: white;
}

/* ==================== 现代化UI样式 ==================== */

/* 现代化面板 */
.modern-panel {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e8e8e8;
}

.modern-panel.completed {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border-color: #6ee7b7;
}

.modern-panel.error {
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
  border-color: #fca5a5;
}

/* 现代化头部 */
.modern-header {
  background: white;
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 16px;
}

.ai-avatar-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-avatar {
  font-size: 28px;
  z-index: 2;
  transition: transform 0.3s;
}

.ai-avatar.thinking {
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.thinking-pulse {
  position: absolute;
  width: 40px;
  height: 40px;
  background: rgba(102, 126, 234, 0.3);
  border-radius: 50%;
  animation: pulse-ring 1.5s infinite;
  z-index: 1;
}

@keyframes pulse-ring {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(1.5); opacity: 0; }
}

.title-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.round-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  width: fit-content;
}

.round-badge.completed {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.badge-icon {
  font-size: 10px;
}

/* 现代化进度条 */
.modern-progress {
  background: white;
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 16px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.progress-label {
  font-size: 13px;
  font-weight: 500;
  color: #666;
}

.progress-text {
  font-size: 16px;
  font-weight: 700;
  color: #667eea;
}

.progress-bar-track {
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  transition: width 0.5s ease;
  position: relative;
}

.progress-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  animation: shimmer 2s infinite;
}

.progress-bar.completed {
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  padding: 0 4px;
}

.step-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #e8e8e8;
  transition: all 0.3s;
}

.step-dot.active {
  background: #667eea;
  box-shadow: 0 0 8px rgba(102, 126, 234, 0.5);
}

.step-dot.completed {
  background: #10b981;
}

/* 现代化空闲状态 */
.modern-idle {
  background: white;
  border-radius: 16px;
  padding: 40px 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  text-align: center;
}

.idle-icon-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.idle-icon {
  font-size: 56px;
  z-index: 2;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.idle-ripple {
  position: absolute;
  width: 80px;
  height: 80px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 50%;
  animation: ripple 2s infinite;
  z-index: 1;
}

@keyframes ripple {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(1.5); opacity: 0; }
}

.idle-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 16px;
}

.idle-examples {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.example-chip {
  background: linear-gradient(135deg, #f0f7ff 0%, #e6f0ff 100%);
  border: 1px solid #bfdbfe;
  color: #667eea;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
  cursor: pointer;
}

.example-chip:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
  transform: translateY(-2px);
}

/* 现代化思考气泡 */
.modern-thought {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: none;
  border-left: 4px solid #667eea;
}

.thought-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.thought-icon-wrapper {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.thought-icon {
  font-size: 16px;
}

.thought-label {
  font-size: 13px;
  font-weight: 600;
  color: #667eea;
}

.thought-content {
  padding-left: 42px;
}

.thought-text {
  font-size: 14px;
  line-height: 1.7;
  color: #2c3e50;
  margin-bottom: 12px;
}

.thought-reasoning {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 13px;
  color: #666;
  margin-bottom: 12px;
}

.reasoning-label {
  font-weight: 600;
  color: #667eea;
}

.thought-confidence {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
}

.confidence-label {
  color: #666;
  font-weight: 500;
}

.confidence-value {
  font-weight: 700;
  min-width: 40px;
  text-align: right;
}

.confidence-value.high {
  color: #10b981;
}

.confidence-value.medium {
  color: #f59e0b;
}

.confidence-value.low {
  color: #ef4444;
}

.confidence-fill.high {
  background: linear-gradient(90deg, #10b981, #34d399);
}

.confidence-fill.medium {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.confidence-fill.low {
  background: linear-gradient(90deg, #ef4444, #f87171);
}

/* 现代化工具区域 */
.modern-tools {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.tool-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.tool-count {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.tool-item {
  border-bottom: 1px solid #f0f0f0;
  padding: 12px 0;
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

.tool-number {
  width: 20px;
  height: 20px;
  background: #f0f0f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: #666;
}

.tool-item-name {
  font-weight: 600;
  color: #2c3e50;
}

/* 响应式调整 */
@media (max-width: 640px) {
  .modern-panel {
    padding: 16px;
  }
  
  .modern-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .thought-content {
    padding-left: 0;
  }
  
  .example-chip {
    font-size: 12px;
    padding: 6px 12px;
  }
}
</style>
