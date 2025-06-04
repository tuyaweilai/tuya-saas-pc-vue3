<template>
  <el-timeline>
    <el-timeline-item
      v-for="item in timelineData"
      :key="item.id"
      :icon="item.icon"
      :type="item.type"
      :color="item.color"
      :timestamp="item.timestamp"
      placement="top"
    >
      <el-card>
        <h4>{{ item.title }}</h4>
        <p v-if="item.description">{{ item.description }}</p>
        <div v-if="item.operator" class="operator-info">
          <span>操作人：{{ item.operator }}</span>
        </div>
      </el-card>
    </el-timeline-item>
  </el-timeline>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatDate } from '@/utils/formatTime'
import type { TransferOrderRespVO } from '@/api/waste/transferOrder'

interface Props {
  order: TransferOrderRespVO
}

const props = defineProps<Props>()

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

const timelineData = computed<TimelineItem[]>(() => {
  const items: TimelineItem[] = []

  // 订单创建
  items.push({
    id: 'created',
    title: '订单创建',
    description: `订单号：${props.order.orderNo}`,
    timestamp: formatDate(props.order.createTime),
    icon: 'Plus',
    type: 'primary'
  })

  // 订单确认
  if (props.order.businessStatus >= 1) {
    items.push({
      id: 'confirmed',
      title: '订单确认',
      description: '订单信息已确认',
      timestamp: formatDate(props.order.updateTime),
      icon: 'Check',
      type: 'success'
    })
  }

  // 收货确认
  if (props.order.pickupConfirmedTime) {
    items.push({
      id: 'pickup',
      title: '收货确认',
      description: `确认数量：${props.order.confirmedQuantity} ${props.order.quantityUnit}`,
      operator: props.order.pickupConfirmedBy,
      timestamp: formatDate(props.order.pickupConfirmedTime),
      icon: 'Box',
      type: 'primary'
    })
  }

  // 分摊完成
  if (props.order.allocationCompletedTime) {
    items.push({
      id: 'allocation',
      title: '数量分摊',
      description: `分摊数量：${props.order.allocatedQuantity} ${props.order.quantityUnit}，分摊比例：${(props.order.allocationRatio * 100).toFixed(2)}%`,
      timestamp: formatDate(props.order.allocationCompletedTime),
      icon: 'Scale',
      type: 'info'
    })
  }

  // 付款完成
  if (props.order.paymentCompletedTime) {
    items.push({
      id: 'payment',
      title: '付款完成',
      description: `最终金额：¥${props.order.finalAmount?.toFixed(2)}`,
      timestamp: formatDate(props.order.paymentCompletedTime),
      icon: 'Money',
      type: 'success'
    })
  }

  // 订单完成
  if (props.order.businessStatus === 4) {
    items.push({
      id: 'completed',
      title: '订单完成',
      description: '订单处理完成',
      timestamp: formatDate(props.order.updateTime),
      icon: 'CircleCheck',
      type: 'success',
      color: '#67C23A'
    })
  }

  // 订单取消
  if (props.order.businessStatus === 5) {
    items.push({
      id: 'cancelled',
      title: '订单取消',
      description: '订单已取消',
      timestamp: formatDate(props.order.updateTime),
      icon: 'CircleClose',
      type: 'danger',
      color: '#F56C6C'
    })
  }

  return items.reverse() // 倒序显示，最新的在上面
})
</script>

<style scoped>
.operator-info {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}
</style> 