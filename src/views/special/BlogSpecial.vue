<template>
  <div>
    <el-button type="danger"
               class="add-btn"
               @click="editSpecial('add')">新增专题</el-button>
    <el-row :gutter="10">
      <el-col :span="14">
        <el-card header="专题">
          <Table :dataSource="tableData"
                 :columns="columns"
                 :fetch="loadSpecialList"
                 :options="tableOptions"
                 @rowClick="rowClick"
                 ref="tableRef"
                 :showPagination="true">
            <template #cover="{ index, row }">
              <Cover :cover="row.cover"></Cover>
            </template>
            <template #op="{ index, row }">
              <a href="javascript:;" 
                 class="a-link" 
                 v-if="userInfo.userId==row.userId"
                 @click="editSpecial('edit', row)">修改</a>
              <span v-else>---</span>
              <el-divider direction="vertical" />
              <a href="javascript:;" 
                 class="a-link" 
                 v-if="userInfo.userId==row.userId"
                 @click="delSpecial(row)">删除</a>
              <span v-else>---</span>
            </template>
          </Table>
        </el-card>
      </el-col>
      <el-col :span="10">
        <el-card header="专题文章">
          <div :style="{ 'margin-bottom': '5px' }">
            <el-alert title="红色代表草稿、绿色代表已发布；拖动文章修改排序"
                      type="info"
                      show-icon
                      :closable="false" />
          </div>
          <el-tree ref="treeRef"
                   class="tree-panel"
                   :data="blogList"
                   node-key="blogId"
                   :props="treeProps"
                   :expand-on-click-node="false"
                   :highlight-current="true"
                   draggable
                   @node-drop="blogDrag"
                   defaultExpandAll> 
            <template #default="{ node, data }">
              <span class="custom-node-style">
                <span class="node-title">
                  <span v-if="data.status==0"
                        :style="{'color':'red','font-size':'13px', 'font-weight': 600}"> {{ data.title }}</span>
                  <span v-else
                        :style="{'color':'green','font-size':'13px', 'font-weight': 600}"> {{ data.title }}</span>
                </span>
                <span class="node-op">
                  <template v-if="data.blogId === '0'">
                    <a class="a-link"
                       href="javascript:void(0)"
                       @click="showEditor('add', data)">新增文章</a>
                  </template>
                  <template v-else>
                    <a class="a-link"
                       href="javascript:void(0)"
                       @click="showDetail(data)">预览</a>
                    <el-divider direction="vertical" />
                    <a class="a-link"
                       href="javascript:void(0)"
                       @click="showEditor('edit', data)"
                       v-if="userInfo.userId==data.userId"
                       >修改</a>
                    <span v-else>---</span>
                    <el-divider direction="vertical" />
                    <a class="a-link"
                       href="javascript:void(0)"
                       @click="recoveryBlog(data)"
                       v-if="userInfo.userId==data.userId"
                       >删除</a>
                    <span v-else>---</span>
                    <el-divider direction="vertical" />
                    <a class="a-link"
                       href="javascript:void(0)"
                       @click="showEditor('add', data)">新增下级文章</a>
                  </template>
                </span>
              </span>
            </template>
          </el-tree>
        </el-card>
      </el-col>
    </el-row>
    <Dialog :dialogVisible="dialogOpt.show"
            width="500px"
            :buttons="dialogOpt.buttons"
            :title="dialogOpt.title"
            @close="dialogOpt.show = false">
      <el-form :model="formData"
               ref="formRef"
               :rules="rules"
               label-width="80px">
        <el-form-item label="名称"
                      prop="categoryName">
          <el-input v-model="formData.categoryName"
                    placeholder="请输入专题名称"></el-input>
        </el-form-item>
        <el-form-item label="封面"
                      prop="cover">
          <CoverUpload v-model="formData.cover"></CoverUpload>
        </el-form-item>
        <el-form-item label="简介"
                      prop="categoryDesc">
          <el-input v-model="formData.categoryDesc"
                    type="textarea"
                    palceholder="请输入专题简介"
                    :autosize="{minRows:4,maxRows:4}"></el-input>
        </el-form-item>
      </el-form>
    </Dialog>
    <SpecialEditor ref="specialEditorRef"
                   @refreshList="refreshList">
    </SpecialEditor>
    <BlogDetails ref="specialDetailsRef"></BlogDetails>
  </div>
</template>

<script setup>
import { nextTick } from 'process';
import { ref, reactive, getCurrentInstance } from 'vue'
import SpecialEditor from './SpecialEditor.vue'
import BlogDetails from '@/views/blog/BlogDetails.vue';

const { proxy } = getCurrentInstance()

const userInfo = ref(proxy.VueCookies.get("userInfo") || {})

const tableData = ref({})
const formData = ref({})
const formRef = ref(null)
const tableRef = ref(null)
const blogList = ref([])          /* 专题文章分类列表 */
const currentCategoryId = ref(null)       /* 当前选择的博客id */
const specialEditorRef = ref(null)    /* 专题文章编辑器 */
const specialDetailsRef = ref(null)   /* 专题文章预览 */
const dialogOpt = reactive({
  show: false,
  title: '专题',
  buttons: [
    {
      text: '确定',
      type: 'danger',
      click: () => {
        submitForm()
      }
    }
  ]
})

const columns = [
  {
    label: '封面',
    width: 100,
    prop: 'cover',
    scopedSlots: "cover"
  },
  {
    label: '名称',
    width: 200,
    prop: 'categoryName',
  },
  {
    label: '简介',
    prop: 'categoryDesc'
  },
  {
    label: '博客数量',
    width: 100,
    prop: 'blogCount',
  },
  {
    label: "操作",
    prop: "op",
    width: 100,
    scopedSlots: "op",
  }
]

const rules = {
  categoryName: [
    {
      required: true,
      message: '请输入专题名称',
      trigger: 'blur'
    }
  ]
}

const tableOptions = {
  extHeight: 141
}

const api = {
  'specialList': '/category/loadCategory4Special',
  'saveSpecial': '/category/saveCategory4Special',
  'delSpecial': '/category/delCategory4Special',
  'getSpecialInfo': '/blog/getSpecialInfo',
  'recoveryBlog': "/blog/recoveryBlog",
  'updateSpecialBlogSort': '/blog/updateSpecialBlogSort'
}

// 加载专题列表数据
const loadSpecialList = async () => {
  const result = await proxy.Request({
    url: api.specialList
  })
  if(!result) {
    return 
  }
  Object.assign(tableData.value, result.data)
  // 设置默认选择第一条列表数据
  if(currentCategoryId.value == null && tableData.value.list.length > 0) {
    currentCategoryId.value = tableData.value.list[0].categoryId
    loadBlogList()
  }
  nextTick(() => {
    tableRef.value.setCurrentRow('categoryId', currentCategoryId.value)
  })
}

// 新增或修改专题
const editSpecial = (type, data) => {
  dialogOpt.show = true
  nextTick(() => {
    formRef.value.resetFields()
    if(type == 'add') {
      formData.value = {}
      dialogOpt.title = '添加专题'
    } else if(type == 'edit') {
      // 引用会出现错误
      // formData.value = data
      // 使用浅拷贝
      Object.assign(formData.value, data)
      dialogOpt.title = '修改专题'
    }
  })
}

// 提交提示框
const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if(valid) {
      dialogOpt.show = false
      let params = {}
      Object.assign(params, formData.value)
      const result = await proxy.Request({
        url: api.saveSpecial,
        params
      })
      if(!result) {
        return
      }
      proxy.Message.success('保存成功')
      loadSpecialList()
    }
  })
}

// 删除专题
const delSpecial = (data) => {
  proxy.Confirm(`确定要删除\"${data.categoryName}\"专题?`, async () => {
    const result = await proxy.Request({
      url: api.delSpecial,
      params: {
        categoryId: data.categoryId
      }
    })
    if(!result) {
      return 
    }
    proxy.Message.success('删除成功')
    loadSpecialList()
    // 重置当前专题id
    currentCategoryId.value = null
  })
}

// 加载博客列表
const loadBlogList = async () => {
  const result = await proxy.Request({
    url: api.getSpecialInfo,
    params: {
      categoryId: currentCategoryId.value,
      showType: "1"         /* 只包含分类 */
    }
  })
  blogList.value = result.data
  // console.log(blogList.value)
}

// 刷新专题列表和博客文章列表
const refreshList = () => {
  loadBlogList()
  loadSpecialList()
}

// 点击行
const rowClick = (row) => {
  currentCategoryId.value = row.categoryId
  loadBlogList()
}

//属性展示专题
const treeProps = {
  children: "children",
  label: "title",
  value: "blogId",
}


// 修改文章
const showEditor = (type, data) => {
  // 显示并初始化编辑弹出框
  specialEditorRef.value.init(type, data)
}

// 删除文章
const recoveryBlog = (data) => {
  proxy.Confirm(`确定要删除\"${data.title}\"?`, async () => {
    const result = await proxy.Request({
      url: api.recoveryBlog,
      params: {
        blogId: data.blogId
      }
    })
    if(!result) {
      return 
    }
    proxy.Message.success('博客已移至回收站')
    refreshList()
  })
}

// 预览文章
const showDetail = (data) => {
  specialDetailsRef.value.initWindow(data.blogId)
}

//拖动改变排序，修改父级
const blogDrag = async (draggingNode, dropNode, dropType, ev) => {
  console.log(draggingNode, dropNode, dropType)
    //拖入某个节点内，修改父级节点为目标节点，同时修改目标节点下的所有子节点的排序
  let parentNode = null
  if (dropType == "inner") {
    //拖入某个几点内，修改父级节点为目标节点，同时修改目标节点下的所有子节点的排序
    parentNode = dropNode
  } else {
    //拖入之前，之后，修改被拖动的节点的父节点为目标节点的父节点，同时修改目标节点父节点下所有的子节点的排序
    parentNode = dropNode.parent
  }
  //操作的节点ID
  const blogId = draggingNode.data.blogId
  // 操作节点的父级节点ID
  const pBlogId = parentNode.data.blogId
  //需要重新排序的博客ID
  const blogIds = []
  parentNode.childNodes.forEach((element) => {
    blogIds.push(element.data.blogId)
  })
  let params = {
    blogId,
    pBlogId,
    blogIds: blogIds.join(","),
  }
  let result = await proxy.Request({
    url: api.updateSpecialBlogSort,
    params,
  })
  if (!result) {
    return
  }
  //重新加载文章树
  loadBlogList()
}
</script>

<style lang="less">
  .add-btn {
    margin-bottom: 10px;
  }

  .tree-panel {
    height: calc(100vh - 293px);
    overflow: auto;
    .el-tree-node__content {
      .custom-node-style {
        flex: 1;              /* 使盒子的宽度拉满 */
        display: flex;
        justify-content: space-between;
      }
    }
  }

</style>