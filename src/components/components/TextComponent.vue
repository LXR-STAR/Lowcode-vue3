<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import type { EditorComponent } from '@/types'

const props = defineProps<{
  component: EditorComponent
  mode?: 'edit' | 'preview'
}>()

const emit = defineEmits<{
  (e: 'update', value: string): void
}>()

const isEditing = ref(false)
const editRef = ref<HTMLTextAreaElement | null>(null)
const localText = ref('')

const isPreview = computed(() => props.mode === 'preview')

const textStyle = computed(() => ({
  fontSize: `${props.component.props.textStyle?.fontSize || 14}px`,
  fontFamily: props.component.props.textStyle?.fontFamily || 'Arial, sans-serif',
  fontWeight: props.component.props.textStyle?.fontWeight || 'normal',
  fontStyle: props.component.props.textStyle?.fontStyle || 'normal',
  textDecoration: props.component.props.textStyle?.textDecoration || 'none',
  lineHeight: props.component.props.textStyle?.lineHeight || 1.5,
  textAlign: props.component.props.textStyle?.textAlign || 'left',
  color: props.component.props.textStyle?.color || '#333333'
}))

const displayText = computed(() => {
  const text = props.component.props.text || ''
  if (isPreview.value) {
    return text || ''
  }
  return text || '双击编辑文本'
})

function startEdit() {
  if (isPreview.value) return
  isEditing.value = true
  localText.value = props.component.props.text || ''
  nextTick(() => {
    editRef.value?.focus()
    editRef.value?.select()
  })
}

function finishEdit() {
  isEditing.value = false
  emit('update', localText.value)
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    isEditing.value = false
  } else if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    finishEdit()
  }
}
</script>

<template>
  <div
    class="text-component"
    :style="textStyle"
    @dblclick="startEdit"
  >
    <template v-if="!isEditing">
      {{ displayText }}
    </template>
    <textarea
      v-else
      ref="editRef"
      v-model="localText"
      class="edit-input"
      :style="textStyle"
      @blur="finishEdit"
      @keydown="handleKeydown"
    />
  </div>
</template>

<style scoped>
.text-component {
  width: 100%;
  height: 100%;
  overflow: hidden;
  word-wrap: break-word;
  white-space: pre-wrap;
  display: flex;
  align-items: center;
  cursor: text;
}

.edit-input {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  resize: none;
  padding: 0;
  margin: 0;
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  font-style: inherit;
  line-height: inherit;
  color: inherit;
  text-align: inherit;
}
</style>
