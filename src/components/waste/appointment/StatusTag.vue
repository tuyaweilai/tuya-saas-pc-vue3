<template>
  <el-tag :type="tagType" :effect="tagEffect" :size="size">
    {{ statusText }}
  </el-tag>
</template>

<script setup lang="ts">
/**
 * 预约状态标签组件
 * 
 * 功能：
 * - 显示预约状态标签
 * - 支持不同尺寸
 * - 自动匹配状态颜色
 * 
 * @author AI Assistant
 * @date 2024-01-01
 * @version 1.0.0
 */

import { computed } from 'vue'
import { AppointmentStatus } from '@/types/waste/appointment'

interface Props {
  /** 预约状态 */
  status: AppointmentStatus
  /** 标签尺寸 */
  size?: 'large' | 'default' | 'small'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'default'
})

// 状态配置映射
const statusConfig = {
  [AppointmentStatus.PENDING]: { 
    text: '待处理', 
    type: 'warning', 
    effect: 'plain' 
  },
  [AppointmentStatus.WAITING_RECYCLER_CONFIRM]: { 
    text: '待确认', 
    type: 'primary', 
    effect: 'plain' 
  },
  [AppointmentStatus.CONFIRMED]: { 
    text: '已确认', 
    type: 'success', 
    effect: 'plain' 
  },
  [AppointmentStatus.REJECTED]: { 
    text: '已拒绝', 
    type: 'danger', 
    effect: 'plain' 
  },
  [AppointmentStatus.ORDER_GENERATED]: { 
    text: '已生成订单', 
    type: 'success', 
    effect: 'dark' 
  },
  [AppointmentStatus.CANCELLED]: { 
    text: '已取消', 
    type: 'info', 
    effect: 'plain' 
  }
} as const

// 计算属性
const statusText = computed(() => statusConfig[props.status]?.text || '未知')
const tagType = computed(() => statusConfig[props.status]?.type || 'info')
const tagEffect = computed(() => statusConfig[props.status]?.effect || 'plain')
</script> 