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
const placeholder = computed(() => inputStyle.value.placeholder || '请输入')
const inputType = computed(() => inputStyle.value.type || 'text')
const disabled = computed(() => inputStyle.value.disabled || false)
const clearable = computed(() => inputStyle.value.clearable !== false)

const value = defineModel<string>('value', { default: '' })
</script>

<template>
  <input
    v-model="value"
    class="df-input"
    :type="inputType"
    :placeholder="placeholder"
    :disabled="disabled"
    @focus="emit('focus', $event)"
    @blur="emit('blur', $event)"
    @change="emit('change', $event)"
  />
</template>

<style scoped>
.df-input {
  width: 100%;
  height: 32px;
  padding: 0 11px;
  font-size: 14px;
  line-height: 32px;
  color: #606266;
  background-color: #fff;
  background-image: none;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.df-input:hover {
  border-color: #c0c4cc;
}

.df-input:focus {
  outline: none;
  border-color: #409eff;
}

.df-input:disabled {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  color: #c0c4cc;
  cursor: not-allowed;
}
</style>
