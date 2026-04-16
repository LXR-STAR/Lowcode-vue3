<script setup lang="ts">
import { ref } from 'vue'
import Toolbar from '@/components/editor/Toolbar.vue'
import ComponentPanel from '@/components/editor/ComponentPanel.vue'
import CanvasArea from '@/components/editor/CanvasArea.vue'
import PropertyPanel from '@/components/editor/PropertyPanel.vue'
import LayerPanel from '@/components/editor/LayerPanel.vue'
import CanvasSettings from '@/components/editor/CanvasSettings.vue'
import { useEditorStore } from '@/stores'

const editorStore = useEditorStore()
const activeLeftTab = ref<'components' | 'layers' | 'settings'>('components')
const leftPanelCollapsed = ref(false)
const rightPanelCollapsed = ref(false)

const leftPanelWidth = ref(260)
const rightPanelWidth = ref(300)

function toggleLeftPanel() {
  leftPanelCollapsed.value = !leftPanelCollapsed.value
}

function toggleRightPanel() {
  rightPanelCollapsed.value = !rightPanelCollapsed.value
}
</script>

<template>
  <div class="editor-container">
    <Toolbar />
    <div class="editor-main">
      <div
        class="left-panel"
        :class="{ collapsed: leftPanelCollapsed }"
        :style="{ width: leftPanelCollapsed ? '40px' : `${leftPanelWidth}px` }"
      >
        <div class="panel-toggle left-toggle" @click="toggleLeftPanel">
          <el-icon>
            <ArrowLeft v-if="!leftPanelCollapsed" />
            <ArrowRight v-else />
          </el-icon>
        </div>
        <template v-if="!leftPanelCollapsed">
          <div class="left-tabs">
            <div
              class="tab-item"
              :class="{ active: activeLeftTab === 'components' }"
              @click="activeLeftTab = 'components'"
            >
              <el-icon><Menu /></el-icon>
              <span>组件</span>
            </div>
            <div
              class="tab-item"
              :class="{ active: activeLeftTab === 'layers' }"
              @click="activeLeftTab = 'layers'"
            >
              <el-icon><Files /></el-icon>
              <span>图层</span>
            </div>
            <div
              class="tab-item"
              :class="{ active: activeLeftTab === 'settings' }"
              @click="activeLeftTab = 'settings'"
            >
              <el-icon><Setting /></el-icon>
              <span>画布</span>
            </div>
          </div>
          <div class="left-content">
            <ComponentPanel v-show="activeLeftTab === 'components'" />
            <LayerPanel v-show="activeLeftTab === 'layers'" />
            <CanvasSettings v-show="activeLeftTab === 'settings'" />
          </div>
        </template>
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
          <PropertyPanel />
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

.left-panel {
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e4e7ed;
  background: #fff;
  transition: width 0.3s ease;
  position: relative;
  flex-shrink: 0;

  &.collapsed {
    .left-tabs, .left-content {
      display: none;
    }
  }

  .left-tabs {
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

  .left-content {
    flex: 1;
    overflow: hidden;
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

.left-toggle {
  right: -20px;
  border-radius: 0 4px 4px 0;
  border-left: none;
}

.right-toggle {
  left: -20px;
  border-radius: 4px 0 0 4px;
  border-right: none;
}
</style>
