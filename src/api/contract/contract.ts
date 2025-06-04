import request from '@/config/axios'

// 合同响应数据类型
export interface ContractResp {
  id: number
  contractNo: string
  contractUuid: string
  contractName: string
  contractTypeId: number
  typeName?: string
  status: number
  statusName?: string
  isElectronic: boolean
  primaryOwnerEnterpriseId: number
  totalAmount?: number
  currency: string
  priorityLevel: number
  remark?: string
  createTime: string
  updateTime: string
  effectiveDate?: string
  expiryDate?: string
  templateId?: number
  content?: string
}

// 合同创建请求数据类型
export interface ContractCreateReq {
  contractName: string
  contractTypeId: number
  templateId?: number
  primaryOwnerEnterpriseId: number
  totalAmount?: number
  currency?: string
  priorityLevel?: number
  remark?: string
  effectiveDate?: string
  expiryDate?: string
  content?: string
  isElectronic?: boolean
}

// 合同更新请求数据类型
export interface ContractUpdateReq extends ContractCreateReq {
  id: number
}

// 合同分页查询请求
export interface ContractPageReq {
  pageNo?: number
  pageSize?: number
  contractName?: string
  contractNo?: string
  status?: number
  contractTypeId?: number
  primaryOwnerEnterpriseId?: number
  createTime?: string[]
}

// 合同签署请求
export interface ContractSignReq {
  contractId: number
  partyId: number
  signatureMethod: number
  signatoryName: string
  signPassword?: string
  signatureData?: string
}

// 合同类型
export interface ContractType {
  id: number
  name: string
  code: string
  description?: string
  status: number
}

// 合同模板
export interface ContractTemplate {
  id: number
  name: string
  typeId: number
  content: string
  status: number
}

// 合同参与方
export interface ContractParty {
  id: number
  contractId: number
  enterpriseId: number
  enterpriseName: string
  partyType: number
  signStatus: number
  signTime?: string
  signatoryName?: string
}

// 分页结果
export interface PageResult<T> {
  list: T[]
  total: number
}

// 合同管理API
export const contractApi = {
  // 基础CRUD操作
  createContract: (data: ContractCreateReq): Promise<number> => {
    return request.post({ url: '/contract/contract/create', data })
  },

  updateContract: (data: ContractUpdateReq): Promise<boolean> => {
    return request.put({ url: '/contract/contract/update', data })
  },

  deleteContract: (id: number): Promise<boolean> => {
    return request.delete({ url: `/contract/contract/delete?id=${id}` })
  },

  getContract: (id: number): Promise<ContractResp> => {
    return request.get({ url: `/contract/contract/get?id=${id}` })
  },

  getContractPage: (params: ContractPageReq): Promise<PageResult<ContractResp>> => {
    return request.get({ url: '/contract/contract/page', params })
  },

  // 业务流程操作
  submitContract: (id: number): Promise<boolean> => {
    return request.put({ url: `/contract/contract/submit?id=${id}` })
  },

  approveContract: (id: number, approved: boolean, remark?: string): Promise<boolean> => {
    return request.put({ 
      url: `/contract/contract/approve`, 
      data: { id, approved, remark } 
    })
  },

  initiateSignature: (id: number): Promise<boolean> => {
    return request.put({ url: `/contract/contract/initiate-signature?id=${id}` })
  },

  signContract: (data: ContractSignReq): Promise<boolean> => {
    return request.post({ url: '/contract/contract/sign', data })
  },

  // 查询接口
  getContractByNo: (contractNo: string): Promise<ContractResp> => {
    return request.get({ url: `/contract/contract/get-by-no?contractNo=${contractNo}` })
  },

  getExpiringContracts: (days: number): Promise<ContractResp[]> => {
    return request.get({ url: `/contract/contract/expiring?days=${days}` })
  },

  // 导出功能
  exportContract: (params: ContractPageReq): Promise<void> => {
    return request.download({ url: '/contract/contract/export', params })
  },

  // 获取合同统计数据
  getContractStatistics: (): Promise<any> => {
    return request.get({ url: '/contract/contract/statistics' })
  }
}

// 合同类型API
export const contractTypeApi = {
  getContractTypePage: (params: any): Promise<PageResult<ContractType>> => {
    return request.get({ url: '/contract/type/page', params })
  },

  getContractTypeList: (): Promise<ContractType[]> => {
    return request.get({ url: '/contract/type/list' })
  },

  createContractType: (data: Partial<ContractType>): Promise<number> => {
    return request.post({ url: '/contract/type/create', data })
  },

  updateContractType: (data: ContractType): Promise<boolean> => {
    return request.put({ url: '/contract/type/update', data })
  },

  deleteContractType: (id: number): Promise<boolean> => {
    return request.delete({ url: `/contract/type/delete?id=${id}` })
  }
}

// 合同模板API
export const contractTemplateApi = {
  getContractTemplatePage: (params: any): Promise<PageResult<ContractTemplate>> => {
    return request.get({ url: '/contract/template/page', params })
  },

  getContractTemplateList: (typeId?: number): Promise<ContractTemplate[]> => {
    return request.get({ url: '/contract/template/list', params: { typeId } })
  },

  createContractTemplate: (data: Partial<ContractTemplate>): Promise<number> => {
    return request.post({ url: '/contract/template/create', data })
  },

  updateContractTemplate: (data: ContractTemplate): Promise<boolean> => {
    return request.put({ url: '/contract/template/update', data })
  },

  deleteContractTemplate: (id: number): Promise<boolean> => {
    return request.delete({ url: `/contract/template/delete?id=${id}` })
  }
}

// 合同参与方API
export const contractPartyApi = {
  getContractParties: (contractId: number): Promise<ContractParty[]> => {
    return request.get({ url: `/contract/party/list?contractId=${contractId}` })
  },

  addContractParty: (data: Partial<ContractParty>): Promise<number> => {
    return request.post({ url: '/contract/party/create', data })
  },

  removeContractParty: (id: number): Promise<boolean> => {
    return request.delete({ url: `/contract/party/delete?id=${id}` })
  }
} 