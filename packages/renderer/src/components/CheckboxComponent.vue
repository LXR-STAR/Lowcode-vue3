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

const text = computed(() => props.component.props?.text || '复选框')
const disabled = computed(() => props.component.props?.props?.disabled || false)

const checked = defineModel<boolean>('checked', { default: false })

function handleChange(e: Event) {
  emit('change', e)
}
</script>

<template>
  <label class="df-checkbox" :class="{ 'is-disabled': disabled }">
    <input
      v-model="checked"
      type="checkbox"
      class="df-checkbox__input"
      :disabled="disabled"
      @change="handleChange"
    />
    <span class="df-checkbox__label">{{ text }}</span>
  </label>
</template>

<style scoped>
.df-checkbox {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  color: #606266;
}

.df-checkbox.is-disabled {
  cursor: not-allowed;
  color: #c0c4cc;
}

.df-checkbox__input {
  width: 16px;
  height: 16px;
  margin-right: 8px;
  cursor: pointer;
}

.df-checkbox.is-disabled .df-checkbox__input {
  cursor: not-allowed;
}
</style>
