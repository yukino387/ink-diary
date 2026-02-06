<template>
  <div 
    :class="cardClasses"
    :style="cardStyles"
    @click="handleClick"
  >
    <!-- 印章装饰 -->
    <div v-if="showSeal" class="paper-card__seal">
      <div class="ink-seal" :class="{ 'ink-seal-filled': sealFilled }">
        {{ sealText }}
      </div>
    </div>
    
    <!-- 心情图标 -->
    <div v-if="moodIcon" class="paper-card__mood">
      <span class="mood-emoji" :title="mood">{{ moodIcon }}</span>
    </div>
    
    <!-- 装订线装饰 -->
    <div v-if="showBinding" class="paper-card__binding">
      <div class="binding-line"></div>
      <div class="binding-stitches">
        <span v-for="n in 8" :key="n" class="stitch"></span>
      </div>
    </div>
    
    <!-- 卡片内容 -->
    <div class="paper-card__content">
      <slot>
        <!-- 默认内容：标题、日期、标签、摘要 -->
        <div v-if="title || date" class="card-default-content">
          <!-- 标题 -->
          <h3 v-if="title" class="card-title" :class="{ 'writing-vertical': vertical }">
            {{ title }}
          </h3>
          
          <!-- 元信息：日期和心情 -->
          <div class="card-meta">
            <span v-if="date" class="card-date" :title="dateDetail || date">{{ date }}</span>
            <span v-if="dateDetail" class="card-date-detail">{{ dateDetail }}</span>
            <span v-if="moodIcon" class="card-mood">
              <span class="mood-icon">{{ moodIcon }}</span>
              <span v-if="mood" class="mood-text">{{ mood }}</span>
            </span>
          </div>
          
          <!-- 标签展示 -->
          <div v-if="tags && tags.length > 0" class="card-tags">
            <span v-for="(tag, index) in displayedTags" :key="index" class="card-tag">
              {{ tag }}
            </span>
            <span v-if="tags.length > 4" class="card-tag-more">+{{ tags.length - 4 }}</span>
          </div>
          
          <!-- 摘要 -->
          <p v-if="excerpt" class="card-excerpt">{{ excerpt }}</p>
        </div>
      </slot>
    </div>
    
    <!-- 悬停遮罩 -->
    <div v-if="hoverable" class="paper-card__overlay">
      <slot name="overlay">
        <span class="overlay-text">点击查看</span>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

/**
 * PaperCard - 纸张卡片组件
 * 
 * 设计特点：
 * - 仿古宣纸质感背景
 * - 线装书页样式的装订线装饰
 * - 可选的朱文印章装饰
 * - 心情图标展示
 * - 标签展示
 * - 支持竖排文字显示
 * - 悬停时的优雅动效
 */

const props = defineProps({
  // 卡片标题
  title: {
    type: String,
    default: ''
  },
  // 日期显示
  date: {
    type: String,
    default: ''
  },
  // 详细日期（包含创建和更新时间）
  dateDetail: {
    type: String,
    default: ''
  },
  // 摘要/预览
  excerpt: {
    type: String,
    default: ''
  },
  // 心情值
  mood: {
    type: String,
    default: ''
  },
  // 心情图标
  moodIcon: {
    type: String,
    default: ''
  },
  // 标签数组
  tags: {
    type: Array,
    default: () => []
  },
  // 是否显示印章
  showSeal: {
    type: Boolean,
    default: false
  },
  // 印章文字
  sealText: {
    type: String,
    default: '记'
  },
  // 印章是否填充
  sealFilled: {
    type: Boolean,
    default: false
  },
  // 是否显示装订线
  showBinding: {
    type: Boolean,
    default: true
  },
  // 是否竖排显示
  vertical: {
    type: Boolean,
    default: false
  },
  // 是否可悬停
  hoverable: {
    type: Boolean,
    default: true
  },
  // 是否可点击
  clickable: {
    type: Boolean,
    default: true
  },
  // 自定义高度
  height: {
    type: String,
    default: ''
  },
  // 自定义类名
  customClass: {
    type: String,
    default: ''
  },
  // 选中状态
  selected: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

// 显示的标签（最多4个）
const displayedTags = computed(() => {
  return props.tags.slice(0, 4)
})

// 卡片类名计算
const cardClasses = computed(() => {
  const classes = ['paper-card']
  
  if (props.hoverable) classes.push('paper-card--hoverable')
  if (props.clickable) classes.push('paper-card--clickable')
  if (props.vertical) classes.push('paper-card--vertical')
  if (props.selected) classes.push('paper-card--selected')
  if (props.customClass) classes.push(props.customClass)
  
  return classes.join(' ')
})

// 卡片样式计算
const cardStyles = computed(() => {
  const styles = {}
  if (props.height) {
    styles.height = props.height
  }
  return styles
})

// 点击事件处理
function handleClick(event) {
  if (props.clickable) {
    emit('click', event)
  }
}
</script>

<style scoped>
/* 基础卡片样式 */
.paper-card {
  position: relative;
  background-color: var(--ink-paper);
  border-radius: 3px;
  box-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.05),
    0 2px 8px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  overflow: hidden;
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  /* 纸张纹理效果 */
  background-image: 
    linear-gradient(90deg, rgba(139, 69, 19, 0.02) 1px, transparent 1px),
    linear-gradient(rgba(139, 69, 19, 0.02) 1px, transparent 1px);
  background-size: 20px 20px, 20px 20px;
}

/* 可悬停效果 */
.paper-card--hoverable:hover {
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.1),
    0 4px 12px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  transform: translateY(-4px) scale(1.01);
}

/* 点击效果 */
.paper-card--clickable:active {
  transform: translateY(-2px) scale(0.99);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.08),
    inset 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* 可点击样式 */
.paper-card--clickable {
  cursor: pointer;
}

/* 选中状态 */
.paper-card--selected {
  border: 2px solid var(--ink-ochre);
  box-shadow: 0 0 0 4px rgba(139, 69, 19, 0.1);
}

/* 装订线装饰 */
.paper-card__binding {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.binding-line {
  position: absolute;
  left: 8px;
  top: 10%;
  bottom: 10%;
  width: 1px;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    var(--ink-rice) 5%,
    var(--ink-rice) 95%,
    transparent 100%
  );
}

.binding-stitches {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 1;
}

.stitch {
  width: 6px;
  height: 2px;
  background-color: var(--ink-sandalwood);
  border-radius: 1px;
}

/* 印章装饰 */
.paper-card__seal {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
}

.ink-seal {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border: 2px solid var(--ink-ochre);
  border-radius: 4px;
  font-family: "LXGW WenKai", serif;
  font-size: 1rem;
  font-weight: 500;
  color: var(--ink-ochre);
  background-color: transparent;
  opacity: 0.8;
  /* 印章纹理 */
  background-image: 
    radial-gradient(circle at 30% 30%, rgba(139, 69, 19, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 70% 70%, rgba(139, 69, 19, 0.08) 0%, transparent 50%);
  box-shadow: 
    inset 0 1px 2px rgba(139, 69, 19, 0.1),
    0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.ink-seal-filled {
  background-color: var(--ink-ochre);
  color: var(--ink-paper);
  opacity: 0.9;
  background-image: 
    radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 70% 70%, rgba(0, 0, 0, 0.1) 0%, transparent 50%);
}

.paper-card--hoverable:hover .ink-seal {
  transform: rotate(-5deg) scale(1.05);
  opacity: 1;
}

/* 心情图标 */
.paper-card__mood {
  position: absolute;
  top: 12px;
  right: 52px;
  z-index: 2;
}

.mood-emoji {
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.8) 100%);
  border-radius: 50%;
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 1);
  transition: all 0.3s ease;
}

.paper-card--hoverable:hover .mood-emoji {
  transform: scale(1.1);
  box-shadow: 
    0 3px 6px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 1);
}

/* 卡片内容区 */
.paper-card__content {
  padding: 1.75rem 1.5rem 1.5rem 2.75rem;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 默认内容样式 */
.card-default-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 0.625rem;
}

.card-title {
  font-family: "LXGW WenKai", serif;
  font-size: 1.35rem;
  font-weight: 500;
  color: var(--ink-dark);
  line-height: 1.4;
  letter-spacing: 0.03em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  min-height: 2.8rem;
}

.card-title.writing-vertical {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  height: 120px;
  margin-bottom: 0;
  margin-right: 0.5rem;
}

/* 元信息区域 */
.card-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.card-date {
  font-family: "LXGW WenKai", serif;
  font-size: 0.875rem;
  color: var(--ink-sandalwood);
}

.card-date-detail {
  font-family: "LXGW WenKai", serif;
  font-size: 0.75rem;
  color: var(--ink-sandalwood);
  opacity: 0.8;
  display: block;
  margin-top: 0.25rem;
}

.card-mood {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-family: "LXGW WenKai", serif;
  font-size: 0.8rem;
  color: var(--ink-ochre);
}

.card-mood .mood-icon {
  font-size: 1rem;
}

.card-mood .mood-text {
  opacity: 0.9;
}

/* 标签样式 */
.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: auto;
  padding-top: 0.5rem;
}

.card-tag {
  font-family: "LXGW WenKai", serif;
  font-size: 0.8rem;
  padding: 0.25rem 0.75rem;
  background: linear-gradient(135deg, rgba(139, 69, 19, 0.08) 0%, rgba(139, 69, 19, 0.04) 100%);
  color: var(--ink-ochre);
  border-radius: 12px;
  white-space: nowrap;
  border: 1px solid rgba(139, 69, 19, 0.15);
  transition: all 0.2s ease;
}

.paper-card--hoverable:hover .card-tag {
  background: linear-gradient(135deg, rgba(139, 69, 19, 0.12) 0%, rgba(139, 69, 19, 0.06) 100%);
  border-color: rgba(139, 69, 19, 0.25);
}

.card-tag-more {
  font-family: "LXGW WenKai", serif;
  font-size: 0.8rem;
  padding: 0.25rem 0.625rem;
  color: var(--ink-sandalwood);
  white-space: nowrap;
  font-style: italic;
}

.card-excerpt {
  font-family: "LXGW WenKai", serif;
  font-size: 0.9rem;
  color: #555;
  line-height: 1.75;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  margin-top: 0.5rem;
  min-height: 3.5rem;
}

/* 悬停遮罩 */
.paper-card__overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(44, 62, 80, 0.7) 0%,
    rgba(44, 62, 80, 0.5) 50%,
    rgba(44, 62, 80, 0.7) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.35s ease;
  backdrop-filter: blur(2px);
}

.paper-card--hoverable:hover .paper-card__overlay {
  opacity: 1;
}

.overlay-text {
  font-family: "LXGW WenKai", serif;
  font-size: 1.1rem;
  color: var(--ink-paper);
  letter-spacing: 0.15em;
  padding: 0.75rem 1.5rem;
  border: 2px solid rgba(255, 255, 255, 0.6);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.paper-card--hoverable:hover .overlay-text {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.8);
  transform: scale(1.05);
}

/* 竖排模式 */
.paper-card--vertical .paper-card__content {
  display: flex;
  flex-direction: row-reverse;
  align-items: flex-start;
}

.paper-card--vertical .card-default-content {
  flex-direction: row-reverse;
  gap: 1rem;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .paper-card__content {
    padding: 1rem 1rem 1rem 2rem;
  }
  
  .card-title {
    font-size: 1.1rem;
  }
  
  .ink-seal {
    width: 2rem;
    height: 2rem;
    font-size: 0.875rem;
  }
  
  .paper-card__mood {
    right: 44px;
  }
  
  .mood-emoji {
    font-size: 1.25rem;
    width: 1.75rem;
    height: 1.75rem;
  }
  
  .card-tag {
    font-size: 0.7rem;
    padding: 0.1rem 0.375rem;
  }
}
</style>
