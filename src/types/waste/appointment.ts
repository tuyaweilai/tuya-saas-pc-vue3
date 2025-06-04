/**
 * 危废转移预约模块类型定义
 * @author AI Assistant
 * @date 2024-01-01
 */

// 预约状态枚举
export enum AppointmentStatus {
  PENDING = 0,                    // 待处理
  WAITING_RECYCLER_CONFIRM = 1,   // 待回收方确认
  CONFIRMED = 2,                  // 已确认
  REJECTED = 3,                   // 已拒绝
  ORDER_GENERATED = 4,            // 已生成订单
  CANCELLED = 5                   // 已取消
}

// 分配方式枚举
export enum AssignmentType {
  AUTO_ASSIGNMENT = 0,            // 自动分配
  USER_SELECTION = 1,             // 用户选择
  SYSTEM_RULE = 2,                // 系统规则分配
  MANUAL_ASSIGNMENT = 3           // 管理员手动指定
}

// 业务模式枚举
export enum BusinessMode {
  INDEPENDENT_OPERATION = 0,      // 独立运营
  PLATFORM_BIDDING = 1,          // 平台竞价
  HYBRID_MODE = 2                // 混合模式
}

// 地理位置信息
export interface LocationInfo {
  address: string
  latitude?: number
  longitude?: number
}

// 预约实体
export interface AppointmentVO {
  id?: number
  appointmentNo: string                    // 预约单号
  
  // 产废企业信息
  producerEnterpriseId: number            // 产废企业ID
  producerEnterpriseName: string          // 产废企业名称
  producerContactName: string             // 联系人姓名
  producerContactPhone: string            // 联系人电话
  
  // 回收企业信息
  recyclerEnterpriseId?: number           // 回收企业ID
  recyclerEnterpriseName?: string         // 回收企业名称
  assignmentType: AssignmentType          // 分配方式
  assignmentTime?: string                 // 分配时间
  assignmentOperator?: string             // 分配操作人
  
  // 废物信息
  wasteCode: string                       // 危险废物代码
  wasteName: string                       // 危险废物名称
  wasteCategory: string                   // 废物类别
  estimatedQuantity: number               // 预估数量
  quantityUnit: string                    // 数量单位
  wasteDescription?: string               // 废物描述
  
  // 地址信息
  pickupAddress: string                   // 取货地址
  pickupLatitude?: number                 // 取货地址纬度
  pickupLongitude?: number                // 取货地址经度
  deliveryAddress?: string                // 送货地址
  deliveryLatitude?: number               // 送货地址纬度
  deliveryLongitude?: number              // 送货地址经度
  
  // 时间信息
  expectedPickupTime: string              // 期望取货时间
  expectedDeliveryTime?: string           // 期望送达时间
  
  // 状态信息
  appointmentStatus: AppointmentStatus    // 预约状态
  confirmTime?: string                    // 确认时间
  rejectTime?: string                     // 拒绝时间
  rejectReason?: string                   // 拒绝原因
  cancelTime?: string                     // 取消时间
  cancelReason?: string                   // 取消原因
  
  // 业务信息
  businessMode: BusinessMode              // 业务模式
  isUrgent: boolean                       // 是否紧急
  priorityLevel: number                   // 优先级
  
  // 关联信息
  orderId?: number                        // 关联订单ID
  contractId?: number                     // 关联合同ID
  
  remark?: string                         // 备注
  createTime?: string                     // 创建时间
  updateTime?: string                     // 更新时间
}

// 分页查询参数
export interface AppointmentPageReqVO extends PageParam {
  appointmentNo?: string                  // 预约单号
  producerEnterpriseName?: string         // 产废企业名称
  recyclerEnterpriseName?: string         // 回收企业名称
  appointmentStatus?: AppointmentStatus   // 预约状态
  isUrgent?: boolean                      // 是否紧急
  wasteCode?: string                      // 废物代码
  createTime?: [string, string]           // 创建时间范围
}

// 创建预约请求
export interface AppointmentCreateReqVO {
  // 产废企业信息
  producerEnterpriseId: number
  producerContactName: string
  producerContactPhone: string
  
  // 废物信息
  wasteCode: string
  wasteName: string
  wasteCategory: string
  estimatedQuantity: number
  quantityUnit: string
  wasteDescription?: string
  
  // 地址信息
  pickupAddress: string
  pickupLatitude?: number
  pickupLongitude?: number
  deliveryAddress?: string
  deliveryLatitude?: number
  deliveryLongitude?: number
  
  // 时间信息
  expectedPickupTime: string
  expectedDeliveryTime?: string
  
  // 业务信息
  businessMode: BusinessMode
  isUrgent: boolean
  priorityLevel: number
  
  // 回收企业信息（用户选择时）
  recyclerEnterpriseId?: number
  
  remark?: string
}

// 更新预约请求
export interface AppointmentUpdateReqVO extends AppointmentCreateReqVO {
  id: number
}

// 分配回收企业请求
export interface AssignRecyclerReqVO {
  appointmentId: number
  recyclerEnterpriseId: number
  assignmentType: AssignmentType
  assignmentReason?: string
}

// APP端分页查询参数
export interface AppAppointmentPageReqVO extends PageParam {
  appointmentNo?: string
  appointmentStatus?: AppointmentStatus
  wasteCode?: string
}

// APP端创建预约请求
export interface AppAppointmentCreateReqVO {
  // 废物信息
  wasteCode: string
  wasteName: string
  wasteCategory: string
  estimatedQuantity: number
  quantityUnit: string
  wasteDescription?: string
  
  // 地址信息
  pickupAddress: string
  pickupLatitude?: number
  pickupLongitude?: number
  
  // 时间信息
  expectedPickupTime: string
  
  // 业务信息
  businessMode: BusinessMode
  isUrgent: boolean
  
  // 回收企业信息（用户选择时）
  recyclerEnterpriseId?: number
  
  remark?: string
}

// 企业选项
export interface EnterpriseOption {
  id: number
  name: string
  contactName?: string
  contactPhone?: string
  address?: string
  businessScope?: string[]
}

// 废物代码选项
export interface WasteCodeOption {
  code: string
  name: string
  category: string
  description?: string
} 