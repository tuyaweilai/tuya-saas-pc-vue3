<template>
  <el-dialog
    v-model="dialogVisible"
    title="预约详情"
    width="1000px"
    :close-on-click-modal="false"
  >
    <div v-loading="loading" class="appointment-detail">
      <el-descriptions :column="2" border>
        <!-- 基本信息 -->
        <el-descriptions-item label="预约单号" :span="2">
          <el-tag type="primary">{{ detail.appointmentNo }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="预约状态">
          <StatusTag :status="detail.appointmentStatus" />
        </el-descriptions-item>
        <el-descriptions-item label="紧急程度">
          <el-tag v-if="detail.isUrgent" type="danger">紧急</el-tag>
          <el-tag v-else type="info">普通</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="优先级">
          {{ detail.priorityLevel }}
        </el-descriptions-item>
        <el-descriptions-item label="业务模式">
          {{ getBusinessModeText(detail.businessMode) }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 产废企业信息 -->
      <el-divider content-position="left">产废企业信息</el-divider>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="企业名称">
          {{ detail.producerEnterpriseName }}
        </el-descriptions-item>
        <el-descriptions-item label="联系人">
          {{ detail.producerContactName }}
        </el-descriptions-item>
        <el-descriptions-item label="联系电话">
          {{ detail.producerContactPhone }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 回收企业信息 -->
      <el-divider content-position="left">回收企业信息</el-divider>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="企业名称">
          <span v-if="detail.recyclerEnterpriseName">{{ detail.recyclerEnterpriseName }}</span>
          <el-tag v-else type="info">未分配</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="分配方式" v-if="detail.assignmentType !== undefined">
          {{ getAssignmentTypeText(detail.assignmentType) }}
        </el-descriptions-item>
        <el-descriptions-item label="分配时间" v-if="detail.assignmentTime">
          {{ safeFormatDate(detail.assignmentTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="分配操作人" v-if="detail.assignmentOperator">
          {{ detail.assignmentOperator }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 废物信息 -->
      <el-divider content-position="left">废物信息</el-divider>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="废物代码">
          {{ detail.wasteCode }}
        </el-descriptions-item>
        <el-descriptions-item label="废物名称">
          {{ detail.wasteName }}
        </el-descriptions-item>
        <el-descriptions-item label="废物类别">
          {{ detail.wasteCategory }}
        </el-descriptions-item>
        <el-descriptions-item label="预估数量">
          {{ detail.estimatedQuantity }}{{ detail.quantityUnit }}
        </el-descriptions-item>
        <el-descriptions-item label="废物描述" :span="2" v-if="detail.wasteDescription">
          {{ detail.wasteDescription }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 地址信息 -->
      <el-divider content-position="left">地址信息</el-divider>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="取货地址">
          {{ detail.pickupAddress }}
        </el-descriptions-item>
        <el-descriptions-item label="送货地址" v-if="detail.deliveryAddress">
          {{ detail.deliveryAddress }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 时间信息 -->
      <el-divider content-position="left">时间信息</el-divider>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="期望取货时间">
          {{ safeFormatDate(detail.expectedPickupTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="期望送达时间" v-if="detail.expectedDeliveryTime">
          {{ safeFormatDate(detail.expectedDeliveryTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ safeFormatDate(detail.createTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="更新时间" v-if="detail.updateTime">
          {{ safeFormatDate(detail.updateTime) }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 状态变更信息 -->
      <el-divider content-position="left">状态变更信息</el-divider>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="确认时间" v-if="detail.confirmTime">
          {{ safeFormatDate(detail.confirmTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="拒绝时间" v-if="detail.rejectTime">
          {{ safeFormatDate(detail.rejectTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="拒绝原因" :span="2" v-if="detail.rejectReason">
          {{ detail.rejectReason }}
        </el-descriptions-item>
        <el-descriptions-item label="取消时间" v-if="detail.cancelTime">
          {{ safeFormatDate(detail.cancelTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="取消原因" :span="2" v-if="detail.cancelReason">
          {{ detail.cancelReason }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 关联信息 -->
      <el-divider content-position="left" v-if="detail.orderId || detail.contractId">关联信息</el-divider>
      <el-descriptions :column="2" border v-if="detail.orderId || detail.contractId">
        <el-descriptions-item label="关联订单" v-if="detail.orderId">
          <el-link type="primary" @click="viewOrder(detail.orderId)">
            订单编号：{{ detail.orderId }}
          </el-link>
        </el-descriptions-item>
        <el-descriptions-item label="关联合同" v-if="detail.contractId">
          <el-link type="primary" @click="viewContract(detail.contractId)">
            合同编号：{{ detail.contractId }}
          </el-link>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 备注信息 -->
      <el-divider content-position="left" v-if="detail.remark">备注信息</el-divider>
      <el-descriptions :column="1" border v-if="detail.remark">
        <el-descriptions-item label="备注">
          {{ detail.remark }}
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <template #footer>
      <el-button @click="dialogVisible = false">关闭</el-button>
      <el-button 
        type="primary" 
        @click="handleEdit"
        v-if="canEdit(detail.appointmentStatus)"
      >
        编辑
      </el-button>
      <el-button 
        type="success" 
        @click="handleConfirm"
        v-if="canConfirm(detail.appointmentStatus)"
      >
        确认
      </el-button>
      <el-button 
        type="warning" 
        @click="handleReject"
        v-if="canReject(detail.appointmentStatus)"
      >
        拒绝
      </el-button>
      <el-button 
        type="info" 
        @click="handleAssign"
        v-if="canAssign(detail.appointmentStatus)"
      >
        分配
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
/**
 * 预约详情组件
 * 
 * 功能：
 * - 展示预约完整信息
 * - 支持状态操作
 * - 关联信息跳转
 * 
 * @author AI Assistant
 * @date 2024-01-01
 * @version 1.0.0
 */

import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatDate } from '@/utils/formatTime'
import { getAppointment, confirmAppointment, rejectAppointment } from '@/api/waste/appointment'
import { 
  AppointmentStatus, 
  AssignmentType, 
  BusinessMode,
  type AppointmentVO 
} from '@/types/waste/appointment'
import StatusTag from '@/components/waste/appointment/StatusTag.vue'

interface Emits {
  /** 编辑事件 */
  (e: 'edit', id: number): void
  /** 分配事件 */
  (e: 'assign', id: number): void
  /** 操作成功事件 */
  (e: 'success'): void
}

const emit = defineEmits<Emits>()

// 响应式数据
const dialogVisible = ref(false)
const loading = ref(false)

const detail = reactive<AppointmentVO>({
  appointmentNo: '',
  producerEnterpriseId: 0,
  producerEnterpriseName: '',
  producerContactName: '',
  producerContactPhone: '',
  assignmentType: AssignmentType.AUTO_ASSIGNMENT,
  wasteCode: '',
  wasteName: '',
  wasteCategory: '',
  estimatedQuantity: 0,
  quantityUnit: '',
  pickupAddress: '',
  expectedPickupTime: '',
  appointmentStatus: AppointmentStatus.PENDING,
  businessMode: BusinessMode.INDEPENDENT_OPERATION,
  isUrgent: false,
  priorityLevel: 1
})

// 方法定义
const open = async (id: number) => {
  dialogVisible.value = true
  await loadDetail(id)
}

const loadDetail = async (id: number) => {
  loading.value = true
  try {
    const data = await getAppointment(id)
    Object.assign(detail, data)
  } catch (error) {
    ElMessage.error('加载详情失败')
  } finally {
    loading.value = false
  }
}

const getBusinessModeText = (mode: BusinessMode) => {
  const modeMap = {
    [BusinessMode.INDEPENDENT_OPERATION]: '独立运营',
    [BusinessMode.PLATFORM_BIDDING]: '平台竞价',
    [BusinessMode.HYBRID_MODE]: '混合模式'
  }
  return modeMap[mode] || '未知'
}

const getAssignmentTypeText = (type: AssignmentType) => {
  const typeMap = {
    [AssignmentType.AUTO_ASSIGNMENT]: '自动分配',
    [AssignmentType.USER_SELECTION]: '用户选择',
    [AssignmentType.SYSTEM_RULE]: '系统规则分配',
    [AssignmentType.MANUAL_ASSIGNMENT]: '管理员手动指定'
  }
  return typeMap[type] || '未知'
}

const handleEdit = () => {
  emit('edit', detail.id!)
  dialogVisible.value = false
}

const handleConfirm = async () => {
  const { value: confirmReason } = await ElMessageBox.prompt(
    '请输入确认原因',
    '确认预约',
    { 
      inputType: 'textarea',
      inputPlaceholder: '请输入确认原因（可选）'
    }
  ).catch(() => ({ value: '' }))
  
  try {
    await confirmAppointment(detail.id!, confirmReason)
    ElMessage.success('确认成功')
    emit('success')
    dialogVisible.value = false
  } catch (error) {
    ElMessage.error('确认失败')
  }
}

const handleReject = async () => {
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
    await rejectAppointment(detail.id!, rejectReason)
    ElMessage.success('拒绝成功')
    emit('success')
    dialogVisible.value = false
  } catch (error) {
    ElMessage.error('拒绝失败')
  }
}

const handleAssign = () => {
  emit('assign', detail.id!)
  dialogVisible.value = false
}

const viewOrder = (orderId: number) => {
  // 跳转到订单详情页面
  console.log('查看订单:', orderId)
}

const viewContract = (contractId: number) => {
  // 跳转到合同详情页面
  console.log('查看合同:', contractId)
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

// 辅助函数：安全的日期格式化
const safeFormatDate = (dateStr?: string) => {
  if (!dateStr) return ''
  return formatDate(new Date(dateStr))
}

// 暴露给父组件的方法
defineExpose({
  open
})
</script>

<style lang="scss" scoped>
.appointment-detail {
  .el-divider {
    margin: 24px 0 16px 0;
    
    &:first-child {
      margin-top: 0;
    }
  }
  
  .el-descriptions {
    margin-bottom: 20px;
    
    :deep(.el-descriptions__label) {
      font-weight: 600;
      color: #606266;
      width: 120px;
    }
    
    :deep(.el-descriptions__content) {
      color: #303133;
    }
  }
  
  .el-link {
    font-weight: 500;
  }
}
</style> 