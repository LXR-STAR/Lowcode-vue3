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

const switchProps = computed(() => props.component.props?.props || {})
const disabled = computed(() => switchProps.value.disabled || false)
const activeText = computed(() => switchProps.value.activeText || '')
const inactiveText = computed(() => switchProps.value.inactiveText || '')

const value = defineModel<boolean>('value', { default: false })
</script>

<template>
  <div class="df-switch" :class="{ 'is-disabled': disabled, 'is-checked': value }">
    <input
      v-model="value"
      type="checkbox"
      class="df-switch__input"
      :disabled="disabled"
      @change="emit('change', $event)"
    />
    <span class="df-switch__core"></span>
    <span v-if="activeText || inactiveText" class="df-switch__label">
      {{ value ? activeText : inactiveText }}
    </span>
  </div>
</template>

<style scoped>
.df-switch {
  display: inline-flex;
  align-items: center;
  position: relative;
  font-size: 14px;
  line-height: 20px;
  height: 22px;
  vertical-align: middle;
}

.df-switch.is-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.df-switch__input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
}

.df-switch__core {
  margin: 0;
  display: inline-block;
  position: relative;
  width: 40px;
  height: 20px;
  border: 1px solid #dcdfe6;
  outline: none;
  border-radius: 10px;
  box-sizing: border-box;
  background: #dcdfe6;
  cursor: pointer;
  transition: border-color 0.3s, background-color 0.3s;
}

.df-switch__core::after {
  content: "";
  position: absolute;
  top: 1px;
  left: 1px;
  border-radius: 100%;
  transition: all 0.3s;
  width: 16px;
  height: 16px;
  background-color: #fff;
}

.df-switch.is-checked .df-switch__core {
  border-color: #409eff;
  background-color: #409eff;
}

.df-switch.is-checked .df-switch__core::after {
  left: 100%;
  margin-left: -17px;
}

.df-switch__label {
  margin-left: 10px;
  color: #606266;
}
</style>
