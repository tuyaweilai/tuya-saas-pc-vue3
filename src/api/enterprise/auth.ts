import request from '@/config/axios'

/**
 * 企业认证状态
 */
export interface EnterpriseAuthStatusVO {
  needAuthGuide: boolean
  enterpriseBindingStatus?: number
  enterpriseBindingMessage?: string
  boundEnterpriseId?: number
  boundEnterpriseName?: string
}

// 我的申请项目 VO
export interface MyApplicationVO {
  id: number
  name: string // 企业名称
  enterpriseType: number // 企业类型
  status: number // 审核状态 (0:待审核, 1:已通过, 2:已拒绝)
  auditRemarks?: string // 审核备注
  createTime: string // 申请时间
  auditTime?: string // 审核时间
}

// 认证项目状态 VO
export interface AuthItemStatusVO {
  personalAuth: {
    status: number // 0:未开始, 1:进行中, 2:已完成, 3:已失败
    message?: string
  }
  enterpriseAuth: {
    status: number
    message?: string
  }
  qualificationAuth: {
    status: number
    message?: string
    requiredQualifications?: string[] // 需要的资质类型
  }
}

/**
 * 获取当前用户的企业认证状态
 */
export function getUserEnterpriseAuthStatus() {
  return request.get<EnterpriseAuthStatusVO>({ url: '/enterprise/auth/status' })
}

/**
 * 企业认证 API
 */
export const EnterpriseAuthApi = {
  // 获取当前用户的企业认证状态
  getAuthStatus: async () => {
    return await request.get({ url: '/enterprise/auth/status' })
  },

  // 检查企业入驻申请状态
  checkSettlementStatus: async () => {
    return await request.get({ url: '/enterprise/auth/settlement-status' })
  },

  // 获取认证项目状态
  getAuthItemStatus: async () => {
    return await request.get({ url: '/enterprise/auth/item-status' })
  },

  // 发起个人实名认证
  initiatePersonalAuth: async () => {
    return await request.post({ url: '/enterprise/auth/personal/initiate-auth' })
  },

  // 发起企业认证
  initiateEnterpriseAuth: async () => {
    return await request.post({ url: '/enterprise/auth/enterprise/initiate-auth' })
  },

  // 重新提交入驻申请
  resubmitApplication: async (applicationId: number) => {
    return await request.post({ url: `/enterprise/auth/resubmit/${applicationId}` })
  }
}