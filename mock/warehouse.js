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
    return date.toISOString().replace('T', ' ').substring(0, 19)
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
  {
    url: '/api/warehouse-records/',
    type: 'get',
    response(config) {
      const { page = 1, page_size = 20, start_date, end_date } = config.query

      let mockList = [...List] // 保持原始顺序

      // 如果需要按时间倒序返回，可以取消下面这行注释
      // mockList = [...List].reverse()

      if (start_date || end_date) {
        mockList = mockList.filter(item => {
          if (start_date && item.timestamp < start_date) return false
          if (end_date && item.timestamp > end_date) return false
          return true
        })
      }

      const pageList = mockList.slice((page - 1) * page_size, page * page_size)

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
    url: '/api/warehouse-records/',
    type: 'post',
    response(config) {
      const data = JSON.parse(config.body)
      data.id = List.length + 1

      // 新记录的时间设置为当前最后一条记录的时间+1小时
      const lastDate = new Date(List[List.length - 1].timestamp)
      lastDate.setHours(lastDate.getHours() + 1)
      data.timestamp = lastDate.toISOString().replace('T', ' ').substring(0, 19)

      List.push(data) // 添加到末尾保持时间顺序

      return {
        code: 20000,
        data: data
      }
    }
  },

  {
    url: /\/api\/warehouse-records\/\d+/,
    type: 'put',
    response(config) {
      const data = JSON.parse(config.body)
      const index = List.findIndex(item => item.id === data.id)
      if (index !== -1) {
        // 保持时间顺序，不允许修改时间早于前一条记录或晚于后一条记录
        const prevTime = index > 0 ? new Date(List[index - 1].timestamp).getTime() : 0
        const nextTime = index < List.length - 1 ? new Date(List[index + 1].timestamp).getTime() : Infinity
        const newTime = new Date(data.timestamp).getTime()

        if (newTime >= prevTime && newTime <= nextTime) {
          List[index] = data
        } else {
          return {
            code: 40000,
            message: '修改后的时间必须介于前后记录时间之间'
          }
        }
      }
      return {
        code: 20000,
        data: data
      }
    }
  },

  {
    url: /\/api\/warehouse-records\/\d+/,
    type: 'delete',
    response(config) {
      const id = parseInt(config.url.split('/').pop())
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
