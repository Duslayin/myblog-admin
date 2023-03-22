<template>
  <div>
    <Window :show="show"
            @close="close">
      <div class="blogDetail-box">
        <h1 class="blog-title">{{ blogDetailsData.title }}</h1>
        <!-- 正文 -->
        <div v-html="blogDetailsData.content"
             class="blog-details"></div>
      </div>
    </Window>    
  </div>
</template>

<script setup>
import { getCurrentInstance, ref, nextTick } from 'vue'
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-light.css";    //样式

const show = ref(null)
const blogDetailsData = ref({})     /* 对象类型 */
const { proxy } = getCurrentInstance()

const api = {
  'blogDetails': '/blog/getBlogById'
}

// 初始化窗口
const initWindow = async (blogId) => {
  show.value = true
  const result = await proxy.Request({
    url: api.blogDetails,
    params: {
      blogId
    }
  })
  if(!result) {
    return
  }
  blogDetailsData.value = result.data
  nextTick(() => {
    let blocks = document.querySelectorAll('pre code')
    blocks.forEach((block) => {
      hljs.highlightElement(block)
    })
  })
}
defineExpose({ initWindow })

// 关闭窗口
const close = () => {
  show.value = false
  blogDetailsData.value = {}
}

</script>

<style lang="less">
.blogDetail-box {
  padding: 0 10px;
  .blog-title {
    font-size: 28px;
    color: #222226;
    margin: 0 0 10px 0;
    padding-bottom: 10px;
    border-bottom: 2px solid #ddd;
  }
  
  .blog-details {
    blockquote {
      padding: 0 1em;
      color: #6a737d;
      border-left: 0.25em solid #dfe2e5;
    }
  
    img {
     max-width: 80%;
    }
  }
}



</style>