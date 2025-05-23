<template>
  <div class="guide-page">
    <div class="guide-container">
      <!-- 页面标题 -->
      <div class="page-title">
        <h2>企业入驻申请</h2>
        <p class="text-gray-500">完成企业入驻审核，开启企业服务</p>
      </div>

      <!-- 步骤条 -->
      <el-steps :active="currentStep" finish-status="success" class="mb-8">
        <el-step title="选择企业类型" description="选择适合您的企业类型" />
        <el-step title="基本信息" description="填写企业基本信息" />
        <el-step title="资质认证" description="上传企业资质" />
        <el-step title="入驻申请" description="等待审核结果" />
      </el-steps>

      <!-- 步骤内容区域 -->
      <div class="step-content">
        <!-- 第一步：选择企业类型 -->
        <div v-if="currentStep === 0">
          <div class="enterprise-type-selection">
            <h3 class="text-center mb-6">请选择您的企业类型</h3>
            <div class="grid grid-cols-3 gap-4">
              <div 
                v-for="(type, index) in enterpriseTypes" 
                :key="index"
                class="enterprise-type-card" 
                :class="{ 'is-active': formData.enterpriseType === type.value }"
                @click="selectEnterpriseType(type.value)"
              >
                <div class="card-icon">
                  <el-icon><component :is="type.icon" /></el-icon>
                </div>
                <div class="card-title">{{ type.label }}</div>
                <div class="card-desc">{{ type.description }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 第二步：企业基本信息 -->
        <div v-if="currentStep === 1">
          <el-form
            ref="formRef"
            :model="formData"
            :rules="formRules"
            label-width="120px"
            class="mt-4"
          >
            <el-form-item label="企业名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入企业名称" />
            </el-form-item>
            <el-form-item label="统一社会信用代码" prop="creditCode">
              <el-input v-model="formData.creditCode" placeholder="请输入统一社会信用代码" />
            </el-form-item>
            <el-form-item label="法定代表人" prop="legalPersonName">
              <el-input v-model="formData.legalPersonName" placeholder="请输入法定代表人姓名" />
            </el-form-item>
            <el-form-item label="法人身份证号" prop="legalPersonIdCardNo">
              <el-input v-model="formData.legalPersonIdCardNo" placeholder="请输入法人身份证号码" />
            </el-form-item>
            <el-form-item label="联系人姓名" prop="contactName">
              <el-input v-model="formData.contactName" placeholder="请输入联系人姓名" />
            </el-form-item>
            <el-form-item label="联系人电话" prop="contactPhone">
              <el-input v-model="formData.contactPhone" placeholder="请输入联系人电话" />
            </el-form-item>
          </el-form>
        </div>

        <!-- 第三步：资质认证 -->
        <div v-if="currentStep === 2">
          <el-form
            ref="qualificationFormRef"
            :model="formData"
            :rules="qualificationRules"
            label-width="120px"
            class="mt-4"
          >
            <el-form-item label="营业执照" prop="businessLicenseFileId">
              <UploadImg v-model="formData.businessLicenseFileId" />
              <div class="text-gray-400 mt-1">请上传清晰的营业执照原件扫描件或照片</div>
            </el-form-item>
            <el-form-item label="其他资质" prop="otherQualifications">
              <UploadImgs v-model="formData.otherQualifications" :limit="5" />
              <div class="text-gray-400 mt-1">可选：上传其他相关资质证书（最多5张）</div>
            </el-form-item>
          </el-form>
        </div>

        <!-- 第四步：完成 -->
        <div v-if="currentStep === 3" class="text-center py-8">
          <el-result
            v-if="submitStatus.success"
            icon="success"
            title="提交成功"
            sub-title="您的企业入驻申请已提交，请耐心等待审核结果"
          >
            <template #extra>
              <el-button type="primary" @click="handleFinish">返回首页</el-button>
            </template>
          </el-result>
          <el-result
            v-else
            icon="error"
            title="提交失败"
            :sub-title="submitStatus.message || '企业入驻申请提交失败，请检查信息后重试'"
          >
            <template #extra>
              <el-button @click="handlePrev">返回修改</el-button>
              <el-button type="primary" @click="retrySubmit">重新提交</el-button>
            </template>
          </el-result>
        </div>

        <!-- 提交失败信息展示 -->
        <div v-if="submitStatus.showError && currentStep !== 3" class="submission-error mt-4">
          <el-alert
            type="error"
            :title="submitStatus.message || '提交失败'"
            :closable="true"
            @close="submitStatus.showError = false"
            show-icon
          />
        </div>

        <!-- 底部按钮 -->
        <div class="flex justify-center mt-8 space-x-4" v-if="currentStep !== 3">
          <el-button v-if="currentStep > 0" @click="handlePrev">上一步</el-button>
          <el-button 
            type="primary" 
            @click="handleNext" 
            :loading="submitStatus.loading"
          >
            {{ currentStep === 2 ? '提交申请' : '下一步' }}
          </el-button>
          <el-button type="text" @click="handleLogout">退出登录</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { RegisterApi } from '@/api/enterprise/register'
import { useRouter } from 'vue-router'
import * as LoginApi from '@/api/login'
import * as authUtil from '@/utils/auth'
import { UploadImg, UploadImgs } from '@/components/UploadFile'

// 类型声明
interface EnterpriseForm {
  name: string
  creditCode: string
  enterpriseType: number | undefined
  legalPersonName: string
  legalPersonIdCardNo: string
  contactName: string
  contactPhone: string
  registeredCapital: number
  establishmentDate: string
  businessScope: string
  registeredAddressProvinceCode: string
  registeredAddressCityCode: string
  registeredAddressDistrictCode: string
  registeredAddressDetail: string
  businessLicenseFileId: string
  otherQualifications: string[]
}

const router = useRouter()
const message = useMessage()

// 步骤
const currentStep = ref(0)

// 企业类型选项
const enterpriseTypes = [
  {
    value: 2,
    label: '回收企业',
    icon: 'Delete',
    description: '主要从事废旧物资回收和初步分类的企业'
  },
  {
    value: 4,
    label: '物流企业',
    icon: 'Van',
    description: '负责废旧物资运输和配送的企业'
  },
  {
    value: 3,
    label: '处置企业',
    icon: 'SetUp',
    description: '专门处理和再利用废旧物资的企业'
  }
]

// 默认表单
const defaultForm: EnterpriseForm = {
  name: '',
  creditCode: '',
  enterpriseType: undefined,
  legalPersonName: '',
  legalPersonIdCardNo: '',
  contactName: '',
  contactPhone: '',
  registeredCapital: 0,
  establishmentDate: '',
  businessScope: '',
  registeredAddressProvinceCode: '',
  registeredAddressCityCode: '',
  registeredAddressDistrictCode: '',
  registeredAddressDetail: '',
  businessLicenseFileId: '',
  otherQualifications: []
}

const formData = ref<EnterpriseForm>({ ...defaultForm })

// 校验规则
const formRef = ref()
const qualificationFormRef = ref()
const formRules = reactive({
  name: [{ required: true, message: '企业名称不能为空', trigger: 'blur' }],
  creditCode: [
    { required: true, message: '统一社会信用代码不能为空', trigger: 'blur' },
    { min: 18, max: 18, message: '统一社会信用代码长度必须为 18 个字符', trigger: 'blur' }
  ],
  enterpriseType: [{ required: true, message: '企业类型不能为空', trigger: 'change' }],
  legalPersonName: [{ required: true, message: '法定代表人姓名不能为空', trigger: 'blur' }],
  legalPersonIdCardNo: [
    { required: true, message: '法人身份证号不能为空', trigger: 'blur' },
    { pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, message: '请输入正确的身份证号码', trigger: 'blur' }
  ],
  contactName: [{ required: true, message: '联系人姓名不能为空', trigger: 'blur' }],
  contactPhone: [
    { required: true, message: '联系人电话不能为空', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
})
const qualificationRules = reactive({
  businessLicenseFileId: [{ required: true, message: '请上传营业执照', trigger: 'change' }]
})

// 提交状态
const submitStatus = ref({
  success: true,
  message: '',
  loading: false,
  showError: false
})

// 步骤校验
const validateStep1 = () => {
  if (!formData.value.enterpriseType) {
    message.warning('企业类型不能为空')
    return false
  }
  return true
}
const validateStep2 = async () => {
  try {
    await formRef.value.validate()
    return true
  } catch {
    message.warning('请完善表单信息')
    return false
  }
}
const validateStep3 = async () => {
  try {
    await qualificationFormRef.value.validate()
    return true
  } catch {
    message.warning('请完善表单信息')
    return false
  }
}

// 步骤切换
const handleNext = async () => {
  if (currentStep.value === 0 && validateStep1()) {
    currentStep.value++
  } else if (currentStep.value === 1 && await validateStep2()) {
    currentStep.value++
  } else if (currentStep.value === 2 && await validateStep3()) {
    await submitCertification()
  }
}
const handlePrev = () => {
  if (currentStep.value > 0) currentStep.value--
}

// 选择企业类型
const selectEnterpriseType = (type: number) => {
  formData.value.enterpriseType = type
}

// 提交企业入驻申请
const submitCertification = async () => {
  submitStatus.value.loading = true
  submitStatus.value.showError = false
  try {
    if (!formData.value.businessLicenseFileId) throw new Error('请上传营业执照')
    // 这里可加更多数据格式化逻辑
    const result = await RegisterApi.submitRegister(formData.value)
    console.log('提交结果:', result)
    
    // 直接判断 result 是否为数字或返回值是否存在（表示提交成功）
    if (result !== undefined && result !== null) {
      submitStatus.value = { success: true, message: '', loading: false, showError: false }
      message.success('企业入驻申请提交成功')
      authUtil.removeEnterpriseBindingStatus()
      currentStep.value++
    } else {
      throw new Error('企业入驻申请提交失败')
    }
  } catch (error: any) {
    submitStatus.value = {
      success: false,
      message: getErrorMessage(error),
      loading: false,
      showError: true
    }
    message.error(submitStatus.value.message)
  } finally {
    submitStatus.value.loading = false
  }
}

// 重试提交
const retrySubmit = async () => {
  submitStatus.value = { success: true, message: '', loading: false, showError: false }
  await submitCertification()
}

// 退出登录
const handleLogout = async () => {
  try {
    await LoginApi.loginOut()
    authUtil.removeToken()
    authUtil.removeEnterpriseBindingStatus()
    window.location.href = '/login'
  } catch (error) {
    console.error('退出登录失败', error)
  }
}

// 完成后返回首页
const handleFinish = () => {
  router.push('/')
}

// 错误信息提取
const getErrorMessage = (error: any): string => {
  let errorMsg = '企业入驻申请提交失败，请重试'
  if (error.message) {
    errorMsg = error.message
  } else if (error.response) {
    const responseData = error.response.data
    if (responseData?.msg) {
      errorMsg = responseData.msg
    } else if (error.response.status === 400) {
      errorMsg = '请求参数错误 (400)：请检查输入信息'
    } else if (error.response.status === 401) {
      errorMsg = '认证失败，无法访问系统资源'
    } else if (error.response.status === 403) {
      errorMsg = '当前操作没有权限'
    } else if (error.response.status === 404) {
      errorMsg = '请求的资源不存在'
    } else if (error.response.status === 500) {
      errorMsg = '服务器内部错误，请联系管理员'
    } else {
      errorMsg = '请求错误：未知错误'
    }
  } else if (error.request) {
    errorMsg = '服务器无响应，请检查网络连接'
  }
  return errorMsg
}
</script>

<style lang="scss" scoped>
.guide-page {
  min-height: 100vh;
  background-color: #f5f7fa;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
}

.guide-container {
  max-width: 800px;
  width: 100%;
  padding: 40px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

  .page-title {
    text-align: center;
    margin-bottom: 40px;

    h2 {
      font-size: 24px;
      color: #303133;
      margin-bottom: 8px;
    }
  }

  .step-content {
    min-height: 400px;
    padding: 20px 0;
  }
}

.enterprise-type-card {
  text-align: center;
  padding: 24px 16px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  }
  
  &.is-active {
    border-color: var(--el-color-primary);
    background-color: rgba(var(--el-color-primary-rgb), 0.1);
  }
  
  .card-icon {
    font-size: 36px;
    color: var(--el-color-primary);
    margin-bottom: 16px;
  }
  
  .card-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 8px;
  }
  
  .card-desc {
    font-size: 12px;
    color: #909399;
    line-height: 1.4;
  }
}
</style> 