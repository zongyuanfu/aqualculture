<template>
  <div class="app-container">
    <!-- 筛选区 -->
    <div class="filter-container">
      <el-input
        v-model="listQuery.name"
        placeholder="设备名称"
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-select
        v-model="listQuery.type"
        placeholder="设备类型"
        clearable
        class="filter-item"
        style="width: 130px"
      >
        <el-option
          v-for="item in calendarTypeOptions"
          :key="item.key"
          :label="item.display_name"
          :value="item.key"
        />
      </el-select>

      <el-select
        v-model="listQuery.status"
        placeholder="设备状态"
        clearable
        class="filter-item"
        style="width: 130px"
      >
        <el-option
          v-for="item in statusOptions"
          :key="item"
          :label="statusText(item)"
          :value="item"
        />
      </el-select>

      <el-select
        v-model="listQuery.sort"
        style="width: 140px"
        class="filter-item"
        @change="handleFilter"
      >
        <el-option
          v-for="item in sortOptions"
          :key="item.key"
          :label="item.label"
          :value="item.key"
        />
      </el-select>

      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >搜索</el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-edit"
        @click="handleCreate"
      >添加设备</el-button>
      <el-button
        v-waves
        :loading="downloadLoading"
        class="filter-item"
        type="primary"
        icon="el-icon-download"
        @click="handleDownload"
      >导出</el-button>
    </div>

    <!-- 数据表格 -->
    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange"
    >
      <el-table-column
        label="设备ID"
        prop="id"
        sortable="custom"
        align="center"
        width="80"
        :class-name="getSortClass('id')"
      >
        <template #default="{ row }">
          <span>{{ row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="设备名称"
        min-width="120px"
        align="center"
      >
        <template #default="{ row }">
          <span class="link-type" @click="handleUpdate(row)">{{ row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="设备类型"
        width="120px"
        align="center"
      >
        <template #default="{ row }">
          <el-tag>{{ row.type | typeFilter }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column
        label="当前状态"
        class-name="status-col"
        width="100"
        align="center"
      >
        <template #default="{ row }">
          <el-tag :type="row.status | statusFilter">{{ statusText(row.status) }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column
        label="最近接收数据"
        min-width="100px"
        align="center"
      >
        <template #default="{ row }">
          <span>{{ row.last_data }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="创建时间"
        width="150px"
        align="center"
      >
        <template #default="{ row }">
          <span>{{ row.created_at | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="操作"
        align="center"
        width="300"
        class-name="small-padding fixed-width"
      >
        <template #default="{ row, $index }">
          <el-button
            type="primary"
            size="mini"
            style="margin-right:6px;"
            @click="handleUpdate(row)"
          >编辑</el-button>

          <el-dropdown style="margin-right:6px;" @command="(command) => handleModifyStatus(row, command)">
            <el-button size="mini" :type="row.status | statusTypeFilter">
              {{ statusText(row.status) }}<i class="el-icon-arrow-down el-icon--right" />
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-if="row.status !== 'online'" command="online">上线</el-dropdown-item>
              <el-dropdown-item v-if="row.status !== 'offline'" command="offline">下线</el-dropdown-item>
              <el-dropdown-item v-if="row.status !== 'fault'" command="fault">故障</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>

          <el-button
            size="mini"
            type="danger"
            @click="handleDelete(row, $index)"
          >删除</el-button>
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

    <!-- 创建 / 编辑 对话框 -->
    <el-dialog
      :title="textMap[dialogStatus]"
      :visible.sync="dialogFormVisible"
      width="50%"
      center
    >
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="temp"
        label-position="left"
        label-width="120px"
        style="width: 90%; margin: 0 auto;"
      >
        <el-form-item label="设备名称" prop="name">
          <el-input v-model="temp.name" placeholder="请输入设备名称" />
        </el-form-item>
        <el-form-item label="设备类型" prop="type">
          <el-select v-model="temp.type" placeholder="请选择设备类型">
            <el-option
              v-for="item in calendarTypeOptions"
              :key="item.key"
              :label="item.display_name"
              :value="item.key"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="当前状态" prop="status">
          <el-select v-model="temp.status" placeholder="请选择设备状态">
            <el-option
              v-for="item in statusOptions"
              :key="item"
              :label="statusText(item)"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="最近接收数据">
          <el-input
            v-model="temp.last_data"
            :autosize="{ minRows: 2, maxRows: 4 }"
            type="textarea"
            placeholder="设备数据"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="dialogStatus === 'create' ? createData() : updateData()"
        >确定</el-button>
      </div>
    </el-dialog>

    <!-- PV 统计对话框 -->
    <el-dialog
      :visible.sync="dialogPvVisible"
      title="设备数据统计"
    >
      <el-table
        :data="pvData"
        border
        fit
        highlight-current-row
        style="width: 100%;"
      >
        <el-table-column prop="key" label="数据类型" />
        <el-table-column prop="pv" label="数值" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { fetchList, fetchPv, createDevice, updateDevice } from '@/api/device'
import waves from '@/directive/waves'
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination'

const calendarTypeOptions = [
  { key: 'PLC', display_name: 'PLC' },
  { key: '传感器', display_name: '传感器' },
  { key: '机器人', display_name: '机器人' }
]
const statusTextMap = {
  online: '上线',
  offline: '下线',
  fault: '故障'
}
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'DeviceManagement',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = { online: 'success', offline: 'info', fault: 'danger' }
      return statusMap[status]
    },
    statusTypeFilter(status) {
      const statusTypeMap = { online: 'success', offline: 'info', fault: 'warning' }
      return statusTypeMap[status]
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: [],
      total: 0,
      listLoading: true,
      listQuery: { page: 1, limit: 20, name: '', type: undefined, status: undefined, sort: '+id' },
      calendarTypeOptions,
      sortOptions: [
        { label: 'ID 升序', key: '+id' },
        { label: 'ID 降序', key: '-id' }
      ],
      statusOptions: ['online', 'offline', 'fault'],
      temp: { id: undefined, name: '', type: '', status: 'offline', last_data: '', created_at: new Date() },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: { update: '编辑', create: '创建' },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        name: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
        type: [{ required: true, message: '请选择设备类型', trigger: 'change' }],
        status: [{ required: true, message: '请选择设备状态', trigger: 'change' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    statusText(status) {
      return statusTextMap[status] || status
    },
    getList() {
      this.listLoading = true
      fetchList(this.listQuery).then(res => {
        this.list = res.data.items
        this.total = res.data.total
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleModifyStatus(row, status) {
      this.$message({ message: '操作成功', type: 'success' })
      row.status = status
    },
    sortChange({ prop, order }) {
      if (prop === 'id') {
        this.listQuery.sort = order === 'ascending' ? '+id' : '-id'
        this.handleFilter()
      }
    },
    resetTemp() {
      this.temp = { id: undefined, name: '', type: '', status: 'offline', last_data: '', created_at: new Date() }
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
          this.temp.id = Math.floor(Math.random() * 1000) + 1000
          this.temp.created_at = new Date()
          createDevice(this.temp).then(() => {
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({ title: '成功', message: '创建成功', type: 'success' })
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
          updateDevice(this.temp).then(() => {
            const idx = this.list.findIndex(v => v.id === this.temp.id)
            this.$set(this.list, idx, this.temp)
            this.dialogFormVisible = false
            this.$notify({ title: '成功', message: '更新成功', type: 'success' })
          })
        }
      })
    },
    handleDelete(row, idx) {
      this.list.splice(idx, 1)
      this.$notify({ title: '成功', message: '删除成功', type: 'success' })
    },
    handleFetchPv(pv) {
      fetchPv(pv).then(res => {
        this.pvData = res.data.pvData
        this.dialogPvVisible = true
      })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['ID', '设备名称', '设备类型', '当前状态', '最近接收数据', '创建时间']
        const filterVal = ['id', 'name', 'type', 'status', 'last_data', 'created_at']
        const data = this.list.map(v => filterVal.map(k => k === 'created_at' ? parseTime(v[k]) : v[k]))
        excel.export_json_to_excel({ header: tHeader, data, filename: '设备管理列表' })
        this.downloadLoading = false
      })
    },
    getSortClass(key) {
      return this.listQuery.sort === `+${key}` ? 'ascending' : 'descending'
    }
  }
}
</script>
