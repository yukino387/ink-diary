/**
 * 墨记 - 数据库模块 (db.js)
 * 使用 localForage 封装 IndexedDB 操作
 * 
 * 数据模型：
 * - Diary: { 
 *     id, title, createTime, updateTime, htmlContent, 
 *     tags, mood, moodIcon, summary, style, preset, 
 *     originalContent, isVertical 
 *   }
 * - AppConfig: { id, apiBaseUrl, apiKey, theme, defaultVertical }
 * 
 * 安全说明：
 * - 所有数据存储在本地浏览器中
 * - API密钥等敏感信息也仅本地存储，不会上传到任何服务器
 */

import localforage from 'localforage'
import { encryptLocalData, decryptLocalData } from './crypto.js'

// ========================================
// 配置 localForage 实例
// ========================================

// 日记存储
const diaryStore = localforage.createInstance({
  name: 'InkDiary',
  storeName: 'diaries',
  description: '墨记日记数据存储'
})

// 应用配置存储
const configStore = localforage.createInstance({
  name: 'InkDiary',
  storeName: 'config',
  description: '墨记应用配置存储'
})

// 提示词配置存储
const promptStore = localforage.createInstance({
  name: 'InkDiary',
  storeName: 'prompts',
  description: '墨记提示词配置存储'
})

// ========================================
// 日记数据操作
// ========================================

/**
 * 生成唯一ID
 * 使用日期时间戳 + 随机数确保唯一性
 */
function generateId() {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 5)
  return `${timestamp}-${random}`
}

/**
 * 获取当前时间的ISO字符串
 */
function getCurrentTime() {
  return new Date().toISOString()
}

/**
 * 将日期格式化为中国传统农历风格（简化版）
 * 实际格式：YYYY年MM月DD日
 */
export function formatChineseDate(dateString) {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  
  // 天干地支年份映射（简化）
  const heavenlyStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
  const earthlyBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
  const zodiacYear = (year - 4) % 60
  const stem = heavenlyStems[zodiacYear % 10]
  const branch = earthlyBranches[zodiacYear % 12]
  
  // 农历月份名称
  const lunarMonths = ['正月', '二月', '三月', '四月', '五月', '六月', 
                       '七月', '八月', '九月', '十月', '冬月', '腊月']
  const lunarDays = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
                     '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
                     '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十']
  
  // 返回简化格式（实际农历计算复杂，这里用公历模拟）
  return `${stem}${branch}年${lunarMonths[month - 1]}${lunarDays[day - 1]}`
}

/**
 * 格式化日期为 YYYY-MM-DD
 * @param {string} dateString - ISO日期字符串
 * @returns {string} 格式化后的日期
 */
export function formatDate(dateString) {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 创建新日记
 * @param {Object} diaryData - 日记数据
 * @param {string} diaryData.title - 标题
 * @param {string} diaryData.htmlContent - HTML内容
 * @param {Array} [diaryData.tags] - 标签数组
 * @param {string} [diaryData.mood] - 心情值
 * @param {string} [diaryData.moodIcon] - 心情图标
 * @param {string} [diaryData.summary] - 摘要
 * @param {string} [diaryData.style] - 风格
 * @param {string} [diaryData.preset] - 预设
 * @param {string} [diaryData.originalContent] - 原始内容
 * @param {boolean} [diaryData.isVertical] - 是否竖排
 * @returns {Promise<Object>} 创建的日记对象（含id）
 */
// 本地加密开关（默认开启）
let localEncryptionEnabled = true

// 用户设置的本地加密密码（可选）
let userLocalPassword = null

/**
 * 设置本地加密密码
 * @param {string|null} password - 用户密码，null 表示清除
 */
export function setLocalEncryptionPassword(password) {
  userLocalPassword = password
  console.log('[DB] 本地加密密码已' + (password ? '设置' : '清除'))
}

/**
 * 启用/禁用本地加密
 * @param {boolean} enabled - 是否启用
 */
export function setLocalEncryptionEnabled(enabled) {
  localEncryptionEnabled = enabled
  console.log('[DB] 本地加密已' + (enabled ? '启用' : '禁用'))
}

/**
 * 加密敏感字段
 * @param {object} diary - 日记对象
 * @returns {Promise<object>} 加密后的日记对象
 */
async function encryptDiaryFields(diary) {
  if (!localEncryptionEnabled) return diary
  
  const encrypted = { ...diary }
  
  // 加密敏感字段
  if (diary.htmlContent) {
    encrypted.htmlContent = await encryptLocalData(diary.htmlContent, userLocalPassword)
  }
  if (diary.originalContent) {
    encrypted.originalContent = await encryptLocalData(diary.originalContent, userLocalPassword)
  }
  
  return encrypted
}

/**
 * 解密敏感字段
 * @param {object} diary - 日记对象
 * @returns {Promise<object>} 解密后的日记对象
 */
async function decryptDiaryFields(diary) {
  if (!diary) return diary
  
  const decrypted = { ...diary }
  
  // 解密敏感字段
  if (diary.htmlContent) {
    decrypted.htmlContent = await decryptLocalData(diary.htmlContent, userLocalPassword)
  }
  if (diary.originalContent) {
    decrypted.originalContent = await decryptLocalData(diary.originalContent, userLocalPassword)
  }
  
  return decrypted
}

export async function createDiary(diaryData) {
  try {
    const id = generateId()
    const now = getCurrentTime()
    
    // 确保数据可以被 IndexedDB 克隆（转换为普通对象）
    const diary = {
      id,
      title: String(diaryData.title || '未命名日记'),
      htmlContent: String(diaryData.htmlContent || ''),
      createTime: now,
      updateTime: now,
      // 新增字段 - 确保数组是普通数组
      tags: Array.isArray(diaryData.tags) ? [...diaryData.tags] : [],
      mood: String(diaryData.mood || ''),
      moodIcon: String(diaryData.moodIcon || ''),
      summary: String(diaryData.summary || ''),
      style: String(diaryData.style || 'classical'),
      preset: String(diaryData.preset || ''),
      originalContent: String(diaryData.originalContent || ''),
      isVertical: Boolean(diaryData.isVertical)
    }
    
    // 加密敏感字段
    const encryptedDiary = await encryptDiaryFields(diary)
    
    await diaryStore.setItem(id, encryptedDiary)
    console.log('[DB] 日记创建成功:', id)
    return diary
  } catch (error) {
    console.error('[DB] 创建日记失败:', error)
    throw new Error('创建日记失败: ' + error.message)
  }
}

/**
 * 获取单个日记
 * @param {string} id - 日记ID
 * @returns {Promise<Object|null>} 日记对象或null
 */
export async function getDiary(id) {
  try {
    const diary = await diaryStore.getItem(id)
    // 数据迁移：为旧数据添加新字段的默认值
    if (diary) {
      const migrated = migrateDiaryData(diary)
      // 解密敏感字段
      return await decryptDiaryFields(migrated)
    }
    return diary
  } catch (error) {
    console.error('[DB] 获取日记失败:', error)
    throw new Error('获取日记失败: ' + error.message)
  }
}

/**
 * 数据迁移：为旧日记数据添加新字段
 * @param {Object} diary - 日记对象
 * @returns {Object} 迁移后的日记对象
 */
function migrateDiaryData(diary) {
  return {
    ...diary,
    tags: diary.tags || [],
    mood: diary.mood || '',
    moodIcon: diary.moodIcon || '',
    summary: diary.summary || '',
    style: diary.style || 'classical',
    preset: diary.preset || '',
    originalContent: diary.originalContent || ''
  }
}

/**
 * 获取所有日记列表
 * @param {Object} [options] - 查询选项
 * @param {string} [options.sortBy] - 排序字段 ('createTime' | 'updateTime' | 'title')
 * @param {string} [options.order] - 排序方向 ('asc' | 'desc')
 * @returns {Promise<Array>} 日记数组
 */
export async function getAllDiaries(options = {}) {
  try {
    const { sortBy = 'createTime', order = 'desc' } = options
    
    const diaries = []
    await diaryStore.iterate((value) => {
      diaries.push(migrateDiaryData(value))
    })
    
    // 解密所有日记的敏感字段
    const decryptedDiaries = await Promise.all(
      diaries.map(diary => decryptDiaryFields(diary))
    )
    
    // 排序
    decryptedDiaries.sort((a, b) => {
      let comparison = 0
      if (sortBy === 'title') {
        comparison = a.title.localeCompare(b.title, 'zh-CN')
      } else {
        const dateA = new Date(a[sortBy] || a.createTime)
        const dateB = new Date(b[sortBy] || b.createTime)
        comparison = dateA - dateB
      }
      return order === 'asc' ? comparison : -comparison
    })
    
    return decryptedDiaries
  } catch (error) {
    console.error('[DB] 获取日记列表失败:', error)
    throw new Error('获取日记列表失败: ' + error.message)
  }
}

/**
 * 搜索日记（综合搜索）
 * @param {string} keyword - 搜索关键词
 * @returns {Promise<Array>} 匹配的日记数组
 */
export async function searchDiaries(keyword) {
  try {
    if (!keyword || keyword.trim() === '') {
      return getAllDiaries()
    }
    
    const searchTerm = keyword.toLowerCase().trim()
    const diaries = await getAllDiaries()
    
    return diaries.filter(diary => {
      const titleMatch = diary.title.toLowerCase().includes(searchTerm)
      const contentMatch = diary.htmlContent.toLowerCase().includes(searchTerm)
      const dateMatch = formatChineseDate(diary.createTime).includes(searchTerm)
      const tagMatch = diary.tags && diary.tags.some(tag => 
        tag.toLowerCase().includes(searchTerm)
      )
      const moodMatch = diary.mood && diary.mood.toLowerCase().includes(searchTerm)
      const summaryMatch = diary.summary && diary.summary.toLowerCase().includes(searchTerm)
      
      return titleMatch || contentMatch || dateMatch || tagMatch || moodMatch || summaryMatch
    })
  } catch (error) {
    console.error('[DB] 搜索日记失败:', error)
    throw new Error('搜索日记失败: ' + error.message)
  }
}

/**
 * 按标签搜索日记
 * @param {string} tag - 标签
 * @returns {Promise<Array>} 匹配的日记数组
 */
export async function searchDiariesByTag(tag) {
  try {
    if (!tag || tag.trim() === '') {
      return getAllDiaries()
    }
    
    const diaries = await getAllDiaries()
    return diaries.filter(diary => 
      diary.tags && diary.tags.some(t => t === tag || t.includes(tag))
    )
  } catch (error) {
    console.error('[DB] 按标签搜索失败:', error)
    throw new Error('按标签搜索失败: ' + error.message)
  }
}

/**
 * 按心情搜索日记
 * @param {string} mood - 心情值
 * @returns {Promise<Array>} 匹配的日记数组
 */
export async function searchDiariesByMood(mood) {
  try {
    if (!mood || mood.trim() === '') {
      return getAllDiaries()
    }
    
    const diaries = await getAllDiaries()
    return diaries.filter(diary => diary.mood === mood)
  } catch (error) {
    console.error('[DB] 按心情搜索失败:', error)
    throw new Error('按心情搜索失败: ' + error.message)
  }
}

/**
 * 按日期范围搜索日记
 * @param {string} startDate - 开始日期 (YYYY-MM-DD)
 * @param {string} endDate - 结束日期 (YYYY-MM-DD)
 * @returns {Promise<Array>} 匹配的日记数组
 */
export async function searchDiariesByDateRange(startDate, endDate) {
  try {
    const diaries = await getAllDiaries()
    
    const start = startDate ? new Date(startDate + 'T00:00:00') : null
    const end = endDate ? new Date(endDate + 'T23:59:59') : null
    
    return diaries.filter(diary => {
      const diaryDate = new Date(diary.createTime)
      
      if (start && diaryDate < start) return false
      if (end && diaryDate > end) return false
      
      return true
    })
  } catch (error) {
    console.error('[DB] 按日期范围搜索失败:', error)
    throw new Error('按日期范围搜索失败: ' + error.message)
  }
}

/**
 * 获取所有标签（用于筛选）
 * @returns {Promise<Array>} 标签数组 [{tag, count}]
 */
export async function getAllTags() {
  try {
    const diaries = await getAllDiaries()
    const tagCount = {}
    
    diaries.forEach(diary => {
      if (diary.tags && Array.isArray(diary.tags)) {
        diary.tags.forEach(tag => {
          tagCount[tag] = (tagCount[tag] || 0) + 1
        })
      }
    })
    
    // 转换为数组并按使用次数排序
    return Object.entries(tagCount)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
  } catch (error) {
    console.error('[DB] 获取所有标签失败:', error)
    return []
  }
}

/**
 * 获取所有心情（用于筛选）
 * @returns {Promise<Array>} 心情数组 [{mood, moodIcon, count}]
 */
export async function getAllMoods() {
  try {
    const diaries = await getAllDiaries()
    const moodCount = {}
    
    diaries.forEach(diary => {
      if (diary.mood) {
        if (!moodCount[diary.mood]) {
          moodCount[diary.mood] = { count: 0, icon: diary.moodIcon || '' }
        }
        moodCount[diary.mood].count++
      }
    })
    
    // 转换为数组并按使用次数排序
    return Object.entries(moodCount)
      .map(([mood, data]) => ({ mood, moodIcon: data.icon, count: data.count }))
      .sort((a, b) => b.count - a.count)
  } catch (error) {
    console.error('[DB] 获取所有心情失败:', error)
    return []
  }
}

/**
 * 更新日记
 * @param {string} id - 日记ID
 * @param {Object} updates - 要更新的字段
 * @returns {Promise<Object>} 更新后的日记对象
 */
export async function updateDiary(id, updates) {
  try {
    const existingDiary = await diaryStore.getItem(id)
    if (!existingDiary) {
      throw new Error('日记不存在')
    }
    
    // 解密现有数据
    const decryptedExisting = await decryptDiaryFields(existingDiary)
    
    // 确保数据可以被 IndexedDB 克隆（转换为普通对象）
    const updatedDiary = {
      ...decryptedExisting,
      id, // 确保ID不变
      updateTime: getCurrentTime() // 自动更新修改时间
    }
    
    // 安全地更新字段
    if (updates.title !== undefined) updatedDiary.title = String(updates.title)
    if (updates.htmlContent !== undefined) updatedDiary.htmlContent = String(updates.htmlContent)
    if (updates.tags !== undefined) updatedDiary.tags = Array.isArray(updates.tags) ? [...updates.tags] : []
    if (updates.mood !== undefined) updatedDiary.mood = String(updates.mood)
    if (updates.moodIcon !== undefined) updatedDiary.moodIcon = String(updates.moodIcon)
    if (updates.summary !== undefined) updatedDiary.summary = String(updates.summary)
    if (updates.style !== undefined) updatedDiary.style = String(updates.style)
    if (updates.preset !== undefined) updatedDiary.preset = String(updates.preset)
    if (updates.originalContent !== undefined) updatedDiary.originalContent = String(updates.originalContent)
    if (updates.isVertical !== undefined) updatedDiary.isVertical = Boolean(updates.isVertical)
    
    // 加密敏感字段
    const encryptedDiary = await encryptDiaryFields(updatedDiary)
    
    await diaryStore.setItem(id, encryptedDiary)
    console.log('[DB] 日记更新成功:', id)
    return updatedDiary
  } catch (error) {
    console.error('[DB] 更新日记失败:', error)
    throw new Error('更新日记失败: ' + error.message)
  }
}

/**
 * 删除日记
 * @param {string} id - 日记ID
 * @returns {Promise<boolean>} 是否删除成功
 */
export async function deleteDiary(id) {
  try {
    await diaryStore.removeItem(id)
    console.log('[DB] 日记删除成功:', id)
    return true
  } catch (error) {
    console.error('[DB] 删除日记失败:', error)
    throw new Error('删除日记失败: ' + error.message)
  }
}

/**
 * 导出所有数据（用于备份）
 * @returns {Promise<Object>} 包含所有日记、配置和提示词的对象
 */
export async function exportAllData() {
  try {
    const diaries = await getAllDiaries()
    const config = await getAllConfig()
    const prompts = await getAllPrompts()
    
    const exportData = {
      version: '2.0.0',
      exportTime: getCurrentTime(),
      diaries,
      config,
      prompts
    }
    
    return exportData
  } catch (error) {
    console.error('[DB] 导出数据失败:', error)
    throw new Error('导出数据失败: ' + error.message)
  }
}

/**
 * 导入数据（从备份恢复，支持智能合并）
 * @param {Object} data - 导出的数据对象
 * @param {Object} options - 导入选项
 * @param {boolean} options.merge - 是否合并（true: 合并，false: 覆盖）
 * @returns {Promise<Object>} 导入结果统计
 */
export async function importAllData(data, options = { merge: true }) {
  try {
    if (!data.diaries || !Array.isArray(data.diaries)) {
      throw new Error('无效的数据格式')
    }
    
    const stats = {
      added: 0,
      updated: 0,
      skipped: 0,
      importedConfig: 0,
      importedPrompts: 0
    }
    
    // 获取现有日记用于合并判断
    const existingDiaries = options.merge ? await getAllDiaries() : []
    const existingMap = new Map(existingDiaries.map(d => [d.id, d]))
    
    // 导入日记（智能合并）
    for (const diary of data.diaries) {
      if (!diary.id || diary.title === undefined) {
        stats.skipped++
        continue
      }
      
      // 确保新字段存在
      const migratedDiary = migrateDiaryData(diary)
      const existing = existingMap.get(diary.id)
      
      if (existing) {
        // 已存在，比较更新时间
        const existingTime = new Date(existing.updateTime || existing.createTime).getTime()
        const newTime = new Date(migratedDiary.updateTime || migratedDiary.createTime).getTime()
        
        if (newTime > existingTime) {
          // 新数据较新，更新
          await diaryStore.setItem(diary.id, migratedDiary)
          stats.updated++
        } else {
          // 现有数据较新或相同，跳过
          stats.skipped++
        }
      } else {
        // 不存在，新增
        await diaryStore.setItem(diary.id, migratedDiary)
        stats.added++
      }
    }
    
    // 导入配置（合并模式：导入的配置覆盖现有）
    if (data.config) {
      for (const [key, value] of Object.entries(data.config)) {
        await configStore.setItem(key, value)
        stats.importedConfig++
      }
    }
    
    // 导入提示词配置
    if (data.prompts) {
      for (const [key, value] of Object.entries(data.prompts)) {
        await promptStore.setItem(key, value)
        stats.importedPrompts++
      }
    }
    
    console.log('[DB] 数据导入成功:', stats)
    return {
      success: true,
      ...stats,
      totalProcessed: stats.added + stats.updated + stats.skipped
    }
  } catch (error) {
    console.error('[DB] 导入数据失败:', error)
    throw new Error('导入数据失败: ' + error.message)
  }
}

// ========================================
// 应用配置操作
// ========================================

/**
 * 获取配置项
 * @param {string} key - 配置键名
 * @param {*} [defaultValue] - 默认值
 * @returns {Promise<*>} 配置值
 */
// 需要加密的配置项
const SENSITIVE_CONFIG_KEYS = ['apiKey']

/**
 * 加密配置值（如果是敏感字段）
 * @param {string} key - 配置键名
 * @param {*} value - 配置值
 * @returns {Promise<*>} 加密后的值
 */
async function encryptConfigValue(key, value) {
  if (!localEncryptionEnabled) return value
  if (!SENSITIVE_CONFIG_KEYS.includes(key)) return value
  if (!value) return value
  
  return await encryptLocalData(String(value), userLocalPassword)
}

/**
 * 解密配置值（如果是敏感字段）
 * @param {string} key - 配置键名
 * @param {*} value - 配置值
 * @returns {Promise<*>} 解密后的值
 */
async function decryptConfigValue(key, value) {
  if (!SENSITIVE_CONFIG_KEYS.includes(key)) return value
  if (!value || typeof value !== 'object' || !value._enc) return value
  
  return await decryptLocalData(value, userLocalPassword)
}

export async function getConfig(key, defaultValue = null) {
  try {
    const value = await configStore.getItem(key)
    if (value === null) return defaultValue
    
    // 解密敏感配置
    const decryptedValue = await decryptConfigValue(key, value)
    return decryptedValue !== null ? decryptedValue : defaultValue
  } catch (error) {
    console.error('[DB] 获取配置失败:', error)
    return defaultValue
  }
}

/**
 * 设置配置项
 * @param {string} key - 配置键名
 * @param {*} value - 配置值
 * @returns {Promise<boolean>} 是否设置成功
 */
export async function setConfig(key, value) {
  try {
    // 加密敏感配置
    const encryptedValue = await encryptConfigValue(key, value)
    await configStore.setItem(key, encryptedValue)
    console.log('[DB] 配置已保存:', key)
    return true
  } catch (error) {
    console.error('[DB] 保存配置失败:', error)
    throw new Error('保存配置失败: ' + error.message)
  }
}

/**
 * 获取所有配置
 * @returns {Promise<Object>} 所有配置对象
 */
export async function getAllConfig() {
  try {
    const config = {}
    await configStore.iterate((value, key) => {
      config[key] = value
    })
    return config
  } catch (error) {
    console.error('[DB] 获取所有配置失败:', error)
    return {}
  }
}

/**
 * 删除配置项
 * @param {string} key - 配置键名
 * @returns {Promise<boolean>} 是否删除成功
 */
export async function deleteConfig(key) {
  try {
    await configStore.removeItem(key)
    console.log('[DB] 配置已删除:', key)
    return true
  } catch (error) {
    console.error('[DB] 删除配置失败:', error)
    throw new Error('删除配置失败: ' + error.message)
  }
}

// ========================================
// 提示词配置操作
// ========================================

/**
 * 获取提示词配置
 * @param {string} key - 配置键名
 * @param {*} [defaultValue] - 默认值
 * @returns {Promise<*>} 配置值
 */
export async function getPrompt(key, defaultValue = null) {
  try {
    const value = await promptStore.getItem(key)
    return value !== null ? value : defaultValue
  } catch (error) {
    console.error('[DB] 获取提示词配置失败:', error)
    return defaultValue
  }
}

/**
 * 设置提示词配置
 * @param {string} key - 配置键名
 * @param {*} value - 配置值
 * @returns {Promise<boolean>} 是否设置成功
 */
export async function setPrompt(key, value) {
  try {
    await promptStore.setItem(key, value)
    console.log('[DB] 提示词配置已保存:', key)
    return true
  } catch (error) {
    console.error('[DB] 保存提示词配置失败:', error)
    throw new Error('保存提示词配置失败: ' + error.message)
  }
}

/**
 * 获取所有提示词配置
 * @returns {Promise<Object>} 所有提示词配置
 */
export async function getAllPrompts() {
  try {
    const prompts = {}
    await promptStore.iterate((value, key) => {
      prompts[key] = value
    })
    return prompts
  } catch (error) {
    console.error('[DB] 获取所有提示词配置失败:', error)
    return {}
  }
}

// ========================================
// 数据库工具函数
// ========================================

/**
 * 清空所有数据（谨慎使用）
 * @returns {Promise<boolean>}
 */
export async function clearAllData() {
  try {
    await diaryStore.clear()
    await configStore.clear()
    console.log('[DB] 所有数据已清空')
    return true
  } catch (error) {
    console.error('[DB] 清空数据失败:', error)
    throw new Error('清空数据失败: ' + error.message)
  }
}

/**
 * 获取数据库统计信息
 * @returns {Promise<Object>} 统计信息
 */
export async function getDatabaseStats() {
  try {
    let diaryCount = 0
    await diaryStore.iterate(() => {
      diaryCount++
    })
    
    let configCount = 0
    await configStore.iterate(() => {
      configCount++
    })
    
    return {
      diaryCount,
      configCount,
      totalSize: '计算中...' // 实际大小计算较复杂，暂不实现
    }
  } catch (error) {
    console.error('[DB] 获取统计信息失败:', error)
    return { diaryCount: 0, configCount: 0 }
  }
}

// ========================================
// 初始化检查
// ========================================

/**
 * 检查数据库连接状态
 * @returns {Promise<boolean>}
 */
export async function checkDatabaseHealth() {
  try {
    await diaryStore.ready()
    await configStore.ready()
    console.log('[DB] 数据库连接正常')
    return true
  } catch (error) {
    console.error('[DB] 数据库连接失败:', error)
    return false
  }
}

// 导出默认对象
export default {
  // 日记操作
  createDiary,
  getDiary,
  getAllDiaries,
  searchDiaries,
  searchDiariesByTag,
  searchDiariesByMood,
  searchDiariesByDateRange,
  getAllTags,
  getAllMoods,
  updateDiary,
  deleteDiary,
  
  // 配置操作
  getConfig,
  setConfig,
  getAllConfig,
  deleteConfig,
  
  // 导入导出
  exportAllData,
  importAllData,
  
  // 工具
  clearAllData,
  getDatabaseStats,
  checkDatabaseHealth,
  formatChineseDate,
  formatDate
}
