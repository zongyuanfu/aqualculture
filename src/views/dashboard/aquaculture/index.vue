<template>
  <div class="dashboard-editor-container">
    <panel-group @handleSetLineChartData="handleSetLineChartData" />

    <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <line-chart :chart-data="lineChartData" />
    </el-row>

    <el-row :gutter="28">
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <ph-chart />
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <temperature-chart />
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <dissolved-oxygen-chart />
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="8">
      <el-col :xs="{span: 24}" :sm="{span: 24}" :md="{span: 24}" :lg="{span: 24}" :xl="{span: 24}" style="margin-bottom:30px;">
        <water-quality-table />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import PanelGroup from './components/PanelGroup'
import LineChart from './components/LineChart'

import PhChart from './components/PhChart'
import TemperatureChart from './components/TemperatureChart'
import DissolvedOxygenChart from './components/DissolvedOxygenChart'
import WaterQualityTable from './components/WaterQualityTable'
import StatusCard from './components/StatusCard'

import { fetchList } from '@/api/water'

const defaultChartData = {
  dissolvedOxygen: { expectedData: [], actualData: [] },
  ph: { expectedData: [], actualData: [] },
  temperature: { expectedData: [], actualData: [] },
  ammonia: { expectedData: [], actualData: [] }
}

export default {
  name: 'AquacultureDashboard',
  components: {
    PanelGroup,
    LineChart,

    PhChart,
    TemperatureChart,
    DissolvedOxygenChart,
    WaterQualityTable,
    // eslint-disable-next-line vue/no-unused-components
    StatusCard
  },
  data() {
    return {
      lineChartData: { ...defaultChartData.dissolvedOxygen },
      chartDataCache: { ...defaultChartData }
    }
  },
  created() {
    this.fetchChartData('dissolvedOxygen')
  },
  methods: {
    async fetchChartData(type) {
      try {
        const { data } = await fetchList({ limit: 7 })
        let values = []

        // 根据类型获取对应的数据字段
        switch (type) {
          case 'dissolvedOxygen':
            values = data.items.map(item => item.oxygen)
            break
          case 'ph':
            values = data.items.map(item => item.ph)
            break
          case 'temperature':
            values = data.items.map(item => item.temperature || 25) // 默认值
            break
          case 'ammonia':
            values = data.items.map(item => item.nh3 || item.ammonia || 0.2) // 兼容字段名
            break
          default:
            values = data.items.map(item => item.oxygen)
        }

        this.chartDataCache[type] = {
          expectedData: values,
          actualData: values.map(v => v * 0.95), // 模拟预期值逻辑
          type // 保存当前类型
        }

        if (type === this.lineChartData.type) {
          this.lineChartData = this.chartDataCache[type]
        } else {
          this.lineChartData = { ...this.chartDataCache[type] }
        }
      } catch (error) {
        console.error('数据获取失败:', error)
      }
    },
    handleSetLineChartData(type) {
      if (!this.chartDataCache[type].actualData.length) {
        this.fetchChartData(type)
      }
      this.lineChartData = this.chartDataCache[type]
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
  position: relative;

  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
}

@media (max-width:1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
