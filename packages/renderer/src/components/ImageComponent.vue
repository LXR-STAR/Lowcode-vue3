<script setup lang="ts">
import { computed } from 'vue'
import type { SchemaComponent } from '../types'

const props = defineProps<{
  component: SchemaComponent
  mode?: string
}>()

const imageStyle = computed(() => {
  const imageStyle = props.component.props?.imageStyle || {}
  return {
    objectFit: imageStyle.objectFit || 'cover',
    width: '100%',
    height: '100%'
  }
})

const src = computed(() => props.component.props?.imageStyle?.src || '')
const alt = computed(() => props.component.props?.imageStyle?.alt || '图片')
</script>

<template>
  <div class="image-component">
    <img v-if="src" :src="src" :alt="alt" :style="imageStyle" />
    <div v-else class="image-placeholder">
      <span>图片占位</span>
    </div>
  </div>
</template>

<style scoped>
.image-component {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 14px;
}
</style>
