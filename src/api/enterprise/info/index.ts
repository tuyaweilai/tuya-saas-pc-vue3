import request from '@/config/axios'

// 企业信息 VO
export interface InfoVO {
  id: number // 主键ID
  name: string // 企业名称
  creditCode: string // 统一社会信用代码
  enterpriseType: number // 企业类型 (1:产废, 2:回收, 3:处置, 4:物流, 99:其他)
  legalPersonName: string // 法定代表人姓名
  legalPersonIdCardNo: string // 法定代表人身份证号 (脱敏存储或仅用于认证过程)
  registeredCapital: number // 注册资本 (万元)
  establishmentDate: Date // 成立日期
  businessScope: string // 经营范围
  registeredAddressProvinceCode: string // 注册地址-省编码
  registeredAddressCityCode: string // 注册地址-市编码
  registeredAddressDistrictCode: string // 注册地址-区编码
  registeredAddressDetail: string // 注册地址-详细地址
  contactName: string // 企业联系人姓名
  contactPhone: string // 企业联系人电话
  businessLicenseFileId: number // 营业执照附件ID (关联infra_file表)
  status?: number // 企业状态
  createTime?: string // 创建时间
  auditRemark?: string // 审核备注
}

// 我的企业申请 VO
export interface MyApplicationVO {
  id?: number // 申请ID（可能为空，表示还未申请）
  name?: string // 企业名称
  enterpriseType?: number // 企业类型
  status?: number // 审核状态 (0: 待审核, 1: 审核通过, 2: 审核拒绝)
  createTime?: string // 申请时间
  auditTime?: string // 审核时间
  auditRemark?: string // 审核备注/拒绝原因
  creditCode?: string // 统一社会信用代码
  contactName?: string // 联系人姓名
  contactPhone?: string // 联系电话
  hasApplication?: boolean // 是否有申请记录
}

// 企业信息 API
export const InfoApi = {
  // 查询企业信息分页
  getInfoPage: async (params: any) => {
    return await request.get({ url: `/enterprise/info/page`, params })
  },

  // 查询企业信息详情
  getInfo: async (id: number) => {
    return await request.get({ url: `/enterprise/info/get?id=` + id })
  },

  // 新增企业信息
  createInfo: async (data: InfoVO) => {
    return await request.post({ url: `/enterprise/info/create`, data })
  },

  // 修改企业信息
  updateInfo: async (data: InfoVO) => {
    return await request.put({ url: `/enterprise/info/update`, data })
  },

  // 删除企业信息
  deleteInfo: async (id: number) => {
    return await request.delete({ url: `/enterprise/info/delete?id=` + id })
  },

  // 导出企业信息 Excel
  exportInfo: async (params) => {
    return await request.download({ url: `/enterprise/info/export-excel`, params })
  },

  // 获取我的企业入驻申请信息（单个申请）
  getMyApplication: async (): Promise<MyApplicationVO> => {
    return await request.get({ url: `/admin-api/enterprise/info/my-application` })
  },

  // 重新提交企业入驻申请
  resubmitApplication: async (id: number) => {
    return await request.post({ url: `/admin-api/enterprise/info/resubmit/${id}` })
  }
}