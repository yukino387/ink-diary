/**
 * AI 客户端模块 (ai-client.js)
 * 提供 AI 生成日记内容、流式输出、风格模板等功能
 */

import { getConfig } from './db.js'

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

export const DEFAULT_TAGS_PROMPT = `请为以下日记生成标签。

## 日记信息
- 标题：{{title}}
- 心情：{{moodLabel}}

## 日记内容
{{content}}

## 生成要求
1. 生成3-5个标签
2. 每个标签2-4个汉字
3. 不要带#号或其他符号
4. 标签应概括日记的主题、情感或关键词

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
    value: 'none', 
    label: '无风格', 
    description: '不预设风格，可在下方自定义',
    cssTheme: 'none'
  },
  { 
    value: 'classical', 
    label: '古风诗意', 
    description: '古典雅致，如诗如画',
    cssTheme: 'classical'
  },
  { 
    value: 'minimal', 
    label: '简约清新', 
    description: '简洁明快，留白之美',
    cssTheme: 'minimal'
  },
  { 
    value: 'literary', 
    label: '文艺复古', 
    description: '怀旧温馨，文艺气息',
    cssTheme: 'literary'
  },
  { 
    value: 'nature', 
    label: '自然田园', 
    description: '清新自然，田园风情',
    cssTheme: 'nature'
  },
  { 
    value: 'dreamy', 
    label: '梦幻唯美', 
    description: '唯美浪漫，如梦似幻',
    cssTheme: 'dreamy'
  },
  { 
    value: 'japanese', 
    label: '日系手账', 
    description: '日式简约，手账风格',
    cssTheme: 'japanese'
  },
  { 
    value: 'ink', 
    label: '水墨意境', 
    description: '水墨丹青，东方美学',
    cssTheme: 'ink'
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
  classical: `
    :root {
      --bg-color: #faf8f3;
      --text-color: #2c3e50;
      --accent-color: #8b4513;
      --secondary-color: #a0826d;
      --border-color: #d4c4b0;
    }
    body { background: linear-gradient(to bottom, #faf8f3, #f5f0e8); }
    h1 { color: var(--accent-color); border-bottom: 2px solid var(--border-color); padding-bottom: 0.5em; }
    .content { text-indent: 2em; line-height: 2; }
    .mood-badge { background: rgba(139, 69, 19, 0.1); border: 1px solid var(--border-color); }
  `,
  minimal: `
    :root {
      --bg-color: #ffffff;
      --text-color: #333333;
      --accent-color: #2c3e50;
      --secondary-color: #7f8c8d;
      --border-color: #ecf0f1;
    }
    body { background: #ffffff; }
    h1 { color: var(--accent-color); font-weight: 300; letter-spacing: 0.1em; }
    .content { line-height: 1.8; }
    .mood-badge { background: #f8f9fa; }
  `,
  literary: `
    :root {
      --bg-color: #f7f3e9;
      --text-color: #4a4a4a;
      --accent-color: #9c6644;
      --secondary-color: #b08968;
      --border-color: #e6d5c3;
    }
    body { background: #f7f3e9; }
    h1 { color: var(--accent-color); font-style: italic; }
    .content { line-height: 1.9; color: #5a5a5a; }
    .mood-badge { background: rgba(156, 102, 68, 0.1); }
  `,
  nature: `
    :root {
      --bg-color: #f1f8e9;
      --text-color: #33691e;
      --accent-color: #558b2f;
      --secondary-color: #7cb342;
      --border-color: #c5e1a5;
    }
    body { background: linear-gradient(135deg, #f1f8e9 0%, #e8f5e9 100%); }
    h1 { color: var(--accent-color); }
    .content { line-height: 1.85; }
    .mood-badge { background: rgba(85, 139, 47, 0.1); }
  `,
  dreamy: `
    :root {
      --bg-color: #f3e5f5;
      --text-color: #4a148c;
      --accent-color: #7b1fa2;
      --secondary-color: #9c27b0;
      --border-color: #e1bee7;
    }
    body { background: linear-gradient(180deg, #f3e5f5 0%, #e8eaf6 50%, #e3f2fd 100%); }
    h1 { color: var(--accent-color); text-shadow: 1px 1px 2px rgba(123, 31, 162, 0.1); }
    .content { line-height: 1.9; }
    .mood-badge { background: rgba(123, 31, 162, 0.1); }
  `,
  japanese: `
    :root {
      --bg-color: #fefefe;
      --text-color: #3d3d3d;
      --accent-color: #e74c3c;
      --secondary-color: #95a5a6;
      --border-color: #ecf0f1;
    }
    body { background: #fefefe; }
    h1 { color: var(--accent-color); font-weight: 400; }
    .content { line-height: 2; font-size: 0.95em; }
    .mood-badge { background: #fff5f5; border: 1px solid #ffe0e0; }
  `,
  ink: `
    :root {
      --bg-color: #f5f5f5;
      --text-color: #2c2c2c;
      --accent-color: #1a1a1a;
      --secondary-color: #666666;
      --border-color: #cccccc;
    }
    body { background: radial-gradient(ellipse at top, #f5f5f5, #e8e8e8); }
    h1 { color: var(--accent-color); font-weight: 500; letter-spacing: 0.15em; }
    .content { line-height: 2; text-indent: 2em; }
    .mood-badge { background: rgba(0, 0, 0, 0.05); border: 1px solid rgba(0, 0, 0, 0.1); }
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
 * 生成标签和摘要
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
  const summaryPromptTemplate = await getConfig('summaryPrompt', DEFAULT_SUMMARY_PROMPT)
  
  // 构建变量对象
  const variables = {
    title: title || '',
    moodLabel: moodLabel || '',
    content: content ? content.substring(0, 500) + (content.length > 500 ? '...' : '') : ''
  }
  
  // 分别生成标签和摘要
  try {
    // 生成标签
    const tagsPrompt = replaceTemplateVariables(tagsPromptTemplate, variables)
    const tagsResponse = await fetch(`${apiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: aiModel,
        messages: [
          { role: 'user', content: tagsPrompt }
        ],
        temperature: 0.5,
        max_tokens: 100
      })
    })
    
    let tags = []
    if (tagsResponse.ok) {
      const tagsData = await tagsResponse.json()
      let tagsText = tagsData.choices?.[0]?.message?.content || ''
      tagsText = tagsText.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim()
      try {
        const tagsResult = JSON.parse(tagsText)
        tags = tagsResult.tags || []
      } catch (e) {
        tags = generateLocalTags(params)
      }
    } else {
      tags = generateLocalTags(params)
    }
    
    // 生成摘要
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
    
    let summary = ''
    if (summaryResponse.ok) {
      const summaryData = await summaryResponse.json()
      let summaryText = summaryData.choices?.[0]?.message?.content || ''
      summaryText = summaryText.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim()
      try {
        const summaryResult = JSON.parse(summaryText)
        summary = summaryResult.summary || ''
      } catch (e) {
        summary = generateLocalSummary(params)
      }
    } else {
      summary = generateLocalSummary(params)
    }
    
    return { tags, summary }
  } catch (error) {
    console.error('[AI] 生成标签和摘要失败:', error)
    return generateLocalTagsAndSummary(params)
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
  
  const tagsPromptTemplate = await getConfig('tagsPrompt', DEFAULT_TAGS_PROMPT)
  
  const variables = {
    title: title || '',
    moodLabel: moodLabel || '',
    content: content ? content.substring(0, 500) + (content.length > 500 ? '...' : '') : ''
  }
  
  try {
    const tagsPrompt = replaceTemplateVariables(tagsPromptTemplate, variables)
    const tagsResponse = await fetch(`${apiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: aiModel,
        messages: [
          { role: 'user', content: tagsPrompt }
        ],
        temperature: 0.5,
        max_tokens: 100
      })
    })
    
    if (tagsResponse.ok) {
      const tagsData = await tagsResponse.json()
      let tagsText = tagsData.choices?.[0]?.message?.content || ''
      tagsText = tagsText.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim()
      try {
        const tagsResult = JSON.parse(tagsText)
        return tagsResult.tags || []
      } catch (e) {
        return generateLocalTags(params)
      }
    } else {
      return generateLocalTags(params)
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
