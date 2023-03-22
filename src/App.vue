<template>
  <div>
    <el-config-provider :locale="locale"
                        :message="config">
      <router-view></router-view>
    </el-config-provider>
  </div>
</template>


<script setup>
import zhCn from 'element-plus/lib/locale/lang/zh-cn';
import { reactive } from 'vue'

const locale = zhCn
const config = reactive({
  max: 1
})
</script>

<style scoped>

</style>
