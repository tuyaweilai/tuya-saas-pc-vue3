<template>
  <div class="order-progress-indicator">
    <div class="progress-dots">
      <div 
        v-for="step in progressSteps" 
        :key="step.id"
        class="progress-dot"
        :class="{ 
          'active': step.status === 'active',
          'completed': step.status === 'completed',
          'pending': step.status === 'pending',
          'cancelled': step.status === 'cancelled'
        }"
        :title="step.title"
      >
        <Icon :icon="step.icon" class="dot-icon" />
      </div>
    </div>
    <div class="progress-text">
      <span class="current-step">{{ currentStepTitle }}</span>
      <span class="progress-percentage">{{ progressPercentage }}%</span>
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
      title: '已创建',
      icon: 'ep:plus',
      status: 'completed'
    },
    {
      id: 'confirmed',
      title: '已确认',
      icon: 'ep:check',
      status: order.businessStatus >= 1 ? 'completed' : 
              order.businessStatus === 0 ? 'active' : 'pending'
    },
    {
      id: 'pickup',
      title: '已收货',
      icon: 'ep:box',
      status: order.pickupConfirmedTime ? 'completed' :
              order.businessStatus === 1 ? 'active' : 'pending'
    },
    {
      id: 'allocation',
      title: '已分摊',
      icon: 'ep:scale-to-original',
      status: order.allocationCompletedTime ? 'completed' :
              order.pickupConfirmedTime ? 'active' : 'pending'
    },
    {
      id: 'payment',
      title: '已付款',
      icon: 'ep:money',
      status: order.paymentCompletedTime ? 'completed' :
              order.businessStatus === 2 ? 'active' : 'pending'
    },
    {
      id: 'settlement',
      title: '已结算',
      icon: 'ep:finished',
      status: order.businessStatus >= 3 ? 'completed' :
              order.businessStatus === 2 && order.paymentStatus === 1 ? 'active' : 'pending'
    },
    {
      id: 'completed',
      title: order.businessStatus === 5 ? '已取消' : '已完成',
      icon: order.businessStatus === 5 ? 'ep:circle-close' : 'ep:circle-check',
      status: order.businessStatus === 4 ? 'completed' :
              order.businessStatus === 5 ? 'cancelled' :
              order.businessStatus === 3 ? 'active' : 'pending'
    }
  ]
  
  return steps
})

// 当前步骤标题
const currentStepTitle = computed(() => {
  const activeStep = progressSteps.value.find(step => step.status === 'active')
  const lastCompletedStep = progressSteps.value.filter(step => step.status === 'completed').pop()
  
  if (activeStep) {
    return `进行中: ${activeStep.title}`
  } else if (lastCompletedStep) {
    return `最新: ${lastCompletedStep.title}`
  } else {
    return '等待开始'
  }
})

// 计算进度百分比
const progressPercentage = computed(() => {
  const completedSteps = progressSteps.value.filter(step => step.status === 'completed').length
  const totalSteps = progressSteps.value.length
  return Math.round((completedSteps / totalSteps) * 100)
})
</script>

<style scoped>
.order-progress-indicator {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.order-progress-indicator:hover {
  background: #e9ecef;
  border-color: #dee2e6;
}

.progress-dots {
  display: flex;
  align-items: center;
  gap: 4px;
}

.progress-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  cursor: help;
}

.progress-dot.pending {
  background: #f5f7fa;
  border: 1px solid #e4e7ed;
  color: #c0c4cc;
}

.progress-dot.active {
  background: #409eff;
  border: 1px solid #409eff;
  color: white;
  animation: pulse-small 2s infinite;
}

.progress-dot.completed {
  background: #67c23a;
  border: 1px solid #67c23a;
  color: white;
}

.progress-dot.cancelled {
  background: #f56c6c;
  border: 1px solid #f56c6c;
  color: white;
}

.dot-icon {
  font-size: 10px;
}

.progress-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.current-step {
  font-size: 12px;
  font-weight: 500;
  color: #303133;
  line-height: 1.2;
}

.progress-percentage {
  font-size: 11px;
  color: #909399;
  font-weight: 500;
}

/* 动画效果 */
@keyframes pulse-small {
  0% {
    box-shadow: 0 0 0 0 rgba(64, 158, 255, 0.4);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(64, 158, 255, 0.2);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(64, 158, 255, 0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .order-progress-indicator {
    padding: 6px 8px;
    gap: 8px;
  }
  
  .progress-dots {
    gap: 3px;
  }
  
  .progress-dot {
    width: 16px;
    height: 16px;
  }
  
  .dot-icon {
    font-size: 8px;
  }
  
  .current-step {
    font-size: 11px;
  }
  
  .progress-percentage {
    font-size: 10px;
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .order-progress-indicator {
    background: #2d2f33;
    border-color: #4c4d4f;
  }
  
  .order-progress-indicator:hover {
    background: #34373c;
    border-color: #5a5d63;
  }
  
  .current-step {
    color: #e5eaf3;
  }
  
  .progress-percentage {
    color: #a3a6ad;
  }
  
  .progress-dot.pending {
    background: #2d2f33;
    border-color: #4c4d4f;
    color: #73767a;
  }
}
</style> 