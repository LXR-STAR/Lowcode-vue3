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
  const customOption = props.component.props.chartStyle?.option || {}

  const baseOption: any = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: customOption?.series?.[0]?.name ? [customOption.series[0].name] : ['数据'],
      ...(customOption?.legend || { top: 'bottom' })
    },
    grid: {
      left: '3%',
      right: '4%',
      top: customOption?.title?.text ? 60 : 30,
      bottom: 40,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: customOption?.xAxis?.data || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: customOption?.series?.[0]?.name || '数据',
        type: chartType.value,
        data: customOption?.series?.[0]?.data || [120, 200, 150, 80, 70, 110, 130]
      }
    ]
  }

  if (customOption?.title?.text) {
    baseOption.title = { text: customOption.title.text, left: 'center' }
  }

  if (chartType.value === 'pie') {
    baseOption.tooltip = { trigger: 'item' }
    const pieData = (customOption?.series?.[0]?.data || [120, 200, 150, 80, 70, 110, 130]).map((value: number, index: number) => ({
      value,
      name: (customOption?.xAxis?.data || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])[index] || `数据${index + 1}`
    }))
    baseOption.series = [{
      name: customOption?.series?.[0]?.name || '数据',
      type: 'pie',
      radius: '50%',
      data: pieData
    }]
    delete baseOption.xAxis
    delete baseOption.yAxis
    delete baseOption.grid
  }

  if (customOption?.legend) {
    baseOption.legend = { ...baseOption.legend, ...customOption.legend }
  }

  return baseOption
})

function initChart() {
  if (!chartRef.value) return

  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
  }
  chartInstance.setOption(defaultOptions.value, true)
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
