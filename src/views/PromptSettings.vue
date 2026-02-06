<template>
  <div class="prompt-settings">
    <!-- 页面标题 -->
    <header class="prompt-settings__header">
      <div class="title-wrapper">
        <h1 class="page-title">
          <span class="title-icon">✨</span>
          提示词设置
        </h1>
        <p class="page-subtitle">定制您的AI创作助手，打造专属的智能写作体验</p>
      </div>
      <div class="header-actions">
        <button class="header-btn" @click="scrollToSection('basic')" title="基础设置">
          <span>📝</span>
        </button>
        <button class="header-btn" @click="scrollToSection('ai-search')" title="AI搜索">
          <span>🔍</span>
        </button>
        <button class="header-btn" @click="scrollToSection('preview')" title="预览">
          <span>👁</span>
        </button>
      </div>
    </header>
    
    <!-- 墨迹分隔线 -->
    <div class="ink-divider">
      <div class="ink-drop"></div>
      <div class="ink-drop"></div>
      <div class="ink-drop"></div>
    </div>
    
    <!-- 提示词设置内容 -->
    <div class="prompt-settings__content">
      <!-- 基础提示词区域 -->
      <div id="basic-section" class="section-group">
        <div class="section-group-header">
          <div class="group-icon">📝</div>
          <div class="group-title">
            <h2>基础提示词</h2>
            <p>配置AI生成日记的核心提示词</p>
          </div>
        </div>

        <!-- 系统提示词 -->
        <section class="settings-section collapsible" :class="{ expanded: expandedSections.system }">
          <div class="section-header" @click="toggleSection('system')">
            <div class="section-title-wrapper">
              <span class="section-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                  <path d="M2 17l10 5 10-5"></path>
                  <path d="M2 12l10 5 10-5"></path>
                </svg>
              </span>
              <h2 class="section-title">系统提示词</h2>
            </div>
            <div class="section-actions">
              <InkButton
                text="恢复默认"
                variant="ghost"
                size="small"
                @click.stop="resetPrompt('system')"
              />
              <span class="expand-icon" :class="{ rotated: expandedSections.system }">▼</span>
            </div>
          </div>
          <Transition name="expand">
            <div v-show="expandedSections.system" class="section-content">
              <p class="section-desc">定义AI的角色和行为准则，影响生成内容的整体风格</p>
              <div class="editor-wrapper">
                <div class="line-numbers">
                  <span v-for="n in getLineCount(prompts.systemPrompt)" :key="n">{{ n }}</span>
                </div>
                <textarea
                  v-model="prompts.systemPrompt"
                  class="prompt-editor with-line-numbers"
                  rows="8"
                  placeholder="输入系统提示词..."
                  @input="handleInput('systemPrompt', $event)"
                ></textarea>
              </div>
            </div>
          </Transition>
        </section>
        
        <!-- 用户提示词模板 -->
        <section class="settings-section collapsible" :class="{ expanded: expandedSections.user }">
          <div class="section-header" @click="toggleSection('user')">
            <div class="section-title-wrapper">
              <span class="section-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </span>
              <h2 class="section-title">用户提示词模板</h2>
            </div>
            <div class="section-actions">
              <InkButton
                text="恢复默认"
                variant="ghost"
                size="small"
                @click.stop="resetPrompt('user')"
              />
              <span class="expand-icon" :class="{ rotated: expandedSections.user }">▼</span>
            </div>
          </div>
          <Transition name="expand">
            <div v-show="expandedSections.user" class="section-content">
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
                    :class="[variable.type, { copied: copiedVariable === variable.name }]"
                    @click="insertVariable('userPromptTemplate', variable.name)"
                    :title="variable.desc"
                  >
                    <span class="var-name">{{ variable.name }}</span>
                    <span class="var-desc">{{ variable.desc }}</span>
                  </button>
                </div>
              </div>
              
              <div class="editor-wrapper">
                <div class="line-numbers">
                  <span v-for="n in getLineCount(prompts.userPromptTemplate)" :key="n">{{ n }}</span>
                </div>
                <textarea
                  v-model="prompts.userPromptTemplate"
                  class="prompt-editor with-line-numbers"
                  rows="12"
                  placeholder="输入用户提示词模板..."
                  @input="handleInput('userPromptTemplate', $event)"
                ></textarea>
              </div>
            </div>
          </Transition>
        </section>
        
        <!-- 标签生成提示词 -->
        <section class="settings-section collapsible" :class="{ expanded: expandedSections.tags }">
          <div class="section-header" @click="toggleSection('tags')">
            <div class="section-title-wrapper">
              <span class="section-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                  <line x1="7" y1="7" x2="7.01" y2="7"></line>
                </svg>
              </span>
              <h2 class="section-title">标签生成提示词</h2>
            </div>
            <div class="section-actions">
              <InkButton
                text="恢复默认"
                variant="ghost"
                size="small"
                @click.stop="resetPrompt('tags')"
              />
              <span class="expand-icon" :class="{ rotated: expandedSections.tags }">▼</span>
            </div>
          </div>
          <Transition name="expand">
            <div v-show="expandedSections.tags" class="section-content">
              <p class="section-desc">控制AI如何为日记生成标签（两轮调用：先生成初步标签，再结合已有标签优化）</p>
              
              <!-- 第一轮提示词 -->
              <div class="prompt-subsection">
                <h4 class="subsection-title">
                  <span class="step-badge">1</span>
                  第一轮：生成初步标签
                </h4>
                <div class="variables-help compact">
                  <span class="variables-label">可用变量</span>
                  <div class="variables-list">
                    <button 
                      v-for="variable in tagsVariables" 
                      :key="variable.name"
                      class="variable-tag"
                      :class="{ copied: copiedVariable === variable.name }"
                      @click="insertVariable('tagsPrompt', variable.name)"
                      :title="variable.desc"
                    >
                      {{ variable.name }}
                    </button>
                  </div>
                </div>
                
                <div class="editor-wrapper">
                  <div class="line-numbers">
                    <span v-for="n in getLineCount(prompts.tagsPrompt)" :key="n">{{ n }}</span>
                  </div>
                  <textarea
                    v-model="prompts.tagsPrompt"
                    class="prompt-editor with-line-numbers"
                    rows="8"
                    placeholder="输入第一轮标签生成提示词..."
                    @input="handleInput('tagsPrompt', $event)"
                  ></textarea>
                </div>
              </div>
              
              <!-- 第二轮提示词 -->
              <div class="prompt-subsection">
                <h4 class="subsection-title">
                  <span class="step-badge">2</span>
                  第二轮：优化标签（结合已有标签）
                </h4>
                <div class="variables-help compact">
                  <span class="variables-label">可用变量</span>
                  <div class="variables-list">
                    <button 
                      v-for="variable in tagsOptimizeVariables" 
                      :key="variable.name"
                      class="variable-tag"
                      :class="{ copied: copiedVariable === variable.name }"
                      @click="insertVariable('tagsOptimizePrompt', variable.name)"
                      :title="variable.desc"
                    >
                      {{ variable.name }}
                    </button>
                  </div>
                </div>
                
                <div class="editor-wrapper">
                  <div class="line-numbers">
                    <span v-for="n in getLineCount(prompts.tagsOptimizePrompt)" :key="n">{{ n }}</span>
                  </div>
                  <textarea
                    v-model="prompts.tagsOptimizePrompt"
                    class="prompt-editor with-line-numbers"
                    rows="10"
                    placeholder="输入第二轮标签优化提示词..."
                    @input="handleInput('tagsOptimizePrompt', $event)"
                  ></textarea>
                </div>
              </div>
            </div>
          </Transition>
        </section>
        
        <!-- 摘要生成提示词 -->
        <section class="settings-section collapsible" :class="{ expanded: expandedSections.summary }">
          <div class="section-header" @click="toggleSection('summary')">
            <div class="section-title-wrapper">
              <span class="section-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </span>
              <h2 class="section-title">摘要生成提示词</h2>
            </div>
            <div class="section-actions">
              <InkButton
                text="恢复默认"
                variant="ghost"
                size="small"
                @click.stop="resetPrompt('summary')"
              />
              <span class="expand-icon" :class="{ rotated: expandedSections.summary }">▼</span>
            </div>
          </div>
          <Transition name="expand">
            <div v-show="expandedSections.summary" class="section-content">
              <p class="section-desc">控制AI如何为日记生成摘要</p>
              
              <div class="variables-help compact">
                <span class="variables-label">可用变量</span>
                <div class="variables-list">
                  <button 
                    v-for="variable in summaryVariables" 
                    :key="variable.name"
                    class="variable-tag"
                    :class="{ copied: copiedVariable === variable.name }"
                    @click="insertVariable('summaryPrompt', variable.name)"
                    :title="variable.desc"
                  >
                    {{ variable.name }}
                  </button>
                </div>
              </div>
              
              <div class="editor-wrapper">
                <div class="line-numbers">
                  <span v-for="n in getLineCount(prompts.summaryPrompt)" :key="n">{{ n }}</span>
                </div>
                <textarea
                  v-model="prompts.summaryPrompt"
                  class="prompt-editor with-line-numbers"
                  rows="8"
                  placeholder="输入摘要生成提示词..."
                  @input="handleInput('summaryPrompt', $event)"
                ></textarea>
              </div>
            </div>
          </Transition>
        </section>
      </div>
      
      <!-- AI搜索配置区域 -->
      <div id="ai-search-section" class="section-group ai-search-group">
        <div class="section-group-header">
          <div class="group-icon">🔍</div>
          <div class="group-title">
            <h2>AI 智能搜索</h2>
            <p>配置AI搜索的API、参数和提示词</p>
          </div>
        </div>

        <!-- AI搜索API配置卡片 -->
        <div class="ai-config-card">
          <div class="ai-config-header">
            <div class="ai-config-icon">
              <span>🔧</span>
            </div>
            <div class="ai-config-title">
              <h3>API 配置</h3>
              <p>配置AI搜索使用的API，可选择使用独立配置或跟随主模型</p>
            </div>
            <span class="expand-icon" :class="{ rotated: expandedSections.api }">▼</span>
          </div>
          
          <Transition name="expand">
            <div v-show="expandedSections.api" class="ai-config-content">
              <section class="settings-section ai-search-section">
                <div class="api-config-section">
                  <label class="checkbox-label modern-checkbox">
                    <div class="checkbox-wrapper">
                      <input 
                        type="checkbox" 
                        v-model="aiSearchConfig.useSeparateAPI"
                      />
                      <span class="checkbox-slider"></span>
                    </div>
                    <span class="checkbox-text">使用独立API配置</span>
                  </label>
                  
                  <Transition name="slide-down">
                    <div v-if="aiSearchConfig.useSeparateAPI" class="api-config-fields">
                      <div class="form-row">
                        <div class="form-group">
                          <label class="form-label">
                            <span class="label-icon">🔗</span>
                            API Base URL
                          </label>
                          <input 
                            v-model="aiSearchConfig.apiBaseUrl"
                            type="text"
                            class="form-input modern-input"
                            placeholder="https://api.openai.com/v1"
                          />
                        </div>
                        
                        <div class="form-group">
                          <label class="form-label">
                            <span class="label-icon">🔑</span>
                            API Key
                          </label>
                          <div class="password-input-wrapper">
                            <input 
                              v-model="aiSearchConfig.apiKey"
                              :type="showApiKey ? 'text' : 'password'"
                              class="form-input modern-input"
                              placeholder="sk-..."
                            />
                            <button 
                              class="toggle-password"
                              @click="showApiKey = !showApiKey"
                              type="button"
                            >
                              {{ showApiKey ? '🙈' : '👁' }}
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div class="form-group">
                        <label class="form-label">
                          <span class="label-icon">🤖</span>
                          模型
                        </label>
                        <input 
                          v-model="aiSearchConfig.model"
                          type="text"
                          class="form-input modern-input"
                          placeholder="gpt-4o-mini"
                        />
                        <span class="form-hint">
                          <span class="hint-icon">💡</span>
                          推荐使用轻量级模型如 gpt-4o-mini、claude-3-haiku
                        </span>
                      </div>
                    </div>
                  </Transition>
                </div>
              </section>
            </div>
          </Transition>
        </div>
        
        <!-- AI搜索参数配置卡片 -->
        <div class="ai-config-card">
          <div class="ai-config-header">
            <div class="ai-config-icon">
              <span>⚙️</span>
            </div>
            <div class="ai-config-title">
              <h3>参数配置</h3>
              <p>配置AI搜索的行为参数</p>
            </div>
            <span class="expand-icon" :class="{ rotated: expandedSections.params }">▼</span>
          </div>
          
          <Transition name="expand">
            <div v-show="expandedSections.params" class="ai-config-content">
              <section class="settings-section ai-search-section">
                <div class="params-grid modern-params">
                  <!-- 快速模式轮数 -->
                  <div class="param-card quick-mode">
                    <div class="param-icon">⚡</div>
                    <div class="param-content">
                      <label class="param-label">快速模式最大轮数</label>
                      <div class="param-control">
                        <button class="param-btn" @click="aiSearchConfig.quickMaxRounds = Math.max(1, aiSearchConfig.quickMaxRounds - 1)">−</button>
                        <input
                          v-model.number="aiSearchConfig.quickMaxRounds"
                          type="number"
                          min="1"
                          max="6"
                          class="param-input modern-number"
                        />
                        <button class="param-btn" @click="aiSearchConfig.quickMaxRounds = Math.min(6, aiSearchConfig.quickMaxRounds + 1)">+</button>
                      </div>
                      <span class="param-hint">推荐：3轮（1-6），追求效率</span>
                    </div>
                  </div>

                  <!-- 深度模式轮数 -->
                  <div class="param-card deep-mode">
                    <div class="param-icon">🔬</div>
                    <div class="param-content">
                      <label class="param-label">深度模式最大轮数</label>
                      <div class="param-control">
                        <button class="param-btn" @click="aiSearchConfig.deepMaxRounds = Math.max(3, aiSearchConfig.deepMaxRounds - 1)">−</button>
                        <input
                          v-model.number="aiSearchConfig.deepMaxRounds"
                          type="number"
                          min="3"
                          max="100"
                          class="param-input modern-number"
                        />
                        <button class="param-btn" @click="aiSearchConfig.deepMaxRounds = Math.min(100, aiSearchConfig.deepMaxRounds + 1)">+</button>
                      </div>
                      <span class="param-hint">推荐：无限制（3-100）</span>
                    </div>
                  </div>
                  
                  <!-- 温度参数 -->
                  <div class="param-card temp-mode">
                    <div class="param-icon">🌡️</div>
                    <div class="param-content">
                      <label class="param-label">温度参数</label>
                      <div class="param-control slider-control">
                        <input 
                          v-model.number="aiSearchConfig.temperature"
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          class="param-slider"
                        />
                        <span class="param-value">{{ aiSearchConfig.temperature }}</span>
                      </div>
                      <span class="param-hint">0=确定性高，1=创造性高</span>
                    </div>
                  </div>
                  
                  <!-- Top P -->
                  <div class="param-card topp-mode">
                    <div class="param-icon">🎯</div>
                    <div class="param-content">
                      <label class="param-label">Top P (核采样)</label>
                      <div class="param-control slider-control">
                        <input 
                          v-model.number="aiSearchConfig.topP"
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          class="param-slider"
                        />
                        <span class="param-value">{{ aiSearchConfig.topP }}</span>
                      </div>
                      <span class="param-hint">控制词汇多样性</span>
                    </div>
                  </div>
                  
                  <!-- 最大令牌数 -->
                  <div class="param-card tokens-mode">
                    <div class="param-icon">📊</div>
                    <div class="param-content">
                      <label class="param-label">最大令牌数</label>
                      <div class="param-control">
                        <button class="param-btn" @click="aiSearchConfig.maxTokens = Math.max(500, (aiSearchConfig.maxTokens || 4000) - 500)">−</button>
                        <input
                          v-model.number="aiSearchConfig.maxTokens"
                          type="number"
                          min="500"
                          max="8000"
                          step="500"
                          class="param-input modern-number"
                          placeholder="4000"
                        />
                        <button class="param-btn" @click="aiSearchConfig.maxTokens = Math.min(8000, (aiSearchConfig.maxTokens || 4000) + 500)">+</button>
                      </div>
                      <span class="param-hint">限制回复长度</span>
                    </div>
                  </div>
                  
                  <!-- 请求超时 -->
                  <div class="param-card timeout-mode">
                    <div class="param-icon">⏱️</div>
                    <div class="param-content">
                      <label class="param-label">请求超时(秒)</label>
                      <div class="param-control">
                        <button class="param-btn" @click="aiSearchConfig.timeout = Math.max(10, (aiSearchConfig.timeout || 60) - 10)">−</button>
                        <input
                          v-model.number="aiSearchConfig.timeout"
                          type="number"
                          min="10"
                          max="300"
                          step="10"
                          class="param-input modern-number"
                          placeholder="60"
                        />
                        <button class="param-btn" @click="aiSearchConfig.timeout = Math.min(300, (aiSearchConfig.timeout || 60) + 10)">+</button>
                      </div>
                      <span class="param-hint">API等待时间</span>
                    </div>
                  </div>
                </div>
                
                <!-- 高级开关选项 -->
                <div class="advanced-switches">
                  <div class="switch-item">
                    <label class="modern-switch">
                      <input type="checkbox" v-model="aiSearchConfig.enableStreaming" />
                      <span class="switch-slider"></span>
                    </label>
                    <div class="switch-info">
                      <span class="switch-label">启用流式输出</span>
                      <span class="switch-desc">实时显示AI思考过程，提升交互体验</span>
                    </div>
                  </div>
                  
                  <div class="switch-item">
                    <label class="modern-switch">
                      <input type="checkbox" v-model="aiSearchConfig.enableParallelTools" />
                      <span class="switch-slider"></span>
                    </label>
                    <div class="switch-info">
                      <span class="switch-label">启用并行工具调用</span>
                      <span class="switch-desc">一轮可同时调用多个工具，提高搜索效率</span>
                    </div>
                  </div>
                  
                  <div class="switch-item">
                    <label class="modern-switch">
                      <input type="checkbox" v-model="aiSearchConfig.enableConversationMemory" />
                      <span class="switch-slider"></span>
                    </label>
                    <div class="switch-info">
                      <span class="switch-label">启用对话记忆</span>
                      <span class="switch-desc">保存搜索历史，支持上下文连续查询</span>
                    </div>
                  </div>
                  
                  <div class="switch-item">
                    <label class="modern-switch">
                      <input type="checkbox" v-model="aiSearchConfig.enableAutoRetry" />
                      <span class="switch-slider"></span>
                    </label>
                    <div class="switch-info">
                      <span class="switch-label">启用自动重试</span>
                      <span class="switch-desc">API调用失败时自动重试，最多3次</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </Transition>
        </div>
        
        <!-- AI搜索提示词配置 -->
        <div class="ai-prompts-section">
          <div class="ai-section-header">
            <div class="ai-section-icon">🤖</div>
            <div class="ai-section-title">
              <h3>智能搜索提示词</h3>
              <p>配置AI搜索的系统提示词，AI将通过工具调用自主完成搜索</p>
            </div>
          </div>

          <!-- 快速模式提示词卡片 -->
          <div class="prompt-card quick-prompt">
            <div class="prompt-card-header">
              <div class="prompt-mode-badge quick">
                <span class="mode-icon">⚡</span>
                <span class="mode-name">快速模式</span>
              </div>
              <div class="prompt-actions">
                <button class="action-btn reset" @click="resetPrompt('quickSearch')" title="恢复默认">
                  <span>↺</span> 恢复默认
                </button>
              </div>
            </div>
            
            <div class="prompt-info">
              <div class="info-item">
                <span class="info-icon">🎯</span>
                <span class="info-text">追求效率，推荐1-3轮</span>
              </div>
              <div class="info-item">
                <span class="info-icon">🔧</span>
                <span class="info-text">最多{{ aiSearchConfig.quickMaxRounds }}轮</span>
              </div>
            </div>
            
            <div class="variables-help modern-variables">
              <span class="variables-label">
                <span class="var-icon">✨</span>
                可用变量
              </span>
              <div class="variables-list">
                <button 
                  v-for="variable in aiSearchVariables" 
                  :key="variable.name"
                  class="variable-tag ai-variable"
                  :class="{ copied: copiedVariable === variable.name }"
                  @click="insertVariable('quickSearchPrompt', variable.name)"
                  :title="variable.desc"
                >
                  {{ variable.name }}
                </button>
              </div>
            </div>

            <div class="editor-wrapper">
              <div class="line-numbers">
                <span v-for="n in getLineCount(prompts.quickSearchPrompt)" :key="n">{{ n }}</span>
              </div>
              <textarea
                v-model="prompts.quickSearchPrompt"
                class="prompt-editor modern-editor with-line-numbers"
                rows="12"
                placeholder="输入快速搜索提示词..."
                @input="handleInput('quickSearchPrompt', $event)"
              ></textarea>
            </div>
            
            <div class="prompt-tips modern-tips">
              <span class="tips-icon">💡</span>
              <p>AI会返回JSON格式，包含thought（当前想法）、progress（进度）、tool_call（工具调用）等</p>
            </div>
          </div>

          <!-- 深度模式提示词卡片 -->
          <div class="prompt-card deep-prompt">
            <div class="prompt-card-header">
              <div class="prompt-mode-badge deep">
                <span class="mode-icon">🔬</span>
                <span class="mode-name">深度模式</span>
              </div>
              <div class="prompt-actions">
                <button class="action-btn reset" @click="resetPrompt('deepSearch')" title="恢复默认">
                  <span>↺</span> 恢复默认
                </button>
              </div>
            </div>
            
            <div class="prompt-info">
              <div class="info-item">
                <span class="info-icon">🎯</span>
                <span class="info-text">追求全面，无轮数限制</span>
              </div>
              <div class="info-item">
                <span class="info-icon">🔧</span>
                <span class="info-text">最多{{ aiSearchConfig.deepMaxRounds }}轮</span>
              </div>
              <div class="info-item highlight">
                <span class="info-icon">⚡</span>
                <span class="info-text">支持多工具并行</span>
              </div>
            </div>
            
            <div class="variables-help modern-variables">
              <span class="variables-label">
                <span class="var-icon">✨</span>
                可用变量
              </span>
              <div class="variables-list">
                <button 
                  v-for="variable in aiSearchVariables" 
                  :key="variable.name"
                  class="variable-tag ai-variable"
                  :class="{ copied: copiedVariable === variable.name }"
                  @click="insertVariable('deepSearchPrompt', variable.name)"
                  :title="variable.desc"
                >
                  {{ variable.name }}
                </button>
              </div>
            </div>

            <div class="editor-wrapper">
              <div class="line-numbers">
                <span v-for="n in getLineCount(prompts.deepSearchPrompt)" :key="n">{{ n }}</span>
              </div>
              <textarea
                v-model="prompts.deepSearchPrompt"
                class="prompt-editor modern-editor with-line-numbers"
                rows="12"
                placeholder="输入深度搜索提示词..."
                @input="handleInput('deepSearchPrompt', $event)"
              ></textarea>
            </div>
            
            <div class="prompt-tips modern-tips">
              <span class="tips-icon">💡</span>
              <p>AI可以进行更深入的推理和分析，适合复杂查询场景，支持多工具并行调用</p>
            </div>
          </div>
        </div>
        
        <!-- 工具配置 -->
        <div class="ai-config-card">
          <div class="ai-config-header">
            <div class="ai-config-icon">
              <span>🛠️</span>
            </div>
            <div class="ai-config-title">
              <h3>工具配置</h3>
              <p>配置AI搜索可以使用的工具。禁用不需要的工具可以减少API调用。点击工具可编辑使用说明。</p>
            </div>
            <span class="expand-icon" :class="{ rotated: expandedSections.tools }">▼</span>
          </div>
          
          <Transition name="expand">
            <div v-show="expandedSections.tools" class="ai-config-content">
              <section class="settings-section ai-search-section">
                <div class="tools-config">
                  <div 
                    v-for="(tool, key) in toolDefinitions" 
                    :key="key"
                    class="tool-config-item"
                    :class="{ enabled: aiSearchConfig.enabledTools[key], expanded: editingTool === key }"
                  >
                    <!-- 工具基本信息 - 点击切换启用/展开编辑 -->
                    <div class="tool-header" @click="toggleTool(key)">
                      <div class="tool-checkbox">
                        <div class="custom-checkbox" :class="{ checked: aiSearchConfig.enabledTools[key] }" @click.stop="toggleTool(key)">
                          <svg v-if="aiSearchConfig.enabledTools[key]" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                        <span class="tool-name">{{ tool.name }}</span>
                      </div>
                      <p class="tool-desc">{{ tool.description }}</p>
                      <div class="tool-usage">
                        <span class="usage-label">使用场景：</span>
                        <span class="usage-text">{{ getToolUsage(key) }}</span>
                      </div>
                      <button 
                        class="tool-edit-btn" 
                        :class="{ active: editingTool === key }"
                        @click.stop="toggleToolEdit(key)"
                        title="编辑使用说明"
                      >
                        <span>{{ editingTool === key ? '✕' : '✏️' }}</span>
                      </button>
                    </div>
                    
                    <!-- 工具编辑区域 -->
                    <Transition name="slide-down">
                      <div v-if="editingTool === key" class="tool-edit-panel" @click.stop>
                        <!-- 默认说明展示 -->
                        <div class="edit-section default-section">
                          <label class="edit-label">
                            <span>📖</span>
                            默认使用说明
                          </label>
                          <div class="default-description">
                            <p v-for="(usage, idx) in toolDefinitions[key]?.when_to_use || ['无默认说明']" :key="idx">
                              {{ usage }}
                            </p>
                          </div>
                        </div>
                        
                        <!-- 自定义说明编辑 -->
                        <div class="edit-section custom-section">
                          <label class="edit-label">
                            <span>📝</span>
                            自定义使用说明
                          </label>
                          <textarea
                            v-model="customToolDescriptions[key]"
                            class="tool-edit-textarea"
                            rows="4"
                            placeholder="输入自定义使用说明，将替换默认说明用于提示词..."
                          ></textarea>
                          <p class="edit-hint">留空则使用默认说明</p>
                        </div>
                        
                        <div class="edit-actions">
                          <button class="edit-btn reset" @click="resetToolDescription(key)">
                            <span>↺</span>
                            恢复默认
                          </button>
                          <button class="edit-btn save" @click="saveToolDescription(key)">
                            <span>✓</span>
                            保存
                          </button>
                        </div>
                      </div>
                    </Transition>
                  </div>
                </div>
                
                <!-- 批量操作 -->
                <div class="tools-batch-actions">
                  <button class="batch-btn" @click="enableAllTools">
                    <span>✓</span>
                    启用全部
                  </button>
                  <button class="batch-btn" @click="disableAllTools">
                    <span>✕</span>
                    禁用全部
                  </button>
                  <button class="batch-btn" @click="resetAllToolDescriptions">
                    <span>↺</span>
                    重置所有说明
                  </button>
                </div>
              </section>
            </div>
          </Transition>
        </div>
        
        <!-- 心情列表配置 -->
        <div class="ai-config-card">
          <div class="ai-config-header">
            <div class="ai-config-icon">
              <span>😊</span>
            </div>
            <div class="ai-config-title">
              <h3>心情列表</h3>
              <p>配置AI搜索可用的心情类型</p>
            </div>
            <span class="expand-icon" :class="{ rotated: expandedSections.moods }">▼</span>
          </div>
          
          <Transition name="expand">
            <div v-show="expandedSections.moods" class="ai-config-content">
              <section class="settings-section ai-search-section">
                <div class="mood-list-editor">
                  <div class="mood-input-row">
                    <div class="mood-input-wrapper">
                      <input 
                        v-model="newMood"
                        type="text"
                        class="mood-input"
                        placeholder="输入新心情..."
                        @keyup.enter="addMood"
                        @input="handleMoodInput"
                      />
                      <Transition name="fade">
                        <span v-if="moodError" class="mood-error">{{ moodError }}</span>
                      </Transition>
                    </div>
                    <InkButton
                      text="添加"
                      variant="primary"
                      size="small"
                      :disabled="!newMood.trim()"
                      @click="addMood"
                    />
                  </div>
                  
                  <TransitionGroup name="mood-tag" tag="div" class="mood-tags">
                    <span 
                      v-for="(mood, index) in aiSearchConfig.moodList" 
                      :key="mood"
                      class="mood-tag"
                    >
                      {{ mood }}
                      <button class="mood-remove" @click.stop="removeMood(index)">×</button>
                    </span>
                  </TransitionGroup>
                </div>
              </section>
            </div>
          </Transition>
        </div>
      </div>
      
      <!-- 提示词预览 -->
      <div id="preview-section" class="section-group">
        <div class="section-group-header">
          <div class="group-icon">👁</div>
          <div class="group-title">
            <h2>提示词预览</h2>
            <p>查看实际发送给AI的完整提示词</p>
          </div>
        </div>

        <section class="settings-section preview-section">
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
          
          <Transition name="fade" mode="out-in">
            <div class="preview-content" :key="activePreviewTab">
              <pre>{{ previewContent }}</pre>
            </div>
          </Transition>
        </section>
      </div>
      
      <!-- 底部悬浮操作栏 - 使用 Teleport 传送到 body -->
      <Teleport to="body">
        <div v-if="showFloatingDock" class="floating-dock">
          <div class="floating-dock__content">
            <InkButton
              text="💾 保存"
              variant="ghost"
              size="small"
              custom-class="dock-btn dock-btn--primary"
              :loading="saving"
              @click="savePrompts"
            />
            <InkButton
              text="📤 导出"
              variant="ghost"
              size="small"
              custom-class="dock-btn"
              @click="exportPrompts"
            />
            <InkButton
              text="📥 导入"
              variant="ghost"
              size="small"
              custom-class="dock-btn"
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
        </div>
      </Teleport>
      
      <!-- 提示 -->
      <div class="tips-section">
        <h3>💡 使用提示</h3>
        <ul>
          <li>系统提示词定义AI的角色，如"你是一位专业的日记美化助手"</li>
          <li>用户提示词模板可使用变量，如 {{title}}、{{content}} 等</li>
          <li><strong>AI搜索新架构：</strong>AI通过工具调用自主完成搜索，快速模式最多{{ aiSearchConfig.quickMaxRounds }}轮，深度模式最多{{ aiSearchConfig.deepMaxRounds }}轮</li>
          <li>AI搜索提示词需要返回特定的JSON格式，包含thought、progress、tool_call等字段</li>
          <li>可以禁用不需要的工具来减少API调用次数</li>
          <li>建议使用轻量级模型（如gpt-4o-mini）进行AI搜索，成本更低</li>
          <li>修改提示词后，下次搜索时生效</li>
          <li>建议先备份默认提示词，再尝试自定义</li>
        </ul>
        
        <h3>🔍 AI搜索架构说明</h3>
        <ul>
          <li><strong>工具系统：</strong>AI可以调用9种工具完成搜索，包括标签搜索、心情搜索、日期搜索、关键词搜索等</li>
          <li><strong>快速模式：</strong>最多{{ aiSearchConfig.quickMaxRounds }}轮工具调用，适合快速查找日记</li>
          <li><strong>深度模式：</strong>最多{{ aiSearchConfig.deepMaxRounds }}轮工具调用，支持深度分析、对比、总结等复杂查询</li>
          <li><strong>实时反馈：</strong>每轮AI都会返回当前想法、进度、工具调用等信息，UI实时展示</li>
          <li><strong>可配置：</strong>所有参数（轮数、温度、工具启用等）都可以在设置中调整</li>
        </ul>
      </div>
    </div>

    <!-- 保存成功提示 -->
    <Transition name="toast">
      <div v-if="showToast" class="toast-message" :class="toastType">
        <span class="toast-icon">{{ toastType === 'success' ? '✓' : '✗' }}</span>
        <span class="toast-text">{{ toastMessage }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { getConfig, setConfig } from '../modules/db.js'
import { 
  DEFAULT_SYSTEM_PROMPT, 
  DEFAULT_USER_PROMPT_TEMPLATE,
  DEFAULT_TAGS_PROMPT,
  DEFAULT_TAGS_OPTIMIZE_PROMPT,
  DEFAULT_SUMMARY_PROMPT
} from '../modules/ai-client.js'
import {
  DEFAULT_QUICK_SEARCH_PROMPT,
  DEFAULT_DEEP_SEARCH_PROMPT,
  getToolDefinitions
} from '../modules/ai-search-new.js'
import InkButton from '../components/InkButton.vue'

// 获取当前路由
const route = useRoute()

// 计算属性：是否显示悬浮 dock（只在当前页面是提示词设置页时显示）
const showFloatingDock = computed(() => route.path === '/prompts')

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
  preset: '希望文字简洁优美',
  query: '去年去云南旅行的日记',
  tools: JSON.stringify({
    search_by_tags: { description: '按标签搜索' },
    search_by_date: { description: '按日期搜索' },
    parse_time_expression: { description: '解析时间' }
  }, null, 2),
  current_time: '2024-01-15 14:30:00',
  current_date: '2024-01-15',
  max_rounds: 3,
  enabled_tools: '所有工具'
}

// 默认心情列表
const DEFAULT_MOOD_LIST = ['开心', '平静', '沉思', '感恩', '兴奋', '疲惫', '难过', '焦虑', '生气', '被爱', '创作', '怀旧']

// 响应式状态
const prompts = reactive({
  systemPrompt: '',
  userPromptTemplate: '',
  tagsPrompt: '',
  tagsOptimizePrompt: '',
  summaryPrompt: '',
  quickSearchPrompt: '',
  deepSearchPrompt: ''
})

// AI搜索配置
const aiSearchConfig = reactive({
  useSeparateAPI: false,
  apiBaseUrl: '',
  apiKey: '',
  model: 'gpt-4o-mini',
  quickMaxRounds: 3,
  deepMaxRounds: 6,
  temperature: 0.3,
  topP: 1.0,
  maxTokens: null,
  timeout: 60,
  enabledTools: {},
  moodList: [...DEFAULT_MOOD_LIST],
  // 高级开关选项
  enableStreaming: true,
  enableParallelTools: true,
  enableConversationMemory: true,
  enableAutoRetry: true,
  // 自定义工具说明
  customToolDescriptions: {}
})

// UI状态
const expandedSections = reactive({
  system: true,
  user: true,
  tags: true,
  summary: true,
  api: true,
  params: true,
  tools: true,
  moods: true
})

const newMood = ref('')
const moodError = ref('')
const saving = ref(false)
const importInput = ref(null)
const activePreviewTab = ref('system')
const copiedVariable = ref('')
const showApiKey = ref(false)
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

// 工具编辑状态
const editingTool = ref(null)
const customToolDescriptions = reactive({})

// 工具定义
const toolDefinitions = getToolDefinitions()

// 预览标签页
const previewTabs = [
  { key: 'system', label: '系统提示词' },
  { key: 'user', label: '用户提示词' },
  { key: 'tags', label: '标签生成(第一轮)' },
  { key: 'tagsOptimize', label: '标签优化(第二轮)' },
  { key: 'summary', label: '摘要生成' },
  { key: 'quickSearch', label: '快速搜索' },
  { key: 'deepSearch', label: '深度搜索' }
]

// 可用变量
const availableVariables = [
  { name: '{{title}}', desc: '日记标题', type: 'input' },
  { name: '{{mood}}', desc: '心情值', type: 'input' },
  { name: '{{moodLabel}}', desc: '心情标签', type: 'input' },
  { name: '{{moodIcon}}', desc: '心情图标', type: 'input' },
  { name: '{{date}}', desc: '日期', type: 'input' },
  { name: '{{content}}', desc: '日记内容', type: 'input' },
  { name: '{{style}}', desc: '风格描述', type: 'input' },
  { name: '{{styleLabel}}', desc: '风格标签', type: 'input' },
  { name: '{{styleRequirement}}', desc: '风格要求', type: 'input' },
  { name: '{{preset}}', desc: '用户期望', type: 'input' }
]

const tagsVariables = [
  { name: '{{title}}', desc: '日记标题' },
  { name: '{{content}}', desc: '日记内容' },
  { name: '{{moodLabel}}', desc: '心情标签' }
]

const tagsOptimizeVariables = [
  { name: '{{title}}', desc: '日记标题' },
  { name: '{{content}}', desc: '日记内容' },
  { name: '{{moodLabel}}', desc: '心情标签' },
  { name: '{{initialTags}}', desc: '第一轮生成的初步标签（JSON）' },
  { name: '{{existingTags}}', desc: '用户已有的所有标签列表' }
]

const summaryVariables = [
  { name: '{{title}}', desc: '日记标题' },
  { name: '{{content}}', desc: '日记内容' },
  { name: '{{mood}}', desc: '心情' }
]

const aiSearchVariables = [
  { name: '{{tools}}', desc: '可用工具清单JSON' },
  { name: '{{current_time}}', desc: '当前时间' },
  { name: '{{current_date}}', desc: '当前日期' },
  { name: '{{query}}', desc: '用户查询' },
  { name: '{{conversation}}', desc: '对话历史' },
  { name: '{{current_count}}', desc: '当前日记数量' },
  { name: '{{max_rounds}}', desc: '最大轮数' },
  { name: '{{enabled_tools}}', desc: '启用的工具列表' }
]

// 默认提示词
const defaultPrompts = {
  system: DEFAULT_SYSTEM_PROMPT,
  user: DEFAULT_USER_PROMPT_TEMPLATE,
  tags: DEFAULT_TAGS_PROMPT,
  tagsOptimize: DEFAULT_TAGS_OPTIMIZE_PROMPT,
  summary: DEFAULT_SUMMARY_PROMPT,
  quickSearch: DEFAULT_QUICK_SEARCH_PROMPT,
  deepSearch: DEFAULT_DEEP_SEARCH_PROMPT
}

// 切换展开/折叠
function toggleSection(section) {
  expandedSections[section] = !expandedSections[section]
}

// 获取行数
function getLineCount(text) {
  if (!text) return 1
  return text.split('\n').length
}

// 处理输入更新行号
function handleInput(field, event) {
  // 行号会自动更新，因为 getLineCount 是响应式的
  nextTick(() => {
    // 可以在这里添加其他输入处理逻辑
  })
}

// 滚动到指定区域
function scrollToSection(sectionId) {
  const element = document.getElementById(sectionId + '-section')
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

// 显示提示
function showToastMessage(message, type = 'success') {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

// 加载提示词和配置
async function loadPrompts() {
  // 加载提示词
  prompts.systemPrompt = await getConfig('systemPrompt', DEFAULT_SYSTEM_PROMPT)
  prompts.userPromptTemplate = await getConfig('userPromptTemplate', DEFAULT_USER_PROMPT_TEMPLATE)
  prompts.tagsPrompt = await getConfig('tagsPrompt', DEFAULT_TAGS_PROMPT)
  prompts.tagsOptimizePrompt = await getConfig('tagsOptimizePrompt', DEFAULT_TAGS_OPTIMIZE_PROMPT)
  prompts.summaryPrompt = await getConfig('summaryPrompt', DEFAULT_SUMMARY_PROMPT)
  prompts.quickSearchPrompt = await getConfig('quickSearchPrompt', DEFAULT_QUICK_SEARCH_PROMPT)
  prompts.deepSearchPrompt = await getConfig('deepSearchPrompt', DEFAULT_DEEP_SEARCH_PROMPT)
  
  // 加载AI搜索配置
  aiSearchConfig.useSeparateAPI = await getConfig('aiSearchUseSeparateAPI', false)
  aiSearchConfig.apiBaseUrl = await getConfig('aiSearchApiBaseUrl', '')
  aiSearchConfig.apiKey = await getConfig('aiSearchApiKey', '')
  aiSearchConfig.model = await getConfig('aiSearchModel', 'gpt-4o-mini')
  aiSearchConfig.quickMaxRounds = await getConfig('quickSearchMaxRounds', 3)
  aiSearchConfig.deepMaxRounds = await getConfig('deepSearchMaxRounds', 6)
  aiSearchConfig.temperature = await getConfig('aiSearchTemperature', 0.3)
  aiSearchConfig.topP = await getConfig('aiSearchTopP', 1.0)
  aiSearchConfig.maxTokens = await getConfig('aiSearchMaxTokens', null)
  aiSearchConfig.timeout = await getConfig('aiSearchTimeout', 60)
  aiSearchConfig.enabledTools = await getConfig('aiSearchEnabledTools', {})
  aiSearchConfig.moodList = await getConfig('aiSearchMoodList', DEFAULT_MOOD_LIST)
  // 加载高级开关选项
  aiSearchConfig.enableStreaming = await getConfig('aiSearchEnableStreaming', true)
  aiSearchConfig.enableParallelTools = await getConfig('aiSearchEnableParallelTools', true)
  aiSearchConfig.enableConversationMemory = await getConfig('aiSearchEnableConversationMemory', true)
  aiSearchConfig.enableAutoRetry = await getConfig('aiSearchEnableAutoRetry', true)
  // 加载自定义工具说明
  aiSearchConfig.customToolDescriptions = await getConfig('aiSearchCustomToolDescriptions', {})
  // 初始化customToolDescriptions
  Object.assign(customToolDescriptions, aiSearchConfig.customToolDescriptions)
}

// 保存提示词和配置
async function savePrompts() {
  saving.value = true
  try {
    // 保存提示词
    await setConfig('systemPrompt', prompts.systemPrompt)
    await setConfig('userPromptTemplate', prompts.userPromptTemplate)
    await setConfig('tagsPrompt', prompts.tagsPrompt)
    await setConfig('tagsOptimizePrompt', prompts.tagsOptimizePrompt)
    await setConfig('summaryPrompt', prompts.summaryPrompt)
    await setConfig('quickSearchPrompt', prompts.quickSearchPrompt)
    await setConfig('deepSearchPrompt', prompts.deepSearchPrompt)
    
    // 保存AI搜索配置
    await setConfig('aiSearchUseSeparateAPI', aiSearchConfig.useSeparateAPI)
    await setConfig('aiSearchApiBaseUrl', aiSearchConfig.apiBaseUrl)
    await setConfig('aiSearchApiKey', aiSearchConfig.apiKey)
    await setConfig('aiSearchModel', aiSearchConfig.model)
    await setConfig('quickSearchMaxRounds', aiSearchConfig.quickMaxRounds)
    await setConfig('deepSearchMaxRounds', aiSearchConfig.deepMaxRounds)
    await setConfig('aiSearchTemperature', aiSearchConfig.temperature)
    await setConfig('aiSearchTopP', aiSearchConfig.topP)
    await setConfig('aiSearchMaxTokens', aiSearchConfig.maxTokens)
    await setConfig('aiSearchTimeout', aiSearchConfig.timeout)
    // 使用 JSON.parse/stringify 解除 Proxy 对象
    await setConfig('aiSearchEnabledTools', JSON.parse(JSON.stringify(aiSearchConfig.enabledTools)))
    await setConfig('aiSearchMoodList', JSON.parse(JSON.stringify(aiSearchConfig.moodList)))
    // 保存高级开关选项
    await setConfig('aiSearchEnableStreaming', aiSearchConfig.enableStreaming)
    await setConfig('aiSearchEnableParallelTools', aiSearchConfig.enableParallelTools)
    await setConfig('aiSearchEnableConversationMemory', aiSearchConfig.enableConversationMemory)
    await setConfig('aiSearchEnableAutoRetry', aiSearchConfig.enableAutoRetry)
    // 保存自定义工具说明
    await setConfig('aiSearchCustomToolDescriptions', JSON.parse(JSON.stringify(aiSearchConfig.customToolDescriptions || {})))
    
    showToastMessage('提示词设置已保存')
  } catch (error) {
    console.error('[PromptSettings] 保存失败:', error)
    showToastMessage('保存失败: ' + error.message, 'error')
  } finally {
    saving.value = false
  }
}

// 重置单个提示词
function resetPrompt(type) {
  if (!confirm(`确定要恢复${type}提示词的默认设置吗？`)) return
  
  switch (type) {
    case 'system':
      prompts.systemPrompt = defaultPrompts.system
      break
    case 'user':
      prompts.userPromptTemplate = defaultPrompts.user
      break
    case 'tags':
      prompts.tagsPrompt = defaultPrompts.tags
      prompts.tagsOptimizePrompt = defaultPrompts.tagsOptimize
      break
    case 'summary':
      prompts.summaryPrompt = defaultPrompts.summary
      break
    case 'quickSearch':
      prompts.quickSearchPrompt = defaultPrompts.quickSearch
      break
    case 'deepSearch':
      prompts.deepSearchPrompt = defaultPrompts.deepSearch
      break
  }
  showToastMessage('已恢复默认设置')
}

// 切换工具启用状态
function toggleTool(key) {
  aiSearchConfig.enabledTools[key] = !aiSearchConfig.enabledTools[key]
}

// 启用所有工具
function enableAllTools() {
  Object.keys(toolDefinitions).forEach(key => {
    aiSearchConfig.enabledTools[key] = true
  })
}

// 禁用所有工具
function disableAllTools() {
  Object.keys(toolDefinitions).forEach(key => {
    aiSearchConfig.enabledTools[key] = false
  })
}

// 切换工具编辑状态
function toggleToolEdit(key) {
  if (editingTool.value === key) {
    editingTool.value = null
  } else {
    editingTool.value = key
    // 初始化自定义描述（如果不存在）
    if (!customToolDescriptions[key]) {
      customToolDescriptions[key] = aiSearchConfig.customToolDescriptions?.[key] || ''
    }
  }
}

// 获取工具使用说明（优先使用自定义）
function getToolUsage(key) {
  const custom = aiSearchConfig.customToolDescriptions?.[key]
  if (custom && custom.trim()) {
    return custom
  }
  const tool = toolDefinitions[key]
  return tool.when_to_use?.[0] || '根据需要调用'
}

// 保存工具描述
function saveToolDescription(key) {
  if (!aiSearchConfig.customToolDescriptions) {
    aiSearchConfig.customToolDescriptions = {}
  }
  aiSearchConfig.customToolDescriptions[key] = customToolDescriptions[key] || ''
  editingTool.value = null
  showToastMessage('工具说明已保存')
}

// 重置单个工具描述
function resetToolDescription(key) {
  customToolDescriptions[key] = ''
  if (aiSearchConfig.customToolDescriptions) {
    aiSearchConfig.customToolDescriptions[key] = ''
  }
  showToastMessage('已恢复默认说明')
}

// 重置所有工具描述
function resetAllToolDescriptions() {
  if (!confirm('确定要重置所有工具的自定义说明吗？')) return
  
  Object.keys(customToolDescriptions).forEach(key => {
    customToolDescriptions[key] = ''
  })
  aiSearchConfig.customToolDescriptions = {}
  showToastMessage('所有工具说明已重置')
}

// 处理心情输入
function handleMoodInput() {
  moodError.value = ''
}

// 添加心情
function addMood() {
  const mood = newMood.value.trim()
  if (!mood) return
  
  if (aiSearchConfig.moodList.includes(mood)) {
    moodError.value = '该心情已存在'
    return
  }
  
  aiSearchConfig.moodList.push(mood)
  newMood.value = ''
  moodError.value = ''
  showToastMessage('心情添加成功')
}

// 移除心情
function removeMood(index) {
  aiSearchConfig.moodList.splice(index, 1)
  showToastMessage('心情已移除')
}

// 重置心情列表
function resetMoodList() {
  if (!confirm('确定要恢复默认心情列表吗？')) return
  aiSearchConfig.moodList = [...DEFAULT_MOOD_LIST]
  showToastMessage('已恢复默认心情列表')
}

// 插入变量
function insertVariable(field, variable) {
  const textarea = document.querySelector(`textarea[v-model="prompts.${field}"]`)
  if (!textarea) return
  
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const text = prompts[field]
  
  prompts[field] = text.substring(0, start) + variable + text.substring(end)
  
  // 显示复制提示
  copiedVariable.value = variable
  setTimeout(() => {
    copiedVariable.value = ''
  }, 1000)
  
  // 恢复焦点
  nextTick(() => {
    textarea.focus()
    textarea.setSelectionRange(start + variable.length, start + variable.length)
  })
}

// 导出提示词
function exportPrompts() {
  const data = {
    version: '3.0.0',
    exportTime: new Date().toISOString(),
    prompts: JSON.parse(JSON.stringify(prompts)),
    aiSearchConfig: {
      quickMaxRounds: aiSearchConfig.quickMaxRounds,
      deepMaxRounds: aiSearchConfig.deepMaxRounds,
      temperature: aiSearchConfig.temperature,
      enabledTools: JSON.parse(JSON.stringify(aiSearchConfig.enabledTools)),
      moodList: JSON.parse(JSON.stringify(aiSearchConfig.moodList))
    }
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `ink-diary-prompts-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
  
  showToastMessage('配置已导出')
}

// 触发导入
function triggerImport() {
  importInput.value?.click()
}

// 处理导入
function handleImport(event) {
  const file = event.target.files[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result)
      
      if (data.prompts) {
        Object.assign(prompts, data.prompts)
      }
      
      if (data.aiSearchConfig) {
        Object.assign(aiSearchConfig, data.aiSearchConfig)
      }
      
      showToastMessage('配置已导入，请保存以生效')
    } catch (error) {
      console.error('[PromptSettings] 导入失败:', error)
      showToastMessage('导入失败: ' + error.message, 'error')
    }
  }
  reader.readAsText(file)
  
  // 清空input，允许重复选择同一文件
  event.target.value = ''
}

// 预览内容
const previewContent = computed(() => {
  let content = ''
  
  switch (activePreviewTab.value) {
    case 'system':
      content = prompts.systemPrompt
      break
    case 'user':
      content = prompts.userPromptTemplate
        .replace(/\{\{title\}\}/g, previewSampleData.title)
        .replace(/\{\{mood\}\}/g, previewSampleData.mood)
        .replace(/\{\{moodLabel\}\}/g, previewSampleData.moodLabel)
        .replace(/\{\{moodIcon\}\}/g, previewSampleData.moodIcon)
        .replace(/\{\{date\}\}/g, previewSampleData.date)
        .replace(/\{\{content\}\}/g, previewSampleData.content)
        .replace(/\{\{style\}\}/g, previewSampleData.style)
        .replace(/\{\{styleLabel\}\}/g, previewSampleData.styleLabel)
        .replace(/\{\{styleRequirement\}\}/g, previewSampleData.styleRequirement)
        .replace(/\{\{preset\}\}/g, previewSampleData.preset)
      break
    case 'tags':
      content = prompts.tagsPrompt
        .replace(/\{\{title\}\}/g, previewSampleData.title)
        .replace(/\{\{content\}\}/g, previewSampleData.content)
        .replace(/\{\{moodLabel\}\}/g, previewSampleData.moodLabel)
      break
    case 'tagsOptimize':
      content = prompts.tagsOptimizePrompt
        .replace(/\{\{title\}\}/g, previewSampleData.title)
        .replace(/\{\{content\}\}/g, previewSampleData.content)
        .replace(/\{\{moodLabel\}\}/g, previewSampleData.moodLabel)
        .replace(/\{\{initialTags\}\}/g, JSON.stringify(['公园', '散步', '朋友', '阳光'], null, 2))
        .replace(/\{\{existingTags\}\}/g, '旅行, 美食, 工作, 学习, 运动, 阅读, 电影, 音乐')
      break
    case 'summary':
      content = prompts.summaryPrompt
        .replace(/\{\{title\}\}/g, previewSampleData.title)
        .replace(/\{\{content\}\}/g, previewSampleData.content)
        .replace(/\{\{mood\}\}/g, previewSampleData.mood)
      break
    case 'quickSearch':
      content = prompts.quickSearchPrompt
        .replace(/\{\{tools\}\}/g, previewSampleData.tools)
        .replace(/\{\{current_time\}\}/g, previewSampleData.current_time)
        .replace(/\{\{current_date\}\}/g, previewSampleData.current_date)
        .replace(/\{\{query\}\}/g, previewSampleData.query)
        .replace(/\{\{max_rounds\}\}/g, String(aiSearchConfig.quickMaxRounds))
        .replace(/\{\{enabled_tools\}\}/g, previewSampleData.enabled_tools)
      break
    case 'deepSearch':
      content = prompts.deepSearchPrompt
        .replace(/\{\{tools\}\}/g, previewSampleData.tools)
        .replace(/\{\{current_time\}\}/g, previewSampleData.current_time)
        .replace(/\{\{current_date\}\}/g, previewSampleData.current_date)
        .replace(/\{\{query\}\}/g, previewSampleData.query)
        .replace(/\{\{max_rounds\}\}/g, String(aiSearchConfig.deepMaxRounds))
        .replace(/\{\{enabled_tools\}\}/g, previewSampleData.enabled_tools)
      break
  }
  
  return content
})

// 初始化
onMounted(() => {
  loadPrompts()
})
</script>

<style scoped>
/* ==================== 基础样式 ==================== */
.prompt-settings {
  max-width: 1000px;
  margin: 0 auto;
  padding: 32px 24px;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ==================== 页面标题 ==================== */
.prompt-settings__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.title-wrapper {
  flex: 1;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 12px 0;
  font-family: 'Noto Serif SC', serif;
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  font-size: 36px;
  animation: sparkle 2s ease-in-out infinite;
}

@keyframes sparkle {
  0%, 100% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.1) rotate(5deg); }
}

.page-subtitle {
  font-size: 15px;
  color: #7f8c8d;
  margin: 0;
  line-height: 1.6;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.header-btn {
  width: 44px;
  height: 44px;
  border: none;
  background: white;
  border-radius: 12px;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.header-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.25);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header-btn:hover span {
  filter: brightness(0) invert(1);
}

/* ==================== 墨迹分隔线 ==================== */
.ink-divider {
  height: 4px;
  background: linear-gradient(90deg, 
    transparent 0%,
    #667eea 15%,
    #764ba2 50%,
    #667eea 85%,
    transparent 100%
  );
  margin: 32px 0;
  position: relative;
  border-radius: 2px;
  opacity: 0.6;
}

.ink-drop {
  position: absolute;
  top: 50%;
  width: 12px;
  height: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  transform: translateY(-50%);
  animation: inkPulse 2s ease-in-out infinite;
}

.ink-drop:nth-child(1) {
  left: 15%;
  animation-delay: 0s;
}

.ink-drop:nth-child(2) {
  left: 50%;
  animation-delay: 0.5s;
}

.ink-drop:nth-child(3) {
  right: 15%;
  animation-delay: 1s;
}

@keyframes inkPulse {
  0%, 100% { 
    transform: translateY(-50%) scale(1);
    opacity: 0.6;
  }
  50% { 
    transform: translateY(-50%) scale(1.3);
    opacity: 1;
  }
}

/* ==================== 内容区域 ==================== */
.prompt-settings__content {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

/* ==================== 分组标题 ==================== */
.section-group {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-group-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 8px;
  margin-bottom: 8px;
}

.group-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
  animation: iconFloat 3s ease-in-out infinite;
}

@keyframes iconFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.group-title h2 {
  font-size: 22px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 4px 0;
}

.group-title p {
  font-size: 14px;
  color: #7f8c8d;
  margin: 0;
}

/* ==================== 可折叠区域 ==================== */
.settings-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.settings-section:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.settings-section.collapsible {
  padding: 0;
  overflow: hidden;
}

.settings-section.collapsible.expanded {
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  cursor: pointer;
  transition: background 0.2s;
  user-select: none;
}

.section-header:hover {
  background: #fafafa;
}

.section-title-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  color: white;
  transition: transform 0.3s;
}

.section-header:hover .section-icon {
  transform: scale(1.1) rotate(5deg);
}

.section-title {
  font-size: 17px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.section-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.expand-icon {
  font-size: 12px;
  color: #7f8c8d;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.expand-icon.rotated {
  transform: rotate(180deg);
}

.section-content {
  padding: 0 24px 24px;
}

.section-desc {
  font-size: 14px;
  color: #7f8c8d;
  margin: 0 0 16px 0;
  line-height: 1.5;
}

/* 展开/折叠动画 */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 2000px;
  opacity: 1;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}

/* ==================== 编辑器与行号 ==================== */
.editor-wrapper {
  display: flex;
  border: 2px solid #e8e8e8;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
  background: #fafafa;
}

.editor-wrapper:focus-within {
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.line-numbers {
  display: flex;
  flex-direction: column;
  padding: 16px 12px;
  background: #f5f5f5;
  border-right: 1px solid #e8e8e8;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  color: #999;
  text-align: right;
  line-height: 1.6;
  user-select: none;
  min-width: 40px;
}

.line-numbers span {
  display: block;
}

.prompt-editor {
  flex: 1;
  padding: 16px;
  border: none;
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;
  font-family: 'Consolas', 'Monaco', monospace;
  background: transparent;
  outline: none;
  min-height: 120px;
}

.prompt-editor.with-line-numbers {
  padding-left: 16px;
}

/* ==================== 变量标签 ==================== */
.variables-help {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #f8f9fa 0%, #f0f4ff 100%);
  border-radius: 12px;
  border: 1px solid #e0e7ff;
}

.variables-help.compact {
  padding: 12px 16px;
}

.variables-label {
  font-size: 13px;
  font-weight: 500;
  color: #667eea;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  flex-shrink: 0;
}

.variables-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex: 1;
}

.variable-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: monospace;
  position: relative;
  overflow: hidden;
}

.variable-tag:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.variable-tag.copied {
  background: #10b981;
  border-color: #10b981;
  color: white;
  animation: copiedPulse 0.5s ease;
}

@keyframes copiedPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.variable-tag .var-name {
  font-weight: 500;
}

.variable-tag .var-desc {
  font-size: 11px;
  opacity: 0.7;
}

.variable-tag.ai-variable {
  border-color: #667eea;
  color: #667eea;
}

.variable-tag.ai-variable:hover {
  background: #667eea;
  color: white;
}

/* ==================== AI搜索区域 ==================== */
.ai-search-group .section-group-header .group-icon {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  box-shadow: 0 4px 16px rgba(245, 158, 11, 0.3);
}

/* ==================== AI配置卡片 ==================== */
.ai-config-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.ai-config-card:hover {
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
}

.ai-config-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  cursor: pointer;
  transition: background 0.2s;
  user-select: none;
}

.ai-config-header:hover {
  background: #fafafa;
}

.ai-config-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: transform 0.3s;
}

.ai-config-header:hover .ai-config-icon {
  transform: scale(1.1) rotate(5deg);
}

.ai-config-title {
  flex: 1;
}

.ai-config-title h3 {
  font-size: 17px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 4px 0;
}

.ai-config-title p {
  font-size: 13px;
  color: #7f8c8d;
  margin: 0;
}

.ai-config-content {
  padding: 0 24px 24px;
}

/* ==================== 现代化复选框 ==================== */
.modern-checkbox {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  transition: all 0.2s;
}

.modern-checkbox:hover {
  background: #e9ecef;
}

.checkbox-wrapper {
  position: relative;
  width: 52px;
  height: 28px;
}

.checkbox-wrapper input {
  opacity: 0;
  width: 0;
  height: 0;
}

.checkbox-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 28px;
}

.checkbox-slider:before {
  position: absolute;
  content: "";
  height: 22px;
  width: 22px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

input:checked + .checkbox-slider {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

input:checked + .checkbox-slider:before {
  transform: translateX(24px);
}

.checkbox-text {
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
}

/* ==================== 表单样式 ==================== */
.api-config-fields {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 16px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  max-height: 500px;
  opacity: 1;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 13px;
  font-weight: 600;
  color: #2c3e50;
}

.label-icon {
  margin-right: 4px;
}

.modern-input {
  padding: 12px 16px;
  border: 2px solid #e8e8e8;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.2s;
  background: #fafafa;
}

.modern-input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.password-input-wrapper {
  position: relative;
}

.password-input-wrapper .modern-input {
  padding-right: 48px;
}

.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.toggle-password:hover {
  opacity: 1;
}

.form-hint {
  font-size: 12px;
  color: #7f8c8d;
  display: flex;
  align-items: center;
  gap: 4px;
}

.hint-icon {
  font-size: 14px;
}

/* ==================== 参数卡片 ==================== */
.modern-params {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.param-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 12px;
  padding: 20px;
  border: 2px solid #f0f0f0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.param-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.15);
  transform: translateY(-2px);
}

.param-card.quick-mode {
  border-left: 4px solid #f59e0b;
}

.param-card.deep-mode {
  border-left: 4px solid #8b5cf6;
}

.param-card.temp-mode {
  border-left: 4px solid #10b981;
}

.param-icon {
  width: 44px;
  height: 44px;
  background: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s;
}

.param-card:hover .param-icon {
  transform: scale(1.1);
}

.param-content {
  flex: 1;
}

.param-label {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 10px;
  display: block;
}

.param-control {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.param-control.slider-control {
  gap: 16px;
}

.param-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: #f0f0f0;
  border-radius: 10px;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.param-btn:hover {
  background: #667eea;
  color: white;
  transform: scale(1.1);
}

.param-btn:active {
  transform: scale(0.95);
}

.modern-number {
  width: 64px;
  text-align: center;
  padding: 10px;
  border: 2px solid #e8e8e8;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.2s;
}

.modern-number:focus {
  outline: none;
  border-color: #667eea;
}

.param-slider {
  flex: 1;
  height: 8px;
  border-radius: 4px;
  background: #e8e8e8;
  outline: none;
  -webkit-appearance: none;
}

.param-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
  transition: transform 0.2s;
}

.param-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.param-value {
  font-size: 18px;
  font-weight: 700;
  color: #667eea;
  min-width: 48px;
  text-align: right;
}

.param-hint {
  font-size: 12px;
  color: #7f8c8d;
}

/* ==================== 提示词卡片 ==================== */
.ai-prompts-section {
  margin-top: 8px;
}

.ai-section-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.ai-section-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
  animation: iconFloat 3s ease-in-out infinite;
}

.ai-section-title h3 {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 4px 0;
}

.ai-section-title p {
  font-size: 14px;
  color: #7f8c8d;
  margin: 0;
}

.prompt-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
  margin-bottom: 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.prompt-card:hover {
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.prompt-card.quick-prompt {
  border-top: 4px solid #f59e0b;
}

.prompt-card.deep-prompt {
  border-top: 4px solid #8b5cf6;
}

.prompt-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.prompt-mode-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
}

.prompt-mode-badge.quick {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
}

.prompt-mode-badge.deep {
  background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
  color: #5b21b6;
}

.mode-icon {
  font-size: 18px;
}

.prompt-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 8px 16px;
  border: 1px solid #e8e8e8;
  background: white;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.action-btn:hover {
  background: #f8f9fa;
  border-color: #667eea;
  color: #667eea;
  transform: translateY(-1px);
}

.action-btn.reset:hover {
  background: #fee2e2;
  border-color: #ef4444;
  color: #dc2626;
}

.prompt-info {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 10px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #666;
}

.info-item.highlight {
  color: #667eea;
  font-weight: 500;
}

.info-icon {
  font-size: 14px;
}

.modern-variables {
  background: linear-gradient(135deg, #f0f7ff 0%, #e6f0ff 100%);
  border: 1px solid #bfdbfe;
  border-radius: 10px;
  padding: 12px 16px;
  margin-bottom: 16px;
}

.var-icon {
  margin-right: 4px;
}

.modern-editor {
  background: #fafafa;
  border: none;
  border-radius: 0;
  padding: 0;
  font-size: 14px;
  line-height: 1.6;
}

.modern-tips {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border: 1px solid #6ee7b7;
  border-radius: 10px;
  padding: 12px 16px;
  margin-top: 16px;
}

.tips-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.modern-tips p {
  margin: 0;
  font-size: 13px;
  color: #065f46;
  line-height: 1.5;
}

/* ==================== 工具配置 ==================== */
.tools-config {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tool-config-item {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.tool-config-item:hover {
  background: #f0f4ff;
  border-color: #c7d2fe;
}

.tool-config-item.enabled {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-color: #86efac;
}

.tool-checkbox {
  display: flex;
  align-items: center;
  gap: 12px;
}

.custom-checkbox {
  width: 22px;
  height: 22px;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  background: white;
}

.tool-config-item:hover .custom-checkbox {
  border-color: #667eea;
}

.custom-checkbox.checked {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  color: white;
}

.tool-name {
  font-size: 15px;
  font-weight: 600;
  color: #2c3e50;
}

.tool-desc {
  font-size: 13px;
  color: #666;
  margin: 8px 0 0 34px;
  line-height: 1.5;
}

.tool-usage {
  margin: 8px 0 0 34px;
  font-size: 12px;
}

.usage-label {
  color: #667eea;
  font-weight: 500;
}

.usage-text {
  color: #7f8c8d;
}

/* ==================== 心情列表 ==================== */
.mood-list-editor {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mood-input-row {
  display: flex;
  gap: 12px;
}

.mood-input-wrapper {
  flex: 1;
  position: relative;
}

.mood-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e8e8e8;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.2s;
  background: #fafafa;
}

.mood-input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.mood-error {
  position: absolute;
  bottom: -20px;
  left: 0;
  font-size: 12px;
  color: #ef4444;
}

.mood-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.mood-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20px;
  font-size: 14px;
  transition: all 0.2s;
}

.mood-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.mood-remove {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  padding: 2px 6px;
  border-radius: 50%;
  transition: all 0.2s;
}

.mood-remove:hover {
  background: rgba(255, 255, 255, 0.4);
  transform: scale(1.1);
}

/* 心情标签动画 */
.mood-tag-enter-active,
.mood-tag-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.mood-tag-enter-from,
.mood-tag-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(-10px);
}

/* ==================== 预览区域 ==================== */
.preview-section {
  background: linear-gradient(135deg, #f8f9fa 0%, #f0f4ff 100%);
}

.preview-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.preview-tab {
  padding: 10px 18px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.preview-tab:hover {
  border-color: #667eea;
  color: #667eea;
  transform: translateY(-1px);
}

.preview-tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.preview-content {
  background: #1e293b;
  border-radius: 12px;
  padding: 20px;
  overflow-x: auto;
  border: 1px solid #334155;
}

.preview-content pre {
  margin: 0;
  color: #e2e8f0;
  font-size: 13px;
  line-height: 1.7;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'Consolas', 'Monaco', 'Fira Code', monospace;
}

/* 预览切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(5px);
}

/* ==================== 悬浮操作栏 ==================== */
.floating-dock {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  animation: dock-slide-up 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.floating-dock__content {
  position: relative;
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 10px 16px;
  /* 多层渐变营造磨砂玻璃深度感 */
  background:
    /* 顶部高光 */
    linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.9) 0%,
      rgba(255, 255, 255, 0.5) 20%,
      transparent 50%
    ),
    /* 主体渐变 */
    linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.6) 0%,
      rgba(255, 255, 255, 0.3) 50%,
      rgba(139, 69, 19, 0.05) 100%
    );
  /* 增强磨砂效果 */
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  /* 统一圆角 */
  border-radius: 16px;
  /* 立体边框 */
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-top: 1px solid rgba(255, 255, 255, 0.8);
  border-bottom: 1px solid rgba(139, 69, 19, 0.1);
  /* 多层阴影营造立体感 */
  box-shadow:
    /* 顶部高光边缘 */
    inset 0 1px 0 rgba(255, 255, 255, 0.9),
    /* 内部柔和光 */
    inset 0 0 20px rgba(255, 255, 255, 0.2),
    /* 底部暗部 */
    inset 0 -2px 4px rgba(139, 69, 19, 0.05),
    /* 外发光 */
    0 0 0 1px rgba(255, 255, 255, 0.3),
    /* 主阴影 */
    0 8px 32px rgba(0, 0, 0, 0.12),
    0 4px 16px rgba(0, 0, 0, 0.08),
    /* 顶部反光 */
    0 -2px 8px rgba(255, 255, 255, 0.5);
}

/* 玻璃边缘高光效果 */
.floating-dock__content::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.4) 0%,
    transparent 30%,
    transparent 70%,
    rgba(139, 69, 19, 0.08) 100%
  );
  border-radius: 18px;
  z-index: -1;
  opacity: 0.6;
  filter: blur(2px);
}

/* 顶部光泽线条 */
.floating-dock__content::after {
  content: '';
  position: absolute;
  top: 4px;
  left: 15%;
  right: 15%;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.9) 30%,
    rgba(255, 255, 255, 0.9) 70%,
    transparent 100%
  );
  border-radius: 1px;
  box-shadow: 0 0 4px rgba(255, 255, 255, 0.8);
}

/* 考虑左侧导航栏的偏移（桌面端） */
@media (min-width: 769px) {
  .floating-dock {
    left: calc(50% + 100px); /* 200px 导航栏的一半 */
    transform: translateX(-50%);
  }
  
  .app-nav.nav-collapsed ~ .floating-dock,
  .app-main:has(.nav-collapsed) ~ .floating-dock {
    left: calc(50% + 42px); /* 84px 折叠导航栏的一半 */
  }
}

/* 移动端：避开底部导航栏 */
@media (max-width: 768px) {
  .floating-dock {
    bottom: 90px; /* 底部导航栏高度约 70px + 间距 */
    left: 50%;
    transform: translateX(-50%);
  }
}

@keyframes dock-slide-up {
  0% {
    transform: translateX(-50%) translateY(100px);
    opacity: 0;
  }
  100% {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
}

/* Dock 栏按钮样式 - 玻璃效果 */
.dock-btn {
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
}

.dock-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* 主要按钮（保存）特殊样式 - 玻璃效果 */
.dock-btn--primary {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.4);
  font-weight: 500;
  position: relative;
  overflow: hidden;
}

/* 玻璃光泽效果 */
.dock-btn--primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.3) 50%,
    transparent 100%
  );
  transition: left 0.5s ease;
}

.dock-btn--primary:hover::before {
  left: 100%;
}

.dock-btn--primary:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.6);
  box-shadow: 
    inset 0 1px 0 rgba(255, 255, 255, 0.4),
    0 4px 16px rgba(0, 0, 0, 0.1);
}

/* 桌面端优化 */
@media (min-width: 769px) {
  .floating-dock__content {
    padding: 12px 20px;
    gap: 12px;
  }
  
  .dock-btn {
    padding: 10px 20px;
    font-size: 0.9375rem;
  }
}

.hidden {
  display: none;
}

/* ==================== 提示区域 ==================== */
.tips-section {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  border-radius: 16px;
  padding: 28px;
  border: 1px solid #fde68a;
}

.tips-section h3 {
  font-size: 17px;
  color: #92400e;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.tips-section h3:last-of-type {
  margin-top: 24px;
}

.tips-section ul {
  margin: 0;
  padding-left: 24px;
  color: #666;
  font-size: 14px;
  line-height: 2;
}

.tips-section li {
  margin-bottom: 4px;
}

.tips-section strong {
  color: #92400e;
}

/* ==================== Toast提示 ==================== */
.toast-message {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

.toast-message.success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.toast-message.error {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.toast-icon {
  font-size: 18px;
  font-weight: 700;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

/* ==================== 高级开关选项 ==================== */
.advanced-switches {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}

.switch-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  transition: all 0.2s;
}

.switch-item:hover {
  background: #f0f4ff;
}

.modern-switch {
  position: relative;
  display: inline-block;
  width: 52px;
  height: 28px;
  flex-shrink: 0;
}

.modern-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.switch-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 28px;
}

.switch-slider:before {
  position: absolute;
  content: "";
  height: 22px;
  width: 22px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.modern-switch input:checked + .switch-slider {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.modern-switch input:checked + .switch-slider:before {
  transform: translateX(24px);
}

.switch-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.switch-label {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
}

.switch-desc {
  font-size: 12px;
  color: #7f8c8d;
  line-height: 1.4;
}

/* 参数卡片新样式 */
.param-card.topp-mode {
  border-left: 4px solid #ec4899;
}

.param-card.tokens-mode {
  border-left: 4px solid #10b981;
}

.param-card.timeout-mode {
  border-left: 4px solid #f59e0b;
}

/* ==================== 工具配置编辑样式 ==================== */
.tool-config-item {
  transition: all 0.3s;
}

.tool-config-item.expanded {
  background: #f0f7ff;
  border-color: #bfdbfe;
}

.tool-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: pointer;
  position: relative;
  padding-right: 40px;
}

.tool-edit-btn {
  position: absolute;
  right: 0;
  top: 0;
  width: 32px;
  height: 32px;
  border: none;
  background: #f0f0f0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tool-edit-btn:hover {
  background: #667eea;
  color: white;
  transform: scale(1.1);
}

.tool-edit-btn.active {
  background: #ef4444;
  color: white;
}

.tool-edit-panel {
  margin-top: 16px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  border: 1px solid #e0e7ff;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  max-height: 500px;
  opacity: 1;
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
}

.edit-section {
  margin-bottom: 16px;
}

.edit-section.default-section {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 10px;
  border-left: 3px solid #9ca3af;
}

.edit-section.custom-section {
  margin-top: 20px;
}

.edit-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 12px;
}

.default-description {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.7;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.default-description p {
  margin: 0 0 8px 0;
}

.default-description p:last-child {
  margin-bottom: 0;
}

.default-description p::before {
  content: "•";
  color: #9ca3af;
  margin-right: 8px;
}

.tool-edit-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e8e8e8;
  border-radius: 10px;
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;
  font-family: 'Consolas', 'Monaco', monospace;
  background: #fafafa;
  transition: all 0.2s;
}

.tool-edit-textarea:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.edit-hint {
  font-size: 12px;
  color: #7f8c8d;
  margin: 8px 0 0 0;
}

.edit-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.edit-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.edit-btn.reset {
  background: #f3f4f6;
  color: #6b7280;
}

.edit-btn.reset:hover {
  background: #fee2e2;
  color: #dc2626;
}

.edit-btn.save {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.edit-btn.save:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* 批量操作按钮 */
.tools-batch-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
  flex-wrap: wrap;
}

.batch-btn {
  padding: 10px 20px;
  border: 1px solid #e8e8e8;
  background: white;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
}

.batch-btn:hover {
  background: #f8f9fa;
  border-color: #667eea;
  color: #667eea;
  transform: translateY(-1px);
}

/* ==================== 响应式 ==================== */
@media (max-width: 768px) {
  .prompt-settings {
    padding: 20px 16px;
  }
  
  .prompt-settings__header {
    flex-direction: column;
    gap: 16px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }
  
  .page-title {
    font-size: 26px;
  }
  
  .section-group-header {
    flex-direction: column;
    text-align: center;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .modern-params {
    grid-template-columns: 1fr;
  }
  
  .param-card {
    flex-direction: column;
    text-align: center;
  }
  
  .prompt-card-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .ai-config-header {
    flex-direction: column;
    text-align: center;
  }
  
  .ai-section-header {
    flex-direction: column;
    text-align: center;
  }
  
  .variables-help {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .preview-tabs {
    justify-content: center;
  }
  
  .floating-dock__content {
    gap: 6px;
    padding: 6px 10px;
  }
  
  .mood-input-row {
    flex-direction: column;
  }
  
  .section-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .section-actions {
    width: 100%;
    justify-content: space-between;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 22px;
  }
  
  .group-icon {
    width: 48px;
    height: 48px;
    font-size: 24px;
  }
  
  .group-title h2 {
    font-size: 18px;
  }
  
  .settings-section {
    padding: 16px;
  }
  
  .section-content {
    padding: 0 16px 16px;
  }
}

/* ==================== 子区域样式 ==================== */
.prompt-subsection {
  margin-bottom: 24px;
  padding: 20px;
  background: #fafafa;
  border-radius: 12px;
  border: 1px solid #e8e8e8;
}

.prompt-subsection:last-child {
  margin-bottom: 0;
}

.subsection-title {
  font-size: 15px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.step-badge {
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
}

.prompt-subsection:nth-child(2) .step-badge {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}
</style>
