import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/* Router Modules */
// import chartsRouter from './modules/charts'
// import tableRouter from './modules/table'
// import nestedRouter from './modules/nested'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    noCache: true                if set true, the page will no be cached(default is false)
    affix: true                  if set true, the tag will affix in the tags-view
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: () => import('@/views/login/auth-redirect'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index'),
        name: 'Dashboard',
        meta: { title: '水产养殖管理面板', icon: 'dashboard', affix: true }
      }
    ]
  },
  {
    path: '/profile',
    component: Layout,
    redirect: '/profile/index',
    hidden: true,
    children: [
      {
        path: 'index',
        component: () => import('@/views/profile/index'),
        name: 'Profile',
        meta: { title: 'Profile', icon: 'user', noCache: true }
      }
    ]
  }

]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = [
  {
    path: '/permission',
    component: Layout,
    redirect: '/permission/role',
    // alwaysShow: true, // will always show the root menu
    name: 'Permission',
    meta: {
      title: '权限管理',
      icon: 'lock',
      roles: ['admin', 'editor'] // you can set roles in root nav
    },
    children: [

      {
        path: 'role',
        component: () => import('@/views/permission/role'),
        name: 'RolePermission',
        meta: {
          title: '权限管理',
          roles: ['admin']
        }
      }
    ]
  },

  /** when your routing map is too long, you can split it into small modules **/
  //   chartsRouter,
  //  nestedRouter,
  // tableRouter,
  {
    path: '/device',
    component: Layout,
    redirect: '/device/detail',
    name: 'device',
    meta: {
      title: '设备管理',
      icon: 'table'
    },
    children: [

      {
        path: 'detail',
        component: () => import('@/views/device/detail'),
        name: 'device_detail',
        meta: { title: '设备信息管理' }
      }
    ]
  },
  {
    path: '/water',
    component: Layout,
    redirect: '/water/detail',
    name: 'water',
    meta: {
      title: '水质信息',
      icon: 'chart'
    },
    children: [

      {
        path: 'detail',
        component: () => import('@/views/water/detail'),
        name: 'water_detail',
        meta: { title: '水质信息管理' }
      }
    ]
  },
  {
    path: '/goods',
    component: Layout,
    redirect: '/goods/detail',
    name: 'goods',
    meta: {
      title: '库存管理',
      icon: 'el-icon-s-order'
    },
    children: [

      {
        path: 'detail',
        component: () => import('@/views/goods/detail'),
        name: 'ComplexTable',
        meta: { title: '库存信息管理' }
      }
    ]
  },
  {
    path: '/log',
    component: Layout,
    redirect: '/log/list',
    name: 'log',
    meta: {
      title: '日志管理',
      icon: 'el-icon-s-help'
    },
    children: [
      {
        path: 'list',
        component: () => import('@/views/log/list'),
        name: 'ArticleList',
        meta: { title: '养殖日志列表', icon: 'list' }
      },
      {
        path: 'create',
        component: () => import('@/views/log/create'),
        name: 'CreateArticle',
        meta: { title: '新增管理日志', icon: 'edit' }
      },
      {
        path: 'edit/:id(\\d+)',
        component: () => import('@/views/log/edit'),
        name: 'EditArticle',
        meta: { title: '日志编辑', noCache: true, activeMenu: '/log/list' },
        hidden: true
      }

    ]
  },

  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
