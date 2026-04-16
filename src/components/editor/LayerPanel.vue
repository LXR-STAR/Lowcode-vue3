<script setup lang="ts">
import { computed } from 'vue'
import { useComponentStore, useHistoryStore } from '@/stores'
import type { EditorComponent } from '@/types'

const componentStore = useComponentStore()
const historyStore = useHistoryStore()

const sortedComponents = computed(() =>
  [...componentStore.components].sort((a, b) => b.style.zIndex - a.style.zIndex)
)

const iconMap: Record<string, string> = {
  text: 'Document',
  image: 'Picture',
  button: 'Pointer',
  input: 'Edit',
  textarea: 'Tickets',
  select: 'ArrowDown',
  checkbox: 'Select',
  radio: 'Check',
  container: 'Grid',
  chart: 'DataLine',
  table: 'List'
}

function handleSelect(id: string, e: MouseEvent) {
  componentStore.selectComponent(id, e.ctrlKey || e.metaKey)
}

function handleMoveUp(id: string) {
  componentStore.moveLayer(id, 'up')
  historyStore.saveSnapshot()
}

function handleMoveDown(id: string) {
  componentStore.moveLayer(id, 'down')
  historyStore.saveSnapshot()
}

function handleMoveTop(id: string) {
  componentStore.moveLayer(id, 'top')
  historyStore.saveSnapshot()
}

function handleMoveBottom(id: string) {
  componentStore.moveLayer(id, 'bottom')
  historyStore.saveSnapshot()
}

function handleToggleVisibility(id: string, visible: boolean) {
  componentStore.updateComponent(id, { visible: !visible })
}

function handleToggleLock(id: string, locked: boolean) {
  componentStore.updateComponent(id, { locked: !locked })
  historyStore.saveSnapshot()
}

function handleDelete(id: string) {
  componentStore.removeComponent(id)
  historyStore.saveSnapshot()
}

function handleLayerCommand(cmd: string, id: string) {
  if (cmd === 'top') handleMoveTop(id)
  else if (cmd === 'bottom') handleMoveBottom(id)
  else if (cmd === 'up') handleMoveUp(id)
  else if (cmd === 'down') handleMoveDown(id)
}
</script>

<template>
  <div class="layer-panel">
    <div class="panel-header">
      <span class="title">图层管理</span>
      <span class="count">{{ componentStore.components.length }} 个组件</span>
    </div>

    <div class="layer-list">
      <div
        v-for="component in sortedComponents"
        :key="component.id"
        class="layer-item"
        :class="{
          selected: componentStore.selectedComponentIds.includes(component.id),
          locked: component.locked,
          hidden: !component.visible
        }"
        @click="handleSelect(component.id, $event)"
      >
        <div class="layer-info">
          <el-icon class="type-icon">
            <component :is="iconMap[component.type] || 'Document'" />
          </el-icon>
          <span class="name">{{ component.name }}</span>
        </div>

        <div class="layer-actions">
          <el-tooltip :content="component.visible ? '隐藏' : '显示'" placement="top">
            <el-button size="small" text @click.stop="handleToggleVisibility(component.id, component.visible)">
              <el-icon><View v-if="component.visible" /><Hide v-else /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip :content="component.locked ? '解锁' : '锁定'" placement="top">
            <el-button size="small" text @click.stop="handleToggleLock(component.id, component.locked)">
              <el-icon><Lock v-if="component.locked" /><Unlock v-else /></el-icon>
            </el-button>
          </el-tooltip>
          <el-dropdown trigger="click" @command="(cmd: string) => handleLayerCommand(cmd, component.id)">
            <el-button size="small" text @click.stop>
              <el-icon><Rank /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="top">置顶</el-dropdown-item>
                <el-dropdown-item command="up">上移一层</el-dropdown-item>
                <el-dropdown-item command="down">下移一层</el-dropdown-item>
                <el-dropdown-item command="bottom">置底</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-tooltip content="删除" placement="top">
            <el-button size="small" text type="danger" @click.stop="handleDelete(component.id)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </el-tooltip>
        </div>
      </div>

      <div v-if="componentStore.components.length === 0" class="empty-state">
        暂无组件
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.layer-panel {
  width: 240px;
  height: 100%;
  background: #fff;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;

  .panel-header {
    padding: 12px 16px;
    border-bottom: 1px solid #e4e7ed;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .title {
      font-size: 14px;
      font-weight: 600;
      color: #303133;
    }

    .count {
      font-size: 12px;
      color: #909399;
    }
  }

  .layer-list {
    flex: 1;
    overflow-y: auto;
  }

  .layer-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: #f5f7fa;
    }

    &.selected {
      background: #ecf5ff;
    }

    &.locked {
      opacity: 0.6;
    }

    &.hidden {
      opacity: 0.4;
    }

    .layer-info {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      min-width: 0;

      .type-icon {
        color: #409eff;
        font-size: 14px;
      }

      .name {
        font-size: 12px;
        color: #606266;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .layer-actions {
      display: flex;
      gap: 2px;
      opacity: 0;
      transition: opacity 0.2s;
    }

    &:hover .layer-actions {
      opacity: 1;
    }
  }

  .empty-state {
    padding: 24px;
    text-align: center;
    color: #909399;
    font-size: 12px;
  }
}
</style>
