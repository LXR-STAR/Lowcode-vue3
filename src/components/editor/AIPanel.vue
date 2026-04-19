<script setup lang="ts">
import { ref, nextTick, watch, computed } from 'vue'
import { useAIStore } from '@/stores'
import { LLM_PROVIDERS } from '@/services/ai'
import type { AIChatMessage } from '@/stores/ai'

const aiStore = useAIStore()

const inputText = ref('')
const chatContainer = ref<HTMLElement | null>(null)
const showSettings = ref(false)

const currentModels = computed(() => {
  const provider = aiStore.currentProvider
  if (!provider || provider.id === 'custom') return []
  return provider.models
})

const isCustomProvider = computed(() => aiStore.config.providerId === 'custom')

const presetPrompts = [
  '创建一个用户登录表单',
  '生成一个数据统计仪表盘',
  '创建一个商品列表页面',
  '生成一个注册表单'
]

function handleSend() {
  if (!inputText.value.trim() || aiStore.isLoading) return
  aiStore.sendMessage(inputText.value.trim())
  inputText.value = ''
  scrollToBottom()
}

function handlePresetClick(prompt: string) {
  inputText.value = prompt
  handleSend()
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

function handleProviderChange(providerId: string) {
  aiStore.switchProvider(providerId)
}

function handleModelChange(model: string) {
  aiStore.config.model = model
  aiStore.saveConfig()
}

function scrollToBottom() {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  })
}

watch(() => aiStore.messages.length, () => {
  scrollToBottom()
})

watch(() => aiStore.streamingContent, () => {
  scrollToBottom()
})

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

function getMessageClass(msg: AIChatMessage): string {
  if (msg.role === 'system') return 'system-message'
  if (msg.isError) return 'error-message'
  return msg.role === 'user' ? 'user-message' : 'assistant-message'
}
</script>

<template>
  <div class="ai-panel">
    <div class="ai-header">
      <div class="header-left">
        <el-icon class="ai-icon"><MagicStick /></el-icon>
        <span class="title">AI 助手</span>
        <span v-if="aiStore.hasApiKey" class="status-badge">已连接</span>
      </div>
      <div class="header-actions">
        <el-button text size="small" @click="showSettings = !showSettings">
          <el-icon><Setting /></el-icon>
        </el-button>
        <el-button text size="small" @click="aiStore.clearMessages()">
          <el-icon><Delete /></el-icon>
        </el-button>
      </div>
    </div>

    <div v-if="showSettings" class="ai-settings">
      <div class="setting-item">
        <label>模型提供商</label>
        <el-select
          :model-value="aiStore.config.providerId"
          size="small"
          style="width: 100%"
          @change="handleProviderChange"
        >
          <el-option
            v-for="p in LLM_PROVIDERS"
            :key="p.id"
            :label="p.name"
            :value="p.id"
          />
        </el-select>
      </div>

      <div v-if="isCustomProvider" class="setting-item">
        <label>API 地址</label>
        <el-input
          v-model="aiStore.config.apiUrl"
          size="small"
          placeholder="https://api.example.com/v1/chat/completions"
          @change="aiStore.saveConfig()"
        />
      </div>

      <div v-if="currentModels.length > 0" class="setting-item">
        <label>模型</label>
        <el-select
          :model-value="aiStore.config.model"
          size="small"
          style="width: 100%"
          @change="handleModelChange"
        >
          <el-option
            v-for="m in currentModels"
            :key="m.value"
            :label="m.label"
            :value="m.value"
          />
        </el-select>
      </div>

      <div v-if="isCustomProvider" class="setting-item">
        <label>模型名称</label>
        <el-input
          v-model="aiStore.config.model"
          size="small"
          placeholder="模型名称"
          @change="aiStore.saveConfig()"
        />
      </div>

      <div class="setting-item">
        <label>API Key</label>
        <el-input
          v-model="aiStore.config.apiKey"
          size="small"
          type="password"
          show-password
          placeholder="输入你的 API Key"
          @change="aiStore.saveConfig()"
        />
      </div>
    </div>

    <div ref="chatContainer" class="ai-chat">
      <template v-if="aiStore.messages.length === 0">
        <div class="empty-state">
          <el-icon class="empty-icon"><ChatDotRound /></el-icon>
          <p class="empty-title">描述你想要的页面</p>
          <p class="empty-desc">AI 将自动生成组件配置并渲染到画布</p>
          <div class="preset-list">
            <div
              v-for="prompt in presetPrompts"
              :key="prompt"
              class="preset-item"
              @click="handlePresetClick(prompt)"
            >
              <el-icon><Promotion /></el-icon>
              <span>{{ prompt }}</span>
            </div>
          </div>
        </div>
      </template>

      <template v-else>
        <div
          v-for="msg in aiStore.messages"
          :key="msg.id"
          :class="['chat-message', getMessageClass(msg)]"
        >
          <div class="message-avatar">
            <el-icon v-if="msg.role === 'user'" :size="16"><User /></el-icon>
            <el-icon v-else-if="msg.role === 'assistant'" :size="16"><MagicStick /></el-icon>
            <el-icon v-else :size="16"><InfoFilled /></el-icon>
          </div>
          <div class="message-body">
            <div class="message-content">
              <template v-if="msg.isLoading">
                <div class="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </template>
              <template v-else>
                {{ msg.content }}
              </template>
            </div>
            <div class="message-meta">
              <span class="message-time">{{ formatTime(msg.timestamp) }}</span>
              <el-tag
                v-if="msg.schemaApplied"
                size="small"
                type="success"
              >
                已应用到画布
              </el-tag>
            </div>
          </div>
        </div>
      </template>
    </div>

    <div class="ai-input-area">
      <div class="input-wrapper">
        <el-input
          v-model="inputText"
          type="textarea"
          :autosize="{ minRows: 1, maxRows: 4 }"
          placeholder="描述你想要的页面..."
          :disabled="aiStore.isLoading || !aiStore.hasApiKey"
          @keydown="handleKeydown"
        />
        <el-button
          type="primary"
          :icon="aiStore.isLoading ? 'Loading' : 'Promotion'"
          circle
          size="small"
          :disabled="!inputText.trim() || aiStore.isLoading || !aiStore.hasApiKey"
          @click="handleSend"
        />
      </div>
      <div v-if="!aiStore.hasApiKey" class="api-key-hint">
        <el-icon><WarningFilled /></el-icon>
        <span>请先配置 API Key</span>
        <el-button type="primary" link size="small" @click="showSettings = true">
          去设置
        </el-button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ai-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
}

.ai-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;

  .header-left {
    display: flex;
    align-items: center;
    gap: 6px;

    .ai-icon {
      font-size: 18px;
      color: #7c3aed;
    }

    .title {
      font-size: 14px;
      font-weight: 600;
      color: #303133;
    }

    .status-badge {
      font-size: 11px;
      color: #67c23a;
      background: #f0f9eb;
      padding: 2px 6px;
      border-radius: 4px;
    }
  }

  .header-actions {
    display: flex;
    gap: 2px;
  }
}

.ai-settings {
  padding: 12px;
  border-bottom: 1px solid #e4e7ed;
  background: #fafafa;
  flex-shrink: 0;
  max-height: 240px;
  overflow-y: auto;

  .setting-item {
    margin-bottom: 10px;

    label {
      display: block;
      font-size: 12px;
      color: #606266;
      margin-bottom: 4px;
      font-weight: 500;
    }
  }
}

.ai-chat {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;

  .empty-icon {
    font-size: 48px;
    color: #c0c4cc;
    margin-bottom: 12px;
  }

  .empty-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 4px;
  }

  .empty-desc {
    font-size: 13px;
    color: #909399;
    margin-bottom: 20px;
  }

  .preset-list {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;

    .preset-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      background: #f5f7fa;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      color: #606266;
      transition: all 0.2s;
      border: 1px solid transparent;

      &:hover {
        background: #ecf5ff;
        border-color: #409eff;
        color: #409eff;
      }

      .el-icon {
        font-size: 14px;
        flex-shrink: 0;
      }
    }
  }
}

.chat-message {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;

  &.user-message {
    flex-direction: row-reverse;

    .message-avatar {
      background: #409eff;
    }

    .message-body {
      align-items: flex-end;
    }

    .message-content {
      background: #409eff;
      color: #fff;
    }
  }

  &.assistant-message {
    .message-avatar {
      background: #7c3aed;
    }

    .message-content {
      background: #f4f4f5;
      color: #303133;
    }
  }

  &.system-message {
    justify-content: center;

    .message-avatar {
      display: none;
    }

    .message-body {
      align-items: center;
    }

    .message-content {
      background: #fdf6ec;
      color: #e6a23c;
      font-size: 12px;
      padding: 6px 12px;
      border-radius: 4px;
    }
  }

  &.error-message {
    .message-content {
      background: #fef0f0;
      color: #f56c6c;
    }
  }

  .message-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    flex-shrink: 0;
  }

  .message-body {
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-width: 80%;
  }

  .message-content {
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 13px;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .message-meta {
    display: flex;
    align-items: center;
    gap: 8px;

    .message-time {
      font-size: 11px;
      color: #c0c4cc;
    }
  }
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 4px 0;

  span {
    width: 6px;
    height: 6px;
    background: #909399;
    border-radius: 50%;
    animation: typing 1.4s infinite ease-in-out both;

    &:nth-child(1) { animation-delay: -0.32s; }
    &:nth-child(2) { animation-delay: -0.16s; }
  }
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.4;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.ai-input-area {
  padding: 12px;
  border-top: 1px solid #e4e7ed;
  flex-shrink: 0;

  .input-wrapper {
    display: flex;
    gap: 8px;
    align-items: flex-end;

    :deep(.el-textarea__inner) {
      padding: 8px 12px;
      font-size: 13px;
    }

    .el-button {
      flex-shrink: 0;
      margin-bottom: 4px;
    }
  }

  .api-key-hint {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 8px;
    font-size: 12px;
    color: #e6a23c;

    .el-icon {
      font-size: 14px;
    }
  }
}
</style>
