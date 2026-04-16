import type { App } from 'vue'
import SchemaRenderer from './SchemaRenderer.vue'
import type { SchemaPage } from '@/types/schema'

export { SchemaRenderer }
export type { SchemaPage }

export interface RendererOptions {
  prefix?: string
}

export function createRenderer(options: RendererOptions = {}) {
  const prefix = options.prefix || 'Schema'
  
  return {
    install(app: App) {
      app.component(`${prefix}Renderer`, SchemaRenderer)
    }
  }
}

export default SchemaRenderer
