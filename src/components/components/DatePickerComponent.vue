<script setup lang="ts">
import { ref, computed } from 'vue'
import type { EditorComponent } from '@/types'

const props = defineProps<{
  component: EditorComponent
  mode?: 'edit' | 'preview'
}>()

const isPreview = computed(() => props.mode === 'preview')
const localValue = ref(props.component.props.props?.value || '')

const placeholder = computed(() => props.component.props.props?.placeholder || '选择日期')
const disabled = computed(() => props.component.props.props?.disabled || false)
const type = computed(() => props.component.props.props?.type || 'date')
const format = computed(() => props.component.props.props?.format || 'YYYY-MM-DD')
</script>

<template>
  <div class="date-picker-component">
    <el-date-picker
      v-model="localValue"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :format="format"
      :value-format="format"
      style="width: 100%"
    />
  </div>
</template>

<style scoped>
.date-picker-component {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
}
</style>
