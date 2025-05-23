<template>
  <div class="personal-certification">
    <el-card class="certification-card" v-if="certification.status !== 2">
      <template #header>
        <div class="card-header">
          <Icon icon="ep:user" class="header-icon" />
          <span class="header-title">个人实名认证</span>
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
            <div class="alert-desc">您的个人认证正在审核中，请耐心等待审核结果</div>
          </div>
        </template>
      </el-alert>

      <!-- 认证表单 -->
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        v-loading="submitLoading"
        :disabled="certification.status === 1"
      >
        <el-form-item label="真实姓名" prop="realName">
          <el-input
            v-model="form.realName"
            placeholder="请输入真实姓名"
            clearable
            maxlength="20"
            show-word-limit
          />
          <div class="form-tip">请输入与身份证一致的真实姓名</div>
        </el-form-item>

        <el-form-item label="身份证号" prop="idCardNo">
          <el-input
            v-model="form.idCardNo"
            placeholder="请输入身份证号码"
            clearable
            maxlength="18"
            show-word-limit
          />
          <div class="form-tip">请输入18位身份证号码</div>
        </el-form-item>

        <el-form-item label="身份证正面" prop="idCardFrontFileId">
          <div class="upload-section">
            <UploadFile
              v-model="form.idCardFrontFileId"
              :limit="1"
              :file-type="['png', 'jpg', 'jpeg']"
              :file-size="5"
              class="id-card-upload"
            />
            <div class="upload-tips">
              <div class="tip-title">上传要求：</div>
              <ul class="tip-list">
                <li>请上传身份证正面照片</li>
                <li>支持 PNG、JPG、JPEG 格式</li>
                <li>文件大小不超过 5MB</li>
                <li>照片清晰，四角完整，信息可见</li>
              </ul>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="身份证反面" prop="idCardBackFileId">
          <div class="upload-section">
            <UploadFile
              v-model="form.idCardBackFileId"
              :limit="1"
              :file-type="['png', 'jpg', 'jpeg']"
              :file-size="5"
              class="id-card-upload"
            />
            <div class="upload-tips">
              <div class="tip-title">上传要求：</div>
              <ul class="tip-list">
                <li>请上传身份证反面照片</li>
                <li>支持 PNG、JPG、JPEG 格式</li>
                <li>文件大小不超过 5MB</li>
                <li>照片清晰，四角完整，信息可见</li>
              </ul>
            </div>
          </div>
        </el-form-item>

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
          <h3 class="success-title">个人认证已完成</h3>
          <p class="success-desc">恭喜！您的个人实名认证已通过审核</p>
          <div class="success-details">
            <div class="detail-item">
              <span class="detail-label">认证姓名：</span>
              <span class="detail-value">{{ maskedName(certification.realName) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">身份证号：</span>
              <span class="detail-value">{{ maskedIdCard(certification.idCardNo) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">认证时间：</span>
              <span class="detail-value">{{ formatDateSafe(certification.auditTime) }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import { CertificationApi, PersonalCertificationVO } from '@/api/enterprise/certification'
import { formatDate } from '@/utils/formatTime'

interface Props {
  certification: PersonalCertificationVO
}

const props = defineProps<Props>()
const emit = defineEmits<{
  refresh: []
}>()

const formRef = ref<FormInstance>()
const submitLoading = ref(false)

// 表单数据
const form = reactive({
  realName: '',
  idCardNo: '',
  idCardFrontFileId: undefined as number | undefined,
  idCardBackFileId: undefined as number | undefined
})

// 表单验证规则
const rules: FormRules = {
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度在 2 到 20 个字符', trigger: 'blur' },
    { pattern: /^[\u4e00-\u9fa5·]+$/, message: '请输入正确的中文姓名', trigger: 'blur' }
  ],
  idCardNo: [
    { required: true, message: '请输入身份证号码', trigger: 'blur' },
    { pattern: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/, message: '请输入正确的身份证号码', trigger: 'blur' }
  ],
  idCardFrontFileId: [
    { required: true, message: '请上传身份证正面照片', trigger: 'change' }
  ],
  idCardBackFileId: [
    { required: true, message: '请上传身份证反面照片', trigger: 'change' }
  ]
}

// 监听认证信息变化，更新表单
watch(
  () => props.certification,
  (newVal) => {
    if (newVal && (newVal.status === 0 || newVal.status === 3)) {
      form.realName = newVal.realName || ''
      form.idCardNo = newVal.idCardNo || ''
      form.idCardFrontFileId = newVal.idCardFrontFileId
      form.idCardBackFileId = newVal.idCardBackFileId
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
    
    await CertificationApi.submitPersonalCertification(form)
    ElMessage.success('个人认证提交成功，请等待审核')
    emit('refresh')
  } catch (error) {
    console.error('提交个人认证失败:', error)
    if (error !== 'validation failed') {
      ElMessage.error('提交失败，请重试')
    }
  } finally {
    submitLoading.value = false
  }
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

// 脱敏姓名
const maskedName = (name?: string): string => {
  if (!name) return '-'
  if (name.length <= 2) return name
  return name.charAt(0) + '*'.repeat(name.length - 2) + name.charAt(name.length - 1)
}

// 脱敏身份证号
const maskedIdCard = (idCard?: string): string => {
  if (!idCard) return '-'
  return idCard.substring(0, 6) + '********' + idCard.substring(14)
}

// 格式化日期
const formatDateSafe = (dateStr?: string): string => {
  if (!dateStr) return '-'
  return formatDate(new Date(dateStr))
}
</script>

<style scoped lang="scss">
.personal-certification {
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
  
  .form-tip {
    font-size: 12px;
    color: var(--el-text-color-placeholder);
    margin-top: 4px;
    line-height: 1.4;
  }
  
  .upload-section {
    display: flex;
    gap: 20px;
    align-items: flex-start;
    
    .id-card-upload {
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
        .detail-item {
          display: flex;
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
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .personal-certification {
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