<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useComponentStore, useEditorStore, useHistoryStore } from '@/stores'
import type { EditorComponent, ComponentType } from '@/types'
import RenderComponent from './RenderComponent.vue'

const componentStore = useComponentStore()
const editorStore = useEditorStore()
const historyStore = useHistoryStore()

const canvasContainer = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLElement | null>(null)

const isPanning = ref(false)
const panStart = ref({ x: 0, y: 0 })
const isSpacePressed = ref(false)
const selectionBox = ref<{ startX: number; startY: number; endX: number; endY: number } | null>(null)

const dragPreview = ref<{
  type: ComponentType
  x: number
  y: number
  width: number
  height: number
} | null>(null)

const highlightedContainerId = ref<string | null>(null)

const alignmentLines = ref<{
  horizontal: number[]
  vertical: number[]
}>({ horizontal: [], vertical: [] })

const canvasStyle = computed(() => ({
  width: `${editorStore.canvas.width}px`,
  height: `${editorStore.canvas.height}px`,
  transform: `translate(${editorStore.canvas.offsetX}px, ${editorStore.canvas.offsetY}px) scale(${editorStore.canvas.scale})`,
  transformOrigin: '0 0'
}))

const gridStyle = computed(() => {
  if (!editorStore.canvas.showGrid) return {}
  const size = editorStore.canvas.gridSize
  return {
    backgroundImage: `
      linear-gradient(to right, #e8e8e8 1px, transparent 1px),
      linear-gradient(to bottom, #e8e8e8 1px, transparent 1px)
    `,
    backgroundSize: `${size}px ${size}px`
  }
})

const defaultSizes: Record<ComponentType, { width: number; height: number }> = {
  text: { width: 200, height: 40 },
  image: { width: 200, height: 150 },
  button: { width: 100, height: 40 },
  input: { width: 200, height: 40 },
  textarea: { width: 200, height: 80 },
  select: { width: 200, height: 40 },
  checkbox: { width: 120, height: 32 },
  radio: { width: 120, height: 32 },
  container: { width: 300, height: 200 },
  chart: { width: 400, height: 300 },
  table: { width: 400, height: 200 }
}

function handleDragOver(e: DragEvent) {
  e.preventDefault()
  e.dataTransfer!.dropEffect = 'copy'

  const componentType = e.dataTransfer?.getData('componentType') as ComponentType
  if (!componentType || !canvasContainer.value) return

  const rect = canvasContainer.value.getBoundingClientRect()
  const x = (e.clientX - rect.left - editorStore.canvas.offsetX) / editorStore.canvas.scale
  const y = (e.clientY - rect.top - editorStore.canvas.offsetY) / editorStore.canvas.scale

  const container = componentStore.findContainerAtPosition(x, y)
  highlightedContainerId.value = container?.id || null

  const size = defaultSizes[componentType] || { width: 100, height: 40 }

  let previewX = x - size.width / 2
  let previewY = y - size.height / 2

  if (editorStore.canvas.snapToGrid) {
    previewX = editorStore.snapToGridValue(previewX)
    previewY = editorStore.snapToGridValue(previewY)
  }

  dragPreview.value = {
    type: componentType,
    x: previewX,
    y: previewY,
    width: size.width,
    height: size.height
  }

  updateAlignmentLines(previewX, previewY, size.width, size.height)
}

function handleDragLeave() {
  dragPreview.value = null
  highlightedContainerId.value = null
  alignmentLines.value = { horizontal: [], vertical: [] }
}

function handleDrop(e: DragEvent) {
  e.preventDefault()
  const componentType = e.dataTransfer?.getData('componentType') as ComponentType
  if (!componentType || !canvasContainer.value) return

  const rect = canvasContainer.value.getBoundingClientRect()
  const x = (e.clientX - rect.left - editorStore.canvas.offsetX) / editorStore.canvas.scale
  const y = (e.clientY - rect.top - editorStore.canvas.offsetY) / editorStore.canvas.scale

  const size = defaultSizes[componentType] || { width: 100, height: 40 }

  let dropX = x - size.width / 2
  let dropY = y - size.height / 2

  if (editorStore.canvas.snapToGrid) {
    dropX = editorStore.snapToGridValue(dropX)
    dropY = editorStore.snapToGridValue(dropY)
  }

  const component = componentStore.createComponent(componentType, {}, {}, dropX, dropY)
  component.style.width = size.width
  component.style.height = size.height

  if (componentType === 'container' || componentType === 'grid') {
    component.style.backgroundColor = '#f5f7fa'
    component.style.borderWidth = 1
  }

  const container = componentStore.findContainerAtPosition(x, y)
  if (container && componentType !== 'container' && componentType !== 'grid') {
    componentStore.addChildToContainer(container.id, component)
  } else {
    componentStore.addComponent(component)
  }

  componentStore.selectComponent(component.id)
  historyStore.saveSnapshot()

  dragPreview.value = null
  highlightedContainerId.value = null
  alignmentLines.value = { horizontal: [], vertical: [] }
}

function updateAlignmentLines(x: number, y: number, width: number, height: number) {
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

  alignmentLines.value = {
    horizontal: [...new Set(lines.horizontal)],
    vertical: [...new Set(lines.vertical)]
  }
}

function handleCanvasClick(e: MouseEvent) {
  if (e.target === canvasRef.value) {
    componentStore.clearSelection()
  }
}

function handleMouseDown(e: MouseEvent) {
  if (e.button === 1 || (e.button === 0 && e.altKey) || (e.button === 0 && isSpacePressed.value)) {
    isPanning.value = true
    panStart.value = { x: e.clientX - editorStore.canvas.offsetX, y: e.clientY - editorStore.canvas.offsetY }
    e.preventDefault()
  } else if (e.button === 0) {
    const target = e.target as HTMLElement
    const isComponentClick = target.closest('.render-component') !== null

    if (!isComponentClick) {
      const rect = canvasContainer.value!.getBoundingClientRect()
      const x = (e.clientX - rect.left - editorStore.canvas.offsetX) / editorStore.canvas.scale
      const y = (e.clientY - rect.top - editorStore.canvas.offsetY) / editorStore.canvas.scale
      selectionBox.value = { startX: x, startY: y, endX: x, endY: y }
      componentStore.clearSelection()
    }
  }
}

function handleMouseMove(e: MouseEvent) {
  if (isPanning.value) {
    editorStore.setOffset(
      e.clientX - panStart.value.x,
      e.clientY - panStart.value.y
    )
  } else if (selectionBox.value) {
    const rect = canvasContainer.value!.getBoundingClientRect()
    const x = (e.clientX - rect.left - editorStore.canvas.offsetX) / editorStore.canvas.scale
    const y = (e.clientY - rect.top - editorStore.canvas.offsetY) / editorStore.canvas.scale
    selectionBox.value.endX = x
    selectionBox.value.endY = y
  }
}

function handleMouseUp() {
  if (isPanning.value) {
    isPanning.value = false
  }
  if (selectionBox.value) {
    const box = selectionBox.value
    const minX = Math.min(box.startX, box.endX)
    const maxX = Math.max(box.startX, box.endX)
    const minY = Math.min(box.startY, box.endY)
    const maxY = Math.max(box.startY, box.endY)

    const boxWidth = maxX - minX
    const boxHeight = maxY - minY

    if (boxWidth > 2 && boxHeight > 2) {
      const selectedIds: string[] = []
      componentStore.components.forEach(comp => {
        if (comp.locked || comp.visible === false) return

        const compLeft = comp.style.x
        const compRight = comp.style.x + comp.style.width
        const compTop = comp.style.y
        const compBottom = comp.style.y + comp.style.height

        const centerX = (compLeft + compRight) / 2
        const centerY = (compTop + compBottom) / 2

        const centerInBox = centerX >= minX && centerX <= maxX && centerY >= minY && centerY <= maxY

        const boxInComp = minX >= compLeft && maxX <= compRight && minY >= compTop && maxY <= compBottom

        const intersects = !(
          compRight < minX ||
          compLeft > maxX ||
          compBottom < minY ||
          compTop > maxY
        )

        if (centerInBox || boxInComp || intersects) {
          selectedIds.push(comp.id)
        }
      })

      if (selectedIds.length > 0) {
        selectedIds.forEach(id => {
          componentStore.selectComponent(id, true)
        })
      }
    }
    selectionBox.value = null
  }
}

function handleWheel(e: WheelEvent) {
  if (e.ctrlKey || e.metaKey) {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    editorStore.setScale(editorStore.canvas.scale + delta)
  }
}

const selectionBoxStyle = computed(() => {
  if (!selectionBox.value) return null
  const box = selectionBox.value
  const minX = Math.min(box.startX, box.endX)
  const maxX = Math.max(box.startX, box.endX)
  const minY = Math.min(box.startY, box.endY)
  const maxY = Math.max(box.startY, box.endY)
  return {
    left: `${minX}px`,
    top: `${minY}px`,
    width: `${maxX - minX}px`,
    height: `${maxY - minY}px`
  }
})

function setAlignmentLines(lines: { horizontal: number[]; vertical: number[] }) {
  alignmentLines.value = lines
}

function clearAlignmentLines() {
  alignmentLines.value = { horizontal: [], vertical: [] }
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.code === 'Space' && !isSpacePressed.value) {
    isSpacePressed.value = true
  }
}

function handleKeyUp(e: KeyboardEvent) {
  if (e.code === 'Space') {
    isSpacePressed.value = false
    if (isPanning.value) {
      isPanning.value = false
    }
  }
}

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('mouseup', handleMouseUp)
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('mouseup', handleMouseUp)
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('keyup', handleKeyUp)
})

defineExpose({
  setAlignmentLines,
  clearAlignmentLines
})
</script>

<template>
  <div class="canvas-wrapper">
    <div
      ref="canvasContainer"
      class="canvas-container"
      :class="{ 'is-panning': isPanning, 'space-pressed': isSpacePressed }"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
      @mousedown="handleMouseDown"
      @wheel="handleWheel"
    >
      <div
        ref="canvasRef"
        class="canvas"
        :style="{ ...canvasStyle, ...gridStyle }"
        @click="handleCanvasClick"
      >
        <RenderComponent
          v-for="component in componentStore.getRootComponents()"
          :key="component.id"
          :component="component"
          :selected="componentStore.selectedComponentIds.includes(component.id)"
          :highlighted="highlightedContainerId === component.id"
          @update:alignmentLines="setAlignmentLines"
          @clear:alignmentLines="clearAlignmentLines"
        />

        <div
          v-if="dragPreview"
          class="drag-preview"
          :style="{
            left: `${dragPreview.x}px`,
            top: `${dragPreview.y}px`,
            width: `${dragPreview.width}px`,
            height: `${dragPreview.height}px`
          }"
        />

        <template v-if="editorStore.canvas.showGuides">
          <div
            v-for="(line, index) in alignmentLines.horizontal"
            :key="`h-${index}`"
            class="alignment-line horizontal"
            :style="{ top: `${line}px` }"
          />
          <div
            v-for="(line, index) in alignmentLines.vertical"
            :key="`v-${index}`"
            class="alignment-line vertical"
            :style="{ left: `${line}px` }"
          />
        </template>

        <div
          v-if="selectionBoxStyle"
          class="selection-box"
          :style="selectionBoxStyle"
        />
      </div>
    </div>

    <div class="canvas-info">
      <span>{{ editorStore.canvas.width }} × {{ editorStore.canvas.height }}</span>
      <span>{{ Math.round(editorStore.canvas.scale * 100) }}%</span>
      <span class="pan-hint" title="按住空格键拖动画布">空格+拖动</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.canvas-wrapper {
  flex: 1;
  height: 100%;
  position: relative;
  overflow: hidden;
  background: #f0f2f5;
}

.canvas-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;

  &.space-pressed {
    cursor: grab;
  }

  &.is-panning {
    cursor: grabbing;
    user-select: none;
  }
}

.canvas {
  position: absolute;
  top: 0;
  left: 0;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  cursor: default;
}

.drag-preview {
  position: absolute;
  border: 2px dashed #409eff;
  background: rgba(64, 158, 255, 0.1);
  pointer-events: none;
  border-radius: 4px;
}

.alignment-line {
  position: absolute;
  background: #f56c6c;
  pointer-events: none;
  z-index: 9999;

  &.horizontal {
    left: 0;
    right: 0;
    height: 1px;
  }

  &.vertical {
    top: 0;
    bottom: 0;
    width: 1px;
  }
}

.selection-box {
  position: absolute;
  border: 1px dashed #409eff;
  background: rgba(64, 158, 255, 0.1);
  pointer-events: none;
}

.canvas-info {
  position: absolute;
  bottom: 12px;
  right: 12px;
  display: flex;
  gap: 16px;
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 4px;
  color: #fff;
  font-size: 12px;

  .pan-hint {
    opacity: 0.7;
    cursor: help;
  }
}
</style>
