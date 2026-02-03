<template>
  <div class="settings">
    <!-- 页面标题 -->
    <header class="settings__header">
      <h1 class="page-title">设置</h1>
      <p class="page-subtitle">配置您的数字文房</p>
    </header>
    
    <!-- 墨迹分隔线 -->
    <div class="ink-divider"></div>
    
    <!-- 设置内容 -->
    <div class="settings__content">
      <!-- AI 配置模块 -->
      <section class="settings-section">
        <h2 class="section-title">
          <span class="section-icon">🤖</span>
          AI 配置
        </h2>
        <p class="section-desc">配置您的 OpenAI API 或兼容接口，用于生成灵感内容</p>
        
        <div class="form-group">
          <label for="apiBaseUrl" class="form-label">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
            API Base URL
          </label>
          <input
            id="apiBaseUrl"
            v-model="config.apiBaseUrl"
            type="text"
            placeholder="https://api.openai.com/v1"
            class="form-input"
          />
          <p class="input-hint">支持 OpenAI 官方 API 或兼容接口（如 Azure、第三方代理）</p>
        </div>
        
        <div class="form-group">
          <label for="apiKey" class="form-label">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            API Key
          </label>
          <div class="password-input-wrapper">
            <input
              id="apiKey"
              v-model="config.apiKey"
              :type="showApiKey ? 'text' : 'password'"
              placeholder="sk-..."
              class="form-input"
            />
            <button 
              type="button" 
              class="toggle-password"
              @click="showApiKey = !showApiKey"
            >
              {{ showApiKey ? '🙈' : '👁' }}
            </button>
          </div>
          <p class="input-hint">您的 API Key 仅存储在本地，不会上传到任何服务器</p>
        </div>
        
        <div class="form-group">
          <label for="aiModel" class="form-label">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>
            默认模型
          </label>
          <div class="model-input-wrapper">
            <select id="aiModel" v-model="selectedModel" class="form-select" @change="handleModelChange">
              <option value="gpt-4o-mini">GPT-4o Mini（推荐，性价比高）</option>
              <option value="gpt-4o">GPT-4o（最强性能）</option>
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo（经济实惠）</option>
              <option value="custom">自定义模型...</option>
            </select>
            <input
              v-if="selectedModel === 'custom'"
              v-model="config.aiModel"
              type="text"
              placeholder="请输入模型名称"
              class="form-input custom-model-input"
            />
            <input
              v-else
              v-model="config.aiModel"
              type="hidden"
            />
          </div>
          <p class="input-hint">选择预设模型或手动输入自定义模型名称（如 deepseek-chat 等）</p>
        </div>
        
        <div class="form-actions">
          <InkButton
            text="测试连接"
            icon="🔌"
            variant="ghost"
            :loading="testing"
            @click="testConnection"
          />
          <InkButton
            text="保存配置"
            icon="💾"
            variant="primary"
            @click="saveAIConfig"
          />
        </div>
        
        <div v-if="testResult" class="test-result" :class="testResult.success ? 'success' : 'error'">
          <span class="result-icon">
            <span v-if="testResult.success">✓</span>
            <span v-else>✕</span>
          </span>
          <span>{{ testResult.message }}</span>
        </div>
      </section>
      

      
      <!-- 本地安全模块 -->
      <section class="settings-section">
        <h2 class="section-title">
          <span class="section-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          </span>
          本地安全
        </h2>
        <p class="section-desc">设置本地数据加密密码，增强数据安全性</p>
        
        <div class="form-group">
          <label class="form-label">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            本地加密密码
          </label>
          <div class="password-input-wrapper">
            <input
              v-model="localPassword"
              :type="showLocalPassword ? 'text' : 'password'"
              placeholder="设置本地加密密码（可选）"
              class="form-input"
            />
            <button 
              type="button" 
              class="toggle-password"
              @click="showLocalPassword = !showLocalPassword"
            >
              {{ showLocalPassword ? '🙈' : '👁' }}
            </button>
          </div>
          <p class="input-hint">
            {{ hasLocalPassword ? '已设置本地加密密码，日记内容和API密钥将被加密存储' : '设置密码后，日记内容和API密钥将在本地加密存储（可选）' }}
          </p>
        </div>
        
        <div class="form-actions">
          <InkButton
            text="保存密码"
            variant="secondary"
            :disabled="!localPassword && !hasLocalPassword"
            @click="saveLocalPassword"
          />
          <InkButton
            v-if="hasLocalPassword"
            text="清除密码"
            variant="ghost"
            @click="clearLocalPassword"
          />
        </div>
        
        <div class="security-info">
          <p>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            即使不设置密码，日记内容也会使用应用内置密钥进行基础加密
          </p>
        </div>
      </section>
      
      <!-- 数据管理模块 -->
      <section class="settings-section">
        <h2 class="section-title">
          <span class="section-icon">💾</span>
          数据管理
        </h2>
        
        <div class="data-actions">
          <div class="data-action-item">
            <div class="action-icon-wrapper export">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </div>
            <div class="action-info">
              <h4>加密导出</h4>
              <p>导出所有数据并使用密码加密保护</p>
            </div>
            <InkButton
              text="导出"
              variant="secondary"
              size="small"
              @click="showExportDialog = true"
            />
          </div>
          
          <div class="data-action-item">
            <div class="action-icon-wrapper import">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            </div>
            <div class="action-info">
              <h4>导入恢复</h4>
              <p>从加密备份恢复，自动合并相同内容</p>
            </div>
            <InkButton
              text="导入"
              variant="secondary"
              size="small"
              @click="triggerImport"
            />
          </div>
          
          <div class="data-action-item danger">
            <div class="action-icon-wrapper clear">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </div>
            <div class="action-info">
              <h4>清空数据</h4>
              <p class="danger-text">⚠️ 删除所有数据，此操作不可恢复</p>
            </div>
            <InkButton
              text="清空"
              variant="secondary"
              size="small"
              @click="showClearConfirm = true"
            />
          </div>
        </div>
        
        <div class="storage-info">
          <p>当前存储：{{ stats.diaryCount }} 篇日记，{{ stats.configCount }} 项配置</p>
        </div>
        
        <!-- 隐藏的文件输入 -->
        <input
          ref="importInput"
          type="file"
          accept=".json"
          class="hidden"
          @change="handleImportFileSelect"
        />
      </section>
      
      <!-- 关于与法律声明模块 -->
      <section class="settings-section about-section">
        <div class="about-content">
          <div class="about-logo">
            <div class="logo-circle">
              <span class="logo-icon">墨</span>
            </div>
            <h3>墨记</h3>
            <span class="version-badge">v3.0.0</span>
          </div>
          
          <div class="about-description serious">
            <h4>软件说明</h4>
            <p>墨记（Ink Diary）是一款基于 Web 技术的本地日记应用。本软件采用 MIT 开源许可证发布，源代码可在遵循许可证条款的前提下自由使用、修改和分发。</p>
          </div>
          
          <div class="legal-notice">
            <h4>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              法律声明与免责声明
            </h4>
            <div class="legal-content">
              <div class="legal-section">
                <h5>开源许可</h5>
                <p>本项目采用 MIT 许可证开源。软件按"原样"提供，不作任何明示或暗示的担保，包括但不限于对适销性、特定用途适用性和非侵权性的担保。</p>
              </div>
              <div class="legal-section">
                <h5>AI 生成内容声明</h5>
                <p>本软件集成了人工智能功能，部分代码由 AI 辅助生成。作者不对 AI 生成内容的准确性、完整性或适用性承担任何责任。AI 生成的日记内容可能包含错误或不适当信息，用户应自行判断和核实。</p>
              </div>
              <div class="legal-section">
                <h5>数据安全声明</h5>
                <p>尽管本软件实现了本地数据加密功能，但作者不对因使用本软件导致的任何数据丢失、泄露或损坏承担责任。用户应定期备份重要数据。</p>
              </div>
              <div class="legal-section">
                <h5>第三方服务</h5>
                <p>本软件支持与第三方 AI 服务（如 OpenAI）集成。作者不对这些第三方服务的可用性、隐私政策或数据处理行为承担任何责任。使用 AI 功能时，您的数据将受第三方服务提供商的条款约束。</p>
              </div>
              <div class="legal-section warning">
                <h5>责任限制</h5>
                <p>在任何情况下，作者均不对因使用或无法使用本软件而导致的任何直接、间接、附带、特殊或后果性损害承担责任，即使已被告知可能发生此类损害。</p>
              </div>
            </div>
          </div>
          
          <div class="about-features compact">
            <div class="feature-item">
              <div class="feature-icon-wrapper">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <span>本地加密存储</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon-wrapper">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                  <path d="M2 17l10 5 10-5"></path>
                  <path d="M2 12l10 5 10-5"></path>
                </svg>
              </div>
              <span>AI 辅助创作</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon-wrapper">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
                </svg>
              </div>
              <span>加密备份恢复</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon-wrapper">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <span>日记管理</span>
            </div>
          </div>
          
          <p class="copyright">墨记 Ink Diary v3.0.0 · MIT License · 部分代码由 AI 辅助生成</p>
        </div>
      </section>
    </div>
    
    <!-- AI 免责声明对话框 -->
    <div v-if="showDisclaimerDialog" class="dialog-overlay disclaimer-overlay" @click.self>
      <div class="confirm-dialog disclaimer-dialog">
        <h3>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          AI 功能免责声明
        </h3>
        <div class="disclaimer-content">
          <div class="disclaimer-section warning">
            <h4>⚠️ 数据上传警告</h4>
            <p>使用 AI 功能时，您的以下数据将被发送到您配置的 AI 服务提供商（如 OpenAI、Azure 等）：</p>
            <ul>
              <li>日记标题和正文内容</li>
              <li>选择的心情标签和视觉风格</li>
              <li>系统提示词和用户提示词模板</li>
            </ul>
          </div>
          
          <div class="disclaimer-section">
            <h4>🔒 隐私风险说明</h4>
            <ul>
              <li>您的日记内容将离开本地设备，传输到第三方服务器</li>
              <li>数据将受 AI 服务提供商的隐私政策约束</li>
              <li>请勿在 AI 功能中输入高度敏感或机密信息</li>
              <li>本地存储的日记始终加密保存在您的设备上</li>
            </ul>
          </div>
          
          <div class="disclaimer-section">
            <h4>📋 免责声明</h4>
            <ul>
              <li>作者不对 AI 服务提供商的数据处理行为承担任何责任</li>
              <li>用户需自行评估并承担使用 AI 功能的风险</li>
              <li>建议仔细阅读所配置的 AI 服务提供商的隐私政策</li>
            </ul>
          </div>
          
          <div class="disclaimer-timer" v-if="disclaimerCountdown > 0">
            请仔细阅读以上内容（{{ disclaimerCountdown }}秒）
          </div>
        </div>
        
        <div class="disclaimer-checkbox">
          <label class="checkbox-label">
            <input
              v-model="disclaimerChecked"
              type="checkbox"
              :disabled="disclaimerCountdown > 0"
            />
            <span>我已阅读并知晓上述风险，自愿承担使用 AI 功能的责任</span>
          </label>
        </div>
        
        <div class="dialog-actions">
          <InkButton 
            text="取消" 
            variant="ghost" 
            @click="cancelDisclaimer" 
          />
          <InkButton 
            text="确认并保存" 
            variant="primary" 
            :disabled="disclaimerCountdown > 0 || !disclaimerChecked"
            @click="confirmDisclaimer" 
          />
        </div>
      </div>
    </div>
    
    <!-- 导出密码对话框 -->
    <div v-if="showExportDialog" class="dialog-overlay" @click.self="cancelExport">
      <div class="confirm-dialog">
        <h3>加密导出数据</h3>
        <p>请设置导出密码，用于保护您的备份文件。密码长度至少6位。</p>
        <div class="password-input-group">
          <input
            v-model="exportPassword"
            type="password"
            placeholder="设置导出密码"
            class="form-input"
            @keyup.enter="confirmExport"
          />
          <input
            v-model="exportPasswordConfirm"
            type="password"
            placeholder="确认密码"
            class="form-input"
            @keyup.enter="confirmExport"
          />
          <p v-if="passwordError" class="error-text">{{ passwordError }}</p>
          <p v-else-if="exportPassword" class="password-strength" :class="passwordStrengthClass">
            {{ passwordStrengthText }}
          </p>
        </div>
        <div class="dialog-actions">
          <InkButton text="取消" variant="ghost" @click="cancelExport" />
          <InkButton 
            text="确认导出" 
            variant="primary" 
            :loading="exporting"
            :disabled="!canExport"
            @click="confirmExport" 
          />
        </div>
      </div>
    </div>
    
    <!-- 导入密码对话框 -->
    <div v-if="showImportPasswordDialog" class="dialog-overlay" @click.self="cancelImportPassword">
      <div class="confirm-dialog">
        <h3>解密导入数据</h3>
        <p>请输入备份文件的解密密码。系统将自动合并与现有数据重复的内容。</p>
        <div class="password-input-group">
          <input
            v-model="importPassword"
            type="password"
            placeholder="输入解密密码"
            class="form-input"
            @keyup.enter="confirmImport"
          />
          <p v-if="importError" class="error-text">{{ importError }}</p>
        </div>
        <div class="dialog-actions">
          <InkButton text="取消" variant="ghost" @click="cancelImportPassword" />
          <InkButton 
            text="确认导入" 
            variant="primary" 
            :loading="importing"
            :disabled="!importPassword"
            @click="confirmImport" 
          />
        </div>
      </div>
    </div>
    
    <!-- 导入结果对话框 -->
    <div v-if="showImportResult" class="dialog-overlay" @click.self="closeImportResult">
      <div class="confirm-dialog">
        <h3>导入完成</h3>
        <div class="import-result">
          <div class="result-item success">
            <span class="result-number">{{ importResult.added }}</span>
            <span class="result-label">新增日记</span>
          </div>
          <div class="result-item info">
            <span class="result-number">{{ importResult.updated }}</span>
            <span class="result-label">更新日记</span>
          </div>
          <div class="result-item">
            <span class="result-number">{{ importResult.skipped }}</span>
            <span class="result-label">跳过重复</span>
          </div>
        </div>
        <p class="result-detail">
          配置项：{{ importResult.importedConfig }} 项 · 提示词：{{ importResult.importedPrompts }} 项
        </p>
        <div class="dialog-actions">
          <InkButton text="确定" variant="primary" @click="closeImportResult" />
        </div>
      </div>
    </div>
    
    <!-- 清空确认对话框 -->
    <div v-if="showClearConfirm" class="dialog-overlay" @click.self="cancelClear">
      <div class="confirm-dialog">
        <h3>确认清空所有数据</h3>
        <p>此操作将永久删除所有日记、配置和提示词设置，不可恢复。是否继续？</p>
        <div class="dialog-actions">
          <InkButton text="取消" variant="ghost" @click="cancelClear" />
          <InkButton text="确认清空" variant="primary" @click="doClear" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { 
  getConfig, 
  setConfig, 
  exportAllData, 
  importAllData, 
  clearAllData,
  getDatabaseStats,
  setLocalEncryptionPassword
} from '../modules/db.js'
import { testAIConnection } from '../modules/ai-client.js'
import { encryptData, decryptData, validatePassword, clearLocalStorageKey } from '../modules/crypto.js'
import InkButton from '../components/InkButton.vue'

/**
 * Settings - 设置页面
 * 
 * 功能：
 * - AI API 配置（Base URL、API Key、模型选择）
 * - 样式设置（夜读模式、默认竖排）
 * - 数据管理（导出、导入、清空）
 * - 应用信息展示
 */

// 配置状态
const config = reactive({
  apiBaseUrl: '',
  apiKey: '',
  aiModel: 'gpt-4o-mini',
  darkMode: false,
  defaultVertical: false
})

// UI 状态
const showApiKey = ref(false)
const testing = ref(false)
const testResult = ref(null)
const showClearConfirm = ref(false)
const stats = reactive({
  diaryCount: 0,
  configCount: 0
})

// 模型选择状态
const selectedModel = ref('gpt-4o-mini')

// 导出相关状态
const showExportDialog = ref(false)
const exportPassword = ref('')
const exportPasswordConfirm = ref('')
const passwordError = ref('')
const exporting = ref(false)

// 导入相关状态
const importInput = ref(null)
const showImportPasswordDialog = ref(false)
const importPassword = ref('')
const importError = ref('')
const importing = ref(false)
const selectedImportFile = ref(null)
const showImportResult = ref(false)
const importResult = reactive({
  added: 0,
  updated: 0,
  skipped: 0,
  importedConfig: 0,
  importedPrompts: 0
})

// 本地加密密码状态
const localPassword = ref('')
const showLocalPassword = ref(false)
const hasLocalPassword = ref(false)

// AI 免责声明状态
const showDisclaimerDialog = ref(false)
const disclaimerChecked = ref(false)
const disclaimerCountdown = ref(10)
let disclaimerTimer = null
let pendingSaveConfig = null

// 处理模型选择变化
function handleModelChange() {
  if (selectedModel.value !== 'custom') {
    config.aiModel = selectedModel.value
  }
}

// 加载配置时同步模型选择
function syncModelSelection() {
  const presetModels = ['gpt-4o-mini', 'gpt-4o', 'gpt-4', 'gpt-3.5-turbo']
  if (presetModels.includes(config.aiModel)) {
    selectedModel.value = config.aiModel
  } else {
    selectedModel.value = 'custom'
  }
}

// 加载配置
async function loadConfig() {
  config.apiBaseUrl = await getConfig('apiBaseUrl', '')
  config.apiKey = await getConfig('apiKey', '')
  config.aiModel = await getConfig('aiModel', 'gpt-4o-mini')
  config.darkMode = await getConfig('darkMode', false)
  config.defaultVertical = await getConfig('defaultVertical', false)
  
  // 同步模型选择
  syncModelSelection()
  
  // 应用夜读模式
  if (config.darkMode) {
    document.body.classList.add('night-mode')
  }
  
  console.log('[Settings] 配置已加载')
}

// 加载统计信息
async function loadStats() {
  const databaseStats = await getDatabaseStats()
  stats.diaryCount = databaseStats.diaryCount
  stats.configCount = databaseStats.configCount
}

// 保存 AI 配置
async function saveAIConfig() {
  // 检查是否已经同意免责声明
  const hasAgreed = await getConfig('aiDisclaimerAgreed', false)
  
  if (!hasAgreed) {
    // 显示免责声明对话框
    pendingSaveConfig = { ...config }
    showDisclaimerDialog.value = true
    disclaimerChecked.value = false
    disclaimerCountdown.value = 10
    startDisclaimerTimer()
    return
  }
  
  await doSaveAIConfig()
}

// 实际保存 AI 配置
async function doSaveAIConfig() {
  try {
    await setConfig('apiBaseUrl', config.apiBaseUrl.trim())
    await setConfig('apiKey', config.apiKey.trim())
    await setConfig('aiModel', config.aiModel)
    alert('配置已保存')
    console.log('[Settings] AI 配置已保存')
  } catch (error) {
    console.error('[Settings] 保存配置失败:', error)
    alert('保存失败: ' + error.message)
  }
}

// 启动免责声明倒计时
function startDisclaimerTimer() {
  disclaimerTimer = setInterval(() => {
    if (disclaimerCountdown.value > 0) {
      disclaimerCountdown.value--
    } else {
      clearInterval(disclaimerTimer)
    }
  }, 1000)
}

// 取消免责声明
function cancelDisclaimer() {
  showDisclaimerDialog.value = false
  disclaimerChecked.value = false
  disclaimerCountdown.value = 10
  pendingSaveConfig = null
  if (disclaimerTimer) {
    clearInterval(disclaimerTimer)
    disclaimerTimer = null
  }
}

// 确认免责声明并保存
async function confirmDisclaimer() {
  if (!disclaimerChecked.value || disclaimerCountdown.value > 0) return
  
  try {
    // 记录用户已同意
    await setConfig('aiDisclaimerAgreed', true)
    
    // 关闭对话框
    showDisclaimerDialog.value = false
    disclaimerChecked.value = false
    if (disclaimerTimer) {
      clearInterval(disclaimerTimer)
      disclaimerTimer = null
    }
    
    // 执行保存
    await doSaveAIConfig()
    
    console.log('[Settings] 用户已同意 AI 免责声明')
  } catch (error) {
    console.error('[Settings] 保存免责声明状态失败:', error)
    alert('保存失败: ' + error.message)
  }
}

// 测试 AI 连接
async function testConnection() {
  testing.value = true
  testResult.value = null
  
  try {
    // 先保存当前配置
    await saveAIConfig()
    
    // 测试连接
    const result = await testAIConnection()
    testResult.value = result
    console.log('[Settings] 连接测试结果:', result)
  } catch (error) {
    testResult.value = {
      success: false,
      message: '测试失败: ' + error.message
    }
  } finally {
    testing.value = false
  }
}

// 切换夜读模式
function toggleDarkMode() {
  if (config.darkMode) {
    document.body.classList.add('night-mode')
  } else {
    document.body.classList.remove('night-mode')
  }
  setConfig('darkMode', config.darkMode)
}

// 密码强度计算
const passwordStrength = computed(() => {
  if (!exportPassword.value) return { strength: 0, text: '' }
  return validatePassword(exportPassword.value)
})

const passwordStrengthClass = computed(() => {
  const strength = passwordStrength.value.strength
  if (strength === 0) return ''
  if (strength === 1) return 'weak'
  if (strength === 2) return 'medium'
  return 'strong'
})

const passwordStrengthText = computed(() => {
  return passwordStrength.value.message
})

const canExport = computed(() => {
  return exportPassword.value.length >= 6 && 
         exportPassword.value === exportPasswordConfirm.value
})

// 取消导出
function cancelExport() {
  showExportDialog.value = false
  exportPassword.value = ''
  exportPasswordConfirm.value = ''
  passwordError.value = ''
}

// 确认导出
async function confirmExport() {
  if (!canExport.value) {
    if (exportPassword.value.length < 6) {
      passwordError.value = '密码长度至少为 6 个字符'
    } else if (exportPassword.value !== exportPasswordConfirm.value) {
      passwordError.value = '两次输入的密码不一致'
    }
    return
  }
  
  exporting.value = true
  passwordError.value = ''
  
  try {
    // 获取数据
    const data = await exportAllData()
    
    // 加密数据
    const encryptedData = await encryptData(data, exportPassword.value)
    
    // 下载文件
    const blob = new Blob([JSON.stringify(encryptedData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `ink-diary-backup-${new Date().toISOString().split('T')[0]}.encrypted.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    
    URL.revokeObjectURL(url)
    
    // 关闭对话框
    cancelExport()
    console.log('[Settings] 数据已加密导出')
  } catch (error) {
    console.error('[Settings] 导出失败:', error)
    passwordError.value = '导出失败: ' + error.message
  } finally {
    exporting.value = false
  }
}

// 触发导入
function triggerImport() {
  importInput.value?.click()
}

// 处理导入文件选择
async function handleImportFileSelect(event) {
  const file = event.target.files[0]
  if (!file) return
  
  selectedImportFile.value = file
  importPassword.value = ''
  importError.value = ''
  showImportPasswordDialog.value = true
  
  // 清空 input 以便可以再次选择同一文件
  event.target.value = ''
}

// 取消导入密码输入
function cancelImportPassword() {
  showImportPasswordDialog.value = false
  importPassword.value = ''
  importError.value = ''
  selectedImportFile.value = null
}

// 确认导入
async function confirmImport() {
  if (!importPassword.value || !selectedImportFile.value) return
  
  importing.value = true
  importError.value = ''
  
  try {
    // 读取文件
    const text = await selectedImportFile.value.text()
    const encryptedData = JSON.parse(text)
    
    // 解密数据
    const data = await decryptData(encryptedData, importPassword.value)
    
    // 导入数据（自动合并）
    const result = await importAllData(data, { merge: true })
    
    // 保存结果
    Object.assign(importResult, result)
    
    // 关闭密码对话框，显示结果
    showImportPasswordDialog.value = false
    showImportResult.value = true
    
    // 重新加载
    await loadConfig()
    await loadStats()
    
    console.log('[Settings] 数据已导入:', result)
  } catch (error) {
    console.error('[Settings] 导入失败:', error)
    importError.value = error.message
  } finally {
    importing.value = false
  }
}

// 关闭导入结果
function closeImportResult() {
  showImportResult.value = false
  selectedImportFile.value = null
  importPassword.value = ''
}

// 确认清空
function confirmClear() {
  showClearConfirm.value = true
}

// 取消清空
function cancelClear() {
  showClearConfirm.value = false
}

// 执行清空
async function doClear() {
  try {
    await clearAllData()
    alert('所有数据已清空')
    showClearConfirm.value = false
    
    // 重新加载
    await loadStats()
    
    console.log('[Settings] 数据已清空')
  } catch (error) {
    console.error('[Settings] 清空失败:', error)
    alert('清空失败: ' + error.message)
  }
}

// 保存本地加密密码
async function saveLocalPassword() {
  try {
    if (localPassword.value) {
      // 设置新密码
      setLocalEncryptionPassword(localPassword.value)
      await setConfig('localEncryptionEnabled', true)
      hasLocalPassword.value = true
      alert('本地加密密码已设置，日记内容和API密钥将被加密存储')
    }
    localPassword.value = ''
    console.log('[Settings] 本地加密密码已保存')
  } catch (error) {
    console.error('[Settings] 保存本地密码失败:', error)
    alert('保存失败: ' + error.message)
  }
}

// 清除本地加密密码
async function clearLocalPassword() {
  try {
    setLocalEncryptionPassword(null)
    clearLocalStorageKey()
    await setConfig('localEncryptionEnabled', false)
    hasLocalPassword.value = false
    localPassword.value = ''
    alert('本地加密密码已清除')
    console.log('[Settings] 本地加密密码已清除')
  } catch (error) {
    console.error('[Settings] 清除本地密码失败:', error)
    alert('清除失败: ' + error.message)
  }
}

// 加载本地加密状态
async function loadLocalEncryptionStatus() {
  const enabled = await getConfig('localEncryptionEnabled', false)
  hasLocalPassword.value = enabled
}

// 组件挂载时初始化
onMounted(() => {
  loadConfig()
  loadStats()
  loadLocalEncryptionStatus()
})
</script>

<style scoped>
/* 设置页面容器 */
.settings {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

/* 页面标题 */
.settings__header {
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

/* 分隔线 */
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
.settings__content {
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

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: "LXGW WenKai", serif;
  font-size: 1.25rem;
  font-weight: 400;
  color: var(--ink-dark);
  margin-bottom: 0.5rem;
}

.section-icon {
  font-size: 1.25rem;
}

.section-desc {
  font-family: "LXGW WenKai", serif;
  font-size: 0.875rem;
  color: var(--ink-sandalwood);
  margin-bottom: 1.5rem;
}

/* 表单组 */
.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  font-family: "LXGW WenKai", serif;
  font-size: 0.9375rem;
  color: var(--ink-dark);
  margin-bottom: 0.375rem;
}

.form-input,
.form-select {
  width: 100%;
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

.input-hint {
  font-family: "LXGW WenKai", serif;
  font-size: 0.8125rem;
  color: var(--ink-sandalwood);
  margin-top: 0.25rem;
}

/* 密码输入框 */
.password-input-wrapper {
  position: relative;
}

.password-input-wrapper .form-input {
  padding-right: 2.5rem;
}

.toggle-password {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  opacity: 0.6;
  transition: opacity 0.3s;
}

.toggle-password:hover {
  opacity: 1;
}

/* 模型输入包装器 */
.model-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.custom-model-input {
  margin-top: 0.25rem;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .model-input-wrapper {
    width: 100%;
  }
}

/* 表单操作 */
.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

/* 测试结果 */
.test-result {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 2px;
  font-family: "LXGW WenKai", serif;
  font-size: 0.875rem;
}

.test-result.success {
  background-color: rgba(85, 107, 47, 0.1);
  color: var(--ink-green);
}

.test-result.error {
  background-color: rgba(139, 69, 19, 0.1);
  color: var(--ink-ochre);
}

.result-icon {
  font-weight: bold;
}

/* 设置项 */
.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
  border-bottom: 1px solid var(--ink-rice);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info label {
  display: block;
  font-family: "LXGW WenKai", serif;
  font-size: 1rem;
  color: var(--ink-dark);
  margin-bottom: 0.25rem;
}

.setting-info p {
  font-family: "LXGW WenKai", serif;
  font-size: 0.875rem;
  color: var(--ink-sandalwood);
}

/* 开关样式 */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--ink-rice);
  transition: 0.3s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: var(--ink-paper);
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: var(--ink-ochre);
}

input:checked + .toggle-slider:before {
  transform: translateX(24px);
}

/* 数据操作 */
.data-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.data-action-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background-color: var(--ink-hover);
  border-radius: 2px;
}

.data-action-item.danger {
  background-color: rgba(139, 69, 19, 0.05);
}

.action-info h4 {
  font-family: "LXGW WenKai", serif;
  font-size: 1rem;
  font-weight: 400;
  color: var(--ink-dark);
  margin-bottom: 0.25rem;
}

.action-info p {
  font-family: "LXGW WenKai", serif;
  font-size: 0.875rem;
  color: var(--ink-sandalwood);
}

.data-action-item.danger .action-info h4 {
  color: var(--ink-ochre);
}

.storage-info {
  margin-top: 1rem;
  text-align: center;
}

.storage-info p {
  font-family: "LXGW WenKai", serif;
  font-size: 0.875rem;
  color: var(--ink-sandalwood);
}

/* 关于内容 */
.about-content {
  text-align: center;
}

.app-logo {
  margin-bottom: 1.5rem;
}

.logo-icon {
  font-size: 4rem;
  display: block;
  margin-bottom: 0.5rem;
}

.app-logo h3 {
  font-family: "LXGW WenKai", serif;
  font-size: 1.5rem;
  font-weight: 400;
  color: var(--ink-dark);
  margin-bottom: 0.25rem;
}

.version {
  font-family: "LXGW WenKai", serif;
  font-size: 0.875rem;
  color: var(--ink-sandalwood);
}

.about-desc {
  font-family: "LXGW WenKai", serif;
  font-size: 0.9375rem;
  color: var(--ink-dark);
  line-height: 1.8;
  margin-bottom: 1.5rem;
  text-align: left;
}

.about-features {
  text-align: left;
  margin-bottom: 1.5rem;
}

.about-features h4 {
  font-family: "LXGW WenKai", serif;
  font-size: 1rem;
  font-weight: 400;
  color: var(--ink-dark);
  margin-bottom: 0.75rem;
}

.about-features ul {
  list-style: none;
  padding: 0;
}

.about-features li {
  font-family: "LXGW WenKai", serif;
  font-size: 0.875rem;
  color: var(--ink-dark);
  padding: 0.375rem 0;
  padding-left: 1.5rem;
  position: relative;
}

.about-features li::before {
  content: "•";
  position: absolute;
  left: 0.5rem;
  color: var(--ink-ochre);
}

.copyright {
  font-family: "LXGW WenKai", serif;
  font-size: 0.8125rem;
  color: var(--ink-sandalwood);
  opacity: 0.7;
}

/* 对话框 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(44, 62, 80, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.confirm-dialog {
  background-color: var(--ink-paper);
  padding: 2rem;
  border-radius: 2px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  text-align: center;
  max-width: 400px;
  width: 90%;
}

.confirm-dialog h3 {
  font-family: "LXGW WenKai", serif;
  font-size: 1.25rem;
  font-weight: 400;
  color: var(--ink-dark);
  margin-bottom: 1rem;
}

.confirm-dialog p {
  font-family: "LXGW WenKai", serif;
  color: var(--ink-sandalwood);
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.dialog-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.hidden {
  display: none;
}

/* 密码输入组 */
.password-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.password-input-group .form-input {
  width: 100%;
  padding: 0.625rem 0.875rem;
  font-family: "LXGW WenKai", serif;
  font-size: 0.9375rem;
  background-color: var(--ink-paper);
  border: 1px solid var(--ink-rice);
  border-radius: 2px;
  outline: none;
}

.password-input-group .form-input:focus {
  border-color: var(--ink-ochre);
  box-shadow: 0 0 0 3px rgba(139, 69, 19, 0.1);
}

.error-text {
  font-family: "LXGW WenKai", serif;
  font-size: 0.875rem;
  color: #dc3545;
  margin: 0;
}

.password-strength {
  font-family: "LXGW WenKai", serif;
  font-size: 0.875rem;
  margin: 0;
}

.password-strength.weak {
  color: #dc3545;
}

.password-strength.medium {
  color: #ffc107;
}

.password-strength.strong {
  color: #28a745;
}

/* 导入结果 */
.import-result {
  display: flex;
  justify-content: space-around;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: rgba(139, 69, 19, 0.05);
  border-radius: 4px;
}

.result-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.result-number {
  font-family: "LXGW WenKai", serif;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--ink-dark);
}

.result-item.success .result-number {
  color: #28a745;
}

.result-item.info .result-number {
  color: var(--ink-ochre);
}

.result-label {
  font-family: "LXGW WenKai", serif;
  font-size: 0.75rem;
  color: var(--ink-sandalwood);
}

.result-detail {
  font-family: "LXGW WenKai", serif;
  font-size: 0.875rem;
  color: var(--ink-sandalwood);
  margin-bottom: 1.5rem;
}

/* 关于模块样式 */
.about-description.serious {
  text-align: left;
  background: rgba(139, 69, 19, 0.03);
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
}

.about-description.serious h4 {
  font-family: "LXGW WenKai", serif;
  font-size: 1rem;
  font-weight: 400;
  color: var(--ink-dark);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.about-description.serious p {
  font-family: "LXGW WenKai", serif;
  font-size: 0.875rem;
  color: var(--ink-sandalwood);
  line-height: 1.7;
  margin: 0;
}

.security-notice {
  text-align: left;
  background: rgba(40, 167, 69, 0.05);
  border: 1px solid rgba(40, 167, 69, 0.2);
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
}

.security-notice h4 {
  font-family: "LXGW WenKai", serif;
  font-size: 1rem;
  font-weight: 400;
  color: #28a745;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.security-notice ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.security-notice li {
  font-family: "LXGW WenKai", serif;
  font-size: 0.8125rem;
  color: var(--ink-dark);
  padding: 0.375rem 0;
}

/* 法律声明 */
.legal-notice {
  text-align: left;
  background: rgba(139, 69, 19, 0.03);
  border: 1px solid var(--ink-rice);
  padding: 1.25rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
}

.legal-notice h4 {
  font-family: "LXGW WenKai", serif;
  font-size: 1rem;
  font-weight: 400;
  color: var(--ink-dark);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--ink-rice);
}

.legal-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.legal-section {
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 3px;
  border-left: 2px solid var(--ink-sandalwood);
}

.legal-section.warning {
  background: rgba(220, 53, 69, 0.03);
  border-left-color: #dc3545;
}

.legal-section h5 {
  font-family: "LXGW WenKai", serif;
  font-size: 0.875rem;
  font-weight: 400;
  color: var(--ink-dark);
  margin-bottom: 0.5rem;
}

.legal-section p {
  font-family: "LXGW WenKai", serif;
  font-size: 0.8125rem;
  color: var(--ink-sandalwood);
  line-height: 1.7;
  margin: 0;
}

.security-notice li {
  padding-left: 1rem;
  position: relative;
  line-height: 1.6;
}

.security-notice li::before {
  content: "•";
  position: absolute;
  left: 0.25rem;
  color: #28a745;
}

.security-notice li strong {
  color: var(--ink-dark);
}

.about-features.compact {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.about-features.compact .feature-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.about-features.compact .feature-icon-wrapper {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(139, 69, 19, 0.1);
  border-radius: 50%;
  color: var(--ink-ochre);
}

.about-features.compact span {
  font-family: "LXGW WenKai", serif;
  font-size: 0.875rem;
  color: var(--ink-sandalwood);
}

/* 安全信息提示 */
.security-info {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: rgba(139, 69, 19, 0.05);
  border-radius: 4px;
  border-left: 3px solid var(--ink-ochre);
}

.security-info p {
  font-family: "LXGW WenKai", serif;
  font-size: 0.8125rem;
  color: var(--ink-sandalwood);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* 免责声明对话框 */
.disclaimer-overlay {
  z-index: 2000;
}

.disclaimer-dialog {
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.disclaimer-dialog h3 {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #dc3545;
}

.disclaimer-dialog h3 svg {
  color: #dc3545;
}

.disclaimer-content {
  text-align: left;
  margin-bottom: 1.5rem;
}

.disclaimer-section {
  margin-bottom: 1.25rem;
  padding: 1rem;
  background: rgba(139, 69, 19, 0.03);
  border-radius: 4px;
  border-left: 3px solid var(--ink-ochre);
}

.disclaimer-section.warning {
  background: rgba(220, 53, 69, 0.05);
  border-left-color: #dc3545;
}

.disclaimer-section h4 {
  font-family: "LXGW WenKai", serif;
  font-size: 0.9375rem;
  font-weight: 400;
  color: var(--ink-dark);
  margin-bottom: 0.75rem;
}

.disclaimer-section p {
  font-family: "LXGW WenKai", serif;
  font-size: 0.875rem;
  color: var(--ink-sandalwood);
  margin-bottom: 0.5rem;
  line-height: 1.6;
}

.disclaimer-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.disclaimer-section li {
  font-family: "LXGW WenKai", serif;
  font-size: 0.8125rem;
  color: var(--ink-dark);
  padding: 0.25rem 0;
  padding-left: 1rem;
  position: relative;
  line-height: 1.6;
}

.disclaimer-section li::before {
  content: "•";
  position: absolute;
  left: 0.25rem;
  color: var(--ink-ochre);
}

.disclaimer-section.warning li::before {
  color: #dc3545;
}

.disclaimer-timer {
  text-align: center;
  padding: 0.75rem;
  background: rgba(255, 193, 7, 0.1);
  border-radius: 4px;
  font-family: "LXGW WenKai", serif;
  font-size: 0.875rem;
  color: #856404;
  margin-top: 1rem;
}

.disclaimer-checkbox {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: rgba(40, 167, 69, 0.05);
  border-radius: 4px;
  border: 1px solid rgba(40, 167, 69, 0.2);
}

.disclaimer-checkbox .checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
}

.disclaimer-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  margin-top: 2px;
  cursor: pointer;
}

.disclaimer-checkbox input[type="checkbox"]:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.disclaimer-checkbox span {
  font-family: "LXGW WenKai", serif;
  font-size: 0.875rem;
  color: var(--ink-dark);
  line-height: 1.5;
}

/* 响应式 */
@media (max-width: 768px) {
  .settings {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .settings-section {
    padding: 1rem;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .data-action-item {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .dialog-actions {
    flex-direction: column;
  }
}
</style>
