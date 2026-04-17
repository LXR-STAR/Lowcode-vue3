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

export interface ComponentEvent {
  id: string
  type: string
  enabled: boolean
  actions: any[]
  condition?: string
}

export interface EventBinding {
  componentId: string
  events: ComponentEvent[]
}

export interface DataSource {
  id: string
  name: string
  type: 'static' | 'api' | 'globalVariable'
  enabled: boolean
  [key: string]: any
}

export interface DataBinding {
  id: string
  componentId: string
  componentProp: string
  dataSourceId: string
  dataPath?: string
  transform?: string
  formatter?: string
}
