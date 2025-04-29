<template>
  <aside class="warning-tip">
    <div class="warning-title">
      <i class="el-icon-warning" /> 温馨提示
    </div>
    <div class="warning-content">
      水产养殖管理系统的日志报告模块用于记录养殖过程中的重要事件和观察结果。请确保填写完整的报告信息，包括：
      <ul>
        <li><strong>标题</strong>：简明扼要地描述日志内容，便于后续查找</li>
        <li><strong>撰写人</strong>：选择负责记录的工作人员，明确责任归属</li>
        <li><strong>内容</strong>：详细记录以下关键信息：
          <ul>
            <li>水质参数（pH值、溶解氧、水温等）</li>
            <li>鱼类生长状况（摄食情况、活动状态、异常现象）</li>
            <li>投喂情况（饲料种类、投喂量、投喂时间）</li>
            <li>设备运行情况（增氧机、水泵等设备运行状态）</li>
            <li>其他重要观察或处理措施</li>
          </ul>
        </li>
      </ul>
      <p class="warning-footer">完整的日志记录有助于养殖过程的追踪分析和问题排查，请认真填写每一份报告。</p>
    </div>
  </aside>
</template>

<script>
export default {
  name: 'Warning'
}
</script>

<style lang="scss" scoped>
.warning-tip {
  padding: 16px;
  margin-bottom: 20px;
  border-radius: 4px;
  background-color: #fdf6ec;
  border: 1px solid #faecd8;

  .warning-title {
    font-size: 16px;
    color: #e6a23c;
    font-weight: bold;
    margin-bottom: 8px;

    i {
      margin-right: 4px;
    }
  }

  .warning-content {
    color: #666;
    line-height: 1.6;

    ul {
      margin-top: 8px;
      padding-left: 20px;

      li {
        margin-bottom: 6px;

        ul {
          margin-top: 4px;
          margin-bottom: 4px;

          li {
            margin-bottom: 2px;
            font-size: 13px;
            color: #777;
          }
        }
      }
    }

    .warning-footer {
      margin-top: 12px;
      font-size: 14px;
      color: #e6a23c;
      font-weight: 500;
    }
  }
}
</style>

