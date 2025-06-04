<template>
  <div class="app-container">
    <!-- 头部操作栏 -->
    <div class="detail-header">
      <div class="header-left">
        <el-button @click="goBack" class="back-btn">
          <Icon icon="ep:arrow-left" class="mr-5px" />
          返回列表
        </el-button>
        <div class="order-title">
          <div class="title-row">
            <h2>{{ orderData?.orderNo || '订单详情' }}</h2>
            <div class="order-badges">
              <el-tag v-if="orderData?.sourceType !== undefined" :type="getSourceTypeColor(orderData.sourceType) as any" size="small">
                {{ getSourceTypeName(orderData.sourceType) }}
              </el-tag>
            </div>
          </div>
          <div class="status-tags">
            <div class="status-item">
              <span class="status-label">业务状态</span>
              <OrderStatusTag :status="orderData?.businessStatus || 0" type="business" />
            </div>
            <div class="status-item">
              <span class="status-label">付款状态</span>
              <OrderStatusTag :status="orderData?.paymentStatus || 0" type="payment" />
            </div>
          </div>
        </div>
      </div>
      <div class="header-right">
        <el-button @click="handleRefresh" :loading="loading" class="refresh-btn">
          <Icon icon="ep:refresh" class="mr-5px" />
          刷新
        </el-button>
        <el-dropdown
          @command="handleCommand"
          v-if="orderData && orderData.businessStatus < 4"
          class="action-dropdown"
        >
          <el-button type="primary" class="action-btn">
            <Icon icon="ep:operation" class="mr-5px" />
            操作<Icon icon="ep:arrow-down" class="ml-5px" />
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                command="confirm"
                v-if="orderData.businessStatus === 0"
              >
                <Icon icon="ep:check" class="mr-5px" />
                确认订单
              </el-dropdown-item>
              <el-dropdown-item
                command="pickup"
                v-if="orderData.businessStatus === 1 && !orderData.pickupConfirmedTime"
              >
                <Icon icon="ep:box" class="mr-5px" />
                确认收货
              </el-dropdown-item>
              <el-dropdown-item
                command="allocate"
                v-if="orderData.pickupConfirmedTime && !orderData.allocationCompletedTime"
              >
                <Icon icon="ep:scale-to-original" class="mr-5px" />
                分摊数量
              </el-dropdown-item>
              <el-dropdown-item
                command="payment"
                v-if="orderData.businessStatus === 2"
              >
                <Icon icon="ep:money" class="mr-5px" />
                处理付款
              </el-dropdown-item>
              <el-dropdown-item
                command="settle"
                v-if="orderData.businessStatus === 2 && orderData.paymentStatus === 1"
              >
                <Icon icon="ep:finished" class="mr-5px" />
                结算订单
              </el-dropdown-item>
              <el-dropdown-item
                command="complete"
                v-if="orderData.businessStatus === 3"
              >
                <Icon icon="ep:circle-check" class="mr-5px" />
                完成订单
              </el-dropdown-item>
              <el-dropdown-item
                command="cancel"
                v-if="orderData.businessStatus < 3"
                divided
              >
                <Icon icon="ep:circle-close" class="mr-5px" />
                取消订单
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 订单进度条 -->
    <OrderProgressBar v-if="orderData" :order="orderData" />

    <!-- 主要内容区域 -->
    <div v-loading="loading" class="detail-content">
      <el-row :gutter="24">
        <!-- 左侧主要信息 -->
        <el-col :span="16">
          <!-- 基本信息卡片 -->
          <el-card class="info-card mb-20px" shadow="hover">
            <template #header>
              <div class="card-header">
                <div class="header-icon">
                  <Icon icon="ep:info-filled" />
                </div>
                <span class="header-title">基本信息</span>
              </div>
            </template>
            <div class="card-content">
              <el-row :gutter="20">
                <el-col :span="12">
                  <div class="info-item">
                    <div class="info-label">
                      <Icon icon="ep:document" class="mr-5px" />
                      订单编号
                    </div>
                    <div class="info-value primary">{{ orderData?.orderNo }}</div>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="info-item">
                    <div class="info-label">
                      <Icon icon="ep:connection" class="mr-5px" />
                      订单来源
                    </div>
                    <div class="info-value">{{ getSourceTypeName(orderData?.sourceType) }}</div>
                  </div>
                </el-col>
                <el-col :span="12" v-if="orderData?.appointmentNo">
                  <div class="info-item">
                    <div class="info-label">
                      <Icon icon="ep:calendar" class="mr-5px" />
                      预约单号
                    </div>
                    <div class="info-value">
                      <el-link type="primary" @click="viewAppointment" class="link-value">
                        {{ orderData.appointmentNo }}
                      </el-link>
                    </div>
                  </div>
                </el-col>
                <el-col :span="12" v-if="orderData?.quotationNo">
                  <div class="info-item">
                    <div class="info-label">
                      <Icon icon="ep:document-copy" class="mr-5px" />
                      报价编号
                    </div>
                    <div class="info-value">
                      <el-link type="primary" @click="viewQuotation" class="link-value">
                        {{ orderData.quotationNo }}
                      </el-link>
                    </div>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="info-item">
                    <div class="info-label">
                      <Icon icon="ep:clock" class="mr-5px" />
                      创建时间
                    </div>
                    <div class="info-value">{{ orderData?.createTime ? formatDate(orderData.createTime) : '-' }}</div>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="info-item">
                    <div class="info-label">
                      <Icon icon="ep:refresh" class="mr-5px" />
                      更新时间
                    </div>
                    <div class="info-value">{{ orderData?.updateTime ? formatDate(orderData.updateTime) : '-' }}</div>
                  </div>
                </el-col>
              </el-row>
            </div>
          </el-card>

          <!-- 危废信息卡片 -->
          <el-card class="info-card mb-20px" shadow="hover">
            <template #header>
              <div class="card-header">
                <div class="header-icon danger">
                  <Icon icon="ep:warning-filled" />
                </div>
                <span class="header-title">危废信息</span>
              </div>
            </template>
            <div class="card-content">
              <el-row :gutter="20">
                <el-col :span="12">
                  <div class="info-item">
                    <div class="info-label">
                      <Icon icon="ep:warning" class="mr-5px" />
                      危废代码
                    </div>
                    <div class="info-value">
                      <el-tag type="danger" effect="dark" size="large" class="waste-code-tag">
                        {{ orderData?.wasteCode }}
                      </el-tag>
                    </div>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="info-item">
                    <div class="info-label">
                      <Icon icon="ep:document-checked" class="mr-5px" />
                      危废名称
                    </div>
                    <div class="info-value">{{ orderData?.wasteName }}</div>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="info-item">
                    <div class="info-label">
                      <Icon icon="ep:box" class="mr-5px" />
                      包装方式
                    </div>
                    <div class="info-value">{{ orderData?.packagingType || '未指定' }}</div>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="info-item">
                    <div class="info-label">
                      <Icon icon="ep:scale-to-original" class="mr-5px" />
                      数量单位
                    </div>
                    <div class="info-value">{{ orderData?.quantityUnit }}</div>
                  </div>
                </el-col>
              </el-row>
            </div>
          </el-card>

          <!-- 数量信息卡片 -->
          <el-card class="info-card mb-20px" shadow="hover">
            <template #header>
              <div class="card-header">
                <div class="header-icon success">
                  <Icon icon="ep:scale-to-original" />
                </div>
                <span class="header-title">数量信息</span>
              </div>
            </template>
            <div class="card-content">
              <el-row :gutter="20" class="quantity-row">
                <el-col :span="8">
                  <div class="quantity-card estimate">
                    <div class="quantity-icon">
                      <Icon icon="ep:data-analysis" />
                    </div>
                    <div class="quantity-content">
                      <div class="quantity-label">预估数量</div>
                      <div class="quantity-value">
                        {{ orderData?.estimatedQuantity }} <span class="unit">{{ orderData?.quantityUnit }}</span>
                      </div>
                    </div>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="quantity-card" :class="orderData?.confirmedQuantity ? 'confirm' : 'pending'">
                    <div class="quantity-icon">
                      <Icon :icon="orderData?.confirmedQuantity ? 'ep:circle-check' : 'ep:clock'" />
                    </div>
                    <div class="quantity-content">
                      <div class="quantity-label">确认数量</div>
                      <div class="quantity-value" v-if="orderData?.confirmedQuantity">
                        {{ orderData.confirmedQuantity }} <span class="unit">{{ orderData?.quantityUnit }}</span>
                      </div>
                      <div class="quantity-value pending-text" v-else>待确认</div>
                      <div class="quantity-extra" v-if="orderData?.pickupConfirmedBy">
                        <Icon icon="ep:user" class="mr-5px" />
                        {{ orderData.pickupConfirmedBy }}
                      </div>
                    </div>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="quantity-card" :class="orderData?.allocatedQuantity ? 'allocate' : 'pending'">
                    <div class="quantity-icon">
                      <Icon :icon="orderData?.allocatedQuantity ? 'ep:pie-chart' : 'ep:clock'" />
                    </div>
                    <div class="quantity-content">
                      <div class="quantity-label">分摊数量</div>
                      <div class="quantity-value" v-if="orderData?.allocatedQuantity">
                        {{ orderData.allocatedQuantity }} <span class="unit">{{ orderData?.quantityUnit }}</span>
                      </div>
                      <div class="quantity-value pending-text" v-else>待分摊</div>
                      <div class="quantity-extra" v-if="orderData?.allocationRatio">
                        比例：{{ ((orderData.allocationRatio || 0) * 100).toFixed(2) }}%
                      </div>
                    </div>
                  </div>
                </el-col>
              </el-row>
              
              <!-- 差异分析 -->
              <div v-if="orderData?.varianceFromEstimate" class="variance-analysis">
                <el-alert
                  :title="`数量差异分析`"
                  :type="Math.abs(orderData.varianceRate || 0) > 0.1 ? 'warning' : 'info'"
                  show-icon
                  :closable="false"
                  class="variance-alert"
                >
                  <template #default>
                    <div class="variance-content">
                      <div class="variance-item">
                        <span class="variance-label">差异数量：</span>
                        <span class="variance-value" :class="{ 'positive': orderData.varianceFromEstimate > 0, 'negative': orderData.varianceFromEstimate < 0 }">
                          {{ orderData.varianceFromEstimate > 0 ? '+' : '' }}{{ orderData.varianceFromEstimate }} {{ orderData.quantityUnit }}
                        </span>
                      </div>
                      <div class="variance-item">
                        <span class="variance-label">差异率：</span>
                        <span class="variance-value" :class="{ 'positive': orderData.varianceFromEstimate > 0, 'negative': orderData.varianceFromEstimate < 0 }">
                          {{ ((orderData.varianceRate || 0) * 100).toFixed(2) }}%
                        </span>
                      </div>
                    </div>
                  </template>
                </el-alert>
              </div>
            </div>
          </el-card>

          <!-- 金额信息卡片 -->
          <el-card class="info-card mb-20px" shadow="hover">
            <template #header>
              <div class="card-header">
                <div class="header-icon warning">
                  <Icon icon="ep:money" />
                </div>
                <span class="header-title">金额信息</span>
              </div>
            </template>
            <div class="card-content">
              <div class="amount-grid">
                <div class="amount-card estimate">
                  <div class="amount-icon">
                    <Icon icon="ep:data-analysis" />
                  </div>
                  <div class="amount-content">
                    <div class="amount-label">单价</div>
                    <div class="amount-value">¥{{ orderData?.unitPrice?.toFixed(2) }}<span class="unit">/{{ orderData?.quantityUnit }}</span></div>
                  </div>
                </div>
                <div class="amount-card estimate">
                  <div class="amount-icon">
                    <Icon icon="ep:coin" />
                  </div>
                  <div class="amount-content">
                    <div class="amount-label">预估金额</div>
                    <div class="amount-value">¥{{ orderData?.estimatedAmount?.toFixed(2) }}</div>
                  </div>
                </div>
                <div class="amount-card final">
                  <div class="amount-icon">
                    <Icon icon="ep:money" />
                  </div>
                  <div class="amount-content">
                    <div class="amount-label">最终金额</div>
                    <div class="amount-value">
                      {{ orderData?.finalAmount ? `¥${orderData.finalAmount.toFixed(2)}` : '待计算' }}
                    </div>
                  </div>
                </div>
                <div class="amount-card difference" v-if="orderData?.finalAmount && orderData?.estimatedAmount">
                  <div class="amount-icon">
                    <Icon icon="ep:trend-charts" />
                  </div>
                  <div class="amount-content">
                    <div class="amount-label">金额差异</div>
                    <div class="amount-value" :class="{ 'increase': (orderData.finalAmount - orderData.estimatedAmount) > 0, 'decrease': (orderData.finalAmount - orderData.estimatedAmount) < 0 }">
                      {{ (orderData.finalAmount - orderData.estimatedAmount) > 0 ? '+' : '' }}¥{{ (orderData.finalAmount - orderData.estimatedAmount).toFixed(2) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-card>

          <!-- 企业信息卡片 -->
          <el-card class="info-card mb-20px" shadow="hover">
            <template #header>
              <div class="card-header">
                <div class="header-icon primary">
                  <Icon icon="ep:office-building" />
                </div>
                <span class="header-title">参与企业</span>
              </div>
            </template>
            <div class="card-content">
              <el-row :gutter="20">
                <el-col :span="12">
                  <div class="enterprise-card producing">
                    <div class="enterprise-header">
                      <div class="enterprise-icon">
                        <Icon icon="ep:factory" />
                      </div>
                      <div class="enterprise-type">产废企业</div>
                    </div>
                    <div class="enterprise-name">{{ orderData?.producingEnterpriseName }}</div>
                    <div class="enterprise-store" v-if="orderData?.producingStoreName">
                      <Icon icon="ep:shop" class="mr-5px" />
                      {{ orderData.producingStoreName }}
                    </div>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="enterprise-card recycling">
                    <div class="enterprise-header">
                      <div class="enterprise-icon">
                        <Icon icon="ep:refresh" />
                      </div>
                      <div class="enterprise-type">回收企业</div>
                    </div>
                    <div class="enterprise-name">{{ orderData?.recyclingEnterpriseName }}</div>
                  </div>
                </el-col>
              </el-row>
            </div>
          </el-card>

          <!-- 物流信息卡片 -->
          <el-card class="info-card mb-20px" shadow="hover" v-if="orderData?.transportTaskId || orderData?.logisticsStatus">
            <template #header>
              <div class="card-header">
                <div class="header-icon info">
                  <Icon icon="ep:truck" />
                </div>
                <span class="header-title">物流信息</span>
              </div>
            </template>
            <div class="card-content">
              <el-row :gutter="20">
                <el-col :span="12" v-if="orderData?.transportTaskId">
                  <div class="info-item">
                    <div class="info-label">
                      <Icon icon="ep:van" class="mr-5px" />
                      运输任务
                    </div>
                    <div class="info-value">
                      <el-link type="primary" @click="viewTransportTask" class="link-value">
                        #{{ orderData.transportTaskId }}
                      </el-link>
                    </div>
                  </div>
                </el-col>
                <el-col :span="12" v-if="orderData?.logisticsStatus">
                  <div class="info-item">
                    <div class="info-label">
                      <Icon icon="ep:position" class="mr-5px" />
                      物流状态
                    </div>
                    <div class="info-value">{{ orderData.logisticsStatus }}</div>
                  </div>
                </el-col>
                <el-col :span="12" v-if="orderData?.vehicleWeighingId">
                  <div class="info-item">
                    <div class="info-label">
                      <Icon icon="ep:scale-to-original" class="mr-5px" />
                      车辆过磅
                    </div>
                    <div class="info-value">
                      <el-link type="primary" @click="viewVehicleWeighing" class="link-value">
                        #{{ orderData.vehicleWeighingId }}
                      </el-link>
                    </div>
                  </div>
                </el-col>
                <el-col :span="12" v-if="orderData?.pickupConfirmedLocation">
                  <div class="info-item">
                    <div class="info-label">
                      <Icon icon="ep:location" class="mr-5px" />
                      收货位置
                    </div>
                    <div class="info-value">{{ orderData.pickupConfirmedLocation }}</div>
                  </div>
                </el-col>
              </el-row>
            </div>
          </el-card>

          <!-- 付款信息卡片 -->
          <el-card class="info-card mb-20px" shadow="hover">
            <template #header>
              <div class="card-header">
                <div class="header-icon success">
                  <Icon icon="ep:credit-card" />
                </div>
                <span class="header-title">付款信息</span>
              </div>
            </template>
            <div class="card-content">
              <el-row :gutter="20">
                <el-col :span="12">
                  <div class="info-item">
                    <div class="info-label">
                      <Icon icon="ep:wallet" class="mr-5px" />
                      付款方式
                    </div>
                    <div class="info-value">{{ getPaymentMethodName(orderData?.paymentMethodType) }}</div>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="info-item">
                    <div class="info-label">
                      <Icon icon="ep:circle-check" class="mr-5px" />
                      付款状态
                    </div>
                    <div class="info-value">
                      <OrderStatusTag :status="orderData?.paymentStatus || 0" type="payment" />
                    </div>
                  </div>
                </el-col>
                <el-col :span="12" v-if="orderData?.paymentCompletedTime">
                  <div class="info-item">
                    <div class="info-label">
                      <Icon icon="ep:clock" class="mr-5px" />
                      付款完成时间
                    </div>
                    <div class="info-value">{{ formatDate(orderData.paymentCompletedTime) }}</div>
                  </div>
                </el-col>
                <el-col :span="12" v-if="orderData?.paymentVoucherId">
                  <div class="info-item">
                    <div class="info-label">
                      <Icon icon="ep:document" class="mr-5px" />
                      付款凭证
                    </div>
                    <div class="info-value">
                      <el-link type="primary" @click="viewPaymentVoucher" class="link-value">
                        查看凭证
                      </el-link>
                    </div>
                  </div>
                </el-col>
              </el-row>
            </div>
          </el-card>

          <!-- 备注信息卡片 -->
          <el-card class="info-card mb-20px" shadow="hover">
            <template #header>
              <div class="card-header">
                <div class="header-icon info">
                  <Icon icon="ep:edit" />
                </div>
                <span class="header-title">备注信息</span>
              </div>
            </template>
            <div class="card-content">
              <div class="remark-item">
                <div class="remark-label">
                  <Icon icon="ep:user" class="mr-5px" />
                  用户备注
                </div>
                <div class="remark-content">{{ orderData?.userRemark || '无' }}</div>
              </div>
              <div class="remark-item">
                <div class="remark-label">
                  <Icon icon="ep:lock" class="mr-5px" />
                  内部备注
                </div>
                <div class="remark-content">{{ orderData?.internalRemark || '无' }}</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 右侧时间线 -->
        <el-col :span="8">
          <el-card class="timeline-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <div class="header-icon primary">
                  <Icon icon="ep:clock" />
                </div>
                <span class="header-title">处理流程</span>
              </div>
            </template>
            <div class="timeline-content">
              <OrderTimeline v-if="orderData" :order="orderData" />
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 业务操作弹窗 -->
    <PickupConfirmDialog ref="pickupDialogRef" @success="refreshData" />
    <AllocateQuantityDialog ref="allocateDialogRef" @success="refreshData" />
    <PaymentProcessDialog ref="paymentDialogRef" @success="refreshData" />
  </div>
</template>

<script setup lang="ts" name="WasteTransferOrderDetail">
import { formatDate } from '@/utils/formatTime'
import { useMessage } from '@/hooks/web/useMessage'
import * as TransferOrderApi from '@/api/waste/transferOrder'
import type { TransferOrderRespVO } from '@/api/waste/transferOrder'
import OrderStatusTag from '@/components/waste/transfer-order/OrderStatusTag.vue'
import OrderTimeline from '@/components/waste/transfer-order/OrderTimeline.vue'
import PickupConfirmDialog from './components/PickupConfirmDialog.vue'
import AllocateQuantityDialog from './components/AllocateQuantityDialog.vue'
import PaymentProcessDialog from './components/PaymentProcessDialog.vue'
import OrderProgressBar from '@/components/waste/transfer-order/OrderProgressBar.vue'

const message = useMessage()

// 路由参数
const route = useRoute()
const router = useRouter()
const orderId = parseInt(route.params.id as string)

// 数据相关
const loading = ref(true)
const orderData = ref<TransferOrderRespVO>()

// 弹窗相关
const pickupDialogRef = ref()
const allocateDialogRef = ref()
const paymentDialogRef = ref()

// 获取订单详情
const getOrderDetail = async () => {
  loading.value = true
  try {
    const data = await TransferOrderApi.getTransferOrder(orderId)
    orderData.value = data
  } finally {
    loading.value = false
  }
}

// 刷新数据
const refreshData = async () => {
  await getOrderDetail()
}

// 处理刷新按钮
const handleRefresh = () => {
  refreshData()
}

// 返回列表
const goBack = () => {
  router.go(-1)
}

// 获取订单来源类型名称
const getSourceTypeName = (sourceType?: number) => {
  const types: Record<number, string> = {
    0: '预约转订单',
    1: '扫街临时订单',
    2: '补单'
  }
  return sourceType !== undefined ? types[sourceType] || '未知' : '未知'
}

// 获取订单来源类型颜色
const getSourceTypeColor = (sourceType?: number) => {
  const colors: Record<number, string> = {
    0: 'success',
    1: 'warning', 
    2: 'info'
  }
  return sourceType !== undefined ? colors[sourceType] || '' : ''
}

// 获取付款方式名称
const getPaymentMethodName = (paymentMethodType?: number) => {
  const methods: Record<number, string> = {
    1: '对公结算',
    2: '个人结算'
  }
  return paymentMethodType !== undefined ? methods[paymentMethodType] || '未指定' : '未指定'
}

// 处理操作命令
const handleCommand = async (command: string) => {
  if (!orderData.value) return
  
  switch (command) {
    case 'confirm':
      await handleConfirmOrder()
      break
    case 'pickup':
      pickupDialogRef.value.open(orderData.value)
      break
    case 'allocate':
      allocateDialogRef.value.open(orderData.value)
      break
    case 'payment':
      paymentDialogRef.value.open(orderData.value)
      break
    case 'settle':
      await handleSettleOrder()
      break
    case 'complete':
      await handleCompleteOrder()
      break
    case 'cancel':
      await handleCancelOrder()
      break
  }
}

// 确认订单
const handleConfirmOrder = async () => {
  try {
    await message.confirm('确定要确认该订单吗？')
    await TransferOrderApi.confirmOrder(orderId)
    message.success('确认成功')
    refreshData()
  } catch {}
}

// 结算订单
const handleSettleOrder = async () => {
  try {
    await message.confirm('确定要结算该订单吗？')
    await TransferOrderApi.settleOrder(orderId)
    message.success('结算成功')
    refreshData()
  } catch {}
}

// 完成订单
const handleCompleteOrder = async () => {
  try {
    await message.confirm('确定要完成该订单吗？')
    await TransferOrderApi.completeOrder(orderId)
    message.success('完成成功')
    refreshData()
  } catch {}
}

// 取消订单
const handleCancelOrder = async () => {
  try {
    const { value: reason } = await ElMessageBox.prompt('请输入取消原因', '取消订单', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /.+/,
      inputErrorMessage: '取消原因不能为空'
    })
    await TransferOrderApi.cancelOrder(orderId, reason)
    message.success('取消成功')
    refreshData()
  } catch {}
}

// 查看相关记录
const viewAppointment = () => {
  // TODO: 跳转到预约详情
}

const viewQuotation = () => {
  // TODO: 跳转到报价详情
}

const viewTransportTask = () => {
  // TODO: 跳转到运输任务详情
}

const viewVehicleWeighing = () => {
  // TODO: 跳转到车辆过磅详情
}

const viewPaymentVoucher = () => {
  // TODO: 查看付款凭证
}

// 初始化
onMounted(() => {
  if (orderId) {
    getOrderDetail()
  }
})
</script>

<style scoped>
/* 全局样式 */
.app-container {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  padding: 20px;
}

/* 头部样式 */
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  margin-bottom: 24px;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
  color: white;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.back-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.order-title {
  flex: 1;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.order-title h2 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.order-badges {
  display: flex;
  gap: 8px;
}

.status-tags {
  display: flex;
  gap: 16px;
}

.status-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.status-label {
  font-size: 12px;
  opacity: 0.8;
  font-weight: 500;
}

.header-right {
  display: flex;
  gap: 12px;
}

.refresh-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.refresh-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.action-btn {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  border: none;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.6);
}

/* 内容区域 */
.detail-content {
  padding: 0 8px;
}

/* 卡片样式 */
.info-card {
  border: none;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.info-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
  font-size: 16px;
  color: #2c3e50;
}

.header-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header-icon.danger {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
}

.header-icon.success {
  background: linear-gradient(135deg, #51cf66 0%, #40c057 100%);
}

.header-icon.warning {
  background: linear-gradient(135deg, #ffd43b 0%, #fab005 100%);
}

.header-icon.info {
  background: linear-gradient(135deg, #74c0fc 0%, #339af0 100%);
}

.header-icon.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.card-content {
  padding: 24px;
}

/* 信息项样式 */
.info-item {
  margin-bottom: 20px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 8px;
  font-weight: 500;
}

.info-value {
  font-size: 16px;
  color: #2c3e50;
  font-weight: 600;
}

.info-value.primary {
  color: #667eea;
  font-size: 18px;
}

.link-value {
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
}

.link-value:hover {
  transform: translateX(4px);
}

/* 危废代码标签 */
.waste-code-tag {
  font-size: 16px;
  font-weight: 700;
  padding: 8px 16px;
  border-radius: 8px;
}

/* 数量卡片样式 */
.quantity-row {
  margin-bottom: 24px;
}

.quantity-card {
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  height: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.quantity-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.quantity-card.estimate {
  border-color: #74c0fc;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
}

.quantity-card.estimate::before {
  background: linear-gradient(90deg, #74c0fc 0%, #339af0 100%);
}

.quantity-card.confirm {
  border-color: #51cf66;
  background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
}

.quantity-card.confirm::before {
  background: linear-gradient(90deg, #51cf66 0%, #40c057 100%);
}

.quantity-card.allocate {
  border-color: #ffd43b;
  background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%);
}

.quantity-card.allocate::before {
  background: linear-gradient(90deg, #ffd43b 0%, #fab005 100%);
}

.quantity-card.pending {
  border-color: #dee2e6;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.quantity-card.pending::before {
  background: linear-gradient(90deg, #dee2e6 0%, #adb5bd 100%);
}

.quantity-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.quantity-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  margin-bottom: 12px;
}

.quantity-content {
  flex: 1;
}

.quantity-label {
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 8px;
  font-weight: 500;
}

.quantity-value {
  font-size: 20px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 4px;
}

.quantity-value .unit {
  font-size: 14px;
  color: #6c757d;
  font-weight: 500;
}

.pending-text {
  color: #adb5bd;
  font-style: italic;
}

.quantity-extra {
  font-size: 12px;
  color: #6c757d;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

/* 差异分析 */
.variance-analysis {
  margin-top: 24px;
}

.variance-alert {
  border-radius: 12px;
  border: none;
}

.variance-content {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.variance-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.variance-label {
  font-weight: 500;
  color: #6c757d;
}

.variance-value {
  font-weight: 700;
}

.variance-value.positive {
  color: #ff6b6b;
}

.variance-value.negative {
  color: #51cf66;
}

/* 金额网格 */
.amount-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.amount-card {
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.amount-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.amount-card.estimate {
  border-color: #74c0fc;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
}

.amount-card.estimate::before {
  background: linear-gradient(90deg, #74c0fc 0%, #339af0 100%);
}

.amount-card.final {
  border-color: #51cf66;
  background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
}

.amount-card.final::before {
  background: linear-gradient(90deg, #51cf66 0%, #40c057 100%);
}

.amount-card.difference {
  border-color: #ffd43b;
  background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%);
}

.amount-card.difference::before {
  background: linear-gradient(90deg, #ffd43b 0%, #fab005 100%);
}

.amount-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}

.amount-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  flex-shrink: 0;
}

.amount-content {
  flex: 1;
}

.amount-label {
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 4px;
  font-weight: 500;
}

.amount-value {
  font-size: 18px;
  font-weight: 700;
  color: #2c3e50;
}

.amount-value .unit {
  font-size: 12px;
  color: #6c757d;
  font-weight: 500;
}

.amount-value.increase {
  color: #ff6b6b;
}

.amount-value.decrease {
  color: #51cf66;
}

/* 企业卡片 */
.enterprise-card {
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 16px;
  padding: 20px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.enterprise-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
}

.enterprise-card.producing::before {
  background: linear-gradient(90deg, #ff6b6b 0%, #ee5a24 100%);
}

.enterprise-card.recycling::before {
  background: linear-gradient(90deg, #51cf66 0%, #40c057 100%);
}

.enterprise-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}

.enterprise-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.enterprise-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.enterprise-type {
  font-size: 14px;
  color: #6c757d;
  font-weight: 600;
}

.enterprise-name {
  font-size: 18px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 8px;
}

.enterprise-store {
  font-size: 14px;
  color: #6c757d;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 备注样式 */
.remark-item {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  border-left: 4px solid #667eea;
}

.remark-item:last-child {
  margin-bottom: 0;
}

.remark-label {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 8px;
  font-weight: 600;
}

.remark-content {
  font-size: 15px;
  color: #2c3e50;
  line-height: 1.6;
  word-break: break-word;
}

/* 时间线卡片 */
.timeline-card {
  position: sticky;
  top: 20px;
  border: none;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.timeline-content {
  padding: 16px;
  max-height: 600px;
  overflow-y: auto;
}

.timeline-content::-webkit-scrollbar {
  width: 6px;
}

.timeline-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.timeline-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.timeline-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .detail-content {
    padding: 0;
  }
  
  .amount-grid {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }
}

@media (max-width: 768px) {
  .app-container {
    padding: 12px;
  }
  
  .detail-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 20px;
  }
  
  .header-left {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    width: 100%;
  }
  
  .title-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .order-title h2 {
    font-size: 24px;
  }
  
  .status-tags {
    flex-direction: column;
    gap: 8px;
  }
  
  .header-right {
    width: 100%;
    justify-content: flex-end;
  }
  
  .card-content {
    padding: 16px;
  }
  
  .quantity-card {
    height: 120px;
    padding: 16px;
  }
  
  .quantity-value {
    font-size: 18px;
  }
  
  .amount-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .variance-content {
    flex-direction: column;
    gap: 12px;
  }
  
  .timeline-card {
    position: static;
    margin-top: 20px;
  }
}

/* 动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.info-card {
  animation: fadeInUp 0.6s ease-out;
}

.info-card:nth-child(1) { animation-delay: 0.1s; }
.info-card:nth-child(2) { animation-delay: 0.2s; }
.info-card:nth-child(3) { animation-delay: 0.3s; }
.info-card:nth-child(4) { animation-delay: 0.4s; }
.info-card:nth-child(5) { animation-delay: 0.5s; }
.info-card:nth-child(6) { animation-delay: 0.6s; }
.info-card:nth-child(7) { animation-delay: 0.7s; }

/* 加载状态 */
.detail-content[v-loading] {
  min-height: 400px;
}
</style> 