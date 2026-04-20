<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDataSourceStore } from '@/stores'
import type { DataSource, DataSourceType, ApiParam } from '@/types/dataSource'
import { v4 as uuidv4 } from 'uuid'

const dataSourceStore = useDataSourceStore()

const activeTab = ref<'list' | 'create'>('list')
const editingDataSource = ref<DataSource | null>(null)
const testResult = ref<any>(null)
const testing = ref(false)

const dataSourceTypes: { label: string; value: DataSourceType }[] = [
  { label: '静态数据', value: 'static' },
  { label: 'API接口', value: 'api' },
  { label: '全局变量', value: 'globalVariable' }
]

const newDataSource = ref<Omit<DataSource, 'id'>>({
  name: '',
  type: 'static',
  description: '',
  enabled: true,
  autoRefresh: false,
  refreshInterval: 0,
  data: null
} as any)

function resetForm() {
  newDataSource.value = {
    name: '',
    type: 'static',
    description: '',
    enabled: true,
    autoRefresh: false,
    refreshInterval: 0,
    data: null
  } as any
  editingDataSource.value = null
  testResult.value = null
}

function handleCreate() {
  resetForm()
  activeTab.value = 'create'
}

function handleEdit(ds: DataSource) {
  editingDataSource.value = ds
  newDataSource.value = { ...ds }
  activeTab.value = 'create'
}

function handleDelete(id: string) {
  dataSourceStore.removeDataSource(id)
}

function handleSave() {
  if (!newDataSource.value.name) {
    return
  }

  if (editingDataSource.value) {
    dataSourceStore.updateDataSource(editingDataSource.value.id, newDataSource.value)
  } else {
    dataSourceStore.addDataSource(newDataSource.value as any)
  }

  resetForm()
  activeTab.value = 'list'
}

function handleCancel() {
  resetForm()
  activeTab.value = 'list'
}

async function handleTest() {
  if (newDataSource.value.type !== 'api') return

  testing.value = true
  testResult.value = null

  try {
    const result = await dataSourceStore.testApiConnection(newDataSource.value as any)
    testResult.value = result
  } catch (error: any) {
    testResult.value = {
      success: false,
      error: error.message
    }
  } finally {
    testing.value = false
  }
}

function addApiParam() {
  if (newDataSource.value.type === 'api') {
    if (!newDataSource.value.params) {
      newDataSource.value.params = []
    }
    newDataSource.value.params.push({
      id: uuidv4(),
      key: '',
      value: '',
      type: 'static',
      required: false
    })
  }
}

function removeApiParam(index: number) {
  if (newDataSource.value.type === 'api' && newDataSource.value.params) {
    newDataSource.value.params.splice(index, 1)
  }
}

async function handleRefresh(id: string) {
  try {
    await dataSourceStore.fetchData(id)
  } catch (error) {
    console.error('Refresh failed:', error)
  }
}

function getTypeLabel(type: DataSourceType): string {
  return dataSourceTypes.find(t => t.value === type)?.label || type
}
</script>

<template>
  <div class="datasource-panel">
    <div class="panel-header">
      <span>数据源管理</span>
      <el-button type="primary" size="small" @click="handleCreate" v-if="activeTab === 'list'">
        <el-icon><Plus /></el-icon>
        新建
      </el-button>
    </div>

    <div v-if="activeTab === 'list'" class="datasource-list">
      <div v-if="dataSourceStore.dataSources.length === 0" class="empty-hint">
        <el-icon><Coin /></el-icon>
        <span>暂无数据源</span>
      </div>

      <div v-else class="list-content">
        <div
          v-for="ds in dataSourceStore.dataSources"
          :key="ds.id"
          class="datasource-item"
        >
          <div class="item-header">
            <div class="item-info">
              <el-icon><Coin /></el-icon>
              <span class="item-name">{{ ds.name }}</span>
              <el-tag size="small" type="info">{{ getTypeLabel(ds.type) }}</el-tag>
            </div>
            <div class="item-actions">
              <el-switch
                :model-value="ds.enabled"
                @update:model-value="v => dataSourceStore.updateDataSource(ds.id, { enabled: v })"
                size="small"
              />
              <el-button size="small" text @click="handleRefresh(ds.id)">
                <el-icon><Refresh /></el-icon>
              </el-button>
              <el-button size="small" text @click="handleEdit(ds)">
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button size="small" text type="danger" @click="handleDelete(ds.id)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
          <div v-if="ds.description" class="item-desc">{{ ds.description }}</div>
          <div v-if="dataSourceStore.loading[ds.id]" class="item-status loading">
            <el-icon class="is-loading"><Loading /></el-icon>
            <span>加载中...</span>
          </div>
          <div v-else-if="dataSourceStore.errors[ds.id]" class="item-status error">
            <el-icon><WarningFilled /></el-icon>
            <span>{{ dataSourceStore.errors[ds.id] }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="datasource-form">
      <el-form label-width="80px" size="small">
        <el-form-item label="名称" required>
          <el-input v-model="newDataSource.name" placeholder="数据源名称" />
        </el-form-item>

        <el-form-item label="类型">
          <el-select v-model="newDataSource.type" :disabled="!!editingDataSource">
            <el-option
              v-for="dt in dataSourceTypes"
              :key="dt.value"
              :label="dt.label"
              :value="dt.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="描述">
          <el-input
            v-model="newDataSource.description"
            type="textarea"
            :rows="2"
            placeholder="数据源描述（可选）"
          />
        </el-form-item>

        <el-form-item label="启用">
          <el-switch v-model="newDataSource.enabled" />
        </el-form-item>

        <template v-if="newDataSource.type === 'static'">
          <el-divider content-position="left">静态数据</el-divider>
          <el-form-item label="数据内容">
            <el-input
              v-model="newDataSource.data"
              type="textarea"
              :rows="6"
              placeholder='输入JSON数据，如: {"name": "test"}'
            />
          </el-form-item>
        </template>

        <template v-if="newDataSource.type === 'api'">
          <el-divider content-position="left">API配置</el-divider>

          <el-form-item label="请求地址" required>
            <el-input v-model="(newDataSource as any).url" placeholder="https://api.example.com/data" />
          </el-form-item>

          <el-form-item label="请求方法">
            <el-select v-model="(newDataSource as any).method">
              <el-option label="GET" value="GET" />
              <el-option label="POST" value="POST" />
              <el-option label="PUT" value="PUT" />
              <el-option label="DELETE" value="DELETE" />
            </el-select>
          </el-form-item>

          <el-form-item label="请求参数">
            <div class="param-list">
              <div
                v-for="(param, index) in (newDataSource as any).params"
                :key="param.id"
                class="param-item"
              >
                <el-input v-model="param.key" placeholder="参数名" style="width: 100px" />
                <el-input v-model="param.value" placeholder="参数值" style="flex: 1" />
                <el-select v-model="param.type" style="width: 90px">
                  <el-option label="静态" value="static" />
                  <el-option label="变量" value="variable" />
                </el-select>
                <el-button type="danger" text @click="removeApiParam(index)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
              <el-button size="small" @click="addApiParam">
                <el-icon><Plus /></el-icon>
                添加参数
              </el-button>
            </div>
          </el-form-item>

          <el-form-item label="请求头">
            <el-input
              v-model="(newDataSource as any).headers"
              type="textarea"
              :rows="3"
              placeholder='{"Authorization": "Bearer token"}'
            />
          </el-form-item>

          <el-form-item label="请求体">
            <el-input
              v-model="(newDataSource as any).body"
              type="textarea"
              :rows="3"
              placeholder='POST请求体内容'
            />
          </el-form-item>

          <el-form-item label="数据路径">
            <el-input
              v-model="(newDataSource as any).dataPath"
              placeholder="data.list（提取返回数据中的特定字段）"
            />
          </el-form-item>

          <el-form-item label="超时时间">
            <el-input-number
              v-model="(newDataSource as any).timeout"
              :min="1000"
              :max="60000"
              :step="1000"
            />
            <span style="margin-left: 8px; color: #909399">毫秒</span>
          </el-form-item>

          <el-form-item>
            <el-button @click="handleTest" :loading="testing">
              <el-icon><Connection /></el-icon>
              测试连接
            </el-button>
          </el-form-item>

          <div v-if="testResult" class="test-result" :class="{ success: testResult.success, error: !testResult.success }">
            <div class="result-header">
              <el-icon v-if="testResult.success"><CircleCheck /></el-icon>
              <el-icon v-else><CircleClose /></el-icon>
              <span>{{ testResult.success ? '连接成功' : '连接失败' }}</span>
              <span v-if="testResult.duration">耗时: {{ testResult.duration }}ms</span>
            </div>
            <div v-if="testResult.status" class="result-status">
              HTTP {{ testResult.status }} {{ testResult.statusText }}
            </div>
            <div v-if="testResult.error" class="result-error">{{ testResult.error }}</div>
            <div v-if="testResult.data" class="result-data">
              <pre>{{ JSON.stringify(testResult.data, null, 2) }}</pre>
            </div>
          </div>
        </template>

        <template v-if="newDataSource.type === 'globalVariable'">
          <el-divider content-position="left">全局变量</el-divider>
          <el-form-item label="变量值">
            <el-input
              v-model="(newDataSource as any).value"
              type="textarea"
              :rows="4"
              placeholder="变量值"
            />
          </el-form-item>
          <el-form-item label="值类型">
            <el-select v-model="(newDataSource as any).valueType">
              <el-option label="字符串" value="string" />
              <el-option label="数字" value="number" />
              <el-option label="布尔值" value="boolean" />
              <el-option label="对象" value="object" />
              <el-option label="数组" value="array" />
            </el-select>
          </el-form-item>
        </template>

        <el-form-item v-if="newDataSource.type === 'api'">
          <el-checkbox v-model="newDataSource.autoRefresh">自动刷新</el-checkbox>
          <el-input-number
            v-if="newDataSource.autoRefresh"
            v-model="newDataSource.refreshInterval"
            :min="5"
            :max="3600"
            style="margin-left: 8px"
          />
          <span v-if="newDataSource.autoRefresh" style="margin-left: 8px; color: #909399">秒</span>
        </el-form-item>
      </el-form>

      <div class="form-actions">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.datasource-panel {
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

.list-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.datasource-item {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 10px;
  background: #fff;
}

.item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.item-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.item-name {
  font-weight: 500;
  color: #303133;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.item-desc {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

.item-status {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  font-size: 12px;

  &.loading {
    color: #409eff;
  }

  &.error {
    color: #f56c6c;
  }
}

.datasource-form {
  background: #fff;
}

.param-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.param-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.test-result {
  margin-top: 12px;
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;

  &.success {
    background: #f0f9eb;
    border: 1px solid #e1f3d8;
  }

  &.error {
    background: #fef0f0;
    border: 1px solid #fde2e2;
  }
}

.result-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.result-status {
  margin-top: 8px;
  color: #606266;
}

.result-error {
  margin-top: 8px;
  color: #f56c6c;
}

.result-data {
  margin-top: 8px;
  max-height: 200px;
  overflow: auto;

  pre {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-all;
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
}

:deep(.el-button--small) {
  padding: 5px 5px;
}
</style>
