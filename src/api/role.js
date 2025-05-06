import request from '@/utils/request'

// 获取路由信息
export function getRoutes() {
  return request({
    url: '/api/routes/',
    method: 'get'
  })
}

// 获取所有用户列表
export function getRoles() {
  return request({
    url: '/api/users/',
    method: 'get'
  })
}

// 添加新用户
export function addRole(data) {
  return request({
    url: '/api/users/',
    method: 'post',
    data
  })
}

// 更新用户信息
export function updateRole(id, data) {
  return request({
    url: `/api/users/${id}/`,
    method: 'put',
    data
  })
}

// 删除用户
export function deleteRole(id) {
  return request({
    url: `/api/users/${id}/`,
    method: 'delete'
  })
}
