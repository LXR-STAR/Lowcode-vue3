<script setup lang="ts">
import { ref, computed } from 'vue'
import type { EditorComponent } from '@/types'

const props = defineProps<{
  component: EditorComponent
  mode?: 'edit' | 'preview'
}>()

const isPreview = computed(() => props.mode === 'preview')
const localValue = ref(props.component.props.props?.value || false)

const label = computed(() => props.component.props.props?.label || '选项')
const disabled = computed(() => props.component.props.props?.disabled || false)
</script>

<template>
  <div class="checkbox-component">
    <el-checkbox
      v-model="localValue"
      :disabled="disabled"
    >
      {{ label }}
    </el-checkbox>
  </div>
</template>

<style scoped>
.checkbox-component {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 8px;
}
</style>
