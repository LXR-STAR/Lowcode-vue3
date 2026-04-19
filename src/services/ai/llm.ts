export interface LLMProvider {
  id: string
  name: string
  apiUrl: string
  models: { label: string; value: string }[]
  defaultModel: string
}

export const LLM_PROVIDERS: LLMProvider[] = [
  {
    id: 'zhipu',
    name: '智谱 AI',
    apiUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    models: [
      { label: 'GLM-4-Flash (推荐)', value: 'glm-4-flash' },
      { label: 'GLM-4-Plus', value: 'glm-4-plus' },
      { label: 'GLM-4-Air', value: 'glm-4-air' },
      { label: 'GLM-4-Long', value: 'glm-4-long' }
    ],
    defaultModel: 'glm-4-flash'
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    apiUrl: 'https://api.deepseek.com/chat/completions',
    models: [
      { label: 'DeepSeek-V3', value: 'deepseek-chat' },
      { label: 'DeepSeek-R1', value: 'deepseek-reasoner' }
    ],
    defaultModel: 'deepseek-chat'
  },
  {
    id: 'doubao',
    name: '豆包',
    apiUrl: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
    models: [
      { label: 'Doubao-1.5-Pro', value: 'doubao-1-5-pro-32k' },
      { label: 'Doubao-1.5-Lite', value: 'doubao-1-5-lite-32k' }
    ],
    defaultModel: 'doubao-1-5-pro-32k'
  },
  {
    id: 'qwen',
    name: '通义千问',
    apiUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    models: [
      { label: 'Qwen-Max', value: 'qwen-max' },
      { label: 'Qwen-Plus', value: 'qwen-plus' },
      { label: 'Qwen-Turbo', value: 'qwen-turbo' }
    ],
    defaultModel: 'qwen-plus'
  },
  {
    id: 'moonshot',
    name: 'Moonshot (Kimi)',
    apiUrl: 'https://api.moonshot.cn/v1/chat/completions',
    models: [
      { label: 'Moonshot-v1-8K', value: 'moonshot-v1-8k' },
      { label: 'Moonshot-v1-32K', value: 'moonshot-v1-32k' },
      { label: 'Moonshot-v1-128K', value: 'moonshot-v1-128k' }
    ],
    defaultModel: 'moonshot-v1-8k'
  },
  {
    id: 'openai',
    name: 'OpenAI',
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    models: [
      { label: 'GPT-4o', value: 'gpt-4o' },
      { label: 'GPT-4o Mini', value: 'gpt-4o-mini' },
      { label: 'GPT-4 Turbo', value: 'gpt-4-turbo' }
    ],
    defaultModel: 'gpt-4o-mini'
  },
  {
    id: 'custom',
    name: '自定义',
    apiUrl: '',
    models: [],
    defaultModel: ''
  }
]

export function getProviderById(id: string): LLMProvider | undefined {
  return LLM_PROVIDERS.find(p => p.id === id)
}

export interface LLMConfig {
  providerId: string
  apiUrl: string
  apiKey: string
  model: string
  temperature: number
  maxTokens: number
}

const ZHIPU_PROVIDER = LLM_PROVIDERS[0]

const envApiKey = import.meta.env.VITE_ZHIPU_API_KEY || ''
console.log('[AI] 环境变量 API Key:', envApiKey ? `${envApiKey.slice(0, 8)}...` : '(空)')

export const DEFAULT_LLM_CONFIG: LLMConfig = {
  providerId: 'zhipu',
  apiUrl: ZHIPU_PROVIDER.apiUrl,
  apiKey: envApiKey,
  model: ZHIPU_PROVIDER.defaultModel,
  temperature: 0.7,
  maxTokens: 4096
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface LLMResponse {
  content: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export async function callLLM(
  messages: ChatMessage[],
  config: LLMConfig
): Promise<LLMResponse> {
  const response = await fetch(config.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: config.temperature,
      max_tokens: config.maxTokens
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`LLM API 调用失败: ${response.status} ${error}`)
  }

  const data = await response.json()

  return {
    content: data.choices[0].message.content,
    usage: data.usage
      ? {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens
        }
      : undefined
  }
}

export async function callLLMStream(
  messages: ChatMessage[],
  config: LLMConfig,
  onChunk: (chunk: string) => void,
  onDone: () => void,
  onError: (error: Error) => void
): Promise<void> {
  try {
    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages,
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        stream: true
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`LLM API 调用失败: ${response.status} ${error}`)
    }

    const reader = response.body!.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed === 'data: [DONE]') continue
        if (!trimmed.startsWith('data: ')) continue

        try {
          const json = JSON.parse(trimmed.slice(6))
          const content = json.choices?.[0]?.delta?.content
          if (content) {
            onChunk(content)
          }
        } catch {
          // skip invalid JSON
        }
      }
    }

    onDone()
  } catch (error) {
    onError(error instanceof Error ? error : new Error(String(error)))
  }
}
