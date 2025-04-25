import request from '@/utils/request'

export function fetchLogList(query) {
  return request({
    url: '/vue-element-admin/log/list',
    method: 'get',
    params: query
  })
}

export function fetchLog(id) {
  return request({
    url: '/vue-element-admin/log/detail',
    method: 'get',
    params: { id }
  })
}

export function createLog(data) {
  return request({
    url: '/vue-element-admin/log/create',
    method: 'post',
    data
  })
}

export function updateLog(data) {
  return request({
    url: '/vue-element-admin/log/update',
    method: 'post',
    data
  })
}

export function deleteLog(id) {
  return request({
    url: '/vue-element-admin/log/delete',
    method: 'post',
    params: { id }
  })
}

export function fetchOperators() {
  return request({
    url: '/vue-element-admin/users/list',
    method: 'get'
  })
}
