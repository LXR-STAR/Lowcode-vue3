<script setup lang="ts">
import { computed } from 'vue'
import type { EditorComponent } from '@/types'

const props = defineProps<{
  component: EditorComponent
}>()

const columns = computed(() => props.component.props?.columns || [
  { prop: 'name', label: '姓名' },
  { prop: 'age', label: '年龄' },
  { prop: 'address', label: '地址' }
])

const data = computed(() => props.component.props?.data || [
  { name: '张三', age: 28, address: '北京市朝阳区' },
  { name: '李四', age: 32, address: '上海市浦东新区' },
  { name: '王五', age: 25, address: '广州市天河区' }
])

const stripe = computed(() => props.component.props?.stripe ?? true)
const border = computed(() => props.component.props?.border ?? true)
const size = computed(() => props.component.props?.size || 'default')
</script>

<template>
  <div class="table-component">
    <el-table
      :data="data"
      :stripe="stripe"
      :border="border"
      :size="size"
      style="width: 100%; height: 100%"
    >
      <el-table-column
        v-for="col in columns"
        :key="col.prop"
        :prop="col.prop"
        :label="col.label"
      />
    </el-table>
  </div>
</template>

<style scoped>
.table-component {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.table-component :deep(.el-table) {
  font-size: 12px;
}
</style>
