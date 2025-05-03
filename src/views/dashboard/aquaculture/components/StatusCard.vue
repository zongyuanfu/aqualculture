<template>
  <el-card class="box-card">
    <div slot="header" class="clearfix">
      <span>池塘状态</span>
      <el-button style="float: right; padding: 3px 0" type="text" @click="handleRefresh">刷新</el-button>
    </div>

    <div class="status-item">
      <div class="status-label">池塘总数：</div>
      <div class="status-value">5个</div>
    </div>

    <div class="status-item">
      <div class="status-label">正常池塘：</div>
      <div class="status-value">
        <el-tag type="success">3个</el-tag>
      </div>
    </div>

    <div class="status-item">
      <div class="status-label">预警池塘：</div>
      <div class="status-value">
        <el-tag type="warning">2个</el-tag>
      </div>
    </div>

    <div class="status-item">
      <div class="status-label">异常池塘：</div>
      <div class="status-value">
        <el-tag type="danger">0个</el-tag>
      </div>
    </div>

    <div class="status-item">
      <div class="status-label">最近检测：</div>
      <div class="status-value">{{ lastCheckTime }}</div>
    </div>

    <div class="status-item">
      <div class="status-label">养殖品种：</div>
      <div class="status-value">草鱼、鲤鱼、鲫鱼</div>
    </div>

    <div class="status-item">
      <div class="status-label">预计产量：</div>
      <div class="status-value">2500kg</div>
    </div>

    <div class="status-footer">
      <el-button type="primary" size="small" @click="handleManage">管理池塘</el-button>
      <el-button type="warning" size="small" @click="handleSetting">预警设置</el-button>
    </div>
  </el-card>
</template>

<script>
import { parseTime } from '@/utils'

export default {
  name: 'StatusCard',
  data() {
    return {
      lastCheckTime: parseTime(new Date('2023-05-20 20:30:00'))
    }
  },
  methods: {
    handleRefresh() {
      this.lastCheckTime = parseTime(new Date())
      this.$notify({
        title: '成功',
        message: '数据已更新',
        type: 'success',
        duration: 2000
      })
    },
    handleManage() {
      this.$notify({
        title: '池塘管理',
        message: '跳转到池塘管理页面',
        type: 'info',
        duration: 2000
      })
    },
    handleSetting() {
      this.$notify({
        title: '预警设置',
        message: '跳转到预警设置页面',
        type: 'warning',
        duration: 2000
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.box-card {
  height: 100%;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  font-size: 14px;

  .status-label {
    color: #606266;
  }

  .status-value {
    font-weight: bold;
  }
}

.status-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}
</style>
