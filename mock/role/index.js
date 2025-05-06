const Mock = require('mockjs')
const { deepClone } = require('../utils')
const { asyncRoutes, constantRoutes } = require('./routes.js')

const routes = deepClone([...constantRoutes, ...asyncRoutes])

const users = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    routes: routes
  },
  {
    id: 2,
    username: 'operator1',
    password: 'operator123',
    role: 'operator',
    routes: routes.filter(i => i.path !== '/permission')// 操作员无权限页面权限
  },
  {
    id: 3,
    username: 'operator2',
    password: 'operator123',
    role: 'operator',
    routes: [{
      path: '',
      redirect: 'dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          meta: { title: 'dashboard', icon: 'dashboard' }
        }
      ]
    }]
  }
]

module.exports = [
  // mock get all routes form server
  {
    url: '/api/routes/',
    type: 'get',
    response: _ => {
      return {
        code: 20000,
        data: routes
      }
    }
  },

  // mock get all users form server
  {
    url: '/api/users/',
    type: 'get',
    response: _ => {
      return {
        code: 20000,
        data: users
      }
    }
  },

  // add user
  {
    url: '/api/users/',
    type: 'post',
    response: {
      code: 20000,
      data: {
        id: Mock.mock('@integer(300, 5000)')
      }
    }
  },

  // update user
  {
    url: '/api/users/[0-9]+/',
    type: 'put',
    response: {
      code: 20000,
      data: {
        status: 'success'
      }
    }
  },

  // delete user
  {
    url: '/api/users/[0-9]+/',
    type: 'delete',
    response: {
      code: 20000,
      data: {
        status: 'success'
      }
    }
  }
]
