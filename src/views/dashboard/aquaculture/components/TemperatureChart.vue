<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import resize from './mixins/resize'
import { fetchList } from '@/api/water' // 导入API

export default {
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '300px'
    }
  },
  data() {
    return {
      chart: null,
      chartData: [] // 用于存储从API获取的数据
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart()
      this.fetchData() // 获取数据
    })
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$el, 'macarons')
      // 初始化时不设置数据，等待API返回
    },
    fetchData() {
      // 获取温度数据，limit=7表示获取最近7条
      fetchList({ limit: 7 })
        .then(response => {
          const items = response.data.items || []
          // 从mock数据中获取timestamp和temperature字段
          const xAxisData = items.map(item => {
            const date = new Date(item.timestamp)
            return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
          })
          // 使用temperature字段，如果不存在则使用默认值
          const seriesData = items.map(item => item.temperature || 25)
          this.chartData = seriesData // 保存数据
          this.setOptions(xAxisData, seriesData) // 使用获取的数据更新图表
        })
        .catch(error => {
          console.error('获取水温数据失败:', error)
          // 出错时显示默认数据
          this.setOptions(['周一', '周二', '周三', '周四', '周五', '周六', '周日'], [25.5, 25.2, 26.5, 26.2, 25.8, 25.5, 24.8])
        })
    },
    setOptions(xAxisData, seriesData) {
      this.chart.setOption({
        title: {
          text: '水温变化趋势',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: xAxisData // 使用获取的X轴数据
        },
        yAxis: {
          type: 'value',
          name: '温度(°C)',
          min: 0,
          max: 35,
          interval: 5,
          axisLabel: {
            formatter: '{value} '
          }
        },
        series: [{
          name: '水温',
          type: 'line',
          smooth: true,
          data: seriesData, // 使用获取的系列数据
          markLine: {
            data: [
              // 移除平均值标记线和箭头
              {
                name: '温度上限',
                yAxis: 28,
                lineStyle: { color: '#f56c6c' }
              },
              {
                name: '温度下限',
                yAxis: 22,
                lineStyle: { color: '#e6a23c' }
              }
            ]
          }
        }]
      })
    }
  }
}
</script>
