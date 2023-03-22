<template>
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
    <Dialog title="发布"
            width="800px"
            :dialogVisible="dialogOpt.dialogVisible"
            :buttons="dialogOpt.buttons"
            @close="dialogOpt.dialogVisible = false">
            <el-form :model="blogFormData"
                     label-width="100px"
                     label-position="right"
                     ref="settingFormRef"
                     :rules="rules">
              <el-form-item label="博客分类"
                            prop="categoryId">
                <el-select v-model="blogFormData.categoryId"
                           placeholder="请选择博客分类"
                           style="width: 100%;">
                  <el-option v-for="item in categoryList"
                             :label="item.categoryName"
                             :value="item.categoryId"/>
                </el-select>
              </el-form-item>
              <el-form-item label="封面"
                            prop="cover">
                <CoverUpload v-model="blogFormData.cover"></CoverUpload>
              </el-form-item>
              <el-form-item label="博客类型"
                            prop="type">
                <el-radio-group v-model="blogFormData.type">
                  <el-radio :label="0">原创</el-radio>
                  <el-radio :label="1">转载</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="原文地址"
                            prop="reprintUrl"
                            v-if="blogFormData.type==1">
                <el-input v-model="blogFormData.reprintUrl"
                          placeholder="请输入原文链接"></el-input>
              </el-form-item>
              <el-form-item label="评论"
                            prop="allowComment">
                <el-radio-group v-model="blogFormData.allowComment">
                  <el-radio :label="1">允许</el-radio>
                  <el-radio :label="0">不允许</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="博客摘要">
                <el-input v-model="blogFormData.summary"
                          type="textarea"
                          placeholder="请输入摘要"
                          :autosize="{minRows:4,maxRows:4}">
                </el-input>
              </el-form-item>
              <el-form-item label="博客标签">
                <el-tag v-for="(item, index) in blogFormData.tag" :key="index"
                        class="tag-item"
                        closable
                        @close="closeTag(index)">
                  {{ item }}
                </el-tag>
                <el-input v-model="tagInputVal"
                          style="width: 100px;"
                          v-if="showTagInput"
                          ref="tagInputRef"
                          @blur="submitTag"
                          @keyup.enter="submitTag"></el-input>
                <span class="add-text" v-if="blogFormData.tag.length==0">添加标签</span>
                <span class="iconfont icon-add"
                      @click="addTag"></span>
              </el-form-item>
            </el-form>
    </Dialog>
  </Window>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick, onMounted, onUnmounted } from 'vue'
import CoverUpload from '../../components/CoverUpload.vue';
const markdownEditorHeight = window.innerHeight  - 60 - 20 - 30 - 50 - 10 - 50

const api = {
  'loadCategoryList': '/category/loadAllCategory4Blog',
  'saveBlog': '/blog/saveBlog',
  'blogDetails': '/blog/getBlogById',
  'autoSaveBlog': '/blog/autoSaveBlog'
}

const { proxy } = getCurrentInstance()

const blogFormData = ref({ tag: [] })
const blogFormRef = ref(null)
const settingFormRef = ref(null)

const categoryList = ref([])

const tagInputVal = ref(null)
const tagInputRef = ref(null)
const showTagInput = ref(false)


const rules = {
  title: [{ required: true, message: '标题不能为空', trigger: 'blur' }],
  categoryId: [{ required: true, message: '分类不能为空', trigger: 'blur' }],
  type: [{ required: true, message: '类型不能为空', trigger: 'blur' }],
  reprintUrl: [{ required: true, message: '转载地址不能为空', trigger: 'blur' }],
  allowComment: [{ required: true, message: '是否允许评论', trigger: 'blur' }]
}

const loadCategoryList = async () => {
  const result = await proxy.Request({
    url: api.loadCategoryList
  })
  // console.log(result);
  categoryList.value = result.data
}

onMounted(() => {
  loadCategoryList()
})

// 去挂载时清除定时器
onUnmounted(() => {
  clearTimmer()
})

// 设置发布博客
const dialogOpt = ref({
  dialogVisible: false,
  buttons: [
    {
      text: '确定',
      type: 'danger',
      click: () => {
        submitBlog()
      }
    }
  ]
})

// 新增、修改博客
const windowConfig = reactive({
  show: false,
  showCancel: true,
  buttons: [
    {
      type: 'danger',
      text: '发布',
      click: () => {
        showDialog()
      }
    }
  ]
})

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

// 自动保存博客
const autoSaveBlog = async (msg) => {
  if (blogFormData.value.title == undefined || blogFormData.value.content == undefined || 
      timmer.value == null || dialogOpt.value.dialogVisible) {
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

// 初始化编辑器window
const init = (type, data) => {
  // 开启自动保存
  startTimmer()
  windowConfig.show = true
  nextTick(() => {
    // 初始化表单数据
    blogFormRef.value.resetFields()
    blogFormData.value = { tag: [] }
    if(type == 'edit') {
      getBlogDetails(data.blogId)
    }
  })
}

defineExpose({init})

// 修改博客时获取博客信息
const getBlogDetails = async (blogId) => {
  const result = await proxy.Request({
    url: api.blogDetails,
    params: {
      blogId
    }
  })
  if(!result) {
    return 
  }
  blogFormData.value = result.data
  if(blogFormData.value.tag) {
    // 将字符串拆分成数组形式
    blogFormData.value.tag = blogFormData.value.tag.split('|')
  } else {
    blogFormData.value.tag = []
  }
  // console.log(blogFormData.value);
}


// 显示博客提交弹出框
const showDialog = () => {
  blogFormRef.value.validate((valid) => {
    if(valid) {
      dialogOpt.value.dialogVisible = true
      // 先清除表单验证信息
      nextTick(() => {
        settingFormRef.value.clearValidate()
      })
    }
  })
}

// 保存提交博客
const submitBlog = () => {
  settingFormRef.value.validate(async (valid) => {
    if(valid) {
      let params = {}
      Object.assign(params, blogFormData.value)
      params.tag = params.tag.join('|')
      params.editorType = 1                 /* 默认为Markdown编辑器 */
      const result = await proxy.Request({
        url: api.saveBlog,
        params
      })
      if(!result) {
        return
      }
      proxy.Message.success('博客发布成功')
      // 关闭设置框
      dialogOpt.value.dialogVisible = false
      // 关闭编辑器窗口
      closeWindow()
    }
  })
}

const emit = defineEmits()
// 关闭窗口
const closeWindow = ()  => {
  // 清除定时器
  clearTimmer()
  windowConfig.show = false
  emit('refreshList')
}


// 点击添加标签
const addTag = () => {
  showTagInput.value = true
  // 等待DOM渲染完再操作ref
  nextTick(() => {
    // console.log(tagInputRef.value);
    tagInputRef.value.focus()
  })
}

// 添加标签
const submitTag = () => {
  showTagInput.value = false
  if(tagInputVal.value == undefined) {
    return
  }
  if(blogFormData.value.tag.indexOf(tagInputVal.value) == -1) {
    blogFormData.value.tag.push(tagInputVal.value)
  }
  tagInputVal.value = undefined
}

// 关闭标签
const closeTag = (index) => {
  blogFormData.value.tag.splice(index, 1)
}

//markdown编辑器设置html内容
const setHtmlContent = (htmlContent) => {
  blogFormData.value.content = htmlContent
}


</script>

<style lang="less">
  .input-title {
    width: 100%;
    border-bottom: 1px solid #ddd;
    .el-input__wrapper {
      box-shadow: none;
    }
  }
  .add-text {
    margin-left: 10px;
    color: #989898;
  }

  .icon-add {
    cursor: pointer;
    font-size: 20px;
  }

  .tag-item {
    margin-right: 10px;
  }
  .el-form-item.is-error .input-title .el-input__wrapper {
    box-shadow: none;
  }
</style>