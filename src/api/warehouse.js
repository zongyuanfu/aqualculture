import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/api/warehouse-records/',
    method: 'get',
    params: {
      page: query.page,
      page_size: query.limit,
      start_date: query.dateRange ? query.dateRange[0] : undefined,
      end_date: query.dateRange ? query.dateRange[1] : undefined
    }
  })
}

export function createItem(data) {
  return request({
    url: '/api/warehouse-records/',
    method: 'post',
    data
  })
}

export function updateItem(data) {
  return request({
    url: `/api/warehouse-records/${data.id}/`,
    method: 'put',
    data
  })
}

export function deleteItem(id) {
  return request({
    url: `/api/warehouse-records/${id}/`,
    method: 'delete'
  })
}
