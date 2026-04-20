import { v4 as uuidv4 } from 'uuid'
import type { EditorComponent, ComponentType, ComponentStyle, ComponentProps } from '@/types'
import { DEFAULT_COMPONENT_STYLE } from '@/types'

interface RawComponent {
  type: string
  name?: string
  style?: Partial<ComponentStyle>
  props?: Record<string, any>
  children?: RawComponent[]
}

interface RawSchema {
  description?: string
  components: RawComponent[]
}

const COMPONENT_NAMES: Record<string, string> = {
  text: '文本组件',
  image: '图片组件',
  button: '按钮组件',
  input: '输入框组件',
  textarea: '多行文本',
  select: '下拉选择',
  checkbox: '复选框',
  radio: '单选框',
  switch: '开关',
  datePicker: '日期选择',
  container: '弹性容器',
  grid: '栅格布局',
  chart: '图表组件',
  table: '表格组件',
  link: '链接组件'
}

const VALID_TYPES = new Set<string>([
  'text', 'image', 'button', 'input', 'textarea', 'select',
  'checkbox', 'radio', 'switch', 'datePicker', 'container',
  'grid', 'chart', 'table', 'link'
])

function extractJSON(text: string): string {
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim()
  }

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    return jsonMatch[0]
  }

  return text
}

export function parseSchemaResponse(response: string): RawSchema | null {
  try {
    const jsonStr = extractJSON(response)
    const parsed = JSON.parse(jsonStr)

    if (parsed.components && Array.isArray(parsed.components)) {
      return parsed as RawSchema
    }

    if (Array.isArray(parsed)) {
      return { components: parsed }
    }

    return null
  } catch {
    return null
  }
}

function normalizeComponentType(type: string): ComponentType {
  if (VALID_TYPES.has(type)) return type as ComponentType

  const typeMap: Record<string, ComponentType> = {
    '文本': 'text', 'text': 'text',
    '图片': 'image', 'image': 'image',
    '按钮': 'button', 'button': 'button',
    '输入框': 'input', 'input': 'input',
    '多行文本': 'textarea', 'textarea': 'textarea',
    '下拉选择': 'select', 'select': 'select',
    '复选框': 'checkbox', 'checkbox': 'checkbox',
    '单选框': 'radio', 'radio': 'radio',
    '开关': 'switch', 'switch': 'switch',
    '日期选择': 'datePicker', 'datePicker': 'datePicker',
    '容器': 'container', 'container': 'container',
    '弹性容器': 'container',
    '栅格': 'grid', 'grid': 'grid',
    '栅格布局': 'grid',
    '图表': 'chart', 'chart': 'chart',
    '表格': 'table', 'table': 'table',
    '链接': 'link', 'link': 'link'
  }

  return typeMap[type] || 'text'
}

function convertRawComponent(
  raw: RawComponent,
  parentId?: string,
  zIndex: number = 1
): EditorComponent {
  const type = normalizeComponentType(raw.type || 'text')
  const id = uuidv4()
  const isInContainer = !!parentId

  const style: ComponentStyle = {
    ...DEFAULT_COMPONENT_STYLE,
    ...(raw.style || {}),
    x: isInContainer ? 0 : (raw.style?.x ?? 0),
    y: isInContainer ? 0 : (raw.style?.y ?? 0),
    zIndex
  }

  const rawProps = { ...(raw.props || {}) }
  let props: ComponentProps

  if (type === 'container') {
    const containerKeys = ['direction', 'justify', 'align', 'gap', 'padding', 'autoExpand', 'showBorder']
    const containerProps: Record<string, any> = {}
    const otherProps: Record<string, any> = {}
    for (const [key, value] of Object.entries(rawProps)) {
      if (containerKeys.includes(key)) {
        containerProps[key] = value
      } else {
        otherProps[key] = value
      }
    }
    props = { ...otherProps, props: containerProps }
  } else if (type === 'grid') {
    const gridKeys = ['columns', 'rowGap', 'colGap', 'padding', 'autoExpand', 'showBorder']
    const gridProps: Record<string, any> = {}
    const otherProps: Record<string, any> = {}
    for (const [key, value] of Object.entries(rawProps)) {
      if (gridKeys.includes(key)) {
        gridProps[key] = value
      } else {
        otherProps[key] = value
      }
    }
    props = { ...otherProps, props: gridProps }
  } else if (type === 'input' || type === 'textarea') {
    const inputKeys = ['placeholder', 'disabled', 'clearable', 'maxlength', 'showPassword', 'rows', 'type']
    const inputStyleProps: Record<string, any> = {}
    const otherProps: Record<string, any> = {}
    for (const [key, value] of Object.entries(rawProps)) {
      if (inputKeys.includes(key)) {
        inputStyleProps[key] = value
      } else {
        otherProps[key] = value
      }
    }
    props = { ...otherProps, inputStyle: inputStyleProps }
  } else if (type === 'button') {
    const buttonKeys = ['type', 'size', 'plain', 'round', 'circle']
    const buttonStyleProps: Record<string, any> = {}
    const otherProps: Record<string, any> = {}
    for (const [key, value] of Object.entries(rawProps)) {
      if (buttonKeys.includes(key)) {
        buttonStyleProps[key] = value
      } else if (key === 'text') {
        otherProps[key] = value
      } else {
        otherProps[key] = value
      }
    }
    props = { ...otherProps, buttonStyle: buttonStyleProps }
  } else if (type === 'text') {
    const textKeys = ['fontSize', 'fontFamily', 'fontWeight', 'fontStyle', 'textDecoration', 'lineHeight', 'textAlign', 'color']
    const textStyleProps: Record<string, any> = {}
    const otherProps: Record<string, any> = {}
    for (const [key, value] of Object.entries(rawProps)) {
      if (textKeys.includes(key)) {
        textStyleProps[key] = value
      } else {
        otherProps[key] = value
      }
    }
    props = { ...otherProps, textStyle: textStyleProps }
  } else if (type === 'image') {
    const imageKeys = ['src', 'alt', 'objectFit']
    const imageStyleProps: Record<string, any> = {}
    const otherProps: Record<string, any> = {}
    for (const [key, value] of Object.entries(rawProps)) {
      if (imageKeys.includes(key)) {
        imageStyleProps[key] = value
      } else {
        otherProps[key] = value
      }
    }
    props = { ...otherProps, imageStyle: imageStyleProps }
  } else if (type === 'link') {
    const linkKeys = ['href', 'target', 'color', 'fontSize', 'fontWeight', 'underline']
    const linkStyleProps: Record<string, any> = {}
    const otherProps: Record<string, any> = {}
    for (const [key, value] of Object.entries(rawProps)) {
      if (linkKeys.includes(key)) {
        linkStyleProps[key] = value
      } else if (key === 'text') {
        otherProps[key] = value
      } else {
        otherProps[key] = value
      }
    }
    props = { ...otherProps, linkStyle: linkStyleProps }
  } else {
    props = rawProps
  }

  const component: EditorComponent = {
    id,
    name: raw.name || `${COMPONENT_NAMES[type] || type}_${id.slice(0, 4)}`,
    type,
    style,
    props,
    parentId,
    locked: false,
    visible: true
  }

  if ((type === 'container' || type === 'grid') && raw.children?.length) {
    component.children = raw.children.map((child, index) =>
      convertRawComponent(child, id, index + 1)
    )

    if (!raw.style?.height) {
      const direction = raw.props?.direction || 'column'
      const padding = (raw.props?.padding ?? 16) * 2
      const gap = (raw.props?.gap ?? 8)

      if (direction === 'row') {
        const maxChildHeight = Math.max(...component.children.map(c => c.style.height || 40))
        component.style.height = maxChildHeight + padding
      } else {
        const childHeights = component.children.reduce((sum, child) => {
          return sum + (child.style.height || 40)
        }, 0)
        const totalGap = gap * Math.max(0, component.children.length - 1)
        component.style.height = childHeights + padding + totalGap
      }
    }
  }

  return component
}

export function convertSchemaToComponents(schema: RawSchema): EditorComponent[] {
  return schema.components.map((raw, index) =>
    convertRawComponent(raw, undefined, index + 1)
  )
}

export function getDescription(schema: RawSchema): string {
  return schema.description || 'AI 生成的页面'
}
