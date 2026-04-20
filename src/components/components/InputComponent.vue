<script setup lang="ts">
import { ref, computed } from 'vue'
import type { EditorComponent } from '@/types'

const props = defineProps<{
  component: EditorComponent
  mode?: 'edit' | 'preview'
}>()

const emit = defineEmits<{
  (e: 'change', value: string): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
}>()

const isPreview = computed(() => props.mode === 'preview')
const localValue = ref('')

const placeholder = computed(() => props.component.props.inputStyle?.placeholder || '请输入')
const disabled = computed(() => props.component.props.inputStyle?.disabled || false)
const clearable = computed(() => props.component.props.inputStyle?.clearable || false)
const showPassword = computed(() => props.component.props.inputStyle?.showPassword || false)
const maxlength = computed(() => props.component.props.inputStyle?.maxlength || undefined)

function handleChange(val: string) {
  emit('change', val)
}

function handleFocus(e: FocusEvent) {
  emit('focus', e)
}

function handleBlur(e: FocusEvent) {
  emit('blur', e)
}
</script>

<template>
  <div class="input-component">
    <el-input
      v-model="localValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :clearable="clearable"
      :show-password="showPassword"
      :maxlength="maxlength"
      :readonly="!isPreview && !localValue"
      @change="handleChange"
      @focus="handleFocus"
      @blur="handleBlur"
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
