<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import * as echarts from 'echarts'
import type { EditorComponent } from '@/types'

const props = defineProps<{
  component: EditorComponent
}>()

const chartRef = ref<HTMLElement | null>(null)
let chartInstance: echarts.ECharts | null = null

const chartType = computed(() => props.component.props.chartStyle?.chartType || 'bar')

const defaultOptions = computed(() => {
  const baseOption: any = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['示例数据']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '示例数据',
        type: chartType.value,
        data: [120, 200, 150, 80, 70, 110, 130]
      }
    ]
  }

  if (chartType.value === 'pie') {
    baseOption.tooltip = { trigger: 'item' }
    baseOption.series = [{
      name: '示例数据',
      type: 'pie',
      radius: '50%',
      data: [
        { value: 1048, name: 'Search Engine' },
        { value: 735, name: 'Direct' },
        { value: 580, name: 'Email' },
        { value: 484, name: 'Union Ads' },
        { value: 300, name: 'Video Ads' }
      ]
    }]
    delete baseOption.xAxis
    delete baseOption.yAxis
    delete baseOption.grid
  }

  return baseOption
})

function initChart() {
  if (!chartRef.value) return
  
  chartInstance = echarts.init(chartRef.value)
  const customOption = props.component.props.chartStyle?.option || {}
  chartInstance.setOption({ ...defaultOptions.value, ...customOption })
}

function resizeChart() {
  chartInstance?.resize()
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', resizeChart)
})

watch(() => props.component.props.chartStyle, () => {
  initChart()
}, { deep: true })

watch(() => props.component.style, () => {
  setTimeout(resizeChart, 0)
}, { deep: true })
</script>

<template>
  <div class="chart-component">
    <div ref="chartRef" class="chart-container" />
  </div>
</template>

<style scoped lang="scss">
.chart-component {
  width: 100%;
  height: 100%;
  
  .chart-container {
    width: 100%;
    height: 100%;
  }
}
</style>
