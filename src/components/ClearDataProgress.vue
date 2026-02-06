<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="clear-overlay">
        <div class="clear-dialog">
          <!-- 头部 -->
          <div class="clear-header">
            <div class="trash-icon" :class="{ 'trash-active': isClearing, 'trash-complete': isComplete }">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </div>
            <h2 :class="{ 'title-complete': isComplete }">{{ title }}</h2>
            <p class="subtitle">{{ subtitle }}</p>
          </div>

          <!-- 进度条 -->
          <div class="progress-bar">
            <div class="progress-track">
              <div class="progress-fill" :style="{ width: progress + '%' }"></div>
            </div>
            <span class="progress-text">{{ Math.round(progress) }}%</span>
          </div>

          <!-- 步骤 -->
          <div class="steps">
            <div
              v-for="(step, index) in steps"
              :key="index"
              class="step"
              :class="{ active: currentStep === index, completed: currentStep > index }"
            >
              <div class="step-dot">{{ currentStep > index ? '✓' : index + 1 }}</div>
              <span class="step-name">{{ step }}</span>
            </div>
          </div>

          <!-- 数据项 -->
          <div class="data-list">
            <div
              v-for="(item, index) in dataItems"
              :key="index"
              class="data-item"
              :class="{ cleared: currentStep > item.step }"
            >
              <span>{{ item.icon }} {{ item.name }}</span>
              <span v-if="currentStep > item.step" class="check">✓</span>
            </div>
          </div>

          <!-- 底部状态 -->
          <div class="status" :class="{ 'status-complete': isComplete }">
            {{ statusText }}
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  show: Boolean,
  progress: Number,
  currentStep: Number,
  isComplete: Boolean,
  diaryCount: Number
})

const steps = ['删除日记', '清除配置', '释放空间', '完成']

const dataItems = [
  { icon: '📔', name: '日记内容', step: 0 },
  { icon: '🏷️', name: '标签分类', step: 0 },
  { icon: '⚙️', name: '应用配置', step: 1 },
  { icon: '🔑', name: 'API设置', step: 1 },
  { icon: '🤖', name: '提示词', step: 1 },
  { icon: '📊', name: '统计数据', step: 2 }
]

const isClearing = computed(() => props.currentStep >= 0 && props.currentStep < 3 && !props.isComplete)

const title = computed(() => props.isComplete ? '清理完成' : '正在清理数据')

const subtitle = computed(() => {
  if (props.isComplete) return '所有数据已安全清除'
  if (props.currentStep === 0) return `正在删除 ${props.diaryCount} 篇日记`
  if (props.currentStep === 1) return '正在重置应用设置'
  if (props.currentStep === 2) return '正在清理存储空间'
  return '请稍候...'
})

const statusText = computed(() => {
  if (props.isComplete) return '✓ 数据已彻底清空'
  return '清理中，请勿关闭窗口...'
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

.modal-enter-from .clear-dialog,
.modal-leave-to .clear-dialog {
  opacity: 0;
  transform: translateY(30px) scale(0.95);
}

.clear-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(44, 62, 80, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(8px);
}

.clear-dialog {
  background: linear-gradient(135deg, #fefcf5 0%, #fdfbf7 100%);
  border-radius: 20px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.4);
  width: 90%;
  max-width: 480px;
  padding: 2rem;
  animation: slideUp 0.4s ease;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 头部 */
.clear-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.trash-icon {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  animation: pulse 2s ease-in-out infinite;
}

.trash-active {
  animation: shake 0.5s ease-in-out infinite;
}

.trash-complete {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  animation: bounce 0.6s ease;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes shake {
  0%, 100% { transform: rotate(0); }
  25% { transform: rotate(-5deg); }
  75% { transform: rotate(5deg); }
}

@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.trash-icon svg {
  width: 35px;
  height: 35px;
  color: white;
}

h2 {
  font-family: "LXGW WenKai", serif;
  font-size: 1.5rem;
  color: var(--ink-dark, #2c3e50);
  margin-bottom: 0.5rem;
}

.title-complete {
  color: #28a745;
}

.subtitle {
  font-family: "LXGW WenKai", serif;
  font-size: 0.875rem;
  color: var(--ink-sandalwood, #c1a173);
}

/* 进度条 */
.progress-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.progress-track {
  flex: 1;
  height: 10px;
  background: rgba(139, 69, 19, 0.1);
  border-radius: 5px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #dc3545, #ff6b7a);
  border-radius: 5px;
  transition: width 0.3s ease;
}

.progress-text {
  font-family: "LXGW WenKai", serif;
  font-size: 1.125rem;
  font-weight: 600;
  color: #dc3545;
  min-width: 45px;
}

/* 步骤 */
.steps {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding: 0 0.5rem;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.step-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  background: rgba(139, 69, 19, 0.1);
  color: var(--ink-sandalwood, #c1a173);
  transition: all 0.3s ease;
}

.step.active .step-dot {
  background: #dc3545;
  color: white;
  transform: scale(1.1);
}

.step.completed .step-dot {
  background: #28a745;
  color: white;
}

.step-name {
  font-family: "LXGW WenKai", serif;
  font-size: 0.75rem;
  color: var(--ink-dark, #2c3e50);
}

/* 数据列表 */
.data-list {
  background: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.data-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  margin-bottom: 0.5rem;
  background: white;
  border-radius: 6px;
  font-family: "LXGW WenKai", serif;
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.data-item:last-child {
  margin-bottom: 0;
}

.data-item.cleared {
  background: rgba(40, 167, 69, 0.1);
  color: #28a745;
  text-decoration: line-through;
  opacity: 0.7;
}

.check {
  font-weight: bold;
}

/* 状态 */
.status {
  text-align: center;
  font-family: "LXGW WenKai", serif;
  font-size: 1rem;
  color: #dc3545;
  padding-top: 1rem;
  border-top: 1px dashed rgba(139, 69, 19, 0.2);
}

.status-complete {
  color: #28a745;
  font-weight: 600;
}

@media (max-width: 480px) {
  .clear-dialog {
    padding: 1.5rem;
    margin: 1rem;
  }

  .steps {
    flex-wrap: wrap;
    gap: 1rem;
  }

  .step {
    flex: 0 0 45%;
  }
}
</style>
