import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/api/water/list',
    method: 'get',
    params: query
  })
}

export function createItem(data) {
  return request({
    url: '/api/water/create',
    method: 'post',
    data
  })
}

export function updateItem(data) {
  return request({
    url: '/api/water/update',
    method: 'post',
    data
  })
}

export function deleteItem(id) {
  return request({
    url: '/api/water/delete',
    method: 'post',
    params: { id }
  })
}
