import request from '@/config/axios'

// 个人认证信息 VO
export interface PersonalCertificationVO {
  id?: number
  realName?: string // 真实姓名
  idCardNo?: string // 身份证号
  idCardFrontFileId?: number // 身份证正面照片文件ID
  idCardBackFileId?: number // 身份证反面照片文件ID
  status?: number // 认证状态 (0: 未认证, 1: 认证中, 2: 已认证, 3: 认证失败)
  auditRemark?: string // 审核备注
  submitTime?: string // 提交时间
  auditTime?: string // 审核时间
}

// 企业认证信息 VO
export interface EnterpriseCertificationVO {
  id?: number
  enterpriseId?: number // 企业ID
  businessLicenseFileId?: number // 营业执照文件ID
  organizationCodeFileId?: number // 组织机构代码证文件ID
  taxRegistrationFileId?: number // 税务登记证文件ID
  bankAccountPermitFileId?: number // 银行开户许可证文件ID
  legalPersonIdCardFrontFileId?: number // 法定代表人身份证正面
  legalPersonIdCardBackFileId?: number // 法定代表人身份证反面
  authorizationLetterFileId?: number // 授权委托书文件ID
  status?: number // 认证状态 (0: 未认证, 1: 认证中, 2: 已认证, 3: 认证失败)
  auditRemark?: string // 审核备注
  submitTime?: string // 提交时间
  auditTime?: string // 审核时间
}

// 认证状态概览 VO
export interface CertificationOverviewVO {
  personalCertification: PersonalCertificationVO
  enterpriseCertification: EnterpriseCertificationVO
  canAccessPersonal: boolean // 是否可以进行个人认证
  canAccessEnterprise: boolean // 是否可以进行企业认证
}

// 认证API
export const CertificationApi = {
  // 获取认证状态概览
  getCertificationOverview: async (): Promise<CertificationOverviewVO> => {
    return await request.get({ url: `/admin-api/enterprise/certification/overview` })
  },

  // 获取个人认证信息
  getPersonalCertification: async (): Promise<PersonalCertificationVO> => {
    return await request.get({ url: `/admin-api/enterprise/certification/personal` })
  },

  // 提交个人认证
  submitPersonalCertification: async (data: PersonalCertificationVO) => {
    return await request.post({ url: `/admin-api/enterprise/certification/personal/submit`, data })
  },

  // 获取企业认证信息
  getEnterpriseCertification: async (): Promise<EnterpriseCertificationVO> => {
    return await request.get({ url: `/admin-api/enterprise/certification/enterprise` })
  },

  // 提交企业认证
  submitEnterpriseCertification: async (data: EnterpriseCertificationVO) => {
    return await request.post({ url: `/admin-api/enterprise/certification/enterprise/submit`, data })
  }
} 