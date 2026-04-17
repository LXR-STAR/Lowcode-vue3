<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import type { SchemaComponent } from '../types'

const props = defineProps<{
  component: SchemaComponent
  mode?: string
}>()

const chartRef = ref<HTMLDivElement | null>(null)
let chartInstance: any = null

const chartOption = computed(() => props.component.props?.chartStyle?.option || {})
const chartType = computed(() => props.component.props?.chartStyle?.chartType || 'bar')

const defaultOption = computed(() => ({
  tooltip: {
    trigger: 'axis'
  },
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  },
  yAxis: {
    type: 'value'
  },
  series: [{
    data: [120, 200, 150, 80, 70, 110, 130],
    type: chartType.value,
    smooth: true
  }]
}))

async function initChart() {
  if (!chartRef.value) return
  
  try {
    const echarts = await import('echarts')
    chartInstance = echarts.init(chartRef.value)
    chartInstance.setOption({ ...defaultOption.value, ...chartOption.value })
  } catch (e) {
    console.warn('ECharts not available, using placeholder')
  }
}

function resizeChart() {
  chartInstance?.resize()
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', resizeChart)
})

watch(() => [chartOption.value, chartType.value], () => {
  if (chartInstance) {
    chartInstance.setOption({ ...defaultOption.value, ...chartOption.value })
  }
}, { deep: true })
</script>

<template>
  <div ref="chartRef" class="df-chart"></div>
</template>

<style scoped>
.df-chart {
  width: 100%;
  height: 100%;
  min-height: 200px;
}
</style>
