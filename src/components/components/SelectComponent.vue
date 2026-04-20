<script setup lang="ts">
import { ref, computed } from 'vue'
import type { EditorComponent } from '@/types'

const props = defineProps<{
  component: EditorComponent
  mode?: 'edit' | 'preview'
}>()

const emit = defineEmits<{
  (e: 'change', value: any): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
}>()

const isPreview = computed(() => props.mode === 'preview')
const localValue = ref(props.component.props.props?.value || '')

const placeholder = computed(() => props.component.props.props?.placeholder || '请选择')
const disabled = computed(() => props.component.props.props?.disabled || false)
const clearable = computed(() => props.component.props.props?.clearable || false)
const multiple = computed(() => props.component.props.props?.multiple || false)

const options = computed(() => props.component.props.props?.options || [
  { label: '选项一', value: '1' },
  { label: '选项二', value: '2' },
  { label: '选项三', value: '3' }
])

function handleChange(val: any) {
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
  <div class="select-component">
    <el-select
      v-model="localValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :clearable="clearable"
      :multiple="multiple"
      style="width: 100%"
      @change="handleChange"
      @focus="handleFocus"
      @blur="handleBlur"
    >
      <el-option
        v-for="item in options"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
  </div>
</template>

<style scoped>
.select-component {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
}
</style>
