import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import VueCookies from 'vue-cookies'

const routes = [
  {
    name: '登录页',
    path: '/login',
    component: Login
  },
  {
    name: '首页',
    path: '/',
    redirect: '/blog/list',
    component: () => import('@/views/Framework.vue'),
    children: [
      {
        name: '博客管理',
        path: 'blog/list',
        component: () => import('@/views/blog/BlogList.vue')
      },
      {
        name: '博客分类',
        path: 'blog/category',
        component: () => import('@/views/blog/BlogCategory.vue')
      },
      {
        name: '专题管理',
        path: 'blog/special',
        component: () => import('@/views/special/BlogSpecial.vue')
      },
      {
        name: '个人信息管理',
        path: 'settings/myInfo',
        component: () => import('@/views/settings/MyInfo.vue')
      },
      {
        name: '博客成员管理',
        path: 'settings/userList',
        component: () => import('@/views/settings/UserList.vue')
      },
      {
        name: '回收站',
        path: '/recovery/list',
        component: () => import('@/views/recovery/RecoveryList.vue')
      }
    ]
  }
]

const router = createRouter(
  {
    routes,
    history: createWebHistory(import.meta.env.VITE_PUBLIC_PATH),     // base: '/admin/'
  }
)

router.beforeEach((to, from, next) => {
  const userInfo = VueCookies.get('userInfo')
  if(!userInfo && to.path != '/login') {
    next('/login')
  } else if(userInfo && to.path == '/login') {
    next(from.path)
  } else {
    next()
  }
})

export default router
