<template>
  <div class="prompt-settings">
    <!-- 页面标题 -->
    <header class="prompt-settings__header">
      <h1 class="page-title">提示词设置</h1>
      <p class="page-subtitle">定制您的AI创作助手</p>
    </header>
    
    <!-- 墨迹分隔线 -->
    <div class="ink-divider"></div>
    
    <!-- 提示词设置内容 -->
    <div class="prompt-settings__content">
      <!-- 系统提示词 -->
      <section class="settings-section">
        <div class="section-header">
          <h2 class="section-title">
            <span class="section-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
              </svg>
            </span>
            系统提示词
          </h2>
          <InkButton
            text="恢复默认"
            variant="ghost"
            size="small"
            @click="resetPrompt('system')"
          />
        </div>
        <p class="section-desc">定义AI的角色和行为准则，影响生成内容的整体风格</p>
        <textarea
          v-model="prompts.systemPrompt"
          class="prompt-editor"
          rows="8"
          placeholder="输入系统提示词..."
        ></textarea>
      </section>
      
      <!-- 用户提示词模板 -->
      <section class="settings-section">
        <div class="section-header">
          <h2 class="section-title">
            <span class="section-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </span>
            用户提示词模板
          </h2>
          <InkButton
            text="恢复默认"
            variant="ghost"
            size="small"
            @click="resetPrompt('user')"
          />
        </div>
        <p class="section-desc">定义发送给AI的具体指令，控制日记生成的具体要求</p>
        
        <!-- 变量快速插入 -->
        <div class="variables-help">
          <span class="variables-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="16 18 22 12 16 6"></polyline>
              <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
            可用变量
          </span>
          <div class="variables-list">
          <button 
            v-for="variable in availableVariables" 
            :key="variable.name"
            class="variable-tag"
            :class="variable.type"
            @click="insertVariable('userPromptTemplate', variable.name)"
            :title="variable.desc"
          >
            {{ variable.name }}
          </button>
        </div>
        </div>
        
        <textarea
          v-model="prompts.userPromptTemplate"
          class="prompt-editor"
          rows="12"
          placeholder="输入用户提示词模板..."
        ></textarea>
      </section>
      
      <!-- 标签生成提示词 -->
      <section class="settings-section">
        <div class="section-header">
          <h2 class="section-title">
            <span class="section-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                <line x1="7" y1="7" x2="7.01" y2="7"></line>
              </svg>
            </span>
            标签生成提示词
          </h2>
          <InkButton
            text="恢复默认"
            variant="ghost"
            size="small"
            @click="resetPrompt('tags')"
          />
        </div>
        <p class="section-desc">定义AI如何为日记生成标签</p>
        <textarea
          v-model="prompts.tagsPrompt"
          class="prompt-editor"
          rows="6"
          placeholder="输入标签生成提示词..."
        ></textarea>
      </section>
      
      <!-- 摘要生成提示词 -->
      <section class="settings-section">
        <div class="section-header">
          <h2 class="section-title">
            <span class="section-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            </span>
            摘要生成提示词
          </h2>
          <InkButton
            text="恢复默认"
            variant="ghost"
            size="small"
            @click="resetPrompt('summary')"
          />
        </div>
        <p class="section-desc">定义AI如何为日记生成摘要</p>
        <textarea
          v-model="prompts.summaryPrompt"
          class="prompt-editor"
          rows="6"
          placeholder="输入摘要生成提示词..."
        ></textarea>
      </section>
      
      <!-- 提示词预览 -->
      <section class="settings-section preview-section">
        <div class="section-header">
          <h2 class="section-title">
            <span class="section-icon">👁</span>
            提示词预览
          </h2>
        </div>
        <p class="section-desc">查看实际发送给AI的完整提示词（使用示例数据）</p>
        
        <div class="preview-tabs">
          <button 
            v-for="tab in previewTabs" 
            :key="tab.key"
            :class="['preview-tab', { active: activePreviewTab === tab.key }]"
            @click="activePreviewTab = tab.key"
          >
            {{ tab.label }}
          </button>
        </div>
        
        <div class="preview-content">
          <pre>{{ previewContent }}</pre>
        </div>
      </section>
      
      <!-- 操作按钮 -->
      <div class="actions-section">
        <InkButton
          text="💾 保存设置"
          variant="primary"
          :loading="saving"
          @click="savePrompts"
        />
        <InkButton
          text="📤 导出提示词"
          variant="ghost"
          @click="exportPrompts"
        />
        <InkButton
          text="📥 导入提示词"
          variant="ghost"
          @click="triggerImport"
        />
        <input
          ref="importInput"
          type="file"
          accept=".json"
          class="hidden"
          @change="handleImport"
        />
      </div>
      
      <!-- 提示 -->
      <div class="tips-section">
        <h3>? 使用提示</h3>
        <ul>
          <li>系统提示词定义AI的角色，如"你是一位专业的日记美化助手"</li>
          <li>用户提示词模板可使用变量，如 {{title}}、{{content}} 等</li>
          <li>修改提示词后，下次生成日记时生效</li>
          <li>建议先备份默认提示词，再尝试自定义</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { getConfig, setConfig } from '../modules/db.js'
import { 
  DEFAULT_SYSTEM_PROMPT, 
  DEFAULT_USER_PROMPT_TEMPLATE,
  DEFAULT_TAGS_PROMPT,
  DEFAULT_SUMMARY_PROMPT
} from '../modules/ai-client.js'
import InkButton from '../components/InkButton.vue'

// 示例数据用于预览
const previewSampleData = {
  title: '示例日记标题',
  mood: 'happy',
  moodLabel: '开心',
  moodIcon: '😊',
  date: '2024-01-15',
  content: '今天天气很好，我和朋友一起去公园散步。阳光温暖，微风轻拂，感觉心情特别愉快。',
  style: '风格：简约清新',
  styleLabel: '简约清新',
  styleRequirement: '2. 应用"简约清新"的视觉风格',
  preset: '希望文字简洁优美'
}

/**
 * PromptSettings - AI提示词设置页面
 * 
 * 功能：
 * - 自定义系统提示词
 * - 自定义用户提示词模板
 * - 自定义标签生成提示词
 * - 自定义摘要生成提示词
 * - 导入/导出提示词配置
 */

// 响应式状态
const prompts = reactive({
  systemPrompt: '',
  userPromptTemplate: '',
  tagsPrompt: '',
  summaryPrompt: ''
})

const saving = ref(false)
const importInput = ref(null)
const activePreviewTab = ref('system')

// 预览标签页
const previewTabs = [
  { key: 'system', label: '系统提示词' },
  { key: 'user', label: '用户提示词' },
  { key: 'tags', label: '标签生成' },
  { key: 'summary', label: '摘要生成' }
]

// 可用变量列表
const availableVariables = [
  { name: '{{title}}', desc: '日记标题' },
  { name: '{{mood}}', desc: '心情值（如：happy, calm）' },
  { name: '{{moodLabel}}', desc: '心情标签（如：开心, 平静）' },
  { name: '{{moodIcon}}', desc: '心情图标（如：😊）' },
  { name: '{{date}}', desc: '日记日期' },
  { name: '{{content}}', desc: '日记原文内容' },
  { name: '{{style}}', desc: '风格信息' },
  { name: '{{styleLabel}}', desc: '风格标签' },
  { name: '{{styleRequirement}}', desc: '风格要求' },
  { name: '{{preset}}', desc: '用户自定义要求' }
]

// 加载提示词配置
async function loadPrompts() {
  try {
    prompts.systemPrompt = await getConfig('systemPrompt', DEFAULT_SYSTEM_PROMPT)
    prompts.userPromptTemplate = await getConfig('userPromptTemplate', DEFAULT_USER_PROMPT_TEMPLATE)
    prompts.tagsPrompt = await getConfig('tagsPrompt', DEFAULT_TAGS_PROMPT)
    prompts.summaryPrompt = await getConfig('summaryPrompt', DEFAULT_SUMMARY_PROMPT)
    console.log('[PromptSettings] 提示词配置已加载')
  } catch (error) {
    console.error('[PromptSettings] 加载提示词失败:', error)
    // 使用默认值
    prompts.systemPrompt = DEFAULT_SYSTEM_PROMPT
    prompts.userPromptTemplate = DEFAULT_USER_PROMPT_TEMPLATE
    prompts.tagsPrompt = DEFAULT_TAGS_PROMPT
    prompts.summaryPrompt = DEFAULT_SUMMARY_PROMPT
  }
}

// 保存提示词配置
async function savePrompts() {
  saving.value = true
  try {
    await setConfig('systemPrompt', prompts.systemPrompt)
    await setConfig('userPromptTemplate', prompts.userPromptTemplate)
    await setConfig('tagsPrompt', prompts.tagsPrompt)
    await setConfig('summaryPrompt', prompts.summaryPrompt)
    alert('提示词设置已保存')
    console.log('[PromptSettings] 提示词配置已保存')
  } catch (error) {
    console.error('[PromptSettings] 保存提示词失败:', error)
    alert('保存失败: ' + error.message)
  } finally {
    saving.value = false
  }
}

// 重置提示词为默认
function resetPrompt(type) {
  if (!confirm('确定要恢复默认提示词吗？')) return
  
  switch (type) {
    case 'system':
      prompts.systemPrompt = DEFAULT_SYSTEM_PROMPT
      break
    case 'user':
      prompts.userPromptTemplate = DEFAULT_USER_PROMPT_TEMPLATE
      break
    case 'tags':
      prompts.tagsPrompt = DEFAULT_TAGS_PROMPT
      break
    case 'summary':
      prompts.summaryPrompt = DEFAULT_SUMMARY_PROMPT
      break
  }
  console.log(`[PromptSettings] ${type} 提示词已重置为默认`)
}

// 导出提示词
function exportPrompts() {
  const data = {
    version: '1.0.0',
    exportTime: new Date().toISOString(),
    prompts: {
      systemPrompt: prompts.systemPrompt,
      userPromptTemplate: prompts.userPromptTemplate,
      tagsPrompt: prompts.tagsPrompt,
      summaryPrompt: prompts.summaryPrompt
    }
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = `ink-diary-prompts-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  
  URL.revokeObjectURL(url)
  console.log('[PromptSettings] 提示词已导出')
}

// 触发导入
function triggerImport() {
  importInput.value?.click()
}

// 处理导入
async function handleImport(event) {
  const file = event.target.files[0]
  if (!file) return
  
  try {
    const text = await file.text()
    const data = JSON.parse(text)
    
    if (data.prompts) {
      prompts.systemPrompt = data.prompts.systemPrompt || DEFAULT_SYSTEM_PROMPT
      prompts.userPromptTemplate = data.prompts.userPromptTemplate || DEFAULT_USER_PROMPT_TEMPLATE
      prompts.tagsPrompt = data.prompts.tagsPrompt || DEFAULT_TAGS_PROMPT
      prompts.summaryPrompt = data.prompts.summaryPrompt || DEFAULT_SUMMARY_PROMPT
      
      alert('提示词已导入，请记得保存设置')
      console.log('[PromptSettings] 提示词已导入')
    } else {
      alert('无效的文件格式')
    }
  } catch (error) {
    console.error('[PromptSettings] 导入失败:', error)
    alert('导入失败: ' + error.message)
  }
  
  // 清空 input
  event.target.value = ''
}

// 预览内容
const previewContent = computed(() => {
  let template = ''
  switch (activePreviewTab.value) {
    case 'system':
      return prompts.systemPrompt || '系统提示词为空'
    case 'user':
      template = prompts.userPromptTemplate || ''
      break
    case 'tags':
      template = prompts.tagsPrompt || ''
      break
    case 'summary':
      template = prompts.summaryPrompt || ''
      break
    default:
      return ''
  }
  
  // 替换变量为示例数据
  let result = template
  for (const [key, value] of Object.entries(previewSampleData)) {
    const regex = new RegExp(`{{${key}}}`, 'g')
    result = result.replace(regex, value)
  }
  return result
})

// 插入变量到指定字段
function insertVariable(field, variable) {
  const textarea = document.querySelector(`textarea[v-model="prompts.${field}"]`)
  if (textarea) {
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = prompts[field]
    prompts[field] = text.substring(0, start) + variable + text.substring(end)
    // 恢复焦点
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + variable.length, start + variable.length)
    }, 0)
  } else {
    // 如果找不到textarea，直接追加
    prompts[field] += variable
  }
}

// 组件挂载时加载配置
onMounted(() => {
  loadPrompts()
})
</script>

<style scoped>
.prompt-settings {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

/* 页面标题 */
.prompt-settings__header {
  text-align: center;
  margin-bottom: 2rem;
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
}

/* 墨迹分隔线 */
.ink-divider {
  height: 1px;
  background: linear-gradient(
    to right,
    transparent 0%,
    var(--ink-sandalwood) 20%,
    var(--ink-sandalwood) 80%,
    transparent 100%
  );
  margin-bottom: 2rem;
}

/* 设置内容 */
.prompt-settings__content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* 设置区块 */
.settings-section {
  background-color: var(--ink-paper);
  border: 1px solid var(--ink-rice);
  border-radius: 2px;
  padding: 1.5rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: "LXGW WenKai", serif;
  font-size: 1.25rem;
  font-weight: 400;
  color: var(--ink-dark);
  margin: 0;
}

.section-icon {
  font-size: 1.25rem;
}

.section-desc {
  font-family: "LXGW WenKai", serif;
  font-size: 0.875rem;
  color: var(--ink-sandalwood);
  margin-bottom: 1rem;
}

/* 变量帮助区域 */
.variables-help {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: rgba(139, 69, 19, 0.05);
  border-radius: 4px;
}

.variables-label {
  font-family: "LXGW WenKai", serif;
  font-size: 0.875rem;
  color: var(--ink-dark);
  flex-shrink: 0;
  font-weight: 500;
}

.variables-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.variable-tag {
  padding: 0.25rem 0.5rem;
  font-family: "Fira Code", monospace;
  font-size: 0.75rem;
  color: var(--ink-ochre);
  background-color: rgba(139, 69, 19, 0.1);
  border: 1px solid rgba(139, 69, 19, 0.2);
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.variable-tag:hover {
  background-color: var(--ink-ochre);
  color: var(--ink-paper);
}

/* 提示词编辑器 */
.prompt-editor {
  width: 100%;
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

.prompt-editor:focus {
  border-color: var(--ink-ochre);
  box-shadow: 0 0 0 3px rgba(139, 69, 19, 0.1);
}

/* 预览区域 */
.preview-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--ink-rice);
  padding-bottom: 0.5rem;
}

.preview-tab {
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

.preview-tab:hover {
  background-color: var(--ink-hover);
  color: var(--ink-dark);
}

.preview-tab.active {
  background-color: var(--ink-ochre);
  color: var(--ink-paper);
}

.preview-content {
  background-color: #f8f6f0;
  border: 1px solid var(--ink-rice);
  border-radius: 2px;
  padding: 1rem;
  max-height: 400px;
  overflow-y: auto;
}

.preview-content pre {
  margin: 0;
  font-family: "Fira Code", "Consolas", monospace;
  font-size: 0.8125rem;
  line-height: 1.6;
  color: var(--ink-dark);
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* 操作按钮区 */
.actions-section {
  display: flex;
  gap: 1rem;
  justify-content: center;
  padding: 1rem;
  background-color: var(--ink-hover);
  border-radius: 2px;
}

.hidden {
  display: none;
}

/* 提示区 */
.tips-section {
  background-color: rgba(139, 69, 19, 0.05);
  border: 1px solid var(--ink-rice);
  border-radius: 2px;
  padding: 1.5rem;
}

.tips-section h3 {
  font-family: "LXGW WenKai", serif;
  font-size: 1rem;
  font-weight: 400;
  color: var(--ink-dark);
  margin-bottom: 0.75rem;
}

.tips-section ul {
  margin: 0;
  padding-left: 1.5rem;
}

.tips-section li {
  font-family: "LXGW WenKai", serif;
  font-size: 0.875rem;
  color: var(--ink-sandalwood);
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

/* 响应式 */
@media (max-width: 768px) {
  .prompt-settings {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .settings-section {
    padding: 1rem;
  }
  
  .actions-section {
    flex-direction: column;
  }
}
</style>
