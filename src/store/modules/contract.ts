import { defineStore } from 'pinia'
import { 
  contractApi, 
  contractTypeApi, 
  contractTemplateApi,
  type ContractResp, 
  type ContractType, 
  type ContractTemplate,
  type ContractPageReq 
} from '@/api/contract/contract'

// 合同状态枚举
export const CONTRACT_STATUS = {
  0: { label: '草稿', type: 'info' },
  1: { label: '待审核', type: 'warning' },
  2: { label: '审核通过', type: 'success' },
  3: { label: '待签署', type: 'primary' },
  4: { label: '签署中', type: 'warning' },
  5: { label: '已生效', type: 'success' },
  6: { label: '已履行', type: 'success' },
  7: { label: '即将到期', type: 'warning' },
  8: { label: '已到期', type: 'danger' },
  9: { label: '已解除', type: 'info' },
  10: { label: '已作废', type: 'danger' },
  11: { label: '已归档', type: 'info' }
} as const

// 签署方式枚举
export const SIGNATURE_METHOD = {
  1: '点击确认',
  2: '手写签名',
  3: '电子印章',
  4: '密码验证'
} as const

// 优先级枚举
export const PRIORITY_LEVEL = {
  1: { label: '低', type: 'info' },
  2: { label: '中', type: 'warning' },
  3: { label: '高', type: 'danger' },
  4: { label: '紧急', type: 'danger' }
} as const

interface ContractState {
  contractList: ContractResp[]
  currentContract: ContractResp | null
  contractTypes: ContractType[]
  contractTemplates: ContractTemplate[]
  loading: boolean
  total: number
  queryParams: ContractPageReq
}

export const useContractStore = defineStore('contract', {
  state: (): ContractState => ({
    contractList: [],
    currentContract: null,
    contractTypes: [],
    contractTemplates: [],
    loading: false,
    total: 0,
    queryParams: {
      pageNo: 1,
      pageSize: 10
    }
  }),

  getters: {
    // 获取状态标签信息
    getStatusInfo: () => (status: number) => {
      return CONTRACT_STATUS[status] || { label: '未知', type: 'info' }
    },

    // 获取优先级信息
    getPriorityInfo: () => (level: number) => {
      return PRIORITY_LEVEL[level] || { label: '未知', type: 'info' }
    },

    // 获取签署方式名称
    getSignatureMethodName: () => (method: number) => {
      return SIGNATURE_METHOD[method] || '未知'
    },

    // 统计不同状态的合同数量
    statusStatistics: (state) => {
      const stats = {}
      state.contractList.forEach(contract => {
        const status = contract.status
        stats[status] = (stats[status] || 0) + 1
      })
      return stats
    },

    // 即将到期的合同
    expiringContracts: (state) => {
      const now = new Date()
      const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      
      return state.contractList.filter(contract => {
        if (!contract.expiryDate) return false
        const expiryDate = new Date(contract.expiryDate)
        return expiryDate <= thirtyDaysLater && expiryDate > now
      })
    }
  },

  actions: {
    // 获取合同列表
    async fetchContractList(params?: Partial<ContractPageReq>) {
      this.loading = true
      try {
        const queryParams = { ...this.queryParams, ...params }
        const result = await contractApi.getContractPage(queryParams)
        
        this.contractList = result.list
        this.total = result.total
        this.queryParams = queryParams
        
        return result
      } catch (error) {
        console.error('获取合同列表失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // 获取合同详情
    async fetchContractDetail(id: number) {
      this.loading = true
      try {
        const contract = await contractApi.getContract(id)
        this.currentContract = contract
        return contract
      } catch (error) {
        console.error('获取合同详情失败:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // 创建合同
    async createContract(data: any) {
      try {
        const id = await contractApi.createContract(data)
        // 重新获取列表
        await this.fetchContractList()
        return id
      } catch (error) {
        console.error('创建合同失败:', error)
        throw error
      }
    },

    // 更新合同
    async updateContract(data: any) {
      try {
        await contractApi.updateContract(data)
        // 更新当前合同信息
        if (this.currentContract && this.currentContract.id === data.id) {
          this.currentContract = { ...this.currentContract, ...data }
        }
        // 重新获取列表
        await this.fetchContractList()
      } catch (error) {
        console.error('更新合同失败:', error)
        throw error
      }
    },

    // 删除合同
    async deleteContract(id: number) {
      try {
        await contractApi.deleteContract(id)
        // 从列表中移除
        this.contractList = this.contractList.filter(item => item.id !== id)
        this.total -= 1
        
        // 如果删除的是当前合同，清空当前合同
        if (this.currentContract && this.currentContract.id === id) {
          this.currentContract = null
        }
      } catch (error) {
        console.error('删除合同失败:', error)
        throw error
      }
    },

    // 提交审核
    async submitContract(id: number) {
      try {
        await contractApi.submitContract(id)
        // 更新状态
        this.updateContractStatus(id, 1) // 待审核
      } catch (error) {
        console.error('提交审核失败:', error)
        throw error
      }
    },

    // 审核合同
    async approveContract(id: number, approved: boolean, remark?: string) {
      try {
        await contractApi.approveContract(id, approved, remark)
        // 更新状态
        this.updateContractStatus(id, approved ? 2 : 0) // 审核通过或退回草稿
      } catch (error) {
        console.error('审核合同失败:', error)
        throw error
      }
    },

    // 发起签署
    async initiateSignature(id: number) {
      try {
        await contractApi.initiateSignature(id)
        // 更新状态
        this.updateContractStatus(id, 3) // 待签署
      } catch (error) {
        console.error('发起签署失败:', error)
        throw error
      }
    },

    // 签署合同
    async signContract(data: any) {
      try {
        await contractApi.signContract(data)
        // 更新状态
        this.updateContractStatus(data.contractId, 4) // 签署中
      } catch (error) {
        console.error('签署合同失败:', error)
        throw error
      }
    },

    // 更新合同状态（本地状态更新）
    updateContractStatus(id: number, status: number) {
      // 更新列表中的状态
      const contract = this.contractList.find(item => item.id === id)
      if (contract) {
        contract.status = status
      }
      
      // 更新当前合同状态
      if (this.currentContract && this.currentContract.id === id) {
        this.currentContract.status = status
      }
    },

    // 获取合同类型列表
    async fetchContractTypes() {
      try {
        this.contractTypes = await contractTypeApi.getContractTypeList()
      } catch (error) {
        console.error('获取合同类型失败:', error)
        throw error
      }
    },

    // 获取合同模板列表
    async fetchContractTemplates(typeId?: number) {
      try {
        this.contractTemplates = await contractTemplateApi.getContractTemplateList(typeId)
      } catch (error) {
        console.error('获取合同模板失败:', error)
        throw error
      }
    },

    // 重置查询参数
    resetQueryParams() {
      this.queryParams = {
        pageNo: 1,
        pageSize: 10
      }
    },

    // 清空当前合同
    clearCurrentContract() {
      this.currentContract = null
    },

    // 设置查询参数
    setQueryParams(params: Partial<ContractPageReq>) {
      this.queryParams = { ...this.queryParams, ...params }
    }
  }
}) 