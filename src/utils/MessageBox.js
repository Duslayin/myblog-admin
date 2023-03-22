import { ElMessageBox } from 'element-plus'

const confirm = (msg, callbackFunc) => {
  ElMessageBox.confirm(
    msg,
    '提示',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      // 点击确认则执行回调函数
      callbackFunc()
    })
    .catch(() => {})
}

export default confirm