<template>
  <div>
    <el-button type="danger" 
               @click="showEdit('add')"
               v-if="userInfo.roleType==1">添加分类</el-button>
    <Table :dataSource="tableData"
           :columns="columns"
           :fetch="loadDataList">
      <!-- 接收子组件传来的值 row代表当前行的所有数据内容 -->
      <!-- 封面组件 -->
      <template #cover="{index, row}">
        <Cover :cover="row.cover"></Cover>
      </template>
      <!-- 操作栏 -->
      <template #op="{index, row}">
        <div class="op-panel" v-if="userInfo.roleType==1">
          <a href="javascript:;" class="a-link" @click="showEdit('update', row)">修改</a>
          <el-divider direction="vertical" />
          <a href="javascript:;" class="a-link" @click="del(row)">删除</a>
          <el-divider direction="vertical" />
          <a href="javascript:;" :class="[index==0?'not-allow':'a-link']" 
                                 @click="sortChange('up',index)">上移</a>
          <el-divider direction="vertical" />
          <a href="javascript:;" :class="[index==tableData.list.length-1?'not-allow':'a-link']"
                                 @click="sortChange('down',index)">下移</a>
        </div>
        <span v-else>---</span>
      </template>
    </Table>
    <Dialog :title="dialogOpt.title"
            :dialogVisible="dialogOpt.show"
            :buttons="dialogOpt.buttons"
            width="500px"
            @close="dialogOpt.show = false"
            >
      <!-- 内容部分 -->
      <el-form :model="formData"
               label-width="80px"
               :rules="rules"
               ref="formRef">
        <el-form-item label="名称"
                      prop="categoryName">
          <el-input
            placeholder="请输入名称"
            v-model="formData.categoryName"
          >
          </el-input>
        </el-form-item>
        <el-form-item label="封面"
                      prop="cover">
          <CoverUpload v-model="formData.cover"></CoverUpload>
        </el-form-item>
        <el-form-item label="简介"
                      prop="categoryDesc">
          <el-input 
            type="textarea"
            placeholder="请输入简介"
            v-model="formData.categoryDesc"
            :autosize="{minRows:4,maxRows:4}">
          </el-input>
        </el-form-item>
      </el-form>
    </Dialog>
  </div>
</template>

<script setup>
import { nextTick } from 'process';
import { ref, reactive } from 'vue'
import { getCurrentInstance } from 'vue';


const { proxy } = getCurrentInstance()
const tableData = reactive({})

const userInfo = ref(proxy.VueCookies.get("userInfo") || {});

const dialogOpt = reactive({
  show: false,
  title: '提示',
  buttons: [
    {
      type: 'danger',
      text: '确定',
      click: (e) => {
        // console.log('dialog确认按钮被点击');
        submitForm()
      }
    }
  ]
})

const api = {
  'loadDataList': 'category/loadAllCategory4Blog',
  'saveCategory': 'category/saveCategory4Blog',
  'delCategory': 'category/delCategory4Blog',
  'sortCategory': 'category/changeCategorySort4Blog'
}

// 表格数据
const formData = reactive({})
const formRef = ref(null)

const columns = [
  {
    label: '封面',
    prop: 'cover',
    width: 100,
    scopedSlots: 'cover'
  },
  {
    label: '名称',
    prop: 'categoryName',
    width: 200
  },
  {
    label: '简介',
    prop: 'categoryDesc',
  },
  {
    label: '博客数量',
    prop: 'blogCount',
    width: 100
  },
  {
    label: "操作",
    prop: "op",
    width: 200,
    scopedSlots: "op",
  }
]

const rules = {
  categoryName: [
    {
      required: true,
      message: '请输入分类名称',
      trigger: 'blur'
    }
  ]
}

// 加载表格数据
const loadDataList = async () => {
  const result = await proxy.Request({
    url: api.loadDataList
  })
  if(!result) {
    return 
  }
  // console.log(result.data);
  tableData.list = result.data      /* 给表格数据赋值 */
}

// 新增或修改分类
const showEdit = (type, data) => {
  dialogOpt.show = true
  nextTick(() => {
    formRef.value.resetFields()
    if(type == 'update') {
      dialogOpt.title = '修改分类'
      Object.assign(formData, data)
    } else if(type == 'add') {
      dialogOpt.title = '新增分类'
    }
  })
}

// 表单确认按钮点击事件
const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if(!valid) {
      return 
    }
    let params = {}
    Object.assign(params, formData)         /* assign赋值 */
    // console.log(params);
    const result = await proxy.Request({
      url: api.saveCategory,
      params
    })
    if(!result) {
      return
    }
    proxy.Message.success('保存成功')
    dialogOpt.show = false
    loadDataList()            /* 重新加载表格数据 */
  })
}

// 删除分类
const del = (data) => {
  // console.log(data);
  proxy.Confirm(`确定要删除\"${data.categoryName}\"?`, async () => {
    const result = await proxy.Request({
      url: api.delCategory,
      params: {
        categoryId: data.categoryId
      }
    })
    if(!result) {
      return 
    }
    proxy.Message.success('删除成功')
    loadDataList()
  })
}

// 上移、下移操作
const sortChange = async (type, index) => {
  if(type == 'up' && index == 0 || type == 'down' && index == tableData.list.length - 1) {
    return 
  }
  let list = tableData.list
  let num = type == 'up' ? -1 : 1
  // 交换数组数据
  const temp = list[index]
  list.splice(index, 1)
  list.splice(index + num, 0, temp)
  // console.log(JSON.stringify(list))
  const result = await proxy.Request({
    url: api.sortCategory,
    params: list,
    dataType: 'json'
  })
  if(!result) {
    return
  }
  proxy.Message.success('排序成功')
}
</script>

<style lang="less">
  .op-panel {
    display: flex;
    text-align: center;

  }
</style>