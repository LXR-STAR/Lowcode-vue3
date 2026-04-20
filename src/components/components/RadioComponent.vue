<script setup lang="ts">
import { ref, computed } from 'vue'
import type { EditorComponent } from '@/types'

const props = defineProps<{
  component: EditorComponent
  mode?: 'edit' | 'preview'
}>()

const emit = defineEmits<{
  (e: 'change', value: string | number): void
}>()

const isPreview = computed(() => props.mode === 'preview')
const localValue = ref(props.component.props.props?.value || '')

const disabled = computed(() => props.component.props.props?.disabled || false)

const options = computed(() => props.component.props.props?.options || [
  { label: '选项一', value: '1' },
  { label: '选项二', value: '2' },
  { label: '选项三', value: '3' }
])

function handleChange(val: string | number) {
  emit('change', val)
}
</script>

<template>
  <div class="radio-component">
    <el-radio-group v-model="localValue" :disabled="disabled" @change="handleChange">
      <el-radio
        v-for="item in options"
        :key="item.value"
        :value="item.value"
      >
        {{ item.label }}
      </el-radio>
    </el-radio-group>
  </div>
</template>

<style scoped>
.radio-component {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 8px;
}
</style>
