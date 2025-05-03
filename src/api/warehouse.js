import request from '@/utils/request'

// 获取仓库物品列表
export function fetchItemList() {
  return request({
    url: '/api/warehouse/items',
    method: 'get'
  })
}

// 获取仓库记录列表
export function fetchList(query) {
  return request({
    url: '/api/warehouse/list',
    method: 'get',
    params: query
  })
}

// 创建仓库记录
export function createItem(data) {
  return request({
    url: '/api/warehouse/create',
    method: 'post',
    data
  })
}

// 更新仓库记录
export function updateItem(data) {
  return request({
    url: `/api/warehouse/update/${data.id}`,
    method: 'put',
    data
  })
}

// 删除仓库记录
export function deleteItem(id) {
  return request({
    url: '/api/warehouse/delete',
    method: 'post',
    params: { id }
  })
}
