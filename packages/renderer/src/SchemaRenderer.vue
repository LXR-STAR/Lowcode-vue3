<script setup lang="ts">
import { computed, defineAsyncComponent, markRaw, ref, onMounted, onUnmounted } from 'vue'
import type { SchemaPage, SchemaComponent, EventBinding, DataSource, DataBinding } from './types'

const props = defineProps<{
  schema: SchemaPage
  mode?: 'preview' | 'edit'
  eventBindings?: EventBinding[]
  dataSources?: DataSource[]
  bindings?: DataBinding[]
}>()

const emit = defineEmits<{
  (e: 'event', componentId: string, eventType: string, event: Event): void
}>()

const TextComponent = markRaw(defineAsyncComponent(() => import('./components/TextComponent.vue')))
const ImageComponent = markRaw(defineAsyncComponent(() => import('./components/ImageComponent.vue')))
const ButtonComponent = markRaw(defineAsyncComponent(() => import('./components/ButtonComponent.vue')))
const InputComponent = markRaw(defineAsyncComponent(() => import('./components/InputComponent.vue')))
const TextareaComponent = markRaw(defineAsyncComponent(() => import('./components/TextareaComponent.vue')))
const SelectComponent = markRaw(defineAsyncComponent(() => import('./components/SelectComponent.vue')))
const CheckboxComponent = markRaw(defineAsyncComponent(() => import('./components/CheckboxComponent.vue')))
const RadioComponent = markRaw(defineAsyncComponent(() => import('./components/RadioComponent.vue')))
const SwitchComponent = markRaw(defineAsyncComponent(() => import('./components/SwitchComponent.vue')))
const DatePickerComponent = markRaw(defineAsyncComponent(() => import('./components/DatePickerComponent.vue')))
const ChartComponent = markRaw(defineAsyncComponent(() => import('./components/ChartComponent.vue')))
const ContainerComponent = markRaw(defineAsyncComponent(() => import('./components/ContainerComponent.vue')))
const GridComponent = markRaw(defineAsyncComponent(() => import('./components/GridComponent.vue')))
const TableComponent = markRaw(defineAsyncComponent(() => import('./components/TableComponent.vue')))

const componentMap: Record<string, any> = {
  text: TextComponent,
  image: ImageComponent,
  button: ButtonComponent,
  input: InputComponent,
  textarea: TextareaComponent,
  select: SelectComponent,
  checkbox: CheckboxComponent,
  radio: RadioComponent,
  switch: SwitchComponent,
  datePicker: DatePickerComponent,
  chart: ChartComponent,
  container: ContainerComponent,
  grid: GridComponent,
  table: TableComponent
}

const globalVariables = ref<Record<string, any>>({})
const cachedData = ref<Record<string, any>>({})

const containerStyle = computed(() => ({
  width: `${props.schema?.canvas?.width || 1920}px`,
  height: `${props.schema?.canvas?.height || 1080}px`,
  backgroundColor: props.schema?.canvas?.backgroundColor || '#fff'
}))

const sortedComponents = computed(() => {
  if (!props.schema?.components) return []
  return [...props.schema.components].sort((a, b) => a.style.zIndex - b.style.zIndex)
})

function getComponentStyle(component: SchemaComponent) {
  const isContainer = component.type === 'container' || component.type === 'grid'
  const autoExpand = isContainer && component.props?.props?.autoExpand !== false

  return {
    position: 'absolute' as const,
    left: `${component.style.x}px`,
    top: `${component.style.y}px`,
    width: `${component.style.width}px`,
    height: autoExpand ? 'auto' : `${component.style.height}px`,
    minHeight: autoExpand ? `${component.style.height}px` : undefined,
    transform: component.style.rotate ? `rotate(${component.style.rotate}deg)` : undefined,
    opacity: component.style.opacity ?? 1,
    borderWidth: component.style.borderWidth ? `${component.style.borderWidth}px` : undefined,
    borderColor: component.style.borderColor,
    borderStyle: component.style.borderStyle,
    borderRadius: component.style.borderRadius ? `${component.style.borderRadius}px` : undefined,
    backgroundColor: component.style.backgroundColor,
    boxShadow: component.style.boxShadow,
    zIndex: component.style.zIndex,
    display: component.visible !== false ? 'block' : 'none'
  }
}

function getComponentType(type: string) {
  return componentMap[type] || TextComponent
}

function handleComponentEvent(componentId: string, eventType: string, event: Event) {
  emit('event', componentId, eventType, event)
  
  if (props.eventBindings) {
    const binding = props.eventBindings.find(b => b.componentId === componentId)
    if (binding) {
      const matchedEvent = binding.events.find(e => e.type === eventType && e.enabled)
      if (matchedEvent) {
        executeActions(matchedEvent.actions, { componentId, eventType, value: (event.target as any).value })
      }
    }
  }
}

async function executeActions(actions: any[], context: Record<string, any>) {
  for (const action of actions) {
    if (!action.enabled) continue
    
    try {
      switch (action.type) {
        case 'showMessage':
          console.log('Message:', action.config.message)
          break
        case 'setVariable':
          globalVariables.value[action.config.variableName] = action.config.value
          break
        case 'navigate':
          window.open(action.config.url, action.config.target || '_blank')
          break
      }
    } catch (error) {
      console.error('Action execution failed:', error)
    }
  }
}

async function loadDataSources() {
  if (!props.dataSources) return
  
  for (const ds of props.dataSources) {
    if (ds.enabled && ds.type === 'static') {
      cachedData.value[ds.id] = ds.data
    }
  }
}

onMounted(() => {
  loadDataSources()
})
</script>

<template>
  <div class="schema-renderer" :style="containerStyle">
    <template v-for="component in sortedComponents" :key="component.id">
      <div
        class="render-item"
        :style="getComponentStyle(component)"
        @click="handleComponentEvent(component.id, 'click', $event)"
        @dblclick="handleComponentEvent(component.id, 'dblclick', $event)"
        @mouseenter="handleComponentEvent(component.id, 'mouseenter', $event)"
        @mouseleave="handleComponentEvent(component.id, 'mouseleave', $event)"
      >
        <component
          :is="getComponentType(component.type)"
          :component="component"
          :mode="mode"
          @focus="handleComponentEvent(component.id, 'focus', $event)"
          @blur="handleComponentEvent(component.id, 'blur', $event)"
          @change="handleComponentEvent(component.id, 'change', $event)"
        />
      </div>
    </template>
  </div>
</template>

<style scoped>
.schema-renderer {
  position: relative;
  overflow: hidden;
}

.render-item {
  overflow: hidden;
}
</style>
