<script setup lang="ts">
import { computed } from 'vue'
import { useDataSourceStore, useComponentStore } from '@/stores'
import type { DataBinding } from '@/types/dataSource'

const dataSourceStore = useDataSourceStore()
const componentStore = useComponentStore()

const selectedComponent = computed(() => {
  if (componentStore.selectedComponentIds.length === 1) {
    return componentStore.getComponentById(componentStore.selectedComponentIds[0])
  }
  return null
})

const componentBindings = computed(() => {
  if (!selectedComponent.value) return []
  return dataSourceStore.getComponentBindings(selectedComponent.value.id)
})

const dataSources = computed(() => dataSourceStore.dataSources)

const bindableProps = [
  { label: '文本内容', value: 'text' },
  { label: '显示状态', value: 'visible' },
  { label: '背景色', value: 'style.backgroundColor' },
  { label: '字体颜色', value: 'style.color' },
  { label: '宽度', value: 'style.width' },
  { label: '高度', value: 'style.height' },
  { label: '图片地址', value: 'imageStyle.src' },
  { label: '表格数据', value: 'data' },
  { label: '图表配置', value: 'chartStyle.option' }
]

function addBinding() {
  if (!selectedComponent.value) return
  
  dataSourceStore.addBinding({
    componentId: selectedComponent.value.id,
    componentProp: 'text',
    dataSourceId: '',
    dataPath: '',
    transform: '',
    formatter: ''
  })
}

function removeBinding(id: string) {
  dataSourceStore.removeBinding(id)
}

function getDataSourceName(id: string): string {
  return dataSources.value.find(ds => ds.id === id)?.name || '未知数据源'
}

function getPropLabel(prop: string): string {
  return bindableProps.find(p => p.value === prop)?.label || prop
}
</script>

<template>
  <div class="binding-panel">
    <div v-if="!selectedComponent" class="empty-hint">
      <el-icon><InfoFilled /></el-icon>
      <span>请先选择一个组件</span>
    </div>

    <template v-else>
      <div class="panel-header">
        <span>数据绑定</span>
        <el-button type="primary" size="small" @click="addBinding">
          <el-icon><Plus /></el-icon>
          添加绑定
        </el-button>
      </div>

      <div v-if="componentBindings.length === 0" class="empty-hint">
        <el-icon><Link /></el-icon>
        <span>暂无数据绑定</span>
      </div>

      <div v-else class="binding-list">
        <div 
          v-for="binding in componentBindings" 
          :key="binding.id" 
          class="binding-item"
        >
          <div class="binding-header">
            <span class="binding-title">
              {{ getPropLabel(binding.componentProp) }} ← {{ getDataSourceName(binding.dataSourceId) }}
            </span>
            <el-button 
              type="danger" 
              size="small" 
              text 
              @click="removeBinding(binding.id)"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>

          <el-form label-width="70px" size="small" class="binding-form">
            <el-form-item label="组件属性">
              <el-select v-model="binding.componentProp">
                <el-option 
                  v-for="prop in bindableProps" 
                  :key="prop.value" 
                  :label="prop.label" 
                  :value="prop.value" 
                />
              </el-select>
            </el-form-item>

            <el-form-item label="数据源">
              <el-select v-model="binding.dataSourceId">
                <el-option 
                  v-for="ds in dataSources" 
                  :key="ds.id" 
                  :label="ds.name" 
                  :value="ds.id" 
                />
              </el-select>
            </el-form-item>

            <el-form-item label="数据路径">
              <el-input 
                v-model="binding.dataPath" 
                placeholder="data.list（可选）" 
              />
            </el-form-item>

            <el-form-item label="数据转换">
              <el-input
                v-model="binding.transform"
                type="textarea"
                :rows="2"
                placeholder="return data.map(item => item.name)"
              />
              <div class="field-hint">JavaScript函数，参数为data</div>
            </el-form-item>

            <el-form-item label="格式化">
              <el-input
                v-model="binding.formatter"
                type="textarea"
                :rows="2"
                placeholder="return value.toFixed(2)"
              />
              <div class="field-hint">JavaScript函数，参数为value</div>
            </el-form-item>
          </el-form>
        </div>
      </div>

      <div class="binding-tips">
        <el-divider content-position="left">使用说明</el-divider>
        <ul>
          <li>选择要绑定的组件属性和数据源</li>
          <li>数据路径用于提取嵌套数据中的字段</li>
          <li>数据转换可对原始数据进行处理</li>
          <li>格式化可对最终值进行格式处理</li>
        </ul>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.binding-panel {
  padding: 12px;
  height: 100%;
  overflow-y: auto;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  font-weight: 500;
  color: #303133;
}

.empty-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #909399;
  gap: 8px;
}

.binding-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.binding-item {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
}

.binding-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #f5f7fa;
}

.binding-title {
  font-size: 13px;
  font-weight: 500;
  color: #303133;
}

.binding-form {
  padding: 12px;
}

.field-hint {
  margin-top: 4px;
  font-size: 11px;
  color: #909399;
}

.binding-tips {
  margin-top: 16px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;

  ul {
    margin: 0;
    padding-left: 20px;
    font-size: 12px;
    color: #606266;
    line-height: 1.8;
  }
}
</style>
