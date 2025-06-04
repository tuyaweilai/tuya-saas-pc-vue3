<template>
  <ContentWrap>
    <!-- 搜索表单 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="100px"
    >
      <el-form-item label="预约单号" prop="appointmentNo">
        <el-input
          v-model="queryParams.appointmentNo"
          placeholder="请输入预约单号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="产废企业" prop="producerEnterpriseName">
        <el-input
          v-model="queryParams.producerEnterpriseName"
          placeholder="请输入产废企业名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="回收企业" prop="recyclerEnterpriseName">
        <el-input
          v-model="queryParams.recyclerEnterpriseName"
          placeholder="请输入回收企业名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="预约状态" prop="appointmentStatus">
        <el-select
          v-model="queryParams.appointmentStatus"
          placeholder="请选择状态"
          clearable
          class="!w-240px"
        >
          <el-option label="全部" value="" />
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.WASTE_APPOINTMENT_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="是否紧急" prop="isUrgent">
        <el-select
          v-model="queryParams.isUrgent"
          placeholder="请选择"
          clearable
          class="!w-240px"
        >
          <el-option label="全部" value="" />
          <el-option label="是" :value="true" />
          <el-option label="否" :value="false" />
        </el-select>
      </el-form-item>
      <el-form-item label="废物代码" prop="wasteCode">
        <el-input
          v-model="queryParams.wasteCode"
          placeholder="请输入废物代码"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="datetimerange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">
          <Icon icon="ep:search" class="mr-5px" />
          搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon icon="ep:refresh" class="mr-5px" />
          重置
        </el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
        >
          <Icon icon="ep:plus" class="mr-5px" />
          新增预约
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
        >
          <Icon icon="ep:download" class="mr-5px" />
          导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table 
      v-loading="loading" 
      :data="list" 
      :stripe="true"
      :show-overflow-tooltip="true"
      border
      style="width: 100%"
      max-height="650"
    >
      <el-table-column label="预约单号" prop="appointmentNo" width="160" fixed="left" />
      <el-table-column label="产废企业" prop="producerEnterpriseName" min-width="120" show-overflow-tooltip />
      <el-table-column label="回收企业" prop="recyclerEnterpriseName" min-width="120" show-overflow-tooltip>
        <template #default="scope">
          <span v-if="scope.row.recyclerEnterpriseName">{{ scope.row.recyclerEnterpriseName }}</span>
          <el-tag v-else type="info" size="small">未分配</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="废物信息" min-width="150" show-overflow-tooltip>
        <template #default="scope">
          <div>
            <div class="font-medium">{{ scope.row.wasteName }}</div>
            <div class="text-xs text-gray-500">
              {{ scope.row.wasteCode }} | {{ scope.row.estimatedQuantity }}{{ scope.row.quantityUnit }}
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="联系人" width="110">
        <template #default="scope">
          <div>
            <div>{{ scope.row.producerContactName }}</div>
            <div class="text-xs text-gray-500">{{ scope.row.producerContactPhone }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="期望取货时间" width="150">
        <template #default="scope">
          {{ safeFormatDate(scope.row.expectedPickupTime) }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="scope">
          <StatusTag :status="scope.row.appointmentStatus" />
        </template>
      </el-table-column>
      <el-table-column label="紧急" width="60" align="center">
        <template #default="scope">
          <el-tag v-if="scope.row.isUrgent" type="danger" size="small">紧急</el-tag>
          <el-tag v-else type="info" size="small">普通</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="150">
        <template #default="scope">
          {{ safeFormatDate(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" width="120">
        <template #default="scope">
          <div class="flex items-center justify-center">
            <el-button
              type="primary"
              link
              @click="openDetail(scope.row.id)"
            >
              查看
            </el-button>
            
            <el-dropdown
              v-if="hasMoreActions(scope.row)"
              @command="(command) => handleCommand(command, scope.row)"
            >
              <el-button type="primary" link>
                更多
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    v-if="canEdit(scope.row.appointmentStatus)"
                    command="handleEdit"
                  >
                    <Icon icon="ep:edit" />
                    编辑
                  </el-dropdown-item>
                  
                  <el-dropdown-item
                    v-if="canConfirm(scope.row.appointmentStatus)"
                    command="handleConfirm"
                  >
                    <Icon icon="ep:circle-check" />
                    确认
                  </el-dropdown-item>
                  
                  <el-dropdown-item
                    v-if="canReject(scope.row.appointmentStatus)"
                    command="handleReject"
                  >
                    <Icon icon="ep:circle-close" />
                    拒绝
                  </el-dropdown-item>
                  
                  <el-dropdown-item
                    v-if="canAssign(scope.row.appointmentStatus)"
                    command="handleAssign"
                  >
                    <Icon icon="ep:user" />
                    分配
                  </el-dropdown-item>
                  
                  <el-dropdown-item
                    v-if="canDelete(scope.row.appointmentStatus)"
                    command="handleDelete"
                  >
                    <Icon icon="ep:delete" />
                    删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <Pagination
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      :total="total"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 表单弹窗 -->
  <AppointmentForm ref="formRef" @success="getList" />
  
  <!-- 详情弹窗 -->
  <AppointmentDetail 
    ref="detailRef" 
    @edit="handleEditFromDetail"
    @assign="handleAssignFromDetail"
    @success="getList"
  />
  
  <!-- 分配弹窗 -->
  <AssignmentForm ref="assignmentRef" @success="getList" />
</template>

<script setup lang="ts">
/**
 * 危废转移预约管理页面
 * 
 * 功能：
 * - 预约列表查询和展示
 * - 预约状态管理
 * - 回收企业分配
 * - 数据导出
 * 
 * @author AI Assistant
 * @date 2024-01-01
 * @version 1.0.0
 */

import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { formatDate } from '@/utils/formatTime'
import { 
  getAppointmentPage, 
  deleteAppointment, 
  confirmAppointment, 
  rejectAppointment,
  exportAppointment
} from '@/api/waste/appointment'
import { AppointmentStatus, type AppointmentPageReqVO } from '@/types/waste/appointment'
import StatusTag from '@/components/waste/appointment/StatusTag.vue'
import AppointmentForm from './form.vue'
import AppointmentDetail from './detail.vue'
import AssignmentForm from '@/components/waste/appointment/AssignmentForm.vue'

defineOptions({ name: 'WasteAppointment' })

// 响应式数据
const loading = ref(true)
const exportLoading = ref(false)
const list = ref([])
const total = ref(0)
const queryFormRef = ref()
const formRef = ref()
const detailRef = ref()
const assignmentRef = ref()

const queryParams = reactive<AppointmentPageReqVO>({
  pageNo: 1,
  pageSize: 10,
  appointmentNo: '',
  producerEnterpriseName: '',
  recyclerEnterpriseName: '',
  appointmentStatus: undefined,
  isUrgent: undefined,
  wasteCode: '',
  createTime: undefined
})

// 方法定义
const getList = async () => {
  loading.value = true
  try {
    const data = await getAppointmentPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

const resetQuery = () => {
  queryFormRef.value?.resetFields()
  handleQuery()
}

const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

const openDetail = (id: number) => {
  detailRef.value.open(id)
}

const handleConfirm = async (row: any) => {
  const { value: confirmReason } = await ElMessageBox.prompt(
    '请输入确认原因',
    '确认预约',
    { 
      inputType: 'textarea',
      inputPlaceholder: '请输入确认原因（可选）'
    }
  ).catch(() => ({ value: '' }))
  
  try {
    await confirmAppointment(row.id, confirmReason)
    ElMessage.success('确认成功')
    getList()
  } catch (error) {
    ElMessage.error('确认失败')
  }
}

const handleReject = async (row: any) => {
  const { value: rejectReason } = await ElMessageBox.prompt(
    '请输入拒绝原因',
    '拒绝预约',
    { 
      inputType: 'textarea',
      inputValidator: (value) => !!value || '拒绝原因不能为空',
      inputErrorMessage: '拒绝原因不能为空'
    }
  ).catch(() => ({ value: '' }))
  
  if (!rejectReason) return
  
  try {
    await rejectAppointment(row.id, rejectReason)
    ElMessage.success('拒绝成功')
    getList()
  } catch (error) {
    ElMessage.error('拒绝失败')
  }
}

const handleAssign = (row: any) => {
  assignmentRef.value.open(row.id)
}

const handleDelete = async (id: number) => {
  await ElMessageBox.confirm('确定要删除该预约吗？', '提示', { 
    type: 'warning' 
  }).catch(() => {})
  
  try {
    await deleteAppointment(id)
    ElMessage.success('删除成功')
    getList()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

const handleExport = async () => {
  await ElMessageBox.confirm('确定要导出预约数据吗？', '提示', {
    type: 'warning'
  }).catch(() => {})
  
  exportLoading.value = true
  try {
    await exportAppointment(queryParams)
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  } finally {
    exportLoading.value = false
  }
}

// 状态判断方法
const canEdit = (status: AppointmentStatus) => {
  return status === AppointmentStatus.PENDING
}

const canConfirm = (status: AppointmentStatus) => {
  return status === AppointmentStatus.WAITING_RECYCLER_CONFIRM
}

const canReject = (status: AppointmentStatus) => {
  return status === AppointmentStatus.WAITING_RECYCLER_CONFIRM
}

const canAssign = (status: AppointmentStatus) => {
  return status === AppointmentStatus.PENDING
}

const canDelete = (status: AppointmentStatus) => {
  return status === AppointmentStatus.PENDING || status === AppointmentStatus.CANCELLED
}

const handleEditFromDetail = (id: number) => {
  formRef.value.open('update', id)
}

const handleAssignFromDetail = (id: number) => {
  assignmentRef.value.open(id)
}

// 辅助函数：安全的日期格式化
const safeFormatDate = (dateStr?: string) => {
  if (!dateStr) return ''
  return formatDate(new Date(dateStr))
}

const hasMoreActions = (row: any) => {
  return canEdit(row.appointmentStatus) || canConfirm(row.appointmentStatus) || canReject(row.appointmentStatus) || canAssign(row.appointmentStatus) || canDelete(row.appointmentStatus)
}

const handleCommand = (command: string, row: any) => {
  if (command === 'handleEdit') {
    openForm('update', row.id)
  } else if (command === 'handleConfirm') {
    handleConfirm(row)
  } else if (command === 'handleReject') {
    handleReject(row)
  } else if (command === 'handleAssign') {
    handleAssign(row)
  } else if (command === 'handleDelete') {
    handleDelete(row.id)
  }
}

onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
.waste-appointment {
  &__search-form {
    .el-form-item {
      margin-bottom: 16px;
    }
  }
  
  &__table {
    .status-tag {
      margin-right: 8px;
    }
    
    .urgent-tag {
      margin-left: 8px;
    }
  }
}

// 操作列样式
.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}
</style> 