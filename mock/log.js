const Mock = require('mockjs')

const List = []
const count = 100

const baseContent = '<p>这是一份水产养殖日志报告，记录了养殖过程中的重要观察和事件。</p><p>水质参数：pH值7.2，溶解氧5.8mg/L，水温26°C。</p><p>鱼类生长状况良好，摄食正常，无明显疾病迹象。</p><p>今日投喂量：标准饲料20kg。</p>'

// 生成操作员列表
const operators = [
  { id: 1, name: '张三' },
  { id: 2, name: '李四' },
  { id: 3, name: '王五' },
  { id: 4, name: '赵六' },
  { id: 5, name: '钱七' }
]

// 生成日志数据
for (let i = 0; i < count; i++) {
  List.push(Mock.mock({
    id: '@increment',
    title: '养殖日志 - @date("MM-dd") @cword(5, 10)',
    content: baseContent,
    operator_id: '@pick([1, 2, 3, 4, 5])',
    operator_name: function() {
      const op = operators.find(o => o.id === this.operator_id)
      return op ? op.name : '未知'
    },
    'status|1': ['published', 'draft'],
    created_at: '@datetime("yyyy-MM-dd HH:mm:ss")'
  }))
}

module.exports = [
  // 获取日志列表 - RESTful: GET /api/logs/
  {
    url: '/api/logs/',
    type: 'get',
    response: config => {
      const { title, page = 1, limit = 20 } = config.query

      let mockList = List.filter(item => {
        if (title && item.title.indexOf(title) < 0) return false
        return true
      })

      // 按创建时间倒序排列
      mockList = mockList.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

      const pageList = mockList.filter((item, index) => index < limit * page && index >= limit * (page - 1))

      return {
        code: 20000,
        data: {
          total: mockList.length,
          items: pageList
        }
      }
    }
  },

  // 获取日志详情 - RESTful: GET /api/logs/:id/
  {
    url: '/api/logs/[0-9]+/',
    type: 'get',
    response: config => {
      const id = parseInt(config.url.match(/\/api\/logs\/(\d+)\//)[1])
      for (const log of List) {
        if (log.id === id) {
          return {
            code: 20000,
            data: log
          }
        }
      }
      return {
        code: 50000,
        message: '日志不存在'
      }
    }
  },

  // 创建日志 - RESTful: POST /api/logs/
  {
    url: '/api/logs/',
    type: 'post',
    response: config => {
      const data = config.body
      data.id = List.length + 1
      data.created_at = new Date().toISOString().replace('T', ' ').substring(0, 19)

      // 添加操作员姓名
      const op = operators.find(o => o.id === data.operator_id)
      data.operator_name = op ? op.name : '未知'

      List.unshift(data)

      return {
        code: 20000,
        data: data
      }
    }
  },

  // 更新日志 - RESTful: PUT /api/logs/:id/
  {
    url: '/api/logs/[0-9]+/',
    type: 'put',
    response: config => {
      const id = parseInt(config.url.match(/\/api\/logs\/(\d+)\//)[1])
      const data = config.body
      const index = List.findIndex(item => item.id === id)

      if (index !== -1) {
        // 保留创建时间
        const created_at = List[index].created_at
        data.created_at = created_at

        // 更新操作员姓名
        const op = operators.find(o => o.id === data.operator_id)
        data.operator_name = op ? op.name : '未知'

        List[index] = data
      }

      return {
        code: 20000,
        data: data
      }
    }
  },

  // 删除日志 - RESTful: DELETE /api/logs/:id/
  {
    url: '/api/logs/[0-9]+/',
    type: 'delete',
    response: config => {
      const id = parseInt(config.url.match(/\/api\/logs\/(\d+)\//)[1])
      const index = List.findIndex(item => item.id === id)

      if (index !== -1) {
        List.splice(index, 1)
      }

      return {
        code: 20000,
        data: 'success'
      }
    }
  },

  // 获取操作员列表 - RESTful: GET /api/users/
  {
    url: '/api/users/',
    type: 'get',
    response: () => {
      return {
        code: 20000,
        data: operators
      }
    }
  }
]
