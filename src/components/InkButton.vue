<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    @click="handleClick"
    @mousedown="handleMouseDown"
  >
    <!-- 加载状态 -->
    <span v-if="loading" class="ink-button__loader">
      <svg class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </span>
    
    <!-- 图标（前置） -->
    <span v-else-if="icon && iconPosition === 'left'" class="ink-button__icon">
      <slot name="icon">{{ icon }}</slot>
    </span>
    
    <!-- 按钮文字 -->
    <span class="ink-button__text">
      <slot>{{ text }}</slot>
    </span>
    
    <!-- 图标（后置） -->
    <span v-if="icon && iconPosition === 'right'" class="ink-button__icon">
      <slot name="icon">{{ icon }}</slot>
    </span>
    
    <!-- 涟漪效果容器 -->
    <span ref="rippleContainer" class="ink-button__ripples"></span>
  </button>
</template>

<script setup>
import { computed, ref } from 'vue'

/**
 * InkButton - 墨记按钮组件
 * 
 * 设计特点：
 * - 仿古宣纸质感，极轻微圆角
 * - 悬停时毛笔书写般的填充动画
 * - 点击时墨滴入水般的涟漪效果
 * - 支持多种变体：default、primary、ghost
 */

const props = defineProps({
  // 按钮文字
  text: {
    type: String,
    default: ''
  },
  // 按钮类型变体
  variant: {
    type: String,
    default: 'default', // 'default' | 'primary' | 'ghost'
    validator: (value) => ['default', 'primary', 'ghost'].includes(value)
  },
  // 按钮尺寸
  size: {
    type: String,
    default: 'medium', // 'small' | 'medium' | 'large'
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  // 图标（可以是emoji或文字）
  icon: {
    type: String,
    default: ''
  },
  // 图标位置
  iconPosition: {
    type: String,
    default: 'left', // 'left' | 'right'
    validator: (value) => ['left', 'right'].includes(value)
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false
  },
  // 是否加载中
  loading: {
    type: Boolean,
    default: false
  },
  // 是否块级显示
  block: {
    type: Boolean,
    default: false
  },
  // 自定义类名
  customClass: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['click'])

// 涟漪容器引用
const rippleContainer = ref(null)

// 按钮类名计算
const buttonClasses = computed(() => {
  const classes = ['ink-button']
  
  // 变体类
  classes.push(`ink-button--${props.variant}`)
  
  // 尺寸类
  classes.push(`ink-button--${props.size}`)
  
  // 状态类
  if (props.disabled) classes.push('ink-button--disabled')
  if (props.loading) classes.push('ink-button--loading')
  if (props.block) classes.push('ink-button--block')
  
  // 自定义类
  if (props.customClass) classes.push(props.customClass)
  
  return classes.join(' ')
})

// 点击事件处理
function handleClick(event) {
  if (props.disabled || props.loading) return
  emit('click', event)
}

// 鼠标按下事件处理 - 创建涟漪效果
function handleMouseDown(event) {
  if (props.disabled || props.loading) return
  
  const button = event.currentTarget
  const rect = button.getBoundingClientRect()
  
  // 计算点击位置相对于按钮的坐标
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  
  // 创建涟漪元素
  const ripple = document.createElement('span')
  ripple.className = 'ink-ripple'
  ripple.style.left = `${x}px`
  ripple.style.top = `${y}px`
  
  // 添加到容器
  if (rippleContainer.value) {
    rippleContainer.value.appendChild(ripple)
    
    // 动画结束后移除元素
    setTimeout(() => {
      ripple.remove()
    }, 600)
  }
}
</script>

<style scoped>
/* 基础按钮样式 */
.ink-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: "LXGW WenKai", "Microsoft YaHei", sans-serif;
  font-weight: 400;
  letter-spacing: 0.05em;
  border: 1px solid var(--ink-sandalwood);
  border-radius: 2px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
  background-color: var(--ink-paper);
  color: var(--ink-dark);
}

/* 尺寸变体 */
.ink-button--small {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.ink-button--medium {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}

.ink-button--large {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}

/* 主要按钮变体 */
.ink-button--primary {
  background-color: var(--ink-ochre);
  color: var(--ink-paper);
  border-color: var(--ink-ochre);
}

.ink-button--primary:hover:not(:disabled) {
  background-color: #7a3d11;
  border-color: #7a3d11;
}

/* 幽灵按钮变体 */
.ink-button--ghost {
  background-color: transparent;
  border-color: transparent;
}

.ink-button--ghost:hover:not(:disabled) {
  background-color: var(--ink-hover);
  border-color: var(--ink-sandalwood);
}

/* 悬停效果（非主要按钮） */
.ink-button--default:hover:not(:disabled) {
  background-color: var(--ink-hover);
  border-color: var(--ink-ochre);
}

/* 禁用状态 */
.ink-button--disabled,
.ink-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 加载状态 */
.ink-button--loading {
  cursor: wait;
}

/* 块级按钮 */
.ink-button--block {
  width: 100%;
}

/* 涟漪效果容器 */
.ink-button__ripples {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

/* 涟漪元素 */
:deep(.ink-ripple) {
  position: absolute;
  width: 20px;
  height: 20px;
  margin-left: -10px;
  margin-top: -10px;
  border-radius: 50%;
  background-color: rgba(139, 69, 19, 0.3);
  animation: inkRipple 0.6s ease-out;
  pointer-events: none;
}

@keyframes inkRipple {
  0% {
    transform: scale(0);
    opacity: 0.6;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
}

/* 加载动画 */
.ink-button__loader {
  display: flex;
  align-items: center;
  justify-content: center;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 图标样式 */
.ink-button__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1em;
}

/* 文字样式 */
.ink-button__text {
  position: relative;
  z-index: 1;
}

/* 毛笔填充动画效果 */
.ink-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 0;
  background: linear-gradient(90deg, var(--ink-hover) 0%, transparent 100%);
  transition: width 0.4s ease;
  z-index: 0;
}

.ink-button--default:hover::before {
  width: 100%;
}
</style>
