<script setup lang="ts">
import { computed, ref } from 'vue'
import { useComponentStore, useHistoryStore } from '@/stores'
import type { EditorComponent } from '@/types'

const componentStore = useComponentStore()
const historyStore = useHistoryStore()

const expandedIds = ref<Set<string>>(new Set())

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
  grid: 'Grid',
  chart: 'DataLine',
  table: 'List',
  switch: 'Open',
  datePicker: 'Calendar',
  link: 'Link'
}

function countAllComponents(components: EditorComponent[]): number {
  let count = 0
  for (const comp of components) {
    count++
    if (comp.children) {
      count += countAllComponents(comp.children)
    }
  }
  return count
}

function hasChildren(component: EditorComponent): boolean {
  return !!(component.children && component.children.length > 0)
}

function isExpanded(id: string): boolean {
  return expandedIds.value.has(id)
}

function toggleExpand(id: string, e: MouseEvent) {
  e.stopPropagation()
  if (expandedIds.value.has(id)) {
    expandedIds.value.delete(id)
  } else {
    expandedIds.value.add(id)
  }
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
      <span class="count">{{ countAllComponents(componentStore.components) }} 个组件</span>
    </div>

    <div class="layer-list">
      <template v-for="component in sortedComponents" :key="component.id">
        <div
          class="layer-item"
          :class="{
            selected: componentStore.selectedComponentIds.includes(component.id),
            locked: component.locked,
            hidden: !component.visible
          }"
          @click="handleSelect(component.id, $event)"
        >
          <div class="layer-info">
            <span
              v-if="hasChildren(component)"
              class="expand-btn"
              @click="toggleExpand(component.id, $event)"
            >
              <el-icon :class="{ expanded: isExpanded(component.id) }"><ArrowRight /></el-icon>
            </span>
            <span v-else class="expand-placeholder" />

            <el-icon class="type-icon">
              <component :is="iconMap[component.type] || 'Document'" />
            </el-icon>
            <span class="name">{{ component.name }}</span>
            <el-tag v-if="hasChildren(component)" size="small" type="info" class="child-count">
              {{ component.children!.length }}
            </el-tag>
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

        <template v-if="hasChildren(component) && isExpanded(component.id)">
          <template v-for="child in component.children" :key="child.id">
            <div
              class="layer-item child-item"
              :class="{
                selected: componentStore.selectedComponentIds.includes(child.id),
                locked: child.locked,
                hidden: !child.visible
              }"
              @click="handleSelect(child.id, $event)"
            >
              <div class="layer-info">
                <span
                  v-if="hasChildren(child)"
                  class="expand-btn"
                  @click="toggleExpand(child.id, $event)"
                >
                  <el-icon :class="{ expanded: isExpanded(child.id) }"><ArrowRight /></el-icon>
                </span>
                <span v-else class="expand-placeholder" />

                <el-icon class="type-icon">
                  <component :is="iconMap[child.type] || 'Document'" />
                </el-icon>
                <span class="name">{{ child.name }}</span>
                <el-tag v-if="hasChildren(child)" size="small" type="info" class="child-count">
                  {{ child.children!.length }}
                </el-tag>
              </div>

              <div class="layer-actions">
                <el-tooltip :content="child.visible ? '隐藏' : '显示'" placement="top">
                  <el-button size="small" text @click.stop="handleToggleVisibility(child.id, child.visible)">
                    <el-icon><View v-if="child.visible" /><Hide v-else /></el-icon>
                  </el-button>
                </el-tooltip>
                <el-tooltip :content="child.locked ? '解锁' : '锁定'" placement="top">
                  <el-button size="small" text @click.stop="handleToggleLock(child.id, child.locked)">
                    <el-icon><Lock v-if="child.locked" /><Unlock v-else /></el-icon>
                  </el-button>
                </el-tooltip>
                <el-tooltip content="删除" placement="top">
                  <el-button size="small" text type="danger" @click.stop="handleDelete(child.id)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </el-tooltip>
              </div>
            </div>

            <template v-if="hasChildren(child) && isExpanded(child.id)">
              <div
                v-for="grandChild in child.children"
                :key="grandChild.id"
                class="layer-item grandchild-item"
                :class="{
                  selected: componentStore.selectedComponentIds.includes(grandChild.id),
                  locked: grandChild.locked,
                  hidden: !grandChild.visible
                }"
                @click="handleSelect(grandChild.id, $event)"
              >
                <div class="layer-info">
                  <span class="expand-placeholder" />
                  <el-icon class="type-icon">
                    <component :is="iconMap[grandChild.type] || 'Document'" />
                  </el-icon>
                  <span class="name">{{ grandChild.name }}</span>
                </div>

                <div class="layer-actions">
                  <el-tooltip :content="grandChild.visible ? '隐藏' : '显示'" placement="top">
                    <el-button size="small" text @click.stop="handleToggleVisibility(grandChild.id, grandChild.visible)">
                      <el-icon><View v-if="grandChild.visible" /><Hide v-else /></el-icon>
                    </el-button>
                  </el-tooltip>
                  <el-tooltip :content="grandChild.locked ? '解锁' : '锁定'" placement="top">
                    <el-button size="small" text @click.stop="handleToggleLock(grandChild.id, grandChild.locked)">
                      <el-icon><Lock v-if="grandChild.locked" /><Unlock v-else /></el-icon>
                    </el-button>
                  </el-tooltip>
                  <el-tooltip content="删除" placement="top">
                    <el-button size="small" text type="danger" @click.stop="handleDelete(grandChild.id)">
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </el-tooltip>
                </div>
              </div>
            </template>
          </template>
        </template>
      </template>

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
    position: relative;

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

    &.child-item {
      padding-left: 28px;
      background: #fafafa;
    }

    &.grandchild-item {
      padding-left: 44px;
      background: #f5f5f5;
    }

    .layer-info {
      display: flex;
      align-items: center;
      gap: 6px;
      flex: 1;
      min-width: 0;
      overflow: hidden;
      padding-right: 100px;

      .expand-btn {
        width: 16px;
        height: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        flex-shrink: 0;
        border-radius: 2px;
        transition: background 0.2s;

        &:hover {
          background: #e4e7ed;
        }

        .el-icon {
          font-size: 12px;
          color: #909399;
          transition: transform 0.2s;

          &.expanded {
            transform: rotate(90deg);
          }
        }
      }

      .expand-placeholder {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
      }

      .type-icon {
        color: #409eff;
        font-size: 14px;
        flex-shrink: 0;
      }

      .name {
        font-size: 12px;
        color: #606266;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        flex: 1;
        min-width: 0;
      }

      .child-count {
        flex-shrink: 0;
        font-size: 10px;
        padding: 0 4px;
        height: 16px;
        line-height: 16px;
      }
    }

    .layer-actions {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      display: flex;
      gap: 2px;
      opacity: 0;
      transition: opacity 0.2s;
      background: inherit;
      padding: 2px 4px;
      border-radius: 4px;
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

:deep(.el-button--small) {
  padding: 5px 5px;
}
</style>
