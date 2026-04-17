<script setup lang="ts">
import { computed } from 'vue'
import type { SchemaComponent } from '../types'

const props = defineProps<{
  component: SchemaComponent
  mode?: string
}>()

const textStyle = computed(() => {
  const textStyle = props.component.props?.textStyle || {}
  return {
    fontSize: `${textStyle.fontSize || 14}px`,
    fontFamily: textStyle.fontFamily || 'Arial, sans-serif',
    fontWeight: textStyle.fontWeight || 'normal',
    fontStyle: textStyle.fontStyle || 'normal',
    textDecoration: textStyle.textDecoration || 'none',
    lineHeight: textStyle.lineHeight || 1.5,
    textAlign: textStyle.textAlign || 'left',
    color: textStyle.color || '#333333'
  }
})

const text = computed(() => props.component.props?.text || '请输入文本内容')
</script>

<template>
  <div class="text-component" :style="textStyle">
    {{ text }}
  </div>
</template>

<style scoped>
.text-component {
  width: 100%;
  height: 100%;
  word-break: break-word;
  white-space: pre-wrap;
}
</style>
