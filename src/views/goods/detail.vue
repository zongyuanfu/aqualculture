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
      <el-table-column label="操作类型" prop="action" align="center" />
      <el-table-column label="数量" prop="quantity" align="center" />
      <el-table-column label="操作人ID" prop="operator_id" align="center" />
      <el-table-column label="操作时间" align="center" width="200">
        <template slot-scope="scope">{{ scope.row.timestamp | parseTime('{y}-{m}-{d} {h}:{i}') }}</template>
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
          <el-input v-model="temp.item_name" />
        </el-form-item>
        <el-form-item label="操作类型" prop="action">
          <el-select v-model="temp.action" placeholder="请选择">
            <el-option label="入库" value="入库" />
            <el-option label="出库" value="出库" />
            <el-option label="盘点" value="盘点" />
          </el-select>
        </el-form-item>
        <el-form-item label="数量" prop="quantity">
          <el-input-number v-model="temp.quantity" :min="1" />
        </el-form-item>
        <el-form-item label="操作人ID" prop="operator_id">
          <el-input v-model="temp.operator_id" />
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
import { fetchList, createItem, updateItem, deleteItem } from '@/api/warehouse'
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination'

export default {
  name: 'WarehouseRecord',
  components: { Pagination },
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
        item_name: [{ required: true, message: '请输入物品名称', trigger: 'blur' }],
        action: [{ required: true, message: '请选择操作类型', trigger: 'change' }],
        quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }],
        operator_id: [{ required: true, message: '请输入操作人ID', trigger: 'blur' }],
        timestamp: [{ type: 'date', required: true, message: '请选择操作时间', trigger: 'change' }]
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
    handleCreate() {
      this.temp = {
        id: undefined,
        rfid_code: '',
        item_name: '',
        action: '',
        quantity: 1,
        operator_id: '',
        timestamp: new Date()
      }
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
    },
    createData() {
      this.$refs.dataForm.validate(valid => {
        if (valid) {
          createItem(this.temp).then(() => {
            this.getList()
            this.dialogFormVisible = false
            this.$notify({ title: '成功', message: '记录已创建', type: 'success' })
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
    },
    updateData() {
      this.$refs.dataForm.validate(valid => {
        if (valid) {
          updateItem(this.temp).then(() => {
            this.getList()
            this.dialogFormVisible = false
            this.$notify({ title: '成功', message: '记录已更新', type: 'success' })
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
          this.$notify({ title: '成功', message: '删除成功', type: 'success' })
        })
      })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['ID', 'RFID编码', '物品名称', '操作类型', '数量', '操作人ID', '操作时间']
        const filterVal = ['id', 'rfid_code', 'item_name', 'action', 'quantity', 'operator_id', 'timestamp']
        const data = this.list.map(item => filterVal.map(key => key === 'timestamp' ? parseTime(item[key]) : item[key]))
        excel.export_json_to_excel({ header: tHeader, data, filename: '仓库记录' })
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
