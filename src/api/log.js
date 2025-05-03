import request from '@/utils/request'

// 符合RESTful风格的API接口

/**
 * 获取日志列表
 * @param {Object} query - 查询参数 (title, operator_id, status, page, limit)
 * @returns {Promise}
 */
export function fetchLogList(query) {
  return request({
    url: '/api/logs/',
    method: 'get',
    params: query
  })
}

/**
 * 获取单个日志详情
 * @param {Number} id - 日志ID
 * @returns {Promise}
 */
export function fetchLog(id) {
  return request({
    url: `/api/logs/${id}/`,
    method: 'get'
  })
}

/**
 * 创建新日志
 * @param {Object} data - 日志数据
 * @returns {Promise}
 */
export function createLog(data) {
  return request({
    url: '/api/logs/',
    method: 'post',
    data
  })
}

/**
 * 更新日志
 * @param {Object} data - 日志数据 (必须包含id字段)
 * @returns {Promise}
 */
export function updateLog(data) {
  return request({
    url: `/api/logs/${data.id}/`,
    method: 'put',
    data
  })
}

/**
 * 删除日志
 * @param {Number} id - 日志ID
 * @returns {Promise}
 */
export function deleteLog(id) {
  return request({
    url: `/api/logs/${id}/`,
    method: 'delete'
  })
}

/**
 * 获取操作员列表
 * @returns {Promise}
 */
export function fetchOperators() {
  return request({
    url: '/api/users/',
    method: 'get'
  })
}
