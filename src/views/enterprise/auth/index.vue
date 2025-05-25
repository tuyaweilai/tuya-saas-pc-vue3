<template>
  <ContentWrap>
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-content">
        <h2>企业认证中心</h2>
        <p class="text-gray-500">完成企业认证，享受完整的企业服务</p>
      </div>
      <el-button type="primary" @click="refreshStatus" :loading="loading">
        <Icon icon="ep:refresh" class="mr-1" />
        刷新状态
      </el-button>
    </div>

    <!-- 企业基本信息卡片 -->
    <div class="enterprise-info-card">
      <div class="card-header">
        <h3>
          <Icon icon="ep:office-building" class="mr-2" />
          企业基本信息
        </h3>
        <el-tag v-if="enterpriseInfo" type="success">已入驻</el-tag>
      </div>
      <div v-if="enterpriseInfo" class="enterprise-details">
        <el-row :gutter="24">
          <el-col :span="12">
            <div class="info-item">
              <span class="label">企业名称：</span>
              <span class="value">{{ enterpriseInfo.name }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="label">企业类型：</span>
              <span class="value">{{ getEnterpriseTypeLabel(enterpriseInfo.enterpriseType) }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="label">统一社会信用代码：</span>
              <span class="value">{{ enterpriseInfo.creditCode }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="info-item">
              <span class="label">法定代表人：</span>
              <span class="value">{{ enterpriseInfo.legalPersonName }}</span>
            </div>
          </el-col>
        </el-row>
      </div>
      <div v-else class="no-enterprise">
        <el-empty description="暂无企业信息" :image-size="80">
          <el-button type="primary" @click="goToGuide">
            <Icon icon="ep:plus" class="mr-1" />
            开始企业入驻
          </el-button>
        </el-empty>
      </div>
    </div>

    <!-- 认证进度总览 -->
    <div class="progress-overview">
      <h3>认证进度</h3>
      <el-progress 
        :percentage="overallProgress" 
        :stroke-width="8"
        :color="progressColor"
        class="overall-progress"
      >
        <template #default="{ percentage }">
          <span class="progress-text">{{ percentage }}%</span>
        </template>
      </el-progress>
      <p class="progress-desc">{{ progressDescription }}</p>
    </div>

    <!-- 认证项目列表 -->
    <div class="auth-items">
      <h3>认证项目</h3>
      <div class="auth-grid">
        <!-- 个人实名认证 -->
        <div class="auth-item-card">
          <div class="card-header">
            <div class="item-info">
              <Icon icon="ep:user" :size="24" class="item-icon" />
              <div>
                <h4>个人实名认证</h4>
                <p class="item-desc">验证当前用户的身份信息</p>
              </div>
            </div>
            <el-tag 
              :type="getStatusTagType(authStatus.personalAuth?.status || 0)"
              class="status-tag"
            >
              {{ getStatusLabel(authStatus.personalAuth?.status || 0) }}
            </el-tag>
          </div>
          
          <div v-if="authStatus.personalAuth?.message" class="status-message">
            <Icon icon="ep:info" />
            {{ authStatus.personalAuth.message }}
          </div>

          <div class="card-actions">
            <el-button 
              v-if="authStatus.personalAuth?.status === 0"
              type="primary"
              @click="startPersonalAuth"
              :loading="personalAuthLoading"
            >
              <Icon icon="ep:right" class="mr-1" />
              开始认证
            </el-button>
            <el-button 
              v-else-if="authStatus.personalAuth?.status === 1"
              type="warning"
              @click="checkPersonalAuthStatus"
              :loading="personalAuthLoading"
            >
              <Icon icon="ep:refresh" class="mr-1" />
              查看进度
            </el-button>
            <el-button 
              v-else-if="authStatus.personalAuth?.status === 3"
              type="danger"
              @click="startPersonalAuth"
              :loading="personalAuthLoading"
            >
              <Icon icon="ep:refresh-right" class="mr-1" />
              重新认证
            </el-button>
            <el-tag v-else type="success" size="large">
              <Icon icon="ep:check" class="mr-1" />
              认证完成
            </el-tag>
          </div>
        </div>

        <!-- 企业认证 -->
        <div class="auth-item-card">
          <div class="card-header">
            <div class="item-info">
              <Icon icon="ep:office-building" :size="24" class="item-icon" />
              <div>
                <h4>企业认证</h4>
                <p class="item-desc">验证企业三要素信息</p>
              </div>
            </div>
            <el-tag 
              :type="getStatusTagType(authStatus.enterpriseAuth?.status || 0)"
              class="status-tag"
            >
              {{ getStatusLabel(authStatus.enterpriseAuth?.status || 0) }}
            </el-tag>
          </div>
          
          <div v-if="authStatus.enterpriseAuth?.message" class="status-message">
            <Icon icon="ep:info" />
            {{ authStatus.enterpriseAuth.message }}
          </div>

          <div class="card-actions">
            <el-button 
              v-if="authStatus.enterpriseAuth?.status === 0"
              type="primary"
              @click="startEnterpriseAuth"
              :loading="enterpriseAuthLoading"
              :disabled="authStatus.personalAuth?.status !== 2"
            >
              <Icon icon="ep:right" class="mr-1" />
              开始认证
            </el-button>
            <el-button 
              v-else-if="authStatus.enterpriseAuth?.status === 1"
              type="warning"
              @click="checkEnterpriseAuthStatus"
              :loading="enterpriseAuthLoading"
            >
              <Icon icon="ep:refresh" class="mr-1" />
              查看进度
            </el-button>
            <el-button 
              v-else-if="authStatus.enterpriseAuth?.status === 3"
              type="danger"
              @click="startEnterpriseAuth"
              :loading="enterpriseAuthLoading"
            >
              <Icon icon="ep:refresh-right" class="mr-1" />
              重新认证
            </el-button>
            <el-tag v-else type="success" size="large">
              <Icon icon="ep:check" class="mr-1" />
              认证完成
            </el-tag>
          </div>
          
          <div v-if="authStatus.personalAuth?.status !== 2" class="dependency-tip">
            <Icon icon="ep:warning" />
            需要先完成个人实名认证
          </div>
        </div>

        <!-- 资质认证 -->
        <div class="auth-item-card">
          <div class="card-header">
            <div class="item-info">
              <Icon icon="ep:document" :size="24" class="item-icon" />
              <div>
                <h4>资质认证</h4>
                <p class="item-desc">上传企业相关资质证书</p>
              </div>
            </div>
            <el-tag 
              :type="getStatusTagType(authStatus.qualificationAuth?.status || 0)"
              class="status-tag"
            >
              {{ getStatusLabel(authStatus.qualificationAuth?.status || 0) }}
            </el-tag>
          </div>
          
          <div v-if="authStatus.qualificationAuth?.message" class="status-message">
            <Icon icon="ep:info" />
            {{ authStatus.qualificationAuth.message }}
          </div>

          <div v-if="authStatus.qualificationAuth?.requiredQualifications?.length" class="required-qualifications">
            <p class="req-title">需要的资质类型：</p>
            <div class="req-list">
              <el-tag 
                v-for="qual in authStatus.qualificationAuth.requiredQualifications" 
                :key="qual"
                type="info"
                size="small"
              >
                {{ qual }}
              </el-tag>
            </div>
          </div>

          <div class="card-actions">
            <el-button 
              v-if="authStatus.qualificationAuth?.status === 0"
              type="primary"
              @click="goToQualification"
              :disabled="authStatus.enterpriseAuth?.status !== 2"
            >
              <Icon icon="ep:upload" class="mr-1" />
              上传资质
            </el-button>
            <el-button 
              v-else-if="authStatus.qualificationAuth?.status === 1"
              type="warning"
              @click="goToQualification"
            >
              <Icon icon="ep:view" class="mr-1" />
              查看资质
            </el-button>
            <el-button 
              v-else-if="authStatus.qualificationAuth?.status === 3"
              type="danger"
              @click="goToQualification"
            >
              <Icon icon="ep:refresh-right" class="mr-1" />
              重新上传
            </el-button>
            <el-tag v-else type="success" size="large">
              <Icon icon="ep:check" class="mr-1" />
              认证完成
            </el-tag>
          </div>
          
          <div v-if="authStatus.enterpriseAuth?.status !== 2" class="dependency-tip">
            <Icon icon="ep:warning" />
            需要先完成企业认证
          </div>
        </div>
      </div>
    </div>

    <!-- 认证完成提示 -->
    <div v-if="isAllCompleted" class="completion-banner">
      <el-alert
        title="恭喜！所有认证项目已完成"
        type="success"
        :closable="false"
        show-icon
      >
        <template #default>
          <p>您已完成所有必要的企业认证，现在可以享受完整的企业服务功能。</p>
        </template>
      </el-alert>
    </div>
  </ContentWrap>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { EnterpriseAuthApi, type AuthItemStatusVO } from '@/api/enterprise/auth'
import { InfoApi, type InfoVO } from '@/api/enterprise/info'
import { useMessage } from '@/hooks/web/useMessage'

defineOptions({ name: 'EnterpriseAuthCenter' })

const router = useRouter()
const message = useMessage()

// 响应式数据
const loading = ref(false)
const personalAuthLoading = ref(false)
const enterpriseAuthLoading = ref(false)
const enterpriseInfo = ref<InfoVO | null>(null)
const authStatus = ref<AuthItemStatusVO>({
  personalAuth: { status: 0 },
  enterpriseAuth: { status: 0 },
  qualificationAuth: { status: 0 }
})

// 企业类型映射
const enterpriseTypeMap = {
  1: '产废企业',
  2: '回收企业', 
  3: '处置企业',
  4: '物流企业',
  99: '其他'
}

// 状态映射
const statusMap = {
  0: '未开始',
  1: '进行中',
  2: '已完成',
  3: '已失败'
}

// 获取企业类型标签
const getEnterpriseTypeLabel = (type: number) => {
  return enterpriseTypeMap[type] || '未知类型'
}

// 获取状态标签
const getStatusLabel = (status: number) => {
  return statusMap[status] || '未知状态'
}

// 获取状态标签类型
const getStatusTagType = (status: number) => {
  switch (status) {
    case 0: return 'info'     // 未开始
    case 1: return 'warning'  // 进行中
    case 2: return 'success'  // 已完成
    case 3: return 'danger'   // 已失败
    default: return 'info'
  }
}

// 计算总体进度
const overallProgress = computed(() => {
  const statuses = [
    authStatus.value.personalAuth?.status || 0,
    authStatus.value.enterpriseAuth?.status || 0,
    authStatus.value.qualificationAuth?.status || 0
  ]
  const completedCount = statuses.filter(status => status === 2).length
  return Math.round((completedCount / statuses.length) * 100)
})

// 进度条颜色
const progressColor = computed(() => {
  const progress = overallProgress.value
  if (progress === 100) return '#67c23a'
  if (progress >= 60) return '#e6a23c'
  return '#409eff'
})

// 进度描述
const progressDescription = computed(() => {
  const progress = overallProgress.value
  if (progress === 100) return '所有认证项目已完成'
  if (progress >= 60) return '认证进行中，即将完成'
  if (progress > 0) return '认证已开始，请继续完成剩余项目'
  return '请开始企业认证流程'
})

// 是否全部完成
const isAllCompleted = computed(() => {
  return overallProgress.value === 100
})

// 获取企业信息
const getEnterpriseInfo = async () => {
  try {
    // 这里需要根据实际API调整，可能需要先获取当前用户绑定的企业ID
    // 暂时使用模拟数据
    enterpriseInfo.value = {
      id: 1,
      name: '示例企业有限公司',
      creditCode: '91110000000000000X',
      enterpriseType: 2,
      legalPersonName: '张三',
      legalPersonIdCardNo: '110101199001011234',
      registeredCapital: 1000,
      establishmentDate: '2020-01-01',
      businessScope: '废料回收、处理',
      registeredAddressDetail: '北京市朝阳区示例街道123号',
      contactName: '李四',
      contactPhone: '13800138000',
      businessLicenseFileId: 'file123'
    }
  } catch (error) {
    console.error('获取企业信息失败:', error)
  }
}

// 获取认证状态
const getAuthStatus = async () => {
  try {
    loading.value = true
    const data = await EnterpriseAuthApi.getAuthItemStatus()
    authStatus.value = data || {
      personalAuth: { status: 0 },
      enterpriseAuth: { status: 0 },
      qualificationAuth: { status: 0 }
    }
  } catch (error) {
    console.error('获取认证状态失败:', error)
    message.error('获取认证状态失败')
  } finally {
    loading.value = false
  }
}

// 刷新状态
const refreshStatus = async () => {
  await Promise.all([
    getEnterpriseInfo(),
    getAuthStatus()
  ])
}

// 开始个人认证
const startPersonalAuth = async () => {
  try {
    personalAuthLoading.value = true
    const result = await EnterpriseAuthApi.initiatePersonalAuth()
    
    // 如果返回跳转URL，则跳转到第三方认证页面
    if (result.redirectUrl) {
      window.open(result.redirectUrl, '_blank')
      message.success('已跳转到认证页面，请完成认证后返回查看状态')
    } else {
      message.success('个人认证已发起')
    }
    
    // 更新状态
    await getAuthStatus()
  } catch (error) {
    console.error('发起个人认证失败:', error)
    message.error('发起个人认证失败，请重试')
  } finally {
    personalAuthLoading.value = false
  }
}

// 检查个人认证状态
const checkPersonalAuthStatus = async () => {
  personalAuthLoading.value = true
  await getAuthStatus()
  personalAuthLoading.value = false
  message.info('状态已更新')
}

// 开始企业认证
const startEnterpriseAuth = async () => {
  try {
    enterpriseAuthLoading.value = true
    const result = await EnterpriseAuthApi.initiateEnterpriseAuth()
    
    // 如果返回跳转URL，则跳转到第三方认证页面
    if (result.redirectUrl) {
      window.open(result.redirectUrl, '_blank')
      message.success('已跳转到认证页面，请完成认证后返回查看状态')
    } else {
      message.success('企业认证已发起')
    }
    
    // 更新状态
    await getAuthStatus()
  } catch (error) {
    console.error('发起企业认证失败:', error)
    message.error('发起企业认证失败，请重试')
  } finally {
    enterpriseAuthLoading.value = false
  }
}

// 检查企业认证状态
const checkEnterpriseAuthStatus = async () => {
  enterpriseAuthLoading.value = true
  await getAuthStatus()
  enterpriseAuthLoading.value = false
  message.info('状态已更新')
}

// 前往资质管理
const goToQualification = () => {
  router.push('/enterprise/qualification')
}

// 前往入驻引导
const goToGuide = () => {
  router.push('/enterprise/guide')
}

// 页面初始化
onMounted(() => {
  refreshStatus()
})
</script>

<style lang="scss" scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px 0;
  border-bottom: 1px solid #f0f0f0;

  .header-content {
    h2 {
      font-size: 24px;
      color: #303133;
      margin: 0 0 8px 0;
    }
  }
}

.enterprise-info-card {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h3 {
      display: flex;
      align-items: center;
      font-size: 18px;
      color: #303133;
      margin: 0;
    }
  }

  .enterprise-details {
    .info-item {
      margin-bottom: 12px;

      .label {
        color: #909399;
        font-size: 14px;
      }

      .value {
        color: #303133;
        font-size: 14px;
        font-weight: 500;
      }
    }
  }

  .no-enterprise {
    text-align: center;
    padding: 40px 0;
  }
}

.progress-overview {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  text-align: center;

  h3 {
    font-size: 18px;
    color: #303133;
    margin: 0 0 20px 0;
  }

  .overall-progress {
    margin-bottom: 16px;

    .progress-text {
      font-size: 16px;
      font-weight: 600;
    }
  }

  .progress-desc {
    color: #606266;
    font-size: 14px;
    margin: 0;
  }
}

.auth-items {
  h3 {
    font-size: 18px;
    color: #303133;
    margin: 0 0 20px 0;
  }

  .auth-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 20px;
  }

  .auth-item-card {
    background: #fff;
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    padding: 20px;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border-color: #409eff;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;

      .item-info {
        display: flex;
        align-items: flex-start;
        gap: 12px;

        .item-icon {
          color: #409eff;
          margin-top: 2px;
        }

        h4 {
          font-size: 16px;
          color: #303133;
          margin: 0 0 4px 0;
        }

        .item-desc {
          font-size: 14px;
          color: #909399;
          margin: 0;
        }
      }

      .status-tag {
        font-size: 12px;
      }
    }

    .status-message {
      display: flex;
      align-items: center;
      gap: 6px;
      background: #f0f9ff;
      border: 1px solid #b3d8ff;
      border-radius: 4px;
      padding: 8px 12px;
      margin-bottom: 16px;
      font-size: 14px;
      color: #409eff;
    }

    .required-qualifications {
      margin-bottom: 16px;

      .req-title {
        font-size: 14px;
        color: #606266;
        margin: 0 0 8px 0;
      }

      .req-list {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
    }

    .card-actions {
      display: flex;
      justify-content: flex-start;
    }

    .dependency-tip {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 12px;
      padding: 8px 12px;
      background: #fdf6ec;
      border: 1px solid #faecd8;
      border-radius: 4px;
      font-size: 14px;
      color: #e6a23c;
    }
  }
}

.completion-banner {
  margin-top: 24px;
}

// 响应式设计
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .auth-grid {
    grid-template-columns: 1fr;
  }

  .enterprise-details {
    .el-row {
      .el-col {
        margin-bottom: 12px;
      }
    }
  }
}
</style> 