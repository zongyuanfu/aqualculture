import request from '@/utils/request'

// 获取设备列表
export function fetchList(query) {
  return request({
    url: '/device/list',
    method: 'get',
    params: query
  })
}

// 获取设备PV数据
export function fetchPv(pv) {
  return request({
    url: '/device/pv',
    method: 'get',
    params: { pv }
  })
}

// 创建新设备
export function createDevice(data) {
  return request({
    url: '/device/create',
    method: 'post',
    data
  })
}

// 更新设备信息
export function updateDevice(data) {
  return request({
    url: '/device/update',
    method: 'post',
    data
  })
}
