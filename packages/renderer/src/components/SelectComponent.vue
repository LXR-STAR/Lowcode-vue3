<script setup lang="ts">
import { computed } from 'vue'
import type { SchemaComponent } from '../types'

const props = defineProps<{
  component: SchemaComponent
  mode?: string
}>()

const emit = defineEmits<{
  (e: 'change', event: Event): void
}>()

const options = computed(() => props.component.props?.props?.options || [])
const placeholder = computed(() => props.component.props?.inputStyle?.placeholder || '请选择')
const disabled = computed(() => props.component.props?.inputStyle?.disabled || false)

const value = defineModel<string>('value', { default: '' })
</script>

<template>
  <select
    v-model="value"
    class="df-select"
    :disabled="disabled"
    @change="emit('change', $event)"
  >
    <option value="" disabled>{{ placeholder }}</option>
    <option v-for="opt in options" :key="opt.value" :value="opt.value">
      {{ opt.label }}
    </option>
  </select>
</template>

<style scoped>
.df-select {
  width: 100%;
  height: 32px;
  padding: 0 30px 0 11px;
  font-size: 14px;
  color: #606266;
  background-color: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  box-sizing: border-box;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1024 1024'%3E%3Cpath fill='%23C0C4CC' d='M508 672L256 480h504z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 12px;
}

.df-select:hover {
  border-color: #c0c4cc;
}

.df-select:focus {
  outline: none;
  border-color: #409eff;
}

.df-select:disabled {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  color: #c0c4cc;
  cursor: not-allowed;
}
</style>
