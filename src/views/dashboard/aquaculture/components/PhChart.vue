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
      // 获取pH值数据，limit=7表示获取最近7条
      fetchList({ limit: 7 })
        .then(response => {
          const items = response.data.items || []
          // 从mock数据中获取timestamp和ph字段
          const xAxisData = items.map(item => {
            const date = new Date(item.timestamp)
            return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
          })
          // 使用ph字段
          const seriesData = items.map(item => item.ph || 7.0)
          this.chartData = seriesData // 保存数据
          this.setOptions(xAxisData, seriesData) // 使用获取的数据更新图表
        })
        .catch(error => {
          console.error('获取pH值数据失败:', error)
          // 出错时显示默认数据
          this.setOptions(['周一', '周二', '周三', '周四', '周五', '周六', '周日'], [7.1, 7.2, 7.3, 7.2, 7.1, 7.0, 7.1])
        })
    },
    setOptions(xAxisData, seriesData) {
      this.chart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          top: 30, // 增加顶部空间以显示标题
          left: '2%',
          right: '2%',
          bottom: '3%',
          containLabel: true
        },
        title: { // 添加标题
          text: 'pH值变化',
          left: 'center'
        },
        xAxis: [
          {
            type: 'category',
            data: xAxisData, // 使用获取的X轴数据
            axisTick: {
              alignWithLabel: true
            }
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: 'pH值',
            min: 6.0,
            max: 9.0,
            interval: 0.2,
            axisLabel: {
              formatter: '{value}'
            }
          }
        ],
        series: [
          {
            name: 'pH值',
            type: 'bar',
            barWidth: '60%',
            data: seriesData, // 使用获取的系列数据
            itemStyle: {
              normal: {
                color: function(params) {
                  // 根据pH值设置不同颜色
                  const value = params.data
                  if (value < 6.5) return '#f56c6c' // 酸性过高
                  if (value > 7.5) return '#e6a23c' // 碱性过高
                  return '#67c23a' // 正常范围
                }
              }
            }
          }
        ]
      })
    }
  }
}
</script>
