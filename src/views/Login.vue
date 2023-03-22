<template>
  <div class="login-body">
    <el-form :model="formData" 
              class="login-panel"
              :rules="rules"
              ref="formRef"
              >
      <h3>用户登录</h3>
      <el-form-item prop="account">
        <el-input v-model="formData.account" 
                  placeholder="请输入账号"
                  size="large">
          <template #prefix>
            <span class="iconfont icon-account"></span>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input v-model="formData.password" 
                  type="password"
                  placeholder="请输入密码"
                  size="large">
          <template #prefix>
            <span class="iconfont icon-password"></span>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item prop="checkCode">
        <div class="check-panel">
          <el-input v-model="formData.checkCode" 
                    placeholder="请输入验证码"
                    class="check-input"
                    size="large"
                    @keyup.enter="login"/>
          <img :src="checkCodeUrl" 
                class="check-img"
                @click="changeCheckCode">
        </div>
      </el-form-item>
      <el-form-item>
        <el-checkbox v-model="formData.rememberMe" 
                    :true-label="1"
                    :false-label="0">记住我</el-checkbox>
      </el-form-item>
      <el-form-item>
        <el-button type="primary"
                   style="width:100%"
                   @click="login">登录</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { getCurrentInstance, reactive, ref } from 'vue'
import md5 from 'js-md5'
import VueCookies from 'vue-cookies'
import { useRouter } from 'vue-router'

const formData = reactive({})
const formRef = ref(null)
const { proxy } = getCurrentInstance()      /* 获取vue实例对象 访问全局变量 */
const router = useRouter()

const api = {
  checkCode: 'api/checkCode',
  login: '/login'
}

const checkCodeUrl = ref(api.checkCode)

const changeCheckCode = () => {
  // console.log(checkCodeUrl);
  checkCodeUrl.value = 'api/checkCode' + '?' + new Date().getTime()
}

const rules = {
  account: [
    {
      required: true,
      message: '请输入用户名',
      trigger: 'blur'
    }
  ],
  password: [
    {
      required: true,
      message: '请输入密码',
      trigger: 'blur'
    }
  ],
  checkCode: [
    {
      required: true,
      message: '请输入验证码',
      trigger: 'blur'
    }
  ]
}

// 根据cookie初始化输入框
const init = () => {
  const loginInfo = VueCookies.get('loginInfo')
  if(!loginInfo) {
    return
  }
  Object.assign(formData, loginInfo)
}

init()


const login = () => {
  formRef.value.validate(async (valid) => {
    // console.log(valid);
    if(!valid) {
      return
    }
    // console.log(proxy.Request);

    // 和cookie中的password对比，相同则不进行MD5转换
    let cookieLoginInfo = VueCookies.get("loginInfo");
    let cookiePassword = cookieLoginInfo == null ? null : cookieLoginInfo.password;
    if(cookiePassword !== formData.password) {
      formData.password = md5(formData.password)
    }

    // params要定义在login里面，这样才能访问到响应式对象formData的数据
    // params: 提交的表单数据
    let params = {
      account: formData.account,
      password: formData.password,
      checkCode: formData.checkCode
    }


    // 登录请求结果
    let result = await proxy.Request({
      url: api.login,
      params: params,
      changeCheckCode
    })

    // 如果结果为空代表登录失败，立即返回
    if(!result) {
      // console.log("登录失败");
      // 重置表单
      formRef.value.resetFields()   
      return 
    }

    // 登录成功
    // console.log(result);
    proxy.Message.success("登录成功，跳转中...")
    // 到首页
    setTimeout(() => {
      router.push('/')
    }, 1500);

    const loginInfo = {
      account: params.account,
      password: params.password,
      rememberMe: formData.rememberMe
    }

    // 保存登录用户信息
    VueCookies.set("userInfo", result.data, '3d');
    // 记住我 设置cookies
    if(formData.rememberMe === 1) {
      VueCookies.set('loginInfo', loginInfo, '7d')    /* 用户登录信息(账号、密码) */
    } else if(formData.rememberMe === 0) {
      VueCookies.remove('loginInfo')
    }
  })
}

</script>

<style lang="less">
.login-body {
  width: 100%;
  height: 100vh;
  background-size: cover;
  background-position: center;
  background-image: url(../assets/autumn.jpg);
  overflow: hidden;
  .login-panel {
    width: 350px;
    padding: 20px;
    margin: 180px auto;
    border-radius: 10px;
    // border: 1px solid blue;
    background: rgba(255, 255, 255, 0.8);
    h3 {
      text-align: center;
    }
    .check-panel {
      width: 100%;
      display: flex;
      align-items: center;
      .check-input {
        flex: 1;
        margin-right: 5px;
      }
      img {
        cursor: pointer;
      }
    }
  }
}
</style>