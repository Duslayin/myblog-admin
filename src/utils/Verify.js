const regs = {
  phone: /^((1[0-9]))\d{9}$/,
  password: /^[A-Za-z0-9]{8,}$/
}

const verify = (rule, value, reg, callback) => {
  if (value) {
      if (reg.test(value)) {
          callback()
      } else {
          callback(new Error(rule.message))
      }
  } else {
      callback()
  }
}

// 导出手机号与密码正则
export default {
  phone: (rule, value, callback) => {
      return verify(rule, value, regs.phone, callback)
  },
  password: (rule, value, callback) => {
      return verify(rule, value, regs.password, callback)
  },
}
