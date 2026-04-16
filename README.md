# DevFlow - 低代码可视化搭建平台

一个基于 Vue3 + TypeScript 的可视化页面搭建平台，支持拖拽组件快速生成页面。

## ✨ 功能特性

### 核心功能
- 🎯 **组件拖拽** - 从组件面板拖拽组件到画布，实时预览放置位置
- 📐 **8点缩放** - 选中组件后可通过8个控制点自由调整大小
- 📏 **对齐辅助线** - 拖拽/缩放时自动显示对齐辅助线，支持组件间对齐和画布居中
- 🔲 **网格吸附** - 开启后组件自动吸附到网格线
- ↩️ **撤销/重做** - 支持最多50步历史记录，快捷键 Ctrl+Z/Y

### 组件库
| 组件类型 | 说明 |
|---------|------|
| 文本组件 | 支持字体、颜色、对齐等样式编辑 |
| 图片组件 | 支持URL设置、适配方式配置 |
| 按钮组件 | 支持类型、尺寸、样式配置 |
| 输入框组件 | 支持占位符、禁用等配置 |
| 图表组件 | ECharts集成，支持多种图表类型 |
| 容器组件 | 可作为其他组件的容器 |

### 高级功能
- 📚 **图层管理** - 上移、下移、置顶、置底、显示/隐藏、锁定
- 👁️ **页面预览** - 预览模式查看最终效果
- 📤 **JSON导出** - 导出页面配置为JSON文件
- 📥 **JSON导入** - 导入已有页面配置
- ⌨️ **快捷键支持** - Ctrl+C/V/Z/Y/A, Delete等

## 🛠️ 技术栈

- **框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **状态管理**: Pinia
- **UI组件库**: Element Plus
- **图表库**: ECharts
- **路由**: Vue Router

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

## 🎮 使用指南

### 基本操作

1. **添加组件**: 从左侧组件面板拖拽组件到画布
2. **选中组件**: 点击画布上的组件进行选中，按住 Ctrl 可多选
3. **移动组件**: 拖拽选中的组件移动位置
4. **调整大小**: 选中组件后，拖拽8个控制点调整大小
5. **编辑属性**: 在右侧属性面板编辑组件样式和属性

### 快捷键

| 快捷键 | 功能 |
|-------|------|
| Ctrl + Z | 撤销 |
| Ctrl + Y | 重做 |
| Ctrl + C | 复制 |
| Ctrl + V | 粘贴 |
| Ctrl + A | 全选 |
| Delete | 删除选中组件 |
| Alt + 拖拽 | 平移画布 |
| Ctrl + 滚轮 | 缩放画布 |
| Shift + 拖拽 | 框选组件 |

### 图层操作

- **上移一层**: 将组件在图层中向上移动
- **下移一层**: 将组件在图层中向下移动
- **置顶**: 将组件移至最顶层
- **置底**: 将组件移至最底层
- **锁定**: 锁定后组件不可编辑
- **隐藏**: 隐藏组件

## 📁 项目结构

```
src/
├── components/
│   ├── editor/              # 编辑器核心组件
│   │   ├── CanvasArea.vue   # 画布区域
│   │   ├── ComponentPanel.vue # 组件面板
│   │   ├── PropertyPanel.vue # 属性面板
│   │   ├── Toolbar.vue      # 工具栏
│   │   ├── LayerPanel.vue   # 图层面板
│   │   └── RenderComponent.vue # 组件渲染器
│   └── components/          # 基础组件库
│       ├── TextComponent.vue
│       ├── ImageComponent.vue
│       ├── ButtonComponent.vue
│       ├── InputComponent.vue
│       ├── ChartComponent.vue
│       └── ContainerComponent.vue
├── stores/                  # Pinia状态管理
│   ├── component.ts         # 组件状态
│   ├── editor.ts            # 编辑器状态
│   └── history.ts           # 历史记录
├── types/                   # TypeScript类型定义
│   ├── component.ts         # 组件类型
│   └── index.ts             # 导出和配置
├── views/                   # 页面视图
│   ├── EditorView.vue       # 编辑器主页面
│   └── PreviewView.vue      # 预览页面
└── router/                  # 路由配置
```

## 🔧 核心实现

### 拖拽预览

拖拽组件时显示虚线预览框，实时反馈放置位置：

```typescript
// 在 dragover 事件中计算预览位置
function handleDragOver(e: DragEvent) {
  const x = (e.clientX - rect.left - offsetX) / scale
  const y = (e.clientY - rect.top - offsetY) / scale
  dragPreview.value = { x, y, width, height }
}
```

### 对齐辅助线

拖拽/缩放时自动检测对齐点，显示辅助线：

```typescript
function calculateAlignmentLines(x, y, width, height) {
  const threshold = 5 // 对齐阈值
  // 检测与画布边缘、中心线、其他组件的对齐
  // 返回需要显示的辅助线位置
}
```

### 撤销/重做

基于命令模式实现历史记录管理：

```typescript
// 保存快照
function saveSnapshot() {
  snapshots.push(cloneDeep(components))
  currentIndex++
}

// 撤销
function undo() {
  if (canUndo) {
    currentIndex--
    components = cloneDeep(snapshots[currentIndex])
  }
}
```

## 📄 JSON Schema

导出的JSON格式：

```json
{
  "version": "1.0",
  "canvas": {
    "width": 1200,
    "height": 800
  },
  "components": [
    {
      "id": "comp_1",
      "type": "text",
      "name": "文本组件",
      "style": {
        "x": 100,
        "y": 100,
        "width": 200,
        "height": 40
      },
      "props": {
        "text": "Hello World"
      }
    }
  ]
}
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📝 License

MIT License
