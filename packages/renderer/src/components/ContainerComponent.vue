<script setup lang="ts">
import { computed } from 'vue'
import type { SchemaComponent } from '../types'

const props = defineProps<{
  component: SchemaComponent
  mode?: string
}>()

const containerProps = computed(() => props.component.props?.props || {})
const autoExpand = computed(() => containerProps.value.autoExpand !== false)

const containerStyle = computed(() => ({
  display: 'flex',
  flexDirection: 'column' as const,
  flexWrap: 'wrap' as const,
  gap: '8px',
  padding: '8px',
  height: autoExpand.value ? 'auto' : '100%',
  minHeight: autoExpand.value ? '100%' : undefined
}))

const children = computed(() => props.component.children || [])
</script>

<template>
  <div class="df-container" :style="containerStyle">
    <div
      v-for="child in children"
      :key="child.id"
      class="container-child"
      :style="{
        position: 'relative',
        left: `${child.style.x}px`,
        top: `${child.style.y}px`,
        width: `${child.style.width}px`,
        height: `${child.style.height}px`
      }"
    >
      <slot name="child" :child="child">
        {{ child.name }}
      </slot>
    </div>
  </div>
</template>

<style scoped>
.df-container {
  width: 100%;
  box-sizing: border-box;
}

.container-child {
  flex-shrink: 0;
}
</style>
