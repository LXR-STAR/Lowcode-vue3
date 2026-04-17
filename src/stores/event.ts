import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import type { ComponentEvent, EventAction, EventBinding, EventType, ActionType } from '@/types/events'
import { useComponentStore } from './component'
import { useDataSourceStore } from './dataSource'

export const useEventStore = defineStore('event', () => {
  const eventBindings = ref<EventBinding[]>([])
  const globalVariables = ref<Record<string, any>>({})

  function getComponentEvents(componentId: string): ComponentEvent[] {
    const binding = eventBindings.value.find(b => b.componentId === componentId)
    return binding?.events || []
  }

  function addEvent(componentId: string, event: Omit<ComponentEvent, 'id'>): ComponentEvent {
    let binding = eventBindings.value.find(b => b.componentId === componentId)
    const newEvent: ComponentEvent = {
      ...event,
      id: uuidv4()
    }
    
    if (!binding) {
      binding = {
        componentId,
        events: [newEvent]
      }
      eventBindings.value.push(binding)
    } else {
      binding.events.push(newEvent)
    }
    
    return newEvent
  }

  function updateEvent(componentId: string, eventId: string, updates: Partial<ComponentEvent>) {
    const binding = eventBindings.value.find(b => b.componentId === componentId)
    if (binding) {
      const eventIndex = binding.events.findIndex(e => e.id === eventId)
      if (eventIndex > -1) {
        binding.events[eventIndex] = { ...binding.events[eventIndex], ...updates }
      }
    }
  }

  function removeEvent(componentId: string, eventId: string) {
    const binding = eventBindings.value.find(b => b.componentId === componentId)
    if (binding) {
      binding.events = binding.events.filter(e => e.id !== eventId)
      if (binding.events.length === 0) {
        eventBindings.value = eventBindings.value.filter(b => b.componentId !== componentId)
      }
    }
  }

  function addAction(componentId: string, eventId: string, action: Omit<EventAction, 'id'>): EventAction {
    const binding = eventBindings.value.find(b => b.componentId === componentId)
    if (binding) {
      const event = binding.events.find(e => e.id === eventId)
      if (event) {
        const newAction: EventAction = {
          ...action,
          id: uuidv4()
        }
        event.actions.push(newAction)
        return newAction
      }
    }
    throw new Error('Event not found')
  }

  function updateAction(componentId: string, eventId: string, actionId: string, updates: Partial<EventAction>) {
    const binding = eventBindings.value.find(b => b.componentId === componentId)
    if (binding) {
      const event = binding.events.find(e => e.id === eventId)
      if (event) {
        const actionIndex = event.actions.findIndex(a => a.id === actionId)
        if (actionIndex > -1) {
          event.actions[actionIndex] = { ...event.actions[actionIndex], ...updates }
        }
      }
    }
  }

  function removeAction(componentId: string, eventId: string, actionId: string) {
    const binding = eventBindings.value.find(b => b.componentId === componentId)
    if (binding) {
      const event = binding.events.find(e => e.id === eventId)
      if (event) {
        event.actions = event.actions.filter(a => a.id !== actionId)
      }
    }
  }

  function setGlobalVariable(name: string, value: any) {
    globalVariables.value[name] = value
  }

  function getGlobalVariable(name: string): any {
    return globalVariables.value[name]
  }

  async function executeActions(actions: EventAction[], context: Record<string, any> = {}) {
    const componentStore = useComponentStore()
    const dataSourceStore = useDataSourceStore()
    
    for (const action of actions) {
      if (!action.enabled) continue
      
      try {
        await executeAction(action, context, componentStore, dataSourceStore)
      } catch (error) {
        console.error(`Action execution failed:`, error)
      }
    }
  }

  async function executeAction(
    action: EventAction, 
    context: Record<string, any>,
    componentStore: ReturnType<typeof useComponentStore>,
    dataSourceStore: ReturnType<typeof useDataSourceStore>
  ) {
    switch (action.type) {
      case 'navigate': {
        const config = action.config as any
        let url = config.url
        Object.keys(context).forEach(key => {
          url = url.replace(`{{${key}}}`, String(context[key]))
        })
        window.open(url, config.target || '_blank')
        break
      }
      
      case 'openModal': {
        const config = action.config as any
        const modalComponent = componentStore.getComponentById(config.modalId)
        if (modalComponent) {
          componentStore.updateComponent(config.modalId, { visible: true })
        }
        break
      }
      
      case 'closeModal': {
        const config = action.config as any
        componentStore.updateComponent(config.modalId, { visible: false })
        break
      }
      
      case 'showMessage': {
        const config = action.config as any
        const { ElMessage } = await import('element-plus')
        ElMessage({
          type: config.type || 'info',
          message: config.message || '',
          duration: config.duration || 3000
        })
        break
      }
      
      case 'setVariable': {
        const config = action.config as any
        let value = config.value
        
        if (config.valueType === 'component' && config.componentId && config.componentProp) {
          const component = componentStore.getComponentById(config.componentId)
          if (component) {
            value = component.props[config.componentProp]
          }
        } else if (config.valueType === 'expression') {
          try {
            const func = new Function('context', 'globalVars', `return ${config.value}`)
            value = func(context, globalVariables.value)
          } catch (e) {
            console.error('Expression evaluation failed:', e)
          }
        }
        
        setGlobalVariable(config.variableName, value)
        break
      }
      
      case 'apiRequest': {
        const config = action.config as any
        try {
          const result = await dataSourceStore.fetchData(config.dataSourceId, config.params)
          if (config.onSuccess && config.onSuccess.length > 0) {
            await executeActions(config.onSuccess, { ...context, result })
          }
        } catch (error) {
          if (config.onError && config.onError.length > 0) {
            await executeActions(config.onError, { ...context, error })
          }
        }
        break
      }
      
      case 'showComponent': {
        const config = action.config as any
        config.componentIds.forEach((id: string) => {
          componentStore.updateComponent(id, { visible: true })
        })
        break
      }
      
      case 'hideComponent': {
        const config = action.config as any
        config.componentIds.forEach((id: string) => {
          componentStore.updateComponent(id, { visible: false })
        })
        break
      }
      
      case 'toggleComponent': {
        const config = action.config as any
        config.componentIds.forEach((id: string) => {
          const component = componentStore.getComponentById(id)
          if (component) {
            componentStore.updateComponent(id, { visible: !component.visible })
          }
        })
        break
      }
      
      case 'validateForm': {
        const config = action.config as any
        break
      }
      
      case 'resetForm': {
        const config = action.config as any
        break
      }
    }
  }

  function getEventBindingsForExport() {
    return eventBindings.value
  }

  function importEventBindings(bindings: EventBinding[]) {
    eventBindings.value = bindings
  }

  function clearAllEvents() {
    eventBindings.value = []
  }

  return {
    eventBindings,
    globalVariables,
    getComponentEvents,
    addEvent,
    updateEvent,
    removeEvent,
    addAction,
    updateAction,
    removeAction,
    setGlobalVariable,
    getGlobalVariable,
    executeActions,
    getEventBindingsForExport,
    importEventBindings,
    clearAllEvents
  }
})
