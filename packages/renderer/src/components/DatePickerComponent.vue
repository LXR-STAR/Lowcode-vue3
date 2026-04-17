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

const datePickerProps = computed(() => props.component.props?.props || {})
const placeholder = computed(() => datePickerProps.value.placeholder || '选择日期')
const disabled = computed(() => datePickerProps.value.disabled || false)
const dateType = computed(() => datePickerProps.value.dateType || 'date')

const value = defineModel<string>('value', { default: '' })
</script>

<template>
  <input
    v-model="value"
    class="df-date-picker"
    :type="dateType === 'datetime' ? 'datetime-local' : 'date'"
    :placeholder="placeholder"
    :disabled="disabled"
    @focus="emit('focus', $event)"
    @blur="emit('blur', $event)"
    @change="emit('change', $event)"
  />
</template>

<style scoped>
.df-date-picker {
  width: 100%;
  height: 32px;
  padding: 0 11px;
  font-size: 14px;
  color: #606266;
  background-color: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  box-sizing: border-box;
  cursor: pointer;
}

.df-date-picker:hover {
  border-color: #c0c4cc;
}

.df-date-picker:focus {
  outline: none;
  border-color: #409eff;
}

.df-date-picker:disabled {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  color: #c0c4cc;
  cursor: not-allowed;
}
</style>
