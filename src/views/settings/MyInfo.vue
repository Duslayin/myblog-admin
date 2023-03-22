<template>
  <div>
    <el-form
      :model="formData"
      ref="formDataRef"
      :rules="rules"
      label-width="100px">
      <el-card style="width: 50%;"
               header="个人信息设置">
        <el-form-item label="头像" prop="avatar">
          <CoverUpload
            v-model="formData.avatar"
            @callback="saveAvatar"
          ></CoverUpload>
        </el-form-item>
        <el-form-item label="昵称" prop="nickName">
            <el-input v-model="formData.nickName" placeholder="请输入昵称">
            </el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入手机号">
          </el-input>
        </el-form-item>
        <el-form-item label="密码">
          <a href="javascript:;"
             class="a-link"
             @click="showUpdatePassword">修改密码</a>
        </el-form-item>
        <el-form-item label="" prop="editorType">
          <el-button type="danger" @click="saveInfo">保存</el-button>
        </el-form-item>
      </el-card>
    </el-form>
    <Dialog
      :dialogVisible="dialogConfig.show"
      :title="dialogConfig.title"
      :buttons="dialogConfig.buttons"
      width="400px"
      @close="dialogConfig.show = false"
    >
      <el-form
        :model="passwordFormData"
        ref="passwordFormRef"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="密码" prop="password">
          <el-input
            placeholder="请输入密码"
            type="password"
            v-model="passwordFormData.password"
          >
          </el-input>
        </el-form-item>
        <el-form-item label="重复密码" prop="rePassword">
          <el-input
            placeholder="请再次输入密码"
            type="password"
            v-model="passwordFormData.rePassword"
          >
          </el-input>
        </el-form-item>
      </el-form>
    </Dialog>
  </div>
</template>

<script setup>
import { useStore } from "vuex"
import { ref, reactive, getCurrentInstance, nextTick } from 'vue'
const store = useStore();
const { proxy } = getCurrentInstance()
const formData = ref({})
const formDataRef = ref(null)
//修改密码
const passwordFormData = ref({})
const passwordFormRef = ref(null)

const validateRePass = (rule, value, callback) => {
  if (value !== passwordFormData.value.password) {
    callback(new Error(rule.message));
  } else {
    callback();
  }
}

const rules = {
  nickName: [{ required: true, message: "昵称不能为空" }],
  password: [
    { required: true, message: "请输入密码" },
    {
      validator: proxy.Verify.password,
      message: "密码最少8位，只能包含数字或字母",
    },
  ],
  rePassword: [
    { required: true, message: "请再次输入密码" },
    {
      validator: validateRePass,
      message: "两次输入的密码不一致",
    },
  ],
  phone: [
    { required: true, message: "请输入手机号" },
    {
      validator: proxy.Verify.phone,
      trigger: "blur",
      message: "请输入正确的手机号",
    },
  ],
};

const dialogConfig = reactive({
  show: false,
  title: "修改密码",
  buttons: [
    {
      type: "danger",
      text: "确定",
      click: (e) => {
        submitPass();
      }
    }
  ]
})

const api = {
  getUserInfo: "getUserInfo",
  saveMyInfo: "saveMyInfo",
  saveAvatar: "saveAvatar",
  updateMyPassword: "updateMyPassword",
}

const getUserInfo = async () => {
  let result = await proxy.Request({
    url: api.getUserInfo,
  })

  if (!result) {
    return
  }
  // console.log(result.data);
  formData.value = result.data;
}
getUserInfo()

// 修改密码
const showUpdatePassword = () => {
  dialogConfig.show = true
  nextTick(() => {
    passwordFormRef.value.resetFields()
    passwordFormData.value = {};
  })
}

// 保存个人信息
const saveInfo = () => {
  formDataRef.value.validate(async (valid) => {
    if (!valid) {
      return;
    }
    let result = await proxy.Request({
      url: api.saveMyInfo,
      params: {
        avatar: formData.value.avatar,
        nickName: formData.value.nickName,
        phone: formData.value.phone,
        editorType: 1,
      },
    });
    if (!result) {
      return;
    }
    proxy.Message.success("保存成功");
    store.commit("updateUserInfo", {
      nickName: formData.value.nickName,
      avatar: formData.value.avatar,
    })
  })
}

// 保存头像
const saveAvatar = async (avatar) => {
  let result = await proxy.Request({
    url: api.saveAvatar,
    params: {
      avatar: avatar,
    },
  });
  if (!result) {
    reutrn;
  }
  proxy.Message.success("头像修改成功");
  store.commit("updateUserInfo", {
    nickName: formData.value.nickName,
    avatar: avatar,
  })
}

// 修改密码
const submitPass = () => {
  passwordFormRef.value.validate(async (valid) => {
    if (!valid) {
      return
    }
    let result = await proxy.Request({
      url: api.updateMyPassword,
      params: {
        password: passwordFormData.value.password,
      },
    })
    if (!result) {
      reutrn
    }
    dialogConfig.show = false
    proxy.Message.success("密码修改成功")
  })
}
</script>

<style lang='less'>

</style>