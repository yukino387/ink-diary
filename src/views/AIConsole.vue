<template>
  <div class="ai-console">
    <!-- 页面标题栏 -->
    <header class="console-header">
      <h1 class="page-title">🖥️ AI 对话控制台</h1>
      <p class="page-subtitle">
        共 {{ totalCount }} 条对话记录 · 透明化AI搜索过程
      </p>
    </header>

    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="filter-section">
        <select v-model="filterMode" class="filter-select" @change="loadConversations">
          <option value="">全部模式</option>
          <option value="quick">⚡ 快速搜索</option>
          <option value="deep">🔬 深度搜索</option>
        </select>
        <input
          v-model="dateRange.start"
          type="date"
          class="date-input"
          @change="loadConversations"
        />
        <span class="date-separator">至</span>
        <input
          v-model="dateRange.end"
          type="date"
          class="date-input"
          @change="loadConversations"
        />
        <button class="btn-clear-filter" @click="clearFilters">
          清除筛选
        </button>
      </div>
      <div class="action-section">
        <button class="btn-export" @click="exportConversations">
          📥 导出记录
        </button>
        <button class="btn-clear" @click="confirmClearAll">
          🗑️ 清空全部
        </button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="ink-drop"></div>
      <p>正在加载对话记录...</p>
    </div>

    <!-- 空状态 -->
    <div v-else-if="conversations.length === 0" class="empty-state">
      <div class="empty-icon">📭</div>
      <h3>暂无对话记录</h3>
      <p>使用AI搜索功能后，对话历史将显示在这里</p>
    </div>

    <!-- 对话列表 -->
    <div v-else class="conversation-list">
      <div
        v-for="conv in conversations"
        :key="conv.id"
        class="conversation-card"
        :class="{ expanded: expandedId === conv.id }"
      >
        <!-- 卡片头部 -->
        <div class="card-header" @click="toggleExpand(conv.id)">
          <div class="header-left">
            <span class="mode-badge" :class="conv.mode">
              {{ conv.mode === 'quick' ? '⚡ 快速' : '🔬 深度' }}
            </span>
            <span class="query-text">{{ conv.query }}</span>
          </div>
          <div class="header-right">
            <span class="round-info">{{ conv.totalRounds }} 轮</span>
            <span class="time-text">{{ formatTime(conv.createTime) }}</span>
            <button
              class="btn-delete"
              @click.stop="confirmDelete(conv.id)"
              title="删除记录"
            >
              ✕
            </button>
            <span class="expand-icon">{{ expandedId === conv.id ? '▼' : '▶' }}</span>
          </div>
        </div>

        <!-- 卡片内容（展开时显示） -->
        <div v-if="expandedId === conv.id" class="card-content">
          <!-- 搜索结果摘要 -->
          <div class="result-summary">
            <div class="summary-item">
              <span class="summary-label">找到日记</span>
              <span class="summary-value">{{ conv.result.results?.length || 0 }} 篇</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">搜索轮数</span>
              <span class="summary-value">{{ conv.totalRounds }} 轮</span>
            </div>
            <div class="summary-item wide">
              <span class="summary-label">AI 回答</span>
              <p class="summary-answer">{{ conv.result.answer }}</p>
            </div>
          </div>

          <!-- 完整对话流程 -->
          <div class="conversation-flow">
            <h4 class="flow-title">📝 完整对话流程</h4>
            <div class="message-list">
              <div
                v-for="(msg, index) in getConversationMessages(conv.messages)"
                :key="index"
                class="message-item"
                :class="msg.role"
              >
                <div class="message-header">
                  <span class="message-role">{{ getRoleLabel(msg.role) }}</span>
                  <span v-if="msg.round" class="message-round">第 {{ msg.round }} 轮</span>
                </div>
                <div class="message-content">
                  <!-- 系统提示词（可折叠） -->
                  <template v-if="msg.role === 'system'">
                    <div class="system-prompt">
                      <button class="btn-toggle" @click="msg.showContent = !msg.showContent">
                        {{ msg.showContent ? '隐藏' : '显示' }} 系统提示词
                      </button>
                      <pre v-if="msg.showContent" class="code-block">{{ msg.content }}</pre>
                    </div>
                  </template>

                  <!-- AI思考过程 -->
                  <template v-else-if="msg.role === 'assistant'">
                    <div class="ai-thinking">
                      <div v-if="msg.parsed.thought" class="thinking-section">
                        <div class="thinking-current">💭 {{ msg.parsed.thought.current }}</div>
                        <div v-if="msg.parsed.thought.reasoning" class="thinking-reasoning">
                          🧠 {{ msg.parsed.thought.reasoning }}
                        </div>
                        <div v-if="msg.parsed.thought.confidence" class="thinking-confidence">
                          置信度: {{ msg.parsed.thought.confidence }}%
                        </div>
                      </div>

                      <!-- 工具调用 -->
                      <div v-if="msg.parsed.tool_call || msg.parsed.tool_calls" class="tool-calls">
                        <div class="tool-header">🔧 工具调用</div>
                        <div v-if="msg.parsed.tool_calls" class="tool-list">
                          <div
                            v-for="(tool, tIndex) in msg.parsed.tool_calls"
                            :key="tIndex"
                            class="tool-item"
                          >
                            <div class="tool-name">{{ tool.tool }}</div>
                            <pre class="code-block small">{{ JSON.stringify(tool.params, null, 2) }}</pre>
                          </div>
                        </div>
                        <div v-else-if="msg.parsed.tool_call" class="tool-item">
                          <div class="tool-name">{{ msg.parsed.tool_call.tool }}</div>
                          <pre class="code-block small">{{ JSON.stringify(msg.parsed.tool_call.params, null, 2) }}</pre>
                        </div>
                      </div>

                      <!-- 进度信息 -->
                      <div v-if="msg.parsed.progress" class="progress-info">
                        <div class="progress-bar">
                          <div
                            class="progress-fill"
                            :style="{ width: msg.parsed.progress.percent + '%' }"
                          ></div>
                        </div>
                        <span class="progress-text">
                          {{ msg.parsed.progress.stage }} - {{ msg.parsed.progress.percent }}%
                        </span>
                      </div>

                      <!-- 原始JSON（可查看） -->
                      <div class="raw-json">
                        <button class="btn-toggle" @click="msg.showRaw = !msg.showRaw">
                          {{ msg.showRaw ? '隐藏' : '查看' }} 原始JSON
                        </button>
                        <pre v-if="msg.showRaw" class="code-block">{{ JSON.stringify(msg.parsed, null, 2) }}</pre>
                      </div>
                    </div>
                  </template>

                  <!-- 工具执行结果 -->
                  <template v-else-if="msg.role === 'tool'">
                    <div class="tool-result">
                      <button class="btn-toggle" @click="msg.showContent = !msg.showContent">
                        {{ msg.showContent ? '隐藏' : '显示' }} 执行结果
                      </button>
                      <pre v-if="msg.showContent" class="code-block">{{ msg.content }}</pre>
                    </div>
                  </template>

                  <!-- 用户消息 -->
                  <template v-else>
                    <div class="user-query">{{ msg.content }}</div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="totalCount > limit" class="pagination">
      <button
        :disabled="offset === 0"
        class="btn-page"
        @click="changePage(-1)"
      >
        上一页
      </button>
      <span class="page-info">
        第 {{ offset / limit + 1 }} 页，共 {{ Math.ceil(totalCount / limit) }} 页
      </span>
      <button
        :disabled="offset + limit >= totalCount"
        class="btn-page"
        @click="changePage(1)"
      >
        下一页
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  getAIConversations,
  deleteAIConversation,
  clearAIConversations,
  exportAIConversations,
  formatChineseDate
} from '../modules/db.js'

/**
 * AIConsole - AI对话历史控制台
 * 
 * 功能：
 * - 展示所有AI搜索对话历史
 * - 查看单次搜索的完整对话流程
 * - 支持筛选（模式、日期范围）
 * - 支持删除单条或清空全部
 * - 支持导出记录
 */

// 响应式状态
const conversations = ref([])
const loading = ref(false)
const totalCount = ref(0)
const offset = ref(0)
const limit = ref(10)
const expandedId = ref(null)

// 筛选条件
const filterMode = ref('')
const dateRange = ref({ start: '', end: '' })

// 加载对话记录
async function loadConversations() {
  loading.value = true
  try {
    const options = {
      limit: limit.value,
      offset: offset.value
    }
    
    if (filterMode.value) {
      options.mode = filterMode.value
    }
    
    if (dateRange.value.start) {
      options.startDate = dateRange.value.start
    }
    
    if (dateRange.value.end) {
      options.endDate = dateRange.value.end
    }
    
    const result = await getAIConversations(options)
    conversations.value = result.list
    totalCount.value = result.total
  } catch (error) {
    console.error('[AIConsole] 加载对话记录失败:', error)
    alert('加载对话记录失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

// 清除筛选
function clearFilters() {
  filterMode.value = ''
  dateRange.value = { start: '', end: '' }
  offset.value = 0
  loadConversations()
}

// 切换展开状态
function toggleExpand(id) {
  expandedId.value = expandedId.value === id ? null : id
}

// 获取对话消息（过滤和格式化）
function getConversationMessages(messages) {
  if (!Array.isArray(messages)) return []
  
  let round = 0
  return messages.map((msg, index) => {
    const formatted = {
      role: msg.role,
      content: msg.content,
      showContent: false,
      showRaw: false,
      parsed: null,
      round: null
    }
    
    // 解析AI响应
    if (msg.role === 'assistant') {
      try {
        formatted.parsed = JSON.parse(msg.content)
        // 检测是否是新一轮的开始
        if (formatted.parsed.tool_call || formatted.parsed.tool_calls) {
          round++
        }
        formatted.round = round
      } catch (e) {
        formatted.parsed = { raw: msg.content }
      }
    }
    
    // 标记工具执行结果
    if (msg.role === 'user' && msg.content.includes('工具执行结果')) {
      formatted.role = 'tool'
    }
    
    return formatted
  })
}

// 获取角色标签
function getRoleLabel(role) {
  const labels = {
    system: '🔧 系统',
    user: '👤 用户',
    assistant: '🤖 AI',
    tool: '📊 工具结果'
  }
  return labels[role] || role
}

// 格式化时间
function formatTime(timeString) {
  if (!timeString) return ''
  return formatChineseDate(timeString)
}

// 删除确认
function confirmDelete(id) {
  if (confirm('确定要删除这条对话记录吗？')) {
    deleteConversation(id)
  }
}

// 删除对话
async function deleteConversation(id) {
  try {
    await deleteAIConversation(id)
    // 如果删除的是当前展开的，关闭展开
    if (expandedId.value === id) {
      expandedId.value = null
    }
    // 重新加载
    await loadConversations()
  } catch (error) {
    console.error('[AIConsole] 删除失败:', error)
    alert('删除失败: ' + error.message)
  }
}

// 清空确认
function confirmClearAll() {
  if (confirm('确定要清空所有对话记录吗？此操作不可恢复！')) {
    clearAll()
  }
}

// 清空全部
async function clearAll() {
  try {
    await clearAIConversations()
    expandedId.value = null
    offset.value = 0
    await loadConversations()
  } catch (error) {
    console.error('[AIConsole] 清空失败:', error)
    alert('清空失败: ' + error.message)
  }
}

// 导出记录
async function exportConversations() {
  try {
    const data = await exportAIConversations()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ai-conversations-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('[AIConsole] 导出失败:', error)
    alert('导出失败: ' + error.message)
  }
}

// 分页
function changePage(direction) {
  offset.value += direction * limit.value
  if (offset.value < 0) offset.value = 0
  loadConversations()
}

// 组件挂载时加载数据
onMounted(() => {
  loadConversations()
})
</script>

<style scoped>
.ai-console {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* 页面标题 */
.console-header {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--ink-rice);
}

.page-title {
  font-family: "LXGW WenKai", serif;
  font-size: 2rem;
  font-weight: 400;
  color: var(--ink-dark);
  letter-spacing: 0.1em;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-family: "LXGW WenKai", serif;
  font-size: 0.95rem;
  color: var(--ink-sandalwood);
}

/* 工具栏 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: linear-gradient(135deg, var(--ink-hover) 0%, rgba(255, 255, 255, 0.8) 100%);
  border-radius: 12px;
  border: 1px solid var(--ink-rice);
}

.filter-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.filter-select,
.date-input {
  padding: 0.5rem 0.75rem;
  font-family: "LXGW WenKai", serif;
  font-size: 0.875rem;
  border: 1px solid var(--ink-rice);
  border-radius: 6px;
  background: white;
  color: var(--ink-dark);
}

.date-separator {
  font-family: "LXGW WenKai", serif;
  color: var(--ink-sandalwood);
}

.btn-clear-filter {
  padding: 0.5rem 1rem;
  font-family: "LXGW WenKai", serif;
  font-size: 0.875rem;
  background: transparent;
  border: 1px solid var(--ink-rice);
  border-radius: 6px;
  color: var(--ink-sandalwood);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-clear-filter:hover {
  border-color: var(--ink-ochre);
  color: var(--ink-ochre);
}

.action-section {
  display: flex;
  gap: 0.75rem;
}

.btn-export,
.btn-clear {
  padding: 0.5rem 1rem;
  font-family: "LXGW WenKai", serif;
  font-size: 0.875rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-export {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.btn-export:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-clear {
  background: transparent;
  border: 1px solid #ef4444;
  color: #ef4444;
}

.btn-clear:hover {
  background: #fef2f2;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.ink-drop {
  width: 24px;
  height: 24px;
  background-color: var(--ink-dark);
  border-radius: 50% 50% 50% 0;
  margin-bottom: 1rem;
  animation: inkDrop 1.5s ease-in-out infinite;
}

@keyframes inkDrop {
  0% { transform: scale(0) rotate(-45deg); opacity: 1; }
  50% { transform: scale(1) rotate(-45deg); opacity: 0.8; }
  100% { transform: scale(2) rotate(-45deg); opacity: 0; }
}

.loading-state p {
  font-family: "LXGW WenKai", serif;
  color: var(--ink-sandalwood);
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-family: "LXGW WenKai", serif;
  font-size: 1.5rem;
  font-weight: 400;
  color: var(--ink-dark);
  margin-bottom: 0.5rem;
}

.empty-state p {
  font-family: "LXGW WenKai", serif;
  color: var(--ink-sandalwood);
}

/* 对话列表 */
.conversation-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.conversation-card {
  background: white;
  border: 1px solid var(--ink-rice);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.conversation-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.conversation-card.expanded {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

/* 卡片头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  cursor: pointer;
  background: linear-gradient(135deg, var(--ink-paper) 0%, rgba(255, 255, 255, 0.9) 100%);
  transition: background 0.2s;
}

.card-header:hover {
  background: linear-gradient(135deg, var(--ink-hover) 0%, rgba(255, 255, 255, 0.95) 100%);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
}

.mode-badge {
  padding: 0.25rem 0.625rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.mode-badge.quick {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
}

.mode-badge.deep {
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
  color: #3730a3;
}

.query-text {
  font-family: "LXGW WenKai", serif;
  font-size: 1rem;
  color: var(--ink-dark);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.round-info {
  font-size: 0.8rem;
  color: var(--ink-sandalwood);
  background: var(--ink-hover);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.time-text {
  font-size: 0.8rem;
  color: var(--ink-sandalwood);
}

.btn-delete {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--ink-sandalwood);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.btn-delete:hover {
  background: #fef2f2;
  color: #ef4444;
}

.expand-icon {
  font-size: 0.75rem;
  color: var(--ink-sandalwood);
  transition: transform 0.3s;
}

/* 卡片内容 */
.card-content {
  padding: 1.25rem;
  border-top: 1px solid var(--ink-rice);
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 结果摘要 */
.result-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 8px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.summary-item.wide {
  grid-column: 1 / -1;
}

.summary-label {
  font-size: 0.75rem;
  color: var(--ink-sandalwood);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.summary-value {
  font-family: "LXGW WenKai", serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--ink-dark);
}

.summary-answer {
  font-family: "LXGW WenKai", serif;
  font-size: 0.95rem;
  color: var(--ink-dark);
  line-height: 1.6;
  margin: 0;
}

/* 对话流程 */
.conversation-flow {
  margin-top: 1.5rem;
}

.flow-title {
  font-family: "LXGW WenKai", serif;
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--ink-dark);
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--ink-rice);
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message-item {
  border-radius: 8px;
  overflow: hidden;
}

.message-item.system {
  background: #f8f9fa;
  border-left: 3px solid #6c757d;
}

.message-item.user {
  background: #e3f2fd;
  border-left: 3px solid #2196f3;
}

.message-item.assistant {
  background: #f3e5f5;
  border-left: 3px solid #9c27b0;
}

.message-item.tool {
  background: #e8f5e9;
  border-left: 3px solid #4caf50;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: rgba(0, 0, 0, 0.03);
}

.message-role {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--ink-dark);
}

.message-round {
  font-size: 0.75rem;
  color: var(--ink-sandalwood);
  background: rgba(255, 255, 255, 0.8);
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
}

.message-content {
  padding: 0.75rem;
}

/* AI思考样式 */
.ai-thinking {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.thinking-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.thinking-current {
  font-family: "LXGW WenKai", serif;
  font-size: 0.95rem;
  color: var(--ink-dark);
  line-height: 1.5;
}

.thinking-reasoning {
  font-size: 0.85rem;
  color: var(--ink-sandalwood);
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 4px;
}

.thinking-confidence {
  font-size: 0.8rem;
  color: #059669;
  font-weight: 500;
}

/* 工具调用样式 */
.tool-calls {
  background: rgba(255, 255, 255, 0.6);
  border-radius: 6px;
  padding: 0.75rem;
}

.tool-header {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--ink-dark);
  margin-bottom: 0.5rem;
}

.tool-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.tool-item {
  background: white;
  border-radius: 4px;
  padding: 0.5rem;
  border: 1px solid var(--ink-rice);
}

.tool-name {
  font-family: monospace;
  font-size: 0.8rem;
  color: #667eea;
  margin-bottom: 0.25rem;
}

/* 进度条 */
.progress-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.progress-bar {
  height: 6px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.8rem;
  color: var(--ink-sandalwood);
}

/* 代码块 */
.code-block {
  background: #2d3748;
  color: #e2e8f0;
  padding: 1rem;
  border-radius: 6px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 0.8rem;
  line-height: 1.5;
  overflow-x: auto;
  margin: 0.5rem 0 0 0;
  max-height: 300px;
  overflow-y: auto;
}

.code-block.small {
  padding: 0.5rem;
  font-size: 0.75rem;
  max-height: 200px;
}

/* 切换按钮 */
.btn-toggle {
  font-family: "LXGW WenKai", serif;
  font-size: 0.8rem;
  color: #667eea;
  background: transparent;
  border: 1px solid #e0e7ff;
  padding: 0.375rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-toggle:hover {
  background: #f8f9ff;
  border-color: #667eea;
}

/* 系统提示词 */
.system-prompt,
.tool-result {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* 用户查询 */
.user-query {
  font-family: "LXGW WenKai", serif;
  font-size: 0.95rem;
  color: var(--ink-dark);
  line-height: 1.5;
}

/* 原始JSON */
.raw-json {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px dashed var(--ink-rice);
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--ink-rice);
}

.btn-page {
  padding: 0.5rem 1.25rem;
  font-family: "LXGW WenKai", serif;
  font-size: 0.875rem;
  background: white;
  border: 1px solid var(--ink-rice);
  border-radius: 6px;
  color: var(--ink-dark);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-page:hover:not(:disabled) {
  border-color: var(--ink-ochre);
  color: var(--ink-ochre);
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-family: "LXGW WenKai", serif;
  font-size: 0.875rem;
  color: var(--ink-sandalwood);
}

/* 响应式 */
@media (max-width: 768px) {
  .ai-console {
    padding: 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-section {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-select,
  .date-input {
    width: 100%;
  }

  .action-section {
    justify-content: center;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .header-right {
    width: 100%;
    justify-content: space-between;
  }

  .result-summary {
    grid-template-columns: 1fr;
  }

  .code-block {
    font-size: 0.7rem;
    padding: 0.5rem;
  }
}
</style>
