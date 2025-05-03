
<template>
  <div class="app-container">
    <!-- 筛选区 -->
    <div class="filter-container">
      <el-date-picker
        v-model="listQuery.dateRange"
        type="daterange"
        align="right"
        unlink-panels
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        :picker-options="pickerOptions"
        class="filter-item"
        style="width: 360px"
      />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-plus" @click="handleCreate">
        添加
      </el-button>
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
        导出
      </el-button>
    </div>

    <!-- 数据表格 -->
    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      size="small"
    >
      <el-table-column label="ID" align="center" width="80">
        <template #default="{ row }">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>

      <!-- 溶解氧 -->
      <el-table-column label="溶解氧 (mg/L)" width="110" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatus('oxygen', row.oxygen)">
            {{ row.oxygen }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- pH 值 -->
      <el-table-column label="pH 值" width="110" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatus('ph', row.ph)">
            {{ row.ph }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- 化学需氧量 -->
      <el-table-column label="化学需氧量 (mg/L)" width="110" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatus('cod', row.cod)">
            {{ row.cod }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- 电导率 -->
      <el-table-column label="电导率 (μS/cm)" width="110" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatus('conductivity', row.conductivity)">
            {{ row.conductivity }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- 其他列保持不变 -->
      <el-table-column label="氯含量" width="110" align="center">
        <template #default="{ row }">
          <span>{{ row.chlorine }}</span>
        </template>
      </el-table-column>
      <el-table-column label="氨氮浓度" width="110" align="center">
        <template #default="{ row }">
          <span>{{ row.nh3 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="浊度" width="110" align="center">
        <template #default="{ row }">
          <span>{{ row.turbidity }}</span>
        </template>
      </el-table-column>
      <el-table-column label="记录时间" width="110" align="center">
        <template #default="{ row }">
          <span>{{ row.timestamp | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="300" class-name="small-padding fixed-width">
        <template #default="{ row }">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">编辑</el-button>
          <el-button v-if="row.status !== 'deleted'" size="mini" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />

    <!-- 新增/编辑对话框 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="650px">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px" style="margin:0 auto;">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="溶解氧" prop="oxygen">
              <el-input v-model="temp.oxygen" placeholder="mg/L" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="pH值" prop="ph">
              <el-input v-model="temp.ph" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="化学需氧量" prop="cod">
              <el-input v-model="temp.cod" placeholder="mg/L" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="电导率" prop="conductivity">
              <el-input v-model="temp.conductivity" placeholder="μS/cm" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="氯含量" prop="chlorine">
              <el-input v-model="temp.chlorine" placeholder="mg/L" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="氨氮浓度" prop="nh3">
              <el-input v-model="temp.nh3" placeholder="mg/L" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="浊度" prop="turbidity">
              <el-input v-model="temp.turbidity" placeholder="NTU" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="记录时间" prop="timestamp">
              <el-date-picker v-model="temp.timestamp" type="datetime" placeholder="请选择时间" style="width:100%" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogStatus === 'create' ? createData() : updateData()">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList, createItem, updateItem, deleteItem } from '@/api/water'
import waves from '@/directive/waves'
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination'

export default {
  name: 'WaterQualityDetail',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      list: [],
      total: 0,
      listLoading: false,
      listQuery: {
        page: 1,
        limit: 20,
        dateRange: null
      },
      // 报警阈值设置
      thresholds: {
        oxygen: { min: 5 }, // 溶解氧 ≥ 5 mg/L
        ph: { min: 6.5, max: 8.5 }, // pH 6.5–8.5
        cod: { max: 20 }, // COD ≤ 20 mg/L
        conductivity: { min: 100, max: 1000 } // 电导率 100–1000 μS/cm
      },
      pickerOptions: {
        shortcuts: [
          { text: '最近一周', onClick(p) { const end = new Date(); const start = new Date(); start.setTime(start.getTime() - 7 * 24 * 3600 * 1000); p.$emit('pick', [start, end]) } },
          { text: '最近一个月', onClick(p) { const end = new Date(); const start = new Date(); start.setTime(start.getTime() - 30 * 24 * 3600 * 1000); p.$emit('pick', [start, end]) } },
          { text: '最近三个月', onClick(p) { const end = new Date(); const start = new Date(); start.setTime(start.getTime() - 90 * 24 * 3600 * 1000); p.$emit('pick', [start, end]) } }
        ]
      },
      temp: {
        id: undefined,
        oxygen: '',
        ph: '',
        cod: '',
        conductivity: '',
        chlorine: '',
        nh3: '',
        turbidity: '',
        timestamp: new Date()
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: { update: '编辑水质数据', create: '添加水质数据' },
      rules: {
        oxygen: [{ required: true, message: '溶解氧浓度不能为空', trigger: 'blur' }],
        ph: [{ required: true, message: 'pH值不能为空', trigger: 'blur' }],
        cod: [{ required: true, message: '化学需氧量不能为空', trigger: 'blur' }],
        conductivity: [{ required: true, message: '电导率不能为空', trigger: 'blur' }],
        chlorine: [{ required: true, message: '氯含量不能为空', trigger: 'blur' }],
        nh3: [{ required: true, message: '氨氮浓度不能为空', trigger: 'blur' }],
        turbidity: [{ required: true, message: '浊度不能为空', trigger: 'blur' }],
        timestamp: [{ type: 'date', required: true, message: '请选择时间', trigger: 'change' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    // 根据阈值返回 el-tag 的 type：超出范围为 danger，否则 success
    getStatus(field, value) {
      const th = this.thresholds[field]
      if (th.min !== undefined && value < th.min) return 'danger'
      if (th.max !== undefined && value > th.max) return 'danger'
      return 'success'
    },

    // 获取列表
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(({ data }) => {
        this.list = data.items
        this.total = data.total
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    resetTemp() {
      this.temp = { id: undefined, oxygen: '', ph: '', cod: '', conductivity: '', chlorine: '', nh3: '', turbidity: '', timestamp: new Date() }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => this.$refs.dataForm.clearValidate())
    },
    createData() {
      this.$refs.dataForm.validate(valid => {
        if (valid) {
          createItem(this.temp).then(() => {
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({ title: '成功', message: '创建成功', type: 'success', duration: 2000 })
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = { ...row }
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => this.$refs.dataForm.clearValidate())
    },
    updateData() {
      this.$refs.dataForm.validate(valid => {
        if (valid) {
          updateItem(this.temp).then(() => {
            const i = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(i, 1, this.temp)
            this.dialogFormVisible = false
            this.$notify({ title: '成功', message: '更新成功', type: 'success', duration: 2000 })
          })
        }
      })
    },
    handleDelete(row) {
      this.$confirm('确认删除该条记录吗?', '提示', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' })
        .then(() => deleteItem(row.id).then(() => {
          this.$notify({ title: '成功', message: '删除成功', type: 'success', duration: 2000 })
          this.list.splice(this.list.findIndex(v => v.id === row.id), 1)
        }))
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['ID', '溶解氧 (mg/L)', 'pH值', '化学需氧量 (mg/L)', '电导率 (μS/cm)', '氯含量 (mg/L)', '氨氮 (mg/L)', '浊度 (NTU)', '记录时间']
        const filterVal = ['id', 'oxygen', 'ph', 'cod', 'conductivity', 'chlorine', 'nh3', 'turbidity', 'timestamp']
        const data = this.formatJson(filterVal, this.list)
        excel.export_json_to_excel({ header: tHeader, data, filename: '水质检测数据' })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => j === 'timestamp' ? parseTime(v[j]) : v[j]))
    }
  }
}
</script>

<style scoped>
.filter-container {
  display: flex;
  align-items: center;
  padding-bottom: 10px;
}
.filter-item {
  display: inline-block;
  vertical-align: middle;
  margin-bottom: 10px;
  margin-right: 10px;
}
.small-padding .el-button {
  margin: 0 2px;
}
.fixed-width {
  white-space: nowrap;
}
</style>

