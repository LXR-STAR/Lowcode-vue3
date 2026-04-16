<script setup lang="ts">
import { ref, computed } from 'vue'
import type { EditorComponent } from '@/types'

const props = defineProps<{
  component: EditorComponent
  mode?: 'edit' | 'preview'
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
