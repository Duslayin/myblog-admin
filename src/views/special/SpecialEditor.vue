<template>
  <div>
    <Window :show="windowConfig.show"
          :showCancel="windowConfig.showCancel"
          :buttons="windowConfig.buttons"
          @close="closeWindow">     <!-- 自定义事件(接收子组件传来的close事件) -->
      <el-form :model="blogFormData"
              :rules="rules"
              ref="blogFormRef">
        <el-form-item prop="title">
          <div class="input-title">
            <el-input v-model="blogFormData.title"
                      placeholder="请输入博客标题"></el-input>
          </div>
        </el-form-item>
        <el-form-item prop="content">
          <div style="width: 100%;">
            <MarkdownEditor v-model="blogFormData.markdownContent"
                            :height="markdownEditorHeight"
                            @htmlContent="setHtmlContent"
                            @save="autoSaveBlog('保存成功')">
            </MarkdownEditor>
          </div>
        </el-form-item>
      </el-form>
    </Window>
  </div>
</template>
<script setup>
import { ref, reactive, getCurrentInstance, nextTick, onUnmounted } from 'vue'

const { proxy } = getCurrentInstance();

const blogFormRef = ref(null)
const blogFormData = ref({ tag: [] })

const markdownEditorHeight = window.innerHeight  - 60 - 20 - 30 - 50 - 10 - 50


const api = {
  getBlogDetail: "/blog/getBlogById",
  saveBlog: "/blog/saveBlog4Special",
  autoSaveBlog: "/blog/autoSaveBlog4Special"

}

const rules = {
  title: [{ required: true, message: "请输入标题" }]
}

// 新增、修改博客
const windowConfig = reactive({
  show: false,
  showCancel: true,
  buttons: [
    {
      type: 'danger',
      text: '发布',
      click: () => {
        submitBlog()
      }
    }
  ]
})

// 保存博客
const submitBlog = () => {
  blogFormRef.value.validate(async (valid) => {
    if (!valid) {
      return;
    }
    let params = Object.assign({}, blogFormData.value);
    let result = await proxy.Request({
      url: api.saveBlog,
      params
    })
    if (!result) {
      return;
    }
    proxy.Message.success("博客发布成功")
    closeWindow();
  })
}

const emit = defineEmits();
const closeWindow = () => {
  windowConfig.show = false;
  emit("refreshList")
  if (timmer.value !== null) {
    clearTimmer();
  }
}

// 自动保存博客
const autoSaveBlog = async (msg) => {
  if (blogFormData.value.title == undefined || blogFormData.value.content == undefined || 
      timmer.value == null) {
    return
  }
  let params = {}
  Object.assign(params, blogFormData.value)
  const result = await proxy.Request({
    url: api.autoSaveBlog,
    params,
    showLoading: false
  })
  if(!result) {
    return 
  }
  blogFormData.value.blogId = result.data
  if(msg) {
    proxy.Message.success(msg)
  }
  // console.log('save');
}

// 设置定时器
let timmer = ref(null)

// 启动定时器(每隔一段时间保存博客)
const startTimmer = () => {
  timmer.value = setInterval(() => {
    autoSaveBlog()
  }, 5000)
}

// 清除定时器
const clearTimmer = () => {
  if(timmer.value != null) {
    clearInterval(timmer.value)
    timmer.value = null
  }
}

// 初始化编辑器window
const init = (type, data) => {
  // 开启自动保存
  startTimmer()
  windowConfig.show = true
  nextTick(() => {
    // 初始化表单数据
    blogFormRef.value.resetFields()
    blogFormData.value = { categoryId: data.categoryId, pBlogId: data.blogId }
    if(type == 'edit') {
      getBlogDetails(data.blogId)
    }
  })
}

defineExpose({init})

const getBlogDetails = async (blogId) => {
  let result = await proxy.Request({
    url: api.getBlogDetail,
    params: {
      blogId: blogId
    }
  })
  if (!result) {
    return
  }
  blogFormData.value = result.data;
  if (result.data.tag) {
    blogFormData.value.tag = result.data.tag.split("|");
  } else {
    blogFormData.value.tag = [];
  }
}

//markdown编辑器设置html内容
const setHtmlContent = (htmlContent) => {
  blogFormData.value.content = htmlContent
}

onUnmounted(() => {
  clearTimmer();
})
</script>
<style lang="less">
.input-title {
  width: 100%;
  border-bottom: 1px solid #ddd;
  .el-input__wrapper {
    box-shadow: none;
  }
}
</style>