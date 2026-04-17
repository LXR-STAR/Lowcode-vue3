<script setup lang="ts">
import { computed } from 'vue'
import type { SchemaComponent } from '../types'

const props = defineProps<{
  component: SchemaComponent
  mode?: string
}>()

const columns = computed(() => props.component.props?.columns || [])
const tableData = computed(() => props.component.props?.data || [])
const stripe = computed(() => props.component.props?.stripe !== false)
const border = computed(() => props.component.props?.border !== false)
const size = computed(() => props.component.props?.size || 'default')

const tableClass = computed(() => ({
  'df-table': true,
  'is-stripe': stripe.value,
  'is-border': border.value,
  [`is-${size.value}`]: size.value
}))
</script>

<template>
  <table :class="tableClass">
    <thead>
      <tr>
        <th v-for="col in columns" :key="col.prop">
          {{ col.label }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(row, index) in tableData" :key="index">
        <td v-for="col in columns" :key="col.prop">
          {{ row[col.prop] }}
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
.df-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  color: #606266;
}

.df-table th,
.df-table td {
  padding: 12px 10px;
  text-align: left;
}

.df-table th {
  background-color: #f5f7fa;
  font-weight: 600;
  color: #909399;
}

.df-table.is-border th,
.df-table.is-border td {
  border: 1px solid #ebeef5;
}

.df-table.is-stripe tbody tr:nth-child(even) {
  background-color: #fafafa;
}

.df-table.is-small th,
.df-table.is-small td {
  padding: 8px 10px;
}

.df-table.is-large th,
.df-table.is-large td {
  padding: 16px 10px;
}
</style>
