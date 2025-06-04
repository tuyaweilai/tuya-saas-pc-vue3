<template>
  <el-card>
    <template #header>
      <div class="card-header">
        <span>合同状态流转</span>
      </div>
    </template>

    <div class="status-flow">
      <el-steps :active="currentStep" finish-status="success" align-center>
        <el-step
          v-for="(step, index) in statusSteps"
          :key="index"
          :title="step.title"
          :description="step.description"
          :status="getStepStatus(index)"
          :icon="step.icon"
        >
          <template #description>
            <div class="step-description">
              <div>{{ step.description }}</div>
              <div v-if="step.time" class="step-time">{{ step.time }}</div>
            </div>
          </template>
        </el-step>
      </el-steps>

      <!-- 状态详细信息 -->
      <div class="status-details mt-20px">
        <el-row :gutter="20">
          <el-col :span="8" v-for="detail in statusDetails" :key="detail.status">
            <el-card 
              :class="['status-card', { 'active': detail.status === currentStatus }]"
              shadow="hover"
            >
              <div class="status-info">
                <div class="status-icon">
                  <el-icon :size="24" :color="detail.color">
                    <component :is="detail.icon" />
                  </el-icon>
                </div>
                <div class="status-content">
                  <h4>{{ detail.title }}</h4>
                  <p>{{ detail.description }}</p>
                  <div v-if="detail.actions.length" class="status-actions">
                    <el-button
                      v-for="action in detail.actions"
                      :key="action.key"
                      :type="action.type"
                      size="small"
                      @click="handleAction(action.key)"
                    >
                      {{ action.label }}
                    </el-button>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 流转历史 -->
      <div class="flow-history mt-20px">
        <h3>流转历史</h3>
        <el-timeline>
          <el-timeline-item
            v-for="history in flowHistory"
            :key="history.id"
            :timestamp="history.time"
            :type="history.type"
            placement="top"
          >
            <el-card>
              <div class="history-item">
                <div class="history-header">
                  <span class="history-status">{{ history.statusName }}</span>
                  <span class="history-operator">{{ history.operator }}</span>
                </div>
                <div class="history-content">{{ history.content }}</div>
                <div v-if="history.remark" class="history-remark">
                  备注：{{ history.remark }}
                </div>
              </div>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  Document, 
  Edit, 
  Check, 
  EditPen, 
  Finished, 
  Clock, 
  Warning,
  Delete,
  Folder
} from '@element-plus/icons-vue'
import { CONTRACT_STATUS } from '@/store/modules/contract'

interface Props {
  currentStatus: number
  contractId?: number
}

const props = withDefaults(defineProps<Props>(), {
  currentStatus: 0
})

const emit = defineEmits<{
  action: [actionKey: string]
}>()

// 状态步骤配置
const statusSteps = ref([
  {
    title: '草稿',
    description: '合同创建完成',
    icon: Document,
    time: ''
  },
  {
    title: '待审核',
    description: '等待审核人员审核',
    icon: Edit,
    time: ''
  },
  {
    title: '审核通过',
    description: '审核通过，可以发起签署',
    icon: Check,
    time: ''
  },
  {
    title: '待签署',
    description: '等待各方签署',
    icon: EditPen,
    time: ''
  },
  {
    title: '已生效',
    description: '合同正式生效',
    icon: Finished,
    time: ''
  },
  {
    title: '已履行',
    description: '合同履行完成',
    icon: Check,
    time: ''
  },
  {
    title: '已归档',
    description: '合同归档保存',
    icon: Folder,
    time: ''
  }
])

// 状态详细信息
const statusDetails = computed(() => {
  const details = [
    {
      status: 0,
      title: '草稿状态',
      description: '合同处于草稿状态，可以编辑修改',
      icon: Document,
      color: '#909399',
      actions: [
        { key: 'edit', label: '编辑', type: 'primary' },
        { key: 'submit', label: '提交审核', type: 'warning' }
      ]
    },
    {
      status: 1,
      title: '待审核',
      description: '合同已提交，等待审核人员审核',
      icon: Edit,
      color: '#e6a23c',
      actions: [
        { key: 'approve', label: '审核', type: 'success' },
        { key: 'reject', label: '拒绝', type: 'danger' }
      ]
    },
    {
      status: 2,
      title: '审核通过',
      description: '合同审核通过，可以发起签署流程',
      icon: Check,
      color: '#67c23a',
      actions: [
        { key: 'initiate-sign', label: '发起签署', type: 'warning' }
      ]
    },
    {
      status: 3,
      title: '待签署',
      description: '合同等待各参与方签署',
      icon: EditPen,
      color: '#409eff',
      actions: [
        { key: 'sign', label: '签署', type: 'warning' },
        { key: 'view-parties', label: '查看参与方', type: 'info' }
      ]
    },
    {
      status: 5,
      title: '已生效',
      description: '合同已正式生效，开始履行',
      icon: Finished,
      color: '#67c23a',
      actions: [
        { key: 'fulfill', label: '标记履行', type: 'success' },
        { key: 'terminate', label: '解除合同', type: 'danger' }
      ]
    },
    {
      status: 6,
      title: '已履行',
      description: '合同履行完成，可以归档',
      icon: Check,
      color: '#67c23a',
      actions: [
        { key: 'archive', label: '归档', type: 'info' }
      ]
    }
  ]

  // 只显示当前状态及相邻状态
  const currentIndex = details.findIndex(d => d.status === props.currentStatus)
  if (currentIndex === -1) return details.slice(0, 3)
  
  const start = Math.max(0, currentIndex - 1)
  const end = Math.min(details.length, currentIndex + 2)
  return details.slice(start, end)
})

// 当前步骤
const currentStep = computed(() => {
  const statusToStep = {
    0: 0, // 草稿
    1: 1, // 待审核
    2: 2, // 审核通过
    3: 3, // 待签署
    4: 3, // 签署中
    5: 4, // 已生效
    6: 5, // 已履行
    7: 4, // 即将到期
    8: 4, // 已到期
    9: 4, // 已解除
    10: 0, // 已作废
    11: 6  // 已归档
  }
  return statusToStep[props.currentStatus] || 0
})

// 获取步骤状态
const getStepStatus = (index: number) => {
  if (index < currentStep.value) return 'finish'
  if (index === currentStep.value) return 'process'
  return 'wait'
}

// 流转历史（模拟数据）
const flowHistory = ref([
  {
    id: 1,
    statusName: '草稿',
    operator: '张三',
    content: '创建了合同',
    time: '2024-01-01 10:00:00',
    type: 'primary',
    remark: ''
  }
])

// 处理操作
const handleAction = (actionKey: string) => {
  emit('action', actionKey)
}

// 获取流转历史
const getFlowHistory = async () => {
  if (!props.contractId) return
  
  // 这里应该调用API获取真实的流转历史
  // const history = await contractApi.getFlowHistory(props.contractId)
  // flowHistory.value = history
}

onMounted(() => {
  getFlowHistory()
})
</script>

<style scoped>
.card-header {
  font-size: 16px;
  font-weight: bold;
}

.status-flow {
  padding: 20px 0;
}

.step-description {
  text-align: center;
}

.step-time {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.status-details {
  margin-top: 30px;
}

.status-card {
  transition: all 0.3s;
  cursor: pointer;
}

.status-card.active {
  border-color: #409eff;
  box-shadow: 0 2px 12px 0 rgba(64, 158, 255, 0.3);
}

.status-info {
  display: flex;
  align-items: flex-start;
  gap: 15px;
}

.status-icon {
  flex-shrink: 0;
}

.status-content h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #303133;
}

.status-content p {
  margin: 0 0 15px 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}

.status-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.flow-history h3 {
  margin: 0 0 20px 0;
  font-size: 16px;
  color: #303133;
}

.history-item {
  padding: 10px 0;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.history-status {
  font-weight: bold;
  color: #409eff;
}

.history-operator {
  font-size: 12px;
  color: #909399;
}

.history-content {
  color: #303133;
  margin-bottom: 5px;
}

.history-remark {
  font-size: 12px;
  color: #909399;
  font-style: italic;
}

.mt-20px {
  margin-top: 20px;
}

:deep(.el-steps) {
  margin-bottom: 20px;
}

:deep(.el-step__title) {
  font-size: 14px;
  line-height: 1.5;
}

:deep(.el-step__description) {
  font-size: 12px;
  line-height: 1.4;
}
</style> 