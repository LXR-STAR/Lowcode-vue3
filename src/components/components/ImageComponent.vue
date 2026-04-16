<script setup lang="ts">
import { computed, ref } from 'vue'
import type { EditorComponent } from '@/types'

const props = defineProps<{
  component: EditorComponent
  mode?: 'edit' | 'preview'
}>()

const emit = defineEmits<{
  (e: 'update:image', value: { src: string; alt?: string }): void
}>()

const fileInput = ref<HTMLInputElement | null>(null)

const isPreview = computed(() => props.mode === 'preview')

const imageStyle = computed(() => ({
  objectFit: props.component.props.imageStyle?.objectFit || 'cover'
}))

const src = computed(() => props.component.props.imageStyle?.src || '')
const alt = computed(() => props.component.props.imageStyle?.alt || '图片')

function triggerUpload(e: MouseEvent) {
  if (isPreview.value) return
  e.stopPropagation()
  fileInput.value?.click()
}

function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      emit('update:image', { src: dataUrl, alt: file.name })
    }
    reader.readAsDataURL(file)
  }
  target.value = ''
}
</script>

<template>
  <div class="image-component" @click="triggerUpload">
    <img v-if="src" :src="src" :alt="alt" :style="imageStyle" />
    <div v-else class="placeholder">
      <el-icon size="32"><Picture /></el-icon>
      <span>{{ isPreview ? '暂无图片' : '点击上传图片' }}</span>
    </div>
    <input
      v-if="!isPreview"
      ref="fileInput"
      type="file"
      accept="image/*"
      style="display: none"
      @change="handleFileChange"
    />
  </div>
</template>

<style scoped lang="scss">
.image-component {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

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
    transition: color 0.2s;

    &:hover {
      color: #409eff;
    }
  }
}
</style>
