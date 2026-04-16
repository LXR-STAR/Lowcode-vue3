import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { EditorComponent, ComponentType, ComponentStyle, ComponentProps } from '@/types'
import { v4 as uuidv4 } from 'uuid'
import { DEFAULT_COMPONENT_STYLE } from '@/types'

export const useComponentStore = defineStore('component', () => {
  const components = ref<EditorComponent[]>([])
  const selectedComponentIds = ref<string[]>([])
  const copiedComponents = ref<EditorComponent[]>([])

  const selectedComponents = computed(() =>
    components.value.filter(c => selectedComponentIds.value.includes(c.id))
  )

  const sortedComponents = computed(() =>
    [...components.value].sort((a, b) => a.style.zIndex - b.style.zIndex)
  )

  function createComponent(
    type: ComponentType,
    style: Partial<ComponentStyle> = {},
    props: Partial<ComponentProps> = {},
    x: number = 0,
    y: number = 0
  ): EditorComponent {
    const id = uuidv4()
    const componentNames: Record<ComponentType, string> = {
      text: '文本组件',
      image: '图片组件',
      button: '按钮组件',
      input: '输入框组件',
      textarea: '多行文本',
      select: '下拉选择',
      checkbox: '复选框',
      radio: '单选框',
      container: '容器组件',
      chart: '图表组件',
      table: '表格组件'
    }

    return {
      id,
      name: `${componentNames[type]}_${id.slice(0, 4)}`,
      type,
      style: {
        ...DEFAULT_COMPONENT_STYLE,
        ...style,
        x,
        y,
        zIndex: components.value.length + 1
      },
      props: getDefaultProps(type, props),
      locked: false,
      visible: true
    }
  }

  function getDefaultProps(type: ComponentType, customProps: Partial<ComponentProps> = {}): ComponentProps {
    const defaultProps: Record<ComponentType, ComponentProps> = {
      text: {
        text: '请输入文本内容',
        textStyle: {
          fontSize: 14,
          fontFamily: 'Arial, sans-serif',
          fontWeight: 'normal',
          fontStyle: 'normal',
          textDecoration: 'none',
          lineHeight: 1.5,
          textAlign: 'left',
          color: '#333333'
        }
      },
      image: {
        imageStyle: {
          objectFit: 'cover',
          src: '',
          alt: '图片'
        }
      },
      button: {
        text: '按钮',
        buttonStyle: {
          type: 'primary',
          size: 'default',
          plain: false,
          round: false,
          circle: false
        }
      },
      input: {
        inputStyle: {
          placeholder: '请输入',
          type: 'text',
          maxlength: 100,
          disabled: false,
          clearable: true
        }
      },
      textarea: {
        text: '',
        inputStyle: {
          placeholder: '请输入内容',
          type: 'text',
          maxlength: 500,
          disabled: false,
          clearable: true
        }
      },
      select: {
        text: '下拉选择',
        props: { options: [] }
      },
      checkbox: {
        text: '复选框',
        props: { checked: false }
      },
      radio: {
        text: '单选框',
        props: { checked: false }
      },
      container: {
        props: {}
      },
      chart: {
        chartStyle: {
          chartType: 'bar',
          option: {}
        }
      },
      table: {
        props: {
          columns: [],
          data: []
        }
      }
    }

    return { ...defaultProps[type], ...customProps }
  }

  function addComponent(component: EditorComponent) {
    components.value.push(component)
  }

  function removeComponent(id: string) {
    const index = components.value.findIndex(c => c.id === id)
    if (index > -1) {
      components.value.splice(index, 1)
    }
    selectedComponentIds.value = selectedComponentIds.value.filter(cid => cid !== id)
  }

  function removeSelectedComponents() {
    selectedComponentIds.value.forEach(id => {
      const index = components.value.findIndex(c => c.id === id)
      if (index > -1) {
        components.value.splice(index, 1)
      }
    })
    selectedComponentIds.value = []
  }

  function updateComponent(id: string, updates: Partial<EditorComponent>) {
    const component = components.value.find(c => c.id === id)
    if (component) {
      Object.assign(component, updates)
    }
  }

  function updateComponentStyle(id: string, styleUpdates: Partial<ComponentStyle>) {
    const component = components.value.find(c => c.id === id)
    if (component) {
      component.style = { ...component.style, ...styleUpdates }
    }
  }

  function updateComponentProps(id: string, propsUpdates: Partial<ComponentProps>) {
    const component = components.value.find(c => c.id === id)
    if (component) {
      component.props = { ...component.props, ...propsUpdates }
    }
  }

  function selectComponent(id: string, multiple: boolean = false) {
    if (multiple) {
      const index = selectedComponentIds.value.indexOf(id)
      if (index > -1) {
        selectedComponentIds.value.splice(index, 1)
      } else {
        selectedComponentIds.value.push(id)
      }
    } else {
      selectedComponentIds.value = [id]
    }
  }

  function clearSelection() {
    selectedComponentIds.value = []
  }

  function selectAll() {
    selectedComponentIds.value = components.value.map(c => c.id)
  }

  function copySelectedComponents() {
    copiedComponents.value = selectedComponents.value.map(c => ({ ...c, id: uuidv4() }))
  }

  function pasteComponents() {
    copiedComponents.value.forEach(component => {
      const newComponent = {
        ...component,
        id: uuidv4(),
        style: {
          ...component.style,
          x: component.style.x + 20,
          y: component.style.y + 20
        }
      }
      addComponent(newComponent)
    })
  }

  function moveLayer(id: string, direction: 'up' | 'down' | 'top' | 'bottom') {
    const component = components.value.find(c => c.id === id)
    if (!component) return

    const sortedByZ = [...components.value].sort((a, b) => a.style.zIndex - b.style.zIndex)
    const currentIndex = sortedByZ.findIndex(c => c.id === id)

    switch (direction) {
      case 'up':
        if (currentIndex < sortedByZ.length - 1) {
          const nextComponent = sortedByZ[currentIndex + 1]
          const tempZ = component.style.zIndex
          component.style.zIndex = nextComponent.style.zIndex
          nextComponent.style.zIndex = tempZ
        }
        break
      case 'down':
        if (currentIndex > 0) {
          const prevComponent = sortedByZ[currentIndex - 1]
          const tempZ = component.style.zIndex
          component.style.zIndex = prevComponent.style.zIndex
          prevComponent.style.zIndex = tempZ
        }
        break
      case 'top':
        component.style.zIndex = Math.max(...components.value.map(c => c.style.zIndex)) + 1
        break
      case 'bottom':
        component.style.zIndex = Math.min(...components.value.map(c => c.style.zIndex)) - 1
        break
    }
  }

  function getComponentsSnapshot(): EditorComponent[] {
    return JSON.parse(JSON.stringify(components.value))
  }

  function restoreFromSnapshot(snapshot: EditorComponent[]) {
    components.value = JSON.parse(JSON.stringify(snapshot))
  }

  function exportToJSON(): string {
    return JSON.stringify({
      components: components.value,
      version: '1.0.0'
    }, null, 2)
  }

  function importFromJSON(json: string) {
    try {
      const data = JSON.parse(json)
      if (data.components && Array.isArray(data.components)) {
        components.value = data.components
      }
    } catch (e) {
      console.error('导入JSON失败:', e)
    }
  }

  function clearAll() {
    components.value = []
    selectedComponentIds.value = []
    copiedComponents.value = []
  }

  function rotateComponent(id: string, angle: number) {
    const component = components.value.find(c => c.id === id)
    if (component) {
      component.style.rotate = (component.style.rotate + angle) % 360
    }
  }

  function setComponentRotation(id: string, angle: number) {
    const component = components.value.find(c => c.id === id)
    if (component) {
      component.style.rotate = angle % 360
    }
  }

  function groupComponents(ids: string[]) {
    if (ids.length < 2) return

    const selectedComps = components.value.filter(c => ids.includes(c.id))
    if (selectedComps.length < 2) return

    const minX = Math.min(...selectedComps.map(c => c.style.x))
    const minY = Math.min(...selectedComps.map(c => c.style.y))
    const maxX = Math.max(...selectedComps.map(c => c.style.x + c.style.width))
    const maxY = Math.max(...selectedComps.map(c => c.style.y + c.style.height))

    const groupId = uuidv4()
    const group: EditorComponent = {
      id: groupId,
      name: `组合_${groupId.slice(0, 4)}`,
      type: 'container',
      style: {
        ...DEFAULT_COMPONENT_STYLE,
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
        zIndex: Math.max(...selectedComps.map(c => c.style.zIndex)) + 1,
        backgroundColor: 'transparent',
        borderWidth: 0
      },
      props: {},
      children: selectedComps.map(c => ({
        ...c,
        style: {
          ...c.style,
          x: c.style.x - minX,
          y: c.style.y - minY
        },
        parentId: groupId
      })),
      locked: false,
      visible: true
    }

    selectedComps.forEach(c => {
      const index = components.value.findIndex(comp => comp.id === c.id)
      if (index > -1) {
        components.value.splice(index, 1)
      }
    })

    components.value.push(group)
    selectedComponentIds.value = [groupId]
  }

  function ungroupComponent(id: string) {
    const group = components.value.find(c => c.id === id)
    if (!group || !group.children || group.children.length === 0) return

    const children = group.children.map(c => ({
      ...c,
      style: {
        ...c.style,
        x: c.style.x + group.style.x,
        y: c.style.y + group.style.y
      },
      parentId: undefined
    }))

    const groupIndex = components.value.findIndex(c => c.id === id)
    if (groupIndex > -1) {
      components.value.splice(groupIndex, 1)
    }

    children.forEach(c => {
      components.value.push(c)
    })

    selectedComponentIds.value = children.map(c => c.id)
  }

  function isGroup(id: string): boolean {
    const component = components.value.find(c => c.id === id)
    return !!(component && component.children && component.children.length > 0)
  }

  return {
    components,
    selectedComponentIds,
    copiedComponents,
    selectedComponents,
    sortedComponents,
    createComponent,
    addComponent,
    removeComponent,
    removeSelectedComponents,
    updateComponent,
    updateComponentStyle,
    updateComponentProps,
    selectComponent,
    clearSelection,
    selectAll,
    copySelectedComponents,
    pasteComponents,
    moveLayer,
    getComponentsSnapshot,
    restoreFromSnapshot,
    exportToJSON,
    importFromJSON,
    clearAll,
    rotateComponent,
    setComponentRotation,
    groupComponents,
    ungroupComponent,
    isGroup
  }
})
