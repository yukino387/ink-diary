/**
 * AI 智能搜索模块 (ai-search.js) - 优化版
 * 提供基于自然语言的智能搜索功能，支持快速和深度两种模式
 * 
 * 快速模式：自然语言 → 意图分析 → 时间解析 → 标签匹配 → 生成关键词 → 本地搜索 → AI分析 → 结果
 * 深度模式：快速模式 → 自我验证 → 补充搜索（模型决定次数）→ 生成报告 → 结果
 */

import { getConfig } from './db.js'

// ========================================
// 默认提示词配置
// ========================================

/**
 * 步骤0: 查询意图分析与时间解析提示词
 * 分析用户查询，提取意图、时间、实体等信息
 */
export const DEFAULT_INTENT_ANALYSIS_PROMPT = `你是一位智能搜索助手。请深入分析用户的查询，提取所有关键信息。

## 当前时间上下文
当前时间：{{currentTime}}
当前日期：{{currentDate}}
当前星期：{{currentWeekday}}

## 任务
1. 识别用户的搜索意图类型：
   - search: 查找特定日记（如：找我去年的旅行日记）
   - statistics: 统计分析（如：我写了多少篇日记）
   - summary: 内容总结（如：总结一下我的2024年）
   - timeline: 时间线（如：我去年都做了什么）
   - answer: 直接回答（如：今天发生了什么）
   - compare: 对比分析（如：对比一下开心和难过时的日记）

2. 提取时间表达式并解析为具体日期范围：
   - 今天、昨天、前天
   - 上周、本周、下周
   - 上个月、本月、下个月
   - 去年、今年、前年
   - 最近N天/周/月
   - 具体日期（如：2024年1月1日）
   - 时间段（如：春节期间、暑假）

3. 提取关键实体：
   - 标签（如：旅行、工作、学习）
   - 心情（如：开心、难过、平静）
   - 地点（如：北京、云南）
   - 人物（如：和朋友、家人）
   - 事件（如：生日、考试、旅行）

4. 生成搜索策略建议

## 输入
用户查询：{{query}}

所有可用标签：
{{allTags}}

所有可用心情：
{{allMoods}}

## 输出格式（必须返回JSON）
{
  "intent": {
    "type": "search|statistics|summary|timeline|answer|compare",
    "confidence": 85,
    "description": "用户想要..."
  },
  "timeContext": {
    "hasTimeExpression": true,
    "expressions": ["今天", "昨天"],
    "parsedRange": {
      "start": "2024-01-15",
      "end": "2024-01-15",
      "description": "今天（2024年1月15日）"
    },
    "reasoning": "用户明确提到'今天'，对应日期是..."
  },
  "entities": {
    "tags": ["旅行", "工作"],
    "moods": ["开心"],
    "locations": ["云南"],
    "people": ["朋友"],
    "events": ["生日"]
  },
  "searchStrategy": {
    "shouldFilterByTag": true,
    "shouldFilterByMood": false,
    "shouldFilterByDate": true,
    "priority": "先按日期筛选，再分析内容",
    "keywords": ["关键词1", "关键词2"]
  }
}

只返回JSON，不要其他解释。`

/**
 * 步骤1: 标签智能匹配提示词
 * 基于所有可用标签，找出与查询最匹配的标签
 */
export const DEFAULT_TAG_MATCHING_PROMPT = `你是一位标签匹配专家。请分析用户查询与可用标签的匹配关系。

## 当前时间上下文
当前时间：{{currentTime}}
当前日期：{{currentDate}}

## 所有可用标签（按使用频率排序）
{{allTags}}

## 查询信息
用户查询：{{query}}
搜索意图：{{searchIntent}}
已识别实体：{{entities}}

## 任务
1. 找出与查询直接相关的标签（高优先级）
2. 找出可能间接相关的标签（中优先级）
3. 找出可以排除的标签（不相关）
4. 为每个匹配标签给出置信度评分（0-100%）

## 输出格式（必须返回JSON）
{
  "matchedTags": [
    { "tag": "旅行", "confidence": 95, "reason": "查询明确提到旅行" },
    { "tag": "云南", "confidence": 90, "reason": "查询提到云南" }
  ],
  "indirectTags": [
    { "tag": "摄影", "confidence": 60, "reason": "旅行时可能拍照" }
  ],
  "excludedTags": ["工作", "学习"],
  "searchStrategy": {
    "primaryTags": ["旅行", "云南"],
    "secondaryTags": ["摄影"],
    "shouldSearchAll": false,
    "reasoning": "优先搜索'旅行'和'云南'标签下的日记"
  }
}

只返回JSON，不要其他解释。`

/**
 * 步骤2: 关键词生成提示词（增强版）
 * 根据用户自然语言查询生成多组搜索关键词
 */
export const DEFAULT_KEYWORD_GENERATION_PROMPT = `你是一位智能搜索助手。请根据用户的自然语言查询，生成全面的搜索关键词。

## 当前时间上下文
当前时间：{{currentTime}}
当前日期：{{currentDate}}
当前星期：{{currentWeekday}}

## 已应用的筛选条件
{{appliedFilters}}

## 查询分析
用户查询：{{query}}
搜索意图：{{searchIntent}}
时间上下文：{{timeContext}}
已识别实体：{{entities}}

## 任务
1. 理解用户的真实搜索意图
2. 生成核心关键词（3-5个）
3. 为每个核心关键词生成同义词、近义词
4. 考虑不同表达方式（口语化vs书面语）
5. 生成可能的相关概念词
6. 特别注意时间词的精确含义

## 输出格式（必须返回JSON）
{
  "primaryKeywords": ["核心词1", "核心词2", "核心词3"],
  "expandedKeywords": {
    "核心词1": ["同义词1", "近义词1", "相关词1"],
    "核心词2": ["同义词2", "近义词2"]
  },
  "alternativeExpressions": ["表达方式1", "表达方式2"],
  "searchIntent": "用户的搜索意图简述",
  "timeContext": "时间上下文理解",
  "topicContext": "主题上下文"
}

只返回JSON，不要其他解释。`

/**
 * 步骤3: 快速搜索分析提示词（增强版）
 * 分析本地搜索结果的日记简述，给出相关度评分
 */
export const DEFAULT_QUICK_SEARCH_ANALYSIS_PROMPT = `你是一位智能日记分析助手。请分析以下日记与用户查询的相关度。

## 当前时间上下文
当前时间：{{currentTime}}
当前日期：{{currentDate}}
当前星期：{{currentWeekday}}

## 已应用的筛选条件
{{appliedFilters}}

## 查询信息
用户查询：{{query}}
搜索意图：{{searchIntent}}
时间上下文：{{timeContext}}
主题上下文：{{topicContext}}

## 任务
1. 分析每篇日记的标题、简述、标签与用户查询的相关度
2. 特别注意时间匹配程度（如用户问"今天"，日记是否是今天的）
3. 给出0-100%的相关度评分
4. 提供简短的判断理由
5. 识别匹配的方面（标题、标签、时间、内容等）

## 日记列表（JSON格式）
{{diaries}}

每篇日记包含：id, title, summary, tags, mood, createTime

## 输出格式（必须返回JSON）
{
  "results": [
    {
      "id": "日记ID",
      "relevance": 85,
      "reason": "与查询中的'xxx'相关，涉及...",
      "matchedAspects": ["标题匹配", "标签匹配", "时间匹配"],
      "timeMatch": { "score": 100, "reason": "日记日期正好是今天" }
    }
  ],
  "summary": {
    "totalAnalyzed": 10,
    "highRelevanceCount": 3,
    "mediumRelevanceCount": 4,
    "lowRelevanceCount": 3
  }
}

相关度评分标准：
- 90-100%：高度相关，完全匹配查询意图
- 70-89%：比较相关，部分匹配查询意图
- 50-69%：有一定关联，可能包含相关信息
- 0-49%：不相关

只返回JSON，不要其他解释。`

/**
 * 步骤4: 自我验证与补充搜索决策提示词
 * 判断搜索结果是否完整，是否需要补充搜索
 */
export const DEFAULT_SELF_VALIDATION_PROMPT = `你是一位搜索结果验证专家。请评估当前搜索结果是否完整准确。

## 当前时间上下文
当前时间：{{currentTime}}
当前日期：{{currentDate}}

## 查询信息
用户查询：{{query}}
搜索意图：{{searchIntent}}

## 当前搜索结果
找到日记数：{{foundCount}}
高度相关数：{{highRelevanceCount}}

结果详情：
{{results}}

## 任务
1. 评估当前结果的完整性（是否有明显遗漏）
2. 评估结果的相关度分布是否合理
3. 判断是否需要补充搜索
4. 如果需要补充，给出具体建议

## 输出格式（必须返回JSON）
{
  "validation": {
    "isComplete": true/false,
    "confidence": 85,
    "completenessReason": "结果看起来完整/不完整，因为..."
  },
  "analysis": {
    "strengths": ["优点1", "优点2"],
    "weaknesses": ["不足1", "不足2"],
    "potentialGaps": ["可能遗漏1", "可能遗漏2"]
  },
  "supplementDecision": {
    "shouldSupplement": true/false,
    "reason": "需要/不需要补充搜索的原因",
    "suggestions": [
      { "type": "extend_keywords", "description": "扩展关键词搜索" },
      { "type": "relax_time", "description": "放宽时间范围" },
      { "type": "check_tags", "description": "检查其他标签" }
    ]
  }
}

只返回JSON，不要其他解释。`

/**
 * 步骤5: 正文内容分析提示词（深度搜索）
 * 分析日记正文内容，提取关键信息
 */
export const DEFAULT_CONTENT_ANALYSIS_PROMPT = `你是一位深度内容分析专家。请分析日记正文内容，提取与用户查询相关的信息。

## 当前时间上下文
当前时间：{{currentTime}}
当前日期：{{currentDate}}
当前星期：{{currentWeekday}}

## 查询信息
用户查询：{{query}}
搜索意图：{{searchIntent}}

## 任务
1. 仔细阅读日记正文内容
2. 提取与用户查询相关的关键信息
3. 更新相关度评分（基于正文内容）
4. 生成内容摘要和相关片段
5. 识别日记中提到的时间、地点、人物、事件

## 重要提示
- 分析的是纯文本内容，不是HTML代码
- 如果正文为空或太短，基于已有信息评分
- 关注细节信息，如具体事件、时间、地点、感受等
- 注意识别日记中的日期时间描述

## 输入
需要分析的日记（JSON格式）：
{{contents}}

每篇日记包含：id, title, content（纯文本，非HTML）

## 输出格式（必须返回JSON）
{
  "contentAnalysis": [
    {
      "id": "日记ID",
      "updatedRelevance": 92,
      "keyPoints": ["关键点1", "关键点2", "关键点3"],
      "excerpt": "相关片段引用（100字以内）",
      "details": "详细分析说明",
      "entities": {
        "people": ["提到的人名"],
        "locations": ["地点"],
        "events": ["事件"],
        "time": ["时间描述"]
      }
    }
  ],
  "overallFindings": "整体发现总结"
}

相关度评分标准：
- 90-100%：正文包含大量相关信息，细节丰富
- 70-89%：正文包含较多相关信息
- 50-69%：正文包含一些相关信息
- 0-49%：正文与查询关联不大

只返回JSON，不要其他解释。`

/**
 * 步骤6: 意图结果处理提示词
 * 根据搜索意图类型，生成相应的输出
 */
export const DEFAULT_INTENT_PROCESSING_PROMPT = `你是一位结果处理专家。请根据搜索意图，处理搜索结果并生成适当的输出。

## 当前时间上下文
当前时间：{{currentTime}}
当前日期：{{currentDate}}

## 查询信息
用户查询：{{query}}
搜索意图：{{intentType}}

## 搜索结果
找到日记数：{{foundCount}}
高度相关数：{{highRelevanceCount}}

日记列表：
{{results}}

## 任务
根据意图类型生成相应的输出：

如果是 "search" 意图：
- 返回最相关的日记列表
- 为每篇日记提供简要说明

如果是 "statistics" 意图：
- 生成统计分析报告
- 包括数量、分布、趋势等

如果是 "summary" 意图：
- 生成内容总结
- 提取关键主题和要点

如果是 "timeline" 意图：
- 按时间顺序组织结果
- 生成时间线描述

如果是 "answer" 意图：
- 直接回答用户问题
- 如"今天发生了什么"，总结今天日记的内容

如果是 "compare" 意图：
- 对比不同类别日记的特点
- 生成对比分析

## 输出格式（必须返回JSON）
{
  "processedResults": {
    "type": "{{intentType}}",
    "output": "根据意图类型生成的输出内容",
    "highlights": ["要点1", "要点2"],
    "recommendations": ["建议1", "建议2"]
  },
  "finalResults": [
    {
      "id": "日记ID",
      "relevance": 95,
      "finalReason": "综合判断理由",
      "keyPoints": ["关键信息1", "关键信息2"],
      "excerpt": "相关片段"
    }
  ]
}

只返回JSON，不要其他解释。`

/**
 * 步骤7: 报告生成提示词（深度搜索）
 * 汇总所有分析结果，生成详细报告
 */
export const DEFAULT_REPORT_GENERATION_PROMPT = `你是一位搜索报告生成专家。汇总所有分析结果，生成一份详细的搜索报告。

## 当前时间上下文
当前时间：{{currentTime}}
当前日期：{{currentDate}}
当前星期：{{currentWeekday}}

## 查询信息
用户查询：{{query}}
搜索意图：{{intentType}}

## 搜索结果汇总
快速搜索结果：{{quickResults}}
正文分析结果：{{contentAnalysis}}
意图处理结果：{{intentResults}}

## 任务
1. 汇总所有搜索结果
2. 为每篇相关日记给出最终相关度(0-100%)
3. 生成详细报告，包括：
   - 搜索概况
   - 主要发现
   - 相关日记列表（按相关度排序）
   - 关键信息摘要
   - 时间线（如果适用）
   - 统计数据（如果适用）

## 输出格式（必须返回JSON）
{
  "finalResults": [
    {
      "id": "日记ID",
      "relevance": 95,
      "finalReason": "综合判断理由",
      "keyPoints": ["关键信息1", "关键信息2"],
      "excerpt": "相关片段"
    }
  ],
  "report": {
    "overview": "搜索概况：根据您的查询'xxx'，共找到X篇相关日记...",
    "keyFindings": ["主要发现1", "主要发现2"],
    "timeline": ["时间线事件1", "时间线事件2"],
    "statistics": { "total": 10, "byMood": {...}, "byMonth": {...} },
    "highRelevanceDiaries": ["高度相关日记标题列表"],
    "summary": "整体内容摘要"
  },
  "statistics": {
    "totalFound": 10,
    "highRelevance": 3,
    "mediumRelevance": 4,
    "lowRelevance": 3,
    "contentsAnalyzed": 5
  }
}

只返回JSON，不要其他解释。`

// 保留旧的提示词以兼容现有配置
export const DEFAULT_TOOL_SELECTION_PROMPT = DEFAULT_INTENT_ANALYSIS_PROMPT
export const DEFAULT_KEYWORD_EXTENSION_PROMPT = DEFAULT_SELF_VALIDATION_PROMPT
export const DEFAULT_CONTENT_ANALYSIS_DECISION_PROMPT = DEFAULT_SELF_VALIDATION_PROMPT
export const DEFAULT_QUICK_SEARCH_PROMPT = DEFAULT_QUICK_SEARCH_ANALYSIS_PROMPT
export const DEFAULT_DEEP_SEARCH_PROMPT = DEFAULT_CONTENT_ANALYSIS_PROMPT

// ========================================
// 查询意图类型定义
// ========================================

export const SEARCH_INTENTS = {
  SEARCH: 'search',           // 查找特定日记
  STATISTICS: 'statistics',   // 统计分析
  SUMMARY: 'summary',         // 内容总结
  TIMELINE: 'timeline',       // 时间线
  ANSWER: 'answer',           // 直接回答
  COMPARE: 'compare'          // 对比分析
}

// ========================================
// 状态管理
// ========================================

class SearchStatusManager {
  constructor(onStatusUpdate) {
    this.onStatusUpdate = onStatusUpdate
    this.stage = 'idle'
    this.progress = 0
    this.stats = {}
    this.currentStep = 0
    this.totalSteps = 0
    this.stepName = ''
    this.stepDescription = ''
    this.stepHistory = []
    this.startTime = Date.now()
  }

  update(stage, message, progress, stats = {}, stepInfo = {}) {
    this.stage = stage
    this.progress = progress
    this.stats = { ...this.stats, ...stats }
    
    if (stepInfo.currentStep) this.currentStep = stepInfo.currentStep
    if (stepInfo.totalSteps) this.totalSteps = stepInfo.totalSteps
    if (stepInfo.stepName) this.stepName = stepInfo.stepName
    if (stepInfo.stepDescription) this.stepDescription = stepInfo.stepDescription
    
    const stepData = {
      stage,
      message,
      progress,
      stats: { ...this.stats },
      currentStep: this.currentStep,
      totalSteps: this.totalSteps,
      stepName: this.stepName,
      stepDescription: this.stepDescription,
      timestamp: Date.now(),
      elapsedTime: Date.now() - this.startTime
    }
    
    this.stepHistory.push(stepData)
    
    if (this.onStatusUpdate) {
      this.onStatusUpdate(stepData, this.stepHistory)
    }
  }

  reset() {
    this.stage = 'idle'
    this.progress = 0
    this.stats = {}
    this.currentStep = 0
    this.totalSteps = 0
    this.stepName = ''
    this.stepDescription = ''
    this.stepHistory = []
    this.startTime = Date.now()
  }
}

// ========================================
// 工具函数
// ========================================

/**
 * 调用 AI API
 */
async function callAI(prompt, temperature = 0.3) {
  const apiBaseUrl = await getConfig('apiBaseUrl', '')
  const apiKey = await getConfig('apiKey', '')
  const aiModel = await getConfig('aiModel', 'gpt-4o-mini')
  
  if (!apiBaseUrl || !apiKey) {
    throw new Error('请先在设置中配置 AI API')
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
        { role: 'user', content: prompt }
      ],
      temperature,
      max_tokens: 4000
    })
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error?.message || `API 请求失败: ${response.status}`)
  }

  const data = await response.json()
  let content = data.choices?.[0]?.message?.content || ''
  
  // 清理 markdown 代码块
  content = content.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim()
  
  return content
}

/**
 * 解析 AI 返回的 JSON
 */
function parseAIResponse(content) {
  try {
    return JSON.parse(content)
  } catch (e) {
    // 尝试提取 JSON 部分
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    throw new Error('无法解析 AI 响应')
  }
}

/**
 * 获取当前时间上下文
 */
function getCurrentTimeContext() {
  const now = new Date()
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hour = String(now.getHours()).padStart(2, '0')
  const minute = String(now.getMinutes()).padStart(2, '0')
  
  return {
    currentTime: `${hour}:${minute}`,
    currentDate: `${year}年${month}月${day}日`,
    currentWeekday: weekdays[now.getDay()],
    currentYear: year,
    currentMonth: month,
    currentDay: day
  }
}

/**
 * 替换提示词中的时间变量
 */
function replaceTimeVariables(prompt) {
  const timeContext = getCurrentTimeContext()
  return prompt
    .replace(/\{\{currentTime\}\}/g, timeContext.currentTime)
    .replace(/\{\{currentDate\}\}/g, timeContext.currentDate)
    .replace(/\{\{currentWeekday\}\}/g, timeContext.currentWeekday)
    .replace(/\{\{currentYear\}\}/g, timeContext.currentYear)
    .replace(/\{\{currentMonth\}\}/g, timeContext.currentMonth)
    .replace(/\{\{currentDay\}\}/g, timeContext.currentDay)
}

/**
 * 增强的时间表达式解析
 */
function parseTimeExpression(timeExpression) {
  if (!timeExpression) return null
  
  const expr = timeExpression.toLowerCase()
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  // 辅助函数：格式化日期
  const formatDate = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }
  
  // ===== 绝对时间 =====
  
  // 今天
  if (expr.includes('今天') || expr.includes('今日')) {
    const date = formatDate(today)
    return { start: date, end: date, description: '今天' }
  }
  
  // 昨天
  if (expr.includes('昨天') || expr.includes('昨日')) {
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const date = formatDate(yesterday)
    return { start: date, end: date, description: '昨天' }
  }
  
  // 前天
  if (expr.includes('前天')) {
    const dayBefore = new Date(today)
    dayBefore.setDate(dayBefore.getDate() - 2)
    const date = formatDate(dayBefore)
    return { start: date, end: date, description: '前天' }
  }
  
  // 明天
  if (expr.includes('明天') || expr.includes('明日')) {
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const date = formatDate(tomorrow)
    return { start: date, end: date, description: '明天' }
  }
  
  // ===== 周 =====
  
  // 本周
  if (expr.includes('本周') || expr.includes('这周') || expr.includes('这个星期') || expr.includes('本星期')) {
    const weekStart = new Date(today)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    return {
      start: formatDate(weekStart),
      end: formatDate(weekEnd),
      description: '本周'
    }
  }
  
  // 上周
  if (expr.includes('上周') || expr.includes('上星期') || expr.includes('上个星期')) {
    const lastWeekStart = new Date(today)
    lastWeekStart.setDate(lastWeekStart.getDate() - lastWeekStart.getDay() - 7)
    const lastWeekEnd = new Date(lastWeekStart)
    lastWeekEnd.setDate(lastWeekEnd.getDate() + 6)
    return {
      start: formatDate(lastWeekStart),
      end: formatDate(lastWeekEnd),
      description: '上周'
    }
  }
  
  // 下周
  if (expr.includes('下周') || expr.includes('下星期') || expr.includes('下个星期')) {
    const nextWeekStart = new Date(today)
    nextWeekStart.setDate(nextWeekStart.getDate() - nextWeekStart.getDay() + 7)
    const nextWeekEnd = new Date(nextWeekStart)
    nextWeekEnd.setDate(nextWeekEnd.getDate() + 6)
    return {
      start: formatDate(nextWeekStart),
      end: formatDate(nextWeekEnd),
      description: '下周'
    }
  }
  
  // ===== 月份 =====
  
  // 本月
  if (expr.includes('本月') || expr.includes('这个月')) {
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    return {
      start: formatDate(monthStart),
      end: formatDate(monthEnd),
      description: '本月'
    }
  }
  
  // 上个月
  if (expr.includes('上个月') || expr.includes('上月')) {
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0)
    return {
      start: formatDate(lastMonthStart),
      end: formatDate(lastMonthEnd),
      description: '上个月'
    }
  }
  
  // 下个月
  if (expr.includes('下个月') || expr.includes('下月')) {
    const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1)
    const nextMonthEnd = new Date(today.getFullYear(), today.getMonth() + 2, 0)
    return {
      start: formatDate(nextMonthStart),
      end: formatDate(nextMonthEnd),
      description: '下个月'
    }
  }
  
  // 具体月份（如：1月、2月）
  const monthMatch = expr.match(/(\d{1,2})月/)
  if (monthMatch) {
    const month = parseInt(monthMatch[1]) - 1
    if (month >= 0 && month <= 11) {
      const monthStart = new Date(today.getFullYear(), month, 1)
      const monthEnd = new Date(today.getFullYear(), month + 1, 0)
      return {
        start: formatDate(monthStart),
        end: formatDate(monthEnd),
        description: `${month + 1}月`
      }
    }
  }
  
  // ===== 年份 =====
  
  // 今年
  if (expr.includes('今年') || expr.includes('这一年')) {
    const yearStart = new Date(today.getFullYear(), 0, 1)
    const yearEnd = new Date(today.getFullYear(), 11, 31)
    return {
      start: formatDate(yearStart),
      end: formatDate(yearEnd),
      description: '今年'
    }
  }
  
  // 去年
  if (expr.includes('去年') || expr.includes('上一年')) {
    const lastYearStart = new Date(today.getFullYear() - 1, 0, 1)
    const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31)
    return {
      start: formatDate(lastYearStart),
      end: formatDate(lastYearEnd),
      description: '去年'
    }
  }
  
  // 前年
  if (expr.includes('前年')) {
    const yearBeforeLastStart = new Date(today.getFullYear() - 2, 0, 1)
    const yearBeforeLastEnd = new Date(today.getFullYear() - 2, 11, 31)
    return {
      start: formatDate(yearBeforeLastStart),
      end: formatDate(yearBeforeLastEnd),
      description: '前年'
    }
  }
  
  // 具体年份（如：2024年）
  const yearMatch = expr.match(/(\d{4})年/)
  if (yearMatch) {
    const year = parseInt(yearMatch[1])
    const yearStart = new Date(year, 0, 1)
    const yearEnd = new Date(year, 11, 31)
    return {
      start: formatDate(yearStart),
      end: formatDate(yearEnd),
      description: `${year}年`
    }
  }
  
  // ===== 相对时间 =====
  
  // 最近N天
  const recentDaysMatch = expr.match(/最近(\d+)天/)
  if (recentDaysMatch) {
    const days = parseInt(recentDaysMatch[1])
    const start = new Date(today)
    start.setDate(start.getDate() - days + 1)
    return {
      start: formatDate(start),
      end: formatDate(today),
      description: `最近${days}天`
    }
  }
  
  // 最近一周
  if (expr.includes('最近一周') || expr.includes('近一周') || expr.includes('这一周')) {
    const start = new Date(today)
    start.setDate(start.getDate() - 6)
    return {
      start: formatDate(start),
      end: formatDate(today),
      description: '最近一周'
    }
  }
  
  // 最近一个月
  if (expr.includes('最近一个月') || expr.includes('近一个月') || expr.includes('这一个月')) {
    const start = new Date(today)
    start.setMonth(start.getMonth() - 1)
    start.setDate(start.getDate() + 1)
    return {
      start: formatDate(start),
      end: formatDate(today),
      description: '最近一个月'
    }
  }
  
  // 最近三个月
  if (expr.includes('最近三个月') || expr.includes('近三个月') || expr.includes('这三个月')) {
    const start = new Date(today)
    start.setMonth(start.getMonth() - 3)
    start.setDate(start.getDate() + 1)
    return {
      start: formatDate(start),
      end: formatDate(today),
      description: '最近三个月'
    }
  }
  
  // ===== 特殊时间 =====
  
  // 周末
  if (expr.includes('周末') || expr.includes('星期六') || expr.includes('星期日') || expr.includes('周六') || expr.includes('周日')) {
    // 返回最近的一个周末（上周六到本周日）
    const saturday = new Date(today)
    saturday.setDate(saturday.getDate() - saturday.getDay() - 1)
    const sunday = new Date(saturday)
    sunday.setDate(sunday.getDate() + 1)
    return {
      start: formatDate(saturday),
      end: formatDate(sunday),
      description: '周末'
    }
  }
  
  // 工作日
  if (expr.includes('工作日') || expr.includes('周一到周五')) {
    // 返回本周工作日
    const monday = new Date(today)
    monday.setDate(monday.getDate() - monday.getDay() + 1)
    const friday = new Date(monday)
    friday.setDate(friday.getDate() + 4)
    return {
      start: formatDate(monday),
      end: formatDate(friday),
      description: '工作日'
    }
  }
  
  return null
}

/**
 * 筛选工具函数：按标签筛选
 */
function filterByTag(diaries, tag) {
  if (!tag) return diaries
  return diaries.filter(diary => 
    diary.tags && diary.tags.some(t => t.toLowerCase() === tag.toLowerCase())
  )
}

/**
 * 筛选工具函数：按多个标签筛选（OR关系）
 */
function filterByTags(diaries, tags) {
  if (!tags || tags.length === 0) return diaries
  return diaries.filter(diary => 
    diary.tags && diary.tags.some(t => tags.includes(t))
  )
}

/**
 * 筛选工具函数：按心情筛选
 */
function filterByMood(diaries, mood) {
  if (!mood) return diaries
  return diaries.filter(diary => 
    diary.mood && diary.mood.toLowerCase() === mood.toLowerCase()
  )
}

/**
 * 筛选工具函数：按日期范围筛选
 * 使用本地日期字符串比较，避免时区问题
 */
function filterByDateRange(diaries, range) {
  if (!range || (!range.start && !range.end)) return diaries
  
  return diaries.filter(diary => {
    // 将日记时间转换为本地日期字符串（YYYY-MM-DD），避免UTC时差
    const diaryDateObj = new Date(diary.createTime)
    const diaryLocalDate = `${diaryDateObj.getFullYear()}-${String(diaryDateObj.getMonth() + 1).padStart(2, '0')}-${String(diaryDateObj.getDate()).padStart(2, '0')}`
    
    if (range.start && diaryLocalDate < range.start) return false
    if (range.end && diaryLocalDate > range.end) return false
    return true
  })
}

/**
 * 准备日记数据（简化版，用于发送给 AI）
 */
function prepareDiariesData(diaries) {
  return diaries.map(d => ({
    id: d.id,
    title: d.title,
    summary: d.summary || '',
    tags: d.tags || [],
    mood: d.mood || '',
    createTime: d.createTime
  }))
}

/**
 * 准备正文数据（用于深度搜索）
 */
function prepareContentsData(diaries) {
  return diaries.map(d => {
    // 优先使用 originalContent，其次从 htmlContent 提取纯文本
    let content = d.originalContent || ''
    if (!content && d.htmlContent) {
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = d.htmlContent
      content = tempDiv.textContent || tempDiv.innerText || ''
    }
    
    return {
      id: d.id,
      title: d.title,
      content: content.substring(0, 2000) // 限制长度，避免超出 token
    }
  })
}

/**
 * 本地搜索函数 - 使用多个关键词搜索（分层搜索）
 */
async function localSearchWithKeywords(diaries, keywords, options = {}) {
  const { 
    searchInTitle = true,
    searchInContent = true,
    searchInSummary = true,
    searchInTags = true,
    searchInMood = true
  } = options
  
  const results = new Map()
  
  for (const keyword of keywords) {
    const searchTerm = keyword.toLowerCase().trim()
    if (!searchTerm) continue
    
    diaries.forEach(diary => {
      let matched = false
      const matchedFields = []
      
      if (searchInTitle && diary.title?.toLowerCase().includes(searchTerm)) {
        matched = true
        matchedFields.push('title')
      }
      if (searchInContent && diary.htmlContent?.toLowerCase().includes(searchTerm)) {
        matched = true
        matchedFields.push('content')
      }
      if (searchInSummary && diary.summary?.toLowerCase().includes(searchTerm)) {
        matched = true
        matchedFields.push('summary')
      }
      if (searchInTags && diary.tags?.some(tag => tag.toLowerCase().includes(searchTerm))) {
        matched = true
        matchedFields.push('tags')
      }
      if (searchInMood && diary.mood?.toLowerCase().includes(searchTerm)) {
        matched = true
        matchedFields.push('mood')
      }
      
      if (matched) {
        if (!results.has(diary.id)) {
          results.set(diary.id, { ...diary, matchedKeywords: [keyword], matchedFields: [...matchedFields] })
        } else {
          const existing = results.get(diary.id)
          if (!existing.matchedKeywords.includes(keyword)) {
            existing.matchedKeywords.push(keyword)
          }
          existing.matchedFields = [...new Set([...existing.matchedFields, ...matchedFields])]
        }
      }
    })
  }
  
  return Array.from(results.values())
}

/**
 * 分层本地搜索
 * 第1层：标签匹配（0次API）
 * 第2层：标题+摘要匹配（0次API）
 * 第3层：全文匹配（0次API）
 */
async function hierarchicalLocalSearch(diaries, keywords, matchedTags = []) {
  const results = {
    byTags: [],
    byTitleSummary: [],
    byFullContent: [],
    all: new Map()
  }
  
  // 第1层：标签匹配
  if (matchedTags.length > 0) {
    const tagResults = filterByTags(diaries, matchedTags.map(t => t.tag))
    tagResults.forEach(diary => {
      results.all.set(diary.id, { ...diary, matchLayer: 'tag', matchScore: 100 })
    })
    results.byTags = tagResults
  }
  
  // 第2层：标题+摘要匹配
  const titleSummaryResults = await localSearchWithKeywords(
    diaries, 
    keywords, 
    { searchInTitle: true, searchInSummary: true, searchInContent: false, searchInTags: false, searchInMood: false }
  )
  titleSummaryResults.forEach(diary => {
    if (!results.all.has(diary.id)) {
      results.all.set(diary.id, { ...diary, matchLayer: 'title_summary', matchScore: 80 })
    }
  })
  results.byTitleSummary = titleSummaryResults
  
  // 第3层：全文匹配
  const fullContentResults = await localSearchWithKeywords(diaries, keywords)
  fullContentResults.forEach(diary => {
    if (!results.all.has(diary.id)) {
      results.all.set(diary.id, { ...diary, matchLayer: 'full_content', matchScore: 60 })
    }
  })
  results.byFullContent = fullContentResults
  
  return {
    results: Array.from(results.all.values()),
    layers: {
      tag: results.byTags,
      titleSummary: results.byTitleSummary,
      fullContent: results.byFullContent
    }
  }
}

// ========================================
// 快速搜索 - 动态API调用（3-5次）
// ========================================

/**
 * 快速搜索（优化版）
 * 步骤0: 意图分析 → 步骤1: 标签匹配 → 步骤2: 生成关键词 → 步骤3: 分层本地搜索 → 步骤4: AI分析 → 可选步骤5: 自我验证
 * @param {string} query - 用户查询
 * @param {Array} diaries - 所有日记
 * @param {Object} allTags - 所有可用标签
 * @param {Object} allMoods - 所有可用心情
 * @param {Function} onStatusUpdate - 状态更新回调
 * @returns {Promise<Object>}
 */
export async function quickSearch(query, diaries, allTags = [], allMoods = [], onStatusUpdate) {
  const status = new SearchStatusManager(onStatusUpdate)
  let apiCallCount = 0
  const maxApiCalls = 5
  
  try {
    // ========== 步骤0: 意图分析与时间解析 ==========
    status.update(
      'analyzing_intent',
      'AI正在分析查询意图和时间信息...',
      10,
      {},
      { currentStep: 1, totalSteps: 5, stepName: '意图分析', stepDescription: '识别搜索意图、解析时间表达式' }
    )
    
    const intentPromptTemplate = await getConfig('intentAnalysisPrompt', DEFAULT_INTENT_ANALYSIS_PROMPT)
    const intentPrompt = replaceTimeVariables(intentPromptTemplate)
      .replace('{{query}}', query)
      .replace('{{allTags}}', JSON.stringify(allTags, null, 2))
      .replace('{{allMoods}}', JSON.stringify(allMoods, null, 2))
    
    const intentResponse = await callAI(intentPrompt, 0.3)
    apiCallCount++
    const intentResult = parseAIResponse(intentResponse)
    
    // 解析时间表达式（本地解析作为备用）
    let timeRange = null
    if (intentResult.timeContext?.hasTimeExpression && intentResult.timeContext?.parsedRange) {
      timeRange = intentResult.timeContext.parsedRange
    } else {
      // 尝试本地解析
      timeRange = parseTimeExpression(query)
    }
    
    status.update(
      'analyzing_intent',
      `意图：${intentResult.intent?.description || '搜索日记'} ${timeRange ? `| 时间：${timeRange.description || timeRange.start}` : ''}`,
      15,
      { intent: intentResult.intent, timeRange },
      { currentStep: 1, totalSteps: 5, stepName: '意图分析', stepDescription: `意图：${intentResult.intent?.type || 'search'}` }
    )
    
    // ========== 步骤1: 标签智能匹配 ==========
    let filteredDiaries = [...diaries]
    let matchedTags = []
    
    if (allTags.length > 0 && apiCallCount < maxApiCalls) {
      status.update(
        'matching_tags',
        'AI正在分析标签匹配关系...',
        20,
        {},
        { currentStep: 2, totalSteps: 5, stepName: '标签匹配', stepDescription: '找出与查询相关的标签' }
      )
      
      const tagPromptTemplate = await getConfig('tagMatchingPrompt', DEFAULT_TAG_MATCHING_PROMPT)
      const tagPrompt = replaceTimeVariables(tagPromptTemplate)
        .replace('{{query}}', query)
        .replace('{{allTags}}', JSON.stringify(allTags, null, 2))
        .replace('{{searchIntent}}', intentResult.intent?.description || '')
        .replace('{{entities}}', JSON.stringify(intentResult.entities || {}))
      
      const tagResponse = await callAI(tagPrompt, 0.3)
      apiCallCount++
      const tagResult = parseAIResponse(tagResponse)
      
      matchedTags = tagResult.matchedTags || []
      
      // 应用标签筛选
      if (matchedTags.length > 0) {
        const primaryTags = matchedTags.filter(t => t.confidence >= 70).map(t => t.tag)
        if (primaryTags.length > 0) {
          filteredDiaries = filterByTags(diaries, primaryTags)
        }
      }
      
      status.update(
        'matching_tags',
        `找到 ${matchedTags.length} 个相关标签，筛选后剩余 ${filteredDiaries.length} 篇日记`,
        25,
        { matchedTags: matchedTags.map(t => t.tag), filteredCount: filteredDiaries.length },
        { currentStep: 2, totalSteps: 5, stepName: '标签匹配', stepDescription: `匹配标签: ${matchedTags.slice(0, 3).map(t => t.tag).join(', ')}` }
      )
    }
    
    // 应用时间筛选
    if (timeRange) {
      filteredDiaries = filterByDateRange(filteredDiaries, timeRange)
    }
    
    // 准备筛选器文本（在if块外定义，确保两种分支都能访问）
    const appliedFiltersText = timeRange 
      ? `时间范围: ${timeRange.start} 至 ${timeRange.end}`
      : '无'
    
    // ========== 步骤2: 生成关键词 ==========
    if (apiCallCount < maxApiCalls) {
      status.update(
        'generating_keywords',
        'AI正在生成搜索关键词...',
        30,
        {},
        { currentStep: 3, totalSteps: 5, stepName: '生成关键词', stepDescription: '分析查询意图，生成核心关键词' }
      )
      
      const keywordPromptTemplate = await getConfig('keywordGenerationPrompt', DEFAULT_KEYWORD_GENERATION_PROMPT)
      
      const keywordPrompt = replaceTimeVariables(keywordPromptTemplate)
        .replace('{{query}}', query)
        .replace('{{searchIntent}}', JSON.stringify(intentResult.intent || {}))
        .replace('{{timeContext}}', JSON.stringify(intentResult.timeContext || {}))
        .replace('{{entities}}', JSON.stringify(intentResult.entities || {}))
        .replace('{{appliedFilters}}', appliedFiltersText)
      
      const keywordResponse = await callAI(keywordPrompt, 0.3)
      apiCallCount++
      var keywordResult = parseAIResponse(keywordResponse)
    } else {
      // 如果API调用次数用尽，使用简单的关键词提取
      var keywordResult = {
        primaryKeywords: query.split(/\s+/).filter(w => w.length > 1),
        expandedKeywords: {},
        searchIntent: intentResult.intent?.description || '',
        timeContext: '',
        topicContext: ''
      }
    }
    
    const allKeywords = [
      ...(keywordResult.primaryKeywords || []),
      ...Object.values(keywordResult.expandedKeywords || {}).flat()
    ]
    
    status.update(
      'generating_keywords',
      `已生成 ${allKeywords.length} 个搜索关键词`,
      40,
      { generatedKeywords: allKeywords },
      { currentStep: 3, totalSteps: 5, stepName: '生成关键词', stepDescription: `关键词: ${allKeywords.slice(0, 5).join(', ')}` }
    )
    
    // ========== 步骤3: 分层本地搜索 ==========
    status.update(
      'local_searching',
      `正在搜索 ${filteredDiaries.length} 篇日记...`,
      50,
      {},
      { currentStep: 4, totalSteps: 5, stepName: '本地搜索', stepDescription: '分层搜索：标签→标题→全文' }
    )
    
    const searchResult = await hierarchicalLocalSearch(filteredDiaries, allKeywords, matchedTags)
    const searchResults = searchResult.results
    
    status.update(
      'local_searching',
      `找到 ${searchResults.length} 篇可能相关的日记（标签层：${searchResult.layers.tag.length}，标题层：${searchResult.layers.titleSummary.length}，全文层：${searchResult.layers.fullContent.length}）`,
      60,
      { 
        localSearchCount: searchResults.length,
        byTag: searchResult.layers.tag.length,
        byTitle: searchResult.layers.titleSummary.length,
        byContent: searchResult.layers.fullContent.length
      },
      { currentStep: 4, totalSteps: 5, stepName: '本地搜索', stepDescription: `找到 ${searchResults.length} 篇相关日记` }
    )
    
    // 如果没有找到任何日记，直接返回
    if (searchResults.length === 0) {
      status.update('completed', '搜索完成，未找到相关日记', 100, { foundCount: 0 })
      return {
        results: [],
        keywords: allKeywords,
        intent: intentResult.intent,
        timeRange,
        matchedTags,
        process: { mode: 'quick', totalApiCalls: apiCallCount }
      }
    }
    
    // ========== 步骤4: AI分析相关度 ==========
    status.update(
      'analyzing',
      `正在分析 ${searchResults.length} 篇日记的相关度...`,
      75,
      { analyzingCount: searchResults.length },
      { currentStep: 5, totalSteps: 5, stepName: 'AI分析', stepDescription: '评估相关度，识别时间匹配' }
    )
    
    const analysisPromptTemplate = await getConfig('quickSearchPrompt', DEFAULT_QUICK_SEARCH_ANALYSIS_PROMPT)
    const analysisPrompt = replaceTimeVariables(analysisPromptTemplate)
      .replace('{{query}}', query)
      .replace('{{searchIntent}}', keywordResult.searchIntent || '')
      .replace('{{timeContext}}', keywordResult.timeContext || '')
      .replace('{{topicContext}}', keywordResult.topicContext || '')
      .replace('{{diaries}}', JSON.stringify(prepareDiariesData(searchResults), null, 2))
      .replace('{{appliedFilters}}', appliedFiltersText)
    
    const analysisResponse = await callAI(analysisPrompt, 0.3)
    apiCallCount++
    const analysisResult = parseAIResponse(analysisResponse)
    
    // 合并结果
    const enrichedResults = analysisResult.results?.map(r => {
      const diary = searchResults.find(d => d.id === r.id)
      return {
        ...diary,
        relevance: r.relevance || 50,
        relevanceReason: r.reason || '',
        matchedAspects: r.matchedAspects || [],
        matchedKeywords: diary?.matchedKeywords || [],
        timeMatch: r.timeMatch
      }
    }).sort((a, b) => b.relevance - a.relevance) || []
    
    // ========== 可选步骤5: 自我验证（如果还有API调用次数） ==========
    let validationResult = null
    if (apiCallCount < maxApiCalls && enrichedResults.length > 0) {
      const validationPromptTemplate = await getConfig('selfValidationPrompt', DEFAULT_SELF_VALIDATION_PROMPT)
      const validationPrompt = replaceTimeVariables(validationPromptTemplate)
        .replace('{{query}}', query)
        .replace('{{searchIntent}}', JSON.stringify(intentResult.intent || {}))
        .replace('{{foundCount}}', enrichedResults.length)
        .replace('{{highRelevanceCount}}', analysisResult.summary?.highRelevanceCount || 0)
        .replace('{{results}}', JSON.stringify(enrichedResults.slice(0, 10), null, 2))
      
      const validationResponse = await callAI(validationPrompt, 0.3)
      apiCallCount++
      validationResult = parseAIResponse(validationResponse)
    }
    
    status.update(
      'completed',
      '搜索完成',
      100,
      {
        foundCount: enrichedResults.length,
        highRelevanceCount: analysisResult.summary?.highRelevanceCount || 0,
        keywords: allKeywords,
        intent: intentResult.intent,
        timeRange,
        matchedTags: matchedTags.map(t => t.tag),
        validation: validationResult?.validation
      },
      { currentStep: 5, totalSteps: 5, stepName: '完成', stepDescription: `找到 ${enrichedResults.length} 篇相关日记` }
    )
    
    return {
      results: enrichedResults,
      keywords: allKeywords,
      intent: intentResult.intent,
      timeRange,
      matchedTags: matchedTags.map(t => ({ tag: t.tag, confidence: t.confidence })),
      layers: searchResult.layers,
      analysisSummary: analysisResult.summary || {},
      validation: validationResult,
      process: {
        mode: 'quick',
        steps: ['analyzing_intent', 'matching_tags', 'generating_keywords', 'local_searching', 'analyzing', 'completed'],
        totalApiCalls: apiCallCount
      }
    }
    
  } catch (error) {
    status.update('error', `搜索出错: ${error.message}`, 0)
    throw error
  }
}

// ========================================
// 深度搜索 - 动态API调用（6+次，模型决定）
// ========================================

/**
 * 深度搜索（优化版）
 * 在快速搜索基础上，进行更深入的分析，API调用次数由模型决定
 * @param {string} query - 用户查询
 * @param {Array} diaries - 所有日记
 * @param {Object} allTags - 所有可用标签
 * @param {Object} allMoods - 所有可用心情
 * @param {Function} onStatusUpdate - 状态更新回调
 * @returns {Promise<Object>}
 */
export async function deepSearch(query, diaries, allTags = [], allMoods = [], onStatusUpdate) {
  const status = new SearchStatusManager(onStatusUpdate)
  let apiCallCount = 0
  const maxIterations = 10 // 最大迭代次数
  
  try {
    // ========== 步骤0-4: 执行快速搜索 ==========
    status.update(
      'quick_search',
      '正在进行快速搜索...',
      5,
      {},
      { currentStep: 1, totalSteps: 6, stepName: '快速搜索', stepDescription: '执行快速搜索获取初步结果' }
    )

    const quickResult = await quickSearch(query, diaries, allTags, allMoods, (s, history) => {
      // 转发快速搜索状态，但调整进度
      const adjustedProgress = Math.floor(s.progress * 0.25)
      status.update(s.stage, s.message, adjustedProgress, s.stats, {
        currentStep: 1,
        totalSteps: 6,
        stepName: '快速搜索',
        stepDescription: s.stepDescription || '执行快速搜索'
      })
    })
    
    apiCallCount = quickResult.process?.totalApiCalls || 3
    
    // ========== 步骤5: 正文内容分析 ==========
    const highRelevanceDiaries = quickResult.results.filter(d => (d.relevance || 0) > 50)
    let contentAnalysisResults = []
    
    if (highRelevanceDiaries.length > 0 && apiCallCount < maxIterations) {
      status.update(
        'analyzing_contents',
        `正在深入分析 ${Math.min(highRelevanceDiaries.length, 10)} 篇日记的正文...`,
        35,
        { contentsToAnalyze: Math.min(highRelevanceDiaries.length, 10) },
        { currentStep: 2, totalSteps: 6, stepName: '正文分析', stepDescription: '分析日记正文，提取关键信息' }
      )
      
      const contentsData = prepareContentsData(highRelevanceDiaries.slice(0, 10))
      
      const contentPromptTemplate = await getConfig('deepSearchPrompt', DEFAULT_CONTENT_ANALYSIS_PROMPT)
      const contentPrompt = replaceTimeVariables(contentPromptTemplate)
        .replace('{{query}}', query)
        .replace('{{searchIntent}}', quickResult.intent?.description || '')
        .replace('{{contents}}', JSON.stringify(contentsData, null, 2))
      
      const contentResponse = await callAI(contentPrompt, 0.3)
      apiCallCount++
      const contentResult = parseAIResponse(contentResponse)
      
      contentAnalysisResults = contentResult.contentAnalysis || []
      
      status.update(
        'analyzing_contents',
        `正文分析完成，已分析 ${contentAnalysisResults.length} 篇日记`,
        50,
        { contentsAnalyzed: contentAnalysisResults.length },
        { currentStep: 2, totalSteps: 6, stepName: '正文分析', stepDescription: '正文分析完成' }
      )
    }
    
    // ========== 步骤6+: 迭代优化（模型决定是否继续） ==========
    let currentResults = [...quickResult.results]
    let iterationCount = 0
    let shouldContinue = true
    
    while (shouldContinue && apiCallCount < maxIterations && iterationCount < 3) {
      iterationCount++
      
      status.update(
        'validating',
        `正在进行第 ${iterationCount} 轮结果验证...`,
        50 + iterationCount * 10,
        { iteration: iterationCount },
        { currentStep: 3, totalSteps: 6, stepName: '结果验证', stepDescription: `第 ${iterationCount} 轮自我验证` }
      )
      
      // 自我验证
      const validationPromptTemplate = await getConfig('selfValidationPrompt', DEFAULT_SELF_VALIDATION_PROMPT)
      const validationPrompt = replaceTimeVariables(validationPromptTemplate)
        .replace('{{query}}', query)
        .replace('{{searchIntent}}', JSON.stringify(quickResult.intent || {}))
        .replace('{{foundCount}}', currentResults.length)
        .replace('{{highRelevanceCount}}', currentResults.filter(r => (r.relevance || 0) >= 70).length)
        .replace('{{results}}', JSON.stringify(currentResults.slice(0, 10), null, 2))
      
      const validationResponse = await callAI(validationPrompt, 0.3)
      apiCallCount++
      const validationResult = parseAIResponse(validationResponse)
      
      // 模型决定是否继续
      shouldContinue = validationResult.supplementDecision?.shouldSupplement && apiCallCount < maxIterations
      
      if (shouldContinue && validationResult.supplementDecision?.suggestions) {
        // 执行补充搜索（简化版，实际可以更复杂）
        status.update(
          'supplementing',
          '正在执行补充搜索...',
          60 + iterationCount * 5,
          {},
          { currentStep: 3, totalSteps: 6, stepName: '补充搜索', stepDescription: '根据验证结果补充搜索' }
        )
        
        // 这里可以添加更复杂的补充搜索逻辑
        // 目前简化为：放宽条件重新搜索
        const additionalKeywords = validationResult.supplementDecision.suggestions
          .filter(s => s.type === 'extend_keywords')
          .flatMap(s => s.keywords || [])
        
        if (additionalKeywords.length > 0) {
          const additionalResults = await localSearchWithKeywords(diaries, additionalKeywords)
          // 合并结果
          additionalResults.forEach(diary => {
            if (!currentResults.find(r => r.id === diary.id)) {
              currentResults.push({ ...diary, relevance: 50, fromSupplement: true })
            }
          })
        }
      }
    }
    
    // ========== 步骤N-1: 意图结果处理 ==========
    status.update(
      'processing_intent',
      '正在根据搜索意图处理结果...',
      80,
      {},
      { currentStep: 4, totalSteps: 6, stepName: '意图处理', stepDescription: '根据意图类型生成相应输出' }
    )
    
    const intentProcessingPromptTemplate = await getConfig('intentProcessingPrompt', DEFAULT_INTENT_PROCESSING_PROMPT)
    const intentProcessingPrompt = replaceTimeVariables(intentProcessingPromptTemplate)
      .replace('{{query}}', query)
      .replace('{{intentType}}', quickResult.intent?.type || 'search')
      .replace('{{foundCount}}', currentResults.length)
      .replace('{{highRelevanceCount}}', currentResults.filter(r => (r.relevance || 0) >= 70).length)
      .replace('{{results}}', JSON.stringify(prepareDiariesData(currentResults.slice(0, 15)), null, 2))
    
    const intentResponse = await callAI(intentProcessingPrompt, 0.3)
    apiCallCount++
    const intentResult = parseAIResponse(intentResponse)
    
    // ========== 步骤N: 生成详细报告 ==========
    status.update(
      'generating_report',
      '正在生成详细搜索报告...',
      90,
      {},
      { currentStep: 5, totalSteps: 6, stepName: '生成报告', stepDescription: '汇总分析结果，生成详细报告' }
    )
    
    const reportPromptTemplate = await getConfig('reportGenerationPrompt', DEFAULT_REPORT_GENERATION_PROMPT)
    const reportPrompt = replaceTimeVariables(reportPromptTemplate)
      .replace('{{query}}', query)
      .replace('{{intentType}}', quickResult.intent?.type || 'search')
      .replace('{{quickResults}}', JSON.stringify(quickResult.results.slice(0, 10), null, 2))
      .replace('{{contentAnalysis}}', JSON.stringify(contentAnalysisResults, null, 2))
      .replace('{{intentResults}}', JSON.stringify(intentResult.processedResults || {}, null, 2))
    
    const reportResponse = await callAI(reportPrompt, 0.3)
    apiCallCount++
    const reportResult = parseAIResponse(reportResponse)
    
    // 合并最终结果
    const finalResultsMap = new Map()
    
    // 添加所有候选日记
    currentResults.forEach(d => {
      finalResultsMap.set(d.id, { ...d })
    })
    
    // 更新正文分析结果
    contentAnalysisResults.forEach(analysis => {
      const existing = finalResultsMap.get(analysis.id)
      if (existing) {
        finalResultsMap.set(analysis.id, {
          ...existing,
          relevance: analysis.updatedRelevance || existing.relevance,
          keyPoints: analysis.keyPoints || [],
          excerpt: analysis.excerpt || '',
          entities: analysis.entities || {},
          contentDetails: analysis.details || ''
        })
      }
    })
    
    // 更新报告中的最终结果
    if (reportResult.finalResults) {
      reportResult.finalResults.forEach(r => {
        const existing = finalResultsMap.get(r.id)
        if (existing) {
          finalResultsMap.set(r.id, {
            ...existing,
            relevance: r.relevance || existing.relevance,
            relevanceReason: r.finalReason || existing.relevanceReason,
            keyPoints: r.keyPoints || existing.keyPoints || [],
            excerpt: r.excerpt || existing.excerpt || ''
          })
        }
      })
    }
    
    // 转换为数组并排序
    const finalResults = Array.from(finalResultsMap.values())
      .sort((a, b) => b.relevance - a.relevance)
    
    status.update(
      'completed',
      '深度搜索完成',
      100,
      {
        foundCount: finalResults.length,
        highRelevanceCount: reportResult.statistics?.highRelevance || 0,
        contentsAnalyzed: contentAnalysisResults.length,
        keywords: quickResult.keywords,
        intent: quickResult.intent,
        totalApiCalls: apiCallCount
      },
      { currentStep: 6, totalSteps: 6, stepName: '完成', stepDescription: `深度搜索完成，共${apiCallCount}次API调用` }
    )
    
    return {
      results: finalResults,
      keywords: quickResult.keywords,
      intent: quickResult.intent,
      timeRange: quickResult.timeRange,
      matchedTags: quickResult.matchedTags,
      report: reportResult.report || {},
      statistics: reportResult.statistics || {},
      processedResults: intentResult.processedResults || {},
      process: {
        mode: 'deep',
        steps: [
          'quick_search',
          'analyzing_contents',
          'validating',
          'processing_intent',
          'generating_report',
          'completed'
        ],
        totalApiCalls: apiCallCount,
        iterations: iterationCount,
        quickKeywords: quickResult.keywords
      }
    }
    
  } catch (error) {
    status.update('error', `深度搜索出错: ${error.message}`, 0)
    throw error
  }
}

// ========================================
// 智能搜索入口
// ========================================

/**
 * 智能搜索入口
 * @param {string} query - 用户查询
 * @param {Array} diaries - 所有日记
 * @param {string} mode - 搜索模式：'quick' | 'deep'
 * @param {Array} allTags - 所有可用标签
 * @param {Array} allMoods - 所有可用心情
 * @param {Function} onStatusUpdate - 状态更新回调
 * @returns {Promise<Object>}
 */
export async function smartSearch(query, diaries, mode = 'quick', allTags = [], allMoods = [], onStatusUpdate) {
  if (!query || query.trim() === '') {
    return { results: diaries, keywords: [], report: {} }
  }

  if (mode === 'deep') {
    return deepSearch(query, diaries, allTags, allMoods, onStatusUpdate)
  } else {
    return quickSearch(query, diaries, allTags, allMoods, onStatusUpdate)
  }
}

// ========================================
// 导出默认对象
// ========================================

export default {
  quickSearch,
  deepSearch,
  smartSearch,
  parseTimeExpression,
  SEARCH_INTENTS,
  DEFAULT_INTENT_ANALYSIS_PROMPT,
  DEFAULT_TAG_MATCHING_PROMPT,
  DEFAULT_KEYWORD_GENERATION_PROMPT,
  DEFAULT_QUICK_SEARCH_ANALYSIS_PROMPT,
  DEFAULT_SELF_VALIDATION_PROMPT,
  DEFAULT_CONTENT_ANALYSIS_PROMPT,
  DEFAULT_INTENT_PROCESSING_PROMPT,
  DEFAULT_REPORT_GENERATION_PROMPT,
  // 保留旧导出以兼容
  DEFAULT_TOOL_SELECTION_PROMPT,
  DEFAULT_KEYWORD_EXTENSION_PROMPT,
  DEFAULT_CONTENT_ANALYSIS_DECISION_PROMPT,
  DEFAULT_QUICK_SEARCH_PROMPT,
  DEFAULT_DEEP_SEARCH_PROMPT
}