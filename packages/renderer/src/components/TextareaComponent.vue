<script setup lang="ts">
import { computed } from 'vue'
import type { SchemaComponent } from '../types'

const props = defineProps<{
  component: SchemaComponent
  mode?: string
}>()

const emit = defineEmits<{
  (e: 'focus', event: Event): void
  (e: 'blur', event: Event): void
  (e: 'change', event: Event): void
}>()

const inputStyle = computed(() => props.component.props?.inputStyle || {})
const placeholder = computed(() => inputStyle.value.placeholder || '请输入内容')
const disabled = computed(() => inputStyle.value.disabled || false)
const maxlength = computed(() => inputStyle.value.maxlength || 500)

const value = defineModel<string>('value', { default: '' })
</script>

<template>
  <textarea
    v-model="value"
    class="df-textarea"
    :placeholder="placeholder"
    :disabled="disabled"
    :maxlength="maxlength"
    @focus="emit('focus', $event)"
    @blur="emit('blur', $event)"
    @change="emit('change', $event)"
  />
</template>

<style scoped>
.df-textarea {
  width: 100%;
  height: 100%;
  padding: 5px 11px;
  font-size: 14px;
  line-height: 1.5;
  color: #606266;
  background-color: #fff;
  background-image: none;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  box-sizing: border-box;
  resize: none;
  transition: border-color 0.2s;
}

.df-textarea:hover {
  border-color: #c0c4cc;
}

.df-textarea:focus {
  outline: none;
  border-color: #409eff;
}

.df-textarea:disabled {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  color: #c0c4cc;
  cursor: not-allowed;
}
</style>
