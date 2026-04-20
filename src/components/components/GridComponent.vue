<script setup lang="ts">
import { computed, ref, defineAsyncComponent } from 'vue'
import { useComponentStore, useEditorStore, useHistoryStore } from '@/stores'
import type { EditorComponent } from '@/types'

const RenderComponent = defineAsyncComponent(() => import('@/components/editor/RenderComponent.vue'))
const AsyncContainerComponent = defineAsyncComponent(() => import('../components/ContainerComponent.vue'))
const AsyncGridComponent = defineAsyncComponent(() => import('../components/GridComponent.vue'))
const TextComponent = defineAsyncComponent(() => import('../components/TextComponent.vue'))
const ImageComponent = defineAsyncComponent(() => import('../components/ImageComponent.vue'))
const ButtonComponent = defineAsyncComponent(() => import('../components/ButtonComponent.vue'))
const InputComponent = defineAsyncComponent(() => import('../components/InputComponent.vue'))
const TextareaComponent = defineAsyncComponent(() => import('../components/TextareaComponent.vue'))
const SelectComponent = defineAsyncComponent(() => import('../components/SelectComponent.vue'))
const CheckboxComponent = defineAsyncComponent(() => import('../components/CheckboxComponent.vue'))
const RadioComponent = defineAsyncComponent(() => import('../components/RadioComponent.vue'))
const SwitchComponent = defineAsyncComponent(() => import('../components/SwitchComponent.vue'))
const DatePickerComponent = defineAsyncComponent(() => import('../components/DatePickerComponent.vue'))
const ChartComponent = defineAsyncComponent(() => import('../components/ChartComponent.vue'))
const TableComponent = defineAsyncComponent(() => import('../components/TableComponent.vue'))
const LinkComponent = defineAsyncComponent(() => import('../components/LinkComponent.vue'))

const props = defineProps<{
  component: EditorComponent
  highlighted?: boolean
  mode?: 'edit' | 'preview'
}>()

const componentStore = useComponentStore()
const editorStore = useEditorStore()
const historyStore = useHistoryStore()

const gridRef = ref<HTMLElement | null>(null)
const isDragOver = ref(false)

const isPreview = computed(() => props.mode === 'preview')

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
  minHeight: '100%',
  boxSizing: 'border-box'
}))

const hasChildren = computed(() => {
  return props.component.children && props.component.children.length > 0
})

const childComponentMap: Record<string, any> = {
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
  container: AsyncContainerComponent,
  grid: AsyncGridComponent,
  table: TableComponent,
  link: LinkComponent
}

function getChildStyle(child: EditorComponent) {
  const isChildContainer = child.type === 'container' || child.type === 'grid'
  const childAutoExpand = isChildContainer && child.props?.props?.autoExpand !== false

  return {
    position: 'relative' as const,
    width: `${child.style.width}px`,
    height: childAutoExpand ? 'auto' : `${child.style.height}px`,
    minHeight: childAutoExpand ? `${child.style.height}px` : undefined,
    transform: `rotate(${child.style.rotate || 0}deg)`,
    opacity: child.style.opacity ?? 1,
    borderWidth: `${child.style.borderWidth || 0}px`,
    borderColor: child.style.borderColor || 'transparent',
    borderStyle: child.style.borderStyle || 'solid',
    borderRadius: `${child.style.borderRadius || 0}px`,
    backgroundColor: child.style.backgroundColor || 'transparent',
    boxShadow: child.style.boxShadow || 'none',
    display: child.visible !== false ? 'block' : 'none'
  }
}

function isChildContainer(element: HTMLElement): boolean {
  let current = element.parentElement
  while (current && current !== gridRef.value) {
    if (current.classList.contains('container-component') || current.classList.contains('grid-component')) {
      return true
    }
    current = current.parentElement
  }
  return false
}

function handleContainerClick(e: MouseEvent) {
  if (isPreview.value) return
  if (e.target === gridRef.value) {
    componentStore.selectComponent(props.component.id)
  }
}

function handleContainerDragOver(e: DragEvent) {
  if (isPreview.value) return
  const hasComponentType = e.dataTransfer?.types?.includes('componentType') || editorStore.draggingComponentType
  if (hasComponentType) {
    e.preventDefault()
    isDragOver.value = true
  }
}

function handleContainerDragLeave(e: DragEvent) {
  if (e.target === gridRef.value) {
    isDragOver.value = false
  }
}

function handleContainerDrop(e: DragEvent) {
  if (isPreview.value) return
  e.preventDefault()
  isDragOver.value = false

  const componentType = e.dataTransfer?.getData('componentType') as any
  if (!componentType) return

  const dropTarget = e.target as HTMLElement
  const isDirectDrop = dropTarget === gridRef.value ||
    dropTarget.classList.contains('grid-hint') ||
    gridRef.value?.contains(dropTarget) && !isChildContainer(dropTarget)

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
    ref="gridRef"
    class="grid-component"
    :class="{
      'show-border': showBorder && !isPreview,
      'has-children': hasChildren,
      'is-highlighted': highlighted,
      'is-drag-over': isDragOver,
      'preview-mode': isPreview
    }"
    :style="gridStyle"
    @click="handleContainerClick"
    @dragover="handleContainerDragOver"
    @dragleave="handleContainerDragLeave"
    @drop="handleContainerDrop"
  >
    <template v-if="hasChildren">
      <template v-if="isPreview">
        <div
          v-for="child in component.children"
          :key="child.id"
          class="preview-child"
          :style="getChildStyle(child)"
        >
          <component
            :is="childComponentMap[child.type] || TextComponent"
            :component="child"
            mode="preview"
          />
        </div>
      </template>
      <template v-else>
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
    </template>
    <div v-else-if="!isPreview" class="grid-hint">
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

.grid-component.preview-mode {
  border: none;
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

.preview-child {
  overflow: hidden;
}
</style>
