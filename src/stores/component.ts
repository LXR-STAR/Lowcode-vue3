import { defineStore } from 'pinia'
import { ref, shallowRef, computed, triggerRef } from 'vue'
import type { EditorComponent, ComponentType, ComponentStyle, ComponentProps } from '@/types'
import { v4 as uuidv4 } from 'uuid'
import { DEFAULT_COMPONENT_STYLE } from '@/types'

function findComponentDeep(components: EditorComponent[], id: string): EditorComponent | undefined {
  for (const comp of components) {
    if (comp.id === id) return comp
    if (comp.children) {
      const found = findComponentDeep(comp.children, id)
      if (found) return found
    }
  }
  return undefined
}

function updateComponentDeep<T extends Partial<EditorComponent>>(
  components: EditorComponent[],
  id: string,
  updater: (comp: EditorComponent) => EditorComponent
): EditorComponent[] {
  return components.map(comp => {
    if (comp.id === id) return updater(comp)
    if (comp.children) {
      return { ...comp, children: updateComponentDeep(comp.children, id, updater) }
    }
    return comp
  })
}

function removeComponentDeep(components: EditorComponent[], id: string): EditorComponent[] {
  return components
    .filter(c => c.id !== id)
    .map(comp => {
      if (comp.children) {
        return { ...comp, children: removeComponentDeep(comp.children, id) }
      }
      return comp
    })
}

function collectAllIds(components: EditorComponent[]): string[] {
  const ids: string[] = []
  for (const comp of components) {
    ids.push(comp.id)
    if (comp.children) {
      ids.push(...collectAllIds(comp.children))
    }
  }
  return ids
}

export const useComponentStore = defineStore('component', () => {
  const components = shallowRef<EditorComponent[]>([])
  const selectedComponentIds = ref<string[]>([])
  const copiedComponents = shallowRef<EditorComponent[]>([])

  const selectedComponents = computed(() => {
    const ids = selectedComponentIds.value
    const result: EditorComponent[] = []
    function searchDeep(list: EditorComponent[]) {
      for (const comp of list) {
        if (ids.includes(comp.id)) result.push(comp)
        if (comp.children) searchDeep(comp.children)
      }
    }
    searchDeep(components.value)
    return result
  })

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
      table: '表格组件',
      link: '链接组件'
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
        props: {
          direction: 'column',
          justify: 'flex-start',
          align: 'flex-start',
          gap: 8,
          padding: 16,
          autoExpand: true,
          showBorder: true
        }
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
      },
      link: {
        text: '链接文字',
        linkStyle: {
          href: '#',
          target: '_blank',
          color: '#409eff',
          fontSize: 14,
          fontWeight: 'normal',
          underline: true
        }
      }
    }

    return { ...defaultProps[type], ...customProps }
  }

  function addComponent(component: EditorComponent) {
    components.value = [...components.value, component]
  }

  function removeComponent(id: string) {
    components.value = removeComponentDeep(components.value, id)
    selectedComponentIds.value = selectedComponentIds.value.filter(cid => cid !== id)
  }

  function removeSelectedComponents() {
    selectedComponentIds.value.forEach(id => {
      removeComponent(id)
    })
    selectedComponentIds.value = []
  }

  function updateComponent(id: string, updates: Partial<EditorComponent>) {
    components.value = updateComponentDeep(components.value, id, comp => ({
      ...comp,
      ...updates
    }))
  }

  function updateComponentStyle(id: string, styleUpdates: Partial<ComponentStyle>) {
    components.value = updateComponentDeep(components.value, id, comp => ({
      ...comp,
      style: { ...comp.style, ...styleUpdates }
    }))
  }

  function updateComponentProps(id: string, propsUpdates: Partial<ComponentProps>) {
    components.value = updateComponentDeep(components.value, id, comp => ({
      ...comp,
      props: { ...comp.props, ...propsUpdates }
    }))
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
    selectedComponentIds.value = collectAllIds(components.value)
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
    components.value = updateComponentDeep(components.value, id, comp => ({
      ...comp,
      style: {
        ...comp.style,
        rotate: ((comp.style.rotate || 0) + angle) % 360
      }
    }))
  }

  function setComponentRotation(id: string, angle: number) {
    components.value = updateComponentDeep(components.value, id, comp => ({
      ...comp,
      style: {
        ...comp.style,
        rotate: angle % 360
      }
    }))
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
    const component = getComponentById(id)
    return !!(component && component.children && component.children.length > 0)
  }

  function getRootComponents(): EditorComponent[] {
    return components.value.filter(c => !c.parentId)
  }

  function findContainerAtPosition(x: number, y: number, excludeId?: string): EditorComponent | null {
    function searchDeep(list: EditorComponent[], parentOffsetX: number, parentOffsetY: number): EditorComponent | null {
      let deepest: EditorComponent | null = null

      for (const comp of list) {
        if ((comp.type !== 'container' && comp.type !== 'grid') || comp.id === excludeId || comp.visible === false) {
          continue
        }

        const cx = parentOffsetX + comp.style.x
        const cy = parentOffsetY + comp.style.y
        if (x >= cx && x <= cx + comp.style.width && y >= cy && y <= cy + comp.style.height) {
          deepest = comp
          if (comp.children) {
            const deeper = searchDeep(comp.children, cx, cy)
            if (deeper) deepest = deeper
          }
        }
      }

      return deepest
    }

    return searchDeep(components.value, 0, 0)
  }

  function addChildToContainer(containerId: string, child: EditorComponent) {
    const container = findComponentDeep(components.value, containerId)
    if (!container) return

    const newChild = {
      ...child,
      parentId: containerId,
      style: {
        ...child.style,
        x: 0,
        y: 0
      }
    }

    const newChildren = container.children ? [...container.children, newChild] : [newChild]

    components.value = updateComponentDeep(components.value, containerId, comp => ({
      ...comp,
      children: newChildren
    }))

    components.value = removeComponentDeep(components.value, child.id)
  }

  function removeChildFromContainer(containerId: string, childId: string, targetX?: number, targetY?: number) {
    const container = findComponentDeep(components.value, containerId)
    if (!container || !container.children) return

    const child = container.children.find(c => c.id === childId)
    if (!child) return

    const removedChild = { ...child, parentId: undefined }

    if (targetX !== undefined && targetY !== undefined) {
      removedChild.style = { ...removedChild.style, x: targetX, y: targetY }
    } else {
      const containerAbsX = getAbsolutePosition(containerId).x
      const containerAbsY = getAbsolutePosition(containerId).y
      removedChild.style = {
        ...removedChild.style,
        x: removedChild.style.x + containerAbsX,
        y: removedChild.style.y + containerAbsY
      }
    }

    components.value = updateComponentDeep(components.value, containerId, comp => ({
      ...comp,
      children: comp.children ? comp.children.filter(c => c.id !== childId) : []
    }))

    components.value = [...components.value, removedChild]
  }

  function getAbsolutePosition(id: string): { x: number; y: number } {
    function search(list: EditorComponent[], parentX: number, parentY: number): { x: number; y: number } | null {
      for (const comp of list) {
        if (comp.id === id) {
          return { x: parentX + comp.style.x, y: parentY + comp.style.y }
        }
        if (comp.children) {
          const result = search(comp.children, parentX + comp.style.x, parentY + comp.style.y)
          if (result) return result
        }
      }
      return null
    }
    return search(components.value, 0, 0) || { x: 0, y: 0 }
  }

  function getComponentById(id: string): EditorComponent | undefined {
    return findComponentDeep(components.value, id)
  }

  function updateChildInContainer(containerId: string, childId: string, updates: Partial<EditorComponent>) {
    components.value = updateComponentDeep(components.value, childId, comp => ({
      ...comp,
      ...updates
    }))
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
