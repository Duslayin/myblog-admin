<template>
  <div>
    <el-dialog
      v-model="(dialogVisible)"
      :title="title"
      :width="width"
      :top="top"
      :draggable="true"
      :show-close="showClose"
      :showCancel="showCanel"
      class="cus-dialog"
      @close="close">
      <div class="dialog-body">
        <slot></slot>
      </div>
      <template v-if="showCanel && buttons.length > 0">
        <div class="dialog-footer">
          <el-button link
                      @click="close">
            取消
          </el-button>
          <el-button v-for="button in buttons"
                     :type="button.type" @click="button.click">
                     {{ button.text }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>

const emit = defineEmits()

const prop = defineProps({
  dialogVisible: {
    type: Boolean,
    default: false
  },
  width: {
    type: String,
    default: '30%'
  },
  top: {
    type: String,
    default: '20px'
  },
  title: {
    type: String
  },
  showClose: {
    type: Boolean,
    default: true
  },
  showCanel: {
    type: Boolean,
    default: true
  },
  buttons: Array
})

const close = () => {
  emit('close')
}

</script>

<style lang="less">
.cus-dialog {
  .el-dialog__body {
    padding: 0px;
  }
  .dialog-body {
    border-top: 1px solid #ddd;
    border-bottom: 1px solid #ddd;
    padding: 15px;
    min-height: 80px;
  }
  .dialog-footer {
    text-align: right;
    padding: 10px 20px;
  }
}
</style>