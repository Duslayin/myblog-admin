import axios from "axios";
import { ElLoading } from "element-plus";
import message from '@/utils/Message.js'
import router from "@/router";


const contentTypeForm = "application/x-www-form-urlencoded;charset=UTF-8";
const contentTypeJson = "application/json";
const contentTypeFile = "multipart/form-data";

const request = (config) => {
  let { url, params, dataType = 'form', showLoading = 'true'} = config
  let contentType = contentTypeForm;
  if (dataType === "json") {
      contentType = contentTypeJson;
  } else if (dataType === "file") {
      contentType = contentTypeFile;
      let param = new FormData();
      for (let key in params) {
          param.append(key, params[key]);
      }
      params = param;
  }

  const instance = axios.create({
    baseURL: '/api',
    timeout: 10000,
    headers: {
      'Content-Type': contentType,
      'X-Requested-With': 'XMLHttpRequest'
    }
  })

  // 请求前拦截(显示加载页面)
  let loading = null
  instance.interceptors.request.use((config) => {
    if(showLoading) {
      loading = ElLoading.service({
        lock: true,
        text: '正在加载...',
        background: 'rgba(0, 0, 0, 0.7)',
      })
    }
    return config
  }, (error) => {
    if(showLoading && loading) {
      loading.close()
    }
    // 提示出错
    message.error("发送请求失败")
    return Promise.reject("发送请求失败")
  })

  // 响应拦截器
  instance.interceptors.response.use((response) => {
    // console.log(response);
    // 2xx 范围内的状态码都会触发该函数。
    // 对响应数据做点什么
    if(showLoading && loading) {
      loading.close()
    }
    const responseData = response.data
    if(responseData.status == 'error') {
      if(responseData.code == 901) {
        setTimeout(() => {
          router.push('/login')
        }, 2000);
        return Promise.reject("登录超时")
      }
      // 更新验证码
      if(config.changeCheckCode) {
        config.changeCheckCode()
      }
      return Promise.reject(responseData.info)
    } else {
      if(responseData.code == 200) {
        return responseData
      }
    }
  }, (error) => {
    // 超出 2xx 范围的状态码都会触发该函数。
    // 对响应错误做点什么
    console.log(error);
    if(showLoading && loading) {
      loading.close()
    }
    return Promise.reject("网络异常")
  })

  // 发送post请求携带参数params
  return instance.post(url, params).catch(error => {
    // 显示拦截器返回的错误信息
    message.error(error)
    // 返回空，表示登录失败
    return null
  })
}

export default request