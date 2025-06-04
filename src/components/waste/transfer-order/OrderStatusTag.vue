<template>
  <el-tag :type="tagConfig.type" :effect="tagConfig.effect">
    {{ tagConfig.text }}
  </el-tag>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  status: number
  type?: 'business' | 'payment'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'business'
})

// 业务状态配置
const businessStatusConfig = {
  0: { text: '待确认', type: 'warning', effect: 'plain' },
  1: { text: '已确认', type: 'primary', effect: 'plain' },
  2: { text: '待结算', type: 'info', effect: 'plain' },
  3: { text: '已结算', type: 'success', effect: 'plain' },
  4: { text: '已完成', type: 'success', effect: 'dark' },
  5: { text: '已取消', type: 'danger', effect: 'plain' }
}

// 付款状态配置
const paymentStatusConfig = {
  0: { text: '未付款', type: 'danger', effect: 'plain' },
  1: { text: '已付款', type: 'success', effect: 'dark' },
  2: { text: '付款失败', type: 'danger', effect: 'dark' },
  3: { text: '待凭证上传', type: 'warning', effect: 'plain' },
  4: { text: '凭证已上传', type: 'primary', effect: 'plain' },
  5: { text: '凭证已确认', type: 'success', effect: 'plain' }
}

const tagConfig = computed(() => {
  const config = props.type === 'business' ? businessStatusConfig : paymentStatusConfig
  return config[props.status] || { text: '未知', type: 'info', effect: 'plain' }
})
</script> 