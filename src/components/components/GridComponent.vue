<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useComponentStore, useEditorStore, useHistoryStore } from '@/stores'
import type { EditorComponent } from '@/types'
import TextComponent from './TextComponent.vue'
import ImageComponent from './ImageComponent.vue'
import ButtonComponent from './ButtonComponent.vue'
import InputComponent from './InputComponent.vue'
import TextareaComponent from './TextareaComponent.vue'
import SelectComponent from './SelectComponent.vue'
import CheckboxComponent from './CheckboxComponent.vue'
import RadioComponent from './RadioComponent.vue'
import SwitchComponent from './SwitchComponent.vue'
import DatePickerComponent from './DatePickerComponent.vue'
import ChartComponent from './ChartComponent.vue'
import TableComponent from './TableComponent.vue'

const props = defineProps<{
  component: EditorComponent
  highlighted?: boolean
}>()

const componentStore = useComponentStore()
const editorStore = useEditorStore()
const historyStore = useHistoryStore()

const gridRef = ref<HTMLElement | null>(null)
const isDraggingChild = ref(false)
const draggedChildId = ref<string | null>(null)
const dragOverIndex = ref<number | null>(null)

const columns = computed(() => props.component.props.props?.columns || 2)
const rowGap = computed(() => props.component.props.props?.rowGap || 16)
const colGap = computed(() => props.component.props.props?.colGap || 16)
const padding = computed(() => props.component.props.props?.padding || 16)
const autoExpand = computed(() => props.component.props.props?.autoExpand ?? true)
const showBorder = computed(() => props.component.props.props?.showBorder ?? true)

const gridStyle = computed(() => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${columns.value}, 1fr)`,
  gridRowGap: `${rowGap.value}px`,
  gridColumnGap: `${colGap.value}px`,
  padding: `${padding.value}px`,
  height: '100%'
}))

const hasChildren = computed(() => {
  return props.component.children && props.component.children.length > 0
})

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
  table: TableComponent
}

function handleChildClick(e: MouseEvent, childId: string) {
  e.stopPropagation()
  componentStore.selectComponent(childId, e.ctrlKey || e.metaKey)
}

function handleChildDragStart(e: DragEvent, childId: string, index: number) {
  e.stopPropagation()
  isDraggingChild.value = true
  draggedChildId.value = childId
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('childId', childId)
    e.dataTransfer.setData('parentId', props.component.id)
    e.dataTransfer.setData('childIndex', String(index))
  }
}

function handleChildDragOver(e: DragEvent, index: number) {
  e.preventDefault()
  e.stopPropagation()
  if (draggedChildId.value) {
    dragOverIndex.value = index
  }
}

function handleChildDrop(e: DragEvent, targetIndex: number) {
  e.preventDefault()
  e.stopPropagation()

  const draggedId = e.dataTransfer?.getData('childId')

  if (draggedId && props.component.children) {
    const currentIndex = props.component.children.findIndex(c => c.id === draggedId)
    if (currentIndex !== -1 && currentIndex !== targetIndex) {
      const children = [...props.component.children]
      const [removed] = children.splice(currentIndex, 1)
      children.splice(targetIndex, 0, removed)

      componentStore.updateComponent(props.component.id, { children })
      historyStore.saveSnapshot()
    }
  }

  isDraggingChild.value = false
  draggedChildId.value = null
  dragOverIndex.value = null
}

function handleDragEnd() {
  isDraggingChild.value = false
  draggedChildId.value = null
  dragOverIndex.value = null
}

function handleContainerClick(e: MouseEvent) {
  if (e.target === gridRef.value) {
    componentStore.selectComponent(props.component.id)
  }
}

function handleChildImageUpdate(childId: string, value: { src: string; alt?: string }) {
  const child = props.component.children?.find(c => c.id === childId)
  if (child) {
    child.props = {
      ...child.props,
      imageStyle: {
        ...child.props.imageStyle,
        src: value.src,
        alt: value.alt || child.props.imageStyle?.alt
      }
    }
    historyStore.saveSnapshot()
  }
}

function handleChildTextUpdate(childId: string, value: string) {
  const child = props.component.children?.find(c => c.id === childId)
  if (child) {
    child.props = {
      ...child.props,
      text: value
    }
    historyStore.saveSnapshot()
  }
}

const isDragOver = ref(false)

function handleContainerDragOver(e: DragEvent) {
  const componentType = editorStore.draggingComponentType
  if (componentType && componentType !== 'container' && componentType !== 'grid') {
    e.preventDefault()
    e.stopPropagation()
    isDragOver.value = true
  }
}

function handleContainerDragLeave(e: DragEvent) {
  e.stopPropagation()
  isDragOver.value = false
}

function handleContainerDrop(e: DragEvent) {
  e.preventDefault()
  e.stopPropagation()
  isDragOver.value = false

  const componentType = e.dataTransfer?.getData('componentType') as any
  if (!componentType || componentType === 'container' || componentType === 'grid') return

  const size = { width: 100, height: 40 }
  const newChild = componentStore.createComponent(componentType, {}, {}, 0, 0)
  newChild.style.width = size.width
  newChild.style.height = size.height

  const children = [...(props.component.children || []), newChild]
  componentStore.updateComponent(props.component.id, { children })
  historyStore.saveSnapshot()

  componentStore.selectComponent(newChild.id)
}

onMounted(() => {
  window.addEventListener('dragend', handleDragEnd)
})

onUnmounted(() => {
  window.removeEventListener('dragend', handleDragEnd)
})
</script>

<template>
  <div
    ref="gridRef"
    class="grid-component"
    :class="{
      'show-border': showBorder,
      'has-children': hasChildren,
      'is-highlighted': highlighted,
      'is-drag-over': isDragOver
    }"
    :style="gridStyle"
    @click="handleContainerClick"
    @dragover="handleContainerDragOver"
    @dragleave="handleContainerDragLeave"
    @drop="handleContainerDrop"
  >
    <template v-if="hasChildren">
      <div
        v-for="(child, index) in component.children"
        :key="child.id"
        class="grid-child"
        :class="{
          'is-selected': componentStore.selectedComponentIds.includes(child.id),
          'is-dragging': draggedChildId === child.id,
          'drag-over': dragOverIndex === index && draggedChildId !== child.id
        }"
        draggable="true"
        @click="handleChildClick($event, child.id)"
        @dragstart="handleChildDragStart($event, child.id, index)"
        @dragover="handleChildDragOver($event, index)"
        @drop="handleChildDrop($event, index)"
      >
        <component
          :is="componentMap[child.type] || TextComponent"
          :component="child"
          @update:image="(v: any) => handleChildImageUpdate(child.id, v)"
          @update:text="(v: string) => handleChildTextUpdate(child.id, v)"
        />
      </div>
    </template>
    <div v-else class="grid-hint">
      <el-icon><Grid /></el-icon>
      <span>栅格布局</span>
      <span class="hint-sub">{{ columns }}列网格，拖入组件自动排列</span>
    </div>
  </div>
</template>

<style scoped>
.grid-component {
  width: 100%;
  min-height: 80px;
  position: relative;
  box-sizing: border-box;
  transition: all 0.2s;
}

.grid-component.show-border {
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
}

.grid-component.show-border:hover {
  border-color: #409eff;
  background: rgba(64, 158, 255, 0.02);
}

.grid-component.has-children {
  border-style: solid;
  border-color: #e4e7ed;
}

.grid-component.is-highlighted {
  border-color: #67c23a !important;
  border-width: 2px;
  background: rgba(103, 194, 58, 0.05);
}

.grid-component.is-drag-over {
  border-color: #409eff !important;
  border-width: 2px;
  border-style: dashed !important;
  background: rgba(64, 158, 255, 0.1) !important;
}

.grid-child {
  min-height: 40px;
  cursor: move;
  position: relative;
  border: 2px solid transparent;
  border-radius: 4px;
  transition: all 0.2s;
}

.grid-child:hover {
  border-color: #c0c4cc;
}

.grid-child.is-selected {
  border-color: #409eff;
  background: rgba(64, 158, 255, 0.05);
}

.grid-child.is-dragging {
  opacity: 0.5;
}

.grid-child.drag-over {
  border-color: #67c23a;
}

.grid-hint {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #c0c4cc;
  font-size: 12px;
  pointer-events: none;
}

.grid-hint .el-icon {
  font-size: 24px;
}

.hint-sub {
  font-size: 11px;
  color: #dcdfe6;
}
</style>
