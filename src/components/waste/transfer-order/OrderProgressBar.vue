<template>
  <div class="order-progress-bar">
    <div class="progress-container">
      <div 
        v-for="(step, index) in progressSteps" 
        :key="step.id"
        class="progress-item"
        :class="{ 
          'active': step.status === 'active',
          'completed': step.status === 'completed',
          'pending': step.status === 'pending',
          'cancelled': step.status === 'cancelled'
        }"
      >
        <!-- 进度节点 -->
        <div class="progress-node">
          <Icon :icon="step.icon" class="node-icon" />
          <div class="node-number" v-if="step.status === 'pending'">{{ index + 1 }}</div>
        </div>
        
        <!-- 进度标题 -->
        <div class="progress-label">{{ step.title }}</div>
        
        <!-- 连接线 -->
        <div 
          v-if="index < progressSteps.length - 1" 
          class="progress-line"
          :class="{ 'completed': step.status === 'completed' }"
        ></div>
      </div>
    </div>
    
    <!-- 进度百分比 -->
    <div class="progress-percentage">
      <div class="percentage-text">{{ progressPercentage }}% 完成</div>
      <el-progress 
        :percentage="progressPercentage" 
        :stroke-width="6"
        :show-text="false"
        :color="progressColor"
        class="percentage-bar"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TransferOrderRespVO } from '@/api/waste/transferOrder'

interface Props {
  order: TransferOrderRespVO
}

const props = defineProps<Props>()

interface ProgressStep {
  id: string
  title: string
  icon: string
  status: 'pending' | 'active' | 'completed' | 'cancelled'
}

// 进度步骤配置
const progressSteps = computed<ProgressStep[]>(() => {
  const order = props.order
  
  const steps: ProgressStep[] = [
    {
      id: 'created',
      title: '订单创建',
      icon: 'ep:plus',
      status: 'completed'
    },
    {
      id: 'confirmed',
      title: '订单确认',
      icon: 'ep:check',
      status: order.businessStatus >= 1 ? 'completed' : 
              order.businessStatus === 0 ? 'active' : 'pending'
    },
    {
      id: 'pickup',
      title: '收货确认',
      icon: 'ep:box',
      status: order.pickupConfirmedTime ? 'completed' :
              order.businessStatus === 1 ? 'active' : 'pending'
    },
    {
      id: 'allocation',
      title: '数量分摊',
      icon: 'ep:scale-to-original',
      status: order.allocationCompletedTime ? 'completed' :
              order.pickupConfirmedTime ? 'active' : 'pending'
    },
    {
      id: 'payment',
      title: '付款处理',
      icon: 'ep:money',
      status: order.paymentCompletedTime ? 'completed' :
              order.businessStatus === 2 ? 'active' : 'pending'
    },
    {
      id: 'settlement',
      title: '订单结算',
      icon: 'ep:finished',
      status: order.businessStatus >= 3 ? 'completed' :
              order.businessStatus === 2 && order.paymentStatus === 1 ? 'active' : 'pending'
    },
    {
      id: 'completed',
      title: '订单完成',
      icon: order.businessStatus === 5 ? 'ep:circle-close' : 'ep:circle-check',
      status: order.businessStatus === 4 ? 'completed' :
              order.businessStatus === 5 ? 'cancelled' :
              order.businessStatus === 3 ? 'active' : 'pending'
    }
  ]
  
  return steps
})

// 计算进度百分比
const progressPercentage = computed(() => {
  const completedSteps = progressSteps.value.filter(step => step.status === 'completed').length
  const totalSteps = progressSteps.value.length
  return Math.round((completedSteps / totalSteps) * 100)
})

// 进度条颜色
const progressColor = computed(() => {
  const order = props.order
  if (order.businessStatus === 5) return '#f56c6c' // 已取消
  if (order.businessStatus === 4) return '#67c23a' // 已完成
  return '#409eff' // 进行中
})
</script>

<style scoped>
.order-progress-bar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.progress-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  position: relative;
}

.progress-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
  z-index: 2;
}

.progress-node {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  transition: all 0.3s ease;
  position: relative;
}

.progress-item.pending .progress-node {
  background: #f5f7fa;
  border: 2px solid #e4e7ed;
  color: #c0c4cc;
}

.progress-item.active .progress-node {
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  border: 2px solid #409eff;
  color: white;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.4);
  animation: pulse 2s infinite;
}

.progress-item.completed .progress-node {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
  border: 2px solid #67c23a;
  color: white;
  box-shadow: 0 2px 8px rgba(103, 194, 58, 0.3);
}

.progress-item.cancelled .progress-node {
  background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
  border: 2px solid #f56c6c;
  color: white;
  box-shadow: 0 2px 8px rgba(245, 108, 108, 0.3);
}

.node-icon {
  font-size: 18px;
}

.node-number {
  font-size: 14px;
  font-weight: 600;
}

.progress-label {
  font-size: 12px;
  color: #606266;
  text-align: center;
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.3s ease;
}

.progress-item.active .progress-label {
  color: #409eff;
  font-weight: 600;
}

.progress-item.completed .progress-label {
  color: #67c23a;
  font-weight: 600;
}

.progress-item.cancelled .progress-label {
  color: #f56c6c;
  font-weight: 600;
}

.progress-line {
  position: absolute;
  top: 20px;
  left: 50%;
  right: -50%;
  height: 2px;
  background: #e4e7ed;
  z-index: 1;
  transition: all 0.3s ease;
}

.progress-line.completed {
  background: linear-gradient(90deg, #67c23a 0%, #85ce61 100%);
}

.progress-percentage {
  display: flex;
  align-items: center;
  gap: 12px;
}

.percentage-text {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  white-space: nowrap;
}

.percentage-bar {
  flex: 1;
}

/* 动画效果 */
@keyframes pulse {
  0% {
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.4);
  }
  50% {
    box-shadow: 0 2px 12px rgba(64, 158, 255, 0.6);
  }
  100% {
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.4);
  }
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .progress-label {
    font-size: 11px;
  }
  
  .progress-node {
    width: 36px;
    height: 36px;
  }
  
  .node-icon {
    font-size: 16px;
  }
  
  .node-number {
    font-size: 12px;
  }
  
  .progress-line {
    top: 18px;
  }
}

@media (max-width: 768px) {
  .order-progress-bar {
    padding: 16px;
  }
  
  .progress-container {
    margin-bottom: 12px;
  }
  
  .progress-label {
    font-size: 10px;
  }
  
  .progress-node {
    width: 32px;
    height: 32px;
    margin-bottom: 6px;
  }
  
  .node-icon {
    font-size: 14px;
  }
  
  .node-number {
    font-size: 11px;
  }
  
  .progress-line {
    top: 16px;
  }
  
  .percentage-text {
    font-size: 13px;
  }
  
  .progress-percentage {
    flex-direction: column;
    gap: 8px;
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .order-progress-bar {
    background: rgba(45, 47, 51, 0.95);
  }
  
  .progress-label {
    color: #a3a6ad;
  }
  
  .progress-item.active .progress-label {
    color: #66b1ff;
  }
  
  .progress-item.completed .progress-label {
    color: #85ce61;
  }
  
  .progress-item.cancelled .progress-label {
    color: #f78989;
  }
  
  .progress-item.pending .progress-node {
    background: #2d2f33;
    border-color: #4c4d4f;
    color: #73767a;
  }
  
  .percentage-text {
    color: #e5eaf3;
  }
}
</style> 