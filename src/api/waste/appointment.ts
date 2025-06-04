/**
 * 危废转移预约模块API接口
 * @author AI Assistant
 * @date 2024-01-01
 */

import request from '@/config/axios'
import type {
  AppointmentVO,
  AppointmentPageReqVO,
  AppointmentCreateReqVO,
  AppointmentUpdateReqVO,
  AssignRecyclerReqVO,
  AppAppointmentPageReqVO,
  AppAppointmentCreateReqVO,
  EnterpriseOption,
  WasteCodeOption
} from '@/types/waste/appointment'

// ================================ 管理后台接口 ================================

/**
 * 分页查询预约列表
 * @param params 查询参数
 */
export const getAppointmentPage = (params: AppointmentPageReqVO) => {
  return request.get({ url: '/waste/transfer/appointment/page', params })
}

/**
 * 根据状态获取预约列表
 * @param status 预约状态
 */
export const getAppointmentListByStatus = (status: number) => {
  return request.get({ url: '/waste/transfer/appointment/list-by-status', params: { status } })
}

/**
 * 根据预约单号获取预约信息
 * @param appointmentNo 预约单号
 */
export const getAppointmentByNo = (appointmentNo: string) => {
  return request.get({ url: '/waste/transfer/appointment/get-by-no', params: { appointmentNo } })
}

/**
 * 获取预约详情
 * @param id 预约ID
 */
export const getAppointment = (id: number) => {
  return request.get({ url: `/waste/transfer/appointment/get?id=${id}` })
}

/**
 * 创建预约
 * @param data 预约数据
 */
export const createAppointment = (data: AppointmentCreateReqVO) => {
  return request.post({ url: '/waste/transfer/appointment/create', data })
}

/**
 * 更新预约
 * @param data 预约数据
 */
export const updateAppointment = (data: AppointmentUpdateReqVO) => {
  return request.put({ url: '/waste/transfer/appointment/update', data })
}

/**
 * 删除预约
 * @param id 预约ID
 */
export const deleteAppointment = (id: number) => {
  return request.delete({ url: `/waste/transfer/appointment/delete?id=${id}` })
}

/**
 * 确认预约
 * @param id 预约ID
 * @param confirmReason 确认原因
 */
export const confirmAppointment = (id: number, confirmReason?: string) => {
  return request.put({ 
    url: '/waste/transfer/appointment/confirm', 
    params: { id, confirmReason } 
  })
}

/**
 * 拒绝预约
 * @param id 预约ID
 * @param rejectReason 拒绝原因
 */
export const rejectAppointment = (id: number, rejectReason: string) => {
  return request.put({ 
    url: '/waste/transfer/appointment/reject', 
    params: { id, rejectReason } 
  })
}

/**
 * 取消预约
 * @param id 预约ID
 * @param cancelReason 取消原因
 */
export const cancelAppointment = (id: number, cancelReason: string) => {
  return request.put({ 
    url: '/waste/transfer/appointment/cancel', 
    params: { id, cancelReason } 
  })
}

/**
 * 分配回收企业
 * @param data 分配数据
 */
export const assignRecyclerEnterprise = (data: AssignRecyclerReqVO) => {
  return request.put({ url: '/waste/transfer/appointment/assign-recycler', data })
}

/**
 * 自动分配回收企业
 * @param id 预约ID
 */
export const autoAssignRecyclerEnterprise = (id: number) => {
  return request.put({ url: `/waste/transfer/appointment/auto-assign-recycler?id=${id}` })
}

/**
 * 生成订单
 * @param id 预约ID
 */
export const generateOrder = (id: number) => {
  return request.post({ url: `/waste/transfer/appointment/generate-order?id=${id}` })
}

/**
 * 导出预约数据
 * @param params 查询参数
 */
export const exportAppointment = (params: AppointmentPageReqVO) => {
  return request.download({ url: '/waste/transfer/appointment/export-excel', params })
}

/**
 * 下载预约导入模板
 */
export const importAppointmentTemplate = () => {
  return request.download({ url: '/waste/transfer/appointment/get-import-template' })
}

// ================================ APP端接口 ================================

/**
 * APP端创建预约
 * @param data 预约数据
 */
export const createAppointmentByApp = (data: AppAppointmentCreateReqVO) => {
  return request.post({ url: '/waste/app/appointment/create', data })
}

/**
 * APP端获取我的预约分页
 * @param params 查询参数
 */
export const getMyAppointmentPage = (params: AppAppointmentPageReqVO) => {
  return request.get({ url: '/waste/app/appointment/page', params })
}

/**
 * APP端获取预约详情
 * @param id 预约ID
 */
export const getMyAppointmentDetail = (id: number) => {
  return request.get({ url: `/waste/app/appointment/get?id=${id}` })
}

/**
 * APP端取消预约
 * @param id 预约ID
 * @param cancelReason 取消原因
 */
export const cancelMyAppointment = (id: number, cancelReason: string) => {
  return request.put({ 
    url: '/waste/app/appointment/cancel', 
    params: { id, cancelReason } 
  })
}

// ================================ 基础数据接口 ================================

/**
 * 获取产废企业列表
 */
export const getProducerEnterpriseList = (): Promise<EnterpriseOption[]> => {
  return request.get({ url: '/waste/enterprise/producer/simple-list' })
}

/**
 * 获取回收企业列表
 */
export const getRecyclerEnterpriseList = (): Promise<EnterpriseOption[]> => {
  return request.get({ url: '/waste/enterprise/recycler/simple-list' })
}

/**
 * 根据废物代码获取回收企业列表
 * @param wasteCode 废物代码
 */
export const getRecyclerEnterpriseByWasteCode = (wasteCode: string): Promise<EnterpriseOption[]> => {
  return request.get({ 
    url: '/waste/enterprise/recycler/by-waste-code', 
    params: { wasteCode } 
  })
}

/**
 * 获取数量单位字典
 */
export const getQuantityUnitOptions = () => {
  return request.get({ url: '/system/dict-data/type/waste_unit' })
}

/**
 * 获取废物类别字典
 */
export const getWasteCategoryOptions = () => {
  return request.get({ url: '/system/dict-data/type/waste_category' })
} 