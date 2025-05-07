// src/mock/log.js
const Mock = require('mockjs')

const List = []
const count = 100

const baseContent = `
  <p>这是一份水产养殖日志报告，记录了养殖过程中的重要观察和事件。</p>
  <p>水质参数：pH值7.2，溶解氧5.8mg/L，水温26°C。</p>
  <p>鱼类生长状况良好，摄食正常，无明显疾病迹象。</p>
  <p>今日投喂量：标准饲料20kg。</p>
`

// 生成操作员列表
const operators = [
  { id: 1, name: '张三' },
  { id: 2, name: '李四' },
  { id: 3, name: '王五' },
  { id: 4, name: '赵六' },
  { id: 5, name: '钱七' }
]

// 养殖日志常用关键词
const keywords = [
  '水质检测', '增氧作业', '投喂记录',
  '病害观察', '溢流清理', '底泥翻动',
  '温度监测', '饲料配比', '生长测量',
  '鱼病防治', '产量预测', '水草修剪'
]

// 生成日志数据
for (let i = 0; i < count; i++) {
  List.push(Mock.mock({
    id: '@increment',
    // 新标题：养殖日志 - MM-dd + 随机关键词
    title() {
      const date = Mock.Random.date('MM-dd')
      const word = Mock.Random.pick(keywords)
      return `养殖日志 - ${date} ${word}`
    },
    content: baseContent,
    operator_id: '@pick([1, 2, 3, 4, 5])',
    operator_name() {
      const op = operators.find(o => o.id === this.operator_id)
      return op ? op.name : '未知'
    },
    'status|1': ['published', 'draft'],
    created_at: '@datetime("yyyy-MM-dd HH:mm:ss")'
  }))
}

module.exports = [
  // 单条详情
  {
    url: '/api/logs/[0-9]+/',
    type: 'get',
    response: config => {
      const id = parseInt(config.url.match(/\/api\/logs\/(\d+)\//)[1])
      const log = List.find(item => item.id === id)
      return log
        ? { code: 20000, data: log }
        : { code: 50000, message: '日志不存在' }
    }
  },
  // 列表查询
  {
    url: '/api/logs/',
    type: 'get',
    response: config => {
      const { title, operator_id, status, page = 1, limit = 20 } = config.query
      let mockList = List.filter(item => {
        if (title && item.title.indexOf(title) < 0) return false
        if (operator_id && parseInt(operator_id) !== item.operator_id) return false
        if (status && status !== item.status) return false
        return true
      })
      mockList = mockList.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      const start = (page - 1) * limit
      const end = page * limit
      return {
        code: 20000,
        data: {
          total: mockList.length,
          items: mockList.slice(start, end)
        }
      }
    }
  },
  // 创建日志
  {
    url: '/api/logs/',
    type: 'post',
    response: config => {
      const data = config.body
      data.id = List.length + 1
      data.created_at = new Date().toISOString().replace('T', ' ').substr(0, 19)
      const op = operators.find(o => o.id === data.operator_id)
      data.operator_name = op ? op.name : '未知'
      List.unshift(data)
      return { code: 20000, data }
    }
  },
  // 更新日志
  {
    url: '/api/logs/[0-9]+/',
    type: 'put',
    response: config => {
      const id = parseInt(config.url.match(/\/api\/logs\/(\d+)\//)[1])
      const data = config.body
      const idx = List.findIndex(item => item.id === id)
      if (idx !== -1) {
        data.created_at = List[idx].created_at
        const op = operators.find(o => o.id === data.operator_id)
        data.operator_name = op ? op.name : '未知'
        List[idx] = data
        return { code: 20000, data }
      } else {
        return { code: 50000, message: '日志不存在' }
      }
    }
  },
  // 删除日志
  {
    url: '/api/logs/[0-9]+/',
    type: 'delete',
    response: config => {
      const id = parseInt(config.url.match(/\/api\/logs\/(\d+)\//)[1])
      const idx = List.findIndex(item => item.id === id)
      if (idx !== -1) List.splice(idx, 1)
      return { code: 20000, data: 'success' }
    }
  },
  // 操作员列表
  {
    url: '/api/users/',
    type: 'get',
    response: () => ({ code: 20000, data: operators })
  }
]
