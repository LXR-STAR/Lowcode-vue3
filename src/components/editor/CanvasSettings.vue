<script setup lang="ts">
import { ref, computed } from 'vue'
import { useEditorStore, CANVAS_PRESETS, type CanvasPreset } from '@/stores/editor'

const editorStore = useEditorStore()

const activeCategory = ref<'desktop' | 'tablet' | 'mobile' | 'custom'>('desktop')
const customWidth = ref(editorStore.canvas.width)
const customHeight = ref(editorStore.canvas.height)

const categories = [
  { key: 'desktop', label: '桌面', icon: 'Monitor' },
  { key: 'tablet', label: '平板', icon: 'Grid' },
  { key: 'mobile', label: '手机', icon: 'Iphone' },
  { key: 'custom', label: '自定义', icon: 'Setting' }
]

const filteredPresets = computed(() => 
  CANVAS_PRESETS.filter(p => p.category === activeCategory.value)
)

function handleSelectPreset(preset: CanvasPreset) {
  editorStore.applyPreset(preset)
  customWidth.value = preset.width
  customHeight.value = preset.height
}

function handleApplyCustomSize() {
  if (customWidth.value > 0 && customHeight.value > 0) {
    editorStore.setCanvasSize(customWidth.value, customHeight.value)
  }
}

function handleCategoryChange(category: 'desktop' | 'tablet' | 'mobile' | 'custom') {
  activeCategory.value = category
}
</script>

<template>
  <div class="canvas-settings">
    <div class="settings-header">
      <el-icon><Setting /></el-icon>
      <span>画布设置</span>
    </div>
    
    <div class="current-size">
      <span class="label">当前尺寸</span>
      <span class="value">{{ editorStore.canvas.width }} × {{ editorStore.canvas.height }}</span>
    </div>
    
    <div class="category-tabs">
      <div
        v-for="cat in categories"
        :key="cat.key"
        class="category-tab"
        :class="{ active: activeCategory === cat.key }"
        @click="handleCategoryChange(cat.key as any)"
      >
        <el-icon>
          <component :is="cat.icon" />
        </el-icon>
        <span>{{ cat.label }}</span>
      </div>
    </div>
    
    <div class="presets-grid">
      <div
        v-for="preset in filteredPresets"
        :key="preset.name"
        class="preset-item"
        :class="{ active: editorStore.currentPreset === preset.name }"
        @click="handleSelectPreset(preset)"
      >
        <el-icon class="preset-icon">
          <component :is="preset.icon" />
        </el-icon>
        <div class="preset-info">
          <span class="preset-name">{{ preset.name }}</span>
          <span class="preset-size">{{ preset.width }} × {{ preset.height }}</span>
        </div>
      </div>
    </div>
    
    <div v-if="activeCategory === 'custom'" class="custom-size">
      <div class="size-inputs">
        <div class="input-group">
          <label>宽度</label>
          <el-input-number 
            v-model="customWidth" 
            :min="100" 
            :max="4000"
            :step="10"
          />
        </div>
        <div class="input-group">
          <label>高度</label>
          <el-input-number 
            v-model="customHeight" 
            :min="100" 
            :max="4000"
            :step="10"
          />
        </div>
      </div>
      <el-button type="primary" @click="handleApplyCustomSize" style="width: 100%">
        应用尺寸
      </el-button>
    </div>
    
    <div class="quick-actions">
      <el-button size="small" @click="editorStore.toggleGrid()">
        <el-icon><Grid /></el-icon>
        {{ editorStore.canvas.showGrid ? '隐藏网格' : '显示网格' }}
      </el-button>
      <el-button size="small" @click="editorStore.toggleSnapToGrid()">
        <el-icon><Magnet /></el-icon>
        {{ editorStore.canvas.snapToGrid ? '关闭吸附' : '开启吸附' }}
      </el-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.canvas-settings {
  padding: 12px;
  
  .settings-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    font-weight: 600;
    font-size: 14px;
    color: #303133;
  }
  
  .current-size {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: #f5f7fa;
    border-radius: 4px;
    margin-bottom: 16px;
    
    .label {
      font-size: 12px;
      color: #909399;
    }
    
    .value {
      font-size: 13px;
      font-weight: 500;
      color: #409eff;
    }
  }
  
  .category-tabs {
    display: flex;
    gap: 4px;
    margin-bottom: 12px;
    
    .category-tab {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 8px;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 11px;
      color: #606266;
      
      &:hover {
        background: #f5f7fa;
      }
      
      &.active {
        background: #ecf5ff;
        color: #409eff;
      }
      
      .el-icon {
        font-size: 18px;
      }
    }
  }
  
  .presets-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    margin-bottom: 16px;
    
    .preset-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px;
      border: 1px solid #e4e7ed;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
      
      &:hover {
        border-color: #409eff;
        background: #f5f7fa;
      }
      
      &.active {
        border-color: #409eff;
        background: #ecf5ff;
        
        .preset-icon {
          color: #409eff;
        }
      }
      
      .preset-icon {
        font-size: 20px;
        color: #909399;
      }
      
      .preset-info {
        display: flex;
        flex-direction: column;
        
        .preset-name {
          font-size: 12px;
          font-weight: 500;
          color: #303133;
        }
        
        .preset-size {
          font-size: 10px;
          color: #909399;
        }
      }
    }
  }
  
  .custom-size {
    margin-bottom: 16px;
    
    .size-inputs {
      display: flex;
      gap: 12px;
      margin-bottom: 12px;
      
      .input-group {
        flex: 1;
        
        label {
          display: block;
          font-size: 11px;
          color: #909399;
          margin-bottom: 4px;
        }
        
        :deep(.el-input-number) {
          width: 100%;
        }
      }
    }
  }
  
  .quick-actions {
    display: flex;
    gap: 8px;
    
    .el-button {
      flex: 1;
    }
  }
}
</style>
