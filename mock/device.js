// mock/device.js
const Mock = require('mockjs')

// 生成假设备列表
const List = []
const count = 50
for (let i = 1; i <= count; i++) {
  // 随机生成类型
  const types = ['PLC', '传感器', '机器人']
  const type = Mock.Random.pick(types)

  // 构造设备项
  const item = {
    id: i, // 从1开始递增
    type,
    name: `${type}${Mock.Random.integer(1, 50)}`, // 类型+1-50编号
    status: Mock.Random.pick(['online', 'offline', 'fault']),
    last_data: Mock.Random.float(0, 100, 1, 2), // 模拟数值
    created_at: Mock.Random.datetime('2025-MM-dd HH:mm:ss') // 全部2025年
  }
  List.push(item)
}

module.exports = [
  {
    url: '/device/list',
    type: 'get',
    response: config => {
      const { page = 1, limit = 20, sort } = config.query
      const mockList = [...List]

      // 简单排序
      if (sort === '-id') mockList.reverse()

      // 分页
      const start = (page - 1) * limit
      const end = page * limit
      const pageList = mockList.slice(start, end)

      return {
        code: 20000,
        data: {
          total: mockList.length,
          items: pageList
        }
      }
    }
  },
  {
    url: '/device/create',
    type: 'post',
    response: () => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  },
  {
    url: '/device/update',
    type: 'post',
    response: () => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  },
  {
    url: '/device/pv',
    type: 'get',
    response: () => {
      return {
        code: 20000,
        data: {
          pvData: [
            { key: 'pv1', pv: Mock.Random.integer(100, 500) },
            { key: 'pv2', pv: Mock.Random.integer(100, 500) }
          ]
        }
      }
    }
  }
]
