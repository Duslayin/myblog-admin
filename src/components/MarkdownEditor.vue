<!-- 进一步封装markdown编辑器 -->
<template>
  <div>
    <v-md-editor v-model="editContent"
                 :height="height + 'px'"
                 :disabled-menus="[]"
                 :include-level="[1, 2, 3, 4, 5, 6]"
                 @upload-image="handleUploadImage"
                 @change="change"
                 @save="save"></v-md-editor>
  </div>
</template>

<script setup>
import { getCurrentInstance, ref, onUpdated } from 'vue'
import VMdEditor from '@kangc/v-md-editor'
import '@kangc/v-md-editor/lib/style/base-editor.css'
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js'
import '@kangc/v-md-editor/lib/theme/style/github.css'

// highlightjs
import hljs from 'highlight.js';

VMdEditor.use(githubTheme, {
  Hljs: hljs,
});

const { proxy } = getCurrentInstance()

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  height: {
    type: Number,
    default: 400
  }
})

// 接收父组件v-model的值并在子组件中双向绑定
const editContent = ref(props.modelValue)
onUpdated(() =>  {
  editContent.value = props.modelValue
  // console.log(editContent.value);
})


const handleUploadImage = async (event, insertImage, files) => {
  // console.log(files);
  const result = await proxy.Request({
    url: 'file/uploadImage',
    dataType: 'file',
    params: {
      file: files[0],
      type: 1
    }
  })
  if(!result) {
    return
  }
  insertImage({
    url: proxy.globalApi.userImgUrl + result.data.fileName,
    desc: '图片'
  })
}

const emit = defineEmits()
const change = (markdownContent, htmlContent) => {
  emit('update:modelValue', markdownContent)
  emit("htmlContent", htmlContent)
}

const save = () => {
  emit('save')
}
</script>