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

const text = computed(() => props.component.props?.text || '单选框')
const disabled = computed(() => props.component.props?.props?.disabled || false)

const checked = defineModel<boolean>('checked', { default: false })
</script>

<template>
  <label class="df-radio" :class="{ 'is-disabled': disabled }">
    <input
      v-model="checked"
      type="radio"
      class="df-radio__input"
      :disabled="disabled"
      @change="emit('change', $event)"
    />
    <span class="df-radio__label">{{ text }}</span>
  </label>
</template>

<style scoped>
.df-radio {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  color: #606266;
}

.df-radio.is-disabled {
  cursor: not-allowed;
  color: #c0c4cc;
}

.df-radio__input {
  width: 16px;
  height: 16px;
  margin-right: 8px;
  cursor: pointer;
}

.df-radio.is-disabled .df-radio__input {
  cursor: not-allowed;
}
</style>
