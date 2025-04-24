const Mock = require('mockjs')

const List = []
const count = 50

for (let i = 0; i < count; i++) {
  List.push(Mock.mock({
    id: '@increment',
    timestamp: +Mock.Random.date('T'),
    oxygen: '@float(4, 12, 1, 2)',
    ph: '@float(6, 9, 1, 2)',
    cod: '@float(10, 100, 1, 1)',
    conductivity: '@float(200, 800, 1, 1)',
    chlorine: '@float(0.2, 2.0, 1, 2)',
    nh3: '@float(0.1, 5.0, 1, 2)',
    turbidity: '@float(0, 10, 1, 2)'
  }))
}

module.exports = [
  {
    url: '/vue-element-admin/water/list',
    type: 'get',
    response: config => {
      const { dateRange, page = 1, limit = 20, sort } = config.query

      let mockList = List.filter(item => {
        if (dateRange && dateRange.length === 2) {
          const startTime = new Date(dateRange[0]).getTime()
          const endTime = new Date(dateRange[1]).getTime()
          if (item.timestamp < startTime || item.timestamp > endTime) return false
        }
        return true
      })

      if (sort === '-id') {
        mockList = mockList.reverse()
      }

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

  {
    url: '/vue-element-admin/water/create',
    type: 'post',
    response: _ => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  },

  {
    url: '/vue-element-admin/water/update',
    type: 'post',
    response: _ => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  },

  {
    url: '/vue-element-admin/water/delete',
    type: 'post',
    response: _ => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  }
]
