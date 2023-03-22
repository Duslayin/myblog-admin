import { createApp } from 'vue'
import router from '@/router'
import store from '@/store'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@/assets/icon/iconfont.css'
import './style.css'
import App from './App.vue'
import VueCookies from 'vue-cookies'
import Table from '@/components/Table.vue'
import Cover from '@/components/Cover.vue'
import Dialog from '@/components/Dialog.vue'
import CoverUpload from '@/components/CoverUpload.vue'
import Window from '@/components/Window.vue'
import MarkdownEditor from '@/components/MarkdownEditor.vue'
import Request from '@/utils/Request.js'
import Message from '@/utils/message'
import Confirm from '@/utils/MessageBox.js'
import Verify from '@/utils/Verify'


const app = createApp(App)
app.use(router)
app.use(ElementPlus)
app.use(store)
app.component('Table', Table)
app.component('Cover', Cover)
app.component('Dialog', Dialog)
app.component('CoverUpload', CoverUpload)
app.component('Window', Window)
app.component('MarkdownEditor', MarkdownEditor)
app.config.globalProperties.VueCookies = VueCookies
app.config.globalProperties.Request = Request     /* 将封装的axios网络请求函数定义为全局变量 */
app.config.globalProperties.Message = Message
app.config.globalProperties.Confirm = Confirm     /* 消息弹出框 */
app.config.globalProperties.Verify = Verify
app.config.globalProperties.globalApi = {
  userImgUrl: '/api/file/getImage/'
}
app.mount('#app')