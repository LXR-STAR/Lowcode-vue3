<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useComponentStore, useEditorStore, useHistoryStore } from '@/stores'

const router = useRouter()
const componentStore = useComponentStore()
const editorStore = useEditorStore()
const historyStore = useHistoryStore()

function handleUndo() {
  historyStore.undo()
}

function handleRedo() {
  historyStore.redo()
}

function handleDelete() {
  componentStore.removeSelectedComponents()
  historyStore.saveSnapshot()
}

function handleCopy() {
  componentStore.copySelectedComponents()
}

function handlePaste() {
  componentStore.pasteComponents()
  historyStore.saveSnapshot()
}

function handleGroup() {
  if (componentStore.selectedComponentIds.length >= 2) {
    componentStore.groupComponents(componentStore.selectedComponentIds)
    historyStore.saveSnapshot()
  }
}

function handleUngroup() {
  const selectedId = componentStore.selectedComponentIds[0]
  if (selectedId && componentStore.isGroup(selectedId)) {
    componentStore.ungroupComponent(selectedId)
    historyStore.saveSnapshot()
  }
}

function handleZoomIn() {
  editorStore.zoomIn()
}

function handleZoomOut() {
  editorStore.zoomOut()
}

function handleResetZoom() {
  editorStore.resetZoom()
}

function handleToggleGrid() {
  editorStore.toggleGrid()
}

function handleToggleSnap() {
  editorStore.toggleSnapToGrid()
}

function handlePreview() {
  router.push('/preview')
}

function handleExport() {
  const json = componentStore.exportToJSON()
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `page_${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function handleImport() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      componentStore.importFromJSON(content)
      historyStore.saveSnapshot()
    }
    reader.readAsText(file)
  }
  input.click()
}

function handleClearCanvas() {
  componentStore.clearAll()
  historyStore.saveSnapshot()
}

function handleKeyDown(e: KeyboardEvent) {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
  const ctrlKey = isMac ? e.metaKey : e.ctrlKey

  if (ctrlKey && e.key === 'z') {
    e.preventDefault()
    if (e.shiftKey) {
      historyStore.redo()
    } else {
      historyStore.undo()
    }
  } else if (ctrlKey && e.key === 'y') {
    e.preventDefault()
    historyStore.redo()
  } else if (ctrlKey && e.key === 'c') {
    e.preventDefault()
    handleCopy()
  } else if (ctrlKey && e.key === 'v') {
    e.preventDefault()
    handlePaste()
  } else if (ctrlKey && e.key === 'g') {
    e.preventDefault()
    if (e.shiftKey) {
      handleUngroup()
    } else {
      handleGroup()
    }
  } else if (ctrlKey && e.key === 'a') {
    e.preventDefault()
    componentStore.selectAll()
  } else if (e.key === 'Delete' || e.key === 'Backspace') {
    if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
      e.preventDefault()
      handleDelete()
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <div class="toolbar">
    <h3>可视化页面编辑器</h3>
    <div class="toolbar-group">
      <el-tooltip content="撤销 (Ctrl+Z)" placement="bottom">
        <el-button :disabled="!historyStore.canUndo" @click="handleUndo" circle>
          <el-icon><RefreshLeft /></el-icon>
        </el-button>
      </el-tooltip>
      <el-tooltip content="重做 (Ctrl+Y)" placement="bottom">
        <el-button :disabled="!historyStore.canRedo" @click="handleRedo" circle>
          <el-icon><RefreshRight /></el-icon>
        </el-button>
      </el-tooltip>
    </div>

    <el-divider direction="vertical" />

    <div class="toolbar-group">
      <el-tooltip content="复制 (Ctrl+C)" placement="bottom">
        <el-button :disabled="componentStore.selectedComponentIds.length === 0" @click="handleCopy" circle>
          <el-icon><CopyDocument /></el-icon>
        </el-button>
      </el-tooltip>
      <el-tooltip content="粘贴 (Ctrl+V)" placement="bottom">
        <el-button :disabled="componentStore.copiedComponents.length === 0" @click="handlePaste" circle>
          <el-icon><DocumentCopy /></el-icon>
        </el-button>
      </el-tooltip>
      <el-tooltip content="组合 (Ctrl+G)" placement="bottom">
        <el-button :disabled="componentStore.selectedComponentIds.length < 2" @click="handleGroup" circle>
          <el-icon><Connection /></el-icon>
        </el-button>
      </el-tooltip>
      <el-tooltip content="取消组合 (Ctrl+Shift+G)" placement="bottom">
        <el-button
          :disabled="componentStore.selectedComponentIds.length !== 1 || !componentStore.isGroup(componentStore.selectedComponentIds[0])"
          @click="handleUngroup"
          circle
        >
          <el-icon><SwitchButton /></el-icon>
        </el-button>
      </el-tooltip>
      <el-tooltip content="删除 (Delete)" placement="bottom">
        <el-button :disabled="componentStore.selectedComponentIds.length === 0" @click="handleDelete" circle type="danger">
          <el-icon><Delete /></el-icon>
        </el-button>
      </el-tooltip>
    </div>

    <el-divider direction="vertical" />

    <div class="toolbar-group">
      <el-tooltip content="放大" placement="bottom">
        <el-button @click="handleZoomIn" circle>
          <el-icon><ZoomIn /></el-icon>
        </el-button>
      </el-tooltip>
      <span class="zoom-level">{{ editorStore.zoomLevel }}%</span>
      <el-tooltip content="缩小" placement="bottom">
        <el-button @click="handleZoomOut" circle>
          <el-icon><ZoomOut /></el-icon>
        </el-button>
      </el-tooltip>
      <el-tooltip content="重置缩放" placement="bottom">
        <el-button @click="handleResetZoom" circle>
          <el-icon><Aim /></el-icon>
        </el-button>
      </el-tooltip>
    </div>

    <el-divider direction="vertical" />

    <div class="toolbar-group">
      <el-tooltip :content="editorStore.canvas.showGrid ? '隐藏网格' : '显示网格'" placement="bottom">
        <el-button :type="editorStore.canvas.showGrid ? 'primary' : 'default'" @click="handleToggleGrid" circle>
          <el-icon><Grid /></el-icon>
        </el-button>
      </el-tooltip>
      <el-tooltip :content="editorStore.canvas.snapToGrid ? '关闭吸附' : '开启吸附'" placement="bottom">
        <el-button :type="editorStore.canvas.snapToGrid ? 'primary' : 'default'" @click="handleToggleSnap" circle>
          <el-icon><Magnet /></el-icon>
        </el-button>
      </el-tooltip>
    </div>

    <div class="toolbar-spacer" />

    <div class="toolbar-group">
      <el-tooltip content="清空画布" placement="bottom">
        <el-button :disabled="componentStore.components.length === 0" @click="handleClearCanvas" circle>
          <el-icon><DeleteFilled /></el-icon>
        </el-button>
      </el-tooltip>
      <el-tooltip content="导入JSON" placement="bottom">
        <el-button @click="handleImport" circle>
          <el-icon><Upload /></el-icon>
        </el-button>
      </el-tooltip>
      <el-tooltip content="导出JSON" placement="bottom">
        <el-button @click="handleExport" circle>
          <el-icon><Download /></el-icon>
        </el-button>
      </el-tooltip>
      <el-tooltip content="全屏预览" placement="bottom">
        <el-button type="primary" @click="handlePreview" circle>
          <el-icon><View /></el-icon>
        </el-button>
      </el-tooltip>
    </div>
  </div>
</template>

<style scoped lang="scss">
.toolbar {
  height: 48px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 8px;

  h3 {
    margin: 0 5px;
    margin-right: 35px;
    font-size: 22px;
  }

  .toolbar-group {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .toolbar-spacer {
    flex: 1;
  }

  .zoom-level {
    font-size: 12px;
    color: #606266;
    min-width: 50px;
    text-align: center;
  }

  :deep(.el-button.is-circle) {
    padding: 8px;
  }

  :deep(.el-divider--vertical) {
    height: 24px;
    margin: 0 8px;
  }
}
</style>
