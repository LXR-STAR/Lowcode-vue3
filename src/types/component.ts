export type ComponentType =
  | 'text'
  | 'image'
  | 'button'
  | 'input'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'switch'
  | 'datePicker'
  | 'container'
  | 'grid'
  | 'chart'
  | 'table'

export interface ComponentStyle {
  width: number
  height: number
  x: number
  y: number
  rotate: number
  opacity: number
  borderWidth: number
  borderColor: string
  borderStyle: string
  borderRadius: number
  backgroundColor: string
  boxShadow: string
  zIndex: number
}

export interface TextStyle {
  fontSize: number
  fontFamily: string
  fontWeight: string
  fontStyle: string
  textDecoration: string
  lineHeight: number
  textAlign: 'left' | 'center' | 'right'
  color: string
}

export interface ImageStyle {
  objectFit: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down'
  src: string
  alt: string
}

export interface ButtonStyle {
  type: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default'
  size: 'large' | 'default' | 'small'
  plain: boolean
  round: boolean
  circle: boolean
}

export interface InputStyle {
  placeholder: string
  type: 'text' | 'password' | 'number' | 'email'
  maxlength: number
  disabled: boolean
  clearable: boolean
}

export interface ChartStyle {
  chartType: 'line' | 'bar' | 'pie' | 'scatter' | 'radar'
  option: Record<string, any>
}

export interface ComponentProps {
  text?: string
  textStyle?: TextStyle
  imageStyle?: ImageStyle
  buttonStyle?: ButtonStyle
  inputStyle?: InputStyle
  chartStyle?: ChartStyle
  [key: string]: any
}

export interface EditorComponent {
  id: string
  name: string
  type: ComponentType
  style: ComponentStyle
  props: ComponentProps
  children?: EditorComponent[]
  parentId?: string
  locked: boolean
  visible: boolean
}

export interface ComponentTemplate {
  type: ComponentType
  name: string
  icon: string
  defaultStyle: Partial<ComponentStyle>
  defaultProps: Partial<ComponentProps>
}

export interface EditorState {
  components: EditorComponent[]
  selectedComponentIds: string[]
  copiedComponents: EditorComponent[]
  canvas: CanvasState
  history: HistoryState
}

export interface CanvasState {
  scale: number
  offsetX: number
  offsetY: number
  width: number
  height: number
  showGrid: boolean
  gridSize: number
  showGuides: boolean
  snapToGrid: boolean
  snapToGuides: boolean
}

export interface HistoryState {
  snapshots: EditorComponent[][]
  currentIndex: number
  maxHistory: number
}

export interface GuideLine {
  id: string
  type: 'horizontal' | 'vertical'
  position: number
}

export interface DragState {
  isDragging: boolean
  dragType: 'new' | 'move' | 'resize'
  startX: number
  startY: number
  currentX: number
  currentY: number
  componentId?: string
  componentType?: ComponentType
}

export interface ResizeHandle {
  type: 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'
  cursor: string
  x: number
  y: number
}
