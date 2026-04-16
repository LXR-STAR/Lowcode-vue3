<script setup lang="ts">
import { computed } from 'vue'
import type { EditorComponent } from '@/types'

const props = defineProps<{
  component: EditorComponent
}>()

const textStyle = computed(() => ({
  fontSize: `${props.component.props.textStyle?.fontSize || 14}px`,
  fontFamily: props.component.props.textStyle?.fontFamily || 'Arial, sans-serif',
  fontWeight: props.component.props.textStyle?.fontWeight || 'normal',
  fontStyle: props.component.props.textStyle?.fontStyle || 'normal',
  textDecoration: props.component.props.textStyle?.textDecoration || 'none',
  lineHeight: props.component.props.textStyle?.lineHeight || 1.5,
  textAlign: props.component.props.textStyle?.textAlign || 'left',
  color: props.component.props.textStyle?.color || '#333333'
}))
</script>

<template>
  <div class="text-component" :style="textStyle">
    {{ component.props.text || '请输入文本内容' }}
  </div>
</template>

<style scoped>
.text-component {
  width: 100%;
  height: 100%;
  overflow: hidden;
  word-wrap: break-word;
  white-space: pre-wrap;
  display: flex;
  align-items: center;
}
</style>
