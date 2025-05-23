<template>
  <div class="auth-guide-container">
    <el-card class="auth-guide-card">
      <template #header>
        <div class="card-header">
          <h2>企业认证</h2>
          <p class="sub-title">请完善企业信息，认证后即可进入系统</p>
        </div>
      </template>
      <el-form 
        ref="formRef"
        :model="form" 
        :rules="rules"
        label-width="120px" 
        class="auth-form"
      >
        <el-form-item label="企业名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入企业名称" />
        </el-form-item>
        <el-form-item label="统一社会信用代码" prop="creditCode">
          <el-input v-model="form.creditCode" placeholder="请输入统一社会信用代码" />
        </el-form-item>
        <el-form-item label="企业类型" prop="enterpriseType">
          <el-select v-model="form.enterpriseType" placeholder="请选择企业类型">
            <el-option :value="1" label="产废" />
            <el-option :value="2" label="回收" />
            <el-option :value="3" label="处置" />
            <el-option :value="4" label="物流" />
            <el-option :value="99" label="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="法定代表人" prop="legalPersonName">
          <el-input v-model="form.legalPersonName" placeholder="请输入法定代表人姓名" />
        </el-form-item>
        <el-form-item label="法定代表人身份证" prop="legalPersonIdCardNo">
          <el-input v-model="form.legalPersonIdCardNo" placeholder="请输入法定代表人身份证号码" />
        </el-form-item>
        <el-form-item label="注册资本(万元)" prop="registeredCapital">
          <el-input-number v-model="form.registeredCapital" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="成立日期" prop="establishmentDate">
          <el-date-picker v-model="form.establishmentDate" type="date" placeholder="请选择成立日期" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="经营范围" prop="businessScope">
          <el-input v-model="form.businessScope" type="textarea" placeholder="请输入经营范围" />
        </el-form-item>
        <el-form-item label="联系人姓名" prop="contactName">
          <el-input v-model="form.contactName" placeholder="请输入联系人姓名" />
        </el-form-item>
        <el-form-item label="联系人电话" prop="contactPhone">
          <el-input v-model="form.contactPhone" placeholder="请输入联系人电话" />
        </el-form-item>
        <!-- 必填的地址字段 -->
        <el-form-item label="注册地址-省" prop="registeredAddressProvinceCode">
          <el-input v-model="form.registeredAddressProvinceCode" placeholder="请输入省编码" />
        </el-form-item>
        <el-form-item label="注册地址-市" prop="registeredAddressCityCode">
          <el-input v-model="form.registeredAddressCityCode" placeholder="请输入市编码" />
        </el-form-item>
        <el-form-item label="注册地址-区" prop="registeredAddressDistrictCode">
          <el-input v-model="form.registeredAddressDistrictCode" placeholder="请输入区编码" />
        </el-form-item>
        <el-form-item label="注册地址-详细" prop="registeredAddressDetail">
          <el-input v-model="form.registeredAddressDetail" placeholder="请输入详细地址" />
        </el-form-item>
        <!-- 更多表单项可按需扩展 -->
        <el-form-item>
          <el-button type="primary" @click="submitForm" :loading="loading">提交认证</el-button>
          <el-button @click="logout">退出登录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import * as LoginApi from '@/api/login'
import * as authUtil from '@/utils/auth'
import { InfoApi } from '@/api/enterprise/info'
import { useUserStore } from '@/store/modules/user'

defineOptions({ name: 'AuthGuide' })

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const formRef = ref()

// 表单数据，符合 InfoVO 的字段要求
const form = reactive({
  id: undefined as any, // 创建时ID会由后端生成，提交时过滤掉
  name: '',
  creditCode: '',
  enterpriseType: 1, // 默认值
  legalPersonName: '',
  legalPersonIdCardNo: '',
  registeredCapital: 0,
  establishmentDate: '',
  businessScope: '',
  registeredAddressProvinceCode: '',
  registeredAddressCityCode: '',
  registeredAddressDistrictCode: '',
  registeredAddressDetail: '',
  contactName: '',
  contactPhone: '',
  businessLicenseFileId: 0 // 临时设置，实际应该有文件上传
})

// 表单校验规则
const rules = {
  name: [{ required: true, message: '请输入企业名称', trigger: 'blur' }],
  creditCode: [{ required: true, message: '请输入统一社会信用代码', trigger: 'blur' }],
  enterpriseType: [{ required: true, message: '请选择企业类型', trigger: 'change' }],
  legalPersonName: [{ required: true, message: '请输入法定代表人姓名', trigger: 'blur' }],
  legalPersonIdCardNo: [{ required: true, message: '请输入法定代表人身份证号', trigger: 'blur' }],
  registeredAddressProvinceCode: [{ required: true, message: '请输入省编码', trigger: 'blur' }],
  registeredAddressCityCode: [{ required: true, message: '请输入市编码', trigger: 'blur' }],
  registeredAddressDistrictCode: [{ required: true, message: '请输入区编码', trigger: 'blur' }],
  registeredAddressDetail: [{ required: true, message: '请输入详细地址', trigger: 'blur' }],
  contactName: [{ required: true, message: '请输入联系人姓名', trigger: 'blur' }],
  contactPhone: [{ required: true, message: '请输入联系人电话', trigger: 'blur' }]
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    loading.value = true
    try {
      // 创建副本并移除id字段，因为创建时不需要ID
      const submitData = { ...form }
      delete submitData.id
      
      // 提交企业认证信息
      await InfoApi.createInfo(submitData as any)
      ElMessage.success('企业认证提交成功')
      
      // 刷新用户信息 - 使用userStore而不是permissionStore
      try {
        // 使用登录接口重新获取用户信息
        const res = await LoginApi.getInfo()
        
        // 检查用户是否已成功绑定企业
        if (!res.boundEnterpriseId) {
          ElMessage.warning('企业认证未完成，请稍后再试')
          return
        }
        
        // 认证成功，跳转首页
        router.push('/')
      } catch (error) {
        ElMessage.error('获取用户信息失败，请重新登录')
        await logout()
      }
    } catch (error) {
      console.error('企业认证失败:', error)
      ElMessage.error('企业认证失败，请稍后再试')
    } finally {
      loading.value = false
    }
  })
}

// 退出登录
const logout = async () => {
  try {
    await LoginApi.loginOut()
    authUtil.removeToken()
    ElMessage.success('已退出登录')
    router.push('/login')
  } catch (error) {
    console.error('退出登录失败:', error)
    ElMessage.error('退出登录失败，请稍后再试')
  }
}
</script>

<style lang="scss" scoped>
.auth-guide-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 30px 0;
  
  .auth-guide-card {
    width: 600px;
    max-width: 90%;
    
    .card-header {
      text-align: center;
      
      .sub-title {
        color: #909399;
        margin-top: 8px;
      }
    }
    
    .auth-form {
      margin-top: 20px;
    }
  }
}
</style> 