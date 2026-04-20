<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useComponentStore, useEditorStore, useEventStore, useDataSourceStore } from '@/stores'
import type { EditorComponent } from '@/types'

const TextComponent = defineAsyncComponent(() => import('@/components/components/TextComponent.vue'))
const ImageComponent = defineAsyncComponent(() => import('@/components/components/ImageComponent.vue'))
const ButtonComponent = defineAsyncComponent(() => import('@/components/components/ButtonComponent.vue'))
const InputComponent = defineAsyncComponent(() => import('@/components/components/InputComponent.vue'))
const TextareaComponent = defineAsyncComponent(() => import('@/components/components/TextareaComponent.vue'))
const SelectComponent = defineAsyncComponent(() => import('@/components/components/SelectComponent.vue'))
const CheckboxComponent = defineAsyncComponent(() => import('@/components/components/CheckboxComponent.vue'))
const RadioComponent = defineAsyncComponent(() => import('@/components/components/RadioComponent.vue'))
const SwitchComponent = defineAsyncComponent(() => import('@/components/components/SwitchComponent.vue'))
const DatePickerComponent = defineAsyncComponent(() => import('@/components/components/DatePickerComponent.vue'))
const ChartComponent = defineAsyncComponent(() => import('@/components/components/ChartComponent.vue'))
const ContainerComponent = defineAsyncComponent(() => import('@/components/components/ContainerComponent.vue'))
const GridComponent = defineAsyncComponent(() => import('@/components/components/GridComponent.vue'))
const TableComponent = defineAsyncComponent(() => import('@/components/components/TableComponent.vue'))
const LinkComponent = defineAsyncComponent(() => import('@/components/components/LinkComponent.vue'))

const router = useRouter()
const componentStore = useComponentStore()
const editorStore = useEditorStore()
const eventStore = useEventStore()
const dataSourceStore = useDataSourceStore()

const previewScale = ref(1)

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
  table: TableComponent,
  link: LinkComponent
}

const sortedComponents = computed(() =>
  [...componentStore.getRootComponents()].sort((a, b) => a.style.zIndex - b.style.zIndex)
)

const canvasStyle = computed(() => ({
  width: `${editorStore.canvas.width}px`,
  height: `${editorStore.canvas.height}px`,
  transform: `scale(${previewScale.value})`,
  transformOrigin: 'center center'
}))

function calculateScale() {
  const canvasWidth = editorStore.canvas.width
  const canvasHeight = editorStore.canvas.height

  const containerWidth = window.innerWidth - 80
  const containerHeight = window.innerHeight - 140

  const scaleX = containerWidth / canvasWidth
  const scaleY = containerHeight / canvasHeight

  previewScale.value = Math.min(scaleX, scaleY, 1)
}

function handleZoomIn() {
  previewScale.value = Math.min(previewScale.value + 0.1, 2)
}

function handleZoomOut() {
  previewScale.value = Math.max(previewScale.value - 0.1, 0.1)
}

function handleResetZoom() {
  calculateScale()
}

function handleBack() {
  router.push('/')
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    handleBack()
  }
}

function handleResize() {
  calculateScale()
}

function getComponentStyle(component: EditorComponent) {
  const isContainer = component.type === 'container' || component.type === 'grid'
  const isInContainer = !!component.parentId
  const autoExpand = isContainer && component.props?.props?.autoExpand !== false

  return {
    position: isInContainer ? 'relative' as const : 'absolute' as const,
    left: isInContainer ? undefined : `${component.style.x}px`,
    top: isInContainer ? undefined : `${component.style.y}px`,
    width: `${component.style.width}px`,
    height: autoExpand ? 'auto' : `${component.style.height}px`,
    minHeight: autoExpand ? `${component.style.height}px` : undefined,
    transform: `rotate(${component.style.rotate || 0}deg)`,
    opacity: component.style.opacity ?? 1,
    borderWidth: `${component.style.borderWidth || 0}px`,
    borderColor: component.style.borderColor || 'transparent',
    borderStyle: component.style.borderStyle || 'solid',
    borderRadius: `${component.style.borderRadius || 0}px`,
    backgroundColor: component.style.backgroundColor || 'transparent',
    boxShadow: component.style.boxShadow || 'none',
    zIndex: component.style.zIndex,
    padding: component.style.padding ? `${component.style.padding}px` : undefined,
    margin: component.style.margin ? `${component.style.margin}px` : undefined,
    overflow: component.style.overflow || 'visible',
    display: component.visible !== false ? 'block' : 'none'
  }
}

function handleComponentEvent(componentId: string, eventType: string, event: Event) {
  const events = eventStore.getComponentEvents(componentId)
  const matchedEvent = events.find(e => e.type === eventType && e.enabled)

  if (matchedEvent) {
    if (matchedEvent.condition) {
      try {
        const conditionFunc = new Function('context', 'event', `return ${matchedEvent.condition}`)
        if (!conditionFunc({}, event)) {
          return
        }
      } catch (e) {
        console.error('Condition evaluation failed:', e)
      }
    }

    const context = {
      componentId,
      eventType,
      value: (event.target as any).value,
      checked: (event.target as any).checked
    }

    eventStore.executeActions(matchedEvent.actions, context)
  }
}

async function loadAllDataSources() {
  for (const ds of dataSourceStore.dataSources) {
    if (ds.enabled && ds.autoRefresh) {
      try {
        await dataSourceStore.fetchData(ds.id)
      } catch (error) {
        console.error(`Failed to load data source ${ds.name}:`, error)
      }
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('resize', handleResize)
  calculateScale()
  loadAllDataSources()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="preview-container">
    <div class="preview-header">
      <div class="header-left">
        <el-button @click="handleBack" circle>
          <el-icon><Back /></el-icon>
        </el-button>
        <h2>页面预览</h2>
      </div>

      <div class="header-right">
        <el-button-group>
          <el-button size="small" @click="handleZoomOut">
            <el-icon><ZoomOut /></el-icon>
          </el-button>
          <el-button size="small" disabled>
            {{ Math.round(previewScale * 100) }}%
          </el-button>
          <el-button size="small" @click="handleZoomIn">
            <el-icon><ZoomIn /></el-icon>
          </el-button>
        </el-button-group>
        <el-button size="small" @click="handleResetZoom">自适应</el-button>
      </div>
    </div>

    <div class="preview-body">
      <div class="preview-canvas-wrapper">
        <div class="preview-canvas" :style="canvasStyle">
          <template v-for="component in sortedComponents" :key="component.id">
            <div
              class="preview-component"
              :style="getComponentStyle(component)"
              @click="handleComponentEvent(component.id, 'click', $event)"
              @dblclick="handleComponentEvent(component.id, 'dblclick', $event)"
              @mouseenter="handleComponentEvent(component.id, 'mouseenter', $event)"
              @mouseleave="handleComponentEvent(component.id, 'mouseleave', $event)"
            >
              <component
                :is="componentMap[component.type] || TextComponent"
                :component="component"
                mode="preview"
                @click="component.type === 'button' ? handleComponentEvent(component.id, 'click', $event) : undefined"
                @focus="handleComponentEvent(component.id, 'focus', $event)"
                @blur="handleComponentEvent(component.id, 'blur', $event)"
                @change="handleComponentEvent(component.id, 'change', $event)"
              />
            </div>
          </template>
        </div>
      </div>
    </div>

    <div class="preview-footer">
      <span>画布: {{ editorStore.canvas.width }} × {{ editorStore.canvas.height }}</span>
      <span>{{ componentStore.components.length }} 个组件</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.preview-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #1a1a1a;
}

.preview-header {
  height: 56px;
  background: #2d2d2d;
  border-bottom: 1px solid #3d3d3d;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  flex-shrink: 0;

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;

    h2 {
      margin: 0;
      font-size: 16px;
      color: #fff;
      font-weight: 500;
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.preview-body {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
  padding: 20px;
  min-height: 0;
}

.preview-canvas-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-canvas {
  background: #fff;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  position: relative;
}

.preview-component {
  overflow: hidden;
}

.preview-footer {
  height: 32px;
  background: #2d2d2d;
  border-top: 1px solid #3d3d3d;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  font-size: 12px;
  color: #999;
  flex-shrink: 0;
}
</style>
