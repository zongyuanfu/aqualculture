// mock/device.js
const Mock = require('mockjs')

// 生成按时间顺序排列的日期数组（2025年）
const generateOrderedDates = (count) => {
  const startDate = new Date('2025-01-01').getTime()
  const endDate = new Date('2025-12-31').getTime()
  const step = (endDate - startDate) / (count - 1)
  return Array.from({ length: count }, (_, i) => {
    const date = new Date(startDate + i * step)
    return date.getTime()
  })
}

const List = []
const count = 50
const orderedDates = generateOrderedDates(count)
for (let i = 0; i < count; i++) {
  const types = ['PLC', '传感器', '机器人']
  const type = Mock.Random.pick(types)
  const item = {
    id: i + 1,
    type,
    name: `${type}${Mock.Random.integer(1, 50)}`,
    status: Mock.Random.pick(['online', 'offline', 'fault']),
    last_data: Mock.Random.float(0, 100, 1, 2),
    created_at: orderedDates[i] // 时间戳，递增
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
      if (sort === '-id') mockList.reverse()
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
