<template>
  <div class="app-container">
    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="时间" align="center" width="160">
        <template #default="{ row }">
          <span>{{ row.timestamp | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>

      <el-table-column label="溶解氧 (mg/L)" width="120" align="center">
        <template #default="{ row }">
          <el-tag :type="row.oxygen < 5 ? 'danger' : (row.oxygen < 6.5 ? 'warning' : 'success')">{{ row.oxygen }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="pH值" width="120" align="center">
        <template #default="{ row }">
          <el-tag :type="row.ph < 6.5 || row.ph > 8.5 ? 'danger' : (row.ph < 7.0 || row.ph > 8.0 ? 'warning' : 'success')">{{ row.ph }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="水温 (°C)" width="120" align="center">
        <template #default="{ row }">
          <el-tag :type="row.temperature < 22 || row.temperature > 28 ? 'danger' : (row.temperature < 24 || row.temperature > 26 ? 'warning' : 'success')">{{ row.temperature || '25.0' }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="氨氮 (mg/L)" width="120" align="center">
        <template #default="{ row }">
          <el-tag :type="row.nh3 > 0.3 ? 'danger' : (row.nh3 > 0.2 ? 'warning' : 'success')">{{ row.nh3 }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="化学需氧量 (mg/L)" width="120" align="center">
        <template #default="{ row }">
          <el-tag :type="row.cod > 5 ? 'danger' : (row.cod > 3 ? 'warning' : 'success')">{{ row.cod }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="余氯 (mg/L)" width="120" align="center">
        <template #default="{ row }">
          <el-tag :type="row.chlorine > 0.5 ? 'danger' : (row.chlorine > 0.3 ? 'warning' : 'success')">{{ row.chlorine || '0.2' }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="浊度 (NTU)" width="120" align="center">
        <template #default="{ row }">
          <el-tag :type="row.turbidity > 15 ? 'danger' : (row.turbidity > 10 ? 'warning' : 'success')">{{ row.turbidity || '5.0' }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="200" class-name="small-padding fixed-width">
        <template #default="{ row }">
          <el-button type="primary" size="mini" @click="handleDetail(row)">详情</el-button>
          <el-button type="warning" size="mini" @click="handleAlert(row)">预警</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />
  </div>
</template>

<script>
import { fetchList } from '@/api/water' // 确保导入API
import Pagination from '@/components/Pagination' // 导入分页组件

export default {
  name: 'WaterQualityTable',
  components: { Pagination },
  filters: {
    statusFilter(status) {
      const statusMap = {
        '正常': 'success',
        '警告': 'warning',
        '危险': 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      list: [], // 初始化为空数组，将从API获取
      total: 0, // 初始化总数为0
      listLoading: true, // 初始加载状态为true
      listQuery: {
        page: 1,
        limit: 10
        // 可以根据需要添加其他查询参数，如日期范围
        // dateRange: [new Date('2023-05-20'), new Date('2023-05-21')]
      }
    }
  },
  created() {
    this.getList() // 组件创建时调用API获取数据
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        // 确保正确获取数据，即使数据结构不完全匹配预期
        if (response.data && response.data.items) {
          this.list = response.data.items
          this.total = response.data.total || this.list.length
        } else if (Array.isArray(response.data)) {
          // 如果直接返回数组
          this.list = response.data
          this.total = response.data.length
        } else if (response.items) {
          // 另一种可能的数据结构
          this.list = response.items
          this.total = response.total || this.list.length
        } else {
          // 兜底处理
          this.list = []
          this.total = 0
          console.error('Unexpected API response format:', response)
        }
        this.listLoading = false
      }).catch(error => {
        console.error('Error fetching water quality list:', error)
        this.listLoading = false
        // 添加错误处理，例如显示提示信息
        this.$message({
          message: '获取水质数据失败',
          type: 'error'
        })
      })
    },
    handleDetail(row) {
      // 详情操作逻辑，可以跳转到详情页或显示弹窗
      this.$notify({
        title: '水质详情',
        message: `查看ID为 ${row.id} 的水质详情`, // 假设数据有id字段
        type: 'info',
        duration: 2000
      })
      // 示例：路由跳转
      // this.$router.push(`/water-quality/detail/${row.id}`)
    },
    handleAlert(row) {
      // 预警操作逻辑
      this.$notify({
        title: '水质预警',
        message: `处理ID为 ${row.id} 的水质预警`, // 假设数据有id字段
        type: 'warning',
        duration: 2000
      })
      // 示例：打开设置预警阈值的弹窗
      // this.openAlertDialog(row)
    }
  }
}
</script>
