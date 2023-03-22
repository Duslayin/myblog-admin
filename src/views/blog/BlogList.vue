<template>  
  <div>
    <!-- 顶部表单 -->
    <div class="top-panel">
      <el-form :model="searchFormData"
               label-width="50px">
        <el-row>
          <el-col :span="6">
            <el-form-item label="标题" prop="titleFuzzy">
              <el-input v-model="searchFormData.titleFuzzy"
                        placeholder="请输入博客标题"
                        clearable
                        @keydown.enter="loadDataList"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="状态" prop="status">
              <el-select v-model="searchFormData.status"
                         clearable
                         placeholder="选择状态过滤">
                <el-option label="草稿"
                           :value="0"></el-option>
                <el-option label="已发布"
                           :value="1"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-form-item label="分类" prop="categoryId">
              <el-select v-model="searchFormData.categoryId"
                         clearable
                         placeholder="请选择分类">
                <el-option v-for="item in categoryList"
                           :label="item.categoryName"
                           :value="item.categoryId"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4">
            <el-button type="danger"
                       style="margin-left: 20px;"
                       @click="loadDataList">搜索</el-button>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <el-button type="danger"
               @click="showEditor('add')">新增博客</el-button>
    <Table :dataSource="tableData"
           :columns="columns"
           :fetch="loadDataList"
           :options="tableOptions"
           :showPagination="true">
      <template #cover="{ index, row }">
        <Cover :cover="row.cover"></Cover>
      </template>
      <template #blogInfo="{ index, row }">
        <p>标题：{{ row.title }}</p>
        <p>分类：{{ row.categoryName }}</p>
        <p>作者：{{ row.nickName }}</p>
      </template>
      <template #typeName="{ index, row }">
        <div>类型：<span v-if="row.type==0">原创</span><span v-if="row.type==1">转载</span></div>
        <div v-if="row.type==1">转载地址：{{ row.reprintUrl }}</div>
      </template>
      <template #statusName="{ index, row }">
        <span v-if="row.status==1" :style="{color: 'green'}">{{ row.statusName }}</span>
        <span v-if="row.status==0" :style="{color: 'red'}">{{ row.statusName }}</span>
      </template>
      <template #time="{ index, row }">
        <p>创建时间：{{ row.createTime }}</p>
        <p>发布时间：{{ row.lastUpdateTime }}</p>
      </template>
      <template #op="{ index, row }">
        <a href="javascript:;" 
           class="a-link" 
           v-if="userInfo.userId==row.userId"
           @click="showEditor('edit', row)">修改</a>
        <span v-else>---</span>
        <el-divider direction="vertical" />
        <a href="javascript:;" 
           class="a-link" 
           v-if="userInfo.userId==row.userId"
           @click="recoveryBlog(row)">删除</a>
        <span v-else>---</span>
        <el-divider direction="vertical" />
        <a href="javascript:;" 
           class="a-link" 
           @click="showDetails(row)">预览</a>
      </template>
    </Table>
    <!-- 博客编辑器 -->
    <BlogEditor ref="blogEditorRef"
                @refreshList="loadDataList"></BlogEditor>
    <BlogDetails ref="blogDetailsRef"></BlogDetails>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance } from 'vue'
import BlogEditor from '@/views/blog/BlogEditor.vue'
import BlogDetails from './BlogDetails.vue';

const { proxy } = getCurrentInstance()
const searchFormData = reactive({})         /* 对象类型 */
const categoryList = ref([])                /* 数组类型 */
const tableData = ref({})                   /* 表单数据 */
const blogEditorRef = ref(null)
const blogDetailsRef = ref(null)


const userInfo = ref(proxy.VueCookies.get("userInfo") || {})

const api = {
  'categoryList': '/category/loadAllCategory4Blog',
  'loadDataList': '/blog/loadBlog',
  'recoveryBlog': '/blog/recoveryBlog'
}

const tableOptions = {
  // 额外高度(搜索表单50px+新增按钮32px)
  extHeight: 50 + 32
}

const columns = [
  {
    label: '封面',
    width: 80,
    prop: 'cover',
    scopedSlots: "cover"
  },
  {
    label: '文章信息',
    width: 300,
    prop: 'blogInfo',
    scopedSlots: 'blogInfo'
  },
  // {
  //   label: '编辑器',
  //   width: 100,
  //   prop: 'editorTypeName'
  // },
  {
    label: '类型',
    width: 150,
    prop: 'typeName',
    scopedSlots: 'typeName'
  },
  {
    label: "评论",
    prop: "allowCommentTypeName",
    width: 100,
  },
  {
    label: "状态",
    prop: "status",
    width: 100,
    scopedSlots: "statusName",
  }, 
  {
    label: "时间",
    prop: "time",
    width: 300,
    scopedSlots: "time",
  }, 
  {
    label: "操作",
    prop: "op",
    width: 200,
    scopedSlots: "op",
  }
]

// 加载分页信息
const loadCategoryList = async () => {
  const result = await proxy.Request({
    url: api.categoryList
  })
  if(!result) {
    return 
  }
  categoryList.value = result.data
}

loadCategoryList()

// 加载列表数据(带分页功能)
const loadDataList = async () => {
  // console.log(tableData.value);
  let params = {
    pageNo: tableData.value.pageNo,
    pageSize: tableData.value.pageSize
  }
  // 将搜索表单数据添加到请求参数中
  Object.assign(params, searchFormData)

  const result = await proxy.Request({
    url: api.loadDataList,
    params
  })
  if(!result) {
    return 
  }
  // console.log(result.data);
  tableData.value = result.data       /* 表格数据赋值 */
}

// 新增或修改博客
const showEditor = (type, data) => {
  // 调用子组件的初始化方法
  blogEditorRef.value.init(type, data)
}

// 删除博客(回收站)
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
    loadDataList()
  })
}

// 展示博客详情
const showDetails = (data) => {
  blogDetailsRef.value.initWindow(data.blogId)
}

</script>