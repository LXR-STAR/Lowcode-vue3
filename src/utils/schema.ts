import type { SchemaPage, SchemaComponent, SchemaCanvas } from '@/types/schema'
import type { EditorComponent } from '@/types/component'
import { useComponentStore } from '@/stores/component'
import { useEditorStore } from '@/stores/editor'
import { useEventStore } from '@/stores/event'
import { useDataSourceStore } from '@/stores/dataSource'
import { SCHEMA_VERSION, createEmptySchema, validateSchema, migrateSchema } from '@/types/schema'

export function exportToSchema(): SchemaPage {
  const componentStore = useComponentStore()
  const editorStore = useEditorStore()
  const eventStore = useEventStore()
  const dataSourceStore = useDataSourceStore()

  const schema: SchemaPage = {
    version: SCHEMA_VERSION,
    name: '导出页面',
    canvas: {
      width: editorStore.canvas.width,
      height: editorStore.canvas.height,
      backgroundColor: '#ffffff'
    },
    components: componentStore.components.map(convertToSchemaComponent),
    events: eventStore.getEventBindingsForExport(),
    dataSources: dataSourceStore.getDataSourcesForExport(),
    bindings: dataSourceStore.getBindingsForExport(),
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      componentCount: componentStore.components.length
    }
  }

  return schema
}

export function importFromSchema(schema: SchemaPage): void {
  const componentStore = useComponentStore()
  const editorStore = useEditorStore()
  const eventStore = useEventStore()
  const dataSourceStore = useDataSourceStore()

  const migratedSchema = migrateSchema(schema)

  editorStore.setCanvasSize(migratedSchema.canvas.width, migratedSchema.canvas.height)

  componentStore.setComponents(
    migratedSchema.components.map(convertFromSchemaComponent)
  )

  if (migratedSchema.events) {
    eventStore.importEventBindings(migratedSchema.events)
  }

  if (migratedSchema.dataSources) {
    dataSourceStore.importDataSources(migratedSchema.dataSources)
  }

  if (migratedSchema.bindings) {
    dataSourceStore.importBindings(migratedSchema.bindings)
  }
}

function convertToSchemaComponent(component: EditorComponent): SchemaComponent {
  const schemaComponent: SchemaComponent = {
    id: component.id,
    type: component.type,
    name: component.name,
    style: {
      x: component.style.x,
      y: component.style.y,
      width: component.style.width,
      height: component.style.height,
      rotate: component.style.rotate || 0,
      opacity: component.style.opacity ?? 1,
      borderWidth: component.style.borderWidth || 0,
      borderColor: component.style.borderColor || 'transparent',
      borderStyle: component.style.borderStyle || 'solid',
      borderRadius: component.style.borderRadius || 0,
      backgroundColor: component.style.backgroundColor || 'transparent',
      boxShadow: component.style.boxShadow || 'none',
      zIndex: component.style.zIndex,
      padding: component.style.padding,
      margin: component.style.margin,
      overflow: component.style.overflow
    },
    props: component.props || {},
    locked: component.locked || false,
    visible: component.visible !== false
  }

  if (component.children && component.children.length > 0) {
    schemaComponent.children = component.children.map(convertToSchemaComponent)
  }

  return schemaComponent
}

function convertFromSchemaComponent(schemaComponent: SchemaComponent): EditorComponent {
  const component: EditorComponent = {
    id: schemaComponent.id,
    type: schemaComponent.type as any,
    name: schemaComponent.name,
    style: {
      x: schemaComponent.style.x,
      y: schemaComponent.style.y,
      width: schemaComponent.style.width,
      height: schemaComponent.style.height,
      rotate: schemaComponent.style.rotate || 0,
      opacity: schemaComponent.style.opacity ?? 1,
      borderWidth: schemaComponent.style.borderWidth || 0,
      borderColor: schemaComponent.style.borderColor || 'transparent',
      borderStyle: schemaComponent.style.borderStyle || 'solid',
      borderRadius: schemaComponent.style.borderRadius || 0,
      backgroundColor: schemaComponent.style.backgroundColor || 'transparent',
      boxShadow: schemaComponent.style.boxShadow || 'none',
      zIndex: schemaComponent.style.zIndex,
      padding: schemaComponent.style.padding,
      margin: schemaComponent.style.margin,
      overflow: schemaComponent.style.overflow as any
    },
    props: schemaComponent.props || {},
    locked: schemaComponent.locked || false,
    visible: schemaComponent.visible !== false
  }

  if (schemaComponent.children && schemaComponent.children.length > 0) {
    component.children = schemaComponent.children.map(convertFromSchemaComponent)
  }

  return component
}

export function downloadSchema(schema: SchemaPage, filename?: string): void {
  const json = JSON.stringify(schema, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename || `${schema.name}_${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function loadSchemaFile(): Promise<SchemaPage> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) {
        reject(new Error('No file selected'))
        return
      }

      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string
          const schema = JSON.parse(content)

          if (!validateSchema(schema)) {
            reject(new Error('Invalid schema format'))
            return
          }

          resolve(migrateSchema(schema))
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    }

    input.click()
  })
}

export { createEmptySchema, validateSchema, migrateSchema }
