<template>
  <div class="guide-page">
    <div class="guide-container">
      <!-- 页面标题 -->
      <div class="page-title">
        <h2>企业入驻</h2>
        <p class="text-gray-500">完成企业入驻，开启企业服务</p>
      </div>

      <!-- 步骤条 -->
      <el-steps :active="currentStep" finish-status="success" class="mb-8">
        <el-step title="选择企业类型" description="选择您的企业类型" />
        <el-step title="填写企业详细" description="完善企业基本信息" />
        <el-step title="上传营业执照" description="上传企业资质文件" />
        <el-step title="完成入驻" description="等待审核结果" />
      </el-steps>

      <!-- 步骤内容区域 -->
      <div class="step-content">
        <!-- 第一步：企业类型选择 -->
        <div v-if="currentStep === 0" class="enterprise-type-selection">
          <h3 class="step-title">请选择您的企业类型</h3>
          <div class="type-cards">
            <div 
              v-for="type in enterpriseTypes" 
              :key="type.value"
              class="type-card"
              :class="{ active: formData.enterpriseType === type.value }"
              @click="selectEnterpriseType(type.value)"
            >
              <div class="card-icon">
                <Icon :icon="type.icon" :size="48" />
              </div>
              <h4>{{ type.label }}</h4>
              <p>{{ type.description }}</p>
            </div>
          </div>
        </div>

        <!-- 第二步：企业详细信息 -->
        <div v-if="currentStep === 1">
          <h3 class="step-title">填写企业详细信息</h3>
          <el-form
            ref="formRef"
            :model="formData"
            :rules="formRules"
            label-width="120px"
            class="mt-4"
          >
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="企业名称" prop="name">
                  <el-input v-model="formData.name" placeholder="请输入企业名称" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="统一社会信用代码" prop="creditCode">
                  <el-input v-model="formData.creditCode" placeholder="请输入统一社会信用代码" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="法定代表人" prop="legalPersonName">
                  <el-input v-model="formData.legalPersonName" placeholder="请输入法定代表人姓名" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="法人身份证号" prop="legalPersonIdCardNo">
                  <el-input v-model="formData.legalPersonIdCardNo" placeholder="请输入法人身份证号" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="注册资本(万元)" prop="registeredCapital">
                  <el-input-number 
                    v-model="formData.registeredCapital" 
                    placeholder="请输入注册资本"
                    :min="0"
                    :precision="2"
                    class="w-full"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="成立日期" prop="establishmentDate">
                  <el-date-picker
                    v-model="formData.establishmentDate"
                    type="date"
                    placeholder="请选择成立日期"
                    value-format="YYYY-MM-DD"
                    class="w-full"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="经营范围" prop="businessScope">
              <el-input 
                v-model="formData.businessScope" 
                type="textarea" 
                placeholder="请输入企业经营范围"
                :rows="3"
              />
            </el-form-item>
            <el-form-item label="注册地址" prop="registeredAddressDetail">
              <el-input 
                v-model="formData.registeredAddressDetail" 
                placeholder="请输入企业注册地址详细信息"
              />
            </el-form-item>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="联系人姓名" prop="contactName">
                  <el-input v-model="formData.contactName" placeholder="请输入联系人姓名" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="联系人电话" prop="contactPhone">
                  <el-input v-model="formData.contactPhone" placeholder="请输入联系人电话" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>

        <!-- 第三步：上传营业执照 -->
        <div v-if="currentStep === 2">
          <h3 class="step-title">上传营业执照</h3>
          <el-form
            ref="qualificationFormRef"
            :model="qualificationForm"
            :rules="qualificationRules"
            label-width="120px"
            class="mt-4"
          >
            <el-form-item label="营业执照" prop="businessLicenseFileId">
              <UploadImg v-model="qualificationForm.businessLicenseFileId" />
              <div class="text-gray-400 mt-2">
                <el-icon><InfoFilled /></el-icon>
                请上传清晰的营业执照原件扫描件或照片，支持 JPG、PNG 格式，文件大小不超过 5MB
              </div>
            </el-form-item>
            <el-form-item label="其他资质" prop="otherQualifications">
              <UploadImg v-model="qualificationForm.otherQualifications" :limit="5" multiple />
              <div class="text-gray-400 mt-2">
                <el-icon><InfoFilled /></el-icon>
                可选：上传其他相关资质证书（最多5张）
              </div>
            </el-form-item>
          </el-form>
        </div>

        <!-- 第四步：完成 -->
        <div v-if="currentStep === 3" class="text-center py-8">
          <el-result
            icon="success"
            title="提交成功"
            sub-title="您的企业入驻申请已提交，我们将在1-3个工作日内完成审核"
          >
            <template #extra>
              <div class="space-y-3">
                <div class="text-gray-600">
                  审核期间如有疑问，请联系客服：400-123-4567
                </div>
                <el-button type="primary" @click="handleFinish">返回首页</el-button>
              </div>
            </template>
          </el-result>
        </div>

        <!-- 底部按钮 -->
        <div class="flex justify-center mt-8 space-x-4" v-if="currentStep < 3">
          <el-button v-if="currentStep > 0" @click="handlePrev">上一步</el-button>
          <el-button 
            type="primary" 
            @click="handleNext"
            :loading="submitLoading"
          >
            {{ currentStep === 2 ? '提交入驻申请' : '下一步' }}
          </el-button>
          <el-button type="text" @click="handleLogout">退出登录</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { InfoApi, type EnterpriseSettlementVO } from '@/api/enterprise/info'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import * as LoginApi from '@/api/login'
import * as authUtil from '@/utils/auth'
import { InfoFilled } from '@element-plus/icons-vue'
import { useMessage } from '@/hooks/web/useMessage'

defineOptions({ name: 'EnterpriseGuide' })

const message = useMessage()
const router = useRouter()
const userStore = useUserStore()

// 当前步骤
const currentStep = ref(0)
const submitLoading = ref(false)

// 企业类型选项
const enterpriseTypes = [
  {
    value: 2,
    label: '回收企业',
    description: '从事废料回收、分类、处理的企业',
    icon: 'ep:refresh'
  },
  {
    value: 4,
    label: '物流企业',
    description: '提供运输、仓储、配送等物流服务的企业',
    icon: 'ep:truck'
  },
  {
    value: 3,
    label: '处置企业',
    description: '专业从事废料处置、处理的企业',
    icon: 'ep:delete'
  }
]

// 企业基本信息表单
const formRef = ref()
const formData = ref({
  name: '',
  creditCode: '',
  enterpriseType: undefined as number | undefined,
  legalPersonName: '',
  legalPersonIdCardNo: '',
  registeredCapital: undefined as number | undefined,
  establishmentDate: '',
  businessScope: '',
  registeredAddressDetail: '',
  contactName: '',
  contactPhone: ''
})

// 表单校验规则
const formRules = reactive({
  name: [{ required: true, message: '企业名称不能为空', trigger: 'blur' }],
  creditCode: [
    { required: true, message: '统一社会信用代码不能为空', trigger: 'blur' },
    { pattern: /^[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$/, message: '请输入正确的统一社会信用代码', trigger: 'blur' }
  ],
  legalPersonName: [{ required: true, message: '法定代表人姓名不能为空', trigger: 'blur' }],
  legalPersonIdCardNo: [
    { required: true, message: '法人身份证号不能为空', trigger: 'blur' },
    { pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, message: '请输入正确的身份证号', trigger: 'blur' }
  ],
  registeredCapital: [{ required: true, message: '注册资本不能为空', trigger: 'blur' }],
  establishmentDate: [{ required: true, message: '成立日期不能为空', trigger: 'change' }],
  businessScope: [{ required: true, message: '经营范围不能为空', trigger: 'blur' }],
  registeredAddressDetail: [{ required: true, message: '注册地址不能为空', trigger: 'blur' }],
  contactName: [{ required: true, message: '联系人姓名不能为空', trigger: 'blur' }],
  contactPhone: [
    { required: true, message: '联系人电话不能为空', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
})

// 资质认证表单
const qualificationFormRef = ref()
const qualificationForm = ref({
  businessLicenseFileId: undefined as string | undefined,
  otherQualifications: undefined as string[] | undefined
})

// 资质表单校验规则
const qualificationRules = reactive({
  businessLicenseFileId: [{ required: true, message: '请上传营业执照', trigger: 'change' }]
})

// 选择企业类型
const selectEnterpriseType = (typeValue: number) => {
  formData.value.enterpriseType = typeValue
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

// 处理下一步
const handleNext = async () => {
  if (currentStep.value === 0) {
    // 验证企业类型选择
    if (!formData.value.enterpriseType) {
      message.error('请选择企业类型')
      return
    }
    currentStep.value++
  } else if (currentStep.value === 1) {
    // 验证第二步表单
    await formRef.value.validate()
    currentStep.value++
  } else if (currentStep.value === 2) {
    // 验证第三步表单
    await qualificationFormRef.value.validate()
    // 提交入驻申请
    try {
      submitLoading.value = true
      await submitApplication()
      currentStep.value++
      // 清除企业绑定状态，因为已经完成入驻申请
      authUtil.removeEnterpriseBindingStatus()
    } catch (error) {
      console.error('提交入驻申请失败', error)
      message.error('提交入驻申请失败，请重试')
    } finally {
      submitLoading.value = false
    }
  }
}

// 处理上一步
const handlePrev = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

// 提交入驻申请
const submitApplication = async () => {
  const data: EnterpriseSettlementVO = {
    name: formData.value.name,
    creditCode: formData.value.creditCode,
    enterpriseType: formData.value.enterpriseType!,
    legalPersonName: formData.value.legalPersonName,
    legalPersonIdCardNo: formData.value.legalPersonIdCardNo,
    registeredCapital: Number(formData.value.registeredCapital),
    establishmentDate: formData.value.establishmentDate,
    businessScope: formData.value.businessScope,
    registeredAddressDetail: formData.value.registeredAddressDetail,
    contactName: formData.value.contactName,
    contactPhone: formData.value.contactPhone,
    businessLicenseFileId: qualificationForm.value.businessLicenseFileId!
  }
  
  await InfoApi.submitSettlement(data)
  message.success('企业入驻申请提交成功')
}

// 完成入驻
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
  max-width: 900px;
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

    .step-title {
      font-size: 18px;
      color: #303133;
      margin-bottom: 24px;
      text-align: center;
    }
  }
}

// 企业类型选择样式
.enterprise-type-selection {
  .type-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-top: 30px;

    .type-card {
      border: 2px solid #e4e7ed;
      border-radius: 8px;
      padding: 30px 20px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      background-color: #fff;

      &:hover {
        border-color: #409eff;
        box-shadow: 0 4px 12px rgba(64, 158, 255, 0.1);
      }

      &.active {
        border-color: #409eff;
        background-color: #f0f8ff;
        box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);

        .card-icon {
          color: #409eff;
        }

        h4 {
          color: #409eff;
        }
      }

      .card-icon {
        color: #909399;
        margin-bottom: 16px;
        transition: color 0.3s ease;
      }

      h4 {
        font-size: 16px;
        color: #303133;
        margin-bottom: 8px;
        transition: color 0.3s ease;
      }

      p {
        font-size: 14px;
        color: #606266;
        line-height: 1.4;
        margin: 0;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .guide-container {
    margin: 20px;
    padding: 20px;
  }

  .enterprise-type-selection .type-cards {
    grid-template-columns: 1fr;
  }
}
</style> 