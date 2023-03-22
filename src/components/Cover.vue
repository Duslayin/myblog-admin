<!-- 封装封面组件 -->
<template>
  <div class="cover">
    <img v-if="cover" :src="proxy.globalApi.userImgUrl + cover">
    <img v-else src="../assets/csdn.png">
  </div>
</template>

<script setup>
import { getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()

const props = defineProps({
  cover: String
})
</script>

<style lang="less">
.cover {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ddd;
  overflow: hidden;
  width: 60px;
  height: 60px;  
  img {
    width: 100%;
  }
}
</style>