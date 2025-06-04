import request from '@/config/axios'

// 转移订单分页查询参数
export interface TransferOrderPageReqVO extends PageParam {
  orderNo?: string
  appointmentId?: number
  producingEnterpriseId?: number
  recyclingEnterpriseId?: number
  wasteCode?: string
  wasteName?: string
  businessStatus?: number
  paymentStatus?: number
  sourceType?: number
  startTime?: Date[]
  endTime?: Date[]
}

// 转移订单创建/更新参数
export interface TransferOrderSaveReqVO {
  id?: number
  appointmentId?: number
  quotationId?: number
  producingEnterpriseId: number
  producingStoreId?: number
  recyclingEnterpriseId: number
  wasteCode: string
  wasteName: string
  estimatedQuantity: number
  confirmedQuantity?: number
  quantityUnit: string
  packagingType?: string
  unitPrice: number
  estimatedAmount: number
  paymentConfigId?: number
  userRemark?: string
  internalRemark?: string
}

// 转移订单响应VO
export interface TransferOrderRespVO {
  id: number
  orderNo: string
  appointmentId?: number
  quotationId?: number
  producingEnterpriseId: number
  producingStoreName?: string
  recyclingEnterpriseId: number
  transportTaskId?: number
  vehicleWeighingId?: number
  logisticsStatus?: string
  wasteCode: string
  wasteName: string
  estimatedQuantity: number
  confirmedQuantity?: number
  allocatedQuantity?: number
  quantityUnit: string
  packagingType?: string
  unitPrice: number
  estimatedAmount: number
  finalAmount?: number
  businessStatus: number
  businessStatusName?: string
  paymentConfigId?: number
  paymentMethodType?: number
  paymentStatus: number
  paymentStatusName?: string
  paymentCompletedTime?: Date
  paymentVoucherId?: number
  pickupConfirmedTime?: Date
  pickupConfirmedBy?: string
  pickupConfirmedLocation?: string
  allocationRatio?: number
  allocationCompletedTime?: Date
  varianceFromEstimate?: number
  varianceRate?: number
  sourceType: number
  sourceTypeName?: string
  relatedOrderId?: number
  userRemark?: string
  internalRemark?: string
  createTime: Date
  updateTime?: Date
  // 扩展字段
  producingEnterpriseName?: string
  recyclingEnterpriseName?: string
  appointmentNo?: string
  quotationNo?: string
}

// 确认收货参数
export interface ConfirmPickupReqVO {
  id: number
  confirmedQuantity: number
  confirmedBy: string
  confirmedLocation?: string
  remark?: string
}

// 分摊数量参数
export interface AllocateQuantityReqVO {
  id: number
  allocatedQuantity: number
  allocationRatio: number
  allocationMethod: number
  remark?: string
}

// 调整价格参数
export interface AdjustPriceReqVO {
  id: number
  newUnitPrice: number
  newFinalAmount: number
  adjustmentReason: string
}

// 处理付款参数
export interface ProcessPaymentReqVO {
  id: number
  paymentMethodType: number
  paymentVoucherId?: number
  paymentTime?: string
  remark?: string
}

// ========== 基础CRUD接口 ==========

// 获取转移订单分页列表
export const getTransferOrderPage = (params: TransferOrderPageReqVO) => {
  return request.get({ url: '/waste/transfer-order/page', params })
}

// 获取转移订单详情
export const getTransferOrder = (id: number) => {
  return request.get({ url: `/waste/transfer-order/get?id=${id}` })
}

// 根据订单号获取详情
export const getTransferOrderByNo = (orderNo: string) => {
  return request.get({ url: `/waste/transfer-order/get-by-order-no?orderNo=${orderNo}` })
}

// 创建转移订单
export const createTransferOrder = (data: TransferOrderSaveReqVO) => {
  return request.post({ url: '/waste/transfer-order/create', data })
}

// 更新转移订单
export const updateTransferOrder = (data: TransferOrderSaveReqVO) => {
  return request.put({ url: '/waste/transfer-order/update', data })
}

// 删除转移订单
export const deleteTransferOrder = (id: number) => {
  return request.delete({ url: `/waste/transfer-order/delete?id=${id}` })
}

// 导出转移订单Excel
export const exportTransferOrderExcel = (params: TransferOrderPageReqVO) => {
  return request.download({ url: '/waste/transfer-order/export-excel', params })
}

// ========== 查询接口 ==========

// 根据预约单ID查询订单列表
export const getTransferOrderListByAppointmentId = (appointmentId: number) => {
  return request.get({ url: `/waste/transfer-order/list-by-appointment-id?appointmentId=${appointmentId}` })
}

// 根据企业ID查询订单列表
export const getTransferOrderListByEnterpriseId = (enterpriseId: number, type: 'producing' | 'recycling') => {
  return request.get({ url: `/waste/transfer-order/list-by-enterprise-id?enterpriseId=${enterpriseId}&type=${type}` })
}

// 根据业务状态查询订单列表
export const getTransferOrderListByBusinessStatus = (businessStatus: number) => {
  return request.get({ url: `/waste/transfer-order/list-by-business-status?businessStatus=${businessStatus}` })
}

// 根据付款状态查询订单列表
export const getTransferOrderListByPaymentStatus = (paymentStatus: number) => {
  return request.get({ url: `/waste/transfer-order/list-by-payment-status?paymentStatus=${paymentStatus}` })
}

// ========== 业务流程接口 ==========

// 确认订单
export const confirmOrder = (id: number) => {
  return request.put({ url: `/waste/transfer-order/confirm?id=${id}` })
}

// 确认收货
export const confirmPickup = (data: ConfirmPickupReqVO) => {
  return request.put({ url: '/waste/transfer-order/confirm-pickup', data })
}

// 分摊数量
export const allocateQuantity = (data: AllocateQuantityReqVO) => {
  return request.put({ url: '/waste/transfer-order/allocate-quantity', data })
}

// 调整价格
export const adjustPrice = (data: AdjustPriceReqVO) => {
  return request.put({ url: '/waste/transfer-order/adjust-price', data })
}

// 处理付款
export const processPayment = (data: ProcessPaymentReqVO) => {
  return request.put({ url: '/waste/transfer-order/process-payment', data })
}

// 结算订单
export const settleOrder = (id: number) => {
  return request.put({ url: `/waste/transfer-order/settle?id=${id}` })
}

// 完成订单
export const completeOrder = (id: number) => {
  return request.put({ url: `/waste/transfer-order/complete?id=${id}` })
}

// 取消订单
export const cancelOrder = (id: number, reason: string) => {
  return request.put({ url: `/waste/transfer-order/cancel?id=${id}&reason=${reason}` })
}

// ========== 物流协作接口 ==========

// 关联运输任务
export const linkTransportTask = (orderId: number, transportTaskId: number) => {
  return request.put({ url: `/waste/transfer-order/link-transport-task?orderId=${orderId}&transportTaskId=${transportTaskId}` })
}

// 更新物流状态
export const updateLogisticsStatus = (orderId: number, logisticsStatus: string) => {
  return request.put({ url: `/waste/transfer-order/update-logistics-status?orderId=${orderId}&logisticsStatus=${logisticsStatus}` })
}

// 关联车辆过磅
export const linkVehicleWeighing = (orderId: number, vehicleWeighingId: number) => {
  return request.put({ url: `/waste/transfer-order/link-vehicle-weighing?orderId=${orderId}&vehicleWeighingId=${vehicleWeighingId}` })
} 