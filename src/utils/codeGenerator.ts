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
  <link rel="stylesheet" href="https://unpkg.com/element-plus/dist/index.css">
  <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"><\/script>
  <script src="https://unpkg.com/element-plus"><\/script>
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
  <div id="app">
    <div class="page-container">
      ${componentsHTML}
    </div>
  </div>
  <script>
    const { createApp } = Vue
    const app = createApp({})
    app.use(ElementPlus)
    app.mount('#app')
  <\/script>
</body>
</html>`
}

function generateComponentHTML(component: SchemaComponent, options: CodeGeneratorOptions, indent: string = '      '): string {
  const styleStr = options.inlineStyles ? '' : ` class="component-${component.type}"`
  const inlineStyle = options.inlineStyles ? ` style="${generateInlineStyle(component)}"` : ''

  let content = ''

  const p = component.props || {} as any

  switch (component.type) {
    case 'text':
      content = `<span style="font-size: ${p.textStyle?.fontSize || 14}px; color: ${p.textStyle?.color || '#333'}; font-weight: ${p.textStyle?.fontWeight || 'normal'}; text-align: ${p.textStyle?.textAlign || 'left'}; line-height: ${p.textStyle?.lineHeight || 1.5};">${p.text || '文本内容'}</span>`
      break
    case 'image':
      content = `<img src="${p.imageStyle?.src || ''}" alt="${p.imageStyle?.alt || ''}" style="width: 100%; height: 100%; object-fit: ${p.imageStyle?.objectFit || 'cover'};">`
      break
    case 'button':
      content = `<el-button type="${p.buttonStyle?.type || 'primary'}" size="${p.buttonStyle?.size || 'default'}" ${p.buttonStyle?.plain ? 'plain' : ''} ${p.buttonStyle?.round ? 'round' : ''}>${p.text || '按钮'}</el-button>`
      break
    case 'input':
      content = `<el-input placeholder="${p.inputStyle?.placeholder || '请输入'}" ${p.inputStyle?.disabled ? 'disabled' : ''} ${p.inputStyle?.clearable ? 'clearable' : ''} ${p.inputStyle?.maxlength ? `maxlength="${p.inputStyle.maxlength}"` : ''}></el-input>`
      break
    case 'textarea':
      content = `<el-input type="textarea" placeholder="${p.inputStyle?.placeholder || '请输入内容'}" ${p.inputStyle?.disabled ? 'disabled' : ''} ${p.inputStyle?.maxlength ? `maxlength="${p.inputStyle.maxlength}"` : ''}></el-input>`
      break
    case 'select':
      content = `<el-select placeholder="${p.props?.placeholder || '请选择'}" ${p.props?.disabled ? 'disabled' : ''} ${p.props?.clearable ? 'clearable' : ''} ${p.props?.multiple ? 'multiple' : ''}>
${(p.props?.options || []).map((o: any) => `        <el-option label="${o.label}" value="${o.value}"></el-option>`).join('\n')}
      </el-select>`
      break
    case 'checkbox':
      content = `<el-checkbox ${p.props?.checked ? 'v-model="true"' : ''} ${p.props?.disabled ? 'disabled' : ''}>${p.props?.label || '选项'}</el-checkbox>`
      break
    case 'radio':
      content = `<el-radio-group>
${(p.props?.options || [{ label: '选项一', value: '1' }, { label: '选项二', value: '2' }]).map((o: any) => `        <el-radio value="${o.value}">${o.label}</el-radio>`).join('\n')}
      </el-radio-group>`
      break
    case 'switch':
      content = `<el-switch ${p.props?.disabled ? 'disabled' : ''} ${p.props?.activeText ? `active-text="${p.props.activeText}"` : ''} ${p.props?.inactiveText ? `inactive-text="${p.props.inactiveText}"` : ''}></el-switch>`
      break
    case 'datePicker':
      content = `<el-date-picker type="${p.props?.dateType || 'date'}" placeholder="${p.props?.placeholder || '选择日期'}" ${p.props?.disabled ? 'disabled' : ''} style="width: 100%"></el-date-picker>`
      break
    case 'chart':
      content = `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #999; font-size: 14px;">图表组件（需引入 ECharts）</div>`
      break
    case 'table':
      content = `<el-table :data='${JSON.stringify(p.data || [])}' ${p.stripe ? 'stripe' : ''} ${p.border ? 'border' : ''} size="${p.size || 'default'}" style="width: 100%">
${(p.columns || []).map((c: any) => `        <el-table-column prop="${c.prop}" label="${c.label}"></el-table-column>`).join('\n')}
      </el-table>`
      break
    case 'link':
      content = `<a href="${p.linkStyle?.href || '#'}" target="${p.linkStyle?.target || '_blank'}" style="color: ${p.linkStyle?.color || '#409eff'}; font-size: ${p.linkStyle?.fontSize || 14}px; font-weight: ${p.linkStyle?.fontWeight || 'normal'}; text-decoration: ${p.linkStyle?.underline !== false ? 'underline' : 'none'};">${p.text || '链接文字'}</a>`
      break
    case 'container':
      if (component.children && component.children.length > 0) {
        const dir = p.props?.direction || 'column'
        const gap = p.props?.gap || 8
        const padding = p.props?.padding || 16
        const justify = p.props?.justify || 'flex-start'
        const align = p.props?.align || 'flex-start'
        content = `<div style="display: flex; flex-direction: ${dir}; gap: ${gap}px; padding: ${padding}px; justify-content: ${justify}; align-items: ${align}; width: 100%; height: 100%;">
${component.children.map(child => generateComponentHTML(child, options, indent + '  ')).join('\n')}
${indent}</div>`
      } else {
        content = `<div style="width: 100%; height: 100%;"></div>`
      }
      break
    case 'grid':
      if (component.children && component.children.length > 0) {
        const cols = p.props?.columns || 2
        const rowGap = p.props?.rowGap || 16
        const colGap = p.props?.colGap || 16
        const padding = p.props?.padding || 16
        content = `<div style="display: grid; grid-template-columns: repeat(${cols}, 1fr); row-gap: ${rowGap}px; column-gap: ${colGap}px; padding: ${padding}px; width: 100%; height: 100%;">
${component.children.map(child => generateComponentHTML(child, options, indent + '  ')).join('\n')}
${indent}</div>`
      } else {
        content = `<div style="width: 100%; height: 100%;"></div>`
      }
      break
    default:
      content = `<div>${component.name || component.type}</div>`
  }

  if (component.type === 'container' || component.type === 'grid') {
    return `${indent}<div${styleStr}${inlineStyle}>
${indent}  ${content}
${indent}</div>`
  }

  return `${indent}<div${styleStr}${inlineStyle}>
${indent}  ${content}
${indent}</div>`
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
    .map(comp => generateComponentVue(comp, options, '    '))
    .join('\n')

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

function generateComponentVue(component: SchemaComponent, options: CodeGeneratorOptions, indent: string): string {
  const styleBinding = `:style="{
      position: 'absolute',
      left: \`${component.style.x}px\`,
      top: \`${component.style.y}px\`,
      width: \`${component.style.width}px\`,
      height: \`${component.style.height}px\`,
      ${component.style.rotate ? `transform: \`rotate(${component.style.rotate}deg)\`,` : ''}
      zIndex: ${component.style.zIndex}
    }"`

  const p = component.props || {} as any
  let content = ''

  switch (component.type) {
    case 'text':
      content = `<span style="font-size: ${p.textStyle?.fontSize || 14}px; color: ${p.textStyle?.color || '#333'};">${p.text || '文本内容'}</span>`
      break
    case 'image':
      content = `<img src="${p.imageStyle?.src || ''}" alt="${p.imageStyle?.alt || ''}" style="width: 100%; height: 100%; object-fit: cover;" />`
      break
    case 'button':
      content = `<el-button type="${p.buttonStyle?.type || 'primary'}" size="${p.buttonStyle?.size || 'default'}">${p.text || '按钮'}</el-button>`
      break
    case 'input':
      content = `<el-input placeholder="${p.inputStyle?.placeholder || '请输入'}" />`
      break
    case 'textarea':
      content = `<el-input type="textarea" placeholder="${p.inputStyle?.placeholder || '请输入内容'}" />`
      break
    case 'select':
      content = `<el-select placeholder="${p.props?.placeholder || '请选择'}">
${(p.props?.options || []).map((o: any) => `          <el-option label="${o.label}" value="${o.value}" />`).join('\n')}
        </el-select>`
      break
    case 'checkbox':
      content = `<el-checkbox>${p.props?.label || '选项'}</el-checkbox>`
      break
    case 'radio':
      content = `<el-radio-group>
${(p.props?.options || [{ label: '选项一', value: '1' }, { label: '选项二', value: '2' }]).map((o: any) => `          <el-radio value="${o.value}">${o.label}</el-radio>`).join('\n')}
        </el-radio-group>`
      break
    case 'switch':
      content = `<el-switch />`
      break
    case 'datePicker':
      content = `<el-date-picker placeholder="${p.props?.placeholder || '选择日期'}" style="width: 100%" />`
      break
    case 'chart':
      content = `<div style="width: 100%; height: 100%;">图表组件</div>`
      break
    case 'table':
      content = `<el-table :data='${JSON.stringify(p.data || [])}' style="width: 100%">
${(p.columns || []).map((c: any) => `          <el-table-column prop="${c.prop}" label="${c.label}" />`).join('\n')}
        </el-table>`
      break
    case 'link':
      content = `<a href="${p.linkStyle?.href || '#'}" target="${p.linkStyle?.target || '_blank'}" style="color: ${p.linkStyle?.color || '#409eff'}; font-size: ${p.linkStyle?.fontSize || 14}px; font-weight: ${p.linkStyle?.fontWeight || 'normal'}; text-decoration: ${p.linkStyle?.underline !== false ? 'underline' : 'none'};">${p.text || '链接文字'}</a>`
      break
    case 'container':
      if (component.children && component.children.length > 0) {
        const dir = p.props?.direction || 'column'
        const gap = p.props?.gap || 8
        const padding = p.props?.padding || 16
        content = `<div style="display: flex; flex-direction: ${dir}; gap: ${gap}px; padding: ${padding}px; width: 100%; height: 100%;">
${component.children.map(child => generateComponentVue(child, options, indent + '    ')).join('\n')}
${indent}    </div>`
      } else {
        content = `<div style="width: 100%; height: 100%;"></div>`
      }
      break
    case 'grid':
      if (component.children && component.children.length > 0) {
        const cols = p.props?.columns || 2
        const rowGap = p.props?.rowGap || 16
        const colGap = p.props?.colGap || 16
        const padding = p.props?.padding || 16
        content = `<div style="display: grid; grid-template-columns: repeat(${cols}, 1fr); row-gap: ${rowGap}px; column-gap: ${colGap}px; padding: ${padding}px; width: 100%; height: 100%;">
${component.children.map(child => generateComponentVue(child, options, indent + '    ')).join('\n')}
${indent}    </div>`
      } else {
        content = `<div style="width: 100%; height: 100%;"></div>`
      }
      break
    default:
      content = `<div>${component.name || component.type}</div>`
  }

  return `${indent}<div ${styleBinding}>
${indent}  ${content}
${indent}</div>`
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
