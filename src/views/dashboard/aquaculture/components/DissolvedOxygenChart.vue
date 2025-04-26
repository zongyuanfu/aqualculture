<template>
  <div :class="className" :style="{ height, width }" />
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons')
import resize from './mixins/resize'
import { fetchList } from '@/api/water'

export default {
  name: 'DissolvedOxygenChart',
  mixins: [resize],
  props: {
    className: { type: String, default: 'chart' },
    width: { type: String, default: '100%' },
    height: { type: String, default: '300px' }
  },
  data() {
    return {
      chart: null
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.chart = echarts.init(this.$el, 'macarons')
      this.fetchData()
    })
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose()
      this.chart = null
    }
  },
  methods: {
    fetchData() {
      fetchList({ limit: 7 })
        .then(({ data }) => {
          const items = data.items || []
          const xAxisData = items.map(item => {
            const d = new Date(item.timestamp)
            return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`
          })
          const seriesData = items.map(item => item.oxygen || 0)
          this.setOptions(xAxisData, seriesData)
        })
        .catch(err => {
          console.error('获取溶氧量数据失败:', err)
          this.setOptions(
            ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
            [8.0, 7.8, 8.2, 7.9, 8.1, 8.3, 8.0]
          )
        })
    },
    setOptions(xAxisData, seriesData) {
      this.chart.setOption({
        title: {
          text: '溶氧量变化趋势',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: xAxisData
        },
        yAxis: {
          type: 'value',
          name: '溶氧量 (mg/L)',
          // 固定刻度范围，基于常见溶氧量 4-8 mg/L
          min: 4,
          max: 9,
          interval: 0.5,
          axisLabel: {
            formatter: '{value}'
          }
        },
        series: [
          {
            name: '溶氧量',
            type: 'line',
            smooth: true,
            data: seriesData,
            markLine: {
              symbol: ['none', 'none'],
              lineStyle: {
                type: 'dashed',
                width: 2
              },
              data: [
                { name: '溶氧上限', yAxis: 8, lineStyle: { color: '#f56c6c' }},
                { name: '溶氧下限', yAxis: 4, lineStyle: { color: '#e6a23c' }}
              ]
            }
          }
        ]
      })
    }
  }
}
</script>

  <style lang="scss" scoped>
  /* 如果需要，可在此添加自定义样式 */
  </style>
