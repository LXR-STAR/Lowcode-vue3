export interface SchemaStyle {
  x: number
  y: number
  width: number
  height: number
  rotate?: number
  opacity?: number
  borderWidth?: number
  borderColor?: string
  borderStyle?: string
  borderRadius?: number
  backgroundColor?: string
  boxShadow?: string
  zIndex: number
}

export interface SchemaComponent {
  id: string
  type: string
  name: string
  style: SchemaStyle
  props: Record<string, any>
  children?: SchemaComponent[]
  locked?: boolean
  visible?: boolean
}

export interface SchemaCanvas {
  width: number
  height: number
  backgroundColor?: string
  backgroundImage?: string
}

export interface SchemaPage {
  version: string
  name: string
  description?: string
  canvas: SchemaCanvas
  components: SchemaComponent[]
  events?: any[]
  dataSources?: any[]
  bindings?: any[]
  metadata?: {
    createdAt?: string
    updatedAt?: string
    author?: string
    [key: string]: any
  }
}

export const SCHEMA_VERSION = '1.0.0'

export function createEmptySchema(name: string = '未命名页面'): SchemaPage {
  return {
    version: SCHEMA_VERSION,
    name,
    canvas: {
      width: 1920,
      height: 1080
    },
    components: [],
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }
}

export function validateSchema(schema: any): schema is SchemaPage {
  if (!schema || typeof schema !== 'object') return false
  if (!schema.version || typeof schema.version !== 'string') return false
  if (!schema.canvas || typeof schema.canvas !== 'object') return false
  if (!Array.isArray(schema.components)) return false

  if (typeof schema.canvas.width !== 'number' || typeof schema.canvas.height !== 'number') {
    return false
  }

  return true
}

export function migrateSchema(schema: any): SchemaPage {
  if (!validateSchema(schema)) {
    throw new Error('Invalid schema format')
  }

  const currentVersion = SCHEMA_VERSION
  if (schema.version === currentVersion) {
    return schema
  }

  return {
    ...schema,
    version: currentVersion,
    metadata: {
      ...schema.metadata,
      updatedAt: new Date().toISOString(),
      migratedFrom: schema.version
    }
  }
}
