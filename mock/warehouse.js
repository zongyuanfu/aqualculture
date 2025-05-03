const Mock = require('mockjs')

const List = []
const count = 100

const actionTypes = ['入库', '出库', '盘点']
const itemNames = [
  '增氧机',
  '颗粒饲料（鱼用）',
  '二氧化氯消毒片',
  '敌百虫（杀虫剂）',
  'EM菌（水质改良剂）',
  '地笼网',
  '微藻粉（育苗饵料）',
  '维生素C（抗应激）',
  '生石灰（清塘消毒）',
  '硫酸铜（杀藻/寄生虫）',
  '浮性饲料（鱼苗专用）',
  '聚维酮碘（消毒剂）',
  '水质测试盒（pH/氨氮/亚盐）',
  '冰醋酸（杀菌调pH）',
  '鱼用益生菌（促消化）'
]

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

for (let i = 0; i < count; i++) {
  List.push({
    id: i + 1,
    rfid_code: Mock.mock('@string("upper", 10)'),
    action: Mock.mock('@pick(' + JSON.stringify(actionTypes) + ')'),
    item_name: Mock.mock('@pick(' + JSON.stringify(itemNames) + ')'),
    quantity: Mock.mock('@integer(1, 100)'),
    operator_id: Mock.mock('@integer(1, 10)'),
    timestamp: orderedDates[i]
  })
}

module.exports = [
  // 获取仓库物品列表
  {
    url: '/api/warehouse/items',
    type: 'get',
    response() {
      return {
        code: 20000,
        data: itemNames
      }
    }
  },

  // 获取仓库记录列表
  {
    url: '/api/warehouse/list',
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

  // 创建仓库记录
  {
    url: '/api/warehouse/create',
    type: 'post',
    response: config => {
      const data = config.body
      data.id = List.length + 1

      // 新记录的时间设置为当前最后一条记录的时间+1小时
      const lastDate = new Date(List[List.length - 1].timestamp)
      lastDate.setHours(lastDate.getHours() + 1)
      data.timestamp = lastDate.getTime()

      // 验证RFID编码唯一性
      const existingRfid = List.find(item => item.rfid_code === data.rfid_code)
      if (existingRfid) {
        return {
          code: 40001,
          message: 'RFID编码已存在，请使用其他编码'
        }
      }

      List.push(data)

      return {
        code: 20000,
        data: 'success'
      }
    }
  },

  // 更新仓库记录
  {
    url: '/api/warehouse/update/\\d+',
    type: 'put',
    response: config => {
      const id = parseInt(config.url.match(/\/api\/warehouse\/update\/(\d+)/)[1])
      const data = config.body
      console.log('接收到的更新请求数据:', data, '请求ID:', id) // 添加日志，帮助调试
      const index = List.findIndex(item => item.id === id)

      if (index !== -1) {
        // 保持时间顺序，不允许修改时间早于前一条记录或晚于后一条记录
        const prevTime = index > 0 ? List[index - 1].timestamp : 0
        const nextTime = index < List.length - 1 ? List[index + 1].timestamp : Infinity
        const newTime = new Date(data.timestamp).getTime()

        if (newTime >= prevTime && newTime <= nextTime) {
          // 验证RFID编码唯一性（排除当前记录）
          const existingRfid = List.find(item => item.rfid_code === data.rfid_code && item.id !== data.id)
          if (existingRfid) {
            console.log('更新失败：RFID编码已存在') // 添加日志，记录失败原因
            return {
              code: 40001,
              message: 'RFID编码已存在，请使用其他编码'
            }
          }

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

  // 删除仓库记录
  {
    url: '/api/warehouse/delete',
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
