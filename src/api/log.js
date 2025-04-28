import request from '@/utils/request'

// 符合RESTful风格的API接口
export function fetchLogList(query) {
  return request({
    url: '/api/logs/',
    method: 'get',
    params: query
  })
}

export function fetchLog(id) {
  return request({
    url: `/api/logs/${id}/`,
    method: 'get'
  })
}

export function createLog(data) {
  return request({
    url: '/api/logs/',
    method: 'post',
    data
  })
}

export function updateLog(data) {
  return request({
    url: `/api/logs/${data.id}/`,
    method: 'put',
    data
  })
}

export function deleteLog(id) {
  return request({
    url: `/api/logs/${id}/`,
    method: 'delete'
  })
}

export function fetchOperators() {
  return request({
    url: '/api/users/',
    method: 'get'
  })
}
