<script setup lang="ts">
import { computed } from 'vue'
import type { EditorComponent } from '@/types'

const props = defineProps<{
  component: EditorComponent
  mode?: 'edit' | 'preview'
}>()

const isPreview = computed(() => props.mode === 'preview')

const linkStyle = computed(() => {
  const style = props.component.props?.linkStyle || {}
  return {
    color: style.color || '#409eff',
    fontSize: `${style.fontSize || 14}px`,
    fontWeight: style.fontWeight || 'normal',
    textDecoration: style.underline ? 'underline' : 'none'
  }
})

const linkText = computed(() => props.component.props?.text || '链接文字')
const linkHref = computed(() => props.component.props?.linkStyle?.href || '#')
const linkTarget = computed(() => props.component.props?.linkStyle?.target || '_blank')
</script>

<template>
  <div class="link-component" style="width: 100%; height: 100%; display: flex; align-items: center;">
    <a
      v-if="isPreview"
      :href="linkHref"
      :target="linkTarget"
      :style="linkStyle"
      class="link-text"
      @click.stop
    >
      {{ linkText }}
    </a>
    <span v-else :style="linkStyle" class="link-text">
      {{ linkText }}
    </span>
  </div>
</template>

<style scoped lang="scss">
.link-component {
  .link-text {
    cursor: pointer;
    transition: opacity 0.2s;

    &:hover {
      opacity: 0.8;
    }
  }
}
</style>
