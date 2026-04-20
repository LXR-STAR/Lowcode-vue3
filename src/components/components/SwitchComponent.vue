<script setup lang="ts">
import { ref, computed } from 'vue'
import type { EditorComponent } from '@/types'

const props = defineProps<{
  component: EditorComponent
  mode?: 'edit' | 'preview'
}>()

const emit = defineEmits<{
  (e: 'change', value: boolean): void
}>()

const isPreview = computed(() => props.mode === 'preview')
const localValue = ref(props.component.props.props?.value || false)

const disabled = computed(() => props.component.props.props?.disabled || false)
const activeText = computed(() => props.component.props.props?.activeText || '')
const inactiveText = computed(() => props.component.props.props?.inactiveText || '')

function handleChange(val: boolean) {
  emit('change', val)
}
</script>

<template>
  <div class="switch-component">
    <el-switch
      v-model="localValue"
      :disabled="disabled"
      :active-text="activeText"
      :inactive-text="inactiveText"
      @change="handleChange"
    />
  </div>
</template>

<style scoped>
.switch-component {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 8px;
}
</style>
