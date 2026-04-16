<script setup lang="ts">
import { ref, computed } from 'vue'
import type { EditorComponent } from '@/types'

const props = defineProps<{
  component: EditorComponent
  mode?: 'edit' | 'preview'
}>()

const isPreview = computed(() => props.mode === 'preview')
const localValue = ref(props.component.props.props?.value || '')

const placeholder = computed(() => props.component.props.props?.placeholder || '请输入')
const disabled = computed(() => props.component.props.props?.disabled || false)
const maxlength = computed(() => props.component.props.props?.maxlength || undefined)
const rows = computed(() => props.component.props.props?.rows || 3)
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
