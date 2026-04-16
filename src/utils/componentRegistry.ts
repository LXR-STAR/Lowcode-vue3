import type { Component, Raw } from 'vue'

export interface ComponentPropDefinition {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'color' | 'select'
  label: string
  default?: any
  options?: { label: string; value: any }[]
  min?: number
  max?: number
  step?: number
  placeholder?: string
  visible?: (props: Record<string, any>) => boolean
}

export interface ComponentDefinition {
  type: string
  name: string
  icon: string
  category: string
  group?: string
  defaultProps: Record<string, any>
  defaultStyle: {
    width: number
    height: number
  }
  propsDefinition: Record<string, ComponentPropDefinition>
  component: Raw<Component>
  codeGenerator?: (component: any, format: string) => string
}

class ComponentRegistry {
  private components: Map<string, ComponentDefinition> = new Map()
  private categories: Map<string, { name: string; order: number }> = new Map()
  
  register(definition: ComponentDefinition): void {
    if (this.components.has(definition.type)) {
      console.warn(`Component type "${definition.type}" already registered, will be overwritten`)
    }
    
    this.components.set(definition.type, definition)
    
    if (!this.categories.has(definition.category)) {
      this.categories.set(definition.category, {
        name: definition.category,
        order: this.categories.size
      })
    }
  }
  
  unregister(type: string): boolean {
    return this.components.delete(type)
  }
  
  get(type: string): ComponentDefinition | undefined {
    return this.components.get(type)
  }
  
  getAll(): ComponentDefinition[] {
    return Array.from(this.components.values())
  }
  
  getByCategory(category: string): ComponentDefinition[] {
    return this.getAll().filter(comp => comp.category === category)
  }
  
  getCategories(): { name: string; order: number }[] {
    return Array.from(this.categories.values()).sort((a, b) => a.order - b.order)
  }
  
  getGrouped(): Map<string, ComponentDefinition[]> {
    const grouped = new Map<string, ComponentDefinition[]>()
    
    this.components.forEach(comp => {
      const group = comp.group || comp.category
      if (!grouped.has(group)) {
        grouped.set(group, [])
      }
      grouped.get(group)!.push(comp)
    })
    
    return grouped
  }
  
  has(type: string): boolean {
    return this.components.has(type)
  }
  
  clear(): void {
    this.components.clear()
    this.categories.clear()
  }
}

export const componentRegistry = new ComponentRegistry()

export function registerComponent(definition: ComponentDefinition): void {
  componentRegistry.register(definition)
}

export function getComponentDefinition(type: string): ComponentDefinition | undefined {
  return componentRegistry.get(type)
}

export function getAllComponents(): ComponentDefinition[] {
  return componentRegistry.getAll()
}

export function getComponentsByCategory(category: string): ComponentDefinition[] {
  return componentRegistry.getByCategory(category)
}
