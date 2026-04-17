# DevFlow - 低代码可视化搭建平台

一个基于 Vue3 + TypeScript 的可视化页面搭建平台，支持拖拽组件快速生成页面，实现所见即所得的页面设计体验。

## ✨ 项目亮点

- 🎯 **完整的可视化编辑器** - 支持拖拽预览、8点缩放、旋转、网格吸附、辅助线对齐等交互功能
- 📐 **Schema JSON 规范** - 设计统一的 Schema JSON 规范，支持页面配置的导入导出，便于模板复用和版本管理
- ⚡ **事件系统与数据绑定引擎** - 支持 8 种事件类型、7 种动作类型的可视化配置，实现组件交互逻辑
- 📦 **组件嵌套布局** - 支持 Flex/Grid 容器嵌套，实现复杂页面的可视化搭建
- 🔧 **代码生成器** - 将设计稿一键导出为可运行的 HTML/Vue 代码，提升开发效率
- 🏗️ **设计器与渲染器分离** - 渲染器可独立打包为 npm 库，供其他项目集成使用
- ⚙️ **性能优化** - 使用 shallowRef 优化响应式性能，配合防抖机制优化历史记录保存

## 📊 项目数据

| 指标 | 数据 |
|-----|------|
| 组件类型 | 14 种（基础、表单、高级） |
| 事件类型 | 8 种（click、dblclick、mouseenter 等） |
| 动作类型 | 7 种（跳转、消息、变量、API 等） |
| 历史记录 | 支持 50 步撤销重做 |
| 渲染器体积 | ~15KB gzip（独立包） |
| TypeScript 覆盖 | 100% |

## 🛠️ 技术栈

| 技术 | 版本 | 用途 |
|-----|------|------|
| Vue 3 | ^3.4.0 | 核心框架 |
| TypeScript | ^5.0.0 | 类型系统 |
| Vite | ^5.0.0 | 构建工具 |
| Pinia | ^2.1.0 | 状态管理 |
| Element Plus | ^2.4.0 | UI 组件库 |
| ECharts | ^5.4.0 | 图表库 |
| Vue Router | ^4.2.0 | 路由管理 |

## 📦 安装

```bash
# 克隆项目
git clone https://github.com/your-username/devflow.git

# 进入项目目录
cd devflow

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 🎮 功能特性

### 核心编辑功能

| 功能 | 说明 |
|-----|------|
| 组件拖拽 | 从组件面板拖拽组件到画布，实时预览放置位置 |
| 8点缩放 | 选中组件后可通过8个控制点自由调整大小 |
| 组件旋转 | 支持组件旋转，可视化旋转手柄 |
| 对齐辅助线 | 拖拽/缩放时自动显示对齐辅助线 |
| 网格吸附 | 开启后组件自动吸附到网格线 |
| 撤销/重做 | 支持最多50步历史记录，快捷键 Ctrl+Z/Y |
| 框选组合 | 支持框选多个组件进行组合/解组 |
| 图层管理 | 上移、下移、置顶、置底、显示/隐藏、锁定 |

### 组件库

| 组件类型 | 组件列表 |
|---------|---------|
| 基础组件 | 文本、图片、按钮 |
| 表单组件 | 输入框、多行文本、下拉选择、复选框、单选框、开关、日期选择器 |
| 高级组件 | 图表(ECharts)、表格、弹性容器、栅格布局 |

### 事件系统

支持的事件类型：
- `click` - 单击
- `dblclick` - 双击
- `mouseenter` - 鼠标移入
- `mouseleave` - 鼠标移出
- `focus` - 获得焦点
- `blur` - 失去焦点
- `change` - 值改变
- `submit` - 表单提交

支持的动作类型：
- `navigate` - 跳转链接
- `showMessage` - 显示消息
- `setVariable` - 设置变量
- `apiRequest` - API请求
- `showComponent` - 显示组件
- `hideComponent` - 隐藏组件
- `toggleComponent` - 切换显示

### 数据绑定

支持的数据源类型：
- **静态数据** - 直接配置 JSON 数据
- **API接口** - 支持 GET/POST 等请求方法
- **全局变量** - 跨组件共享状态

### 代码生成

支持导出格式：
- **Schema JSON** - 页面配置文件
- **HTML** - 可直接运行的 HTML 文件
- **Vue** - Vue 单文件组件

## 🎮 使用指南

### 快捷键

| 快捷键 | 功能 |
|-------|------|
| Ctrl + Z | 撤销 |
| Ctrl + Y | 重做 |
| Ctrl + C | 复制 |
| Ctrl + V | 粘贴 |
| Ctrl + A | 全选 |
| Delete | 删除选中组件 |
| Ctrl + G | 组合选中组件 |
| Ctrl + Shift + G | 取消组合 |

### 基本操作

1. **添加组件**: 从左侧组件面板拖拽组件到画布
2. **选中组件**: 点击画布上的组件进行选中，按住 Ctrl 可多选
3. **移动组件**: 拖拽选中的组件移动位置
4. **调整大小**: 选中组件后，拖拽8个控制点调整大小
5. **编辑属性**: 在右侧属性面板编辑组件样式和属性
6. **配置事件**: 在右侧事件面板配置组件交互
7. **数据绑定**: 在右侧绑定面板配置数据源绑定

## 📁 项目结构

```
src/
├── components/
│   ├── editor/              # 编辑器核心组件
│   │   ├── CanvasArea.vue   # 画布区域
│   │   ├── ComponentPanel.vue # 组件面板
│   │   ├── PropertyPanel.vue # 属性面板
│   │   ├── EventPanel.vue   # 事件配置面板
│   │   ├── DataSourcePanel.vue # 数据源面板
│   │   ├── DataBindingPanel.vue # 数据绑定面板
│   │   ├── Toolbar.vue      # 工具栏
│   │   ├── LayerPanel.vue   # 图层面板
│   │   └── RenderComponent.vue # 组件渲染器
│   └── components/          # 基础组件库
├── stores/                  # Pinia状态管理
│   ├── component.ts         # 组件状态
│   ├── editor.ts            # 编辑器状态
│   ├── history.ts           # 历史记录
│   ├── event.ts             # 事件状态
│   └── dataSource.ts        # 数据源状态
├── types/                   # TypeScript类型定义
├── utils/                   # 工具函数
│   ├── schema.ts            # Schema导入导出
│   ├── codeGenerator.ts     # 代码生成器
│   └── componentRegistry.ts # 组件注册
├── renderer/                # 独立渲染器
│   ├── SchemaRenderer.vue   # Schema渲染器
│   └── index.ts             # 渲染器入口
├── views/                   # 页面视图
│   ├── EditorView.vue       # 编辑器主页面
│   └── PreviewView.vue      # 预览页面
└── packages/                # 独立包
    └── renderer/            # 渲染器npm包
```

## 🔧 核心实现

### 性能优化

使用 `shallowRef` 替代 `ref` 管理大型数据结构，避免深度响应式追踪：

```typescript
// 组件列表使用 shallowRef
const components = shallowRef<EditorComponent[]>([])

// 更新时创建新数组触发响应
components.value = [...components.value, newComponent]
```

历史记录保存使用防抖机制，避免频繁操作产生过多快照：

```typescript
function saveSnapshot(debounce: boolean = true) {
  if (debounce) {
    clearTimeout(saveTimer)
    saveTimer = setTimeout(() => performSave(), 300)
  } else {
    performSave()
  }
}
```

### Schema 规范

```typescript
interface SchemaPage {
  version: string
  name: string
  canvas: SchemaCanvas
  components: SchemaComponent[]
  events: EventBinding[]      // 事件配置
  dataSources: DataSource[]   // 数据源
  bindings: DataBinding[]     // 数据绑定
  metadata?: SchemaMetadata
}
```

### 渲染器独立打包

渲染器作为独立 npm 包，支持按需引入：

```typescript
import { createRenderer } from '@devflow/renderer'
import '@devflow/renderer/style.css'

app.use(createRenderer({ prefix: 'DevFlow' }))
```

## 📄 独立渲染器

`@devflow/renderer` 是一个独立的渲染器包，可以在任何 Vue3 项目中使用：

```bash
npm install @devflow/renderer
```

```vue
<template>
  <DevFlowRenderer :schema="schema" />
</template>

<script setup>
import { DevFlowRenderer } from '@devflow/renderer'
import '@devflow/renderer/style.css'
</script>
```

详见 [packages/renderer/README.md](./packages/renderer/README.md)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📝 License

MIT License
