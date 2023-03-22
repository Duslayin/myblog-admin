<template>
  <div>
    <el-table ref="tableRef"
              :data="dataSource.list || []" 
              :height="tableHeight"
              :stripe="options.stripe"
              :border="options.border"
              header-row-class-name="table-header-row"
              highlight-current-row
              style="width: 100%"
              @row-click="handleRowClick"
              >
      <!--selection选择框-->
      <el-table-column v-if="options.selectType && options.selectType == 'checkbox'"
                       type="selection"
                       width="50"
                       align="center"></el-table-column>
      <!--序号-->
      <el-table-column v-if="options.showIndex"
                       label="序号"
                       type="index"
                       width="60"
                       align="center"></el-table-column>
      <!--数据列-->
      <template v-for="(column, index) in columns">
        <template v-if="column.scopedSlots">
          <el-table-column :key="index"
                           :prop="column.prop"
                           :label="column.label"
                           :align="column.align || 'left'"
                           :width="column.width">
            <!-- 使用table-column插槽自定义列的内容 -->
            <template #default="scope">
              <slot :name="column.scopedSlots"
                    :index="scope.$index"
                    :row="scope.row">
              </slot>
            </template>
          </el-table-column>
        </template>
        <template v-else>
          <el-table-column :key="index"
                           :prop="column.prop"
                           :label="column.label"
                           :align="column.align || 'left'"
                           :width="column.width"
                           :fixed="column.fixed">
          </el-table-column>
        </template>
      </template>
    </el-table>
    <!-- 分页 -->
    <div class="pagination"
         v-if="showPagination">
      <el-pagination v-if="dataSource.totalCount"
                     background
                     :total="dataSource.totalCount"
                     :page-sizes="[15, 30, 50, 100]"
                     :page-size="dataSource.pageSize"
                     :current-page.sync="dataSource.pageNo"
                     layout="total, sizes, prev, pager, next, jumper"
                     @size-change="handlePageSizeChange"
                     @current-change="handlePageNoChange"
                     style="text-align: right"></el-pagination>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const tableRef = ref(null)

const emit = defineEmits(["rowSelected", "rowClick"])
const props = defineProps({
  dataSource: Object,     /* 表格数据(必传) */
  showPagination: {
    type: Boolean,
    default: true,
  },
  columns: Array,         /* 数据列信息(必传) */
  options: {
    type: Object,
    default: {
      extHeight: 0,
      showIndex: false,
    }
  },
  fetch: Function,         /* 获取数据的函数(必传) */
  initFetch: {
    type: Boolean,
    default: true,
  }
})

//顶部 60+1 , 内容区域距离顶部 10, 内容上下内间距 20*2,  分页区域高度 42+10, 
const topHeight = 60 + 10 + 40 + 42 + 1;

const tableHeight = ref(
  props.options.tableHeight
    ? props.options.tableHeight
    : window.innerHeight - topHeight - props.options.extHeight
);

// 每页大小改变
const handlePageSizeChange = (pageSize) => {
  props.dataSource.pageSize = pageSize
  props.dataSource.pageNo = 1
  props.fetch()
}

// 当前页改变
const handlePageNoChange = (pageNo) => {
  props.dataSource.pageNo = pageNo
  props.fetch()
}

// 执行初始化函数
const init = () => {
  if(props.initFetch && props.fetch) {
    props.fetch()
  }
}

init()

// 点击行事件
const handleRowClick = (row) => {
  emit('rowClick', row)
}

//设置行选中
const setCurrentRow = (rowKey, rowValue) => {
  let row = props.dataSource.list.find((item) => {
    return item[rowKey] === rowValue;
  })
  tableRef.value.setCurrentRow(row)
}

//将子组件暴露出去，供父组件调用
defineExpose({
  setCurrentRow,
})

</script>

<style lang="less">
.pagination {
  padding-top: 10px;
}
.el-pagination {
  justify-content: right;
}

.el-table__body tr.current-row > td.el-table__cell {
  background-color: #e6f0f9;
}

.el-table__body tr:hover > td.el-table__cell {
  background-color: #e6f0f9 !important;
}
</style>