<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="welcome-overlay">
        <div class="welcome-dialog">
          <!-- 左侧装饰 -->
          <div class="welcome-decoration">
            <div class="ink-stamp">墨</div>
            <div class="decoration-line"></div>
            <div class="decoration-pattern"></div>
          </div>

          <!-- 右侧内容 -->
          <div class="welcome-content">
            <!-- 头部 -->
            <div class="welcome-header">
              <h1 class="welcome-title">
                <span class="title-icon">📜</span>
                欢迎使用墨记
              </h1>
              <p class="welcome-subtitle">您的私密数字文房</p>
            </div>

            <!-- 功能介绍 -->
            <div class="features-section">
              <h3 class="section-title">
                <span class="section-icon">✨</span>
                核心功能
              </h3>
              <div class="features-grid">
                <div class="feature-card" style="--delay: 0.1s">
                  <div class="feature-icon-wrapper">
                    <span class="feature-icon">📝</span>
                  </div>
                  <div class="feature-info">
                    <h4>撰写日记</h4>
                    <p>使用 Markdown 编辑器记录生活点滴，支持实时预览和图文混排</p>
                  </div>
                </div>
                <div class="feature-card" style="--delay: 0.2s">
                  <div class="feature-icon-wrapper">
                    <span class="feature-icon">🔒</span>
                  </div>
                  <div class="feature-info">
                    <h4>本地存储</h4>
                    <p>所有数据仅保存在您的设备上，不上传云端，保护隐私安全</p>
                  </div>
                </div>
                <div class="feature-card" style="--delay: 0.3s">
                  <div class="feature-icon-wrapper">
                    <span class="feature-icon">🎨</span>
                  </div>
                  <div class="feature-info">
                    <h4>心情标签</h4>
                    <p>为每篇日记选择心情标签和视觉风格，让记录更生动</p>
                  </div>
                </div>
                <div class="feature-card" style="--delay: 0.4s">
                  <div class="feature-icon-wrapper">
                    <span class="feature-icon">🔍</span>
                  </div>
                  <div class="feature-info">
                    <h4>智能搜索</h4>
                    <p>快速搜索日记内容，支持关键词匹配和可选的 AI 语义搜索</p>
                  </div>
                </div>
                <div class="feature-card" style="--delay: 0.5s">
                  <div class="feature-icon-wrapper">
                    <span class="feature-icon">📤</span>
                  </div>
                  <div class="feature-info">
                    <h4>数据管理</h4>
                    <p>支持加密导出、导入和备份，完整掌控自己的数据</p>
                  </div>
                </div>
                <div class="feature-card" style="--delay: 0.6s">
                  <div class="feature-icon-wrapper">
                    <span class="feature-icon">🤖</span>
                  </div>
                  <div class="feature-info">
                    <h4>AI 功能</h4>
                    <p>可选的 AI 辅助功能，需自行配置 API 密钥（完全自愿）</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 快速开始 -->
            <div class="quick-start-section">
              <h3 class="section-title">
                <span class="section-icon">🚀</span>
                快速开始
              </h3>
              <div class="steps-list">
                <div class="step-item" style="--step-index: 0">
                  <div class="step-number">1</div>
                  <div class="step-content">
                    <h4>创建第一篇日记</h4>
                    <p>点击左侧菜单的"新建"按钮，开始记录您的生活点滴</p>
                  </div>
                </div>
                <div class="step-item" style="--step-index: 1">
                  <div class="step-number">2</div>
                  <div class="step-content">
                    <h4>浏览日记阁</h4>
                    <p>在"日记阁"中查看、搜索和管理您的所有日记</p>
                  </div>
                </div>
                <div class="step-item" style="--step-index: 2">
                  <div class="step-number">3</div>
                  <div class="step-content">
                    <h4>配置 AI 功能（可选）</h4>
                    <p>如需使用 AI 搜索，前往"设置"配置 API 密钥</p>
                  </div>
                </div>
                <div class="step-item" style="--step-index: 3">
                  <div class="step-number">4</div>
                  <div class="step-content">
                    <h4>定期备份数据</h4>
                    <p>使用导出功能定期备份，防止浏览器数据丢失</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 重要提示 -->
            <div class="tips-section">
              <h3 class="section-title">
                <span class="section-icon">💡</span>
                重要提示
              </h3>
              <div class="tips-list">
                <div class="tip-item">
                  <span class="tip-icon">📌</span>
                  <p>所有数据默认保存在浏览器本地存储中，清理浏览器缓存可能导致数据丢失</p>
                </div>
                <div class="tip-item">
                  <span class="tip-icon">🔐</span>
                  <p>启用密码保护后，请务必牢记密码，遗忘将无法恢复数据</p>
                </div>
                <div class="tip-item">
                  <span class="tip-icon">🤖</span>
                  <p>AI 功能需要您自行配置 API 密钥，数据将发送到第三方服务</p>
                </div>
              </div>
            </div>

            <!-- 底部按钮 -->
            <div class="welcome-footer">
              <label class="show-again-checkbox">
                <input
                  v-model="showOnStartup"
                  type="checkbox"
                />
                <span>每次启动时显示此页面</span>
              </label>
              <button class="btn-start" @click="startUsing">
                <span class="btn-icon">✨</span>
                开始使用墨记
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'

/**
 * WelcomeGuide - 首次使用欢迎页面
 * 
 * 功能：
 * - 向新用户介绍墨记的核心功能
 * - 提供快速开始指南
 * - 显示重要使用提示
 * - 可选择下次不再显示
 */

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

// 状态 - 默认不勾选（即默认下次不显示）
const showOnStartup = ref(false)

// 开始使用
function startUsing() {
  // 如果勾选了"每次启动时显示"，则 dontShowAgain 为 false
  // 如果没勾选，则 dontShowAgain 为 true（下次不再显示）
  emit('close', !showOnStartup.value)
}

// 监听显示状态，重置复选框
watch(() => props.show, (newVal) => {
  if (newVal) {
    showOnStartup.value = false
  }
})
</script>

<style scoped>
/* Teleport 模态框过渡动画 */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .welcome-dialog,
.modal-leave-to .welcome-dialog {
  opacity: 0;
  transform: translateY(50px) scale(0.95);
}

/* 遮罩层 */
.welcome-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(44, 62, 80, 0.92) 0%, rgba(44, 62, 80, 0.85) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(12px);
  padding: 2rem;
}

/* 对话框 */
.welcome-dialog {
  background: linear-gradient(135deg, #fefcf5 0%, #fdfbf7 100%);
  border-radius: 20px;
  box-shadow: 0 30px 100px rgba(0, 0, 0, 0.4), 0 15px 40px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  overflow: hidden;
  animation: dialogSlideUp 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  border: 1px solid rgba(139, 69, 19, 0.15);
}

@keyframes dialogSlideUp {
  from {
    opacity: 0;
    transform: translateY(50px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 左侧装饰 */
.welcome-decoration {
  width: 120px;
  background: linear-gradient(180deg, rgba(139, 69, 19, 0.08) 0%, rgba(139, 69, 19, 0.03) 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 0;
  position: relative;
  overflow: hidden;
}

.ink-stamp {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, var(--ink-ochre, #8b4513) 0%, #a0522d 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "LXGW WenKai", serif;
  font-size: 2.5rem;
  color: #fefcf5;
  box-shadow: 0 4px 15px rgba(139, 69, 19, 0.3);
  animation: stampIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.3s both;
  position: relative;
  z-index: 1;
}

@keyframes stampIn {
  0% {
    opacity: 0;
    transform: scale(1.5) rotate(-10deg);
  }
  50% {
    transform: scale(0.9) rotate(2deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0);
  }
}

.decoration-line {
  flex: 1;
  width: 2px;
  background: linear-gradient(180deg, transparent 0%, var(--ink-sandalwood, #c1a173) 20%, var(--ink-sandalwood, #c1a173) 80%, transparent 100%);
  margin: 1.5rem 0;
  opacity: 0.5;
}

.decoration-pattern {
  width: 60px;
  height: 60px;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%238b4513' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat;
  opacity: 0.6;
}

/* 右侧内容 */
.welcome-content {
  flex: 1;
  padding: 2rem 2.5rem;
  overflow-y: auto;
  scroll-behavior: smooth;
}

/* 自定义滚动条 */
.welcome-content::-webkit-scrollbar {
  width: 6px;
}

.welcome-content::-webkit-scrollbar-track {
  background: rgba(139, 69, 19, 0.05);
  border-radius: 3px;
}

.welcome-content::-webkit-scrollbar-thumb {
  background: var(--ink-sandalwood, #c1a173);
  border-radius: 3px;
}

/* 头部 */
.welcome-header {
  text-align: center;
  margin-bottom: 2rem;
  animation: fadeInUp 0.6s ease-out 0.2s both;
}

.welcome-title {
  font-family: "LXGW WenKai", serif;
  font-size: 2rem;
  font-weight: 400;
  color: var(--ink-dark, #2c3e50);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.title-icon {
  font-size: 2.25rem;
  animation: iconFloat 3s ease-in-out infinite;
}

@keyframes iconFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.welcome-subtitle {
  font-family: "LXGW WenKai", serif;
  font-size: 1.1rem;
  color: var(--ink-sandalwood, #c1a173);
  letter-spacing: 0.1em;
}

/* 区块标题 */
.section-title {
  font-family: "LXGW WenKai", serif;
  font-size: 1.15rem;
  font-weight: 400;
  color: var(--ink-dark, #2c3e50);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--ink-rice, #d4b483);
}

.section-icon {
  font-size: 1.25rem;
}

/* 功能介绍 */
.features-section {
  margin-bottom: 2rem;
  animation: fadeInUp 0.6s ease-out 0.3s both;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.feature-card {
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 10px;
  border: 1px solid rgba(139, 69, 19, 0.08);
  transition: all 0.3s ease;
  animation: fadeInUp 0.5s ease-out both;
  animation-delay: calc(var(--delay) + 0.4s);
}

.feature-card:hover {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
  border-color: rgba(139, 69, 19, 0.15);
}

.feature-icon-wrapper {
  width: 44px;
  height: 44px;
  min-width: 44px;
  background: linear-gradient(135deg, rgba(139, 69, 19, 0.1) 0%, rgba(139, 69, 19, 0.05) 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.feature-card:hover .feature-icon-wrapper {
  transform: scale(1.1) rotate(-5deg);
  background: linear-gradient(135deg, rgba(139, 69, 19, 0.15) 0%, rgba(139, 69, 19, 0.08) 100%);
}

.feature-icon {
  font-size: 1.5rem;
}

.feature-info h4 {
  font-family: "LXGW WenKai", serif;
  font-size: 0.9375rem;
  font-weight: 400;
  color: var(--ink-dark, #2c3e50);
  margin-bottom: 0.25rem;
}

.feature-info p {
  font-family: "LXGW WenKai", serif;
  font-size: 0.8125rem;
  color: var(--ink-sandalwood, #c1a173);
  line-height: 1.5;
  margin: 0;
}

/* 快速开始 */
.quick-start-section {
  margin-bottom: 2rem;
  animation: fadeInUp 0.6s ease-out 0.5s both;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.step-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, rgba(139, 69, 19, 0.03) 0%, rgba(139, 69, 19, 0.01) 100%);
  border-radius: 10px;
  border-left: 3px solid var(--ink-ochre, #8b4513);
  animation: slideInRight 0.5s ease-out both;
  animation-delay: calc(var(--step-index) * 0.1s + 0.6s);
  transition: all 0.3s ease;
}

.step-item:hover {
  background: linear-gradient(135deg, rgba(139, 69, 19, 0.06) 0%, rgba(139, 69, 19, 0.02) 100%);
  transform: translateX(4px);
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

.step-number {
  width: 32px;
  height: 32px;
  min-width: 32px;
  background: linear-gradient(135deg, var(--ink-ochre, #8b4513) 0%, #a0522d 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "LXGW WenKai", serif;
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  box-shadow: 0 2px 8px rgba(139, 69, 19, 0.25);
}

.step-content h4 {
  font-family: "LXGW WenKai", serif;
  font-size: 0.9375rem;
  font-weight: 400;
  color: var(--ink-dark, #2c3e50);
  margin-bottom: 0.25rem;
}

.step-content p {
  font-family: "LXGW WenKai", serif;
  font-size: 0.8125rem;
  color: var(--ink-sandalwood, #c1a173);
  line-height: 1.5;
  margin: 0;
}

/* 提示 */
.tips-section {
  margin-bottom: 2rem;
  animation: fadeInUp 0.6s ease-out 0.7s both;
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.tip-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.08) 0%, rgba(255, 193, 7, 0.02) 100%);
  border-radius: 8px;
  border: 1px solid rgba(255, 193, 7, 0.2);
  transition: all 0.3s ease;
}

.tip-item:hover {
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.12) 0%, rgba(255, 193, 7, 0.04) 100%);
  transform: translateX(4px);
}

.tip-icon {
  font-size: 1.25rem;
  min-width: 1.5rem;
}

.tip-item p {
  font-family: "LXGW WenKai", serif;
  font-size: 0.875rem;
  color: #856404;
  line-height: 1.6;
  margin: 0;
}

/* 底部 */
.welcome-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 1.5rem;
  border-top: 1px dashed var(--ink-rice, #d4b483);
  animation: fadeInUp 0.6s ease-out 0.8s both;
}

.show-again-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-family: "LXGW WenKai", serif;
  font-size: 0.875rem;
  color: var(--ink-sandalwood, #c1a173);
  transition: color 0.3s ease;
}

.show-again-checkbox:hover {
  color: var(--ink-ochre, #8b4513);
}

.show-again-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--ink-ochre, #8b4513);
}

.btn-start {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.75rem;
  background: linear-gradient(135deg, var(--ink-ochre, #8b4513) 0%, #a0522d 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-family: "LXGW WenKai", serif;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(139, 69, 19, 0.3);
}

.btn-start:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 69, 19, 0.4);
}

.btn-start:active {
  transform: translateY(0);
}

.btn-icon {
  font-size: 1.25rem;
}

/* 动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式 */
@media (max-width: 768px) {
  .welcome-overlay {
    padding: 1rem;
  }
  
  .welcome-dialog {
    flex-direction: column;
    max-height: 95vh;
  }
  
  .welcome-decoration {
    width: 100%;
    height: 80px;
    flex-direction: row;
    padding: 1rem;
    justify-content: center;
  }
  
  .decoration-line,
  .decoration-pattern {
    display: none;
  }
  
  .welcome-content {
    padding: 1.5rem;
  }
  
  .welcome-title {
    font-size: 1.5rem;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .welcome-footer {
    flex-direction: column;
    gap: 1rem;
  }
  
  .btn-start {
    width: 100%;
    justify-content: center;
  }
}
</style>
