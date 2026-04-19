<script setup lang="ts">
import { computed, ref, defineAsyncComponent } from 'vue'
import { useComponentStore, useEditorStore, useHistoryStore } from '@/stores'
import type { EditorComponent } from '@/types'

const RenderComponent = defineAsyncComponent(() => import('@/components/editor/RenderComponent.vue'))

const props = defineProps<{
  component: EditorComponent
  highlighted?: boolean
}>()

const componentStore = useComponentStore()
const editorStore = useEditorStore()
const historyStore = useHistoryStore()

const containerRef = ref<HTMLElement | null>(null)
const isDragOver = ref(false)

const direction = computed(() => props.component.props.props?.direction || 'column')
const justify = computed(() => props.component.props.props?.justify || 'flex-start')
const align = computed(() => props.component.props.props?.align || 'flex-start')
const gap = computed(() => props.component.props.props?.gap || 8)
const padding = computed(() => props.component.props.props?.padding || 16)
const autoExpand = computed(() => props.component.props.props?.autoExpand ?? true)
const showBorder = computed(() => props.component.props.props?.showBorder ?? true)

const containerStyle = computed(() => ({
  display: 'flex',
  flexDirection: direction.value as any,
  justifyContent: justify.value,
  alignItems: align.value,
  gap: `${gap.value}px`,
  padding: `${padding.value}px`,
  minHeight: '100%',
  boxSizing: 'border-box'
}))

const hasChildren = computed(() => {
  return props.component.children && props.component.children.length > 0
})

function isChildContainer(element: HTMLElement): boolean {
  let current = element.parentElement
  while (current && current !== containerRef.value) {
    if (current.classList.contains('container-component') || current.classList.contains('grid-component')) {
      return true
    }
    current = current.parentElement
  }
  return false
}

function handleContainerClick(e: MouseEvent) {
  if (e.target === containerRef.value) {
    componentStore.selectComponent(props.component.id)
  }
}

function handleContainerDragOver(e: DragEvent) {
  const hasComponentType = e.dataTransfer?.types?.includes('componentType') || editorStore.draggingComponentType
  if (hasComponentType) {
    e.preventDefault()
    isDragOver.value = true
  }
}

function handleContainerDragLeave(e: DragEvent) {
  if (e.target === containerRef.value) {
    isDragOver.value = false
  }
}

function handleContainerDrop(e: DragEvent) {
  e.preventDefault()
  isDragOver.value = false

  const componentType = e.dataTransfer?.getData('componentType') as any
  if (!componentType) return

  const dropTarget = e.target as HTMLElement
  const isDirectDrop = dropTarget === containerRef.value ||
    dropTarget.classList.contains('container-hint') ||
    containerRef.value?.contains(dropTarget) && !isChildContainer(dropTarget)

  if (!isDirectDrop) return

  e.stopPropagation()

  const sizeMap: Record<string, { width: number; height: number }> = {
    text: { width: 200, height: 40 },
    image: { width: 200, height: 150 },
    button: { width: 100, height: 40 },
    input: { width: 200, height: 40 },
    textarea: { width: 200, height: 80 },
    select: { width: 200, height: 40 },
    checkbox: { width: 120, height: 32 },
    radio: { width: 120, height: 32 },
    container: { width: 300, height: 200 },
    grid: { width: 300, height: 200 },
    chart: { width: 400, height: 300 },
    table: { width: 400, height: 200 }
  }

  const size = sizeMap[componentType] || { width: 100, height: 40 }
  const newChild = componentStore.createComponent(componentType, {}, {}, 0, 0)
  newChild.style.width = size.width
  newChild.style.height = size.height
  newChild.parentId = props.component.id

  if (componentType === 'container' || componentType === 'grid') {
    newChild.style.backgroundColor = '#f5f7fa'
    newChild.style.borderWidth = 1
  }

  const children = [...(props.component.children || []), newChild]
  componentStore.updateComponent(props.component.id, { children })
  historyStore.saveSnapshot()

  componentStore.selectComponent(newChild.id)
}
</script>

<template>
  <div
    ref="containerRef"
    class="container-component"
    :class="{
      'show-border': showBorder,
      'has-children': hasChildren,
      'is-highlighted': highlighted,
      'is-drag-over': isDragOver
    }"
    :style="containerStyle"
    @click="handleContainerClick"
    @dragover="handleContainerDragOver"
    @dragleave="handleContainerDragLeave"
    @drop="handleContainerDrop"
  >
    <template v-if="hasChildren">
      <RenderComponent
        v-for="child in component.children"
        :key="child.id"
        :component="child"
        :selected="componentStore.selectedComponentIds.includes(child.id)"
        :highlighted="highlighted"
        @update:alignmentLines="$emit('update:alignmentLines', $event)"
        @clear:alignmentLines="$emit('clear:alignmentLines')"
      />
    </template>
    <div v-else class="container-hint">
      <el-icon><Grid /></el-icon>
      <span>弹性容器</span>
      <span class="hint-sub">{{ direction === 'row' ? '横向' : '纵向' }}排列，拖入组件进行组合</span>
    </div>
  </div>
</template>

<style scoped>
.container-component {
  width: 100%;
  min-height: 80px;
  position: relative;
  box-sizing: border-box;
  transition: all 0.2s;
}

.container-component.show-border {
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
}

.container-component.show-border:hover {
  border-color: #409eff;
  background: rgba(64, 158, 255, 0.02);
}

.container-component.has-children {
  border-style: solid;
  border-color: #e4e7ed;
}

.container-component.is-highlighted {
  border-color: #67c23a !important;
  border-width: 2px;
  background: rgba(103, 194, 58, 0.05);
}

.container-component.is-drag-over {
  border-color: #409eff !important;
  border-width: 2px;
  border-style: dashed !important;
  background: rgba(64, 158, 255, 0.1) !important;
}

.container-hint {
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

.container-hint .el-icon {
  font-size: 24px;
}

.hint-sub {
  font-size: 11px;
  color: #dcdfe6;
}
</style>
