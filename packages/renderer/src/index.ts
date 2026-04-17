import type { App } from 'vue'
import SchemaRenderer from './SchemaRenderer.vue'
import type { SchemaPage, SchemaComponent, SchemaStyle, SchemaCanvas, EventBinding, DataSource, DataBinding } from './types'

export { SchemaRenderer }
export type { SchemaPage, SchemaComponent, SchemaStyle, SchemaCanvas, EventBinding, DataSource, DataBinding }

export interface RendererOptions {
  prefix?: string
  components?: Record<string, any>
}

export function createRenderer(options: RendererOptions = {}) {
  const prefix = options.prefix || 'DevFlow'
  const customComponents = options.components || {}
  
  return {
    install(app: App) {
      app.component(`${prefix}Renderer`, SchemaRenderer)
      
      app.provide('devflow-custom-components', customComponents)
    }
  }
}

export function registerComponent(type: string, component: any) {
  return { type, component }
}

export default SchemaRenderer
