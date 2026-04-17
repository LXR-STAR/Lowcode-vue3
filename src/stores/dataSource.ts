import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import type { 
  DataSource, 
  StaticDataSource, 
  ApiDataSource, 
  GlobalVariable,
  DataBinding,
  ApiTestResult,
  ApiParam
} from '@/types/dataSource'
import { useComponentStore } from './component'

export const useDataSourceStore = defineStore('dataSource', () => {
  const dataSources = ref<DataSource[]>([])
  const bindings = ref<DataBinding[]>([])
  const loading = ref<Record<string, boolean>>({})
  const errors = ref<Record<string, string>>({})
  const lastFetchTime = ref<Record<string, number>>({})
  const cachedData = ref<Record<string, any>>({})

  function addDataSource(dataSource: Omit<DataSource, 'id'>): DataSource {
    const newDataSource: DataSource = {
      ...dataSource,
      id: uuidv4()
    } as DataSource
    dataSources.value.push(newDataSource)
    return newDataSource
  }

  function updateDataSource(id: string, updates: Partial<DataSource>) {
    const index = dataSources.value.findIndex(ds => ds.id === id)
    if (index > -1) {
      dataSources.value[index] = { ...dataSources.value[index], ...updates } as DataSource
    }
  }

  function removeDataSource(id: string) {
    dataSources.value = dataSources.value.filter(ds => ds.id !== id)
    bindings.value = bindings.value.filter(b => b.dataSourceId !== id)
    delete cachedData.value[id]
    delete loading.value[id]
    delete errors.value[id]
    delete lastFetchTime.value[id]
  }

  function getDataSource(id: string): DataSource | undefined {
    return dataSources.value.find(ds => ds.id === id)
  }

  async function fetchData(id: string, params: Record<string, any> = {}): Promise<any> {
    const dataSource = getDataSource(id)
    if (!dataSource) {
      throw new Error(`Data source not found: ${id}`)
    }

    if (!dataSource.enabled) {
      throw new Error(`Data source is disabled: ${id}`)
    }

    loading.value[id] = true
    errors.value[id] = ''
    const startTime = Date.now()

    try {
      let result: any

      switch (dataSource.type) {
        case 'static':
          result = await fetchStaticData(dataSource)
          break
        case 'api':
          result = await fetchApiData(dataSource, params)
          break
        case 'globalVariable':
          result = dataSource.value
          break
      }

      cachedData.value[id] = result
      lastFetchTime.value[id] = startTime
      refreshBindings(id)
      
      return result
    } catch (error: any) {
      errors.value[id] = error.message || 'Unknown error'
      throw error
    } finally {
      loading.value[id] = false
    }
  }

  async function fetchStaticData(dataSource: StaticDataSource): Promise<any> {
    return dataSource.data
  }

  async function fetchApiData(dataSource: ApiDataSource, params: Record<string, any>): Promise<any> {
    const url = buildUrl(dataSource.url, dataSource.params, params)
    
    const options: RequestInit = {
      method: dataSource.method,
      headers: {
        'Content-Type': 'application/json',
        ...dataSource.headers
      }
    }

    if (dataSource.method !== 'GET' && dataSource.body) {
      options.body = dataSource.body
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), dataSource.timeout || 30000)
    options.signal = controller.signal

    try {
      const response = await fetch(url, options)
      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      let data = await response.json()

      if (dataSource.dataPath) {
        data = extractDataByPath(data, dataSource.dataPath)
      }

      return data
    } catch (error: any) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        throw new Error('Request timeout')
      }
      throw error
    }
  }

  function buildUrl(baseUrl: string, apiParams: ApiParam[], contextParams: Record<string, any>): string {
    const url = new URL(baseUrl, window.location.origin)
    
    apiParams.forEach(param => {
      let value = param.value
      
      if (param.type === 'variable') {
        value = contextParams[param.value] || param.value
      }
      
      if (param.required || value) {
        url.searchParams.append(param.key, String(value))
      }
    })

    return url.toString()
  }

  function extractDataByPath(data: any, path: string): any {
    const keys = path.split('.')
    let result = data
    
    for (const key of keys) {
      if (result && typeof result === 'object' && key in result) {
        result = result[key]
      } else {
        return undefined
      }
    }
    
    return result
  }

  function addBinding(binding: Omit<DataBinding, 'id'>): DataBinding {
    const newBinding: DataBinding = {
      ...binding,
      id: uuidv4()
    }
    bindings.value.push(newBinding)
    return newBinding
  }

  function updateBinding(id: string, updates: Partial<DataBinding>) {
    const index = bindings.value.findIndex(b => b.id === id)
    if (index > -1) {
      bindings.value[index] = { ...bindings.value[index], ...updates }
    }
  }

  function removeBinding(id: string) {
    bindings.value = bindings.value.filter(b => b.id !== id)
  }

  function getComponentBindings(componentId: string): DataBinding[] {
    return bindings.value.filter(b => b.componentId === componentId)
  }

  function refreshBindings(dataSourceId: string) {
    const componentStore = useComponentStore()
    const data = cachedData.value[dataSourceId]
    
    if (data === undefined) return

    const relatedBindings = bindings.value.filter(b => b.dataSourceId === dataSourceId)
    
    relatedBindings.forEach(binding => {
      let value = data
      
      if (binding.dataPath) {
        value = extractDataByPath(data, binding.dataPath)
      }

      if (binding.transform) {
        try {
          const transformFunc = new Function('data', binding.transform)
          value = transformFunc(value)
        } catch (e) {
          console.error('Transform failed:', e)
        }
      }

      if (binding.formatter) {
        try {
          const formatFunc = new Function('value', binding.formatter)
          value = formatFunc(value)
        } catch (e) {
          console.error('Format failed:', e)
        }
      }

      componentStore.updateComponentProps(binding.componentId, {
        [binding.componentProp]: value
      })
    })
  }

  async function testApiConnection(dataSource: ApiDataSource, params: Record<string, any> = {}): Promise<ApiTestResult> {
    const startTime = Date.now()
    
    try {
      const url = buildUrl(dataSource.url, dataSource.params, params)
      
      const options: RequestInit = {
        method: dataSource.method,
        headers: {
          'Content-Type': 'application/json',
          ...dataSource.headers
        }
      }

      if (dataSource.method !== 'GET' && dataSource.body) {
        options.body = dataSource.body
      }

      const response = await fetch(url, options)
      const data = await response.json()
      
      return {
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        data: dataSource.dataPath ? extractDataByPath(data, dataSource.dataPath) : data,
        duration: Date.now() - startTime
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        duration: Date.now() - startTime
      }
    }
  }

  function getDataSourcesForExport() {
    return dataSources.value
  }

  function getBindingsForExport() {
    return bindings.value
  }

  function importDataSources(sources: DataSource[]) {
    dataSources.value = sources
  }

  function importBindings(binds: DataBinding[]) {
    bindings.value = binds
  }

  function clearAll() {
    dataSources.value = []
    bindings.value = []
    cachedData.value = {}
    loading.value = {}
    errors.value = {}
    lastFetchTime.value = {}
  }

  return {
    dataSources,
    bindings,
    loading,
    errors,
    lastFetchTime,
    cachedData,
    addDataSource,
    updateDataSource,
    removeDataSource,
    getDataSource,
    fetchData,
    addBinding,
    updateBinding,
    removeBinding,
    getComponentBindings,
    refreshBindings,
    testApiConnection,
    getDataSourcesForExport,
    getBindingsForExport,
    importDataSources,
    importBindings,
    clearAll
  }
})
