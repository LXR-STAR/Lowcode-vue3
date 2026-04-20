import { defineStore } from 'pinia'
import { ref, shallowRef, computed } from 'vue'
import { useComponentStore } from './component'
import type { EditorComponent } from '@/types'
import { DEFAULT_CONFIG } from '@/types'

export const useHistoryStore = defineStore('history', () => {
  const snapshots = shallowRef<EditorComponent[][]>([])
  const currentIndex = ref(-1)
  const maxHistory = DEFAULT_CONFIG.maxHistory
  let saveTimer: ReturnType<typeof setTimeout> | null = null

  const canUndo = computed(() => currentIndex.value > 0)
  const canRedo = computed(() => currentIndex.value < snapshots.value.length - 1)

  function saveSnapshot(debounce: boolean = true) {
    if (debounce) {
      if (saveTimer) {
        clearTimeout(saveTimer)
      }
      saveTimer = setTimeout(() => {
        performSave()
        saveTimer = null
      }, 300)
    } else {
      performSave()
    }
  }

  function performSave() {
    const componentStore = useComponentStore()
    const snapshot = componentStore.getComponentsSnapshot()

    const newSnapshots = currentIndex.value < snapshots.value.length - 1
      ? snapshots.value.slice(0, currentIndex.value + 1)
      : [...snapshots.value]

    newSnapshots.push(snapshot)

    if (newSnapshots.length > maxHistory) {
      newSnapshots.shift()
      currentIndex.value = newSnapshots.length - 1
    } else {
      currentIndex.value++
    }

    snapshots.value = newSnapshots
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
