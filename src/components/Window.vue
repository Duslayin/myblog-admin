<template>
  <div class="window" v-show="show">
    <div class="top-container">
      <div class="back" @click="close">
        <span class="iconfont icon-back"></span>
        <span class="text">返回</span>
      </div>
    </div>
    <div class="body">
      <slot></slot>
    </div>
    <template v-if="showCancel && buttons.length > 0">
      <div class="footer">
        <el-button link @click="close">取消</el-button>
        <el-button v-for="button in buttons" 
                :type="button.type"
                @click="button.click">{{ button.text }}</el-button>
      </div>
    </template>
  </div>
</template>

<script setup>

const emit = defineEmits(['close'])
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  showCancel: {
    type: Boolean,
    default: false
  },
  buttons: Array
})

const close = () => {
  emit('close')
}
</script>

<style lang="less">
  .window {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: calc(100vh - 70px);
    background-color: #fff;
    z-index: 3;
    .top-container {
      height: 30px;
      display: flex;
      align-items: center;
      .back {
        display: flex;
        align-items: center;
        cursor: pointer;
        color: #6b6b6b;
        font-weight: 700;
        .icon-back {
          font-size: 20px;
          padding-left: 10px;
        }
      }
    }
    .body {
      height: calc(100vh - 171px);
      background-color: #fff;
      padding: 10px;
    }
    .footer {
      text-align: center;
      line-height: 50px;
      border-top: 1px solid #ddd;
    }
  }
</style>