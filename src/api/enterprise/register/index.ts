import request from '@/config/axios'

// 企业入驻申请 API
export const RegisterApi = {
  // 提交企业入驻申请
  submitRegister: async (data: any) => {
    return await request.post({ url: '/enterprise/auth/register', data })
  },
  
  // 获取企业入驻状态
  getRegisterStatus: async () => {
    return await request.get({ url: '/enterprise/auth/status' })
  }
} 