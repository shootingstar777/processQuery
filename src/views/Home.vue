<template>
  <div>
    <div style="height: 230px;">
      <a-card class="queryCard">
        <a-form-model ref="queryFromModel" :model="queryForm" :label-col="labelCol" :wrapper-col="wrapperCol"
          style="margin:0 40px">
          <a-row class="firstRow">
            <a-form-item label="状态" prop="workFlowType">
              <a-select v-model="queryForm.workFlowType" placeholder="请选择流程状态" @change="handleSelectChange">
                <a-select-option v-for="item in statusOptions" :key="item.id" :value="item.value">{{ item.label
                }}</a-select-option>

              </a-select>

            </a-form-item>
            <a-form-item label="流程名称" prop="processName">

              <a-tree-select v-model="queryForm.processName" allowClear :filterTreeNode="filterTreeNode" show-search
                :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }" :tree-data="processTreeData" placeholder="选择"
                :replaceFields="processReplaceFields">
                <!-- @change="treeChange" -->
              </a-tree-select>
            </a-form-item>
            <a-form-model-item label="流程发起人" prop="creator">
              <a-input v-model="queryForm.creator" placeholder="流程发起人">
                <a-icon slot="prefix" type="user" style="color:rgba(0,0,0,.25)" />
              </a-input>
            </a-form-model-item>

            <a-form-model-item label="流程标题" prop="serialTitle">
              <a-input v-model="queryForm.serialTitle" placeholder="流程标题">
                <a-icon slot="prefix" type="user" style="color:rgba(0,0,0,.25)" />
              </a-input>
            </a-form-model-item>
          </a-row>
          <a-row class="secondRow">
            <a-form-model-item label="流水号" prop="orderNo">
              <a-input v-model="queryForm.orderNo" placeholder="流水号">
              </a-input>
            </a-form-model-item>
            <a-form-model-item label="创建开始时间" prop="startDate">
              <a-date-picker v-model="queryForm.startDate" :disabled-date="disabledStartDate" format="YYYY-MM-DD"
                placeholder="开始时间" @openChange="handleStartOpenChange" />
            </a-form-model-item>
            <a-form-model-item label="创建结束时间" prop="endDate">
              <a-date-picker v-model="queryForm.endDate" :disabled-date="disabledEndDate" format="YYYY-MM-DD"
                placeholder="结束时间" :open="endOpen" @openChange="handleEndOpenChange" />
            </a-form-model-item>
            <a-form-item label="当前处理人" style="min-width:300px" v-if="showFormItem" prop="actorId">

              <a-input disabled placeholder="请选择" v-model="queryForm.actor">
                <span slot="addonAfter" @click="modalVisible = true" style="cursor:pointer;color:#108ee9">选择
                </span>
              </a-input>
            </a-form-item>
          </a-row>
          <div class="formBtn">
            <a-button style="margin-right:20px" :disabled="loadDisabled">
              导出流程
            </a-button>
            <a-button style="margin-right:20px" @click="resetQueryFrom">
              重置
            </a-button>
            <a-button type="primary" @click="getDataGridList(queryForm)" :loading="queryLoading">
              查询
            </a-button>
          </div>
        </a-form-model>
      </a-card>
    </div>

    <div>

      <!-- <a-button class="editable-add-btn">
        取消流程
      </a-button>
      <a-button class="editable-add-btn">
        回退流程
      </a-button>
      <a-button class="editable-add-btn">
        删除流程
      </a-button> -->
      <a-table bordered :data-source="tableDataSource" :columns="columns" :row-selection="rowSelection"
        :rowKey="(record, index) => { return index }" :pagination="false">
        <template slot="operation" slot-scope="text, record, index">
          <!-- <a-button type="link">取消</a-button>
         <a-button type="link">回退</a-button>
         <a-button type="link">删除</a-button>
         <a-button type="link">审批</a-button> -->
          <a-button type="link">导出</a-button>
          <a-button type="link">查看</a-button>
        </template>
      </a-table>
      <a-pagination show-size-changer :current="queryForm.current" :total="total" :showTotal="(total) => `共${total}条`"
        :pageSize="queryForm.pageSize" style="float: right;margin:10px" @showSizeChange="showSizeChange" />
    </div>
    <!-- 选择当前处理人 -->
    <a-modal title="当前处理人选择" :visible="modalVisible" @cancel="actorCancel" :footer="null" width="820px">
      <a-input-search v-model="actorQueryForm.searchText" placeholder="搜索处理人姓名或部门名称" />
      <!-- -->
      <a-card style="margin-top:10px">
        <div class="modalCard">
          <div class="left">
            <a-tree multiple :autoExpandParent="true" checkable :tree-data="deptTreeNode" :replaceFields="replaceFields"
              @check="onCheck" />
          </div>
          <div class="right">
            <a-spin :spinning="loading" class="mySpin" />
            <a-list item-layout="horizontal" :data-source="actorList">
              <a-list-item slot="renderItem" slot-scope="item, index">
                <a-list-item-meta>
                  <p slot="title" class="listTitle" @click="actorSelected(item)">{{ item.name }}</p>
                  <p slot="description" style="text-align: center;">{{ item.orgName }}</p>
                </a-list-item-meta>
              </a-list-item>
            </a-list>
          </div>
        </div>


      </a-card>
    </a-modal>
  </div>
</template>

<script>
import locale from 'ant-design-vue/es/date-picker/locale/zh_CN';
import { getCommonGroup_, getCommonUserJson_ } from '@/network/dept.js'
import { getDataGridList_ } from '@/network/work.js'
import { getProcessTree_ } from '@/network/process.js'
let columns = [
  {
    title: '流水号',
    dataIndex: 'orderNo',
    key: 'orderNo',

    scopedSlots: { customRender: 'orderNo' },
  },
  {
    title: '流程名称',
    dataIndex: 'processName',
    key: 'processName',
  },
  {
    title: '流程标题',
    dataIndex: 'serialTitle',
    key: 'serialTitle',
  },

  {
    title: '当前处理步骤',
    dataIndex: 'taskName',
    key: 'taskName',
  },
  {
    title: '流程创建时间',
    dataIndex: 'orderCreateTime',
    key: 'orderCreateTime',
  },
  {
    title: '流程结束时间',
    dataIndex: 'endTime',
    key: 'endTime',
  },

  {
    title: '创建人',
    dataIndex: 'creator',
    key: 'creator',
  },

  {
    title: '操作',
    key: 'operation',
    scopedSlots: { customRender: 'operation' },
  },
];
const rowSelection = {
  onChange: (selectedRowKeys, selectedRows) => {
    console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows)
    let newId = selectedRowKeys.id
    let oldId = selectedRows[0].id
    if (newId != oldId) {
      this.loadDisabled = true
    } else {
      this.loadDisabled = false
    }
  },
  onSelect: (record, selected, selectedRows) => {
    console.log(record, selected, selectedRows);
  },
  onSelectAll: (selected, selectedRows, changeRows) => {
    console.log(selected, selectedRows, changeRows);
  },
};
export default {

  data() {
    return {
      locale,
      columns,
      rowSelection,
      queryLoading: false,
      loadDisabled: false,
      loading: false,
      modalVisible: false,
      selectedKeys: [],
      total: 0,
      actorList: [],
      tableDataSource: [],
      showFormItem: false,
      actorQueryForm: {
        searchText: '',
        deptIds: 1,
      },
      queryForm: {
        processName: undefined,
        creator: '',
        workFlowType: 'working',
        serialTitle: '',
        orderNo: '',
        startDate: undefined,
        endDate: undefined,
        actor: '',
        actorCode: '',
        actorId: undefined,
        pageSize: 10,
        current: 1,
      },
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
      deptTreeNode: [],
      processTreeData: [],
      replaceFields: {
        children: 'deptGroupVOList',
        title: 'orgName',
        value: 'processName',
        key: 'id'
      },
      processReplaceFields: {
        children: 'children',
        title: 'name',
        value: 'id',
        key: 'id'
      },
      statusOptions: [
        { id: 0, value: 'working', label: '我的待办' },
        { id: 1, value: 'creator', label: '我发起的流程' },
        { id: 2, value: 'participation', label: '我参与的流程' },
        { id: 3, value: 'read', label: '我的阅读' },
        { id: 4, value: 'all', label: '全部' },
      ],
      endOpen: false,
    }
  },
  created() {
    this.init()

  },
  methods: {
    init() {
      this.getDataGridList(this.queryForm)
      this.getCommonGroup()
      this.getProcessTree()
    },
    //获取流程名称
    getProcessTree() {
      getProcessTree_().then(res => {
        console.log(res);
        this.processTreeData = res.data
      }, err => {
        console.log(err);
      })
    },
    //选择节点
    onCheck(checkedKeys) {
      this.actorQueryForm.deptIds = checkedKeys.join(',')
      this.getCommonUserJson()
    },
    //获取处理人信息
    getCommonUserJson() {
      this.loading = true
      getCommonUserJson_(this.actorQueryForm).then(res => {
        console.log(res);
        this.actorList = []
        this.actorList = res.data
      }, err => {
        console.log(err);
      }).finally(() => {
        this.loading = false
      })
    },
    //树节点选择
    // treeChange(value, label, extra) {
    //   console.log('树节点选择', value, label, extra);
    // },
    //取消选择处理人
    actorCancel() {
      this.modalVisible = false
    },
    //处理人选择
    actorSelected(item) {
      this.queryForm.actor = item.name
      this.modalVisible = false
    },
    //搜索表单查询
    getDataGridList(params) {
      this.queryLoading = true
      getDataGridList_(params).then(res => {
        if (res.data.records instanceof Array) {
          this.tableDataSource = []
          this.tableDataSource = res.data.records
          this.total = Number(res.data.total)
          this.$message.success('查询成功！')
        } else {
          this.$message.info('没有数据或查询失败！')
        }

      }, err => {
        console.log(err);
      }).finally(() => {
        this.queryLoading = false
      })
    },
    //节点搜索
    filterTreeNode(inputValue, treeNode) {
      if (!inputValue) return false;
      return treeNode.data.props.name.indexOf(inputValue) > -1;
    },
    //状态搜索选择框
    handleSelectChange(value) {
      if (value == 'working' || value == 'read') {
        this.showFormItem = false
      } else {
        this.showFormItem = true
      }
    },
    //获取部门组织机构
    getCommonGroup(params) {
      getCommonGroup_(params).then(res => {
        this.deptTreeNode = res.data
      }, err => {
        console.log(err);
      })
    },
    //约束开始时间
    disabledStartDate(startValue) {
      const endValue = this.queryForm.endDate;
      if (!startValue || !endValue) {
        return false;
      }
      return startValue.valueOf() > endValue.valueOf();
    },
    //约束结束时间
    disabledEndDate(endValue) {
      const startValue = this.queryForm.startDate;
      if (!endValue || !startValue) {
        return false;
      }
      return startValue.valueOf() >= endValue.valueOf();
    },
    //优化交互
    handleStartOpenChange(open) {
      if (!open) {
        this.endOpen = true;
      }
    },
    handleEndOpenChange(open) {
      this.endOpen = open;
    },
    //分页
    showSizeChange(current, pageSize) {
      this.current = current
      this.queryForm.pageSize = pageSize
      this.getDataGridList(this.queryForm)
    },
    //重置搜索表单
    resetQueryFrom() {
      this.$refs.queryFromModel.resetFields()
      //手动重置选择框值
      this.queryForm.workFlowType = 'working'
      //手动更改
      this.showFormItem = false
      this.getDataGridList(this.queryForm)
      this.$message.success('成功重置表单')
    },
  }
}
</script>

<style>
.listTitle:hover {
  color: #108ee9;
}

.listTitle {
  text-align: center;
  font-weight: 700;
  cursor: pointer;
  font-size: 16px;
}

.modalCard {
  height: 300px;
  width: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
}

.left {
  flex: 4;
  height: 100%;
  overflow-y: scroll;
}

.right {
  position: relative;
  height: 100%;
  flex: 3;
  overflow-y: scroll;
}

.mySpin {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.ant-calendar-picker {
  width: 100%;
}

.queryCard {
  z-index: 999;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: #eee;
  margin-bottom: 20px;
}

.formBtn {
  display: flex;
  justify-content: end;
}

.secondRow {
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
}

/* .secondRow .ant-form-item:nth-child(1) {
  flex: 1;
  width: 100%;
} */
/* 
.secondRow .ant-form-item:nth-child(2) {
  flex: 2;
} */

.firstRow {
  display: flex;
  flex-wrap: nowrap;
}

.ant-form-item {
  width: 100%;
}
</style>