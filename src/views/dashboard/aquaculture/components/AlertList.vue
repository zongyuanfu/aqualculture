<template>
  <div class="alert-list">
    <div class="alert-header">
      <span>水质预警</span>
      <el-button class="alert-button" type="text" @click="handleSetAllRead">全部标为已读</el-button>
    </div>
    <div v-if="alerts.length === 0" class="no-alert">
      <span>暂无预警信息</span>
    </div>
    <div v-else class="alert-content">
      <el-tag
        v-for="(alert, index) in alerts"
        :key="index"
        :type="alert.type"
        effect="dark"
        class="alert-item"
      >
        <div class="alert-item-content">
          <div class="alert-item-title">{{ alert.title }}</div>
          <div class="alert-item-time">{{ alert.timestamp | parseTime('{y}-{m}-{d} {h}:{i}') }}</div>
          <div class="alert-item-message">{{ alert.message }}</div>
        </div>
      </el-tag>
    </div>
  </div>
</template>

<script>
import { parseTime } from '@/utils'

export default {
  name: 'AlertList',
  filters: {
    parseTime
  },
  data() {
    return {
      alerts: [
        {
          id: 1,
          title: '溶解氧过低',
          message: '池塘1号溶解氧低于6.5mg/L，请及时处理',
          timestamp: new Date('2023-05-20 16:30:00'),
          type: 'warning',
          read: false
        },
        {
          id: 2,
          title: '水温过高',
          message: '池塘2号水温超过27°C，请注意降温',
          timestamp: new Date('2023-05-20 14:20:00'),
          type: 'warning',
          read: false
        },
        {
          id: 3,
          title: '氨氮超标',
          message: '池塘3号氨氮含量超过0.3mg/L，水质恶化',
          timestamp: new Date('2023-05-20 10:15:00'),
          type: 'danger',
          read: false
        }
      ]
    }
  },
  methods: {
    handleSetAllRead() {
      this.alerts.forEach(alert => {
        alert.read = true
      })
      this.$notify({
        title: '成功',
        message: '已将所有预警标为已读',
        type: 'success',
        duration: 2000
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.alert-list {
  position: relative;
  padding: 0 20px;
  background-color: #fff;
  border-radius: 4px;
  height: 100%;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

  .alert-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 0;
    border-bottom: 1px solid #ebeef5;
    font-size: 16px;
    font-weight: bold;
  }

  .alert-button {
    font-size: 14px;
    color: #409EFF;
  }

  .no-alert {
    height: 300px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #909399;
  }

  .alert-content {
    padding: 15px 0;
    height: 300px;
    overflow-y: auto;
  }

  .alert-item {
    display: block;
    width: 100%;
    margin-bottom: 15px;
    padding: 12px;
    box-sizing: border-box;
    border-radius: 4px;

    .alert-item-content {
      text-align: left;
      word-break: break-word;
      white-space: normal;
    }

    .alert-item-title {
      font-weight: bold;
      margin-bottom: 8px;
      font-size: 15px;
    }

    .alert-item-time {
      font-size: 12px;
      margin-bottom: 8px;
      opacity: 0.8;
    }

    .alert-item-message {
      font-size: 14px;
      line-height: 1.5;
      display: block;
      width: 100%;
      overflow-wrap: break-word;
    }
  }
}
</style>
