<template>
   <el-upload
    class="avatar-uploader"
    accept=".png,.PNG,.jpg,.JPG,.jpeg,.JPEG,.gif,.GIF,.bmp,.BMP"
    :multiple="false"
    :http-request="uploadImg"
    :show-file-list="false"
  >
    <img v-if="modelValue" :src="proxy.globalApi.userImgUrl+modelValue"  />
    <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
  </el-upload>
</template>

<script setup>
import { Plus } from '@element-plus/icons-vue'
import { getCurrentInstance } from 'vue';

const { proxy } = getCurrentInstance()
const props = defineProps({
  modelValue: {
    type: String,
    default: null
  }
})
const emit = defineEmits()

const api = {
  uploadUrl: "file/uploadImage"
}

const uploadImg = async (file) => {
  // console.log(file);
  const result = await proxy.Request({
    url: api.uploadUrl,
    params: {
      file: file.file,
      type: 0
    },
    dataType: 'file'
  })
  // console.log(result);
  const fileName = result.data.fileName       /* 获取文件存储相对路径 */
  emit('update:modelValue', fileName)       /* 更新父组件绑定的路径值 */
  emit("callback", fileName)              /* 回调函数 */
}
</script>

<style lang="less">

.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 150px;
  height: 150px;
  text-align: center;
}
</style>