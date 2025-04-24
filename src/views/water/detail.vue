<template>
  <div class="app-container">
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
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column label="溶解氧" width="120" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.oxygen }}</span>
        </template>
      </el-table-column>

      <el-table-column label="pH值" width="120" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.ph }}</span>
        </template>
      </el-table-column>

      <el-table-column label="化学需氧量" width="120" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.cod }}</span>
        </template>
      </el-table-column>

      <el-table-column label="电导率" width="120" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.conductivity }}</span>
        </template>
      </el-table-column>

      <el-table-column label="氯含量" width="120" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.chlorine }}</span>
        </template>
      </el-table-column>

      <el-table-column label="氨氮浓度" width="120" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.nh3 }}</span>
        </template>
      </el-table-column>

      <el-table-column label="浊度" width="120" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.turbidity }}</span>
        </template>
      </el-table-column>

      <el-table-column label="记录时间" width="250" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.timestamp | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

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
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          确认
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList, createItem, updateItem, deleteItem } from '@/api/water'
import waves from '@/directive/waves' // 水波纹指令
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // 分页组件

export default {
  name: 'WaterQualityDetail',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        normal: 'success',
        warning: 'warning',
        danger: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        dateRange: null
      },
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            picker.$emit('pick', [start, end])
          }
        }]
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
      textMap: {
        update: '编辑水质数据',
        create: '添加水质数据'
      },
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
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        oxygen: '',
        ph: '',
        cod: '',
        conductivity: '',
        chlorine: '',
        nh3: '',
        turbidity: '',
        timestamp: new Date()
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          createItem(this.temp).then(() => {
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // 复制对象，避免修改原始数据
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          updateItem(tempData).then(() => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleDelete(row) {
      this.$confirm('确认删除该条记录吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteItem(row.id).then(() => {
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
          const index = this.list.findIndex(v => v.id === row.id)
          this.list.splice(index, 1)
        })
      })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['ID', '溶解氧浓度 (mg/L)', 'pH值', '化学需氧量 (mg/L)', '电导率 (μS/cm)', '氯含量 (mg/L)', '氨氮浓度 (mg/L)', '浊度 (NTU)', '记录时间']
        const filterVal = ['id', 'oxygen', 'ph', 'cod', 'conductivity', 'chlorine', 'nh3', 'turbidity', 'timestamp']
        const data = this.formatJson(filterVal, this.list)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: '水质检测数据'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
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
</style>
