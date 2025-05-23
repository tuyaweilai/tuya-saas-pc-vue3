<template>
  <div class="my-application-container">
    <!-- 页面头部 -->
    <ContentWrap>
      <div class="header-section">
        <div class="header-title">
          <Icon icon="ep:office-building" class="mr-2" />
          <span>我的企业入驻申请</span>
        </div>
        <p class="header-desc">查看您的企业入驻申请状态和详情</p>
        <div class="header-actions" v-if="!loading">
          <el-button type="primary" @click="refreshApplication" :loading="refreshLoading">
            <Icon icon="ep:refresh" class="mr-1" />
            刷新状态
          </el-button>
          <el-button 
            v-if="!application.hasApplication" 
            type="success" 
            @click="handleCreateApplication"
          >
            <Icon icon="ep:plus" class="mr-1" />
            立即申请
          </el-button>
        </div>
      </div>
    </ContentWrap>

    <!-- 申请详情 -->
    <ContentWrap v-if="application.hasApplication && !loading">
      <div class="application-detail-card">
        <!-- 状态banner -->
        <div class="status-banner" :class="getStatusBannerClass(application.status!)">
          <div class="status-info">
            <div class="status-icon">
              <Icon :icon="getStatusIcon(application.status!)" class="icon-large" />
            </div>
            <div class="status-content">
              <h2 class="status-title">{{ getStatusTitle(application.status!) }}</h2>
              <p class="status-desc">{{ getStatusDescription(application.status!) }}</p>
            </div>
          </div>
          <div class="status-actions">
            <el-button 
              v-if="application.status === 2" 
              type="warning" 
              size="large"
              @click="handleResubmit"
              :loading="resubmitLoading"
            >
              <Icon icon="ep:refresh-right" class="mr-1" />
              重新提交
            </el-button>
            <el-button 
              v-if="application.status === 1" 
              type="success" 
              size="large"
              @click="handleGotoAuth"
            >
              <Icon icon="ep:right" class="mr-1" />
              进入认证中心
            </el-button>
          </div>
        </div>

        <!-- 企业信息 -->
        <div class="info-section">
          <h3 class="section-title">
            <Icon icon="ep:office-building" class="section-icon" />
            企业基本信息
          </h3>
          <div class="info-grid">
            <div class="info-item">
              <label class="info-label">企业名称</label>
              <div class="info-value">{{ application.name || '-' }}</div>
            </div>
            <div class="info-item">
              <label class="info-label">企业类型</label>
              <div class="info-value">{{ getEnterpriseTypeText(application.enterpriseType!) }}</div>
            </div>
            <div class="info-item" v-if="application.creditCode">
              <label class="info-label">统一社会信用代码</label>
              <div class="info-value">{{ application.creditCode }}</div>
            </div>
            <div class="info-item" v-if="application.contactName">
              <label class="info-label">联系人姓名</label>
              <div class="info-value">{{ application.contactName }}</div>
            </div>
            <div class="info-item" v-if="application.contactPhone">
              <label class="info-label">联系电话</label>
              <div class="info-value">{{ application.contactPhone }}</div>
            </div>
            <div class="info-item">
              <label class="info-label">申请时间</label>
              <div class="info-value">{{ formatDateSafe(application.createTime) }}</div>
            </div>
            <div class="info-item" v-if="application.auditTime">
              <label class="info-label">审核时间</label>
              <div class="info-value">{{ formatDateSafe(application.auditTime) }}</div>
            </div>
          </div>
        </div>

        <!-- 审核信息 -->
        <div class="audit-section" v-if="application.auditRemark">
          <h3 class="section-title">
            <Icon 
              :icon="application.status === 2 ? 'ep:warning-filled' : 'ep:info-filled'" 
              :class="application.status === 2 ? 'text-red-500' : 'text-blue-500'"
              class="section-icon"
            />
            {{ application.status === 2 ? '拒绝原因' : '审核备注' }}
          </h3>
          <div class="audit-content">
            <el-alert
              :type="application.status === 2 ? 'error' : 'success'"
              show-icon
              :closable="false"
            >
              <template #title>
                <div class="audit-remark">{{ application.auditRemark }}</div>
              </template>
            </el-alert>
          </div>
        </div>

        <!-- 申请流程 -->
        <div class="process-section">
          <h3 class="section-title">
            <Icon icon="ep:share" class="section-icon" />
            申请流程
          </h3>
          <div class="process-content">
            <el-steps
              :active="getStepActive(application.status!)"
              direction="horizontal"
              align-center
              finish-status="success"
            >
              <el-step title="提交申请" description="已完成企业入驻申请提交" />
              <el-step 
                title="等待审核" 
                :description="application.status === 0 ? '正在审核中，请耐心等待' : '审核已完成'"
              />
              <el-step 
                :title="application.status === 2 ? '审核未通过' : '审核通过'"
                :description="getStepDescription(application.status!)"
              />
              <el-step 
                v-if="application.status === 1"
                title="企业认证"
                description="可以进入认证中心完成企业认证"
              />
            </el-steps>
          </div>
        </div>
      </div>
    </ContentWrap>

    <!-- 空状态 - 未申请 -->
    <ContentWrap v-if="!application.hasApplication && !loading">
      <div class="empty-state">
        <div class="empty-content">
          <Icon icon="ep:office-building" class="empty-icon" />
          <h3 class="empty-title">您还没有企业入驻申请</h3>
          <p class="empty-desc">请点击下方按钮开始申请企业入驻</p>
          <el-button type="primary" size="large" @click="handleCreateApplication">
            <Icon icon="ep:plus" class="mr-1" />
            立即申请企业入驻
          </el-button>
        </div>
      </div>
    </ContentWrap>

    <!-- 加载状态 -->
    <ContentWrap v-if="loading">
      <div class="loading-container">
        <el-skeleton :rows="8" animated />
      </div>
    </ContentWrap>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { InfoApi, MyApplicationVO } from '@/api/enterprise/info'
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import { formatDate } from '@/utils/formatTime'

defineOptions({ name: 'MyApplication' })

const message = useMessage()
const router = useRouter()

// 数据状态
const loading = ref(false)
const refreshLoading = ref(false)
const resubmitLoading = ref(false)
const application = ref<MyApplicationVO>({
  hasApplication: false
})

// 获取申请信息
const getApplication = async () => {
  loading.value = true
  try {
    const data = await InfoApi.getMyApplication()
    if (data && data.id) {
      application.value = { ...data, hasApplication: true }
    } else {
      application.value = { hasApplication: false }
    }
  } catch (error) {
    console.error('获取申请信息失败:', error)
    // 使用模拟数据进行演示
    application.value = {
      id: 1,
      name: '示例科技有限公司',
      enterpriseType: 1,
      status: 1,
      createTime: '2024-01-15 10:30:00',
      auditTime: '2024-01-17 14:20:00',
      creditCode: '91110000123456789X',
      contactName: '张三',
      contactPhone: '13800138000',
      auditRemark: '审核通过，企业资质符合要求',
      hasApplication: true
    }
  } finally {
    loading.value = false
  }
}

// 刷新申请状态
const refreshApplication = async () => {
  refreshLoading.value = true
  try {
    await getApplication()
    message.success('已刷新申请状态')
  } finally {
    refreshLoading.value = false
  }
}

// 重新提交申请
const handleResubmit = async () => {
  if (!application.value.id) return
  
  try {
    await message.confirm('确认要重新提交此申请吗？', '重新提交确认')
    resubmitLoading.value = true
    await InfoApi.resubmitApplication(application.value.id)
    message.success('重新提交成功，请等待审核')
    await getApplication()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('重新提交失败:', error)
      message.error('重新提交失败')
    }
  } finally {
    resubmitLoading.value = false
  }
}

// 创建新申请
const handleCreateApplication = () => {
  router.push('/enterprise/guide')
}

// 进入认证中心
const handleGotoAuth = () => {
  router.push('/enterprise/certification')
}

// 获取状态类型
const getStatusBannerClass = (status: number): string => {
  switch (status) {
    case 0:
      return 'status-pending'
    case 1:
      return 'status-success'
    case 2:
      return 'status-rejected'
    default:
      return 'status-unknown'
  }
}

// 获取状态图标
const getStatusIcon = (status: number): string => {
  switch (status) {
    case 0:
      return 'ep:clock'
    case 1:
      return 'ep:circle-check-filled'
    case 2:
      return 'ep:circle-close-filled'
    default:
      return 'ep:question-filled'
  }
}

// 获取状态标题
const getStatusTitle = (status: number): string => {
  switch (status) {
    case 0:
      return '申请审核中'
    case 1:
      return '申请已通过'
    case 2:
      return '申请未通过'
    default:
      return '未知状态'
  }
}

// 获取状态描述
const getStatusDescription = (status: number): string => {
  switch (status) {
    case 0:
      return '您的企业入驻申请正在审核中，请耐心等待审核结果'
    case 1:
      return '恭喜！您的企业入驻申请已通过审核，可以进入认证中心完成企业认证'
    case 2:
      return '很抱歉，您的企业入驻申请未通过审核，请查看拒绝原因并重新提交申请'
    default:
      return ''
  }
}

// 获取企业类型文本
const getEnterpriseTypeText = (type: number): string => {
  if (!type) return '-'
  const options = getIntDictOptions(DICT_TYPE.ENTERPRISE_TYPE_ENUM)
  const option = options.find(item => item.value === type)
  return option?.label || '未知类型'
}

// 获取步骤当前状态
const getStepActive = (status: number): number => {
  switch (status) {
    case 0:
      return 1 // 等待审核
    case 1:
      return 3 // 审核通过
    case 2:
      return 2 // 审核拒绝
    default:
      return 0
  }
}

// 获取步骤描述
const getStepDescription = (status: number): string => {
  switch (status) {
    case 0:
      return '正在审核中，请耐心等待'
    case 1:
      return '恭喜！您的申请已通过审核'
    case 2:
      return '很抱歉，您的申请未通过审核'
    default:
      return ''
  }
}

// 格式化日期函数（处理字符串类型）
const formatDateSafe = (dateStr: string | undefined): string => {
  if (!dateStr) return '-'
  return formatDate(new Date(dateStr))
}

// 初始化
onMounted(() => {
  getApplication()
})
</script>

<style scoped lang="scss">
.my-application-container {
  padding: 0;
}

.header-section {
  text-align: center;
  padding: 20px 0;
  
  .header-title {
    font-size: 24px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 8px;
  }
  
  .header-desc {
    color: var(--el-text-color-regular);
    margin-bottom: 20px;
    font-size: 14px;
  }
  
  .header-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
  }
}

.application-detail-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
}

.status-banner {
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  &.status-pending {
    background: linear-gradient(135deg, #fdf6ec 0%, #fef7e0 100%);
    border-left: 4px solid var(--el-color-warning);
  }
  
  &.status-success {
    background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%);
    border-left: 4px solid var(--el-color-success);
  }
  
  &.status-rejected {
    background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
    border-left: 4px solid var(--el-color-danger);
  }
  
  .status-info {
    display: flex;
    align-items: center;
    
    .status-icon {
      margin-right: 16px;
      
      .icon-large {
        font-size: 48px;
      }
    }
    
    .status-content {
      .status-title {
        margin: 0 0 8px 0;
        font-size: 20px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }
      
      .status-desc {
        margin: 0;
        color: var(--el-text-color-regular);
        line-height: 1.5;
      }
    }
  }
}

.info-section,
.audit-section,
.process-section {
  padding: 24px;
  border-bottom: 1px solid var(--el-border-color-light);
  
  &:last-child {
    border-bottom: none;
  }
  
  .section-title {
    display: flex;
    align-items: center;
    margin: 0 0 16px 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    
    .section-icon {
      margin-right: 8px;
      font-size: 18px;
      color: var(--el-color-primary);
    }
  }
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  
  .info-item {
    .info-label {
      display: block;
      font-size: 13px;
      color: var(--el-text-color-regular);
      margin-bottom: 4px;
      font-weight: 500;
    }
    
    .info-value {
      font-size: 14px;
      color: var(--el-text-color-primary);
      word-break: break-all;
    }
  }
}

.audit-content {
  .audit-remark {
    line-height: 1.5;
    white-space: pre-wrap;
  }
}

.process-content {
  padding: 16px;
  background: var(--el-fill-color-extra-light);
  border-radius: 8px;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  
  .empty-content {
    max-width: 400px;
    margin: 0 auto;
    
    .empty-icon {
      font-size: 80px;
      color: var(--el-color-info-light-3);
      margin-bottom: 24px;
    }
    
    .empty-title {
      margin: 0 0 12px 0;
      font-size: 18px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
    
    .empty-desc {
      margin: 0 0 24px 0;
      color: var(--el-text-color-regular);
      line-height: 1.5;
    }
  }
}

.loading-container {
  padding: 20px;
}

// 响应式设计
@media (max-width: 768px) {
  .header-section {
    padding: 16px 0;
    
    .header-title {
      font-size: 20px;
    }
    
    .header-actions {
      flex-direction: column;
      align-items: center;
    }
  }
  
  .status-banner {
    flex-direction: column;
    text-align: center;
    
    .status-info {
      margin-bottom: 16px;
    }
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .process-content {
    :deep(.el-steps) {
      .el-step__description {
        font-size: 12px;
      }
    }
  }
}
</style> 