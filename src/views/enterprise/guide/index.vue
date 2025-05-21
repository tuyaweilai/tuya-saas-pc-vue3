<template>
  <div class="guide-page">
    <div class="guide-container">
      <!-- 页面标题 -->
      <div class="page-title">
        <h2>企业认证</h2>
        <p class="text-gray-500">完成企业认证，开启企业服务</p>
      </div>

      <!-- 步骤条 -->
      <el-steps :active="currentStep" finish-status="success" class="mb-8">
        <el-step title="企业认证" description="填写企业基本信息" />
        <el-step title="资质认证" description="上传企业资质" />
        <el-step title="完成认证" description="等待审核结果" />
      </el-steps>

      <!-- 步骤内容区域 -->
      <div class="step-content">
        <!-- 第一步：企业基本信息 -->
        <div v-if="currentStep === 0">
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
            <el-form-item label="企业类型" prop="enterpriseType">
              <el-select v-model="formData.enterpriseType" placeholder="请选择企业类型" class="w-full">
                <el-option
                  v-for="dict in getIntDictOptions(DICT_TYPE.ENTERPRISE_TYPE_ENUM)"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="法定代表人" prop="legalPersonName">
              <el-input v-model="formData.legalPersonName" placeholder="请输入法定代表人姓名" />
            </el-form-item>
            <el-form-item label="联系人姓名" prop="contactName">
              <el-input v-model="formData.contactName" placeholder="请输入联系人姓名" />
            </el-form-item>
            <el-form-item label="联系人电话" prop="contactPhone">
              <el-input v-model="formData.contactPhone" placeholder="请输入联系人电话" />
            </el-form-item>
          </el-form>
        </div>

        <!-- 第二步：资质认证 -->
        <div v-if="currentStep === 1">
          <el-form
            ref="qualificationFormRef"
            :model="qualificationForm"
            :rules="qualificationRules"
            label-width="120px"
            class="mt-4"
          >
            <el-form-item label="营业执照" prop="businessLicenseFileId">
              <UploadImg v-model="qualificationForm.businessLicenseFileId" />
              <div class="text-gray-400 mt-1">请上传清晰的营业执照原件扫描件或照片</div>
            </el-form-item>
            <el-form-item label="其他资质" prop="otherQualifications">
              <UploadImg v-model="qualificationForm.otherQualifications" :limit="5" multiple />
              <div class="text-gray-400 mt-1">可选：上传其他相关资质证书（最多5张）</div>
            </el-form-item>
          </el-form>
        </div>

        <!-- 第三步：完成 -->
        <div v-if="currentStep === 2" class="text-center py-8">
          <el-result
            icon="success"
            title="提交成功"
            sub-title="您的企业认证申请已提交，请耐心等待审核结果"
          >
            <template #extra>
              <el-button type="primary" @click="handleFinish">返回首页</el-button>
            </template>
          </el-result>
        </div>

        <!-- 底部按钮 -->
        <div class="flex justify-center mt-6 space-x-4" v-if="currentStep !== 2">
          <el-button v-if="currentStep > 0" @click="handlePrev">上一步</el-button>
          <el-button type="primary" @click="handleNext">{{ currentStep === 1 ? '提交认证' : '下一步' }}</el-button>
          <el-button type="text" @click="handleLogout">退出登录</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { InfoApi } from '@/api/enterprise/info'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import * as LoginApi from '@/api/login'
import * as authUtil from '@/utils/auth'

defineOptions({ name: 'EnterpriseGuide' })

const message = useMessage()
const router = useRouter()
const userStore = useUserStore()

// 当前步骤
const currentStep = ref(0)

// 企业基本信息表单
const formRef = ref()
const formData = ref({
  name: '',
  creditCode: '',
  enterpriseType: undefined,
  legalPersonName: '',
  contactName: '',
  contactPhone: '',
  // 添加必要的字段
  legalPersonIdCardNo: '',
  registeredCapital: '',
  establishmentDate: '',
  businessScope: '',
  registeredAddressDetail: ''
})

// 表单校验规则
const formRules = reactive({
  name: [{ required: true, message: '企业名称不能为空', trigger: 'blur' }],
  creditCode: [{ required: true, message: '统一社会信用代码不能为空', trigger: 'blur' }],
  enterpriseType: [{ required: true, message: '企业类型不能为空', trigger: 'change' }],
  legalPersonName: [{ required: true, message: '法定代表人姓名不能为空', trigger: 'blur' }],
  contactName: [{ required: true, message: '联系人姓名不能为空', trigger: 'blur' }],
  contactPhone: [
    { required: true, message: '联系人电话不能为空', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
})

// 资质认证表单
const qualificationFormRef = ref()
const qualificationForm = ref({
  businessLicenseFileId: undefined,
  otherQualifications: [] as string[]
})

// 资质表单校验规则
const qualificationRules = reactive({
  businessLicenseFileId: [{ required: true, message: '请上传营业执照', trigger: 'change' }]
})

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

// 处理下一步
const handleNext = async () => {
  if (currentStep.value === 0) {
    // 验证第一步表单
    await formRef.value.validate()
    currentStep.value++
  } else if (currentStep.value === 1) {
    // 验证第二步表单
    await qualificationFormRef.value.validate()
    // 提交认证信息
    try {
      await submitCertification()
      currentStep.value++
    } catch (error) {
      console.error('提交认证失败', error)
      message.error('提交认证失败，请重试')
    }
  }
}

// 处理上一步
const handlePrev = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

// 提交认证信息
const submitCertification = async () => {
  const data = {
    ...formData.value,
    businessLicenseFileId: qualificationForm.value.businessLicenseFileId,
    otherQualifications: qualificationForm.value.otherQualifications
  }
  await InfoApi.createInfo(data)
  message.success('提交成功')
}

// 完成认证
const handleFinish = () => {
  router.push('/')
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
</style> 