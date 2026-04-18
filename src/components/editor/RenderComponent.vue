<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useComponentStore, useEditorStore, useHistoryStore } from '@/stores'
import type { EditorComponent } from '@/types'
import TextComponent from '../components/TextComponent.vue'
import ImageComponent from '../components/ImageComponent.vue'
import ButtonComponent from '../components/ButtonComponent.vue'
import InputComponent from '../components/InputComponent.vue'
import TextareaComponent from '../components/TextareaComponent.vue'
import SelectComponent from '../components/SelectComponent.vue'
import CheckboxComponent from '../components/CheckboxComponent.vue'
import RadioComponent from '../components/RadioComponent.vue'
import SwitchComponent from '../components/SwitchComponent.vue'
import DatePickerComponent from '../components/DatePickerComponent.vue'
import ChartComponent from '../components/ChartComponent.vue'
import ContainerComponent from '../components/ContainerComponent.vue'
import GridComponent from '../components/GridComponent.vue'
import TableComponent from '../components/TableComponent.vue'
import ContextMenu from './ContextMenu.vue'

const props = defineProps<{
  component: EditorComponent
  selected: boolean
  highlighted?: boolean
}>()

const componentStore = useComponentStore()
const editorStore = useEditorStore()
const historyStore = useHistoryStore()

const componentRef = ref<HTMLElement | null>(null)
const contextMenuRef = ref<InstanceType<typeof ContextMenu> | null>(null)
const isDragging = ref(false)
const isResizing = ref(false)
const isRotating = ref(false)
const resizeHandle = ref<string | null>(null)
const dragStart = ref({ x: 0, y: 0, componentX: 0, componentY: 0 })
const resizeStart = ref({ x: 0, y: 0, width: 0, height: 0, left: 0, top: 0 })
const rotateStart = ref({ angle: 0, startAngle: 0 })

const emit = defineEmits<{
  (e: 'update:alignmentLines', lines: { horizontal: number[]; vertical: number[] }): void
  (e: 'clear:alignmentLines'): void
}>()

const componentStyle = computed(() => {
  const isContainer = props.component.type === 'container' || props.component.type === 'grid'
  const autoExpand = isContainer && props.component.props.props?.autoExpand !== false
  const isInContainer = !!props.component.parentId

  return {
    position: isInContainer ? 'relative' as const : 'absolute' as const,
    left: isInContainer ? undefined : `${props.component.style.x}px`,
    top: isInContainer ? undefined : `${props.component.style.y}px`,
    width: `${props.component.style.width}px`,
    height: autoExpand ? 'auto' : `${props.component.style.height}px`,
    minHeight: autoExpand ? `${props.component.style.height}px` : undefined,
    transform: `rotate(${props.component.style.rotate}deg)`,
    opacity: props.component.style.opacity,
    borderWidth: `${props.component.style.borderWidth}px`,
    borderColor: props.component.style.borderColor,
    borderStyle: props.component.style.borderStyle as any,
    borderRadius: `${props.component.style.borderRadius}px`,
    backgroundColor: props.component.style.backgroundColor,
    boxShadow: props.component.style.boxShadow,
    zIndex: props.component.style.zIndex,
    cursor: isDragging.value ? 'move' : 'default',
    display: props.component.visible ? 'block' : 'none',
    pointerEvents: props.component.locked ? 'none' : 'auto'
  }
})

const resizeHandles = [
  { type: 'nw', cursor: 'nwse-resize' },
  { type: 'n', cursor: 'ns-resize' },
  { type: 'ne', cursor: 'nesw-resize' },
  { type: 'e', cursor: 'ew-resize' },
  { type: 'se', cursor: 'nwse-resize' },
  { type: 's', cursor: 'ns-resize' },
  { type: 'sw', cursor: 'nesw-resize' },
  { type: 'w', cursor: 'ew-resize' }
]

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

const currentComponent = computed(() => componentMap[props.component.type] || TextComponent)

function calculateAlignmentLines(x: number, y: number, width: number, height: number) {
  const threshold = 5
  const lines: { horizontal: number[]; vertical: number[] } = { horizontal: [], vertical: [] }

  const canvasWidth = editorStore.canvas.width
  const canvasHeight = editorStore.canvas.height

  if (Math.abs(x) < threshold) lines.vertical.push(0)
  if (Math.abs(x + width - canvasWidth) < threshold) lines.vertical.push(canvasWidth)
  if (Math.abs(x + width / 2 - canvasWidth / 2) < threshold) lines.vertical.push(canvasWidth / 2)

  if (Math.abs(y) < threshold) lines.horizontal.push(0)
  if (Math.abs(y + height - canvasHeight) < threshold) lines.horizontal.push(canvasHeight)
  if (Math.abs(y + height / 2 - canvasHeight / 2) < threshold) lines.horizontal.push(canvasHeight / 2)

  componentStore.components.forEach(comp => {
    if (comp.id === props.component.id) return

    if (Math.abs(x - comp.style.x) < threshold) lines.vertical.push(comp.style.x)
    if (Math.abs(x + width - comp.style.x) < threshold) lines.vertical.push(comp.style.x)
    if (Math.abs(x - comp.style.x - comp.style.width) < threshold) lines.vertical.push(comp.style.x + comp.style.width)
    if (Math.abs(x + width - comp.style.x - comp.style.width) < threshold) lines.vertical.push(comp.style.x + comp.style.width)
    if (Math.abs(x + width / 2 - comp.style.x - comp.style.width / 2) < threshold) {
      lines.vertical.push(comp.style.x + comp.style.width / 2)
    }

    if (Math.abs(y - comp.style.y) < threshold) lines.horizontal.push(comp.style.y)
    if (Math.abs(y + height - comp.style.y) < threshold) lines.horizontal.push(comp.style.y)
    if (Math.abs(y - comp.style.y - comp.style.height) < threshold) lines.horizontal.push(comp.style.y + comp.style.height)
    if (Math.abs(y + height - comp.style.y - comp.style.height) < threshold) lines.horizontal.push(comp.style.y + comp.style.height)
    if (Math.abs(y + height / 2 - comp.style.y - comp.style.height / 2) < threshold) {
      lines.horizontal.push(comp.style.y + comp.style.height / 2)
    }
  })

  return {
    horizontal: [...new Set(lines.horizontal)],
    vertical: [...new Set(lines.vertical)]
  }
}

function handleMouseDown(e: MouseEvent) {
  if (editorStore.previewMode || props.component.locked) return
  e.stopPropagation()

  if (e.button !== 0) return

  if (!props.selected) {
    componentStore.selectComponent(props.component.id, e.ctrlKey || e.metaKey)
  }

  isDragging.value = true
  dragStart.value = {
    x: e.clientX,
    y: e.clientY,
    componentX: props.component.style.x,
    componentY: props.component.style.y
  }
  editorStore.isDragging = true
}

function handleResizeStart(e: MouseEvent, handle: string) {
  e.stopPropagation()
  isResizing.value = true
  resizeHandle.value = handle
  resizeStart.value = {
    x: e.clientX,
    y: e.clientY,
    width: props.component.style.width,
    height: props.component.style.height,
    left: props.component.style.x,
    top: props.component.style.y
  }
  editorStore.isResizing = true
}

function handleRotateStart(e: MouseEvent) {
  e.stopPropagation()
  isRotating.value = true

  const rect = componentRef.value!.getBoundingClientRect()
  const centerX = rect.left + rect.width / 2
  const centerY = rect.top + rect.height / 2

  rotateStart.value = {
    angle: props.component.style.rotate,
    startAngle: Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI)
  }
}

function handleMouseMove(e: MouseEvent) {
  if (isDragging.value) {
    const deltaX = (e.clientX - dragStart.value.x) / editorStore.canvas.scale
    const deltaY = (e.clientY - dragStart.value.y) / editorStore.canvas.scale

    let newX = dragStart.value.componentX + deltaX
    let newY = dragStart.value.componentY + deltaY

    if (editorStore.canvas.snapToGrid) {
      newX = editorStore.snapToGridValue(newX)
      newY = editorStore.snapToGridValue(newY)
    }

    componentStore.updateComponentStyle(props.component.id, { x: newX, y: newY })

    const lines = calculateAlignmentLines(newX, newY, props.component.style.width, props.component.style.height)
    emit('update:alignmentLines', lines)
  }

  if (isResizing.value) {
    const deltaX = (e.clientX - resizeStart.value.x) / editorStore.canvas.scale
    const deltaY = (e.clientY - resizeStart.value.y) / editorStore.canvas.scale

    let newWidth = resizeStart.value.width
    let newHeight = resizeStart.value.height
    let newX = resizeStart.value.left
    let newY = resizeStart.value.top

    if (resizeHandle.value!.includes('e')) {
      newWidth = Math.max(20, resizeStart.value.width + deltaX)
    }
    if (resizeHandle.value!.includes('w')) {
      newWidth = Math.max(20, resizeStart.value.width - deltaX)
      newX = resizeStart.value.left + deltaX
    }
    if (resizeHandle.value!.includes('s')) {
      newHeight = Math.max(20, resizeStart.value.height + deltaY)
    }
    if (resizeHandle.value!.includes('n')) {
      newHeight = Math.max(20, resizeStart.value.height - deltaY)
      newY = resizeStart.value.top + deltaY
    }

    if (editorStore.canvas.snapToGrid) {
      newWidth = editorStore.snapToGridValue(newWidth)
      newHeight = editorStore.snapToGridValue(newHeight)
      newX = editorStore.snapToGridValue(newX)
      newY = editorStore.snapToGridValue(newY)
    }

    componentStore.updateComponentStyle(props.component.id, {
      width: newWidth,
      height: newHeight,
      x: newX,
      y: newY
    })

    const lines = calculateAlignmentLines(newX, newY, newWidth, newHeight)
    emit('update:alignmentLines', lines)
  }

  if (isRotating.value && componentRef.value) {
    const rect = componentRef.value.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI)
    const deltaAngle = currentAngle - rotateStart.value.startAngle

    let newRotation = Math.round(rotateStart.value.angle + deltaAngle)

    if (e.shiftKey) {
      newRotation = Math.round(newRotation / 15) * 15
    }

    componentStore.setComponentRotation(props.component.id, newRotation)
  }
}

function handleMouseUp() {
  if (isDragging.value || isResizing.value || isRotating.value) {
    historyStore.saveSnapshot()
  }
  isDragging.value = false
  isResizing.value = false
  isRotating.value = false
  resizeHandle.value = null
  editorStore.isDragging = false
  editorStore.isResizing = false
  emit('clear:alignmentLines')
}

function handleContextMenu(e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()

  if (!props.selected) {
    componentStore.selectComponent(props.component.id)
  }

  contextMenuRef.value?.show(e.clientX, e.clientY)
}

function handleTextUpdate(value: string) {
  componentStore.updateComponentProps(props.component.id, { text: value })
  historyStore.saveSnapshot()
}

function handleImageUpdate(value: { src: string; alt?: string }) {
  const imageStyle = { ...props.component.props.imageStyle, ...value }
  componentStore.updateComponentProps(props.component.id, { imageStyle })
  historyStore.saveSnapshot()
}

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', handleMouseUp)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', handleMouseUp)
})
</script>

<template>
  <div
    ref="componentRef"
    class="render-component"
    :class="{ selected, dragging: isDragging, resizing: isResizing, rotating: isRotating, 'is-group': component.children && component.children.length > 0 }"
    :style="componentStyle"
    @mousedown="handleMouseDown"
    @contextmenu="handleContextMenu"
  >
    <component
      :is="currentComponent"
      :component="component"
      :highlighted="highlighted"
      @update="handleTextUpdate"
      @update:image="handleImageUpdate"
    />

    <template v-if="selected && !editorStore.previewMode">
      <div
        v-for="handle in resizeHandles"
        :key="handle.type"
        :class="['resize-handle', handle.type]"
        :style="{ cursor: handle.cursor }"
        @mousedown.stop="handleResizeStart($event, handle.type)"
      />

      <div class="rotate-line" />
      <div
        class="rotate-handle"
        @mousedown.stop="handleRotateStart"
      >
        <el-icon><Refresh /></el-icon>
      </div>

      <div class="component-label">
        <el-icon v-if="component.children && component.children.length > 0"><Connection /></el-icon>
        {{ component.name }}
      </div>
      <div class="size-indicator" v-if="isResizing">
        {{ Math.round(component.style.width) }} × {{ Math.round(component.style.height) }}
      </div>
      <div class="rotate-indicator" v-if="isRotating">
        {{ Math.round(component.style.rotate) }}°
      </div>
    </template>

    <ContextMenu ref="contextMenuRef" :component-id="component.id" />
  </div>
</template>

<style scoped lang="scss">
.render-component {
  user-select: none;
  transition: box-shadow 0.2s;

  &.selected {
    outline: 2px solid #409eff;
    outline-offset: -2px;
  }

  &.dragging {
    opacity: 0.8;
    outline-style: dashed;
  }

  &.resizing {
    outline-style: dashed;
  }

  &.rotating {
    outline-style: dashed;
    outline-color: #67c23a;
  }

  &.is-group {
    outline-style: dashed;
    outline-color: #e6a23c;

    &.selected {
      outline-color: #e6a23c;
    }
  }
}

.resize-handle {
  position: absolute;
  width: 10px;
  height: 10px;
  background: #fff;
  border: 2px solid #409eff;
  border-radius: 2px;
  z-index: 10;
  transition: transform 0.1s;

  &:hover {
    transform: scale(1.2);
    background: #409eff;
  }

  &.nw { top: -5px; left: -5px; }
  &.n { top: -5px; left: 50%; transform: translateX(-50%); &:hover { transform: translateX(-50%) scale(1.2); } }
  &.ne { top: -5px; right: -5px; }
  &.e { top: 50%; right: -5px; transform: translateY(-50%); &:hover { transform: translateY(-50%) scale(1.2); } }
  &.se { bottom: -5px; right: -5px; }
  &.s { bottom: -5px; left: 50%; transform: translateX(-50%); &:hover { transform: translateX(-50%) scale(1.2); } }
  &.sw { bottom: -5px; left: -5px; }
  &.w { top: 50%; left: -5px; transform: translateY(-50%); &:hover { transform: translateY(-50%) scale(1.2); } }
}

.rotate-line {
  position: absolute;
  top: -30px;
  left: 50%;
  width: 1px;
  height: 20px;
  background: #67c23a;
  transform: translateX(-50%);
}

.rotate-handle {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 20px;
  background: #67c23a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  color: #fff;
  font-size: 12px;
  transition: transform 0.1s, background 0.2s;

  &:hover {
    transform: translateX(-50%) scale(1.2);
    background: #85ce61;
  }

  &:active {
    cursor: grabbing;
  }
}

.component-label {
  position: absolute;
  top: -24px;
  left: 0;
  padding: 2px 8px;
  background: #409eff;
  color: #fff;
  font-size: 11px;
  border-radius: 2px;
  white-space: nowrap;
  font-weight: 500;
}

.size-indicator {
  position: absolute;
  bottom: -28px;
  left: 50%;
  transform: translateX(-50%);
  padding: 2px 8px;
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  font-size: 11px;
  border-radius: 2px;
  white-space: nowrap;
}

.rotate-indicator {
  position: absolute;
  top: -60px;
  left: 50%;
  transform: translateX(-50%);
  padding: 2px 8px;
  background: #67c23a;
  color: #fff;
  font-size: 11px;
  border-radius: 2px;
  white-space: nowrap;
}
</style>
