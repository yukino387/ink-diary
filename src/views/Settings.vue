<template>
  <div class="settings">
    <!-- 页面标题 -->
    <header class="settings__header">
      <h1 class="page-title">设置</h1>
      <p class="page-subtitle">配置您的数字文房</p>
    </header>
    
    <!-- 墨迹分隔线 -->
    <div class="ink-divider">
      <div class="ink-drop-animation"></div>
    </div>
    
    <!-- 设置内容 -->
    <div class="settings__content">
      <!-- AI 配置模块 -->
      <section class="settings-section" style="--section-index: 0">
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
        
        <!-- 高级选项 -->
        <div class="advanced-options">
          <button 
            class="advanced-toggle" 
            @click="showAdvancedOptions = !showAdvancedOptions"
            type="button"
          >
            <span class="toggle-icon" :class="{ expanded: showAdvancedOptions }">▶</span>
            <span>高级选项</span>
            <span class="toggle-hint">温度、最大令牌、上下文等</span>
          </button>
          
          <Transition name="expand">
            <div v-show="showAdvancedOptions" class="advanced-content">
              <!-- 温度参数 -->
              <div class="form-group">
                <label class="form-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path>
                  </svg>
                  温度 (Temperature)
                </label>
                <div class="slider-control">
                  <input
                    id="temperature"
                    v-model.number="config.temperature"
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    class="form-slider"
                  />
                  <span class="slider-value">{{ config.temperature }}</span>
                </div>
                <p class="input-hint">控制输出的随机性：0为确定性输出，越高越创造性（推荐0.7-1.0）</p>
              </div>
              
              <!-- 最大令牌数 -->
              <div class="form-group">
                <label for="maxTokens" class="form-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                    <line x1="8" y1="21" x2="16" y2="21"></line>
                    <line x1="12" y1="17" x2="12" y2="21"></line>
                  </svg>
                  最大令牌数 (Max Tokens)
                </label>
                <input
                  id="maxTokens"
                  v-model.number="config.maxTokens"
                  type="number"
                  min="100"
                  max="8000"
                  step="100"
                  placeholder="2048"
                  class="form-input"
                />
                <p class="input-hint">限制AI回复的最大长度，留空表示不限制</p>
              </div>
              
              <!-- 上下文消息数 -->
              <div class="form-group">
                <label for="contextMessages" class="form-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                  </svg>
                  上下文消息数
                </label>
                <input
                  id="contextMessages"
                  v-model.number="config.contextMessages"
                  type="number"
                  min="1"
                  max="20"
                  step="1"
                  placeholder="10"
                  class="form-input"
                />
                <p class="input-hint">保留的对话历史轮数，越多上下文越完整但消耗更多令牌</p>
              </div>
              
              <!-- Top P -->
              <div class="form-group">
                <label class="form-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 6v6l4 2"></path>
                  </svg>
                  Top P (核采样)
                </label>
                <div class="slider-control">
                  <input
                    id="topP"
                    v-model.number="config.topP"
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    class="form-slider"
                  />
                  <span class="slider-value">{{ config.topP }}</span>
                </div>
                <p class="input-hint">控制词汇选择的多样性，建议与温度只调整其中一个</p>
              </div>
              
              <!-- 频率惩罚 -->
              <div class="form-group">
                <label class="form-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                  </svg>
                  频率惩罚 (Frequency Penalty)
                </label>
                <div class="slider-control">
                  <input
                    id="frequencyPenalty"
                    v-model.number="config.frequencyPenalty"
                    type="range"
                    min="-2"
                    max="2"
                    step="0.1"
                    class="form-slider"
                  />
                  <span class="slider-value">{{ config.frequencyPenalty }}</span>
                </div>
                <p class="input-hint">降低重复用词的概率，正值减少重复</p>
              </div>
              
              <!-- 存在惩罚 -->
              <div class="form-group">
                <label class="form-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  存在惩罚 (Presence Penalty)
                </label>
                <div class="slider-control">
                  <input
                    id="presencePenalty"
                    v-model.number="config.presencePenalty"
                    type="range"
                    min="-2"
                    max="2"
                    step="0.1"
                    class="form-slider"
                  />
                  <span class="slider-value">{{ config.presencePenalty }}</span>
                </div>
                <p class="input-hint">鼓励讨论新话题，正值增加话题多样性</p>
              </div>
              
              <!-- 超时设置 -->
              <div class="form-group">
                <label for="timeout" class="form-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  请求超时 (秒)
                </label>
                <input
                  id="timeout"
                  v-model.number="config.timeout"
                  type="number"
                  min="10"
                  max="300"
                  step="10"
                  placeholder="60"
                  class="form-input"
                />
                <p class="input-hint">API请求的最大等待时间</p>
              </div>
              
              <!-- 流式输出 -->
              <div class="form-group checkbox-group">
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    v-model="config.streamMode"
                  />
                  <span class="checkbox-text">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                    </svg>
                    启用流式输出 (Stream)
                  </span>
                </label>
                <p class="input-hint">逐字显示AI回复，提升响应感知速度</p>
              </div>
            </div>
          </Transition>
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
      
      <!-- AI 搜索配置模块 -->
      <section class="settings-section ai-search-section" style="--section-index: 1">
        <h2 class="section-title">
          <span class="section-icon ai-icon">🔍</span>
          AI 智能搜索
        </h2>
        <p class="section-desc">启用AI智能搜索功能，支持自然语言搜索日记内容</p>
        
        <div class="setting-item">
          <div class="setting-info">
            <label>启用AI搜索</label>
            <p>开启后，日记列表页面将显示AI快速搜索和AI深度搜索选项</p>
          </div>
          <label class="toggle-switch">
            <input 
              type="checkbox" 
              v-model="config.aiSearchEnabled"
              @change="saveAISearchConfig"
            />
            <span class="toggle-slider"></span>
          </label>
        </div>
        
        <div class="ai-search-info" v-if="config.aiSearchEnabled">
          <div class="info-item">
            <span class="info-icon">⚡</span>
            <div class="info-content">
              <h4>AI快速搜索</h4>
              <p>基于日记简述进行智能匹配，适合快速定位相关内容</p>
            </div>
          </div>
          <div class="info-item">
            <span class="info-icon">🔬</span>
            <div class="info-content">
              <h4>AI深度搜索</h4>
              <p>在快速搜索基础上分析日记正文，适合查找细节信息</p>
            </div>
          </div>
          <div class="info-item">
            <span class="info-icon">⚠️</span>
            <div class="info-content">
              <h4>隐私提醒</h4>
              <p>AI搜索会将日记标题、简述、正文发送到AI服务提供商</p>
            </div>
          </div>
        </div>
        
        <div class="ai-search-note">
          <p>💡 提示：AI搜索提示词可在"提示词设置"页面自定义</p>
        </div>
      </section>
      
      <!-- 本地安全模块 -->
      <section class="settings-section" style="--section-index: 2">
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
      <section class="settings-section" style="--section-index: 3">
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
      <section class="settings-section about-section" style="--section-index: 4">
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
          
          <!-- 快速链接 -->
          <div class="quick-links">
            <h4>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
              快速链接
            </h4>
            <div class="links-list">
              <button class="link-btn" @click="showWelcomeGuide">
                <span class="link-icon">👋</span>
                <span>查看欢迎页面</span>
              </button>
              <button class="link-btn" @click="resetPrivacyAgreement">
                <span class="link-icon">📜</span>
                <span>重新查看隐私协议</span>
              </button>
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
    <Teleport to="body">
      <Transition name="modal">
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
                <h4>⚠️ 重要：数据将离开您的设备</h4>
                <p>启用 AI 功能后，您的以下数据将被发送到您配置的第三方 AI 服务提供商（如 OpenAI、Azure、Anthropic 等）：</p>
                <ul>
                  <li><strong>日记内容：</strong>日记标题、正文内容、心情标签、视觉风格等</li>
                  <li><strong>搜索查询：</strong>您输入的 AI 搜索关键词和查询内容</li>
                  <li><strong>配置信息：</strong>系统提示词、用户提示词模板等 AI 相关配置</li>
                </ul>
                <p class="warning-highlight"><strong>请注意：这些数据将通过网络传输到第三方服务器，不再仅保存在您的本地设备上。</strong></p>
              </div>

              <div class="disclaimer-section">
                <h4>🔒 隐私与安全风险</h4>
                <ul>
                  <li><strong>数据传输风险：</strong>您的日记内容将离开本地设备，通过互联网传输到第三方 AI 服务提供商的服务器</li>
                  <li><strong>第三方隐私政策：</strong>数据将受您选择的 AI 服务提供商的隐私政策和服务条款约束，作者无法控制其数据处理行为</li>
                  <li><strong>数据保留：</strong>第三方服务提供商可能会根据其政策保留、处理或分析您的数据</li>
                  <li><strong>敏感信息警告：</strong>请勿在 AI 功能中输入高度敏感、机密或个人隐私信息，包括但不限于身份证号、银行账户、密码等</li>
                  <li><strong>本地数据安全：</strong>未使用 AI 功能的日记内容始终加密保存在您的本地设备上，不会自动上传</li>
                </ul>
              </div>

              <div class="disclaimer-section">
                <h4>⚖️ 责任限制与免责声明</h4>
                <ul>
                  <li><strong>第三方服务责任：</strong>作者不对任何 AI 服务提供商的服务可用性、数据安全性、隐私保护或数据处理行为承担任何责任</li>
                  <li><strong>使用风险自担：</strong>您明确理解并同意，使用 AI 功能的风险完全由您自行承担</li>
                  <li><strong>内容准确性：</strong>AI 生成的内容可能包含错误、偏见或不适当信息，作者不对其准确性、完整性或适用性承担任何责任</li>
                  <li><strong>服务变更：</strong>第三方 AI 服务提供商可能随时变更其服务条款、价格或隐私政策，作者不对此承担任何责任</li>
                  <li><strong>法律合规：</strong>您需确保使用 AI 功能符合您所在国家/地区的法律法规</li>
                </ul>
              </div>

              <div class="disclaimer-section">
                <h4>📋 使用建议</h4>
                <ul>
                  <li>在启用 AI 功能前，请仔细阅读您选择的 AI 服务提供商的隐私政策和服务条款</li>
                  <li>考虑使用匿名账户或限制分享敏感信息</li>
                  <li>定期检查并清理 AI 相关的历史记录（如提供商支持）</li>
                  <li>如不再需要 AI 功能，可在设置中关闭，关闭后不再发送新数据</li>
                </ul>
              </div>

              <div class="disclaimer-timer" v-if="disclaimerCountdown > 0">
                <span class="timer-icon">⏳</span>
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
      </Transition>
    </Teleport>
    
    <!-- 导出密码对话框 -->
    <Teleport to="body">
      <Transition name="modal">
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
      </Transition>
    </Teleport>

    <!-- 导出进度弹窗 -->
    <ExportProgress
      :show="showExportProgress"
      :progress="exportProgress"
      :current-step="exportCurrentStep"
      :is-complete="exportIsComplete"
      :diary-count="exportDiaryCount"
    />

    <!-- 导入密码对话框 -->
    <Teleport to="body">
      <Transition name="modal">
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
      </Transition>
    </Teleport>
    
    <!-- 导入结果对话框 -->
    <Teleport to="body">
      <Transition name="modal">
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
      </Transition>
    </Teleport>
    
    <!-- 清空确认对话框 -->
    <Teleport to="body">
      <Transition name="modal">
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
      </Transition>
    </Teleport>

    <!-- 清空进度弹窗 -->
    <ClearDataProgress
      :show="showClearProgress"
      :progress="clearProgress"
      :current-step="clearCurrentStep"
      :is-complete="clearIsComplete"
      :diary-count="clearDiaryCount"
    />
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
import ExportProgress from '../components/ExportProgress.vue'
import ClearDataProgress from '../components/ClearDataProgress.vue'

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
  defaultVertical: false,
  aiSearchEnabled: false,
  // 高级选项
  temperature: 0.7,
  maxTokens: null,
  contextMessages: 10,
  topP: 1.0,
  frequencyPenalty: 0,
  presencePenalty: 0,
  timeout: 60,
  streamMode: true
})

// UI 状态
const showApiKey = ref(false)
const testing = ref(false)
const testResult = ref(null)
const showClearConfirm = ref(false)
const showAdvancedOptions = ref(false)
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

// 导出进度弹窗状态
const showExportProgress = ref(false)
const exportProgress = ref(0)
const exportCurrentStep = ref(0)
const exportIsComplete = ref(false)
const exportDiaryCount = ref(0)

// 清空进度弹窗状态
const showClearProgress = ref(false)
const clearProgress = ref(0)
const clearCurrentStep = ref(0)
const clearIsComplete = ref(false)
const clearDiaryCount = ref(0)

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
  config.aiSearchEnabled = await getConfig('aiSearchEnabled', false)
  
  // 加载高级选项
  config.temperature = await getConfig('temperature', 0.7)
  config.maxTokens = await getConfig('maxTokens', null)
  config.contextMessages = await getConfig('contextMessages', 10)
  config.topP = await getConfig('topP', 1.0)
  config.frequencyPenalty = await getConfig('frequencyPenalty', 0)
  config.presencePenalty = await getConfig('presencePenalty', 0)
  config.timeout = await getConfig('timeout', 60)
  config.streamMode = await getConfig('streamMode', true)

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
    
    // 保存高级选项
    await setConfig('temperature', config.temperature)
    await setConfig('maxTokens', config.maxTokens)
    await setConfig('contextMessages', config.contextMessages)
    await setConfig('topP', config.topP)
    await setConfig('frequencyPenalty', config.frequencyPenalty)
    await setConfig('presencePenalty', config.presencePenalty)
    await setConfig('timeout', config.timeout)
    await setConfig('streamMode', config.streamMode)
    
    alert('配置已保存')
    console.log('[Settings] AI 配置已保存')
  } catch (error) {
    console.error('[Settings] 保存配置失败:', error)
    alert('保存失败: ' + error.message)
  }
}

// 启动免责声明倒计时
function startDisclaimerTimer() {
  // 清除现有计时器
  if (disclaimerTimer) {
    clearInterval(disclaimerTimer)
    disclaimerTimer = null
  }
  // 重置倒计时
  disclaimerCountdown.value = 10
  // 启动新计时器
  disclaimerTimer = setInterval(() => {
    if (disclaimerCountdown.value > 0) {
      disclaimerCountdown.value--
    } else {
      clearInterval(disclaimerTimer)
      disclaimerTimer = null
    }
  }, 1000)
}

// 停止免责声明倒计时
function stopDisclaimerTimer() {
  if (disclaimerTimer) {
    clearInterval(disclaimerTimer)
    disclaimerTimer = null
  }
}

// 取消免责声明
function cancelDisclaimer() {
  showDisclaimerDialog.value = false
  disclaimerChecked.value = false
  disclaimerCountdown.value = 10
  pendingSaveConfig = null
  stopDisclaimerTimer()
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
    stopDisclaimerTimer()
    
    // 如果有待保存的配置，执行保存
    if (pendingSaveConfig) {
      await doSaveAIConfig()
    }
    
    // 如果用户正在尝试启用AI搜索，则启用它
    if (!config.aiSearchEnabled) {
      config.aiSearchEnabled = true
      await setConfig('aiSearchEnabled', true)
    }
    
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

// 保存AI搜索配置
async function saveAISearchConfig() {
  // 如果用户尝试启用AI搜索，检查是否已同意免责声明
  if (config.aiSearchEnabled) {
    const hasAgreed = await getConfig('aiDisclaimerAgreed', false)
    if (!hasAgreed) {
      // 显示免责声明对话框
      showDisclaimerDialog.value = true
      disclaimerChecked.value = false
      disclaimerCountdown.value = 10
      startDisclaimerTimer()
      // 临时关闭开关，等待用户同意
      config.aiSearchEnabled = false
      return
    }
  }
  
  try {
    await setConfig('aiSearchEnabled', config.aiSearchEnabled)
    console.log('[Settings] AI搜索配置已保存:', config.aiSearchEnabled)
  } catch (error) {
    console.error('[Settings] 保存AI搜索配置失败:', error)
    alert('保存失败: ' + error.message)
  }
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

// 生成易读的导出文件名
function generateExportFileName(diaryCount) {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hour = String(now.getHours()).padStart(2, '0')
  const minute = String(now.getMinutes()).padStart(2, '0')
  
  return `墨记_${year}年${month}月${day}日_${hour}时${minute}分_${diaryCount}篇日记.json`
}

// 模拟进度更新
function updateExportProgress(targetProgress, duration = 500) {
  const startProgress = exportProgress.value
  const startTime = Date.now()

  return new Promise(resolve => {
    function animate() {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      exportProgress.value = startProgress + (targetProgress - startProgress) * progress

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        resolve()
      }
    }
    animate()
  })
}

// 延迟函数
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
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

  // 关闭密码对话框，显示进度弹窗
  showExportDialog.value = false
  showExportProgress.value = true
  exportProgress.value = 0
  exportCurrentStep.value = 0
  exportIsComplete.value = false

  try {
    // 步骤 1: 准备数据 (0-25%)
    await updateExportProgress(25, 600)
    exportCurrentStep.value = 1
    await delay(200) // 步骤完成后短暂停顿

    // 获取数据
    const data = await exportAllData()
    const diaryCount = data.diaries?.length || 0
    exportDiaryCount.value = diaryCount

    // 步骤 2: 加密处理 (25-75%) - 加密阶段最长，让用户看清楚
    await updateExportProgress(50, 800)
    exportCurrentStep.value = 2
    await delay(300) // 加密阶段多停顿一会儿

    // 加密数据
    const encryptedData = await encryptData(data, exportPassword.value)

    await updateExportProgress(75, 600)
    await delay(200)

    // 步骤 3: 生成文件 (75-100%)
    exportCurrentStep.value = 3

    // 下载文件
    const blob = new Blob([JSON.stringify(encryptedData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = generateExportFileName(diaryCount)
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    URL.revokeObjectURL(url)

    await updateExportProgress(100, 400)
    await delay(200)

    // 完成
    exportIsComplete.value = true
    console.log('[Settings] 数据已加密导出')

    // 2秒后关闭进度弹窗
    setTimeout(() => {
      showExportProgress.value = false
      // 重置状态
      exportPassword.value = ''
      exportPasswordConfirm.value = ''
      passwordError.value = ''
    }, 2000)

  } catch (error) {
    console.error('[Settings] 导出失败:', error)
    passwordError.value = '导出失败: ' + error.message
    showExportProgress.value = false
    showExportDialog.value = true
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

// 模拟清空进度更新
function updateClearProgress(targetProgress, duration = 500) {
  const startProgress = clearProgress.value
  const startTime = Date.now()

  return new Promise(resolve => {
    function animate() {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      clearProgress.value = startProgress + (targetProgress - startProgress) * progress

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        resolve()
      }
    }
    animate()
  })
}

// 执行清空
async function doClear() {
  // 关闭确认对话框，显示进度弹窗
  showClearConfirm.value = false
  showClearProgress.value = true
  clearProgress.value = 0
  clearCurrentStep.value = 0
  clearIsComplete.value = false
  clearDiaryCount.value = stats.diaryCount

  try {
    // 步骤 1: 删除日记 (0-30%)
    await updateClearProgress(30, 500)
    clearCurrentStep.value = 1
    await delay(200)

    // 步骤 2: 清除配置 (30-70%)
    await updateClearProgress(70, 600)
    clearCurrentStep.value = 2
    await delay(200)

    // 步骤 3: 释放空间 (70-100%)
    clearCurrentStep.value = 3
    await updateClearProgress(100, 400)
    await delay(200)

    // 实际执行清空
    await clearAllData()

    // 完成
    clearIsComplete.value = true
    console.log('[Settings] 数据已清空')

    // 2秒后关闭进度弹窗
    setTimeout(() => {
      showClearProgress.value = false
      alert('所有数据已清空')
      // 重新加载
      loadStats()
    }, 2000)

  } catch (error) {
    console.error('[Settings] 清空失败:', error)
    showClearProgress.value = false
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

// 显示欢迎页面
function showWelcomeGuide() {
  // 触发自定义事件，让 App.vue 显示欢迎页面
  window.dispatchEvent(new CustomEvent('show-welcome-guide'))
  console.log('[Settings] 请求显示欢迎页面')
}

// 重置隐私协议状态
async function resetPrivacyAgreement() {
  if (confirm('确定要重新查看隐私协议吗？\n\n这将重置您的协议同意状态，下次启动时会再次显示隐私协议。')) {
    await setConfig('privacyAgreementAgreed', false)
    alert('隐私协议状态已重置，请刷新页面或重新启动应用以查看协议。')
    console.log('[Settings] 隐私协议状态已重置')
  }
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
  animation: fadeInDown 0.6s ease-out;
}

.page-title {
  font-family: "LXGW WenKai", serif;
  font-size: 2.5rem;
  font-weight: 400;
  color: var(--ink-dark);
  letter-spacing: 0.15em;
  margin-bottom: 0.5rem;
  animation: fadeInUp 0.8s ease-out 0.1s both;
}

.page-subtitle {
  font-family: "LXGW WenKai", serif;
  font-size: 1rem;
  color: var(--ink-sandalwood);
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

/* 分隔线 */
.ink-divider {
  position: relative;
  height: 2px;
  background: linear-gradient(
    to right,
    transparent 0%,
    var(--ink-sandalwood) 20%,
    var(--ink-sandalwood) 80%,
    transparent 100%
  );
  margin-bottom: 2rem;
  overflow: visible;
}

/* 墨迹滴落动画 */
.ink-drop-animation {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background: var(--ink-ochre);
  border-radius: 50%;
  opacity: 0.6;
  animation: inkSpread 3s ease-in-out infinite;
}

@keyframes inkSpread {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0.3;
  }
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
  border-radius: 8px;
  padding: 1.5rem;
  animation: fadeInUp 0.6s ease-out both;
  animation-delay: calc(var(--section-index) * 0.1s + 0.3s);
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.settings-section:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
  border-color: var(--ink-sandalwood);
}

/* 入场动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
  transition: all 0.3s ease;
}

.section-icon {
  font-size: 1.25rem;
  display: inline-flex;
  transition: all 0.3s ease;
}

.settings-section:hover .section-icon {
  transform: scale(1.15) rotate(-5deg);
}

.ai-search-section:hover .section-icon.ai-icon {
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
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
  border-radius: 6px;
  outline: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.form-input:hover,
.form-select:hover {
  border-color: var(--ink-sandalwood);
}

.form-input:focus,
.form-select:focus {
  border-color: var(--ink-ochre);
  box-shadow: 0 0 0 4px rgba(139, 69, 19, 0.1), 0 4px 12px rgba(139, 69, 19, 0.08);
  transform: translateY(-1px);
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.form-label svg {
  transition: all 0.3s ease;
  color: var(--ink-sandalwood);
}

.form-group:hover .form-label svg {
  color: var(--ink-ochre);
  transform: scale(1.1);
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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0.25rem;
  border-radius: 50%;
}

.toggle-password:hover {
  opacity: 1;
  transform: translateY(-50%) scale(1.2);
  background: var(--ink-hover);
}

.toggle-password:active {
  transform: translateY(-50%) scale(0.95);
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
  padding-top: 1rem;
  border-top: 1px dashed var(--ink-rice);
}

.form-actions :deep(.ink-button) {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.form-actions :deep(.ink-button:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 69, 19, 0.15);
}

.form-actions :deep(.ink-button:active) {
  transform: translateY(0);
}

/* 测试结果 */
.test-result {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
  padding: 1rem 1.25rem;
  border-radius: 8px;
  font-family: "LXGW WenKai", serif;
  font-size: 0.9375rem;
  animation: slideInUp 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  border: 1px solid transparent;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.test-result.success {
  background: linear-gradient(135deg, rgba(85, 107, 47, 0.1) 0%, rgba(85, 107, 47, 0.05) 100%);
  color: var(--ink-green);
  border-color: rgba(85, 107, 47, 0.2);
  box-shadow: 0 2px 8px rgba(85, 107, 47, 0.1);
}

.test-result.error {
  background: linear-gradient(135deg, rgba(220, 53, 69, 0.1) 0%, rgba(220, 53, 69, 0.05) 100%);
  color: #dc3545;
  border-color: rgba(220, 53, 69, 0.2);
  box-shadow: 0 2px 8px rgba(220, 53, 69, 0.1);
}

.result-icon {
  font-weight: bold;
  font-size: 1.25rem;
  animation: resultPop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  display: inline-flex;
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
}

@keyframes resultPop {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1);
  }
}

.test-result.success .result-icon {
  animation: checkmarkDraw 0.6s ease-out;
}

@keyframes checkmarkDraw {
  0% {
    transform: scale(0) rotate(-45deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(0deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

/* 保存成功提示动画 */
.save-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, var(--ink-green) 0%, #556b2f 100%);
  color: white;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(85, 107, 47, 0.3);
  font-family: "LXGW WenKai", serif;
  font-size: 0.9375rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  z-index: 2000;
  animation: toastSlideIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.save-toast.hiding {
  animation: toastSlideOut 0.3s ease forwards;
}

@keyframes toastSlideIn {
  from {
    opacity: 0;
    transform: translateX(100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes toastSlideOut {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100px);
  }
}

/* 设置项 */
.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem;
  border-bottom: 1px solid var(--ink-rice);
  transition: all 0.3s ease;
  border-radius: 8px;
  margin: 0 -0.5rem;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-item:hover {
  background: linear-gradient(135deg, rgba(139, 69, 19, 0.02) 0%, transparent 100%);
  transform: translateX(4px);
}

.setting-info {
  flex: 1;
}

.setting-info label {
  display: block;
  font-family: "LXGW WenKai", serif;
  font-size: 1rem;
  color: var(--ink-dark);
  margin-bottom: 0.375rem;
  transition: color 0.3s ease;
}

.setting-item:hover .setting-info label {
  color: var(--ink-ochre);
}

.setting-info p {
  font-family: "LXGW WenKai", serif;
  font-size: 0.875rem;
  color: var(--ink-sandalwood);
  transition: color 0.3s ease;
}

.setting-item:hover .setting-info p {
  color: var(--ink-sandalwood);
  opacity: 0.9;
}

/* 开关样式 */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 52px;
  height: 28px;
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
  background: linear-gradient(135deg, var(--ink-rice) 0%, #d4b483 100%);
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  border-radius: 28px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 22px;
  width: 22px;
  left: 3px;
  bottom: 3px;
  background: linear-gradient(135deg, #ffffff 0%, #f5f1e8 100%);
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.toggle-switch:hover .toggle-slider:before {
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.25);
  transform: scale(1.05);
}

input:checked + .toggle-slider {
  background: linear-gradient(135deg, var(--ink-ochre) 0%, #a0522d 100%);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
}

input:checked + .toggle-slider:before {
  transform: translateX(24px) scale(1);
}

input:checked + .toggle-slider:before {
  transform: translateX(24px);
}

/* 开关激活时的光晕效果 */
.toggle-switch input:checked + .toggle-slider {
  animation: switchGlow 0.5s ease;
}

@keyframes switchGlow {
  0% {
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2), 0 0 0 0 rgba(139, 69, 19, 0.4);
  }
  50% {
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2), 0 0 0 8px rgba(139, 69, 19, 0.1);
  }
  100% {
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2), 0 0 0 0 rgba(139, 69, 19, 0);
  }
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
  padding: 1.25rem;
  background: linear-gradient(135deg, var(--ink-hover) 0%, rgba(255, 255, 255, 0.5) 100%);
  border-radius: 10px;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
  position: relative;
  overflow: hidden;
  animation: fadeInUp 0.5s ease-out both;
  animation-delay: calc(var(--action-index, 0) * 0.1s);
}

.data-action-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 0;
  background: linear-gradient(90deg, rgba(139, 69, 19, 0.06) 0%, transparent 100%);
  transition: width 0.4s ease;
}

.data-action-item:hover {
  background: linear-gradient(135deg, var(--ink-hover) 0%, rgba(139, 69, 19, 0.03) 100%);
  border-color: var(--ink-sandalwood);
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.data-action-item:hover::before {
  width: 100%;
}

.data-action-item.danger {
  background: linear-gradient(135deg, rgba(139, 69, 19, 0.05) 0%, rgba(220, 53, 69, 0.02) 100%);
}

.data-action-item.danger:hover {
  background: linear-gradient(135deg, rgba(220, 53, 69, 0.08) 0%, rgba(139, 69, 19, 0.03) 100%);
  border-color: rgba(220, 53, 69, 0.3);
}

/* 操作图标包装器 */
.action-icon-wrapper {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(139, 69, 19, 0.1) 0%, rgba(139, 69, 19, 0.05) 100%);
  border-radius: 12px;
  color: var(--ink-ochre);
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  margin-right: 1rem;
}

.action-icon-wrapper.export {
  background: linear-gradient(135deg, rgba(85, 107, 47, 0.15) 0%, rgba(85, 107, 47, 0.05) 100%);
  color: var(--ink-green);
}

.action-icon-wrapper.import {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(102, 126, 234, 0.05) 100%);
  color: #667eea;
}

.action-icon-wrapper.clear {
  background: linear-gradient(135deg, rgba(220, 53, 69, 0.1) 0%, rgba(220, 53, 69, 0.03) 100%);
  color: #dc3545;
}

.data-action-item:hover .action-icon-wrapper {
  transform: scale(1.1) rotate(-5deg);
}

.action-info {
  flex: 1;
}

.action-info h4 {
  font-family: "LXGW WenKai", serif;
  font-size: 1rem;
  font-weight: 400;
  color: var(--ink-dark);
  margin-bottom: 0.25rem;
  transition: color 0.3s ease;
}

.action-info p {
  font-family: "LXGW WenKai", serif;
  font-size: 0.875rem;
  color: var(--ink-sandalwood);
  transition: color 0.3s ease;
}

.data-action-item:hover .action-info h4 {
  color: var(--ink-ochre);
}

.data-action-item.danger .action-info h4 {
  color: #dc3545;
}

.data-action-item.danger:hover .action-info h4 {
  color: #c82333;
}

.storage-info {
  margin-top: 1.5rem;
  text-align: center;
  padding: 1rem;
  background: linear-gradient(135deg, rgba(139, 69, 19, 0.03) 0%, transparent 100%);
  border-radius: 8px;
  animation: fadeInUp 0.6s ease-out 0.5s both;
}

.storage-info p {
  font-family: "LXGW WenKai", serif;
  font-size: 0.875rem;
  color: var(--ink-sandalwood);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

/* 关于内容 */
.about-content {
  text-align: center;
}

.about-logo {
  margin-bottom: 2rem;
  animation: fadeInUp 0.8s ease-out both;
}

.logo-circle {
  width: 80px;
  height: 80px;
  margin: 0 auto 1rem;
  background: linear-gradient(135deg, var(--ink-ochre) 0%, #a0522d 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(139, 69, 19, 0.25);
  animation: sealStamp 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.3s both;
  position: relative;
  overflow: hidden;
}

.logo-circle::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 60%);
  animation: shimmer 3s ease-in-out infinite;
}

@keyframes sealStamp {
  0% {
    opacity: 0;
    transform: scale(2) rotate(-10deg);
  }
  50% {
    transform: scale(0.9) rotate(2deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0);
  }
}

@keyframes shimmer {
  0%, 100% {
    transform: translate(-30%, -30%) rotate(0deg);
  }
  50% {
    transform: translate(-20%, -20%) rotate(180deg);
  }
}

.logo-icon {
  font-size: 2.5rem;
  color: var(--ink-paper);
  font-family: "LXGW WenKai", serif;
  position: relative;
  z-index: 1;
}

.about-logo h3 {
  font-family: "LXGW WenKai", serif;
  font-size: 1.75rem;
  font-weight: 400;
  color: var(--ink-dark);
  margin-bottom: 0.5rem;
  letter-spacing: 0.1em;
}

.version-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: linear-gradient(135deg, var(--ink-hover) 0%, rgba(139, 69, 19, 0.05) 100%);
  border-radius: 20px;
  font-family: "LXGW WenKai", serif;
  font-size: 0.8125rem;
  color: var(--ink-sandalwood);
  border: 1px solid var(--ink-rice);
  animation: fadeIn 0.6s ease-out 0.8s both;
}

/* 关于描述 */
.about-description.serious {
  text-align: left;
  background: linear-gradient(135deg, rgba(139, 69, 19, 0.03) 0%, transparent 100%);
  padding: 1.25rem;
  border-radius: 10px;
  margin-bottom: 1.5rem;
  border-left: 3px solid var(--ink-ochre);
  animation: fadeInUp 0.6s ease-out 0.5s both;
}

.about-description.serious h4 {
  font-family: "LXGW WenKai", serif;
  font-size: 1.1rem;
  font-weight: 400;
  color: var(--ink-dark);
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.about-description.serious p {
  font-family: "LXGW WenKai", serif;
  font-size: 0.9rem;
  color: var(--ink-sandalwood);
  line-height: 1.8;
  margin: 0;
}

/* 特性列表 */
.about-features.compact {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
  animation: fadeInUp 0.6s ease-out 0.7s both;
}

.about-features.compact .feature-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, rgba(139, 69, 19, 0.05) 0%, rgba(139, 69, 19, 0.02) 100%);
  border-radius: 8px;
  transition: all 0.3s ease;
  animation: fadeInUp 0.5s ease-out both;
  animation-delay: calc(var(--feature-index, 0) * 0.1s + 0.8s);
}

.about-features.compact .feature-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  background: linear-gradient(135deg, rgba(139, 69, 19, 0.08) 0%, rgba(139, 69, 19, 0.03) 100%);
}

.about-features.compact .feature-icon-wrapper {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(139, 69, 19, 0.12) 0%, rgba(139, 69, 19, 0.06) 100%);
  border-radius: 8px;
  color: var(--ink-ochre);
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.about-features.compact .feature-item:hover .feature-icon-wrapper {
  transform: scale(1.1) rotate(-5deg);
  background: linear-gradient(135deg, rgba(139, 69, 19, 0.2) 0%, rgba(139, 69, 19, 0.1) 100%);
}

.about-features.compact span {
  font-family: "LXGW WenKai", serif;
  font-size: 0.875rem;
  color: var(--ink-sandalwood);
}

/* 快速链接 */
.quick-links {
  margin: 1.5rem 0;
  padding: 1.25rem;
  background: linear-gradient(135deg, rgba(139, 69, 19, 0.03) 0%, rgba(139, 69, 19, 0.01) 100%);
  border-radius: 10px;
  border: 1px solid rgba(139, 69, 19, 0.1);
  animation: fadeInUp 0.6s ease-out 0.9s both;
}

.quick-links h4 {
  font-family: "LXGW WenKai", serif;
  font-size: 0.9375rem;
  font-weight: 400;
  color: var(--ink-dark);
  margin-bottom: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quick-links h4 svg {
  color: var(--ink-ochre);
}

.links-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.link-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(139, 69, 19, 0.15);
  border-radius: 8px;
  font-family: "LXGW WenKai", serif;
  font-size: 0.875rem;
  color: var(--ink-dark);
  cursor: pointer;
  transition: all 0.3s ease;
}

.link-btn:hover {
  background: rgba(139, 69, 19, 0.05);
  border-color: var(--ink-sandalwood);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.link-icon {
  font-size: 1.1rem;
}

/* 版权信息 */
.copyright {
  font-family: "LXGW WenKai", serif;
  font-size: 0.8125rem;
  color: var(--ink-sandalwood);
  opacity: 0.8;
  animation: fadeIn 0.6s ease-out 1s both;
  padding-top: 1rem;
  border-top: 1px solid var(--ink-rice);
}

/* Teleport 模态框过渡动画 */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .confirm-dialog,
.modal-leave-to .confirm-dialog {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

/* 对话框 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(44, 62, 80, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
}

.confirm-dialog {
  background: linear-gradient(135deg, var(--ink-paper) 0%, #fdfbf7 100%);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3), 0 8px 24px rgba(0, 0, 0, 0.15);
  text-align: center;
  max-width: 420px;
  width: 90%;
  animation: dialogScaleIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  border: 1px solid var(--ink-rice);
  position: relative;
  overflow: hidden;
}

.confirm-dialog::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--ink-ochre) 0%, var(--ink-sandalwood) 50%, var(--ink-ochre) 100%);
  opacity: 0.5;
}

@keyframes dialogScaleIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.confirm-dialog h3 {
  font-family: "LXGW WenKai", serif;
  font-size: 1.35rem;
  font-weight: 400;
  color: var(--ink-dark);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.confirm-dialog p {
  font-family: "LXGW WenKai", serif;
  color: var(--ink-sandalwood);
  margin-bottom: 1.5rem;
  line-height: 1.7;
}

.dialog-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

/* 对话框按钮悬停效果 */
.dialog-actions :deep(.ink-button) {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dialog-actions :deep(.ink-button:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 69, 19, 0.2);
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

.warning-highlight {
  background: rgba(220, 53, 69, 0.08);
  border: 1px solid rgba(220, 53, 69, 0.2);
  border-radius: 6px;
  padding: 0.75rem 1rem;
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: #721c24;
}

.disclaimer-timer {
  text-align: center;
  padding: 0.875rem;
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.15) 0%, rgba(255, 193, 7, 0.05) 100%);
  border-radius: 8px;
  font-family: "LXGW WenKai", serif;
  font-size: 0.9375rem;
  color: #856404;
  margin-top: 1rem;
  border: 1px solid rgba(255, 193, 7, 0.3);
  animation: pulse 2s ease-in-out infinite;
}

.timer-icon {
  margin-right: 0.5rem;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
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

/* AI搜索区块样式 */
.ai-search-section {
  background: linear-gradient(135deg, #f8f9ff 0%, rgba(255, 255, 255, 0.95) 100%);
  border-color: #e0e7ff;
}

.ai-search-section .section-title {
  color: #4c51bf;
}

.ai-search-info {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 4px;
  border: 1px solid #e0e7ff;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
}

.info-item:last-child {
  border-bottom: none;
}

.info-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.info-content h4 {
  font-family: "LXGW WenKai", serif;
  font-size: 0.9375rem;
  font-weight: 400;
  color: var(--ink-dark);
  margin-bottom: 0.25rem;
}

.info-content p {
  font-family: "LXGW WenKai", serif;
  font-size: 0.8125rem;
  color: var(--ink-sandalwood);
  margin: 0;
}

.ai-search-note {
  margin-top: 1rem;
  padding: 0.75rem;
  background: rgba(255, 193, 7, 0.1);
  border-radius: 4px;
  border-left: 3px solid #ffc107;
}

.ai-search-note p {
  font-family: "LXGW WenKai", serif;
  font-size: 0.8125rem;
  color: var(--ink-dark);
  margin: 0;
}

/* 高级选项样式 */
.advanced-options {
  margin: 1.5rem 0;
  border: 1px solid var(--ink-rice);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.advanced-options:hover {
  border-color: var(--ink-sandalwood);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.advanced-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  background: linear-gradient(135deg, var(--ink-hover) 0%, rgba(139, 69, 19, 0.03) 100%);
  border: none;
  cursor: pointer;
  font-family: "LXGW WenKai", serif;
  font-size: 0.9375rem;
  color: var(--ink-dark);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.advanced-toggle::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 0;
  background: linear-gradient(90deg, rgba(139, 69, 19, 0.08) 0%, transparent 100%);
  transition: width 0.4s ease;
}

.advanced-toggle:hover {
  background: linear-gradient(135deg, var(--ink-rice) 0%, rgba(139, 69, 19, 0.05) 100%);
}

.advanced-toggle:hover::before {
  width: 100%;
}

.toggle-icon {
  font-size: 0.75rem;
  transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  color: var(--ink-sandalwood);
  display: inline-flex;
}

.toggle-icon.expanded {
  transform: rotate(90deg);
}

.toggle-hint {
  margin-left: auto;
  font-size: 0.8125rem;
  color: var(--ink-sandalwood);
  transition: all 0.3s ease;
}

.advanced-toggle:hover .toggle-hint {
  color: var(--ink-ochre);
  transform: translateX(-4px);
}

.advanced-content {
  padding: 1.25rem;
  background: linear-gradient(180deg, var(--ink-paper) 0%, rgba(139, 69, 19, 0.02) 100%);
  border-top: 1px solid var(--ink-rice);
}

/* 滑块控件 */
.slider-control {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.form-slider {
  flex: 1;
  height: 8px;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--ink-rice) 0%, var(--ink-rice) 100%);
  outline: none;
  -webkit-appearance: none;
  transition: all 0.3s ease;
}

.form-slider:hover {
  background: linear-gradient(90deg, var(--ink-sandalwood) 0%, var(--ink-sandalwood) 100%);
}

.form-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--ink-ochre) 0%, #a0522d 100%);
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(139, 69, 19, 0.3);
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  border: 2px solid white;
}

.form-slider::-webkit-slider-thumb:hover {
  transform: scale(1.3);
  box-shadow: 0 4px 12px rgba(139, 69, 19, 0.4);
}

.form-slider::-webkit-slider-thumb:active {
  transform: scale(1.1);
  box-shadow: 0 2px 6px rgba(139, 69, 19, 0.5);
}

.form-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--ink-ochre) 0%, #a0522d 100%);
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(139, 69, 19, 0.3);
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.form-slider::-moz-range-thumb:hover {
  transform: scale(1.3);
  box-shadow: 0 4px 12px rgba(139, 69, 19, 0.4);
}

.slider-value {
  min-width: 52px;
  text-align: center;
  font-family: "LXGW WenKai", serif;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--ink-ochre);
  padding: 0.375rem 0.625rem;
  background: linear-gradient(135deg, var(--ink-hover) 0%, rgba(139, 69, 19, 0.05) 100%);
  border-radius: 6px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.slider-value:hover {
  border-color: var(--ink-sandalwood);
  transform: scale(1.05);
}

/* 复选框组 */
.checkbox-group {
  margin-top: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-family: "LXGW WenKai", serif;
  font-size: 0.9375rem;
  color: var(--ink-dark);
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--ink-ochre);
}

.checkbox-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* 展开动画 */
.expand-enter-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 2000px;
  opacity: 1;
  overflow: hidden;
}

.expand-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 2000px;
  opacity: 1;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

/* 高级选项内容项动画 */
.advanced-content .form-group {
  animation: slideInRight 0.4s ease-out both;
  animation-delay: calc(var(--group-index, 0) * 0.05s);
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
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
  
  .slider-control {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
  
  .slider-value {
    align-self: flex-end;
  }
  
  .toggle-hint {
    display: none;
  }
}
</style>
