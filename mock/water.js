const Mock = require('mockjs')

const List = []
const count = 100

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

const orderedDates = generateOrderedDates(count)

// 生成水质数据范围，所有数据都在正常范围内
for (let i = 0; i < count; i++) {
  List.push({
    id: i + 1,
    timestamp: orderedDates[i],
    // 溶解氧（mg/L）：前端阈值要求 ≥ 5 mg/L
    oxygen: Mock.mock('@float(5, 8, 1, 2)'),
    // pH值：前端阈值要求 6.5-8.5
    ph: Mock.mock('@float(7, 8, 1, 2)'),
    // 水温（°C）：22-28是理想范围
    temperature: Mock.mock('@float(22, 28, 1, 1)'),
    // COD（mg/L）：前端阈值要求 ≤ 20 mg/L
    cod: Mock.mock('@float(10, 19, 1, 1)'),
    // 电导率（μS/cm）：前端阈值要求 100-1000 μS/cm
    conductivity: Mock.mock('@float(100, 999, 1, 1)'),
    // 余氯（mg/L）：0.2-0.5是安全范围
    chlorine: Mock.mock('@float(0.2, 0.5, 1, 2)'),
    // 氨氮（mg/L）：0.2-1.0是安全范围
    nh3: Mock.mock('@float(0.2, 0.99, 1, 2)'),
    // 浊度（NTU）：5-10是可接受范围
    turbidity: Mock.mock('@float(5, 9, 1, 2)')
  })
}

module.exports = [
  {
    url: '/api/water/list',
    type: 'get',
    response: config => {
      const { dateRange, page = 1, limit = 20, sort } = config.query

      let mockList = [...List] // 保持原始顺序

      if (dateRange && dateRange.length === 2) {
        mockList = mockList.filter(item => {
          const startTime = new Date(dateRange[0]).getTime()
          const endTime = new Date(dateRange[1]).getTime()
          return item.timestamp >= startTime && item.timestamp <= endTime
        })
      }

      if (sort === '-id') {
        mockList = mockList.reverse()
      }

      const pageList = mockList.slice((page - 1) * limit, page * limit)

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
    url: '/api/water/create',
    type: 'post',
    response: config => {
      const data = config.body
      data.id = List.length + 1

      // 新记录的时间设置为当前最后一条记录的时间+1小时
      const lastDate = new Date(List[List.length - 1].timestamp)
      lastDate.setHours(lastDate.getHours() + 1)
      data.timestamp = lastDate.getTime()

      List.push(data)

      return {
        code: 20000,
        data: 'success'
      }
    }
  },

  {
    url: '/api/water/update/\\d+',
    type: 'put',
    response: config => {
      const id = parseInt(config.url.match(/\/api\/water\/update\/(\d+)/)[1])
      const data = config.body
      console.log('接收到的更新请求数据:', data, '请求ID:', id) // 添加日志，帮助调试
      const index = List.findIndex(item => item.id === id)

      if (index !== -1) {
        // 保持时间顺序，不允许修改时间早于前一条记录或晚于后一条记录
        const prevTime = index > 0 ? List[index - 1].timestamp : 0
        const nextTime = index < List.length - 1 ? List[index + 1].timestamp : Infinity
        const newTime = new Date(data.timestamp).getTime()

        if (newTime >= prevTime && newTime <= nextTime) {
          List[index] = { ...List[index], ...data }
          console.log('更新成功，更新后的数据:', List[index]) // 添加日志，确认更新成功
        } else {
          console.log('更新失败：时间范围错误') // 添加日志，记录失败原因
          return {
            code: 40000,
            message: '修改后的时间必须介于前后记录时间之间'
          }
        }
      } else {
        console.log('更新失败：未找到ID为', id, '的记录') // 添加日志，记录失败原因
        return {
          code: 40001,
          message: '未找到要更新的记录'
        }
      }

      return {
        code: 20000,
        data: 'success'
      }
    }
  },

  {
    url: '/api/water/delete',
    type: 'post',
    response: config => {
      const { id } = config.params
      const index = List.findIndex(item => item.id === id)

      if (index !== -1) {
        List.splice(index, 1)
      }

      return {
        code: 20000,
        data: 'success'
      }
    }
  }
]
