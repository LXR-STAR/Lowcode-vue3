<script setup lang="ts">
import { ref, computed } from 'vue'
import { useComponentStore, useHistoryStore } from '@/stores'
import type { ComponentStyle, TextStyle, ButtonStyle, InputStyle } from '@/types'

const componentStore = useComponentStore()
const historyStore = useHistoryStore()

const activeNames = ref(['basic', 'position', 'style'])

const selectedComponent = computed(() => {
  if (componentStore.selectedComponentIds.length === 1) {
    return componentStore.getComponentById(componentStore.selectedComponentIds[0])
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

function updateLinkStyle(key: string, value: any) {
  if (!selectedComponent.value) return
  const linkStyle = { ...(selectedComponent.value.props.linkStyle || {}), [key]: value }
  componentStore.updateComponentProps(selectedComponent.value.id, { linkStyle })
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
            <el-form-item label="内边距">
              <el-input-number
                :model-value="styleForm.padding || 0"
                @update:model-value="v => updateStyle('padding', v)"
                :min="0"
                controls-position="right"
              />
            </el-form-item>
            <el-form-item label="外边距">
              <el-input-number
                :model-value="styleForm.margin || 0"
                @update:model-value="v => updateStyle('margin', v)"
                :min="0"
                controls-position="right"
              />
            </el-form-item>
            <el-form-item label="阴影">
              <el-select
                :model-value="styleForm.boxShadow || 'none'"
                @update:model-value="v => updateStyle('boxShadow', v)"
              >
                <el-option label="无" value="none" />
                <el-option label="轻微" value="0 2px 4px rgba(0,0,0,0.1)" />
                <el-option label="中等" value="0 4px 12px rgba(0,0,0,0.15)" />
                <el-option label="较强" value="0 8px 24px rgba(0,0,0,0.2)" />
                <el-option label="卡片" value="0 2px 12px 0 rgba(0,0,0,0.1)" />
              </el-select>
            </el-form-item>
            <el-form-item label="溢出">
              <el-select
                :model-value="styleForm.overflow || 'visible'"
                @update:model-value="v => updateStyle('overflow', v)"
              >
                <el-option label="可见" value="visible" />
                <el-option label="隐藏" value="hidden" />
                <el-option label="滚动" value="auto" />
              </el-select>
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

        <el-collapse-item v-if="selectedComponent.type === 'textarea'" title="多行文本属性" name="textarea">
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
          </el-form>
        </el-collapse-item>

        <el-collapse-item v-if="selectedComponent.type === 'select'" title="下拉选择属性" name="select">
          <el-form label-width="70px" size="small">
            <el-form-item label="占位符">
              <el-input
                :model-value="propsForm.props?.placeholder"
                @update:model-value="v => updateProps('props', { ...propsForm.props, placeholder: v })"
                placeholder="请选择"
              />
            </el-form-item>
            <el-form-item label="选项配置">
              <div v-for="(item, index) in (propsForm.props?.options || [])" :key="index" class="option-item">
                <el-row :gutter="8">
                  <el-col :span="12">
                    <el-input
                      :model-value="item.label"
                      @update:model-value="v => {
                        const options = [...(propsForm.props?.options || [])]
                        options[index] = { ...options[index], label: v }
                        updateProps('props', { ...propsForm.props, options })
                      }"
                      placeholder="显示文字"
                      size="small"
                    />
                  </el-col>
                  <el-col :span="12">
                    <el-input
                      :model-value="item.value"
                      @update:model-value="v => {
                        const options = [...(propsForm.props?.options || [])]
                        options[index] = { ...options[index], value: v }
                        updateProps('props', { ...propsForm.props, options })
                      }"
                      placeholder="值"
                      size="small"
                    />
                  </el-col>
                </el-row>
              </div>
              <el-button size="small" @click="() => {
                const options = [...(propsForm.props?.options || []), { label: '新选项', value: Date.now().toString() }]
                updateProps('props', { ...propsForm.props, options })
              }" style="width: 100%; margin-top: 8px;">
                <el-icon><Plus /></el-icon> 添加选项
              </el-button>
            </el-form-item>
            <el-form-item label="禁用">
              <el-switch
                :model-value="propsForm.props?.disabled"
                @update:model-value="v => updateProps('props', { ...propsForm.props, disabled: v })"
              />
            </el-form-item>
            <el-form-item label="可清空">
              <el-switch
                :model-value="propsForm.props?.clearable"
                @update:model-value="v => updateProps('props', { ...propsForm.props, clearable: v })"
              />
            </el-form-item>
            <el-form-item label="多选">
              <el-switch
                :model-value="propsForm.props?.multiple"
                @update:model-value="v => updateProps('props', { ...propsForm.props, multiple: v })"
              />
            </el-form-item>
          </el-form>
        </el-collapse-item>

        <el-collapse-item v-if="selectedComponent.type === 'checkbox'" title="复选框属性" name="checkbox">
          <el-form label-width="70px" size="small">
            <el-form-item label="标签">
              <el-input
                :model-value="propsForm.props?.label"
                @update:model-value="v => updateProps('props', { ...propsForm.props, label: v })"
                placeholder="复选框文字"
              />
            </el-form-item>
            <el-form-item label="选中">
              <el-switch
                :model-value="propsForm.props?.checked"
                @update:model-value="v => updateProps('props', { ...propsForm.props, checked: v })"
              />
            </el-form-item>
            <el-form-item label="禁用">
              <el-switch
                :model-value="propsForm.props?.disabled"
                @update:model-value="v => updateProps('props', { ...propsForm.props, disabled: v })"
              />
            </el-form-item>
          </el-form>
        </el-collapse-item>

        <el-collapse-item v-if="selectedComponent.type === 'radio'" title="单选框属性" name="radio">
          <el-form label-width="70px" size="small">
            <el-form-item label="选项配置">
              <div v-for="(item, index) in (propsForm.props?.options || [])" :key="index" class="option-item">
                <el-row :gutter="8">
                  <el-col :span="12">
                    <el-input
                      :model-value="item.label"
                      @update:model-value="v => {
                        const options = [...(propsForm.props?.options || [])]
                        options[index] = { ...options[index], label: v }
                        updateProps('props', { ...propsForm.props, options })
                      }"
                      placeholder="显示文字"
                      size="small"
                    />
                  </el-col>
                  <el-col :span="12">
                    <el-input
                      :model-value="item.value"
                      @update:model-value="v => {
                        const options = [...(propsForm.props?.options || [])]
                        options[index] = { ...options[index], value: v }
                        updateProps('props', { ...propsForm.props, options })
                      }"
                      placeholder="值"
                      size="small"
                    />
                  </el-col>
                </el-row>
              </div>
              <el-button size="small" @click="() => {
                const options = [...(propsForm.props?.options || []), { label: '新选项', value: Date.now().toString() }]
                updateProps('props', { ...propsForm.props, options })
              }" style="width: 100%; margin-top: 8px;">
                <el-icon><Plus /></el-icon> 添加选项
              </el-button>
            </el-form-item>
            <el-form-item label="禁用">
              <el-switch
                :model-value="propsForm.props?.disabled"
                @update:model-value="v => updateProps('props', { ...propsForm.props, disabled: v })"
              />
            </el-form-item>
          </el-form>
        </el-collapse-item>

        <el-collapse-item v-if="selectedComponent.type === 'switch'" title="开关属性" name="switch">
          <el-form label-width="70px" size="small">
            <el-form-item label="开启状态">
              <el-switch
                :model-value="propsForm.props?.value"
                @update:model-value="v => updateProps('props', { ...propsForm.props, value: v })"
              />
            </el-form-item>
            <el-form-item label="开启文字">
              <el-input
                :model-value="propsForm.props?.activeText"
                @update:model-value="v => updateProps('props', { ...propsForm.props, activeText: v })"
                placeholder="开启时显示"
              />
            </el-form-item>
            <el-form-item label="关闭文字">
              <el-input
                :model-value="propsForm.props?.inactiveText"
                @update:model-value="v => updateProps('props', { ...propsForm.props, inactiveText: v })"
                placeholder="关闭时显示"
              />
            </el-form-item>
            <el-form-item label="禁用">
              <el-switch
                :model-value="propsForm.props?.disabled"
                @update:model-value="v => updateProps('props', { ...propsForm.props, disabled: v })"
              />
            </el-form-item>
          </el-form>
        </el-collapse-item>

        <el-collapse-item v-if="selectedComponent.type === 'datePicker'" title="日期选择属性" name="datePicker">
          <el-form label-width="70px" size="small">
            <el-form-item label="占位符">
              <el-input
                :model-value="propsForm.props?.placeholder"
                @update:model-value="v => updateProps('props', { ...propsForm.props, placeholder: v })"
              />
            </el-form-item>
            <el-form-item label="类型">
              <el-select
                :model-value="propsForm.props?.dateType"
                @update:model-value="v => updateProps('props', { ...propsForm.props, dateType: v })"
              >
                <el-option label="日期" value="date" />
                <el-option label="日期时间" value="datetime" />
                <el-option label="日期范围" value="daterange" />
                <el-option label="月份" value="month" />
                <el-option label="年份" value="year" />
              </el-select>
            </el-form-item>
            <el-form-item label="禁用">
              <el-switch
                :model-value="propsForm.props?.disabled"
                @update:model-value="v => updateProps('props', { ...propsForm.props, disabled: v })"
              />
            </el-form-item>
          </el-form>
        </el-collapse-item>

        <el-collapse-item v-if="selectedComponent.type === 'chart'" title="图表属性" name="chart">
          <el-form label-width="70px" size="small">
            <el-form-item label="图表类型">
              <el-select
                :model-value="propsForm.chartStyle?.chartType"
                @update:model-value="v => {
                  const chartStyle = { ...selectedComponent.props.chartStyle, chartType: v }
                  updateProps('chartStyle', chartStyle)
                }"
              >
                <el-option label="柱状图" value="bar" />
                <el-option label="折线图" value="line" />
                <el-option label="饼图" value="pie" />
                <el-option label="散点图" value="scatter" />
                <el-option label="雷达图" value="radar" />
              </el-select>
            </el-form-item>
            <el-form-item label="标题">
              <el-input
                :model-value="propsForm.chartStyle?.option?.title?.text"
                @update:model-value="v => {
                  const option = { ...propsForm.chartStyle?.option, title: { text: v } }
                  updateProps('chartStyle', { ...propsForm.chartStyle, option })
                }"
                placeholder="图表标题"
              />
            </el-form-item>
            <el-form-item label="X轴数据">
              <input
                type="text"
                class="chart-data-input"
                :value="(propsForm.chartStyle?.option?.xAxis?.data || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']).join(', ')"
                @change="(e: Event) => {
                  const target = e.target as HTMLInputElement
                  const data = target.value.split(/[,，]/).map((s: string) => s.trim()).filter(Boolean)
                  const option = { ...propsForm.chartStyle?.option, xAxis: { ...propsForm.chartStyle?.option?.xAxis, data } }
                  updateProps('chartStyle', { ...propsForm.chartStyle, option })
                }"
                placeholder="用逗号分隔（中英文均可）"
              />
            </el-form-item>
            <el-form-item label="数据值">
              <input
                type="text"
                class="chart-data-input"
                :value="(propsForm.chartStyle?.option?.series?.[0]?.data || [120, 200, 150, 80, 70, 110, 130]).join(', ')"
                @change="(e: Event) => {
                  const target = e.target as HTMLInputElement
                  const data = target.value.split(/[,，]/).map((s: string) => Number(s.trim())).filter(n => !isNaN(n))
                  const series = [{ ...(propsForm.chartStyle?.option?.series?.[0] || { name: '数据', type: propsForm.chartStyle?.chartType || 'bar' }), data }]
                  const option = { ...propsForm.chartStyle?.option, series }
                  updateProps('chartStyle', { ...propsForm.chartStyle, option })
                }"
                placeholder="用逗号分隔数字（中英文均可）"
              />
            </el-form-item>
          </el-form>
        </el-collapse-item>

        <el-collapse-item v-if="selectedComponent.type === 'table'" title="表格属性" name="table">
          <el-form label-width="70px" size="small">
            <el-form-item label="显示斑马纹">
              <el-switch
                :model-value="propsForm.stripe"
                @update:model-value="v => updateProps('stripe', v)"
              />
            </el-form-item>
            <el-form-item label="显示边框">
              <el-switch
                :model-value="propsForm.border"
                @update:model-value="v => updateProps('border', v)"
              />
            </el-form-item>
            <el-form-item label="尺寸">
              <el-select
                :model-value="propsForm.size"
                @update:model-value="v => updateProps('size', v)"
              >
                <el-option label="大" value="large" />
                <el-option label="默认" value="default" />
                <el-option label="小" value="small" />
              </el-select>
            </el-form-item>
            <el-divider content-position="left">列配置</el-divider>
            <div v-for="(col, index) in (propsForm.columns || [])" :key="index" class="table-column-item">
              <el-row :gutter="8">
                <el-col :span="12">
                  <el-input
                    :model-value="col.prop"
                    @update:model-value="v => {
                      const columns = [...(propsForm.columns || [])]
                      columns[index] = { ...columns[index], prop: v }
                      updateProps('columns', columns)
                    }"
                    placeholder="字段名"
                    size="small"
                  />
                </el-col>
                <el-col :span="12">
                  <el-input
                    :model-value="col.label"
                    @update:model-value="v => {
                      const columns = [...(propsForm.columns || [])]
                      columns[index] = { ...columns[index], label: v }
                      updateProps('columns', columns)
                    }"
                    placeholder="显示名"
                    size="small"
                  />
                </el-col>
              </el-row>
            </div>
            <el-button size="small" @click="() => {
              const columns = [...(propsForm.columns || [{ prop: 'name', label: '姓名' }, { prop: 'age', label: '年龄' }]), { prop: 'new', label: '新列' }]
              updateProps('columns', columns)
            }" style="width: 100%; margin-top: 8px;">
              <el-icon><Plus /></el-icon> 添加列
            </el-button>
            <el-divider content-position="left">数据配置</el-divider>
            <div v-for="(row, rowIndex) in (propsForm.data || [])" :key="rowIndex" class="table-column-item">
              <div class="row-header">
                <span>第 {{ rowIndex + 1 }} 行</span>
                <el-button type="danger" size="small" text @click="() => {
                  const data = [...(propsForm.data || [])]
                  data.splice(rowIndex, 1)
                  updateProps('data', data)
                }">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
              <div v-for="(col, colIndex) in (propsForm.columns || [])" :key="colIndex" class="row-field">
                <input
                  type="text"
                  class="table-row-input"
                  :value="row[col.prop] || ''"
                  @input="(e: Event) => {
                    const target = e.target as HTMLInputElement
                    const data = JSON.parse(JSON.stringify(propsForm.data || []))
                    if (!data[rowIndex]) {
                      data[rowIndex] = {}
                    }
                    data[rowIndex][col.prop] = target.value
                    updateProps('data', data)
                  }"
                  :placeholder="col.label"
                />
              </div>
            </div>
            <el-button size="small" @click="() => {
              const columns = propsForm.columns || []
              const newRow: Record<string, string> = {}
              columns.forEach((col: any) => {
                newRow[col.prop] = ''
              })
              const data = [...(propsForm.data || []), newRow]
              updateProps('data', data)
            }" style="width: 100%; margin-top: 8px;">
              <el-icon><Plus /></el-icon> 添加行
            </el-button>
          </el-form>
        </el-collapse-item>

        <el-collapse-item v-if="selectedComponent.type === 'link'" title="链接属性" name="link">
          <el-form label-width="70px" size="small">
            <el-form-item label="链接文字">
              <el-input
                :model-value="propsForm.text"
                @update:model-value="v => updateProps('text', v)"
              />
            </el-form-item>
            <el-form-item label="链接地址">
              <el-input
                :model-value="propsForm.linkStyle?.href"
                @update:model-value="v => updateLinkStyle('href', v)"
                placeholder="https://"
              />
            </el-form-item>
            <el-form-item label="打开方式">
              <el-select
                :model-value="propsForm.linkStyle?.target || '_blank'"
                @update:model-value="v => updateLinkStyle('target', v)"
              >
                <el-option label="新窗口" value="_blank" />
                <el-option label="当前窗口" value="_self" />
              </el-select>
            </el-form-item>
            <el-form-item label="颜色">
              <el-color-picker
                :model-value="propsForm.linkStyle?.color || '#409eff'"
                @update:model-value="v => updateLinkStyle('color', v)"
              />
            </el-form-item>
            <el-form-item label="字号">
              <el-input-number
                :model-value="propsForm.linkStyle?.fontSize || 14"
                @update:model-value="v => updateLinkStyle('fontSize', v)"
                :min="12"
                :max="72"
                controls-position="right"
              />
            </el-form-item>
            <el-form-item label="粗细">
              <el-select
                :model-value="propsForm.linkStyle?.fontWeight || 'normal'"
                @update:model-value="v => updateLinkStyle('fontWeight', v)"
              >
                <el-option label="正常" value="normal" />
                <el-option label="粗体" value="bold" />
                <el-option label="更粗" value="bolder" />
                <el-option label="更细" value="lighter" />
              </el-select>
            </el-form-item>
            <el-form-item label="下划线">
              <el-switch
                :model-value="propsForm.linkStyle?.underline !== false"
                @update:model-value="v => updateLinkStyle('underline', v)"
              />
            </el-form-item>
          </el-form>
        </el-collapse-item>

        <el-collapse-item v-if="selectedComponent.type === 'container'" title="容器属性" name="container">
          <el-form label-width="70px" size="small">
            <el-form-item label="排列方向">
              <el-select
                :model-value="propsForm.props?.direction || 'column'"
                @update:model-value="v => updateProps('props', { ...propsForm.props, direction: v })"
              >
                <el-option label="横向排列" value="row" />
                <el-option label="纵向排列" value="column" />
              </el-select>
            </el-form-item>
            <el-form-item label="主轴对齐">
              <el-select
                :model-value="propsForm.props?.justify || 'flex-start'"
                @update:model-value="v => updateProps('props', { ...propsForm.props, justify: v })"
              >
                <el-option label="起始对齐" value="flex-start" />
                <el-option label="居中对齐" value="center" />
                <el-option label="末尾对齐" value="flex-end" />
                <el-option label="两端对齐" value="space-between" />
                <el-option label="均匀分布" value="space-around" />
              </el-select>
            </el-form-item>
            <el-form-item label="交叉轴对齐">
              <el-select
                :model-value="propsForm.props?.align || 'flex-start'"
                @update:model-value="v => updateProps('props', { ...propsForm.props, align: v })"
              >
                <el-option label="起始对齐" value="flex-start" />
                <el-option label="居中对齐" value="center" />
                <el-option label="末尾对齐" value="flex-end" />
                <el-option label="拉伸填充" value="stretch" />
              </el-select>
            </el-form-item>
            <el-form-item label="间距">
              <el-input-number
                :model-value="propsForm.props?.gap || 8"
                @update:model-value="v => updateProps('props', { ...propsForm.props, gap: v })"
                :min="0"
                controls-position="right"
              />
            </el-form-item>
            <el-form-item label="内边距">
              <el-input-number
                :model-value="propsForm.props?.padding || 16"
                @update:model-value="v => updateProps('props', { ...propsForm.props, padding: v })"
                :min="0"
                controls-position="right"
              />
            </el-form-item>
            <el-form-item label="自动扩展">
              <el-switch
                :model-value="propsForm.props?.autoExpand ?? true"
                @update:model-value="v => updateProps('props', { ...propsForm.props, autoExpand: v })"
              />
              <div class="form-item-tip">内容超出时自动扩大容器高度</div>
            </el-form-item>
            <el-form-item label="显示边框">
              <el-switch
                :model-value="propsForm.props?.showBorder ?? true"
                @update:model-value="v => updateProps('props', { ...propsForm.props, showBorder: v })"
              />
            </el-form-item>
          </el-form>
        </el-collapse-item>

        <el-collapse-item v-if="selectedComponent.type === 'grid'" title="栅格属性" name="grid">
          <el-form label-width="70px" size="small">
            <el-form-item label="列数">
              <el-input-number
                :model-value="propsForm.props?.columns || 2"
                @update:model-value="v => updateProps('props', { ...propsForm.props, columns: v })"
                :min="1"
                :max="12"
                controls-position="right"
              />
            </el-form-item>
            <el-form-item label="行间距">
              <el-input-number
                :model-value="propsForm.props?.rowGap || 16"
                @update:model-value="v => updateProps('props', { ...propsForm.props, rowGap: v })"
                :min="0"
                controls-position="right"
              />
            </el-form-item>
            <el-form-item label="列间距">
              <el-input-number
                :model-value="propsForm.props?.colGap || 16"
                @update:model-value="v => updateProps('props', { ...propsForm.props, colGap: v })"
                :min="0"
                controls-position="right"
              />
            </el-form-item>
            <el-form-item label="内边距">
              <el-input-number
                :model-value="propsForm.props?.padding || 16"
                @update:model-value="v => updateProps('props', { ...propsForm.props, padding: v })"
                :min="0"
                controls-position="right"
              />
            </el-form-item>
            <el-form-item label="自动扩展">
              <el-switch
                :model-value="propsForm.props?.autoExpand ?? true"
                @update:model-value="v => updateProps('props', { ...propsForm.props, autoExpand: v })"
              />
              <div class="form-item-tip">内容超出时自动扩大容器高度</div>
            </el-form-item>
            <el-form-item label="显示边框">
              <el-switch
                :model-value="propsForm.props?.showBorder ?? true"
                @update:model-value="v => updateProps('props', { ...propsForm.props, showBorder: v })"
              />
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

  .table-column-item {
    margin-bottom: 8px;
    padding: 8px;
    background: #f5f7fa;
    border-radius: 4px;
  }

  .option-item {
    margin-bottom: 8px;
    padding: 8px;
    background: #f5f7fa;
    border-radius: 4px;
  }

  .row-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    font-size: 12px;
    color: #606266;
  }

  .row-field {
    margin-bottom: 4px;
  }
}

.chart-data-input {
  width: 100%;
  height: 24px;
  padding: 0 8px;
  font-size: 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: #409eff;
  }

  &::placeholder {
    color: #c0c4cc;
  }
}

.table-row-input {
  width: 100%;
  height: 24px;
  padding: 0 8px;
  font-size: 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  outline: none;
  transition: border-color 0.2s;
  margin-bottom: 4px;

  &:focus {
    border-color: #409eff;
  }

  &::placeholder {
    color: #c0c4cc;
  }
}

.form-item-tip {
  font-size: 11px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.4;
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
