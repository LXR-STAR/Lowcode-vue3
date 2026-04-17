# @devflow/renderer

DevFlow Schema Renderer - 一个独立的低代码页面渲染器

## 安装

```bash
npm install @devflow/renderer
```

## 使用

### 基础用法

```vue
<template>
  <DevFlowRenderer :schema="schema" />
</template>

<script setup>
import { DevFlowRenderer, createRenderer } from '@devflow/renderer'
import '@devflow/renderer/style.css'

const schema = {
  version: '1.0.0',
  name: '示例页面',
  canvas: {
    width: 1920,
    height: 1080
  },
  components: [
    {
      id: '1',
      type: 'text',
      name: '标题',
      style: { x: 100, y: 100, width: 200, height: 40, zIndex: 1 },
      props: { text: 'Hello World' }
    }
  ]
}
</script>
```

### 插件方式

```typescript
import { createApp } from 'vue'
import { createRenderer } from '@devflow/renderer'
import '@devflow/renderer/style.css'
import App from './App.vue'

const app = createApp(App)
app.use(createRenderer({ prefix: 'DevFlow' }))
app.mount('#app')
```

### 事件处理

```vue
<template>
  <DevFlowRenderer 
    :schema="schema" 
    :event-bindings="eventBindings"
    @event="handleEvent"
  />
</template>

<script setup>
const handleEvent = (componentId, eventType, event) => {
  console.log(`Component ${componentId} triggered ${eventType}`)
}
</script>
```

## 支持的组件

| 组件 | 类型 | 说明 |
|-----|------|------|
| 文本 | `text` | 支持富文本样式 |
| 图片 | `image` | 图片展示 |
| 按钮 | `button` | 多种类型按钮 |
| 输入框 | `input` | 文本输入 |
| 多行文本 | `textarea` | 多行文本输入 |
| 下拉选择 | `select` | 下拉选择框 |
| 复选框 | `checkbox` | 复选框 |
| 单选框 | `radio` | 单选框 |
| 开关 | `switch` | 开关组件 |
| 日期选择 | `datePicker` | 日期选择器 |
| 图表 | `chart` | ECharts 图表 |
| 容器 | `container` | Flex 容器 |
| 栅格 | `grid` | CSS Grid 布局 |
| 表格 | `table` | 数据表格 |

## API

### Props

| 属性 | 类型 | 说明 |
|-----|------|------|
| schema | `SchemaPage` | 页面 Schema 配置 |
| mode | `'preview' \| 'edit'` | 渲染模式 |
| eventBindings | `EventBinding[]` | 事件绑定配置 |
| dataSources | `DataSource[]` | 数据源配置 |
| bindings | `DataBinding[]` | 数据绑定配置 |

### Events

| 事件 | 参数 | 说明 |
|-----|------|------|
| event | `(componentId, eventType, event)` | 组件事件触发 |

## License

MIT
