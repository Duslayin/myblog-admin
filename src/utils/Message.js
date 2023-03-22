// 封装消息弹窗
import { ElMessage } from "element-plus"; 

const message = {
  error: (msg) => {
    ElMessage({
      showClose: true,
      message: msg,
      type: 'error',
      duration: 2000
    })
  },
  success: (msg) => {
    ElMessage({
      showClose: true,
      message: msg,
      type: 'success',
      duration: 2000
    })
  }
}

export default message