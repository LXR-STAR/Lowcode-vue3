<script setup lang="ts">
import { computed } from 'vue'
import type { EditorComponent } from '@/types'

const props = defineProps<{
  component: EditorComponent
}>()

const placeholder = computed(() => props.component.props.inputStyle?.placeholder || '请输入')
const disabled = computed(() => props.component.props.inputStyle?.disabled || false)
const clearable = computed(() => props.component.props.inputStyle?.clearable ?? true)
</script>

<template>
  <div class="input-component">
    <el-input
      :placeholder="placeholder"
      :disabled="disabled"
      :clearable="clearable"
    />
  </div>
</template>

<style scoped>
.input-component {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
}
</style>
