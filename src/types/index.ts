export * from './component'

export interface Point {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export interface Rect extends Point, Size {}

export interface EditorConfig {
  canvasWidth: number
  canvasHeight: number
  gridSize: number
  maxHistory: number
  minScale: number
  maxScale: number
  scaleStep: number
}

export const DEFAULT_CONFIG: EditorConfig = {
  canvasWidth: 1200,
  canvasHeight: 800,
  gridSize: 10,
  maxHistory: 50,
  minScale: 0.25,
  maxScale: 4,
  scaleStep: 0.1
}

export const DEFAULT_COMPONENT_STYLE = {
  width: 100,
  height: 40,
  x: 0,
  y: 0,
  rotate: 0,
  opacity: 1,
  borderWidth: 0,
  borderColor: '#dcdfe6',
  borderStyle: 'solid',
  borderRadius: 4,
  backgroundColor: 'transparent',
  boxShadow: 'none',
  zIndex: 1
}

export const DEFAULT_TEXT_STYLE = {
  fontSize: 14,
  fontFamily: 'Arial, sans-serif',
  fontWeight: 'normal',
  fontStyle: 'normal',
  textDecoration: 'none',
  lineHeight: 1.5,
  textAlign: 'left' as const,
  color: '#333333'
}
