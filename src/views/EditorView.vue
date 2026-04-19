<script setup lang="ts">
import { ref } from 'vue'
import Toolbar from '@/components/editor/Toolbar.vue'
import ComponentPanel from '@/components/editor/ComponentPanel.vue'
import CanvasArea from '@/components/editor/CanvasArea.vue'
import PropertyPanel from '@/components/editor/PropertyPanel.vue'
import LayerPanel from '@/components/editor/LayerPanel.vue'
import CanvasSettings from '@/components/editor/CanvasSettings.vue'
import EventPanel from '@/components/editor/EventPanel.vue'
import DataSourcePanel from '@/components/editor/DataSourcePanel.vue'
import DataBindingPanel from '@/components/editor/DataBindingPanel.vue'
import AIPanel from '@/components/editor/AIPanel.vue'
import { useEditorStore } from '@/stores'

const editorStore = useEditorStore()
const activeLeftTab = ref<'components' | 'layers' | 'ai' | 'datasource' | 'settings'>('components')
const activeRightTab = ref<'properties' | 'events' | 'bindings'>('properties')
const leftPanelCollapsed = ref(false)
const rightPanelCollapsed = ref(false)

const leftPanelWidth = ref(280)
const rightPanelWidth = ref(300)

function toggleLeftPanel() {
  leftPanelCollapsed.value = !leftPanelCollapsed.value
}

function toggleRightPanel() {
  rightPanelCollapsed.value = !rightPanelCollapsed.value
}

function handleLeftTabClick(tab: typeof activeLeftTab.value) {
  if (activeLeftTab.value === tab && !leftPanelCollapsed.value) {
    leftPanelCollapsed.value = true
  } else {
    activeLeftTab.value = tab
    leftPanelCollapsed.value = false
  }
}

const leftTabs = [
  { key: 'components' as const, icon: 'Menu', label: '组件' },
  { key: 'layers' as const, icon: 'Files', label: '图层' },
  { key: 'ai' as const, icon: 'MagicStick', label: 'AI' },
  { key: 'datasource' as const, icon: 'Coin', label: '数据' },
  { key: 'settings' as const, icon: 'Setting', label: '画布' }
]
</script>

<template>
  <div class="editor-container">
    <Toolbar />
    <div class="editor-main">
      <div class="left-sidebar">
        <div class="sidebar-icons">
          <div
            v-for="tab in leftTabs"
            :key="tab.key"
            class="sidebar-icon"
            :class="{ active: activeLeftTab === tab.key && !leftPanelCollapsed }"
            :title="tab.label"
            @click="handleLeftTabClick(tab.key)"
          >
            <el-icon :size="20">
              <component :is="tab.icon" />
            </el-icon>
          </div>
        </div>
        <div class="sidebar-bottom">
          <div
            class="sidebar-icon"
            :title="leftPanelCollapsed ? '展开面板' : '收起面板'"
            @click="toggleLeftPanel"
          >
            <el-icon :size="18">
              <ArrowLeft v-if="!leftPanelCollapsed" />
              <ArrowRight v-else />
            </el-icon>
          </div>
        </div>
      </div>

      <div
        class="left-panel"
        :class="{ collapsed: leftPanelCollapsed }"
        :style="{ width: leftPanelCollapsed ? '0px' : `${leftPanelWidth}px` }"
      >
        <div class="left-content">
          <ComponentPanel v-show="activeLeftTab === 'components'" />
          <LayerPanel v-show="activeLeftTab === 'layers'" />
          <AIPanel v-show="activeLeftTab === 'ai'" />
          <DataSourcePanel v-show="activeLeftTab === 'datasource'" />
          <CanvasSettings v-show="activeLeftTab === 'settings'" />
        </div>
      </div>

      <CanvasArea />

      <div
        v-if="!editorStore.previewMode"
        class="right-panel"
        :class="{ collapsed: rightPanelCollapsed }"
        :style="{ width: rightPanelCollapsed ? '40px' : `${rightPanelWidth}px` }"
      >
        <div class="panel-toggle right-toggle" @click="toggleRightPanel">
          <el-icon>
            <ArrowRight v-if="!rightPanelCollapsed" />
            <ArrowLeft v-else />
          </el-icon>
        </div>
        <div v-if="!rightPanelCollapsed" class="right-content">
          <div class="right-tabs">
            <div
              class="tab-item"
              :class="{ active: activeRightTab === 'properties' }"
              @click="activeRightTab = 'properties'"
            >
              <el-icon><Edit /></el-icon>
              <span>属性</span>
            </div>
            <div
              class="tab-item"
              :class="{ active: activeRightTab === 'events' }"
              @click="activeRightTab = 'events'"
            >
              <el-icon><Bell /></el-icon>
              <span>事件</span>
            </div>
            <div
              class="tab-item"
              :class="{ active: activeRightTab === 'bindings' }"
              @click="activeRightTab = 'bindings'"
            >
              <el-icon><Link /></el-icon>
              <span>绑定</span>
            </div>
          </div>
          <div class="right-panel-content">
            <PropertyPanel v-show="activeRightTab === 'properties'" />
            <EventPanel v-show="activeRightTab === 'events'" />
            <DataBindingPanel v-show="activeRightTab === 'bindings'" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.editor-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f0f2f5;
}

.editor-main {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
}

.left-sidebar {
  width: 48px;
  display: flex;
  flex-direction: column;
  background: #f8f9fb;
  border-right: 1px solid #e4e7ed;
  flex-shrink: 0;
  user-select: none;

  .sidebar-icons {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 4px;
  }

  .sidebar-bottom {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: 8px;
    border-top: 1px solid #e4e7ed;
  }

  .sidebar-icon {
    width: 48px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #909399;
    transition: all 0.15s;
    position: relative;

    &:hover {
      color: #606266;
      background: #e8eaed;
    }

    &.active {
      color: #409eff;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 8px;
        bottom: 8px;
        width: 2px;
        background: #409eff;
        border-radius: 0 2px 2px 0;
      }
    }
  }
}

.left-panel {
  display: flex;
  flex-direction: column;
  background: #fff;
  transition: width 0.25s ease;
  overflow: hidden;
  flex-shrink: 0;
  border-right: 1px solid #e4e7ed;

  &.collapsed {
    border-right: none;
  }

  .left-content {
    flex: 1;
    overflow: hidden;
    min-width: 200px;
  }
}

.right-panel {
  display: flex;
  flex-direction: column;
  border-left: 1px solid #e4e7ed;
  background: #fff;
  transition: width 0.3s ease;
  position: relative;
  flex-shrink: 0;

  &.collapsed {
    .right-content {
      display: none;
    }
  }

  .right-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .right-tabs {
    display: flex;
    border-bottom: 1px solid #e4e7ed;
    flex-shrink: 0;

    .tab-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      padding: 8px;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 11px;
      color: #909399;

      &:hover {
        color: #606266;
        background: #f5f7fa;
      }

      &.active {
        color: #409eff;
        background: #ecf5ff;
      }

      .el-icon {
        font-size: 18px;
      }
    }
  }

  .right-panel-content {
    flex: 1;
    overflow: hidden;
  }
}

.panel-toggle {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 60px;
  background: #fff;
  border: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s;

  &:hover {
    background: #f5f7fa;
    color: #409eff;
  }

  .el-icon {
    font-size: 12px;
  }
}

.right-toggle {
  left: -20px;
  border-radius: 4px 0 0 4px;
  border-right: none;
}
</style>
