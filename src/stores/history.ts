import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useComponentStore } from './component'
import type { EditorComponent } from '@/types'
import { DEFAULT_CONFIG } from '@/types'

export const useHistoryStore = defineStore('history', () => {
  const snapshots = ref<EditorComponent[][]>([])
  const currentIndex = ref(-1)
  const maxHistory = DEFAULT_CONFIG.maxHistory

  const canUndo = computed(() => currentIndex.value > 0)
  const canRedo = computed(() => currentIndex.value < snapshots.value.length - 1)

  function saveSnapshot() {
    const componentStore = useComponentStore()
    const snapshot = componentStore.getComponentsSnapshot()
    
    if (currentIndex.value < snapshots.value.length - 1) {
      snapshots.value = snapshots.value.slice(0, currentIndex.value + 1)
    }
    
    snapshots.value.push(snapshot)
    
    if (snapshots.value.length > maxHistory) {
      snapshots.value.shift()
    } else {
      currentIndex.value++
    }
  }

  function undo() {
    if (!canUndo.value) return
    
    currentIndex.value--
    const componentStore = useComponentStore()
    componentStore.restoreFromSnapshot(snapshots.value[currentIndex.value])
  }

  function redo() {
    if (!canRedo.value) return
    
    currentIndex.value++
    const componentStore = useComponentStore()
    componentStore.restoreFromSnapshot(snapshots.value[currentIndex.value])
  }

  function clearHistory() {
    snapshots.value = []
    currentIndex.value = -1
  }

  function initHistory() {
    const componentStore = useComponentStore()
    const snapshot = componentStore.getComponentsSnapshot()
    snapshots.value = [snapshot]
    currentIndex.value = 0
  }

  return {
    snapshots,
    currentIndex,
    canUndo,
    canRedo,
    saveSnapshot,
    undo,
    redo,
    clearHistory,
    initHistory
  }
})
