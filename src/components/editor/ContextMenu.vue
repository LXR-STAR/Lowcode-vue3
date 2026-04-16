<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useComponentStore, useHistoryStore } from '@/stores'

const props = defineProps<{
  componentId: string
}>()

const componentStore = useComponentStore()
const historyStore = useHistoryStore()

const visible = ref(false)
const position = ref({ x: 0, y: 0 })

const component = computed(() =>
  componentStore.components.find(c => c.id === props.componentId)
)

const isGroupComponent = computed(() =>
  componentStore.isGroup(props.componentId)
)

const canGroup = computed(() =>
  componentStore.selectedComponentIds.length >= 2
)

const menuItems = computed(() => {
  const items = [
    { label: '复制', icon: 'CopyDocument', shortcut: 'Ctrl+C', action: handleCopy, divider: false },
    { label: '粘贴', icon: 'DocumentCopy', shortcut: 'Ctrl+V', action: handlePaste, divider: true }
  ]

  if (canGroup.value && componentStore.selectedComponentIds.includes(props.componentId)) {
    items.push({ label: '组合', icon: 'Connection', shortcut: 'Ctrl+G', action: handleGroup, divider: false })
  }

  if (isGroupComponent.value) {
    items.push({ label: '取消组合', icon: 'SwitchButton', shortcut: 'Ctrl+Shift+G', action: handleUngroup, divider: false })
  }

  items.push({ label: '锁定', icon: 'Lock', action: handleToggleLock, divider: true })
  items.push({ label: component.value?.visible ? '隐藏' : '显示', icon: component.value?.visible ? 'Hide' : 'View', action: handleToggleVisibility, divider: false })
  items.push({ label: '置顶', icon: 'Top', action: () => handleLayerAction('top'), divider: true })
  items.push({ label: '置底', icon: 'Bottom', action: () => handleLayerAction('bottom'), divider: false })
  items.push({ label: '上移一层', icon: 'ArrowUp', action: () => handleLayerAction('up'), divider: false })
  items.push({ label: '下移一层', icon: 'ArrowDown', action: () => handleLayerAction('down'), divider: true })
  items.push({ label: '旋转 90°', icon: 'RefreshRight', action: handleRotate90, divider: false })
  items.push({ label: '删除', icon: 'Delete', shortcut: 'Delete', action: handleDelete, danger: true, divider: false })

  return items
})

function show(x: number, y: number) {
  position.value = { x, y }
  visible.value = true
}

function hide() {
  visible.value = false
}

function handleCopy() {
  componentStore.copySelectedComponents()
  hide()
}

function handlePaste() {
  componentStore.pasteComponents()
  historyStore.saveSnapshot()
  hide()
}

function handleGroup() {
  componentStore.groupComponents(componentStore.selectedComponentIds)
  historyStore.saveSnapshot()
  hide()
}

function handleUngroup() {
  componentStore.ungroupComponent(props.componentId)
  historyStore.saveSnapshot()
  hide()
}

function handleToggleLock() {
  if (component.value) {
    componentStore.updateComponent(props.componentId, { locked: !component.value.locked })
    historyStore.saveSnapshot()
  }
  hide()
}

function handleToggleVisibility() {
  if (component.value) {
    componentStore.updateComponent(props.componentId, { visible: !component.value.visible })
  }
  hide()
}

function handleLayerAction(action: 'up' | 'down' | 'top' | 'bottom') {
  componentStore.moveLayer(props.componentId, action)
  historyStore.saveSnapshot()
  hide()
}

function handleRotate90() {
  componentStore.rotateComponent(props.componentId, 90)
  historyStore.saveSnapshot()
  hide()
}

function handleDelete() {
  componentStore.removeComponent(props.componentId)
  historyStore.saveSnapshot()
  hide()
}

function handleClickOutside(e: MouseEvent) {
  if (visible.value) {
    hide()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

defineExpose({ show, hide })
</script>

<template>
  <Teleport to="body">
    <Transition name="context-menu">
      <div
        v-if="visible"
        class="context-menu"
        :style="{ left: `${position.x}px`, top: `${position.y}px` }"
        @click.stop
      >
        <template v-for="(item, index) in menuItems" :key="index">
          <div v-if="item.divider && index > 0" class="menu-divider" />
          <div
            class="menu-item"
            :class="{ danger: item.danger }"
            @click="item.action"
          >
            <el-icon class="menu-icon">
              <component :is="item.icon" />
            </el-icon>
            <span class="menu-label">{{ item.label }}</span>
            <span v-if="item.shortcut" class="menu-shortcut">{{ item.shortcut }}</span>
          </div>
        </template>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.context-menu {
  position: fixed;
  min-width: 180px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  padding: 4px 0;
  z-index: 10000;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: #f5f7fa;
  }

  &.danger {
    color: #f56c6c;

    &:hover {
      background: #fef0f0;
    }
  }

  .menu-icon {
    margin-right: 8px;
    font-size: 14px;
    color: #909399;
  }

  .menu-label {
    flex: 1;
    font-size: 13px;
  }

  .menu-shortcut {
    font-size: 11px;
    color: #c0c4cc;
    margin-left: 16px;
  }
}

.menu-divider {
  height: 1px;
  background: #e4e7ed;
  margin: 4px 0;
}

.context-menu-enter-active,
.context-menu-leave-active {
  transition: opacity 0.15s, transform 0.15s;
}

.context-menu-enter-from,
.context-menu-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
