<template>
  <aside class="warning-tip">
    <div class="warning-title">
      <i class="el-icon-warning" /> 温馨提示
    </div>
    <div class="warning-content">
      水产养殖管理系统的日志报告模块用于记录养殖过程中的重要事件和观察结果。请确保填写完整的报告信息，包括标题、内容和撰写人。
      <ul>
        <li>标题：简明扼要地描述日志内容</li>
        <li>内容：详细记录水质参数、鱼类状况、投喂情况等关键信息</li>
        <li>撰写人：选择负责记录的工作人员</li>
      </ul>
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
        margin-bottom: 4px;
      }
    }
  }
}
</style>

