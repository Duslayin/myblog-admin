<template>
   <div class="common-layout">
    <el-container>
      <el-header class="header">
        <div class="logo">
          Guanlyee
        </div>
        <div class="user-info">
          <span>欢迎回来，</span>
          <el-dropdown>
            <span>
              <span class="nickname">{{ userInfo.nickName }}</span>
              <span class="iconfont icon-close"></span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="toUserInfo">个人信息</el-dropdown-item>
                <el-dropdown-item @click="logout">退出</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <div class="avatar">
            <img :src="userInfo.avatar">
          </div>
        </div>
      </el-header>
      <el-container class="container">
        <el-aside width="250px" class="left-aside">
          <div>
            <h3>博客后台系统</h3>
            <!-- <el-button class="post-btn">发布</el-button> -->
          </div>
          <div class="menu-panel">
            <ul>
              <li v-for="(menu, index) in menuList" :key="index">
                <div class="menu-item" @click="openclose(index)">
                  <span :class="['iconfont', menu.icon]"></span>
                  <span class="item-name">{{ menu.name }}</span>
                  <span :class="['iconfont', 
                  menu.open ? 'icon-open' : 'icon-close']"></span>
                </div>
                <ul class="submenu" v-show="menu.open">
                  <li v-for="submenu in menu.children">
                    <router-link :to="submenu.path" 
                                  :class="['submenu-item', currentPath===submenu.path?'active':'']"
                                  v-if="submenu.roleType == null || submenu.roleType == userInfo.roleType">
                      <span>{{ submenu.name }}</span>
                    </router-link>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </el-aside>
        <el-main class="right-main">
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, getCurrentInstance, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from "vuex"


const route = useRoute()
const router = useRouter()
const store = useStore()
const { proxy } = getCurrentInstance()
const api = {
  'getUserInfo': '/getUserInfo',
  'logout': '/logout'
}

const menuList = ref([
  {
    name: '博客',
    icon: 'icon-xieboke',
    open: true,
    children: [
      {
        name: '博客管理',
        path: '/blog/list'
      },
      {
        name: '博客分类',
        path: '/blog/category'
      }
    ]
  },
  {
    name: '专题',
    icon: 'icon-zhuanti',
    open: true,
    children: [
      {
        name: '专题管理',
        path: '/blog/special'
      }
    ]
  },
  {
    name: '设置',
    icon: 'icon-shezhixitongshezhigongnengshezhishuxing',
    open: true,
    children: [
      {
        name: '个人信息设置',
        path: '/settings/myInfo'
      },
      {
        name: '博客成员',
        path: '/settings/userList'
      },
      // {
      //   name: '系统设置',
      //   path: '',
      //   roleType: 1,
      // }
    ]
  },
  {
    name: '回收站',
    icon: 'icon-huishouzhan',
    open: true,
    children: [
      {
        name: '回收站',
        path: '/recovery/list'
      }
    ]
  }
])

const userInfo = ref({})
const currentPath = ref(null)

const openclose = (index) => {
  menuList.value[index].open = !menuList.value[index].open
}

// 初始化获取登录用户信息
const getUserInfo = async () => {
  let result = await proxy.Request({
    url: api.getUserInfo
  })
  if (!result) {
    return;
  }
  userInfo.value = result.data
  userInfo.value.avatar = proxy.globalApi.userImgUrl + userInfo.value.avatar
  // console.log(userInfo.value);
}

getUserInfo()

// 转至个人信息页面
const toUserInfo = () => {
  router.push('../settings/myInfo')
}

// 退出
const logout = () => {
  proxy.Confirm('确定要退出吗?', async () => {
    const result = await proxy.Request({
      url: api.logout
    })
    if(!result) {
      return
    }
    proxy.Message.success('退出登录')
    proxy.VueCookies.remove('userInfo')
    router.push('/login')
  })
}

// 路径侦听器(菜单栏高亮当前页面)
watch(route, (newVal, oldVal) => {
  // console.log(route.path);
  // console.log(newVal, oldVal);
  currentPath.value = newVal.path
}, { immediate: true, deep: true })

// 监听头像改变
watch(() => store.state.userInfo, (newVal) => {
  const avatar = proxy.globalApi.userImgUrl + newVal.avatar
  const nickName = newVal.nickName
  userInfo.value.avatar = avatar
  userInfo.value.nickName= nickName
}, { immediate: true, deep: true })
</script>

<style lang="less">
.common-layout {
  .header {
    border-bottom: 1px solid #ddd;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .logo {
      font-size: 30px;
    }
    .user-info {
      display: flex;
      align-items: center;
      .nickname {
        color: red;
      }
      .avatar {
        width: 50px;
        height: 50px;
        margin-left: 10px;
        border-radius: 25px;
        img {
          width: 50px;
          height: 50px;
          border-radius: 25px;
        }
      }
    }
  }
  .container {
    padding-top: 10px;
    background: #f5f6f7;
    height: calc(100vh - 60px);
    .left-aside {
      padding: 10px;
      h3 {
        font-size: 16px;
        font-weight: 600;
        text-align: center;
        line-height: 48px;
      }
      .post-btn {
        width: 100%;
        height: 40px;
        background-color: red;
        color: #fff;
      }
      .menu-panel {
        ul, li {
          margin: 0;
          padding: 0;
          list-style: none;
        }
        .menu-item {
          height: 40px;
          line-height: 40px;
          cursor: pointer;
          display: flex;
          margin: 16px 0 0;
          padding: 0 20px;
          &:hover {
            background-color: #ddd;
          }
          .item-name {
            flex: 1;
            font-size: 16px;
            margin-left: 10px;
          }
        }
        .submenu {
          font-size: 14px;
          padding-left: 25px;  
          .submenu-item {
            display: block;
            cursor: pointer;
            line-height: 40px;
            padding: 0 10px 0 25px;
            text-decoration: none;
            color: #3f4042;
            &:hover {
              background-color: #ddd;
              // color: red;
            }
          }
          .active {
            color: red;
          }
        }
      }
    }
    .right-main {
      position: relative;
      background-color: #fff;
    }
  }
}
</style>