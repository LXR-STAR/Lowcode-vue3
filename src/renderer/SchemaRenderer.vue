<script setup lang="ts">
import { computed, markRaw, defineAsyncComponent } from 'vue'
import type { SchemaPage, SchemaComponent } from '@/types/schema'

const props = defineProps<{
  schema: SchemaPage
  mode?: 'preview' | 'edit'
}>()

const TextComponent = markRaw(defineAsyncComponent(() => import('@/components/components/TextComponent.vue')))
const ImageComponent = markRaw(defineAsyncComponent(() => import('@/components/components/ImageComponent.vue')))
const ButtonComponent = markRaw(defineAsyncComponent(() => import('@/components/components/ButtonComponent.vue')))
const InputComponent = markRaw(defineAsyncComponent(() => import('@/components/components/InputComponent.vue')))
const TextareaComponent = markRaw(defineAsyncComponent(() => import('@/components/components/TextareaComponent.vue')))
const SelectComponent = markRaw(defineAsyncComponent(() => import('@/components/components/SelectComponent.vue')))
const CheckboxComponent = markRaw(defineAsyncComponent(() => import('@/components/components/CheckboxComponent.vue')))
const RadioComponent = markRaw(defineAsyncComponent(() => import('@/components/components/RadioComponent.vue')))
const SwitchComponent = markRaw(defineAsyncComponent(() => import('@/components/components/SwitchComponent.vue')))
const DatePickerComponent = markRaw(defineAsyncComponent(() => import('@/components/components/DatePickerComponent.vue')))
const ChartComponent = markRaw(defineAsyncComponent(() => import('@/components/components/ChartComponent.vue')))
const ContainerComponent = markRaw(defineAsyncComponent(() => import('@/components/components/ContainerComponent.vue')))
const GridComponent = markRaw(defineAsyncComponent(() => import('@/components/components/GridComponent.vue')))
const TableComponent = markRaw(defineAsyncComponent(() => import('@/components/components/TableComponent.vue')))

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
  const isInContainer = !!(component as any).parentId
  const autoExpand = isContainer && (component.props as any)?.props?.autoExpand !== false

  return {
    position: isInContainer ? 'relative' as const : 'absolute' as const,
    left: isInContainer ? undefined : `${component.style.x}px`,
    top: isInContainer ? undefined : `${component.style.y}px`,
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
</script>

<template>
  <div class="schema-renderer" :style="containerStyle">
    <template v-for="component in sortedComponents" :key="component.id">
      <div
        class="render-item"
        :style="getComponentStyle(component)"
      >
        <component
          :is="getComponentType(component.type)"
          :component="component"
          :mode="mode"
        />
        <template v-if="component.children && component.children.length > 0">
          <div
            v-for="child in component.children"
            :key="child.id"
            class="render-item"
            :style="getComponentStyle(child)"
          >
            <component
              :is="getComponentType(child.type)"
              :component="child"
              :mode="mode"
            />
            <template v-if="child.children && child.children.length > 0">
              <div
                v-for="grandChild in child.children"
                :key="grandChild.id"
                class="render-item"
                :style="getComponentStyle(grandChild)"
              >
                <component
                  :is="getComponentType(grandChild.type)"
                  :component="grandChild"
                  :mode="mode"
                />
              </div>
            </template>
          </div>
        </template>
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
