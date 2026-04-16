import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CanvasState, GuideLine } from '@/types'
import { DEFAULT_CONFIG } from '@/types'

export interface CanvasPreset {
  name: string
  width: number
  height: number
  icon: string
  category: 'desktop' | 'tablet' | 'mobile' | 'custom'
}

export const CANVAS_PRESETS: CanvasPreset[] = [
  { name: '桌面 1920', width: 1920, height: 1080, icon: 'Monitor', category: 'desktop' },
  { name: '桌面 1440', width: 1440, height: 900, icon: 'Monitor', category: 'desktop' },
  { name: '桌面 1366', width: 1366, height: 768, icon: 'Monitor', category: 'desktop' },
  { name: '桌面 1280', width: 1280, height: 720, icon: 'Monitor', category: 'desktop' },
  { name: 'iPad Pro', width: 1024, height: 1366, icon: 'Grid', category: 'tablet' },
  { name: 'iPad', width: 768, height: 1024, icon: 'Grid', category: 'tablet' },
  { name: 'iPhone 14 Pro Max', width: 430, height: 932, icon: 'Iphone', category: 'mobile' },
  { name: 'iPhone 14', width: 390, height: 844, icon: 'Iphone', category: 'mobile' },
  { name: 'iPhone SE', width: 375, height: 667, icon: 'Iphone', category: 'mobile' },
  { name: 'Android', width: 360, height: 640, icon: 'Cellphone', category: 'mobile' },
  { name: '海报 A4', width: 794, height: 1123, icon: 'Document', category: 'custom' },
  { name: '海报 A3', width: 1123, height: 1587, icon: 'Document', category: 'custom' },
  { name: '微信海报', width: 750, height: 1334, icon: 'ChatDotRound', category: 'custom' },
  { name: 'Banner', width: 1200, height: 300, icon: 'Picture', category: 'custom' }
]

export const useEditorStore = defineStore('editor', () => {
  const canvas = ref<CanvasState>({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    width: DEFAULT_CONFIG.canvasWidth,
    height: DEFAULT_CONFIG.canvasHeight,
    showGrid: true,
    gridSize: DEFAULT_CONFIG.gridSize,
    showGuides: true,
    snapToGrid: true,
    snapToGuides: true
  })

  const guides = ref<GuideLine[]>([])
  const isDragging = ref(false)
  const isResizing = ref(false)
  const previewMode = ref(false)
  const currentPreset = ref<string>('桌面 1920')
  const draggingComponentType = ref<string | null>(null)

  const zoomLevel = computed(() => Math.round(canvas.value.scale * 100))

  function setScale(scale: number) {
    const clampedScale = Math.max(
      DEFAULT_CONFIG.minScale,
      Math.min(DEFAULT_CONFIG.maxScale, scale)
    )
    canvas.value.scale = clampedScale
  }

  function zoomIn() {
    setScale(canvas.value.scale + DEFAULT_CONFIG.scaleStep)
  }

  function zoomOut() {
    setScale(canvas.value.scale - DEFAULT_CONFIG.scaleStep)
  }

  function resetZoom() {
    canvas.value.scale = 1
    canvas.value.offsetX = 0
    canvas.value.offsetY = 0
  }

  function setOffset(x: number, y: number) {
    canvas.value.offsetX = x
    canvas.value.offsetY = y
  }

  function toggleGrid() {
    canvas.value.showGrid = !canvas.value.showGrid
  }

  function toggleGuides() {
    canvas.value.showGuides = !canvas.value.showGuides
  }

  function toggleSnapToGrid() {
    canvas.value.snapToGrid = !canvas.value.snapToGrid
  }

  function toggleSnapToGuides() {
    canvas.value.snapToGuides = !canvas.value.snapToGuides
  }

  function addGuide(type: 'horizontal' | 'vertical', position: number) {
    guides.value.push({
      id: `guide_${Date.now()}`,
      type,
      position
    })
  }

  function removeGuide(id: string) {
    const index = guides.value.findIndex(g => g.id === id)
    if (index > -1) {
      guides.value.splice(index, 1)
    }
  }

  function clearGuides() {
    guides.value = []
  }

  function snapToGridValue(value: number): number {
    if (!canvas.value.snapToGrid) return value
    return Math.round(value / canvas.value.gridSize) * canvas.value.gridSize
  }

  function setCanvasSize(width: number, height: number) {
    canvas.value.width = width
    canvas.value.height = height
  }

  function applyPreset(preset: CanvasPreset) {
    canvas.value.width = preset.width
    canvas.value.height = preset.height
    currentPreset.value = preset.name
  }

  function togglePreviewMode() {
    previewMode.value = !previewMode.value
  }

  function screenToCanvas(screenX: number, screenY: number, containerRect: DOMRect) {
    return {
      x: (screenX - containerRect.left - canvas.value.offsetX) / canvas.value.scale,
      y: (screenY - containerRect.top - canvas.value.offsetY) / canvas.value.scale
    }
  }

  function canvasToScreen(canvasX: number, canvasY: number, containerRect: DOMRect) {
    return {
      x: canvasX * canvas.value.scale + canvas.value.offsetX + containerRect.left,
      y: canvasY * canvas.value.scale + canvas.value.offsetY + containerRect.top
    }
  }

  return {
    canvas,
    guides,
    isDragging,
    isResizing,
    previewMode,
    currentPreset,
    draggingComponentType,
    zoomLevel,
    setScale,
    zoomIn,
    zoomOut,
    resetZoom,
    setOffset,
    toggleGrid,
    toggleGuides,
    toggleSnapToGrid,
    toggleSnapToGuides,
    addGuide,
    removeGuide,
    clearGuides,
    snapToGridValue,
    setCanvasSize,
    applyPreset,
    togglePreviewMode,
    screenToCanvas,
    canvasToScreen
  }
})
