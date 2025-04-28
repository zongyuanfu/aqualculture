import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/api/warehouse-records/',
    method: 'get',
    params: query
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
    url: `/api/warehouse-records/${data.id}/`, // 标准，带id
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
