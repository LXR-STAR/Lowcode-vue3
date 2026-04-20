<script setup lang="ts">
import { computed, ref } from 'vue'
import { useEventStore, useComponentStore, useDataSourceStore } from '@/stores'
import type { EventType, ActionType, ComponentEvent, EventAction } from '@/types/events'

const eventStore = useEventStore()
const componentStore = useComponentStore()
const dataSourceStore = useDataSourceStore()

const selectedComponent = computed(() => {
  if (componentStore.selectedComponentIds.length === 1) {
    return componentStore.getComponentById(componentStore.selectedComponentIds[0])
  }
  return null
})

const componentEvents = computed(() => {
  if (!selectedComponent.value) return []
  return eventStore.getComponentEvents(selectedComponent.value.id)
})

const eventTypes: { label: string; value: EventType }[] = [
  { label: '点击', value: 'click' },
  { label: '双击', value: 'dblclick' },
  { label: '鼠标移入', value: 'mouseenter' },
  { label: '鼠标移出', value: 'mouseleave' },
  { label: '获得焦点', value: 'focus' },
  { label: '失去焦点', value: 'blur' },
  { label: '值改变', value: 'change' },
  { label: '提交', value: 'submit' }
]

const actionTypes: { label: string; value: ActionType }[] = [
  { label: '跳转链接', value: 'navigate' },
  { label: '打开弹窗', value: 'openModal' },
  { label: '关闭弹窗', value: 'closeModal' },
  { label: '显示消息', value: 'showMessage' },
  { label: '设置变量', value: 'setVariable' },
  { label: 'API请求', value: 'apiRequest' },
  { label: '显示组件', value: 'showComponent' },
  { label: '隐藏组件', value: 'hideComponent' },
  { label: '切换显示', value: 'toggleComponent' }
]

const expandedEvents = ref<string[]>([])
const expandedActions = ref<string[]>([])

function toggleEvent(eventId: string) {
  const index = expandedEvents.value.indexOf(eventId)
  if (index > -1) {
    expandedEvents.value.splice(index, 1)
  } else {
    expandedEvents.value.push(eventId)
  }
}

function toggleAction(actionId: string) {
  const index = expandedActions.value.indexOf(actionId)
  if (index > -1) {
    expandedActions.value.splice(index, 1)
  } else {
    expandedActions.value.push(actionId)
  }
}

function addEvent() {
  if (!selectedComponent.value) return

  eventStore.addEvent(selectedComponent.value.id, {
    type: 'click',
    enabled: true,
    actions: []
  })
}

function removeEvent(eventId: string) {
  if (!selectedComponent.value) return
  eventStore.removeEvent(selectedComponent.value.id, eventId)
}

function addAction(eventId: string) {
  if (!selectedComponent.value) return

  eventStore.addAction(selectedComponent.value.id, eventId, {
    type: 'showMessage',
    enabled: true,
    config: {
      type: 'success',
      message: '',
      duration: 3000
    }
  })
}

function removeAction(eventId: string, actionId: string) {
  if (!selectedComponent.value) return
  eventStore.removeAction(selectedComponent.value.id, eventId, actionId)
}

function getActionLabel(type: ActionType): string {
  return actionTypes.find(a => a.value === type)?.label || type
}

function getEventLabel(type: EventType): string {
  return eventTypes.find(e => e.value === type)?.label || type
}

const allComponents = computed(() => {
  const components: { id: string; name: string }[] = []
  componentStore.components.forEach(c => {
    components.push({ id: c.id, name: c.name })
    if (c.children) {
      c.children.forEach(child => {
        components.push({ id: child.id, name: `${c.name} / ${child.name}` })
      })
    }
  })
  return components
})

const dataSources = computed(() => dataSourceStore.dataSources)
</script>

<template>
  <div class="event-panel">
    <div v-if="!selectedComponent" class="empty-hint">
      <el-icon><InfoFilled /></el-icon>
      <span>请先选择一个组件</span>
    </div>

    <template v-else>
      <div class="panel-header">
        <span>事件配置</span>
        <el-button type="primary" size="small" @click="addEvent">
          <el-icon><Plus /></el-icon>
          添加事件
        </el-button>
      </div>

      <div v-if="componentEvents.length === 0" class="empty-hint">
        <el-icon><Bell /></el-icon>
        <span>暂无事件配置</span>
      </div>

      <div v-else class="event-list">
        <div
          v-for="event in componentEvents"
          :key="event.id"
          class="event-item"
        >
          <div class="event-header" @click="toggleEvent(event.id)">
            <div class="event-info">
              <el-icon class="expand-icon" :class="{ expanded: expandedEvents.includes(event.id) }">
                <ArrowRight />
              </el-icon>
              <el-switch
                :model-value="event.enabled"
                @update:model-value="v => eventStore.updateEvent(selectedComponent!.id, event.id, { enabled: v })"
                size="small"
                @click.stop
              />
              <span class="event-type">{{ getEventLabel(event.type) }}</span>
              <span class="action-count">{{ event.actions.length }} 个动作</span>
            </div>
            <el-button
              type="danger"
              size="small"
              text
              @click.stop="removeEvent(event.id)"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>

          <div v-show="expandedEvents.includes(event.id)" class="event-content">
            <el-form label-width="70px" size="small">
              <el-form-item label="事件类型">
                <el-select
                  :model-value="event.type"
                  @update:model-value="v => eventStore.updateEvent(selectedComponent!.id, event.id, { type: v })"
                >
                  <el-option
                    v-for="et in eventTypes"
                    :key="et.value"
                    :label="et.label"
                    :value="et.value"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="执行条件">
                <el-input
                  :model-value="event.condition"
                  @update:model-value="v => eventStore.updateEvent(selectedComponent!.id, event.id, { condition: v })"
                  placeholder="如: age > 18"
                />
              </el-form-item>
            </el-form>

            <div class="actions-section">
              <div class="section-header">
                <span>动作列表</span>
                <el-button type="primary" size="small" @click="addAction(event.id)">
                  <el-icon><Plus /></el-icon>
                  添加动作
                </el-button>
              </div>

              <div v-if="event.actions.length === 0" class="empty-hint small">
                <span>暂无动作</span>
              </div>

              <div v-else class="action-list">
                <div
                  v-for="action in event.actions"
                  :key="action.id"
                  class="action-item"
                >
                  <div class="action-header" @click="toggleAction(action.id)">
                    <div class="action-info">
                      <el-icon class="expand-icon" :class="{ expanded: expandedActions.includes(action.id) }">
                        <ArrowRight />
                      </el-icon>
                      <el-switch
                        :model-value="action.enabled"
                        @update:model-value="v => eventStore.updateAction(selectedComponent!.id, event.id, action.id, { enabled: v })"
                        size="small"
                        @click.stop
                      />
                      <span class="action-type">{{ getActionLabel(action.type) }}</span>
                    </div>
                    <el-button
                      type="danger"
                      size="small"
                      text
                      @click.stop="removeAction(event.id, action.id)"
                    >
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </div>

                  <div v-show="expandedActions.includes(action.id)" class="action-config">
                    <el-form label-width="70px" size="small">
                      <el-form-item label="动作类型">
                        <el-select
                          :model-value="action.type"
                          @update:model-value="v => eventStore.updateAction(selectedComponent!.id, event.id, action.id, { type: v, config: {} })"
                        >
                          <el-option
                            v-for="at in actionTypes"
                            :key="at.value"
                            :label="at.label"
                            :value="at.value"
                          />
                        </el-select>
                      </el-form-item>

                      <template v-if="action.type === 'navigate'">
                        <el-form-item label="跳转地址">
                          <el-input
                            v-model="action.config.url"
                            placeholder="https://example.com"
                          />
                        </el-form-item>
                        <el-form-item label="打开方式">
                          <el-select v-model="action.config.target">
                            <el-option label="新窗口" value="_blank" />
                            <el-option label="当前窗口" value="_self" />
                          </el-select>
                        </el-form-item>
                      </template>

                      <template v-else-if="action.type === 'showMessage'">
                        <el-form-item label="消息类型">
                          <el-select v-model="action.config.type">
                            <el-option label="成功" value="success" />
                            <el-option label="警告" value="warning" />
                            <el-option label="信息" value="info" />
                            <el-option label="错误" value="error" />
                          </el-select>
                        </el-form-item>
                        <el-form-item label="消息内容">
                          <el-input
                            v-model="action.config.message"
                            type="textarea"
                            :rows="2"
                            placeholder="输入消息内容"
                          />
                        </el-form-item>
                        <el-form-item label="显示时长">
                          <el-input-number
                            v-model="action.config.duration"
                            :min="1000"
                            :max="10000"
                            :step="500"
                          />
                        </el-form-item>
                      </template>

                      <template v-else-if="action.type === 'setVariable'">
                        <el-form-item label="变量名">
                          <el-input v-model="action.config.variableName" placeholder="myVariable" />
                        </el-form-item>
                        <el-form-item label="值类型">
                          <el-select v-model="action.config.valueType">
                            <el-option label="静态值" value="static" />
                            <el-option label="表达式" value="expression" />
                            <el-option label="组件属性" value="component" />
                          </el-select>
                        </el-form-item>
                        <el-form-item v-if="action.config.valueType === 'static'" label="值">
                          <el-input v-model="action.config.value" />
                        </el-form-item>
                        <el-form-item v-if="action.config.valueType === 'expression'" label="表达式">
                          <el-input v-model="action.config.value" placeholder="context.value + 1" />
                        </el-form-item>
                        <el-form-item v-if="action.config.valueType === 'component'" label="组件">
                          <el-select v-model="action.config.componentId">
                            <el-option
                              v-for="comp in allComponents"
                              :key="comp.id"
                              :label="comp.name"
                              :value="comp.id"
                            />
                          </el-select>
                        </el-form-item>
                      </template>

                      <template v-else-if="action.type === 'apiRequest'">
                        <el-form-item label="数据源">
                          <el-select v-model="action.config.dataSourceId">
                            <el-option
                              v-for="ds in dataSources"
                              :key="ds.id"
                              :label="ds.name"
                              :value="ds.id"
                            />
                          </el-select>
                        </el-form-item>
                      </template>

                      <template v-else-if="action.type === 'showComponent' || action.type === 'hideComponent' || action.type === 'toggleComponent'">
                        <el-form-item label="目标组件">
                          <el-select v-model="action.config.componentIds" multiple>
                            <el-option
                              v-for="comp in allComponents"
                              :key="comp.id"
                              :label="comp.name"
                              :value="comp.id"
                            />
                          </el-select>
                        </el-form-item>
                      </template>

                      <template v-else-if="action.type === 'openModal' || action.type === 'closeModal'">
                        <el-form-item label="目标组件">
                          <el-select v-model="action.config.modalId">
                            <el-option
                              v-for="comp in allComponents"
                              :key="comp.id"
                              :label="comp.name"
                              :value="comp.id"
                            />
                          </el-select>
                        </el-form-item>
                      </template>
                    </el-form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.event-panel {
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

  &.small {
    padding: 20px;
    font-size: 12px;
  }
}

.event-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.event-item {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
}

.event-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #f5f7fa;
  cursor: pointer;

  &:hover {
    background: #ecf5ff;
  }
}

.event-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.expand-icon {
  transition: transform 0.2s;

  &.expanded {
    transform: rotate(90deg);
  }
}

.event-type {
  font-weight: 500;
  color: #303133;
}

.action-count {
  font-size: 12px;
  color: #909399;
}

.event-content {
  padding: 12px;
  border-top: 1px solid #e4e7ed;
  background: #fff;
}

.actions-section {
  margin-top: 12px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
  color: #606266;
}

.action-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-item {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}

.action-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  background: #fafafa;
  cursor: pointer;

  &:hover {
    background: #f0f0f0;
  }
}

.action-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-type {
  font-size: 13px;
  color: #303133;
}

.action-config {
  padding: 12px;
  border-top: 1px solid #ebeef5;
  background: #fff;
}
</style>
