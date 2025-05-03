<template>
  <div class="app-container">
    <div class="page-header">
      <h2>水产养殖日志报告</h2>
      <p>记录养殖过程中的重要事件和观察结果</p>
    </div>
    <div class="filter-container">
      <el-input v-model="listQuery.title" placeholder="报告标题" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />

      <el-select v-model="listQuery.operator_id" placeholder="撰写人" clearable style="width: 120px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in operatorOptions" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>

      <el-select v-model="listQuery.status" placeholder="状态" clearable style="width: 120px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in statusOptions" :key="item.key" :label="item.display_name" :value="item.key" />
      </el-select>

      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        新建日志
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="success" icon="el-icon-refresh" @click="refreshList">
        刷新
      </el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%"
    >
      <el-table-column align="center" label="ID" width="80">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column width="180px" align="center" label="创建时间">
        <template slot-scope="scope">
          <span>{{ scope.row.created_at | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
        </template>
      </el-table-column>

      <el-table-column width="120px" align="center" label="撰写人">
        <template slot-scope="scope">
          <el-tag size="medium">{{ scope.row.operator_name }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column class-name="status-col" label="状态" width="110">
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter">
            {{ row.status === 'published' ? '已发布' : '草稿' }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column min-width="300px" label="报告标题">
        <template slot-scope="{row}">
          <router-link :to="'/log/edit/'+row.id" class="link-type">
            <span class="log-title">{{ row.title }}</span>
          </router-link>
          <el-popover trigger="hover" placement="top">
            <div class="log-content-preview" v-html="row.content.substring(0, 200) + '...'" />
            <div slot="reference" class="log-content-icon">
              <i class="el-icon-document" />
            </div>
          </el-popover>
        </template>
      </el-table-column>

      <el-table-column align="center" label="操作" width="230">
        <template slot-scope="scope">
          <router-link :to="'/log/edit/'+scope.row.id">
            <el-button type="primary" size="small" icon="el-icon-edit">
              编辑
            </el-button>
          </router-link>
          <el-button
            size="small"
            type="success"
            icon="el-icon-view"
            @click="handlePreview(scope.row)"
          >
            预览
          </el-button>
          <el-button
            size="small"
            type="danger"
            icon="el-icon-delete"
            @click="handleDelete(scope.row, scope.$index)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />

    <!-- 预览对话框 -->
    <el-dialog title="日志预览" :visible.sync="dialogVisible" width="60%">
      <div class="log-preview-header">
        <h3>{{ previewLog.title }}</h3>
        <div class="log-preview-info">
          <span>撰写人: {{ previewLog.operator_name }}</span>
          <span>创建时间: {{ previewLog.created_at | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
          <el-tag :type="previewLog.status | statusFilter" size="small">
            {{ previewLog.status === 'published' ? '已发布' : '草稿' }}
          </el-tag>
        </div>
      </div>
      <div class="log-preview-content" v-html="previewLog.content" />
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleEdit(previewLog)">编辑</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { fetchLogList, deleteLog, fetchOperators } from '@/api/log'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination

export default {
  name: 'LogList',
  components: { Pagination },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'warning',
        deleted: 'danger'
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
        title: undefined,
        operator_id: undefined,
        status: undefined
      },
      operatorOptions: [],
      statusOptions: [
        { key: 'published', display_name: '已发布' },
        { key: 'draft', display_name: '草稿' }
      ],
      dialogVisible: false,
      previewLog: {}
    }
  },
  // 监听路由变化，处理从编辑页返回时的刷新
  watch: {
    '$route.query.refresh': {
      handler(val) {
        if (val) {
          this.getList()
        }
      },
      immediate: true
    }
  },
  created() {
    this.getList()
    this.getOperators()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchLogList(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total
        this.listLoading = false
      }).catch(() => {
        this.$message.error('获取日志列表失败')
        this.listLoading = false
      })
    },
    getOperators() {
      fetchOperators().then(response => {
        this.operatorOptions = response.data
      }).catch(() => {
        this.$message.error('获取操作员列表失败')
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    refreshList() {
      this.listQuery = {
        page: 1,
        limit: 20,
        title: undefined,
        operator_id: undefined,
        status: undefined
      }
      this.getList()
    },
    handleCreate() {
      this.$router.push('/log/create')
    },
    handleEdit(row) {
      this.dialogVisible = false
      this.$router.push(`/log/edit/${row.id}`)
    },
    handlePreview(row) {
      this.previewLog = Object.assign({}, row)
      this.dialogVisible = true
    },
    handleDelete(row, index) {
      this.$confirm('确认删除该日志?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.listLoading = true
        deleteLog(row.id).then(() => {
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
          this.list.splice(index, 1)
          this.listLoading = false
        }).catch(() => {
          this.$notify({
            title: '错误',
            message: '删除失败',
            type: 'error',
            duration: 2000
          })
          this.listLoading = false
        })
      }).catch(() => {
        // 取消删除操作
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.page-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;

  h2 {
    font-size: 22px;
    color: #303133;
    margin: 0 0 8px 0;
    font-weight: 600;
  }

  p {
    font-size: 14px;
    color: #606266;
    margin: 0;
  }
}

.filter-container {
  padding-bottom: 10px;
  .filter-item {
    display: inline-block;
    vertical-align: middle;
    margin-bottom: 10px;
    margin-right: 10px;
  }
}

.log-title {
  font-weight: 500;
  color: #2d8cf0;
}

.log-content-icon {
  display: inline-block;
  margin-left: 10px;
  color: #909399;
  cursor: pointer;
}

.log-content-preview {
  max-width: 400px;
  max-height: 300px;
  overflow: auto;
  line-height: 1.5;
}

.log-preview-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;

  h3 {
    margin: 0 0 10px 0;
    font-size: 18px;
    color: #303133;
  }

  .log-preview-info {
    display: flex;
    align-items: center;
    color: #606266;
    font-size: 14px;

    span {
      margin-right: 15px;
    }
  }
}

.log-preview-content {
  max-height: 400px;
  overflow-y: auto;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
  line-height: 1.6;
}
</style>
