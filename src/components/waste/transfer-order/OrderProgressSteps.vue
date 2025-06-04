<template>
  <div class="order-progress-container">
    <!-- 进度步骤条 -->
    <div class="progress-steps">
      <div 
        v-for="(step, index) in progressSteps" 
        :key="step.id"
        class="progress-step"
        :class="{ 
          'active': step.status === 'active',
          'completed': step.status === 'completed',
          'pending': step.status === 'pending',
          'cancelled': step.status === 'cancelled'
        }"
      >
        <!-- 步骤连接线 -->
        <div 
          v-if="index < progressSteps.length - 1" 
          class="step-connector"
          :class="{ 'completed': step.status === 'completed' }"
        ></div>
        
        <!-- 步骤节点 -->
        <div class="step-node">
          <div class="step-icon">
            <Icon :icon="step.icon" />
          </div>
          <div class="step-number" v-if="step.status === 'pending'">{{ index + 1 }}</div>
        </div>
        
        <!-- 步骤内容 -->
        <div class="step-content">
          <div class="step-title">{{ step.title }}</div>
          <div class="step-description" v-if="step.description">{{ step.description }}</div>
          <div class="step-time" v-if="step.timestamp">
            <Icon icon="ep:clock" class="mr-4px" />
            {{ step.timestamp }}
          </div>
          <div class="step-operator" v-if="step.operator">
            <Icon icon="ep:user" class="mr-4px" />
            {{ step.operator }}
          </div>
        </div>
      </div>
    </div>

    <!-- 详细时间线（可折叠） -->
    <div class="timeline-section" v-if="showDetailTimeline">
      <el-divider>
        <el-button 
          text 
          @click="toggleDetailTimeline"
          class="timeline-toggle"
        >
          <Icon :icon="detailTimelineExpanded ? 'ep:arrow-up' : 'ep:arrow-down'" class="mr-5px" />
          {{ detailTimelineExpanded ? '收起详细记录' : '查看详细记录' }}
        </el-button>
      </el-divider>
      
      <el-collapse-transition>
        <div v-show="detailTimelineExpanded" class="detail-timeline">
          <el-timeline>
            <el-timeline-item
              v-for="item in timelineData"
              :key="item.id"
              :icon="item.icon"
              :type="item.type as any"
              :color="item.color"
              :timestamp="item.timestamp"
              placement="top"
            >
              <el-card shadow="hover" class="timeline-card">
                <div class="timeline-item-content">
                  <h4 class="timeline-title">{{ item.title }}</h4>
                  <p v-if="item.description" class="timeline-description">{{ item.description }}</p>
                  <div v-if="item.operator" class="timeline-operator">
                    <Icon icon="ep:user" class="mr-5px" />
                    <span>操作人：{{ item.operator }}</span>
                  </div>
                </div>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>
      </el-collapse-transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { formatDate } from '@/utils/formatTime'
import type { TransferOrderRespVO } from '@/api/waste/transferOrder'

interface Props {
  order: TransferOrderRespVO
  showDetailTimeline?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showDetailTimeline: true
})

const detailTimelineExpanded = ref(false)

const toggleDetailTimeline = () => {
  detailTimelineExpanded.value = !detailTimelineExpanded.value
}

interface ProgressStep {
  id: string
  title: string
  description?: string
  timestamp?: string
  operator?: string
  icon: string
  status: 'pending' | 'active' | 'completed' | 'cancelled'
}

interface TimelineItem {
  id: string
  title: string
  description?: string
  operator?: string
  timestamp: string
  icon: string
  type: string
  color?: string
}

// 进度步骤配置
const progressSteps = computed<ProgressStep[]>(() => {
  const steps: ProgressStep[] = []
  const order = props.order

  // 1. 订单创建
  steps.push({
    id: 'created',
    title: '订单创建',
    description: `订单号：${order.orderNo}`,
    timestamp: formatDate(order.createTime),
    icon: 'ep:plus',
    status: 'completed'
  })

  // 2. 订单确认
  steps.push({
    id: 'confirmed',
    title: '订单确认',
    description: order.businessStatus >= 1 ? '订单信息已确认' : '等待确认订单信息',
    timestamp: order.businessStatus >= 1 && order.updateTime ? formatDate(order.updateTime) : undefined,
    icon: 'ep:check',
    status: order.businessStatus >= 1 ? 'completed' : 
            order.businessStatus === 0 ? 'active' : 'pending'
  })

  // 3. 收货确认
  steps.push({
    id: 'pickup',
    title: '收货确认',
    description: order.pickupConfirmedTime 
      ? `确认数量：${order.confirmedQuantity} ${order.quantityUnit}`
      : '等待现场确认收货',
    timestamp: order.pickupConfirmedTime ? formatDate(order.pickupConfirmedTime) : undefined,
    operator: order.pickupConfirmedBy,
    icon: 'ep:box',
    status: order.pickupConfirmedTime ? 'completed' :
            order.businessStatus === 1 ? 'active' : 'pending'
  })

  // 4. 数量分摊
  steps.push({
    id: 'allocation',
    title: '数量分摊',
    description: order.allocationCompletedTime 
      ? `分摊数量：${order.allocatedQuantity} ${order.quantityUnit}，比例：${((order.allocationRatio || 0) * 100).toFixed(2)}%`
      : '等待分摊数量和金额',
    timestamp: order.allocationCompletedTime ? formatDate(order.allocationCompletedTime) : undefined,
    icon: 'ep:scale-to-original',
    status: order.allocationCompletedTime ? 'completed' :
            order.pickupConfirmedTime ? 'active' : 'pending'
  })

  // 5. 付款处理
  steps.push({
    id: 'payment',
    title: '付款处理',
    description: order.paymentCompletedTime 
      ? `最终金额：¥${order.finalAmount?.toFixed(2)}`
      : '等待处理付款',
    timestamp: order.paymentCompletedTime ? formatDate(order.paymentCompletedTime) : undefined,
    icon: 'ep:money',
    status: order.paymentCompletedTime ? 'completed' :
            order.businessStatus === 2 ? 'active' : 'pending'
  })

  // 6. 订单结算
  steps.push({
    id: 'settlement',
    title: '订单结算',
    description: order.businessStatus >= 3 ? '订单已结算' : '等待结算订单',
    timestamp: order.businessStatus >= 3 && order.updateTime ? formatDate(order.updateTime) : undefined,
    icon: 'ep:finished',
    status: order.businessStatus >= 3 ? 'completed' :
            order.businessStatus === 2 && order.paymentStatus === 1 ? 'active' : 'pending'
  })

  // 7. 订单完成
  steps.push({
    id: 'completed',
    title: '订单完成',
    description: order.businessStatus === 4 ? '订单处理完成' : 
                order.businessStatus === 5 ? '订单已取消' : '等待完成订单',
    timestamp: order.businessStatus >= 4 && order.updateTime ? formatDate(order.updateTime) : undefined,
    icon: order.businessStatus === 5 ? 'ep:circle-close' : 'ep:circle-check',
    status: order.businessStatus === 4 ? 'completed' :
            order.businessStatus === 5 ? 'cancelled' :
            order.businessStatus === 3 ? 'active' : 'pending'
  })

  return steps
})

// 详细时间线数据
const timelineData = computed<TimelineItem[]>(() => {
  const items: TimelineItem[] = []
  const order = props.order

  // 订单创建
  items.push({
    id: 'created',
    title: '订单创建',
    description: `订单号：${order.orderNo}`,
    timestamp: formatDate(order.createTime),
    icon: 'Plus',
    type: 'primary'
  })

  // 订单确认
  if (order.businessStatus >= 1) {
    items.push({
      id: 'confirmed',
      title: '订单确认',
      description: '订单信息已确认',
      timestamp: formatDate(order.updateTime || order.createTime),
      icon: 'Check',
      type: 'success'
    })
  }

  // 收货确认
  if (order.pickupConfirmedTime) {
    items.push({
      id: 'pickup',
      title: '收货确认',
      description: `确认数量：${order.confirmedQuantity} ${order.quantityUnit}`,
      operator: order.pickupConfirmedBy,
      timestamp: formatDate(order.pickupConfirmedTime),
      icon: 'Box',
      type: 'primary'
    })
  }

  // 分摊完成
  if (order.allocationCompletedTime) {
    items.push({
      id: 'allocation',
      title: '数量分摊',
      description: `分摊数量：${order.allocatedQuantity} ${order.quantityUnit}，分摊比例：${((order.allocationRatio || 0) * 100).toFixed(2)}%`,
      timestamp: formatDate(order.allocationCompletedTime),
      icon: 'Scale',
      type: 'info'
    })
  }

  // 付款完成
  if (order.paymentCompletedTime) {
    items.push({
      id: 'payment',
      title: '付款完成',
      description: `最终金额：¥${order.finalAmount?.toFixed(2)}`,
      timestamp: formatDate(order.paymentCompletedTime),
      icon: 'Money',
      type: 'success'
    })
  }

  // 订单完成
  if (order.businessStatus === 4) {
    items.push({
      id: 'completed',
      title: '订单完成',
      description: '订单处理完成',
      timestamp: formatDate(order.updateTime || order.createTime),
      icon: 'CircleCheck',
      type: 'success',
      color: '#67C23A'
    })
  }

  // 订单取消
  if (order.businessStatus === 5) {
    items.push({
      id: 'cancelled',
      title: '订单取消',
      description: '订单已取消',
      timestamp: formatDate(order.updateTime || order.createTime),
      icon: 'CircleClose',
      type: 'danger',
      color: '#F56C6C'
    })
  }

  return items.reverse() // 倒序显示，最新的在上面
})
</script>

<style scoped>
.order-progress-container {
  padding: 20px;
}

/* 进度步骤条样式 */
.progress-steps {
  position: relative;
  padding: 20px 0;
}

.progress-step {
  position: relative;
  display: flex;
  align-items: flex-start;
  margin-bottom: 40px;
  transition: all 0.3s ease;
}

.progress-step:last-child {
  margin-bottom: 0;
}

/* 连接线 */
.step-connector {
  position: absolute;
  left: 24px;
  top: 48px;
  width: 2px;
  height: 40px;
  background: #e4e7ed;
  transition: all 0.3s ease;
}

.step-connector.completed {
  background: linear-gradient(180deg, #67c23a 0%, #85ce61 100%);
}

/* 步骤节点 */
.step-node {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  flex-shrink: 0;
  transition: all 0.3s ease;
  z-index: 2;
}

.progress-step.pending .step-node {
  background: #f5f7fa;
  border: 2px solid #e4e7ed;
  color: #c0c4cc;
}

.progress-step.active .step-node {
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  border: 2px solid #409eff;
  color: white;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
  animation: pulse 2s infinite;
}

.progress-step.completed .step-node {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
  border: 2px solid #67c23a;
  color: white;
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.3);
}

.progress-step.cancelled .step-node {
  background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
  border: 2px solid #f56c6c;
  color: white;
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.3);
}

.step-icon {
  font-size: 20px;
  transition: all 0.3s ease;
}

.step-number {
  font-size: 16px;
  font-weight: 600;
}

/* 步骤内容 */
.step-content {
  flex: 1;
  padding-top: 4px;
}

.step-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
  transition: all 0.3s ease;
}

.progress-step.active .step-title {
  color: #409eff;
}

.progress-step.completed .step-title {
  color: #67c23a;
}

.progress-step.cancelled .step-title {
  color: #f56c6c;
}

.step-description {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
  line-height: 1.5;
}

.step-time,
.step-operator {
  font-size: 12px;
  color: #909399;
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.step-time:last-child,
.step-operator:last-child {
  margin-bottom: 0;
}

/* 时间线部分 */
.timeline-section {
  margin-top: 30px;
}

.timeline-toggle {
  color: #409eff;
  font-size: 14px;
}

.detail-timeline {
  padding: 20px 0;
}

.timeline-card {
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.timeline-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.timeline-item-content {
  padding: 8px;
}

.timeline-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.timeline-description {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}

.timeline-operator {
  font-size: 12px;
  color: #909399;
  display: flex;
  align-items: center;
  margin: 0;
}

/* 动画效果 */
@keyframes pulse {
  0% {
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
  }
  50% {
    box-shadow: 0 4px 20px rgba(64, 158, 255, 0.6);
  }
  100% {
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .progress-step {
    margin-bottom: 30px;
  }
  
  .step-node {
    width: 40px;
    height: 40px;
    margin-right: 16px;
  }
  
  .step-icon {
    font-size: 18px;
  }
  
  .step-number {
    font-size: 14px;
  }
  
  .step-connector {
    left: 20px;
    top: 40px;
    height: 30px;
  }
  
  .step-title {
    font-size: 15px;
  }
  
  .step-description {
    font-size: 13px;
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .step-title {
    color: #e5eaf3;
  }
  
  .step-description {
    color: #a3a6ad;
  }
  
  .step-time,
  .step-operator {
    color: #73767a;
  }
  
  .progress-step.pending .step-node {
    background: #2d2f33;
    border-color: #4c4d4f;
    color: #73767a;
  }
  
  .timeline-title {
    color: #e5eaf3;
  }
  
  .timeline-description {
    color: #a3a6ad;
  }
  
  .timeline-operator {
    color: #73767a;
  }
}
</style> 