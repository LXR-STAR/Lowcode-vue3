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

const placeholder = computed(() => props.component.props.inputStyle?.placeholder || '请输入内容')
const disabled = computed(() => props.component.props.inputStyle?.disabled || false)
const maxlength = computed(() => props.component.props.inputStyle?.maxlength || undefined)
const rows = computed(() => props.component.props.inputStyle?.rows || 3)

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
  <div class="textarea-component">
    <el-input
      v-model="localValue"
      type="textarea"
      :placeholder="placeholder"
      :disabled="disabled"
      :maxlength="maxlength"
      :rows="rows"
      :readonly="!isPreview && !localValue"
      @change="handleChange"
      @focus="handleFocus"
      @blur="handleBlur"
    />
  </div>
</template>

<style scoped>
.textarea-component {
  width: 100%;
  height: 100%;
  display: flex;
}
</style>
