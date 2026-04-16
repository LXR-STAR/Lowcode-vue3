<script setup lang="ts">
import { computed } from 'vue'
import type { EditorComponent } from '@/types'

const props = defineProps<{
  component: EditorComponent
}>()

const buttonType = computed(() => props.component.props.buttonStyle?.type || 'primary')
const buttonSize = computed(() => props.component.props.buttonStyle?.size || 'default')
const plain = computed(() => props.component.props.buttonStyle?.plain || false)
const round = computed(() => props.component.props.buttonStyle?.round || false)
const text = computed(() => props.component.props.text || '按钮')
</script>

<template>
  <div class="button-component">
    <el-button
      :type="buttonType"
      :size="buttonSize"
      :plain="plain"
      :round="round"
    >
      {{ text }}
    </el-button>
  </div>
</template>

<style scoped>
.button-component {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
