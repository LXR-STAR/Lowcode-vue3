<script setup lang="ts">
import type { EditorComponent } from '@/types'

const props = defineProps<{
  component: EditorComponent
}>()
</script>

<template>
  <div class="container-component">
    <slot>容器内容区域</slot>
  </div>
</template>

<style scoped>
.container-component {
  width: 100%;
  height: 100%;
  min-height: 100px;
  display: flex;
  flex-direction: column;
}
</style>
