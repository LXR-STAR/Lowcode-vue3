<script setup lang="ts">
import { computed } from 'vue'
import type { SchemaComponent } from '../types'

const props = defineProps<{
  component: SchemaComponent
  mode?: string
}>()

const emit = defineEmits<{
  (e: 'click', event: Event): void
}>()

const buttonStyle = computed(() => {
  const buttonStyle = props.component.props?.buttonStyle || {}
  return {
    type: buttonStyle.type || 'primary',
    size: buttonStyle.size || 'default',
    plain: buttonStyle.plain || false,
    round: buttonStyle.round || false,
    circle: buttonStyle.circle || false
  }
})

const text = computed(() => props.component.props?.text || '按钮')

function handleClick(e: Event) {
  emit('click', e)
}
</script>

<template>
  <button 
    class="df-button"
    :class="[
      `df-button--${buttonStyle.type}`,
      `df-button--${buttonStyle.size}`,
      { 'is-plain': buttonStyle.plain },
      { 'is-round': buttonStyle.round },
      { 'is-circle': buttonStyle.circle }
    ]"
    @click="handleClick"
  >
    {{ text }}
  </button>
</template>

<style scoped>
.df-button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  line-height: 1;
  height: 32px;
  white-space: nowrap;
  cursor: pointer;
  text-align: center;
  box-sizing: border-box;
  outline: none;
  transition: 0.1s;
  font-weight: 500;
  user-select: none;
  vertical-align: middle;
  -webkit-appearance: none;
  background-color: #409eff;
  border: 1px solid #409eff;
  color: #ffffff;
  padding: 8px 15px;
  font-size: 14px;
  border-radius: 4px;
}

.df-button:hover {
  background-color: #79bbff;
  border-color: #79bbff;
}

.df-button--primary { background-color: #409eff; border-color: #409eff; }
.df-button--success { background-color: #67c23a; border-color: #67c23a; }
.df-button--warning { background-color: #e6a23c; border-color: #e6a23c; }
.df-button--danger { background-color: #f56c6c; border-color: #f56c6c; }
.df-button--info { background-color: #909399; border-color: #909399; }

.df-button--small { height: 24px; padding: 5px 11px; font-size: 12px; }
.df-button--large { height: 40px; padding: 12px 19px; font-size: 14px; }

.is-plain { background-color: #fff; color: #409eff; }
.is-round { border-radius: 20px; }
.is-circle { border-radius: 50%; padding: 8px; }
</style>
