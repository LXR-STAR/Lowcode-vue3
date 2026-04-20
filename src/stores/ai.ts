import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ChatMessage, LLMConfig } from '@/services/ai'
import { DEFAULT_LLM_CONFIG, callLLMStream, buildConversationMessages, parseSchemaResponse, convertSchemaToComponents, getProviderById } from '@/services/ai'
import { useComponentStore } from './component'
import { useHistoryStore } from './history'

export interface AIChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  isLoading?: boolean
  isError?: boolean
  schemaApplied?: boolean
}

export const useAIStore = defineStore('ai', () => {
  const config = ref<LLMConfig>({ ...DEFAULT_LLM_CONFIG })
  const messages = ref<AIChatMessage[]>([])
  const isLoading = ref(false)
  const panelVisible = ref(false)
  const streamingContent = ref('')

  const hasApiKey = computed(() => !!config.value.apiKey.trim())

  const currentProvider = computed(() => getProviderById(config.value.providerId))

  const conversationHistory = computed<ChatMessage[]>(() =>
    messages.value
      .filter(m => m.role !== 'system' && !m.isLoading && !m.isError)
      .map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      }))
  )

  function loadConfig() {
    const saved = localStorage.getItem('devflow-ai-config')
    if (saved) {
      try {
        const savedConfig = JSON.parse(saved)
        config.value = {
          ...DEFAULT_LLM_CONFIG,
          ...savedConfig
        }
      } catch { /* ignore */ }
    }
    if (!config.value.apiKey && DEFAULT_LLM_CONFIG.apiKey) {
      config.value.apiKey = DEFAULT_LLM_CONFIG.apiKey
    }
  }

  function saveConfig() {
    localStorage.setItem('devflow-ai-config', JSON.stringify(config.value))
  }

  function switchProvider(providerId: string) {
    const provider = getProviderById(providerId)
    if (!provider) return

    config.value.providerId = providerId
    config.value.apiUrl = provider.apiUrl
    config.value.model = provider.defaultModel
    saveConfig()
  }

  function addMessage(role: 'user' | 'assistant' | 'system', content: string, extra?: Partial<AIChatMessage>): AIChatMessage {
    const msg: AIChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      role,
      content,
      timestamp: Date.now(),
      ...extra
    }
    messages.value = [...messages.value, msg]
    return msg
  }

  function updateMessage(id: string, updates: Partial<AIChatMessage>) {
    messages.value = messages.value.map(m =>
      m.id === id ? { ...m, ...updates } : m
    )
  }

  async function sendMessage(userInput: string) {
    if (!userInput.trim() || isLoading.value) return
    if (!hasApiKey.value) {
      addMessage('system', '请先在设置中配置 API Key')
      return
    }

    addMessage('user', userInput)
    isLoading.value = true
    streamingContent.value = ''

    const assistantMsg = addMessage('assistant', '', { isLoading: true })

    try {
      const llmMessages = buildConversationMessages(conversationHistory.value, userInput)
      let fullContent = ''

      await callLLMStream(
        llmMessages,
        config.value,
        (chunk) => {
          fullContent += chunk
          streamingContent.value = fullContent
          updateMessage(assistantMsg.id, { content: fullContent })
        },
        () => {
          updateMessage(assistantMsg.id, { isLoading: false })
          isLoading.value = false
          streamingContent.value = ''

          const schema = parseSchemaResponse(fullContent)
          if (schema) {
            applySchema(schema)
            updateMessage(assistantMsg.id, { schemaApplied: true })
          }
        },
        (error) => {
          updateMessage(assistantMsg.id, {
            isLoading: false,
            isError: true,
            content: `错误: ${error.message}`
          })
          isLoading.value = false
          streamingContent.value = ''
        }
      )
    } catch (error) {
      updateMessage(assistantMsg.id, {
        isLoading: false,
        isError: true,
        content: `错误: ${error instanceof Error ? error.message : String(error)}`
      })
      isLoading.value = false
      streamingContent.value = ''
    }
  }

  const applyMode = ref<'append' | 'replace'>('append')

  function applySchema(schema: ReturnType<typeof parseSchemaResponse>) {
    if (!schema) return

    const componentStore = useComponentStore()
    const historyStore = useHistoryStore()

    const components = convertSchemaToComponents(schema)

    if (applyMode.value === 'replace') {
      componentStore.clearAll()
    }

    components.forEach(comp => {
      componentStore.addComponent(comp)
    })

    historyStore.saveSnapshot()
  }

  function clearMessages() {
    messages.value = []
  }

  function togglePanel() {
    panelVisible.value = !panelVisible.value
  }

  loadConfig()

  return {
    config,
    messages,
    isLoading,
    panelVisible,
    streamingContent,
    hasApiKey,
    currentProvider,
    conversationHistory,
    applyMode,
    saveConfig,
    loadConfig,
    switchProvider,
    sendMessage,
    clearMessages,
    togglePanel,
    applySchema
  }
})
