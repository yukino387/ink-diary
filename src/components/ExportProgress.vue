<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="export-overlay" @click.self>
        <div class="export-dialog">
          <!-- 背景装饰 -->
          <div class="bg-decoration">
            <div class="bg-circle bg-circle-1"></div>
            <div class="bg-circle bg-circle-2"></div>
            <div class="bg-grid"></div>
          </div>

          <!-- 头部 -->
          <div class="export-header">
            <div class="header-icon">
              <div class="shield-container">
                <div class="shield" :class="{ 'shield-active': isEncrypting, 'shield-complete': isComplete }">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                  <div class="shield-shine"></div>
                  <div class="shield-ring" v-if="isEncrypting"></div>
                </div>
                <div class="lock-icon" :class="{ locked: isEncrypting, unlocked: isComplete }">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
              </div>
            </div>
            <div class="title-wrapper">
              <h2 :class="{ 'title-complete': isComplete }">{{ title }}</h2>
              <div class="title-underline" :style="{ width: isComplete ? '100%' : '0%' }"></div>
            </div>
            <p class="subtitle" :class="{ 'subtitle-complete': isComplete }">{{ subtitle }}</p>
          </div>

          <!-- 进度区域 -->
          <div class="progress-section">
            <!-- 进度条 -->
            <div class="progress-wrapper">
              <div class="progress-labels">
                <span class="progress-label">导出进度</span>
                <span class="progress-percentage" :class="{ 'percentage-complete': isComplete }">
                  {{ Math.round(progress) }}%
                </span>
              </div>
              <div class="progress-container">
                <div class="progress-track">
                  <div class="progress-fill" :style="{ width: progress + '%' }">
                    <div class="progress-stripes"></div>
                  </div>
                  <div class="progress-glow" :style="{ left: progress + '%' }"></div>
                  <div class="progress-sparkles" v-if="progress < 100">
                    <div class="sparkle" v-for="n in 3" :key="n" :style="{ animationDelay: (n * 0.3) + 's' }"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 步骤指示器 -->
            <div class="steps-wrapper">
              <div class="steps-line">
                <div class="steps-line-fill" :style="{ width: (currentStep / (steps.length - 1)) * 100 + '%' }"></div>
              </div>
              <div class="steps-indicator">
                <div
                  v-for="(step, index) in steps"
                  :key="index"
                  class="step"
                  :class="{
                    completed: currentStep > index,
                    active: currentStep === index,
                    pending: currentStep < index
                  }"
                >
                  <div class="step-icon-wrapper">
                    <div class="step-dot">
                      <span v-if="currentStep > index" class="check-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </span>
                      <span v-else class="step-number">{{ index + 1 }}</span>
                    </div>
                    <div class="step-pulse" v-if="currentStep === index"></div>
                  </div>
                  <div class="step-info">
                    <div class="step-label">{{ step.label }}</div>
                    <div class="step-detail">{{ step.detail }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 加密可视化 -->
          <div class="encryption-visual" :class="{ 'visual-active': isEncrypting }">
            <div class="visual-header">
              <div class="visual-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <span class="visual-title">加密处理</span>
              <div class="visual-status">
                <span class="pulse-dot"></span>
                <span class="status-text-visual">{{ encryptionStatus }}</span>
              </div>
            </div>
            <div class="data-stream-container">
              <div class="stream-labels">
                <span class="stream-label">原始数据</span>
                <span class="stream-arrow">→</span>
                <span class="stream-label encrypted">加密数据</span>
              </div>
              <div class="data-stream">
                <div class="stream-bg"></div>
                <div
                  v-for="n in 15"
                  :key="n"
                  class="data-packet"
                  :class="{ 'packet-encrypted': isEncrypting }"
                  :style="{
                    animationDelay: (n * 0.15) + 's',
                    left: ((n - 1) * 7) + '%'
                  }"
                >
                  <span class="packet-content">{{ generateHex() }}</span>
                </div>
                <div class="encryption-beam" v-if="isEncrypting"></div>
              </div>
            </div>
            <div class="encryption-details">
              <div class="detail-item" :class="{ 'detail-active': currentStep >= 1 }">
                <span class="detail-icon">🔑</span>
                <span class="detail-text">密钥派生</span>
              </div>
              <div class="detail-item" :class="{ 'detail-active': currentStep >= 1 }">
                <span class="detail-icon">🔒</span>
                <span class="detail-text">AES-256-GCM</span>
              </div>
              <div class="detail-item" :class="{ 'detail-active': currentStep >= 2 }">
                <span class="detail-icon">✓</span>
                <span class="detail-text">完整性校验</span>
              </div>
            </div>
          </div>

          <!-- 安全提示 -->
          <div class="security-tips">
            <div class="tips-header">
              <svg class="tips-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              <span>安全保障</span>
            </div>
            <div class="tips-list">
              <div class="tip-item" :class="{ show: currentStep >= 0, highlight: currentStep === 0 }">
                <div class="tip-number">1</div>
                <div class="tip-content">
                  <span class="tip-title">AES-256-GCM 加密</span>
                  <span class="tip-desc">军用级加密标准</span>
                </div>
              </div>
              <div class="tip-item" :class="{ show: currentStep >= 1, highlight: currentStep === 1 }">
                <div class="tip-number">2</div>
                <div class="tip-content">
                  <span class="tip-title">密码不存储</span>
                  <span class="tip-desc">仅用于本次加密</span>
                </div>
              </div>
              <div class="tip-item" :class="{ show: currentStep >= 2, highlight: currentStep === 2 }">
                <div class="tip-number">3</div>
                <div class="tip-content">
                  <span class="tip-title">安全传输</span>
                  <span class="tip-desc">加密文件可放心存储</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 底部状态 -->
          <div class="export-footer">
            <div class="status-wrapper" :class="{ 'status-complete': isComplete }">
              <div class="status-icon" v-if="isComplete">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <div class="status-text" :class="statusClass">
                {{ statusText }}
              </div>
            </div>
            <div v-if="isComplete" class="success-animation">
              <div class="success-ring success-ring-1"></div>
              <div class="success-ring success-ring-2"></div>
              <div class="success-ring success-ring-3"></div>
              <div class="success-check">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'

/**
 * ExportProgress - 加密导出进度弹窗
 *
 * 功能：
 * - 显示加密导出进度条
 * - 展示加密步骤和状态
 * - 可视化数据加密过程
 * - 显示安全提示信息
 */

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  progress: {
    type: Number,
    default: 0
  },
  currentStep: {
    type: Number,
    default: 0
  },
  isComplete: {
    type: Boolean,
    default: false
  },
  diaryCount: {
    type: Number,
    default: 0
  }
})

// 步骤定义
const steps = [
  { label: '准备数据', detail: '收集日记数据' },
  { label: '加密处理', detail: 'AES-256-GCM 加密' },
  { label: '生成文件', detail: '创建加密文件' },
  { label: '完成导出', detail: '准备下载' }
]

// 计算属性
const isEncrypting = computed(() => props.currentStep === 1)

const title = computed(() => {
  if (props.isComplete) return '导出完成'
  if (props.currentStep === 1) return '正在加密'
  return '正在导出'
})

const subtitle = computed(() => {
  if (props.isComplete) return `已成功导出 ${props.diaryCount} 篇日记`
  if (props.currentStep === 1) return '使用高强度加密算法保护您的数据'
  return '请稍候，正在处理您的数据'
})

const encryptionStatus = computed(() => {
  if (props.currentStep < 1) return '等待加密...'
  if (props.currentStep === 1) return '正在加密数据流...'
  return '加密完成'
})

const statusText = computed(() => {
  if (props.isComplete) return '文件已准备好下载'
  if (props.currentStep === 1) return '加密中，请勿关闭窗口'
  return '正在处理...'
})

const statusClass = computed(() => ({
  'status-encrypting': props.currentStep === 1,
  'status-complete': props.isComplete
}))

// 生成随机十六进制字符串
function generateHex() {
  return Array(4).fill(0).map(() => Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()).join('')
}
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

.modal-enter-from .export-dialog,
.modal-leave-to .export-dialog {
  opacity: 0;
  transform: translateY(50px) scale(0.95);
}

/* 遮罩层 */
.export-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(44, 62, 80, 0.92) 0%, rgba(44, 62, 80, 0.88) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(12px);
}

/* 对话框 */
.export-dialog {
  background: linear-gradient(135deg, #fefcf5 0%, #fdfbf7 50%, #f9f6f0 100%);
  border-radius: 24px;
  box-shadow:
    0 30px 100px rgba(0, 0, 0, 0.4),
    0 15px 40px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  width: 90%;
  max-width: 560px;
  padding: 2.5rem;
  animation: dialogSlideUp 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  border: 1px solid rgba(139, 69, 19, 0.12);
  overflow: hidden;
  position: relative;
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

/* 背景装饰 */
.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(139, 69, 19, 0.03) 0%, transparent 70%);
}

.bg-circle-1 {
  width: 300px;
  height: 300px;
  top: -100px;
  right: -100px;
  animation: float 8s ease-in-out infinite;
}

.bg-circle-2 {
  width: 200px;
  height: 200px;
  bottom: -50px;
  left: -50px;
  animation: float 6s ease-in-out infinite reverse;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(20px, -20px); }
}

.bg-grid {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    linear-gradient(rgba(139, 69, 19, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(139, 69, 19, 0.02) 1px, transparent 1px);
  background-size: 20px 20px;
}

/* 头部 */
.export-header {
  text-align: center;
  margin-bottom: 2rem;
  position: relative;
  z-index: 1;
}

.header-icon {
  margin-bottom: 1.25rem;
}

.shield-container {
  position: relative;
  width: 90px;
  height: 90px;
  margin: 0 auto;
}

.shield {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--ink-ochre, #8b4513) 0%, #a0522d 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  animation: shieldPulse 2.5s ease-in-out infinite;
  box-shadow:
    0 6px 25px rgba(139, 69, 19, 0.35),
    inset 0 2px 4px rgba(255, 255, 255, 0.2);
  transition: all 0.5s ease;
}

.shield-active {
  animation: shieldActive 1s ease-in-out infinite;
  box-shadow:
    0 8px 35px rgba(139, 69, 19, 0.5),
    0 0 60px rgba(139, 69, 19, 0.2),
    inset 0 2px 4px rgba(255, 255, 255, 0.2);
}

.shield-complete {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  animation: shieldComplete 0.6s ease forwards;
}

@keyframes shieldPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.03); }
}

@keyframes shieldActive {
  0%, 100% { transform: scale(1); box-shadow: 0 6px 25px rgba(139, 69, 19, 0.35); }
  50% { transform: scale(1.05); box-shadow: 0 10px 40px rgba(139, 69, 19, 0.5); }
}

@keyframes shieldComplete {
  0% { transform: scale(1); }
  50% { transform: scale(1.15); }
  100% { transform: scale(1.1); }
}

.shield svg {
  width: 44px;
  height: 44px;
  color: white;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.shield-shine {
  position: absolute;
  top: 8%;
  left: 12%;
  width: 35%;
  height: 35%;
  background: radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 70%);
  border-radius: 50%;
}

.shield-ring {
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
  border: 2px solid rgba(139, 69, 19, 0.2);
  border-radius: 50%;
  animation: ringPulse 1.5s ease-out infinite;
}

@keyframes ringPulse {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(1.3); opacity: 0; }
}

.lock-icon {
  position: absolute;
  bottom: -8px;
  right: -8px;
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 12px rgba(40, 167, 69, 0.4);
  transition: all 0.3s ease;
  border: 2px solid white;
}

.lock-icon.locked {
  animation: lockShake 0.6s ease-in-out infinite;
}

.lock-icon.unlocked {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  animation: unlockPop 0.5s ease forwards;
}

@keyframes lockShake {
  0%, 100% { transform: rotate(0); }
  25% { transform: rotate(-8deg); }
  75% { transform: rotate(8deg); }
}

@keyframes unlockPop {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1.1); }
}

.lock-icon svg {
  width: 20px;
  height: 20px;
  color: white;
}

.title-wrapper {
  display: inline-block;
  position: relative;
}

.export-header h2 {
  font-family: "LXGW WenKai", serif;
  font-size: 1.75rem;
  font-weight: 400;
  color: var(--ink-dark, #2c3e50);
  margin-bottom: 0.5rem;
  transition: all 0.3s ease;
}

.title-complete {
  color: #28a745;
  animation: titleGlow 1s ease;
}

@keyframes titleGlow {
  0%, 100% { text-shadow: none; }
  50% { text-shadow: 0 0 20px rgba(40, 167, 69, 0.3); }
}

.title-underline {
  height: 3px;
  background: linear-gradient(90deg, transparent, #28a745, transparent);
  border-radius: 2px;
  transition: width 0.5s ease;
  margin: 0 auto;
}

.subtitle {
  font-family: "LXGW WenKai", serif;
  font-size: 0.9375rem;
  color: var(--ink-sandalwood, #c1a173);
  margin-top: 0.5rem;
  transition: all 0.3s ease;
}

.subtitle-complete {
  color: #28a745;
  font-weight: 500;
}

/* 进度区域 */
.progress-section {
  margin-bottom: 1.75rem;
  position: relative;
  z-index: 1;
}

.progress-wrapper {
  background: rgba(255, 255, 255, 0.6);
  border-radius: 16px;
  padding: 1.25rem;
  border: 1px solid rgba(139, 69, 19, 0.08);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.02);
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.progress-label {
  font-family: "LXGW WenKai", serif;
  font-size: 0.875rem;
  color: var(--ink-sandalwood, #c1a173);
}

.progress-percentage {
  font-family: "LXGW WenKai", serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--ink-ochre, #8b4513);
  transition: all 0.3s ease;
}

.percentage-complete {
  color: #28a745;
  animation: percentagePop 0.5s ease;
}

@keyframes percentagePop {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

.progress-container {
  position: relative;
}

.progress-track {
  height: 12px;
  background: rgba(139, 69, 19, 0.08);
  border-radius: 6px;
  position: relative;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--ink-ochre, #8b4513) 0%, #d4a574 50%, var(--ink-ochre, #8b4513) 100%);
  background-size: 200% 100%;
  border-radius: 6px;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  animation: progressGradient 2s linear infinite;
}

@keyframes progressGradient {
  0% { background-position: 100% 0; }
  100% { background-position: -100% 0; }
}

.progress-stripes {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10px,
    rgba(255, 255, 255, 0.15) 10px,
    rgba(255, 255, 255, 0.15) 20px
  );
  animation: stripesMove 1s linear infinite;
}

@keyframes stripesMove {
  0% { transform: translateX(0); }
  100% { transform: translateX(28px); }
}

.progress-glow {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  box-shadow:
    0 0 20px var(--ink-ochre, #8b4513),
    0 0 40px rgba(139, 69, 19, 0.3);
  transition: left 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.progress-sparkles {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 60px;
  overflow: hidden;
}

.sparkle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: white;
  border-radius: 50%;
  animation: sparkle 1.5s ease-in-out infinite;
}

.sparkle:nth-child(1) { top: 20%; right: 20%; }
.sparkle:nth-child(2) { top: 50%; right: 40%; animation-delay: 0.5s; }
.sparkle:nth-child(3) { top: 70%; right: 15%; animation-delay: 1s; }

@keyframes sparkle {
  0%, 100% { opacity: 0; transform: scale(0); }
  50% { opacity: 1; transform: scale(1); }
}

/* 步骤指示器 */
.steps-wrapper {
  margin-top: 1.5rem;
  position: relative;
}

.steps-line {
  position: absolute;
  top: 16px;
  left: 10%;
  right: 10%;
  height: 3px;
  background: rgba(139, 69, 19, 0.08);
  border-radius: 2px;
  z-index: 0;
}

.steps-line-fill {
  height: 100%;
  background: linear-gradient(90deg, #28a745, #20c997);
  border-radius: 2px;
  transition: width 0.5s ease;
}

.steps-indicator {
  display: flex;
  justify-content: space-between;
  position: relative;
  z-index: 1;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.step-icon-wrapper {
  position: relative;
  margin-bottom: 0.5rem;
}

.step-dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  position: relative;
  z-index: 1;
}

.step.pending .step-dot {
  background: rgba(139, 69, 19, 0.08);
  color: var(--ink-sandalwood, #c1a173);
  border: 2px solid rgba(139, 69, 19, 0.1);
}

.step.active .step-dot {
  background: linear-gradient(135deg, var(--ink-ochre, #8b4513) 0%, #d4a574 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(139, 69, 19, 0.35);
  transform: scale(1.1);
}

.step.completed .step-dot {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  box-shadow: 0 3px 12px rgba(40, 167, 69, 0.35);
}

.step-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 48px;
  height: 48px;
  border: 2px solid var(--ink-ochre, #8b4513);
  border-radius: 50%;
  animation: stepPulseRing 1.5s ease-out infinite;
}

@keyframes stepPulseRing {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
}

.check-icon {
  width: 18px;
  height: 18px;
}

.check-icon svg {
  width: 100%;
  height: 100%;
  stroke: white;
}

.step-info {
  text-align: center;
}

.step-label {
  font-family: "LXGW WenKai", serif;
  font-size: 0.8125rem;
  color: var(--ink-dark, #2c3e50);
  margin-bottom: 0.25rem;
  font-weight: 500;
}

.step-detail {
  font-family: "LXGW WenKai", serif;
  font-size: 0.6875rem;
  color: var(--ink-sandalwood, #c1a173);
}

/* 加密可视化 */
.encryption-visual {
  background: linear-gradient(135deg, rgba(44, 62, 80, 0.02) 0%, rgba(44, 62, 80, 0.01) 100%);
  border-radius: 16px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(139, 69, 19, 0.06);
  transition: all 0.4s ease;
  position: relative;
  z-index: 1;
}

.visual-active {
  background: linear-gradient(135deg, rgba(139, 69, 19, 0.04) 0%, rgba(139, 69, 19, 0.02) 100%);
  border-color: rgba(139, 69, 19, 0.12);
  box-shadow: 0 4px 20px rgba(139, 69, 19, 0.08);
}

.visual-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.visual-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, var(--ink-ochre, #8b4513) 0%, #a0522d 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.visual-icon svg {
  width: 18px;
  height: 18px;
  color: white;
}

.visual-title {
  font-family: "LXGW WenKai", serif;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--ink-dark, #2c3e50);
  flex: 1;
}

.visual-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: "LXGW WenKai", serif;
  font-size: 0.8125rem;
  color: var(--ink-sandalwood, #c1a173);
}

.data-stream-container {
  margin-bottom: 1rem;
}

.stream-labels {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  padding: 0 0.5rem;
}

.stream-label {
  font-family: "LXGW WenKai", serif;
  font-size: 0.6875rem;
  color: var(--ink-sandalwood, #c1a173);
}

.stream-label.encrypted {
  color: #28a745;
  font-weight: 500;
}

.stream-arrow {
  font-size: 0.875rem;
  color: var(--ink-ochre, #8b4513);
  animation: arrowPulse 1s ease-in-out infinite;
}

@keyframes arrowPulse {
  0%, 100% { opacity: 0.5; transform: translateX(0); }
  50% { opacity: 1; transform: translateX(3px); }
}

.data-stream {
  height: 40px;
  position: relative;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  border: 1px solid rgba(139, 69, 19, 0.06);
}

.stream-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(139, 69, 19, 0.03) 50%, transparent 100%);
  animation: streamBgMove 3s linear infinite;
}

@keyframes streamBgMove {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.data-packet {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-family: 'Courier New', monospace;
  font-size: 0.625rem;
  color: var(--ink-ochre, #8b4513);
  opacity: 0;
  animation: packetFlow 2.5s linear infinite;
  white-space: nowrap;
  transition: all 0.3s ease;
}

.packet-encrypted {
  color: #28a745;
  font-weight: bold;
}

@keyframes packetFlow {
  0% {
    opacity: 0;
    transform: translateY(-50%) translateX(-30px);
  }
  15% {
    opacity: 1;
  }
  85% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateY(-50%) translateX(30px);
  }
}

.encryption-beam {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, transparent, #28a745, transparent);
  animation: beamPulse 1s ease-in-out infinite;
}

@keyframes beamPulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

.encryption-details {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: rgba(139, 69, 19, 0.04);
  border-radius: 20px;
  font-family: "LXGW WenKai", serif;
  font-size: 0.75rem;
  color: var(--ink-sandalwood, #c1a173);
  transition: all 0.3s ease;
  opacity: 0.5;
}

.detail-active {
  background: rgba(40, 167, 69, 0.1);
  color: #28a745;
  opacity: 1;
  transform: scale(1.05);
}

.detail-icon {
  font-size: 0.875rem;
}

/* 安全提示 */
.security-tips {
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 1;
}

.tips-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.875rem;
  font-family: "LXGW WenKai", serif;
  font-size: 0.875rem;
  color: var(--ink-dark, #2c3e50);
  font-weight: 500;
}

.tips-icon {
  width: 18px;
  height: 18px;
  color: var(--ink-ochre, #8b4513);
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 10px;
  border: 1px solid rgba(139, 69, 19, 0.06);
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  opacity: 0;
  transform: translateX(-20px);
}

.tip-item.show {
  opacity: 1;
  transform: translateX(0);
}

.tip-item.highlight {
  background: rgba(40, 167, 69, 0.08);
  border-color: rgba(40, 167, 69, 0.15);
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.1);
}

.tip-number {
  width: 24px;
  height: 24px;
  min-width: 24px;
  background: linear-gradient(135deg, var(--ink-ochre, #8b4513) 0%, #a0522d 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "LXGW WenKai", serif;
  font-size: 0.75rem;
  color: white;
  font-weight: 500;
}

.tip-item.highlight .tip-number {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
}

.tip-content {
  display: flex;
  flex-direction: column;
}

.tip-title {
  font-family: "LXGW WenKai", serif;
  font-size: 0.875rem;
  color: var(--ink-dark, #2c3e50);
  font-weight: 500;
}

.tip-desc {
  font-family: "LXGW WenKai", serif;
  font-size: 0.75rem;
  color: var(--ink-sandalwood, #c1a173);
}

/* 底部状态 */
.export-footer {
  text-align: center;
  padding-top: 1.25rem;
  border-top: 1px dashed rgba(139, 69, 19, 0.15);
  position: relative;
  z-index: 1;
}

.status-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.status-wrapper.status-complete {
  animation: statusBounce 0.5s ease;
}

@keyframes statusBounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.status-icon {
  width: 24px;
  height: 24px;
  color: #28a745;
  animation: iconSpin 0.5s ease;
}

@keyframes iconSpin {
  0% { transform: rotate(-180deg) scale(0); }
  100% { transform: rotate(0) scale(1); }
}

.status-icon svg {
  width: 100%;
  height: 100%;
}

.status-text {
  font-family: "LXGW WenKai", serif;
  font-size: 1rem;
  color: var(--ink-sandalwood, #c1a173);
  transition: all 0.3s ease;
}

.status-text.status-encrypting {
  color: var(--ink-ochre, #8b4513);
  animation: textPulse 1.5s ease-in-out infinite;
}

@keyframes textPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.status-text.status-complete {
  color: #28a745;
  font-weight: 600;
  font-size: 1.125rem;
}

/* 成功动画 */
.success-animation {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.success-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 3px solid #28a745;
  border-radius: 50%;
  opacity: 0;
}

.success-ring-1 {
  width: 60px;
  height: 60px;
  animation: ringExpand1 1s ease-out forwards;
}

.success-ring-2 {
  width: 60px;
  height: 60px;
  animation: ringExpand2 1s ease-out 0.2s forwards;
}

.success-ring-3 {
  width: 60px;
  height: 60px;
  animation: ringExpand3 1s ease-out 0.4s forwards;
}

@keyframes ringExpand1 {
  0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
}

@keyframes ringExpand2 {
  0% { transform: translate(-50%, -50%) scale(0); opacity: 0.8; }
  100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
}

@keyframes ringExpand3 {
  0% { transform: translate(-50%, -50%) scale(0); opacity: 0.6; }
  100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
}

.success-check {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(40, 167, 69, 0.4);
  animation: checkPop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.3s both;
}

.success-check svg {
  width: 28px;
  height: 28px;
  color: white;
}

@keyframes checkPop {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
}

/* 响应式 */
@media (max-width: 480px) {
  .export-dialog {
    padding: 1.75rem;
    margin: 1rem;
    border-radius: 20px;
  }

  .export-header h2 {
    font-size: 1.5rem;
  }

  .steps-indicator {
    flex-wrap: wrap;
    gap: 1rem;
  }

  .step {
    flex: 0 0 45%;
  }

  .steps-line {
    display: none;
  }

  .encryption-details {
    flex-wrap: wrap;
  }

  .detail-item {
    font-size: 0.6875rem;
  }
}
</style>
