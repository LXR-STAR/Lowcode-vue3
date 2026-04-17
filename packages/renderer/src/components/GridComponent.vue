<script setup lang="ts">
import { computed } from 'vue'
import type { SchemaComponent } from '../types'

const props = defineProps<{
  component: SchemaComponent
  mode?: string
}>()

const gridProps = computed(() => props.component.props?.props || {})
const columns = computed(() => gridProps.value.columns || 2)
const rowGap = computed(() => gridProps.value.rowGap || 16)
const colGap = computed(() => gridProps.value.colGap || 16)
const padding = computed(() => gridProps.value.padding || 16)
const autoExpand = computed(() => gridProps.value.autoExpand !== false)

const gridStyle = computed(() => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${columns.value}, 1fr)`,
  rowGap: `${rowGap.value}px`,
  columnGap: `${colGap.value}px`,
  padding: `${padding.value}px`,
  height: autoExpand.value ? 'auto' : '100%',
  minHeight: autoExpand.value ? '100%' : undefined
}))

const children = computed(() => props.component.children || [])
</script>

<template>
  <div class="df-grid" :style="gridStyle">
    <div
      v-for="child in children"
      :key="child.id"
      class="grid-item"
      :style="{
        minHeight: `${child.style.height}px`
      }"
    >
      <slot name="child" :child="child">
        {{ child.name }}
      </slot>
    </div>
  </div>
</template>

<style scoped>
.df-grid {
  width: 100%;
  box-sizing: border-box;
}

.grid-item {
  overflow: hidden;
}
</style>
