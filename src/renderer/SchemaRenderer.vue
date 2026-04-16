<script setup lang="ts">
import { computed, defineAsyncComponent, markRaw } from 'vue'
import type { SchemaPage, SchemaComponent } from '@/types/schema'

const props = defineProps<{
  schema: SchemaPage
  mode?: 'preview' | 'edit'
}>()

const TextComponent = markRaw(defineAsyncComponent(() => import('./TextComponent.vue')))
const ImageComponent = markRaw(defineAsyncComponent(() => import('./ImageComponent.vue')))
const ButtonComponent = markRaw(defineAsyncComponent(() => import('./ButtonComponent.vue')))
const InputComponent = markRaw(defineAsyncComponent(() => import('./InputComponent.vue')))
const ChartComponent = markRaw(defineAsyncComponent(() => import('./ChartComponent.vue')))
const ContainerComponent = markRaw(defineAsyncComponent(() => import('./ContainerComponent.vue')))

const componentMap: Record<string, any> = {
  text: TextComponent,
  image: ImageComponent,
  button: ButtonComponent,
  input: InputComponent,
  textarea: InputComponent,
  select: InputComponent,
  checkbox: InputComponent,
  radio: InputComponent,
  chart: ChartComponent,
  container: ContainerComponent
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
  return {
    position: 'absolute' as const,
    left: `${component.style.x}px`,
    top: `${component.style.y}px`,
    width: `${component.style.width}px`,
    height: `${component.style.height}px`,
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
