<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="privacy-overlay" @click.self>
        <div class="privacy-dialog">
          <div class="privacy-header">
            <div class="privacy-icon">📜</div>
            <h2>隐私协议与用户须知</h2>
            <p class="privacy-subtitle">欢迎使用墨记 - 在开始使用前，请仔细阅读以下协议</p>
          </div>

          <div class="privacy-content">
            <!-- 软件概述 -->
            <div class="privacy-section">
              <h3>
                <span class="section-icon">📖</span>
                软件概述
              </h3>
              <div class="section-content">
                <p>墨记（Ink Diary）是一款专为中文用户设计的本地日记应用。本软件完全在您的本地设备上运行，无需联网即可使用核心功能，为您提供私密、安全的个人记录空间。</p>
              </div>
            </div>

            <!-- MIT 开源许可 -->
            <div class="privacy-section">
              <h3>
                <span class="section-icon">⚖️</span>
                开源许可协议 (MIT License)
              </h3>
              <div class="section-content">
                <p>墨记采用 MIT 开源许可证发布，许可证全文如下：</p>
                <div class="license-text">
                  <p>Copyright (c) 2024 墨记 Ink Diary</p>
                  <p>特此授予任何人免费获得本软件及相关文档文件（以下简称"软件"）的副本，不受限制地处理本软件，包括但不限于使用、复制、修改、合并、发布、分发、再许可和/或销售软件副本的权利，并允许向其提供软件的人这样做，但须符合以下条件：</p>
                  <p>上述版权声明和本许可声明应包含在本软件的所有副本或实质性部分中。</p>
                  <p><strong>本软件按"原样"提供，不提供任何明示或暗示的担保，包括但不限于对适销性、特定用途适用性和非侵权性的担保。在任何情况下，作者或版权持有人均不对任何索赔、损害或其他责任负责，无论是在合同诉讼、侵权诉讼或其他诉讼中，由软件或软件的使用或其他交易引起或与之相关。</strong></p>
                </div>
              </div>
            </div>

            <!-- 数据隐私 -->
            <div class="privacy-section">
              <h3>
                <span class="section-icon">🔒</span>
                数据隐私与安全
              </h3>
              <div class="section-content">
                <p><strong>1. 本地存储原则</strong></p>
                <ul>
                  <li>所有日记内容、配置信息仅存储在您的本地浏览器存储空间（IndexedDB）中</li>
                  <li>数据不会上传至任何远程服务器，作者无法访问您的任何数据</li>
                  <li>您完全拥有、控制和负责自己的数据</li>
                </ul>
                <p><strong>2. 数据加密保护</strong></p>
                <ul>
                  <li>支持设置本地访问密码，密码使用行业标准的哈希算法存储</li>
                  <li>启用密码保护后，日记内容在本地存储中加密保存</li>
                  <li><strong>重要提示：</strong>密码一旦遗忘将无法恢复，请妥善保管</li>
                </ul>
                <p><strong>3. 数据备份责任</strong></p>
                <ul>
                  <li>浏览器存储可能因清理缓存、卸载应用等原因丢失</li>
                  <li>建议您定期使用导出功能备份重要日记数据</li>
                  <li>作者不对数据丢失承担任何责任</li>
                </ul>
              </div>
            </div>

            <!-- AI 功能说明 -->
            <div class="privacy-section">
              <h3>
                <span class="section-icon">🤖</span>
                AI 功能特别说明
              </h3>
              <div class="section-content">
                <p><strong>1. 功能性质</strong></p>
                <ul>
                  <li>AI 功能（包括 AI 搜索、智能分析等）完全可选，默认关闭</li>
                  <li>需要您主动配置第三方 AI 服务提供商的 API 密钥才能启用</li>
                  <li>不使用 AI 功能时，软件完全离线运行，无需任何网络连接</li>
                </ul>
                <p><strong>2. 数据发送说明</strong></p>
                <ul>
                  <li>启用 AI 功能后，您的查询内容将发送至您指定的第三方 AI 服务提供商</li>
                  <li>数据发送遵循该提供商的隐私政策和服务条款</li>
                  <li>建议不要在 AI 查询中包含高度敏感的个人信息</li>
                </ul>
                <p><strong>3. 免责声明要求</strong></p>
                <ul>
                  <li>首次启用 AI 功能前，必须阅读并同意单独的《AI 功能免责声明》</li>
                  <li>不同意 AI 免责声明将无法使用任何 AI 相关功能</li>
                  <li>AI 功能的使用受该免责声明的约束</li>
                </ul>
              </div>
            </div>

            <!-- 用户责任 -->
            <div class="privacy-section">
              <h3>
                <span class="section-icon">⚠️</span>
                用户责任与义务
              </h3>
              <div class="section-content">
                <p><strong>作为用户，您同意：</strong></p>
                <ul>
                  <li>自行承担使用本软件的全部风险和责任</li>
                  <li>遵守您所在国家/地区的法律法规，不将软件用于非法用途</li>
                  <li>妥善保管访问密码，对因密码泄露导致的任何后果负责</li>
                  <li>定期备份重要数据，对数据丢失风险有充分认知</li>
                  <li>使用 AI 功能时，遵守第三方服务提供商的使用条款</li>
                  <li>不将软件用于生成、传播违法、有害或不适当内容</li>
                </ul>
              </div>
            </div>

            <!-- 免责声明 -->
            <div class="privacy-section">
              <h3>
                <span class="section-icon">📜</span>
                责任限制与免责声明
              </h3>
              <div class="section-content">
                <p><strong>在适用法律允许的最大范围内：</strong></p>
                <ul>
                  <li>作者不对软件的功能性、安全性、准确性、可靠性作出任何保证</li>
                  <li>作者不对因使用或无法使用软件导致的任何直接、间接、偶然、特殊或后果性损害承担责任</li>
                  <li>这包括但不限于数据丢失、利润损失、业务中断、计算机故障或任何其他商业损害</li>
                  <li>即使作者已被告知此类损害的可能性，上述限制仍然适用</li>
                  <li>本软件按"原样"提供，您明确理解并同意自行承担使用风险</li>
                </ul>
              </div>
            </div>

            <!-- 第三方服务 -->
            <div class="privacy-section">
              <h3>
                <span class="section-icon">🔗</span>
                第三方服务与集成
              </h3>
              <div class="section-content">
                <p><strong>1. AI 服务提供商</strong></p>
                <ul>
                  <li>本软件支持与 OpenAI、Azure OpenAI、Anthropic 等第三方 AI 服务集成</li>
                  <li>这些服务由各自的公司独立运营，拥有独立的隐私政策和服务条款</li>
                  <li>作者不对这些服务的可用性、稳定性、数据处理方式承担任何责任</li>
                </ul>
                <p><strong>2. 开源组件</strong></p>
                <ul>
                  <li>本软件使用了多个开源软件组件，各自遵循其原始许可证</li>
                  <li>包括但不限于 Vue.js、Vite、Dexie.js 等</li>
                  <li>相关许可证信息可在软件关于页面查看</li>
                </ul>
              </div>
            </div>

            <!-- 协议更新 -->
            <div class="privacy-section">
              <h3>
                <span class="section-icon">🔄</span>
                协议更新
              </h3>
              <div class="section-content">
                <ul>
                  <li>作者保留随时修改本协议的权利，修改后的协议将在软件更新时呈现</li>
                  <li>继续使用软件即表示您同意接受修改后的协议约束</li>
                  <li>重大变更将通过适当方式通知用户</li>
                </ul>
              </div>
            </div>

            <!-- 倒计时提示 -->
            <div v-if="countdown > 0" class="countdown-notice">
              <span class="countdown-icon">⏳</span>
              请仔细阅读以上内容（{{ countdown }}秒）
            </div>
          </div>

          <!-- 确认区域 -->
          <div class="privacy-footer">
            <label class="agreement-checkbox" :class="{ disabled: countdown > 0 }">
              <input
                v-model="agreed"
                type="checkbox"
                :disabled="countdown > 0"
              />
              <span class="checkbox-text">
                我已阅读并同意上述隐私协议与用户须知，理解并接受 MIT 开源许可证条款
              </span>
            </label>

            <div class="privacy-actions">
              <button
                class="btn-decline"
                @click="decline"
              >
                <span class="btn-icon">✕</span>
                不同意并退出
              </button>
              <button
                class="btn-accept"
                :disabled="countdown > 0 || !agreed"
                @click="accept"
              >
                <span class="btn-icon">✓</span>
                同意并继续使用
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'

/**
 * PrivacyAgreement - 隐私协议与用户须知弹窗
 * 
 * 功能：
 * - 首次启动应用时显示
 * - 包含 MIT 许可证、隐私说明、用户责任等内容
 * - 用户必须同意才能使用应用
 * - 独立与 AI 免责声明
 */

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['accept', 'decline'])

// 状态
const agreed = ref(false)
const countdown = ref(20)
let timer = null

// 启动倒计时
function startCountdown() {
  // 清除现有计时器
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  // 重置倒计时
  countdown.value = 20
  agreed.value = false
  // 启动新计时器
  timer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    } else {
      clearInterval(timer)
      timer = null
    }
  }, 1000)
}

// 停止倒计时
function stopCountdown() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

// 同意
function accept() {
  if (countdown.value > 0 || !agreed.value) return
  stopCountdown()
  emit('accept')
}

// 拒绝
function decline() {
  stopCountdown()
  emit('decline')
}

// 监听 show 属性变化
watch(() => props.show, (newVal) => {
  if (newVal) {
    // 显示时启动倒计时
    startCountdown()
  } else {
    // 隐藏时停止倒计时
    stopCountdown()
  }
})

// 组件挂载
onMounted(() => {
  if (props.show) {
    startCountdown()
  }
})

// 组件卸载
onUnmounted(() => {
  stopCountdown()
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

.modal-enter-from .privacy-dialog,
.modal-leave-to .privacy-dialog {
  opacity: 0;
  transform: translateY(40px) scale(0.95);
}

/* 遮罩层 */
.privacy-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(44, 62, 80, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(8px);
}

/* 对话框 */
.privacy-dialog {
  background: linear-gradient(135deg, #fefcf5 0%, #fdfbf7 100%);
  border-radius: 16px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.4), 0 10px 30px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  animation: dialogSlideUp 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  border: 1px solid rgba(139, 69, 19, 0.15);
  overflow: hidden;
}

@keyframes dialogSlideUp {
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 头部 */
.privacy-header {
  text-align: center;
  padding: 2rem 2rem 1.5rem;
  background: linear-gradient(135deg, rgba(139, 69, 19, 0.05) 0%, transparent 100%);
  border-bottom: 1px solid var(--ink-rice, #d4b483);
}

.privacy-icon {
  font-size: 3rem;
  margin-bottom: 0.75rem;
  animation: iconPulse 2s ease-in-out infinite;
}

@keyframes iconPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.privacy-header h2 {
  font-family: "LXGW WenKai", serif;
  font-size: 1.75rem;
  font-weight: 400;
  color: var(--ink-dark, #2c3e50);
  margin-bottom: 0.5rem;
  letter-spacing: 0.05em;
}

.privacy-subtitle {
  font-family: "LXGW WenKai", serif;
  font-size: 0.9375rem;
  color: var(--ink-sandalwood, #c1a173);
}

/* 内容区域 */
.privacy-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem 2rem;
  scroll-behavior: smooth;
}

/* 自定义滚动条 */
.privacy-content::-webkit-scrollbar {
  width: 6px;
}

.privacy-content::-webkit-scrollbar-track {
  background: rgba(139, 69, 19, 0.05);
  border-radius: 3px;
}

.privacy-content::-webkit-scrollbar-thumb {
  background: var(--ink-sandalwood, #c1a173);
  border-radius: 3px;
}

.privacy-content::-webkit-scrollbar-thumb:hover {
  background: var(--ink-ochre, #8b4513);
}

/* 协议区块 */
.privacy-section {
  margin-bottom: 1.5rem;
  padding: 1.25rem;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 10px;
  border-left: 3px solid var(--ink-ochre, #8b4513);
  transition: all 0.3s ease;
}

.privacy-section:hover {
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transform: translateX(4px);
}

.privacy-section h3 {
  font-family: "LXGW WenKai", serif;
  font-size: 1.1rem;
  font-weight: 400;
  color: var(--ink-dark, #2c3e50);
  margin-bottom: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-icon {
  font-size: 1.25rem;
}

.section-content {
  font-family: "LXGW WenKai", serif;
  font-size: 0.875rem;
  color: var(--ink-sandalwood, #c1a173);
  line-height: 1.8;
}

.section-content p {
  margin-bottom: 0.75rem;
  color: var(--ink-dark, #2c3e50);
}

.section-content p strong {
  color: var(--ink-ochre, #8b4513);
}

.section-content ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.section-content li {
  padding: 0.375rem 0 0.375rem 1.25rem;
  position: relative;
}

.section-content li::before {
  content: "•";
  position: absolute;
  left: 0.375rem;
  color: var(--ink-ochre, #8b4513);
  font-weight: bold;
}

/* 许可证文本样式 */
.license-text {
  background: rgba(139, 69, 19, 0.03);
  border: 1px solid rgba(139, 69, 19, 0.1);
  border-radius: 8px;
  padding: 1rem;
  margin-top: 0.75rem;
  font-size: 0.8125rem;
  line-height: 1.8;
}

.license-text p {
  margin-bottom: 0.625rem;
}

.license-text p:last-child {
  margin-bottom: 0;
}

/* 倒计时提示 */
.countdown-notice {
  text-align: center;
  padding: 1rem;
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%);
  border-radius: 8px;
  border: 1px solid rgba(255, 193, 7, 0.3);
  font-family: "LXGW WenKai", serif;
  font-size: 0.9375rem;
  color: #856404;
  margin-top: 1rem;
  animation: pulse 2s ease-in-out infinite;
}

.countdown-icon {
  margin-right: 0.5rem;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* 底部区域 */
.privacy-footer {
  padding: 1.5rem 2rem;
  background: rgba(139, 69, 19, 0.03);
  border-top: 1px solid var(--ink-rice, #d4b483);
}

/* 复选框 */
.agreement-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  cursor: pointer;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  border: 2px solid rgba(139, 69, 19, 0.15);
  transition: all 0.3s ease;
}

.agreement-checkbox:hover:not(.disabled) {
  border-color: var(--ink-ochre, #8b4513);
  background: rgba(255, 255, 255, 1);
}

.agreement-checkbox.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.agreement-checkbox input[type="checkbox"] {
  width: 20px;
  height: 20px;
  margin-top: 2px;
  cursor: pointer;
  accent-color: var(--ink-ochre, #8b4513);
}

.agreement-checkbox input[type="checkbox"]:disabled {
  cursor: not-allowed;
}

.checkbox-text {
  font-family: "LXGW WenKai", serif;
  font-size: 0.9375rem;
  color: var(--ink-dark, #2c3e50);
  line-height: 1.6;
}

/* 按钮区域 */
.privacy-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.privacy-actions button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  font-family: "LXGW WenKai", serif;
  font-size: 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
}

.btn-icon {
  font-size: 1.1rem;
}

.btn-decline {
  background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
  color: #666;
  border: 1px solid #ddd;
}

.btn-decline:hover {
  background: linear-gradient(135deg, #e0e0e0 0%, #d0d0d0 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-accept {
  background: linear-gradient(135deg, var(--ink-ochre, #8b4513) 0%, #a0522d 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(139, 69, 19, 0.3);
}

.btn-accept:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 69, 19, 0.4);
}

.btn-accept:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 响应式 */
@media (max-width: 640px) {
  .privacy-dialog {
    width: 95%;
    max-height: 95vh;
    border-radius: 12px;
  }
  
  .privacy-header {
    padding: 1.5rem 1.25rem 1rem;
  }
  
  .privacy-header h2 {
    font-size: 1.5rem;
  }
  
  .privacy-content {
    padding: 1rem 1.25rem;
  }
  
  .privacy-section {
    padding: 1rem;
  }
  
  .privacy-footer {
    padding: 1.25rem;
  }
  
  .privacy-actions {
    flex-direction: column;
  }
  
  .privacy-actions button {
    width: 100%;
    justify-content: center;
  }
}
</style>
