<script setup lang="ts">
import { ref, computed } from 'vue'
import { useComponentStore, useHistoryStore } from '@/stores'
import type { ComponentStyle, TextStyle, ButtonStyle, InputStyle } from '@/types'

const componentStore = useComponentStore()
const historyStore = useHistoryStore()

const activeNames = ref(['basic', 'position', 'style'])

const selectedComponent = computed(() => {
  if (componentStore.selectedComponentIds.length === 1) {
    return componentStore.components.find(
      c => c.id === componentStore.selectedComponentIds[0]
    )
  }
  return null
})

const styleForm = computed(() => selectedComponent.value?.style || {})
const propsForm = computed(() => selectedComponent.value?.props || {})

function updateStyle(key: keyof ComponentStyle, value: any) {
  if (!selectedComponent.value) return
  componentStore.updateComponentStyle(selectedComponent.value.id, { [key]: value })
  historyStore.saveSnapshot()
}

function updateProps(key: string, value: any) {
  if (!selectedComponent.value) return
  componentStore.updateComponentProps(selectedComponent.value.id, { [key]: value })
  historyStore.saveSnapshot()
}

function updateTextStyle(key: keyof TextStyle, value: any) {
  if (!selectedComponent.value) return
  const textStyle = { ...selectedComponent.value.props.textStyle, [key]: value }
  componentStore.updateComponentProps(selectedComponent.value.id, { textStyle })
  historyStore.saveSnapshot()
}

function updateButtonStyle(key: keyof ButtonStyle, value: any) {
  if (!selectedComponent.value) return
  const buttonStyle = { ...selectedComponent.value.props.buttonStyle, [key]: value }
  componentStore.updateComponentProps(selectedComponent.value.id, { buttonStyle })
  historyStore.saveSnapshot()
}

function updateInputStyle(key: keyof InputStyle, value: any) {
  if (!selectedComponent.value) return
  const inputStyle = { ...selectedComponent.value.props.inputStyle, [key]: value }
  componentStore.updateComponentProps(selectedComponent.value.id, { inputStyle })
  historyStore.saveSnapshot()
}

const fontFamilies = [
  { label: '默认', value: 'Arial, sans-serif' },
  { label: '宋体', value: 'SimSun, serif' },
  { label: '黑体', value: 'SimHei, sans-serif' },
  { label: '微软雅黑', value: 'Microsoft YaHei, sans-serif' },
  { label: '楷体', value: 'KaiTi, serif' }
]

const textAlignOptions = [
  { label: '左对齐', value: 'left' },
  { label: '居中', value: 'center' },
  { label: '右对齐', value: 'right' }
]

const buttonTypes = [
  { label: '主要', value: 'primary' },
  { label: '成功', value: 'success' },
  { label: '警告', value: 'warning' },
  { label: '危险', value: 'danger' },
  { label: '信息', value: 'info' },
  { label: '默认', value: 'default' }
]

const buttonSizes = [
  { label: '大', value: 'large' },
  { label: '默认', value: 'default' },
  { label: '小', value: 'small' }
]
</script>

<template>
  <div class="property-panel">
    <div class="panel-header">
      <span class="title">属性面板</span>
    </div>
    
    <div v-if="!selectedComponent" class="empty-state">
      <el-empty description="请选择组件" :image-size="80" />
    </div>
    
    <div v-else class="panel-content">
      <el-collapse v-model="activeNames">
        <el-collapse-item title="基础属性" name="basic">
          <el-form label-width="70px" size="small">
            <el-form-item label="组件名称">
              <el-input
                :model-value="selectedComponent.name"
                @update:model-value="v => componentStore.updateComponent(selectedComponent.id, { name: v })"
              />
            </el-form-item>
            <el-form-item label="锁定">
              <el-switch
                :model-value="selectedComponent.locked"
                @update:model-value="v => componentStore.updateComponent(selectedComponent.id, { locked: v })"
              />
            </el-form-item>
            <el-form-item label="可见">
              <el-switch
                :model-value="selectedComponent.visible"
                @update:model-value="v => componentStore.updateComponent(selectedComponent.id, { visible: v })"
              />
            </el-form-item>
          </el-form>
        </el-collapse-item>
        
        <el-collapse-item title="位置尺寸" name="position">
          <el-form label-width="70px" size="small">
            <el-row :gutter="10">
              <el-col :span="12">
                <el-form-item label="X">
                  <el-input-number
                    :model-value="styleForm.x"
                    @update:model-value="v => updateStyle('x', v)"
                    :min="0"
                    :step="10"
                    controls-position="right"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Y">
                  <el-input-number
                    :model-value="styleForm.y"
                    @update:model-value="v => updateStyle('y', v)"
                    :min="0"
                    :step="10"
                    controls-position="right"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="10">
              <el-col :span="12">
                <el-form-item label="宽度">
                  <el-input-number
                    :model-value="styleForm.width"
                    @update:model-value="v => updateStyle('width', v)"
                    :min="20"
                    :step="10"
                    controls-position="right"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="高度">
                  <el-input-number
                    :model-value="styleForm.height"
                    @update:model-value="v => updateStyle('height', v)"
                    :min="20"
                    :step="10"
                    controls-position="right"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="旋转">
              <el-slider
                :model-value="styleForm.rotate"
                @update:model-value="v => updateStyle('rotate', v)"
                :min="-180"
                :max="180"
                :step="1"
                show-input
              />
            </el-form-item>
          </el-form>
        </el-collapse-item>
        
        <el-collapse-item title="样式" name="style">
          <el-form label-width="70px" size="small">
            <el-form-item label="背景色">
              <el-color-picker
                :model-value="styleForm.backgroundColor"
                @update:model-value="v => updateStyle('backgroundColor', v)"
                show-alpha
              />
            </el-form-item>
            <el-form-item label="透明度">
              <el-slider
                :model-value="(styleForm.opacity || 1) * 100"
                @update:model-value="v => updateStyle('opacity', v / 100)"
                :min="0"
                :max="100"
                :step="1"
              />
            </el-form-item>
            <el-form-item label="边框宽度">
              <el-input-number
                :model-value="styleForm.borderWidth"
                @update:model-value="v => updateStyle('borderWidth', v)"
                :min="0"
                :max="20"
                controls-position="right"
              />
            </el-form-item>
            <el-form-item label="边框颜色">
              <el-color-picker
                :model-value="styleForm.borderColor"
                @update:model-value="v => updateStyle('borderColor', v)"
              />
            </el-form-item>
            <el-form-item label="边框样式">
              <el-select
                :model-value="styleForm.borderStyle"
                @update:model-value="v => updateStyle('borderStyle', v)"
              >
                <el-option label="实线" value="solid" />
                <el-option label="虚线" value="dashed" />
                <el-option label="点线" value="dotted" />
              </el-select>
            </el-form-item>
            <el-form-item label="圆角">
              <el-input-number
                :model-value="styleForm.borderRadius"
                @update:model-value="v => updateStyle('borderRadius', v)"
                :min="0"
                controls-position="right"
              />
            </el-form-item>
          </el-form>
        </el-collapse-item>
        
        <el-collapse-item v-if="selectedComponent.type === 'text'" title="文本属性" name="text">
          <el-form label-width="70px" size="small">
            <el-form-item label="内容">
              <el-input
                type="textarea"
                :model-value="propsForm.text"
                @update:model-value="v => updateProps('text', v)"
                :rows="3"
              />
            </el-form-item>
            <el-form-item label="字体">
              <el-select
                :model-value="propsForm.textStyle?.fontFamily"
                @update:model-value="v => updateTextStyle('fontFamily', v)"
              >
                <el-option
                  v-for="font in fontFamilies"
                  :key="font.value"
                  :label="font.label"
                  :value="font.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="字号">
              <el-input-number
                :model-value="propsForm.textStyle?.fontSize"
                @update:model-value="v => updateTextStyle('fontSize', v)"
                :min="12"
                :max="72"
                controls-position="right"
              />
            </el-form-item>
            <el-form-item label="颜色">
              <el-color-picker
                :model-value="propsForm.textStyle?.color"
                @update:model-value="v => updateTextStyle('color', v)"
              />
            </el-form-item>
            <el-form-item label="加粗">
              <el-select
                :model-value="propsForm.textStyle?.fontWeight"
                @update:model-value="v => updateTextStyle('fontWeight', v)"
              >
                <el-option label="正常" value="normal" />
                <el-option label="加粗" value="bold" />
              </el-select>
            </el-form-item>
            <el-form-item label="对齐">
              <el-radio-group
                :model-value="propsForm.textStyle?.textAlign"
                @update:model-value="v => updateTextStyle('textAlign', v)"
              >
                <el-radio-button
                  v-for="opt in textAlignOptions"
                  :key="opt.value"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-form>
        </el-collapse-item>
        
        <el-collapse-item v-if="selectedComponent.type === 'button'" title="按钮属性" name="button">
          <el-form label-width="70px" size="small">
            <el-form-item label="文本">
              <el-input
                :model-value="propsForm.text"
                @update:model-value="v => updateProps('text', v)"
              />
            </el-form-item>
            <el-form-item label="类型">
              <el-select
                :model-value="propsForm.buttonStyle?.type"
                @update:model-value="v => updateButtonStyle('type', v)"
              >
                <el-option
                  v-for="type in buttonTypes"
                  :key="type.value"
                  :label="type.label"
                  :value="type.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="尺寸">
              <el-select
                :model-value="propsForm.buttonStyle?.size"
                @update:model-value="v => updateButtonStyle('size', v)"
              >
                <el-option
                  v-for="size in buttonSizes"
                  :key="size.value"
                  :label="size.label"
                  :value="size.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="朴素">
              <el-switch
                :model-value="propsForm.buttonStyle?.plain"
                @update:model-value="v => updateButtonStyle('plain', v)"
              />
            </el-form-item>
            <el-form-item label="圆角">
              <el-switch
                :model-value="propsForm.buttonStyle?.round"
                @update:model-value="v => updateButtonStyle('round', v)"
              />
            </el-form-item>
          </el-form>
        </el-collapse-item>
        
        <el-collapse-item v-if="selectedComponent.type === 'input'" title="输入框属性" name="input">
          <el-form label-width="70px" size="small">
            <el-form-item label="占位符">
              <el-input
                :model-value="propsForm.inputStyle?.placeholder"
                @update:model-value="v => updateInputStyle('placeholder', v)"
              />
            </el-form-item>
            <el-form-item label="最大长度">
              <el-input-number
                :model-value="propsForm.inputStyle?.maxlength"
                @update:model-value="v => updateInputStyle('maxlength', v)"
                :min="1"
                controls-position="right"
              />
            </el-form-item>
            <el-form-item label="禁用">
              <el-switch
                :model-value="propsForm.inputStyle?.disabled"
                @update:model-value="v => updateInputStyle('disabled', v)"
              />
            </el-form-item>
            <el-form-item label="可清空">
              <el-switch
                :model-value="propsForm.inputStyle?.clearable"
                @update:model-value="v => updateInputStyle('clearable', v)"
              />
            </el-form-item>
          </el-form>
        </el-collapse-item>
        
        <el-collapse-item v-if="selectedComponent.type === 'image'" title="图片属性" name="image">
          <el-form label-width="70px" size="small">
            <el-form-item label="图片地址">
              <el-input
                :model-value="propsForm.imageStyle?.src"
                @update:model-value="v => {
                  const imageStyle = { ...selectedComponent.props.imageStyle, src: v }
                  updateProps('imageStyle', imageStyle)
                }"
                placeholder="请输入图片URL"
              />
            </el-form-item>
            <el-form-item label="适配方式">
              <el-select
                :model-value="propsForm.imageStyle?.objectFit"
                @update:model-value="v => {
                  const imageStyle = { ...selectedComponent.props.imageStyle, objectFit: v }
                  updateProps('imageStyle', imageStyle)
                }"
              >
                <el-option label="填充" value="fill" />
                <el-option label="包含" value="contain" />
                <el-option label="覆盖" value="cover" />
                <el-option label="无" value="none" />
              </el-select>
            </el-form-item>
          </el-form>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<style scoped lang="scss">
.property-panel {
  width: 280px;
  height: 100%;
  background: #fff;
  border-left: 1px solid #e4e7ed;
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

  .empty-state {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .panel-content {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
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

:deep(.el-form-item) {
  margin-bottom: 12px;
}

:deep(.el-form-item__label) {
  font-size: 12px;
}

:deep(.el-input-number) {
  width: 100%;
}
</style>
