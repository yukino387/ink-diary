/**
 * AI 客户端模块 (ai-client.js)
 * 提供 AI 生成日记内容、流式输出、风格模板等功能
 */

import { getConfig, getAllTags } from './db.js'

// ========================================
// 默认提示词配置（可被用户自定义覆盖）
// ========================================

export const DEFAULT_SYSTEM_PROMPT = `你是一位专业的日记排版助手，任务是将用户的日记原文转换为精美的HTML格式。

## 核心原则
1. 尊重原文：保持用户的原意、情感和写作风格，不做过度修改
2. 优化排版：适当分段，提升阅读体验
3. 视觉美化：根据用户选择的风格应用相应的视觉主题

## 输出规范
1. 返回完整的HTML文档（包含<!DOCTYPE html>、<html>、<head>、<body>）
2. 使用内联CSS样式，确保HTML可以独立显示
3. 正文内容使用 <div class="content"> 包裹
4. 段落使用 <p> 标签，每段一个<p>
5. 不要使用Markdown代码块标记（如 \`\`\`html）
6. 确保HTML结构完整、标签闭合正确

## 样式要求
- 背景色、文字色、强调色需与选择的风格匹配
- 字体使用系统默认中文字体
- 适当的行高和字间距
- 段落间有合适的间距

## 注意事项
- 不要添加原文中没有的内容
- 不要改变原文的核心意思
- 可以适当优化语句通顺度
- 保持日记的真实性和个人特色`

export const DEFAULT_USER_PROMPT_TEMPLATE = `请将以下日记转换为精美的HTML格式。

## 日记信息
- 标题：{{title}}
- 心情：{{moodLabel}} {{moodIcon}}
- 日期：{{date}}
{{style}}
{{preset}}

## 原文内容
{{content}}

## 处理要求
1. 基于原文进行润色排版，不要改变原意
{{styleRequirement}}
3. 返回完整的HTML文档代码
4. 确保HTML可以直接在浏览器中显示
5. 保持日记的真实情感，不要过度渲染

## 输出格式
直接返回HTML代码，不要添加任何解释说明。`

export const DEFAULT_TAGS_PROMPT = `请为以下日记生成初步标签（第一轮）。

## 日记信息
- 标题：{{title}}
- 心情：{{moodLabel}}

## 日记内容
{{content}}

## 生成要求
1. 生成3-5个初步标签
2. 每个标签2-4个汉字
3. 不要带#号或其他符号
4. 标签应概括日记的主题、情感或关键词
5. 这是第一轮生成，后续会结合已有标签进行优化

## 输出格式
必须返回JSON格式：
{"tags": ["标签1", "标签2", "标签3"]}`

export const DEFAULT_TAGS_OPTIMIZE_PROMPT = `请优化日记标签（第二轮）。

## 日记信息
- 标题：{{title}}
- 心情：{{moodLabel}}

## 日记内容
{{content}}

## 第一轮生成的初步标签
{{initialTags}}

## 用户已有的所有标签
{{existingTags}}

## 优化要求
1. 从初步标签中选择最贴切的，或进行优化调整
2. 参考已有标签列表，避免创建过于相似的重复标签
3. 如果初步标签与已有标签含义相近，优先使用已有标签（保持标签体系一致性）
4. 如果初步标签能更好地表达日记内容，可以保留或微调
5. 最终生成3-5个标签
6. 每个标签2-4个汉字
7. 不要带#号或其他符号

## 优化策略
- 优先考虑标签的准确性和一致性
- 在"表达准确性"和"体系一致性"之间取得平衡
- 如果已有标签能准确表达，优先复用
- 如果初步标签更准确，可以使用新的标签

## 输出格式
必须返回JSON格式：
{"tags": ["标签1", "标签2", "标签3"]}`

export const DEFAULT_SUMMARY_PROMPT = `请为以下日记生成一句话摘要。

## 日记信息
- 标题：{{title}}
- 心情：{{moodLabel}}

## 日记内容
{{content}}

## 生成要求
1. 生成一句话摘要
2. 字数控制在20-40字之间
3. 概括日记的核心内容或主要情感
4. 语言简洁优美

## 输出格式
必须返回JSON格式：
{"summary": "摘要内容"}`

// ========================================
// 风格选项配置
// ========================================

export const STYLE_OPTIONS = [
  { 
    value: 'daily', 
    label: '日常随笔', 
    description: '温暖舒适，适合生活记录',
    cssTheme: 'daily',
    icon: '📝'
  },
  { 
    value: 'work', 
    label: '工作记录', 
    description: '专业简洁，层次分明',
    cssTheme: 'work',
    icon: '💼'
  },
  { 
    value: 'study', 
    label: '学习笔记', 
    description: '清晰易读，重点突出',
    cssTheme: 'study',
    icon: '📚'
  },
  { 
    value: 'travel', 
    label: '旅行游记', 
    description: '开阔舒展，图文友好',
    cssTheme: 'travel',
    icon: '✈️'
  },
  { 
    value: 'none', 
    label: '自定义', 
    description: '基础样式，自由发挥',
    cssTheme: 'none',
    icon: '⚙️'
  }
]

// 心情选项
export const MOOD_OPTIONS = [
  { value: 'happy', label: '开心', icon: '😊' },
  { value: 'calm', label: '平静', icon: '😌' },
  { value: 'thoughtful', label: '沉思', icon: '🤔' },
  { value: 'grateful', label: '感恩', icon: '🙏' },
  { value: 'excited', label: '兴奋', icon: '🤩' },
  { value: 'tired', label: '疲惫', icon: '😴' },
  { value: 'sad', label: '难过', icon: '😢' },
  { value: 'anxious', label: '焦虑', icon: '😰' },
  { value: 'angry', label: '生气', icon: '😠' },
  { value: 'loved', label: '被爱', icon: '🥰' },
  { value: 'creative', label: '创作', icon: '✨' },
  { value: 'nostalgic', label: '怀旧', icon: '🌙' }
]

// ========================================
// HTML 模板与 CSS 主题
// ========================================

const CSS_THEMES = {
  daily: `
    :root {
      --bg-color: #faf8f3;
      --text-color: #2c3e50;
      --accent-color: #8b4513;
      --secondary-color: #a0826d;
      --border-color: #d4c4b0;
    }
    body { background: #faf8f3; }
    h1 { color: var(--accent-color); border-bottom: 2px solid var(--border-color); padding-bottom: 0.5em; }
    .content { text-indent: 2em; line-height: 1.8; }
    .content p { margin-bottom: 1em; }
    .mood-badge { background: rgba(139, 69, 19, 0.1); border: 1px solid var(--border-color); }
  `,
  work: `
    :root {
      --bg-color: #f8f9fa;
      --text-color: #1a365d;
      --accent-color: #3182ce;
      --secondary-color: #4a5568;
      --border-color: #e2e8f0;
    }
    body { background: #f8f9fa; }
    h1 { color: var(--text-color); font-weight: 600; border-bottom: 2px solid var(--border-color); padding-bottom: 0.5em; }
    .content { line-height: 1.7; }
    .content p { margin-bottom: 0.75em; }
    .content ul, .content ol { margin-left: 1.5em; margin-bottom: 0.75em; }
    .mood-badge { background: rgba(49, 130, 206, 0.1); border: 1px solid var(--accent-color); }
  `,
  study: `
    :root {
      --bg-color: #fefce8;
      --text-color: #1f2937;
      --accent-color: #047857;
      --secondary-color: #374151;
      --border-color: #d1d5db;
    }
    body { background: #fefce8; }
    h1 { color: var(--accent-color); border-bottom: 2px solid var(--border-color); padding-bottom: 0.5em; }
    .content { line-height: 1.8; }
    .content p { margin-bottom: 1em; }
    .content blockquote { border-left: 3px solid var(--accent-color); padding-left: 1em; margin-left: 0; color: var(--secondary-color); }
    .content strong { color: var(--accent-color); }
    .mood-badge { background: rgba(4, 120, 87, 0.1); border: 1px solid var(--accent-color); }
  `,
  travel: `
    :root {
      --bg-color: #f0f9ff;
      --text-color: #0c4a6e;
      --accent-color: #0891b2;
      --secondary-color: #334155;
      --border-color: #bae6fd;
    }
    body { background: #f0f9ff; }
    h1 { color: var(--accent-color); border-bottom: 2px solid var(--border-color); padding-bottom: 0.5em; }
    .content { line-height: 1.75; }
    .content p { margin-bottom: 0.75em; }
    .timeline { border-left: 2px solid var(--accent-color); padding-left: 1em; }
    .mood-badge { background: rgba(8, 145, 178, 0.1); border: 1px solid var(--accent-color); }
  `,
  none: `
    :root {
      --bg-color: #ffffff;
      --text-color: #1f2937;
      --accent-color: #6b7280;
      --secondary-color: #4b5563;
      --border-color: #e5e7eb;
    }
    body { background: #ffffff; }
    h1 { color: var(--text-color); border-bottom: 1px solid var(--border-color); padding-bottom: 0.5em; }
    .content { line-height: 1.7; }
    .content p { margin-bottom: 1em; }
    .mood-badge { background: #f3f4f6; border: 1px solid var(--border-color); }
  `
}

/**
 * 获取 HTML 基础模板
 * @param {string} style - 风格值
 * @returns {string} HTML 模板
 */
export function getHtmlTemplate(style = 'classical') {
  const theme = CSS_THEMES[style] || CSS_THEMES.classical
  
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: "LXGW WenKai", "Noto Serif SC", "PingFang SC", "Microsoft YaHei", serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 3rem 2rem;
      line-height: 1.8;
      color: var(--text-color);
      background-color: var(--bg-color);
      ${theme}
    }
    .diary-container {
      background: rgba(255, 255, 255, 0.6);
      padding: 2.5rem;
      border-radius: 4px;
      box-shadow: 0 2px 20px rgba(0, 0, 0, 0.05);
    }
    h1 {
      font-size: 1.8rem;
      text-align: center;
      margin-bottom: 1rem;
      font-weight: 400;
    }
    .meta {
      text-align: center;
      color: var(--secondary-color);
      font-size: 0.9rem;
      margin-bottom: 2rem;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .date { font-style: italic; }
    .mood-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.2rem 0.6rem;
      border-radius: 12px;
      font-size: 0.85rem;
    }
    .tags {
      display: flex;
      justify-content: center;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }
    .tag {
      font-size: 0.75rem;
      color: var(--secondary-color);
      padding: 0.15rem 0.5rem;
      background: rgba(0, 0, 0, 0.03);
      border-radius: 3px;
    }
    .content {
      font-size: 1rem;
      text-align: justify;
    }
    .content p {
      margin-bottom: 1em;
    }
    .divider {
      text-align: center;
      margin: 2rem 0;
      color: var(--border-color);
      font-size: 1.2rem;
      letter-spacing: 1rem;
    }
    @media (max-width: 600px) {
      body { padding: 1.5rem 1rem; }
      .diary-container { padding: 1.5rem; }
      h1 { font-size: 1.5rem; }
    }
  </style>
</head>
<body>
  <div class="diary-container">
    <h1>{{title}}</h1>
    <div class="meta">
      <span class="date">{{date}}</span>
      <span class="mood-badge">{{moodIcon}} {{mood}}</span>
    </div>
    <div class="tags">{{tags}}</div>
    <div class="divider">* * *</div>
    <div class="content">
      {{content}}
    </div>
  </div>
</body>
</html>`
}

// ========================================
// AI 生成相关函数
// ========================================

/**
 * 替换模板变量
 * @param {string} template - 模板字符串
 * @param {Object} variables - 变量对象
 * @returns {string} 替换后的字符串
 */
function replaceTemplateVariables(template, variables) {
  let result = template
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g')
    result = result.replace(regex, value || '')
  }
  return result
}

/**
 * 构建 AI 提示词
 * @param {Object} params - 生成参数
 * @returns {Promise<Object>} 包含 system 和 user 的消息对象
 */
async function buildPrompt(params) {
  const { title, mood, moodLabel, date, content, style, preset, styleLabel } = params
  
  // 获取自定义提示词（如果有）
  const systemPrompt = await getConfig('systemPrompt', DEFAULT_SYSTEM_PROMPT)
  const userPromptTemplate = await getConfig('userPromptTemplate', DEFAULT_USER_PROMPT_TEMPLATE)
  
  // 处理风格相关变量
  let styleLine = ''
  let styleRequirement = ''
  
  if (style === 'none') {
    // 无风格模式
    styleLine = ''
    styleRequirement = '2. 保持简洁自然的排版风格'
  } else {
    // 有特定风格
    styleLine = `风格：${styleLabel}`
    styleRequirement = `2. 应用"${styleLabel}"的视觉风格`
  }
  
  // 构建变量对象
  const variables = {
    title: title || '',
    mood: mood || '',
    moodLabel: moodLabel || '',
    date: date || '',
    content: content || '',
    style: styleLine,
    styleLabel: styleLabel || '',
    styleRequirement: styleRequirement,
    preset: preset ? `额外要求：${preset}` : ''
  }
  
  // 替换模板变量
  const userPrompt = replaceTemplateVariables(userPromptTemplate, variables)
  
  return {
    system: systemPrompt,
    user: userPrompt
  }
}

/**
 * 生成日记内容（非流式）
 * @param {Object} params - 生成参数
 * @param {string} params.title - 标题
 * @param {string} params.mood - 心情值
 * @param {string} params.moodLabel - 心情标签
 * @param {string} params.date - 日期
 * @param {string} params.content - 原文内容
 * @param {string} params.style - 风格值
 * @param {string} params.styleLabel - 风格标签
 * @param {string} [params.preset] - 自定义预设
 * @returns {Promise<{html: string, tags: string[], summary: string}>} 生成结果
 */
export async function generateDiaryContent(params) {
  const apiBaseUrl = await getConfig('apiBaseUrl', '')
  const apiKey = await getConfig('apiKey', '')
  const aiModel = await getConfig('aiModel', 'gpt-4o-mini')
  
  if (!apiBaseUrl || !apiKey) {
    throw new Error('请先在设置中配置 AI API')
  }
  
  const prompts = await buildPrompt(params)
  
  try {
    const response = await fetch(`${apiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: aiModel,
        messages: [
          { role: 'system', content: prompts.system },
          { role: 'user', content: prompts.user }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    })
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || `API 请求失败: ${response.status}`)
    }
    
    const data = await response.json()
    let html = data.choices?.[0]?.message?.content || ''
    
    // 清理 markdown 代码块
    html = html.replace(/```html\n?/gi, '').replace(/```\n?/gi, '').trim()
    
    // 生成标签和摘要
    const { tags, summary } = await generateTagsAndSummary(params)
    
    return { html, tags, summary }
  } catch (error) {
    console.error('[AI] 生成日记内容失败:', error)
    throw error
  }
}

/**
 * 流式生成日记内容
 * @param {Object} params - 生成参数
 * @param {Function} onChunk - 每次收到数据时的回调 (chunk: string) => void
 * @param {Function} onComplete - 完成时的回调 (result: {html: string, tags: string[], summary: string}) => void
 * @param {Function} onError - 错误时的回调 (error: Error) => void
 */
export async function generateDiaryContentStream(params, onChunk, onComplete, onError) {
  const apiBaseUrl = await getConfig('apiBaseUrl', '')
  const apiKey = await getConfig('apiKey', '')
  const aiModel = await getConfig('aiModel', 'gpt-4o-mini')
  
  if (!apiBaseUrl || !apiKey) {
    onError(new Error('请先在设置中配置 AI API'))
    return
  }
  
  const prompts = await buildPrompt(params)
  
  try {
    const response = await fetch(`${apiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: aiModel,
        messages: [
          { role: 'system', content: prompts.system },
          { role: 'user', content: prompts.user }
        ],
        temperature: 0.7,
        max_tokens: 4000,
        stream: true
      })
    })
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || `API 请求失败: ${response.status}`)
    }
    
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let fullContent = ''
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      
      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n')
      
      for (const line of lines) {
        if (line.trim() === '') continue
        if (line.trim() === 'data: [DONE]') continue
        
        if (line.startsWith('data: ')) {
          try {
            const json = JSON.parse(line.slice(6))
            const content = json.choices?.[0]?.delta?.content || ''
            if (content) {
              fullContent += content
              onChunk(content)
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }
    
    // 清理 markdown 代码块
    fullContent = fullContent.replace(/```html\n?/gi, '').replace(/```\n?/gi, '').trim()
    
    // 生成标签和摘要
    const { tags, summary } = await generateTagsAndSummary(params)
    
    onComplete({ html: fullContent, tags, summary })
  } catch (error) {
    console.error('[AI] 流式生成失败:', error)
    onError(error)
  }
}

/**
 * 生成标签和摘要（标签使用两轮优化）
 * @param {Object} params - 日记参数
 * @returns {Promise<{tags: string[], summary: string}>}
 */
async function generateTagsAndSummary(params) {
  const { title, content, moodLabel } = params
  const apiBaseUrl = await getConfig('apiBaseUrl', '')
  const apiKey = await getConfig('apiKey', '')
  const aiModel = await getConfig('aiModel', 'gpt-4o-mini')
  
  if (!apiBaseUrl || !apiKey) {
    // 如果没有配置AI，使用简单规则生成
    return generateLocalTagsAndSummary(params)
  }
  
  // 获取自定义提示词
  const tagsPromptTemplate = await getConfig('tagsPrompt', DEFAULT_TAGS_PROMPT)
  const tagsOptimizePromptTemplate = await getConfig('tagsOptimizePrompt', DEFAULT_TAGS_OPTIMIZE_PROMPT)
  const summaryPromptTemplate = await getConfig('summaryPrompt', DEFAULT_SUMMARY_PROMPT)
  
  // 基础变量
  const baseVariables = {
    title: title || '',
    moodLabel: moodLabel || '',
    content: content ? content.substring(0, 800) + (content.length > 800 ? '...' : '') : ''
  }
  
  try {
    // ========== 第一轮：生成初步标签 ==========
    console.log('[AI] 开始第一轮标签生成...')
    const firstPrompt = replaceTemplateVariables(tagsPromptTemplate, baseVariables)
    
    const firstResponse = await fetch(`${apiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: aiModel,
        messages: [
          { role: 'user', content: firstPrompt }
        ],
        temperature: 0.5,
        max_tokens: 150
      })
    })
    
    if (!firstResponse.ok) {
      console.error('[AI] 第一轮标签生成失败，使用本地生成')
      const summary = await generateSummaryOnly(params, summaryPromptTemplate, baseVariables, apiBaseUrl, apiKey, aiModel)
      return { tags: generateLocalTags(params), summary }
    }
    
    const firstData = await firstResponse.json()
    let firstText = firstData.choices?.[0]?.message?.content || ''
    firstText = firstText.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim()
    
    let initialTags = []
    try {
      const firstResult = JSON.parse(firstText)
      initialTags = firstResult.tags || []
      console.log('[AI] 第一轮生成的初步标签:', initialTags)
    } catch (e) {
      console.error('[AI] 解析第一轮标签失败，使用本地生成')
      const summary = await generateSummaryOnly(params, summaryPromptTemplate, baseVariables, apiBaseUrl, apiKey, aiModel)
      return { tags: generateLocalTags(params), summary }
    }
    
    if (initialTags.length === 0) {
      const summary = await generateSummaryOnly(params, summaryPromptTemplate, baseVariables, apiBaseUrl, apiKey, aiModel)
      return { tags: generateLocalTags(params), summary }
    }
    
    // ========== 获取所有已有标签 ==========
    let existingTags = []
    try {
      existingTags = await getAllTags()
      console.log('[AI] 获取到已有标签:', existingTags)
    } catch (e) {
      console.warn('[AI] 获取已有标签失败，继续使用初步标签')
    }
    
    // ========== 第二轮：优化标签 ==========
    console.log('[AI] 开始第二轮标签优化...')
    const optimizeVariables = {
      ...baseVariables,
      initialTags: JSON.stringify(initialTags, null, 2),
      existingTags: existingTags.length > 0 
        ? existingTags.join(', ')
        : '暂无已有标签'
    }
    
    const secondPrompt = replaceTemplateVariables(tagsOptimizePromptTemplate, optimizeVariables)
    
    const secondResponse = await fetch(`${apiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: aiModel,
        messages: [
          { role: 'user', content: secondPrompt }
        ],
        temperature: 0.3,
        max_tokens: 150
      })
    })
    
    let tags = initialTags
    if (secondResponse.ok) {
      const secondData = await secondResponse.json()
      let secondText = secondData.choices?.[0]?.message?.content || ''
      secondText = secondText.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim()
      
      try {
        const secondResult = JSON.parse(secondText)
        tags = secondResult.tags || initialTags
        console.log('[AI] 第二轮优化后的最终标签:', tags)
      } catch (e) {
        console.warn('[AI] 解析第二轮标签失败，使用初步标签')
      }
    } else {
      console.warn('[AI] 第二轮标签优化失败，返回初步标签')
    }
    
    // ========== 生成摘要（并行执行）==========
    const summary = await generateSummaryOnly(params, summaryPromptTemplate, baseVariables, apiBaseUrl, apiKey, aiModel)
    
    return { tags, summary }
  } catch (error) {
    console.error('[AI] 生成标签和摘要失败:', error)
    return generateLocalTagsAndSummary(params)
  }
}

/**
 * 独立生成摘要（辅助函数）
 * @param {Object} params - 日记参数
 * @param {string} summaryPromptTemplate - 摘要提示词模板
 * @param {Object} variables - 变量对象
 * @param {string} apiBaseUrl - API基础URL
 * @param {string} apiKey - API密钥
 * @param {string} aiModel - AI模型
 * @returns {Promise<string>}
 */
async function generateSummaryOnly(params, summaryPromptTemplate, variables, apiBaseUrl, apiKey, aiModel) {
  try {
    const summaryPrompt = replaceTemplateVariables(summaryPromptTemplate, variables)
    const summaryResponse = await fetch(`${apiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: aiModel,
        messages: [
          { role: 'user', content: summaryPrompt }
        ],
        temperature: 0.5,
        max_tokens: 100
      })
    })
    
    if (summaryResponse.ok) {
      const summaryData = await summaryResponse.json()
      let summaryText = summaryData.choices?.[0]?.message?.content || ''
      summaryText = summaryText.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim()
      try {
        const summaryResult = JSON.parse(summaryText)
        return summaryResult.summary || ''
      } catch (e) {
        return generateLocalSummary(params)
      }
    } else {
      return generateLocalSummary(params)
    }
  } catch (error) {
    console.error('[AI] 生成摘要失败:', error)
    return generateLocalSummary(params)
  }
}

/**
 * 本地生成标签和摘要（备用方案）
 * @param {Object} params - 日记参数
 * @returns {{tags: string[], summary: string}}
 */
function generateLocalTagsAndSummary(params) {
  return {
    tags: generateLocalTags(params),
    summary: generateLocalSummary(params)
  }
}

/**
 * 本地生成标签
 * @param {Object} params - 日记参数
 * @returns {string[]}
 */
function generateLocalTags(params) {
  const { title, content, moodLabel } = params
  const text = (title + ' ' + content).toLowerCase()
  const tags = []
  
  // 关键词映射
  const keywordMap = {
    '随笔': ['写', '想', '感', '记'],
    '工作': ['工作', '办公', '项目', '任务', '会议'],
    '学习': ['学', '书', '读', '课', '知识'],
    '旅行': ['旅', '游', '行', '景', '路'],
    '美食': ['吃', '食', '餐', '味', '菜'],
    '运动': ['跑', '动', '健身', '运动', '锻炼'],
    '心情': ['情', '心', '感', '绪'],
    '自然': ['天', '云', '风', '雨', '花', '树'],
    '家人': ['家', '父', '母', '亲', '子'],
    '朋友': ['友', '朋', '聚', '聊']
  }
  
  for (const [tag, keywords] of Object.entries(keywordMap)) {
    if (keywords.some(kw => text.includes(kw))) {
      tags.push(tag)
      if (tags.length >= 4) break
    }
  }
  
  // 添加心情标签
  if (moodLabel && !tags.includes(moodLabel)) {
    tags.unshift(moodLabel)
  }
  
  // 确保至少有一个标签
  if (tags.length === 0) {
    tags.push('随笔')
  }
  
  return tags.slice(0, 5)
}

/**
 * 本地生成摘要
 * @param {Object} params - 日记参数
 * @returns {string}
 */
function generateLocalSummary(params) {
  const { title, content, moodLabel } = params
  
  // 提取纯文本
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = content
  const text = tempDiv.textContent || tempDiv.innerText || content
  
  // 截取前30字
  const excerpt = text.trim().substring(0, 30)
  
  if (moodLabel) {
    return `${moodLabel}的一天，${excerpt}...`
  }
  return `${excerpt}...`
}

// ========================================
// 独立标签和摘要生成函数（导出供外部使用）
// ========================================

/**
 * 独立生成标签
 * @param {Object} params - 日记参数
 * @param {string} params.title - 标题
 * @param {string} params.content - 内容
 * @param {string} params.moodLabel - 心情标签
 * @returns {Promise<string[]>}
 */
export async function generateTags(params) {
  const { title, content, moodLabel } = params
  const apiBaseUrl = await getConfig('apiBaseUrl', '')
  const apiKey = await getConfig('apiKey', '')
  const aiModel = await getConfig('aiModel', 'gpt-4o-mini')
  
  if (!apiBaseUrl || !apiKey) {
    return generateLocalTags(params)
  }
  
  // 获取提示词模板
  const tagsPromptTemplate = await getConfig('tagsPrompt', DEFAULT_TAGS_PROMPT)
  const tagsOptimizePromptTemplate = await getConfig('tagsOptimizePrompt', DEFAULT_TAGS_OPTIMIZE_PROMPT)
  
  // 基础变量
  const baseVariables = {
    title: title || '',
    moodLabel: moodLabel || '',
    content: content ? content.substring(0, 800) + (content.length > 800 ? '...' : '') : ''
  }
  
  try {
    // ========== 第一轮：生成初步标签 ==========
    console.log('[AI] 开始第一轮标签生成...')
    const firstPrompt = replaceTemplateVariables(tagsPromptTemplate, baseVariables)
    
    const firstResponse = await fetch(`${apiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: aiModel,
        messages: [
          { role: 'user', content: firstPrompt }
        ],
        temperature: 0.5,
        max_tokens: 150
      })
    })
    
    if (!firstResponse.ok) {
      console.error('[AI] 第一轮标签生成失败，使用本地生成')
      return generateLocalTags(params)
    }
    
    const firstData = await firstResponse.json()
    let firstText = firstData.choices?.[0]?.message?.content || ''
    firstText = firstText.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim()
    
    let initialTags = []
    try {
      const firstResult = JSON.parse(firstText)
      initialTags = firstResult.tags || []
      console.log('[AI] 第一轮生成的初步标签:', initialTags)
    } catch (e) {
      console.error('[AI] 解析第一轮标签失败，使用本地生成')
      return generateLocalTags(params)
    }
    
    if (initialTags.length === 0) {
      return generateLocalTags(params)
    }
    
    // ========== 获取所有已有标签 ==========
    let existingTags = []
    try {
      existingTags = await getAllTags()
      console.log('[AI] 获取到已有标签:', existingTags)
    } catch (e) {
      console.warn('[AI] 获取已有标签失败，继续使用初步标签')
    }
    
    // ========== 第二轮：优化标签 ==========
    console.log('[AI] 开始第二轮标签优化...')
    const optimizeVariables = {
      ...baseVariables,
      initialTags: JSON.stringify(initialTags, null, 2),
      existingTags: existingTags.length > 0 
        ? existingTags.join(', ')
        : '暂无已有标签'
    }
    
    const secondPrompt = replaceTemplateVariables(tagsOptimizePromptTemplate, optimizeVariables)
    
    const secondResponse = await fetch(`${apiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: aiModel,
        messages: [
          { role: 'user', content: secondPrompt }
        ],
        temperature: 0.3,
        max_tokens: 150
      })
    })
    
    if (!secondResponse.ok) {
      console.warn('[AI] 第二轮标签优化失败，返回初步标签')
      return initialTags
    }
    
    const secondData = await secondResponse.json()
    let secondText = secondData.choices?.[0]?.message?.content || ''
    secondText = secondText.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim()
    
    try {
      const secondResult = JSON.parse(secondText)
      const finalTags = secondResult.tags || initialTags
      console.log('[AI] 第二轮优化后的最终标签:', finalTags)
      return finalTags
    } catch (e) {
      console.warn('[AI] 解析第二轮标签失败，返回初步标签')
      return initialTags
    }
    
  } catch (error) {
    console.error('[AI] 生成标签失败:', error)
    return generateLocalTags(params)
  }
}

/**
 * 独立生成摘要
 * @param {Object} params - 日记参数
 * @param {string} params.title - 标题
 * @param {string} params.content - 内容
 * @param {string} params.moodLabel - 心情标签
 * @returns {Promise<string>}
 */
export async function generateSummary(params) {
  const { title, content, moodLabel } = params
  const apiBaseUrl = await getConfig('apiBaseUrl', '')
  const apiKey = await getConfig('apiKey', '')
  const aiModel = await getConfig('aiModel', 'gpt-4o-mini')
  
  if (!apiBaseUrl || !apiKey) {
    return generateLocalSummary(params)
  }
  
  const summaryPromptTemplate = await getConfig('summaryPrompt', DEFAULT_SUMMARY_PROMPT)
  
  const variables = {
    title: title || '',
    moodLabel: moodLabel || '',
    content: content ? content.substring(0, 500) + (content.length > 500 ? '...' : '') : ''
  }
  
  try {
    const summaryPrompt = replaceTemplateVariables(summaryPromptTemplate, variables)
    const summaryResponse = await fetch(`${apiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: aiModel,
        messages: [
          { role: 'user', content: summaryPrompt }
        ],
        temperature: 0.5,
        max_tokens: 100
      })
    })
    
    if (summaryResponse.ok) {
      const summaryData = await summaryResponse.json()
      let summaryText = summaryData.choices?.[0]?.message?.content || ''
      summaryText = summaryText.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim()
      try {
        const summaryResult = JSON.parse(summaryText)
        return summaryResult.summary || ''
      } catch (e) {
        return generateLocalSummary(params)
      }
    } else {
      return generateLocalSummary(params)
    }
  } catch (error) {
    console.error('[AI] 生成摘要失败:', error)
    return generateLocalSummary(params)
  }
}

// ========================================
// 工具函数
// ========================================

/**
 * 测试 AI 连接
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function testAIConnection() {
  try {
    const apiBaseUrl = await getConfig('apiBaseUrl', '')
    const apiKey = await getConfig('apiKey', '')
    const aiModel = await getConfig('aiModel', 'gpt-4o-mini')
    
    if (!apiBaseUrl || !apiKey) {
      return { success: false, message: '请配置 API Base URL 和 API Key' }
    }
    
    const response = await fetch(`${apiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: aiModel,
        messages: [
          { role: 'user', content: '你好' }
        ],
        max_tokens: 10
      })
    })
    
    if (response.ok) {
      return { success: true, message: 'AI 连接测试成功' }
    } else {
      const error = await response.json().catch(() => ({}))
      return { success: false, message: error.error?.message || `连接失败: ${response.status}` }
    }
  } catch (error) {
    return { success: false, message: '连接错误: ' + error.message }
  }
}

/**
 * 根据心情值获取心情信息
 * @param {string} moodValue - 心情值
 * @returns {Object} 心情对象
 */
export function getMoodByValue(moodValue) {
  return MOOD_OPTIONS.find(m => m.value === moodValue) || MOOD_OPTIONS[0]
}

/**
 * 根据风格值获取风格信息
 * @param {string} styleValue - 风格值
 * @returns {Object} 风格对象
 */
export function getStyleByValue(styleValue) {
  return STYLE_OPTIONS.find(s => s.value === styleValue) || STYLE_OPTIONS[0]
}

// 导出默认对象
export default {
  STYLE_OPTIONS,
  MOOD_OPTIONS,
  getHtmlTemplate,
  generateDiaryContent,
  generateDiaryContentStream,
  testAIConnection,
  getMoodByValue,
  getStyleByValue
}
