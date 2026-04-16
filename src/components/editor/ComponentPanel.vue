<script setup lang="ts">
import { ref } from 'vue'
import { useComponentStore, useEditorStore } from '@/stores'
import type { ComponentType } from '@/types'

const componentStore = useComponentStore()
const editorStore = useEditorStore()

const activeGroups = ref(['基础组件', '表单组件', '高级组件'])

const componentGroups = [
  {
    name: '基础组件',
    items: [
      { type: 'text' as ComponentType, name: '文本', icon: 'Document' },
      { type: 'image' as ComponentType, name: '图片', icon: 'Picture' },
      { type: 'button' as ComponentType, name: '按钮', icon: 'Pointer' },
      { type: 'input' as ComponentType, name: '输入框', icon: 'Edit' }
    ]
  },
  {
    name: '表单组件',
    items: [
      { type: 'textarea' as ComponentType, name: '多行文本', icon: 'Tickets' },
      { type: 'select' as ComponentType, name: '下拉选择', icon: 'ArrowDown' },
      { type: 'checkbox' as ComponentType, name: '复选框', icon: 'Select' },
      { type: 'radio' as ComponentType, name: '单选框', icon: 'Check' },
      { type: 'switch' as ComponentType, name: '开关', icon: 'Open' },
      { type: 'datePicker' as ComponentType, name: '日期选择', icon: 'Calendar' }
    ]
  },
  {
    name: '高级组件',
    items: [
      { type: 'container' as ComponentType, name: '弹性容器', icon: 'Grid' },
      { type: 'grid' as ComponentType, name: '栅格布局', icon: 'Menu' },
      { type: 'chart' as ComponentType, name: '图表', icon: 'DataLine' },
      { type: 'table' as ComponentType, name: '表格', icon: 'List' }
    ]
  }
]

const draggedComponent = ref<ComponentType | null>(null)

function handleDragStart(e: DragEvent, type: ComponentType) {
  draggedComponent.value = type
  editorStore.draggingComponentType = type
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'copy'
    e.dataTransfer.setData('componentType', type)
  }
}

function handleDragEnd() {
  draggedComponent.value = null
  editorStore.draggingComponentType = null
}
</script>

<template>
  <div class="component-panel">
    <div class="panel-header">
      <span class="title">组件库</span>
    </div>
    <div class="panel-content">
      <el-collapse v-model="activeGroups">
        <el-collapse-item
          v-for="group in componentGroups"
          :key="group.name"
          :title="group.name"
          :name="group.name"
        >
          <div class="component-grid">
            <div
              v-for="item in group.items"
              :key="item.type"
              class="component-item"
              :class="{ dragging: draggedComponent === item.type }"
              draggable="true"
              @dragstart="handleDragStart($event, item.type)"
              @dragend="handleDragEnd"
            >
              <el-icon class="icon">
                <component :is="item.icon" />
              </el-icon>
              <span class="name">{{ item.name }}</span>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<style scoped lang="scss">
.component-panel {
  width: 240px;
  height: 100%;
  background: #fff;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;

  .panel-header {
    padding: 12px 16px;
    border-bottom: 1px solid #e4e7ed;

    .title {
      font-size: 14px;
      font-weight: 600;
      color: #303133;
    }
  }

  .panel-content {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
  }

  .component-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    padding: 8px 0;
  }

  .component-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 12px 8px;
    background: #f5f7fa;
    border-radius: 6px;
    cursor: grab;
    transition: all 0.2s;
    border: 1px solid transparent;

    &:hover {
      background: #ecf5ff;
      border-color: #409eff;
    }

    &.dragging {
      opacity: 0.5;
      cursor: grabbing;
    }

    .icon {
      font-size: 24px;
      color: #409eff;
      margin-bottom: 6px;
    }

    .name {
      font-size: 12px;
      color: #606266;
    }
  }
}

:deep(.el-collapse) {
  border: none;
}

:deep(.el-collapse-item__header) {
  background: transparent;
  font-size: 13px;
  font-weight: 500;
  color: #303133;
  border-bottom: none;
  height: 36px;
}

:deep(.el-collapse-item__wrap) {
  background: transparent;
  border-bottom: none;
}

:deep(.el-collapse-item__content) {
  padding-bottom: 0;
}
</style>
