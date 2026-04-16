<script setup lang="ts">
import { computed } from 'vue'
import type { EditorComponent } from '@/types'

const props = defineProps<{
  component: EditorComponent
}>()

const imageStyle = computed(() => ({
  objectFit: props.component.props.imageStyle?.objectFit || 'cover'
}))

const src = computed(() => props.component.props.imageStyle?.src || '')
const alt = computed(() => props.component.props.imageStyle?.alt || '图片')
</script>

<template>
  <div class="image-component">
    <img v-if="src" :src="src" :alt="alt" :style="imageStyle" />
    <div v-else class="placeholder">
      <el-icon size="32"><Picture /></el-icon>
      <span>请设置图片</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.image-component {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
  }

  .placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #909399;
    gap: 8px;
  }
}
</style>
