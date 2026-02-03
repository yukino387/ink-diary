/**
 * 墨记 - 加密工具模块 (crypto.js)
 * 使用 Web Crypto API 实现数据加密/解密
 * 
 * 安全特性：
 * - 使用 PBKDF2 从密码派生密钥
 * - 使用 AES-GCM 进行对称加密
 * - 随机生成 salt 和 IV
 * - 支持密码强度验证
 */

const SALT_LENGTH = 16
const IV_LENGTH = 12
const KEY_LENGTH = 256
const ITERATIONS = 100000

/**
 * 从密码派生加密密钥
 * @param {string} password - 用户密码
 * @param {Uint8Array} salt - 随机盐值
 * @returns {Promise<CryptoKey>} 派生的密钥
 */
async function deriveKey(password, salt) {
  const encoder = new TextEncoder()
  const passwordData = encoder.encode(password)
  
  // 导入密码为原始密钥材料
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordData,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )
  
  // 使用 PBKDF2 派生 AES-GCM 密钥
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  )
  
  return key
}

/**
 * 加密数据
 * @param {object} data - 要加密的数据对象
 * @param {string} password - 加密密码
 * @returns {Promise<object>} 加密后的数据包
 */
export async function encryptData(data, password) {
  try {
    // 生成随机盐值和 IV
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
    
    // 派生密钥
    const key = await deriveKey(password, salt)
    
    // 序列化数据
    const encoder = new TextEncoder()
    const plaintext = encoder.encode(JSON.stringify(data))
    
    // 加密数据
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      plaintext
    )
    
    // 构建加密包
    const encryptedPackage = {
      version: '2.0.0',
      encrypted: true,
      salt: Array.from(salt),
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(ciphertext))
    }
    
    return encryptedPackage
  } catch (error) {
    console.error('[Crypto] 加密失败:', error)
    throw new Error('加密失败: ' + error.message)
  }
}

/**
 * 解密数据
 * @param {object} encryptedPackage - 加密的数据包
 * @param {string} password - 解密密码
 * @returns {Promise<object>} 解密后的数据
 */
export async function decryptData(encryptedPackage, password) {
  try {
    // 检查是否为加密格式
    if (!encryptedPackage.encrypted) {
      // 未加密数据，直接返回
      return encryptedPackage
    }
    
    // 提取 salt、iv 和密文
    const salt = new Uint8Array(encryptedPackage.salt)
    const iv = new Uint8Array(encryptedPackage.iv)
    const ciphertext = new Uint8Array(encryptedPackage.data)
    
    // 派生密钥
    const key = await deriveKey(password, salt)
    
    // 解密数据
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      ciphertext
    )
    
    // 解析数据
    const decoder = new TextDecoder()
    const jsonString = decoder.decode(decrypted)
    const data = JSON.parse(jsonString)
    
    return data
  } catch (error) {
    console.error('[Crypto] 解密失败:', error)
    if (error.name === 'OperationError') {
      throw new Error('密码错误或数据已损坏')
    }
    throw new Error('解密失败: ' + error.message)
  }
}

/**
 * 验证密码强度
 * @param {string} password - 密码
 * @returns {object} 验证结果 { valid: boolean, message: string, strength: number }
 */
export function validatePassword(password) {
  if (!password || password.length < 6) {
    return {
      valid: false,
      message: '密码长度至少为 6 个字符',
      strength: 0
    }
  }
  
  let strength = 0
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  }
  
  strength = Object.values(checks).filter(Boolean).length
  
  if (strength < 2) {
    return {
      valid: true,
      message: '密码强度：弱',
      strength: 1
    }
  } else if (strength < 4) {
    return {
      valid: true,
      message: '密码强度：中',
      strength: 2
    }
  } else {
    return {
      valid: true,
      message: '密码强度：强',
      strength: 3
    }
  }
}

/**
 * 检查数据是否已加密
 * @param {object} data - 数据对象
 * @returns {boolean} 是否已加密
 */
export function isEncrypted(data) {
  return data && data.encrypted === true
}

// ========================================
// 本地存储加密（用于 IndexedDB 数据保护）
// ========================================

// 应用基础密钥（派生自应用名称和版本）
const APP_BASE_KEY = 'InkDiary-v2.0.0-LocalStorageKey'

// 本地存储加密密钥（缓存）
let localStorageKey = null

/**
 * 获取或创建本地存储加密密钥
 * @param {string} [userPassword] - 用户设置的本地密码（可选）
 * @returns {Promise<CryptoKey>} 加密密钥
 */
async function getLocalStorageKey(userPassword = null) {
  if (localStorageKey) {
    return localStorageKey
  }
  
  const encoder = new TextEncoder()
  const baseKeyData = encoder.encode(APP_BASE_KEY + (userPassword || ''))
  
  // 使用 SHA-256 哈希生成固定长度的密钥材料
  const hashBuffer = await crypto.subtle.digest('SHA-256', baseKeyData)
  
  // 导入为 AES-GCM 密钥
  localStorageKey = await crypto.subtle.importKey(
    'raw',
    hashBuffer,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
  
  return localStorageKey
}

/**
 * 清除本地存储密钥缓存（用于密码更改后）
 */
export function clearLocalStorageKey() {
  localStorageKey = null
}

/**
 * 加密本地存储数据（字段级别）
 * @param {string} plaintext - 要加密的明文
 * @param {string} [userPassword] - 用户设置的本地密码（可选）
 * @returns {Promise<object>} 加密后的数据对象
 */
export async function encryptLocalData(plaintext, userPassword = null) {
  try {
    if (!plaintext) return plaintext
    
    const key = await getLocalStorageKey(userPassword)
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
    
    const encoder = new TextEncoder()
    const data = encoder.encode(plaintext)
    
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      data
    )
    
    return {
      _enc: true,
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(ciphertext))
    }
  } catch (error) {
    console.error('[Crypto] 本地加密失败:', error)
    throw new Error('本地加密失败: ' + error.message)
  }
}

/**
 * 解密本地存储数据（字段级别）
 * @param {object|string} encryptedData - 加密的数据对象或明文
 * @param {string} [userPassword] - 用户设置的本地密码（可选）
 * @returns {Promise<string>} 解密后的明文
 */
export async function decryptLocalData(encryptedData, userPassword = null) {
  try {
    // 如果不是加密对象，直接返回
    if (!encryptedData || typeof encryptedData !== 'object' || !encryptedData._enc) {
      return encryptedData
    }
    
    const key = await getLocalStorageKey(userPassword)
    const iv = new Uint8Array(encryptedData.iv)
    const ciphertext = new Uint8Array(encryptedData.data)
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      ciphertext
    )
    
    const decoder = new TextDecoder()
    return decoder.decode(decrypted)
  } catch (error) {
    console.error('[Crypto] 本地解密失败:', error)
    // 如果解密失败，返回原始数据（可能是未加密的数据）
    return encryptedData
  }
}

/**
 * 检查数据是否为本地加密格式
 * @param {*} data - 数据
 * @returns {boolean} 是否为加密格式
 */
export function isLocalEncrypted(data) {
  return data && typeof data === 'object' && data._enc === true
}
