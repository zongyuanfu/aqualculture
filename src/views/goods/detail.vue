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
      <el-button type="primary" icon="el-icon-search" class="filter-item" @click="handleFilter">搜索</el-button>
      <el-button type="primary" icon="el-icon-plus" class="filter-item" @click="handleCreate">添加</el-button>
      <el-button :loading="downloadLoading" type="primary" icon="el-icon-download" class="filter-item" @click="handleDownload">导出</el-button>
    </div>

    <el-table v-loading="listLoading" :data="list" border fit highlight-current-row size="small">
      <el-table-column label="ID" prop="id" align="center" width="80" />
      <el-table-column label="RFID编码" prop="rfid_code" align="center" />
      <el-table-column label="物品名称" prop="item_name" align="center" />
      <el-table-column label="操作类型" prop="action" align="center">
        <template slot-scope="scope">
          <el-tag :type="getActionTagType(scope.row.action)">{{ scope.row.action }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="数量" prop="quantity" align="center" />
      <el-table-column label="操作人ID" prop="operator_id" align="center" />
      <el-table-column label="操作时间" align="center" width="200">
        <template slot-scope="scope">
          {{ new Date(scope.row.timestamp).toLocaleString() }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="200">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button type="danger" size="mini" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="600px">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-width="100px">
        <el-form-item label="RFID编码" prop="rfid_code">
          <el-input v-model="temp.rfid_code" />
        </el-form-item>
        <el-form-item label="物品名称" prop="item_name">
          <el-select v-model="temp.item_name" placeholder="请选择物品" filterable style="width: 100%">
            <el-option v-for="item in itemOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作类型" prop="action">
          <el-select v-model="temp.action" placeholder="请选择" style="width: 100%">
            <el-option label="入库" value="入库" />
            <el-option label="出库" value="出库" />
            <el-option label="盘点" value="盘点" />
          </el-select>
        </el-form-item>
        <el-form-item label="数量" prop="quantity">
          <el-input-number v-model="temp.quantity" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="操作人ID" prop="operator_id">
          <el-input v-model.number="temp.operator_id" type="number" />
        </el-form-item>
        <el-form-item label="操作时间" prop="timestamp">
          <el-date-picker v-model="temp.timestamp" type="datetime" placeholder="请选择时间" style="width: 100%" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogStatus==='create' ? createData() : updateData()">确认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList, fetchItemList, createItem, updateItem, deleteItem } from '@/api/warehouse'
// eslint-disable-next-line no-unused-vars
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination'

export default {
  name: 'WarehouseRecord',
  components: { Pagination },
  data() {
    return {
      list: [],
      itemOptions: [],
      total: 0,
      listLoading: false,
      listQuery: {
        page: 1,
        limit: 20,
        dateRange: null
      },
      pickerOptions: {
        shortcuts: [
          { text: '最近一周', onClick: picker => picker.$emit('pick', [new Date(Date.now() - 604800000), new Date()]) },
          { text: '最近一个月', onClick: picker => picker.$emit('pick', [new Date(Date.now() - 2592000000), new Date()]) }
        ]
      },
      temp: {
        id: undefined,
        rfid_code: '',
        item_name: '',
        action: '',
        quantity: 1,
        operator_id: '',
        timestamp: new Date()
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑记录',
        create: '添加记录'
      },
      rules: {
        rfid_code: [{ required: true, message: '请输入RFID编码', trigger: 'blur' }],
        item_name: [{ required: true, message: '请选择物品名称', trigger: 'change' }],
        action: [{ required: true, message: '请选择操作类型', trigger: 'change' }],
        quantity: [{ required: true, message: '请输入数量', trigger: 'blur', type: 'number' }],
        operator_id: [{ required: true, message: '请输入操作人ID', trigger: 'blur', type: 'number' }],
        timestamp: [{ type: 'date', required: true, message: '请选择操作时间', trigger: 'change' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
    this.getItemOptions()
  },
  methods: {
    getActionTagType(action) {
      const typeMap = {
        '入库': 'success',
        '出库': 'danger',
        '盘点': 'info'
      }
      return typeMap[action] || ''
    },
    getItemOptions() {
      fetchItemList().then(response => {
        this.itemOptions = response.data
      })
    },
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total
        this.listLoading = false
      }).catch(() => {
        this.listLoading = false
        this.$message.error('获取数据失败')
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    resetTemp() {
      return {
        id: undefined,
        rfid_code: '',
        item_name: '',
        action: '',
        quantity: 1,
        operator_id: '',
        timestamp: new Date()
      }
    },
    handleCreate() {
      this.temp = this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          // 确保时间戳是数字类型
          if (tempData.timestamp instanceof Date) {
            tempData.timestamp = tempData.timestamp.getTime()
          }

          createItem(tempData).then(response => {
            if (response.code === 20000) {
              this.getList()
              this.dialogFormVisible = false
              this.$notify({
                title: '成功',
                message: '记录已创建',
                type: 'success',
                duration: 2000
              })
            } else {
              this.$notify({
                title: '失败',
                message: response.message || '创建失败',
                type: 'error',
                duration: 2000
              })
            }
          }).catch(error => {
            console.error('创建记录失败:', error)
            this.$notify({
              title: '错误',
              message: '创建失败，请检查网络连接',
              type: 'error'
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row)
      // 确保时间戳转换为Date对象，便于表单显示
      if (typeof this.temp.timestamp === 'number') {
        this.temp.timestamp = new Date(this.temp.timestamp)
      }
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
          // 确保时间戳是数字类型
          if (tempData.timestamp instanceof Date) {
            tempData.timestamp = tempData.timestamp.getTime()
          }

          updateItem(tempData).then(response => {
            if (response.code === 20000) {
              this.getList()
              this.dialogFormVisible = false
              this.$notify({
                title: '成功',
                message: '记录已更新',
                type: 'success',
                duration: 2000
              })
            } else {
              this.$notify({
                title: '失败',
                message: response.message || '更新失败',
                type: 'error',
                duration: 2000
              })
            }
          }).catch(error => {
            console.error('更新记录失败:', error)
            this.$notify({
              title: '错误',
              message: '更新失败，请检查网络连接',
              type: 'error'
            })
          })
        }
      })
    },
    handleDelete(row) {
      this.$confirm('确认删除该记录？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteItem(row.id).then(() => {
          this.getList()
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
        }).catch(error => {
          console.error('删除记录失败:', error)
          this.$notify({
            title: '错误',
            message: '删除失败，请检查网络连接',
            type: 'error'
          })
        })
      }).catch(() => {
        // 用户取消删除操作
      })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['ID', 'RFID编码', '物品名称', '操作类型', '数量', '操作人ID', '操作时间']
        const filterVal = ['id', 'rfid_code', 'item_name', 'action', 'quantity', 'operator_id', 'timestamp']
        const data = this.list.map(item => {
          return filterVal.map(key => {
            if (key === 'timestamp') {
              return new Date(item[key]).toLocaleString()
            }
            return item[key]
          })
        })
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: '仓库记录'
        })
        this.downloadLoading = false
      })
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
  margin-right: 10px;
}
</style>
