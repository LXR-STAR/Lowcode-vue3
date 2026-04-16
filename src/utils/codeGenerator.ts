import type { SchemaPage, SchemaComponent } from '@/types/schema'

export type CodeFormat = 'html' | 'vue'

interface CodeGeneratorOptions {
  format: CodeFormat
  includeStyles: boolean
  inlineStyles: boolean
}

export function generateCode(schema: SchemaPage, options: CodeGeneratorOptions): string {
  switch (options.format) {
    case 'html':
      return generateHTML(schema, options)
    case 'vue':
      return generateVue(schema, options)
    default:
      return generateHTML(schema, options)
  }
}

function generateHTML(schema: SchemaPage, options: CodeGeneratorOptions): string {
  const componentsHTML = schema.components
    .map(comp => generateComponentHTML(comp, options))
    .join('\n    ')

  const styles = options.includeStyles ? generateStyles(schema) : ''

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${schema.name}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: #f0f2f5;
    }

    .page-container {
      position: relative;
      width: ${schema.canvas.width}px;
      height: ${schema.canvas.height}px;
      background: ${schema.canvas.backgroundColor || '#fff'};
      overflow: hidden;
    }

${styles}
  </style>
</head>
<body>
  <div class="page-container">
    ${componentsHTML}
  </div>
</body>
</html>`
}

function generateComponentHTML(component: SchemaComponent, options: CodeGeneratorOptions): string {
  const styleStr = options.inlineStyles ? '' : ` class="component-${component.type}"`
  const inlineStyle = options.inlineStyles ? ` style="${generateInlineStyle(component.style)}"` : ''

  let content = ''

  switch (component.type) {
    case 'text':
      content = component.props.content || '文本内容'
      break
    case 'image':
      content = `<img src="${component.props.src || ''}" alt="${component.props.alt || ''}" style="width: 100%; height: 100%; object-fit: cover;">`
      break
    case 'button':
      content = `<button style="width: 100%; height: 100%; border: none; cursor: pointer; font-size: 14px;">${component.props.text || '按钮'}</button>`
      break
    case 'input':
      content = `<input type="${component.props.inputType || 'text'}" placeholder="${component.props.placeholder || ''}" style="width: 100%; height: 100%; padding: 8px; border: 1px solid #dcdfe6; border-radius: 4px;">`
      break
    case 'container':
      if (component.children && component.children.length > 0) {
        content = component.children.map(child => generateComponentHTML(child, options)).join('\n      ')
      }
      break
    default:
      content = `<div>${component.name}</div>`
  }

  return `<div${styleStr}${inlineStyle}>
      ${content}
    </div>`
}

function generateInlineStyle(style: SchemaComponent['style']): string {
  return Object.entries({
    position: 'absolute',
    left: `${style.x}px`,
    top: `${style.y}px`,
    width: `${style.width}px`,
    height: `${style.height}px`,
    transform: style.rotate ? `rotate(${style.rotate}deg)` : undefined,
    opacity: style.opacity !== 1 ? style.opacity : undefined,
    'border-width': style.borderWidth ? `${style.borderWidth}px` : undefined,
    'border-color': style.borderColor || undefined,
    'border-style': style.borderStyle || undefined,
    'border-radius': style.borderRadius ? `${style.borderRadius}px` : undefined,
    'background-color': style.backgroundColor || undefined,
    'box-shadow': style.boxShadow || undefined,
    'z-index': style.zIndex
  })
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ')
}

function generateStyles(schema: SchemaPage): string {
  let styles = ''

  schema.components.forEach(comp => {
    styles += `    .component-${comp.type} {
      position: absolute;
      left: ${comp.style.x}px;
      top: ${comp.style.y}px;
      width: ${comp.style.width}px;
      height: ${comp.style.height}px;
      ${comp.style.rotate ? `transform: rotate(${comp.style.rotate}deg);` : ''}
      ${comp.style.opacity !== 1 ? `opacity: ${comp.style.opacity};` : ''}
      ${comp.style.borderWidth ? `border: ${comp.style.borderWidth}px ${comp.style.borderStyle || 'solid'} ${comp.style.borderColor || 'transparent'};` : ''}
      ${comp.style.borderRadius ? `border-radius: ${comp.style.borderRadius}px;` : ''}
      ${comp.style.backgroundColor ? `background-color: ${comp.style.backgroundColor};` : ''}
      ${comp.style.boxShadow ? `box-shadow: ${comp.style.boxShadow};` : ''}
      z-index: ${comp.style.zIndex};
    }

`
  })

  return styles
}

function generateVue(schema: SchemaPage, options: CodeGeneratorOptions): string {
  const componentsVue = schema.components
    .map(comp => generateComponentVue(comp, options))
    .join('\n    ')

  return `<template>
  <div class="page-container" :style="containerStyle">
    ${componentsVue}
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  schema: any
}>()

const containerStyle = computed(() => ({
  width: \`\${props.schema?.canvas?.width || ${schema.canvas.width}}px\`,
  height: \`\${props.schema?.canvas?.height || ${schema.canvas.height}}px\`,
  backgroundColor: props.schema?.canvas?.backgroundColor || '${schema.canvas.backgroundColor || '#fff'}'
}))
</script>

<style scoped>
.page-container {
  position: relative;
  overflow: hidden;
}
</style>`
}

function generateComponentVue(component: SchemaComponent, options: CodeGeneratorOptions): string {
  const styleBinding = `:style="{
      position: 'absolute',
      left: \`${component.style.x}px\`,
      top: \`${component.style.y}px\`,
      width: \`${component.style.width}px\`,
      height: \`${component.style.height}px\`,
      ${component.style.rotate ? `transform: \`rotate(${component.style.rotate}deg)\`,` : ''}
      zIndex: ${component.style.zIndex}
    }"`

  let content = ''

  switch (component.type) {
    case 'text':
      content = `<span>${component.props.content || '文本内容'}</span>`
      break
    case 'image':
      content = `<img src="${component.props.src || ''}" alt="${component.props.alt || ''}" />`
      break
    case 'button':
      content = `<el-button>${component.props.text || '按钮'}</el-button>`
      break
    case 'input':
      content = `<el-input placeholder="${component.props.placeholder || ''}" />`
      break
    case 'container':
      if (component.children && component.children.length > 0) {
        content = component.children.map(child => generateComponentVue(child, options)).join('\n      ')
      }
      break
    default:
      content = `<div>${component.name}</div>`
  }

  return `<div ${styleBinding}>
      ${content}
    </div>`
}

export function downloadCode(code: string, filename: string, format: CodeFormat): void {
  const extension = format === 'html' ? 'html' : 'vue'
  const mimeType = format === 'html' ? 'text/html' : 'text/plain'

  const blob = new Blob([code], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.${extension}`
  a.click()
  URL.revokeObjectURL(url)
}
