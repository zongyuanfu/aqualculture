import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/vue-element-admin/water/list',
    method: 'get',
    params: query
  })
}

export function createItem(data) {
  return request({
    url: '/vue-element-admin/water/create',
    method: 'post',
    data
  })
}

export function updateItem(data) {
  return request({
    url: '/vue-element-admin/water/update',
    method: 'post',
    data
  })
}

export function deleteItem(id) {
  return request({
    url: '/vue-element-admin/water/delete',
    method: 'post',
    params: { id }
  })
}
