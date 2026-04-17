import { defineStore } from 'pinia'
import { ref, shallowRef, computed, triggerRef } from 'vue'
import type { EditorComponent, ComponentType, ComponentStyle, ComponentProps } from '@/types'
import { v4 as uuidv4 } from 'uuid'
import { DEFAULT_COMPONENT_STYLE } from '@/types'

export const useComponentStore = defineStore('component', () => {
  const components = shallowRef<EditorComponent[]>([])
  const selectedComponentIds = ref<string[]>([])
  const copiedComponents = shallowRef<EditorComponent[]>([])

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
      switch: '开关',
      datePicker: '日期选择',
      container: '弹性容器',
      grid: '栅格布局',
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
      switch: {
        props: {
          value: false,
          disabled: false,
          activeText: '',
          inactiveText: ''
        }
      },
      datePicker: {
        props: {
          placeholder: '选择日期',
          dateType: 'date',
          disabled: false
        }
      },
      container: {
        props: {}
      },
      grid: {
        props: {
          columns: 2,
          rowGap: 16,
          colGap: 16,
          padding: 16,
          autoExpand: true,
          showBorder: true
        }
      },
      chart: {
        chartStyle: {
          chartType: 'bar',
          option: {}
        }
      },
      table: {
        columns: [],
        data: [],
        stripe: true,
        border: true,
        size: 'default'
      }
    }

    return { ...defaultProps[type], ...customProps }
  }

  function addComponent(component: EditorComponent) {
    components.value = [...components.value, component]
  }

  function removeComponent(id: string) {
    for (let i = 0; i < components.value.length; i++) {
      const comp = components.value[i]
      if (comp.id === id) {
        components.value = components.value.filter(c => c.id !== id)
        selectedComponentIds.value = selectedComponentIds.value.filter(cid => cid !== id)
        return
      }
      if (comp.children) {
        const childIndex = comp.children.findIndex(c => c.id === id)
        if (childIndex > -1) {
          comp.children = comp.children.filter(c => c.id !== id)
          triggerRef(components)
          selectedComponentIds.value = selectedComponentIds.value.filter(cid => cid !== id)
          return
        }
      }
    }
  }

  function removeSelectedComponents() {
    selectedComponentIds.value.forEach(id => {
      removeComponent(id)
    })
    selectedComponentIds.value = []
  }

  function updateComponent(id: string, updates: Partial<EditorComponent>) {
    const index = components.value.findIndex(c => c.id === id)
    if (index > -1) {
      components.value = [
        ...components.value.slice(0, index),
        { ...components.value[index], ...updates },
        ...components.value.slice(index + 1)
      ]
    }
  }

  function updateComponentStyle(id: string, styleUpdates: Partial<ComponentStyle>) {
    for (let i = 0; i < components.value.length; i++) {
      const comp = components.value[i]
      if (comp.id === id) {
        components.value = [
          ...components.value.slice(0, i),
          { ...comp, style: { ...comp.style, ...styleUpdates } },
          ...components.value.slice(i + 1)
        ]
        return
      }
      if (comp.children) {
        const childIndex = comp.children.findIndex(c => c.id === id)
        if (childIndex > -1) {
          const newChildren = [...comp.children]
          newChildren[childIndex] = {
            ...newChildren[childIndex],
            style: { ...newChildren[childIndex].style, ...styleUpdates }
          }
          components.value = [
            ...components.value.slice(0, i),
            { ...comp, children: newChildren },
            ...components.value.slice(i + 1)
          ]
          return
        }
      }
    }
  }

  function updateComponentProps(id: string, propsUpdates: Partial<ComponentProps>) {
    for (let i = 0; i < components.value.length; i++) {
      const comp = components.value[i]
      if (comp.id === id) {
        components.value = [
          ...components.value.slice(0, i),
          { ...comp, props: { ...comp.props, ...propsUpdates } },
          ...components.value.slice(i + 1)
        ]
        return
      }
      if (comp.children) {
        const childIndex = comp.children.findIndex(c => c.id === id)
        if (childIndex > -1) {
          const newChildren = [...comp.children]
          newChildren[childIndex] = {
            ...newChildren[childIndex],
            props: { ...newChildren[childIndex].props, ...propsUpdates }
          }
          components.value = [
            ...components.value.slice(0, i),
            { ...comp, children: newChildren },
            ...components.value.slice(i + 1)
          ]
          return
        }
      }
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
    const newComponents = copiedComponents.value.map(component => ({
      ...component,
      id: uuidv4(),
      style: {
        ...component.style,
        x: component.style.x + 20,
        y: component.style.y + 20
      }
    }))
    components.value = [...components.value, ...newComponents]
  }

  function moveLayer(id: string, direction: 'up' | 'down' | 'top' | 'bottom') {
    const componentIndex = components.value.findIndex(c => c.id === id)
    if (componentIndex === -1) return

    const component = components.value[componentIndex]
    const sortedByZ = [...components.value].sort((a, b) => a.style.zIndex - b.style.zIndex)
    const currentIndex = sortedByZ.findIndex(c => c.id === id)

    let newZIndex = component.style.zIndex

    switch (direction) {
      case 'up':
        if (currentIndex < sortedByZ.length - 1) {
          const nextComponent = sortedByZ[currentIndex + 1]
          newZIndex = nextComponent.style.zIndex + 1
        }
        break
      case 'down':
        if (currentIndex > 0) {
          const prevComponent = sortedByZ[currentIndex - 1]
          newZIndex = prevComponent.style.zIndex - 1
        }
        break
      case 'top':
        newZIndex = Math.max(...components.value.map(c => c.style.zIndex)) + 1
        break
      case 'bottom':
        newZIndex = Math.min(...components.value.map(c => c.style.zIndex)) - 1
        break
    }

    components.value = [
      ...components.value.slice(0, componentIndex),
      { ...component, style: { ...component.style, zIndex: newZIndex } },
      ...components.value.slice(componentIndex + 1)
    ]
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
    const index = components.value.findIndex(c => c.id === id)
    if (index > -1) {
      const component = components.value[index]
      components.value = [
        ...components.value.slice(0, index),
        {
          ...component,
          style: {
            ...component.style,
            rotate: ((component.style.rotate || 0) + angle) % 360
          }
        },
        ...components.value.slice(index + 1)
      ]
    }
  }

  function setComponentRotation(id: string, angle: number) {
    const index = components.value.findIndex(c => c.id === id)
    if (index > -1) {
      const component = components.value[index]
      components.value = [
        ...components.value.slice(0, index),
        {
          ...component,
          style: {
            ...component.style,
            rotate: angle % 360
          }
        },
        ...components.value.slice(index + 1)
      ]
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

    const remainingComponents = components.value.filter(c => !ids.includes(c.id))
    components.value = [...remainingComponents, group]
    selectedComponentIds.value = [groupId]
  }

  function ungroupComponent(id: string) {
    const groupIndex = components.value.findIndex(c => c.id === id)
    if (groupIndex === -1) return

    const group = components.value[groupIndex]
    if (!group.children || group.children.length === 0) return

    const children = group.children.map(c => ({
      ...c,
      style: {
        ...c.style,
        x: c.style.x + group.style.x,
        y: c.style.y + group.style.y
      },
      parentId: undefined
    }))

    components.value = [
      ...components.value.slice(0, groupIndex),
      ...components.value.slice(groupIndex + 1),
      ...children
    ]

    selectedComponentIds.value = children.map(c => c.id)
  }

  function isGroup(id: string): boolean {
    const component = components.value.find(c => c.id === id)
    return !!(component && component.children && component.children.length > 0)
  }

  function getRootComponents(): EditorComponent[] {
    return components.value.filter(c => !c.parentId)
  }

  function findContainerAtPosition(x: number, y: number, excludeId?: string): EditorComponent | null {
    const containers = components.value.filter(c =>
      (c.type === 'container' || c.type === 'grid') &&
      c.id !== excludeId &&
      c.visible !== false
    )

    for (const container of containers) {
      const { x: cx, y: cy, width, height } = container.style
      if (x >= cx && x <= cx + width && y >= cy && y <= cy + height) {
        return container
      }
    }
    return null
  }

  function addChildToContainer(containerId: string, child: EditorComponent) {
    const containerIndex = components.value.findIndex(c => c.id === containerId)
    if (containerIndex === -1) return

    const container = components.value[containerIndex]
    const newChild = {
      ...child,
      parentId: containerId,
      style: {
        ...child.style,
        x: child.style.x - container.style.x,
        y: child.style.y - container.style.y
      }
    }

    const newChildren = container.children ? [...container.children, newChild] : [newChild]

    const remainingComponents = components.value.filter(c => c.id !== child.id && c.id !== containerId)

    components.value = [
      ...remainingComponents,
      { ...container, children: newChildren }
    ]
  }

  function removeChildFromContainer(containerId: string, childId: string, targetX?: number, targetY?: number) {
    const containerIndex = components.value.findIndex(c => c.id === containerId)
    if (containerIndex === -1) return

    const container = components.value[containerIndex]
    if (!container.children) return

    const childIndex = container.children.findIndex(c => c.id === childId)
    if (childIndex === -1) return

    const child = { ...container.children[childIndex], parentId: undefined }

    if (targetX !== undefined && targetY !== undefined) {
      child.style = { ...child.style, x: targetX, y: targetY }
    } else {
      child.style = {
        ...child.style,
        x: child.style.x + container.style.x,
        y: child.style.y + container.style.y
      }
    }

    const newChildren = container.children.filter(c => c.id !== childId)

    components.value = [
      ...components.value.slice(0, containerIndex),
      { ...container, children: newChildren },
      ...components.value.slice(containerIndex + 1),
      child
    ]
  }

  function getComponentById(id: string): EditorComponent | undefined {
    for (const comp of components.value) {
      if (comp.id === id) return comp
      if (comp.children) {
        const found = comp.children.find(c => c.id === id)
        if (found) return found
      }
    }
    return undefined
  }

  function updateChildInContainer(containerId: string, childId: string, updates: Partial<EditorComponent>) {
    const containerIndex = components.value.findIndex(c => c.id === containerId)
    if (containerIndex === -1) return

    const container = components.value[containerIndex]
    if (!container.children) return

    const childIndex = container.children.findIndex(c => c.id === childId)
    if (childIndex === -1) return

    const newChildren = [...container.children]
    newChildren[childIndex] = { ...newChildren[childIndex], ...updates }

    components.value = [
      ...components.value.slice(0, containerIndex),
      { ...container, children: newChildren },
      ...components.value.slice(containerIndex + 1)
    ]
  }

  function setComponents(newComponents: EditorComponent[]) {
    components.value = newComponents
    selectedComponentIds.value = []
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
    isGroup,
    getRootComponents,
    findContainerAtPosition,
    addChildToContainer,
    removeChildFromContainer,
    getComponentById,
    updateChildInContainer,
    setComponents
  }
})
