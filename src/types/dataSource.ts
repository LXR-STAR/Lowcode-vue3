export type DataSourceType = 'static' | 'api' | 'globalVariable'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export type DataFormat = 'json' | 'form-data' | 'x-www-form-urlencoded'

export interface DataSourceConfig {
  id: string
  name: string
  type: DataSourceType
  description?: string
  enabled: boolean
  autoRefresh: boolean
  refreshInterval?: number
}

export interface StaticDataSource extends DataSourceConfig {
  type: 'static'
  data: any
}

export interface ApiDataSource extends DataSourceConfig {
  type: 'api'
  url: string
  method: HttpMethod
  headers: Record<string, string>
  params: ApiParam[]
  body?: string
  dataFormat: DataFormat
  dataPath?: string
  timeout: number
  retryCount: number
}

export interface ApiParam {
  id: string
  key: string
  value: string
  type: 'static' | 'variable' | 'component'
  required: boolean
  description?: string
}

export interface GlobalVariable extends DataSourceConfig {
  type: 'globalVariable'
  value: any
  valueType: 'string' | 'number' | 'boolean' | 'object' | 'array'
}

export type DataSource = StaticDataSource | ApiDataSource | GlobalVariable

export interface DataBinding {
  id: string
  componentId: string
  componentProp: string
  dataSourceId: string
  dataPath?: string
  transform?: string
  formatter?: string
}

export interface DataBindingConfig {
  sourceId: string
  sourcePath: string
  targetProp: string
  transform?: (data: any) => any
}

export interface ApiTestResult {
  success: boolean
  status?: number
  statusText?: string
  data?: any
  error?: string
  duration?: number
}

export interface DataSourceState {
  dataSources: DataSource[]
  bindings: DataBinding[]
  globalVariables: Record<string, any>
  loading: Record<string, boolean>
  errors: Record<string, string>
  lastFetchTime: Record<string, number>
}

export interface DataSourceManager {
  addDataSource: (dataSource: DataSource) => void
  updateDataSource: (id: string, updates: Partial<DataSource>) => void
  removeDataSource: (id: string) => void
  getDataSource: (id: string) => DataSource | undefined
  fetchData: (id: string, params?: Record<string, any>) => Promise<any>
  bindComponent: (binding: DataBinding) => void
  unbindComponent: (bindingId: string) => void
  refreshBindings: (dataSourceId: string) => void
}
