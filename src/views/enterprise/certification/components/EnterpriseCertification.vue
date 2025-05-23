<template>
  <div class="enterprise-certification">
    <el-card class="certification-card" v-if="certification.status !== 2">
      <template #header>
        <div class="card-header">
          <Icon icon="ep:office-building" class="header-icon" />
          <span class="header-title">企业资质认证</span>
          <el-tag 
            :type="getStatusType()" 
            size="small" 
            class="header-tag"
          >
            {{ getStatusLabel() }}
          </el-tag>
        </div>
      </template>

      <!-- 审核失败提示 -->
      <el-alert
        v-if="certification.status === 3"
        type="error"
        show-icon
        :closable="false"
        class="mb-4"
      >
        <template #title>
          <div class="alert-content">
            <div class="alert-title">认证审核未通过</div>
            <div class="alert-desc">{{ certification.auditRemark || '请重新提交认证资料' }}</div>
          </div>
        </template>
      </el-alert>

      <!-- 审核中提示 -->
      <el-alert
        v-if="certification.status === 1"
        type="warning"
        show-icon
        :closable="false"
        class="mb-4"
      >
        <template #title>
          <div class="alert-content">
            <div class="alert-title">认证审核中</div>
            <div class="alert-desc">您的企业认证正在审核中，请耐心等待审核结果</div>
          </div>
        </template>
      </el-alert>

      <!-- 认证说明 -->
      <div class="certification-notice">
        <Icon icon="ep:info-filled" class="notice-icon" />
        <div class="notice-content">
          <h4 class="notice-title">企业认证说明</h4>
          <p class="notice-desc">企业认证用于验证您的企业资质和经营合法性，通过认证后可享受更多专业服务。</p>
        </div>
      </div>

      <!-- 认证表单 -->
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="140px"
        v-loading="submitLoading"
        :disabled="certification.status === 1"
        class="certification-form"
      >
        <!-- 基础证件 -->
        <div class="form-section">
          <h3 class="section-title">
            <Icon icon="ep:document" class="section-icon" />
            基础证件材料
          </h3>
          
          <el-form-item label="营业执照" prop="businessLicenseFileId">
            <div class="upload-section">
              <UploadFile
                v-model="form.businessLicenseFileId"
                :limit="1"
                :file-type="['png', 'jpg', 'jpeg', 'pdf']"
                :file-size="10"
                class="cert-upload"
              />
              <div class="upload-tips">
                <div class="tip-title">上传要求：</div>
                <ul class="tip-list">
                  <li>营业执照正本或副本扫描件</li>
                  <li>支持 PNG、JPG、JPEG、PDF 格式</li>
                  <li>文件大小不超过 10MB</li>
                  <li>证件信息清晰可见</li>
                </ul>
              </div>
            </div>
          </el-form-item>

          <el-form-item label="组织机构代码证" prop="organizationCodeFileId">
            <div class="upload-section">
              <UploadFile
                v-model="form.organizationCodeFileId"
                :limit="1"
                :file-type="['png', 'jpg', 'jpeg', 'pdf']"
                :file-size="10"
                class="cert-upload"
              />
              <div class="upload-tips">
                <div class="tip-title">上传要求：</div>
                <ul class="tip-list">
                  <li>组织机构代码证扫描件</li>
                  <li>支持 PNG、JPG、JPEG、PDF 格式</li>
                  <li>文件大小不超过 10MB</li>
                  <li>如已办理三证合一，可不上传</li>
                </ul>
              </div>
            </div>
          </el-form-item>
        </div>

        <!-- 税务财务证件 -->
        <div class="form-section">
          <h3 class="section-title">
            <Icon icon="ep:money" class="section-icon" />
            税务财务证件
          </h3>
          
          <el-form-item label="税务登记证" prop="taxRegistrationFileId">
            <div class="upload-section">
              <UploadFile
                v-model="form.taxRegistrationFileId"
                :limit="1"
                :file-type="['png', 'jpg', 'jpeg', 'pdf']"
                :file-size="10"
                class="cert-upload"
              />
              <div class="upload-tips">
                <div class="tip-title">上传要求：</div>
                <ul class="tip-list">
                  <li>税务登记证扫描件</li>
                  <li>支持 PNG、JPG、JPEG、PDF 格式</li>
                  <li>文件大小不超过 10MB</li>
                  <li>如已办理三证合一，可不上传</li>
                </ul>
              </div>
            </div>
          </el-form-item>

          <el-form-item label="银行开户许可证" prop="bankAccountPermitFileId">
            <div class="upload-section">
              <UploadFile
                v-model="form.bankAccountPermitFileId"
                :limit="1"
                :file-type="['png', 'jpg', 'jpeg', 'pdf']"
                :file-size="10"
                class="cert-upload"
              />
              <div class="upload-tips">
                <div class="tip-title">上传要求：</div>
                <ul class="tip-list">
                  <li>银行开户许可证扫描件</li>
                  <li>支持 PNG、JPG、JPEG、PDF 格式</li>
                  <li>文件大小不超过 10MB</li>
                  <li>确保账户信息清晰</li>
                </ul>
              </div>
            </div>
          </el-form-item>
        </div>

        <!-- 法定代表人证件 -->
        <div class="form-section">
          <h3 class="section-title">
            <Icon icon="ep:user-filled" class="section-icon" />
            法定代表人证件
          </h3>
          
          <el-form-item label="法人身份证正面" prop="legalPersonIdCardFrontFileId">
            <div class="upload-section">
              <UploadFile
                v-model="form.legalPersonIdCardFrontFileId"
                :limit="1"
                :file-type="['png', 'jpg', 'jpeg']"
                :file-size="5"
                class="cert-upload"
              />
              <div class="upload-tips">
                <div class="tip-title">上传要求：</div>
                <ul class="tip-list">
                  <li>法定代表人身份证正面照片</li>
                  <li>支持 PNG、JPG、JPEG 格式</li>
                  <li>文件大小不超过 5MB</li>
                  <li>照片清晰，四角完整</li>
                </ul>
              </div>
            </div>
          </el-form-item>

          <el-form-item label="法人身份证反面" prop="legalPersonIdCardBackFileId">
            <div class="upload-section">
              <UploadFile
                v-model="form.legalPersonIdCardBackFileId"
                :limit="1"
                :file-type="['png', 'jpg', 'jpeg']"
                :file-size="5"
                class="cert-upload"
              />
              <div class="upload-tips">
                <div class="tip-title">上传要求：</div>
                <ul class="tip-list">
                  <li>法定代表人身份证反面照片</li>
                  <li>支持 PNG、JPG、JPEG 格式</li>
                  <li>文件大小不超过 5MB</li>
                  <li>照片清晰，四角完整</li>
                </ul>
              </div>
            </div>
          </el-form-item>
        </div>

        <!-- 授权委托 -->
        <div class="form-section">
          <h3 class="section-title">
            <Icon icon="ep:document-checked" class="section-icon" />
            授权委托书（可选）
          </h3>
          
          <el-form-item label="授权委托书" prop="authorizationLetterFileId">
            <div class="upload-section">
              <UploadFile
                v-model="form.authorizationLetterFileId"
                :limit="1"
                :file-type="['png', 'jpg', 'jpeg', 'pdf']"
                :file-size="10"
                class="cert-upload"
              />
              <div class="upload-tips">
                <div class="tip-title">上传说明：</div>
                <ul class="tip-list">
                  <li>如非法定代表人本人申请，需上传授权委托书</li>
                  <li>支持 PNG、JPG、JPEG、PDF 格式</li>
                  <li>文件大小不超过 10MB</li>
                  <li>需包含授权人和被授权人信息及签章</li>
                </ul>
              </div>
            </div>
          </el-form-item>
        </div>

        <el-form-item>
          <el-button 
            type="primary" 
            @click="handleSubmit"
            :loading="submitLoading"
            size="large"
            v-if="certification.status !== 1"
          >
            <Icon icon="ep:check" class="mr-1" />
            {{ certification.status === 3 ? '重新提交认证' : '提交认证' }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 认证成功状态 -->
    <el-card class="certification-card success-card" v-if="certification.status === 2">
      <div class="success-content">
        <div class="success-icon">
          <Icon icon="ep:circle-check-filled" class="icon-large success" />
        </div>
        <div class="success-info">
          <h3 class="success-title">企业认证已完成</h3>
          <p class="success-desc">恭喜！您的企业资质认证已通过审核</p>
          <div class="success-details">
            <div class="detail-item">
              <span class="detail-label">认证时间：</span>
              <span class="detail-value">{{ formatDateSafe(certification.auditTime) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">认证状态：</span>
              <el-tag type="success" size="small">已认证</el-tag>
            </div>
          </div>
          <div class="success-actions">
            <el-button type="primary" @click="handleDownloadCert">
              <Icon icon="ep:download" class="mr-1" />
              下载认证证书
            </el-button>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import { CertificationApi, EnterpriseCertificationVO } from '@/api/enterprise/certification'
import { formatDate } from '@/utils/formatTime'

interface Props {
  certification: EnterpriseCertificationVO
}

const props = defineProps<Props>()
const emit = defineEmits<{
  refresh: []
}>()

const formRef = ref<FormInstance>()
const submitLoading = ref(false)

// 表单数据
const form = reactive({
  businessLicenseFileId: undefined as number | undefined,
  organizationCodeFileId: undefined as number | undefined,
  taxRegistrationFileId: undefined as number | undefined,
  bankAccountPermitFileId: undefined as number | undefined,
  legalPersonIdCardFrontFileId: undefined as number | undefined,
  legalPersonIdCardBackFileId: undefined as number | undefined,
  authorizationLetterFileId: undefined as number | undefined
})

// 表单验证规则
const rules: FormRules = {
  businessLicenseFileId: [
    { required: true, message: '请上传营业执照', trigger: 'change' }
  ],
  legalPersonIdCardFrontFileId: [
    { required: true, message: '请上传法定代表人身份证正面', trigger: 'change' }
  ],
  legalPersonIdCardBackFileId: [
    { required: true, message: '请上传法定代表人身份证反面', trigger: 'change' }
  ]
}

// 监听认证信息变化，更新表单
watch(
  () => props.certification,
  (newVal) => {
    if (newVal && (newVal.status === 0 || newVal.status === 3)) {
      form.businessLicenseFileId = newVal.businessLicenseFileId
      form.organizationCodeFileId = newVal.organizationCodeFileId
      form.taxRegistrationFileId = newVal.taxRegistrationFileId
      form.bankAccountPermitFileId = newVal.bankAccountPermitFileId
      form.legalPersonIdCardFrontFileId = newVal.legalPersonIdCardFrontFileId
      form.legalPersonIdCardBackFileId = newVal.legalPersonIdCardBackFileId
      form.authorizationLetterFileId = newVal.authorizationLetterFileId
    }
  },
  { immediate: true }
)

// 提交认证
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitLoading.value = true
    
    await CertificationApi.submitEnterpriseCertification(form)
    ElMessage.success('企业认证提交成功，请等待审核')
    emit('refresh')
  } catch (error) {
    console.error('提交企业认证失败:', error)
    if (error !== 'validation failed') {
      ElMessage.error('提交失败，请重试')
    }
  } finally {
    submitLoading.value = false
  }
}

// 下载认证证书
const handleDownloadCert = () => {
  ElMessage.info('认证证书下载功能开发中')
}

// 获取状态类型
const getStatusType = (): string => {
  switch (props.certification.status) {
    case 0: return 'info'
    case 1: return 'warning'
    case 2: return 'success'
    case 3: return 'danger'
    default: return 'info'
  }
}

// 获取状态标签
const getStatusLabel = (): string => {
  switch (props.certification.status) {
    case 0: return '未认证'
    case 1: return '认证中'
    case 2: return '已认证'
    case 3: return '认证失败'
    default: return '未认证'
  }
}

// 格式化日期
const formatDateSafe = (dateStr?: string): string => {
  if (!dateStr) return '-'
  return formatDate(new Date(dateStr))
}
</script>

<style scoped lang="scss">
.enterprise-certification {
  .certification-card {
    border-radius: 12px;
    overflow: hidden;
    
    &.success-card {
      border: 2px solid var(--el-color-success);
      background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%);
    }
    
    :deep(.el-card__header) {
      padding: 20px 24px;
      border-bottom: 1px solid var(--el-border-color-lighter);
      background: var(--el-fill-color-extra-light);
      
      .card-header {
        display: flex;
        align-items: center;
        
        .header-icon {
          font-size: 20px;
          color: var(--el-color-primary);
          margin-right: 8px;
        }
        
        .header-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--el-text-color-primary);
          flex: 1;
        }
        
        .header-tag {
          margin-left: 12px;
        }
      }
    }
    
    :deep(.el-card__body) {
      padding: 24px;
    }
  }
  
  .alert-content {
    .alert-title {
      font-weight: 600;
      margin-bottom: 4px;
    }
    
    .alert-desc {
      color: var(--el-text-color-regular);
      font-size: 14px;
    }
  }
  
  .certification-notice {
    display: flex;
    align-items: flex-start;
    padding: 16px;
    background: var(--el-color-primary-light-9);
    border-radius: 8px;
    border-left: 4px solid var(--el-color-primary);
    margin-bottom: 24px;
    
    .notice-icon {
      font-size: 20px;
      color: var(--el-color-primary);
      margin-right: 12px;
      margin-top: 2px;
      flex-shrink: 0;
    }
    
    .notice-content {
      flex: 1;
      
      .notice-title {
        margin: 0 0 8px 0;
        font-size: 15px;
        font-weight: 600;
        color: var(--el-color-primary);
      }
      
      .notice-desc {
        margin: 0;
        font-size: 14px;
        color: var(--el-text-color-regular);
        line-height: 1.5;
      }
    }
  }
  
  .certification-form {
    .form-section {
      margin-bottom: 32px;
      
      &:last-child {
        margin-bottom: 24px;
      }
      
      .section-title {
        display: flex;
        align-items: center;
        margin: 0 0 20px 0;
        font-size: 16px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        padding-bottom: 12px;
        border-bottom: 2px solid var(--el-border-color-lighter);
        
        .section-icon {
          margin-right: 8px;
          font-size: 18px;
          color: var(--el-color-primary);
        }
      }
    }
  }
  
  .upload-section {
    display: flex;
    gap: 20px;
    align-items: flex-start;
    
    .cert-upload {
      flex-shrink: 0;
    }
    
    .upload-tips {
      flex: 1;
      padding: 12px 16px;
      background: var(--el-fill-color-extra-light);
      border-radius: 8px;
      border-left: 3px solid var(--el-color-primary);
      
      .tip-title {
        font-size: 13px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin-bottom: 8px;
      }
      
      .tip-list {
        margin: 0;
        padding-left: 16px;
        
        li {
          font-size: 12px;
          color: var(--el-text-color-regular);
          line-height: 1.6;
          margin-bottom: 4px;
          
          &:last-child {
            margin-bottom: 0;
          }
        }
      }
    }
  }
  
  .success-content {
    display: flex;
    align-items: center;
    padding: 20px 0;
    
    .success-icon {
      margin-right: 20px;
      
      .icon-large {
        font-size: 64px;
        
        &.success {
          color: var(--el-color-success);
        }
      }
    }
    
    .success-info {
      flex: 1;
      
      .success-title {
        margin: 0 0 8px 0;
        font-size: 20px;
        font-weight: 600;
        color: var(--el-color-success);
      }
      
      .success-desc {
        margin: 0 0 16px 0;
        color: var(--el-text-color-regular);
        font-size: 14px;
      }
      
      .success-details {
        margin-bottom: 16px;
        
        .detail-item {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
          
          &:last-child {
            margin-bottom: 0;
          }
          
          .detail-label {
            width: 80px;
            font-size: 14px;
            color: var(--el-text-color-secondary);
          }
          
          .detail-value {
            font-size: 14px;
            color: var(--el-text-color-primary);
            font-weight: 500;
          }
        }
      }
      
      .success-actions {
        .el-button {
          margin-right: 12px;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .enterprise-certification {
    .upload-section {
      flex-direction: column;
      gap: 12px;
      
      .upload-tips {
        .tip-list {
          padding-left: 12px;
        }
      }
    }
    
    .success-content {
      flex-direction: column;
      text-align: center;
      
      .success-icon {
        margin-right: 0;
        margin-bottom: 16px;
      }
    }
  }
}
</style> 