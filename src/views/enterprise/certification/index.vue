<template>
  <div class="certification-container">
    <!-- 页面头部 -->
    <ContentWrap>
      <div class="header-section">
        <div class="header-title">
          <Icon icon="ep:user-filled" class="mr-2" />
          <span>认证中心</span>
        </div>
        <p class="header-desc">完善您的个人信息和企业认证，提升账户安全和信任度</p>
      </div>
    </ContentWrap>

    <!-- 认证概览 -->
    <ContentWrap v-if="!loading">
      <div class="overview-section">
        <div class="overview-cards">
          <div class="overview-card" :class="getPersonalStatusClass()">
            <div class="card-icon">
              <Icon icon="ep:user" class="icon-large" />
            </div>
            <div class="card-content">
              <h3 class="card-title">个人认证</h3>
              <p class="card-desc">{{ getPersonalStatusText() }}</p>
              <el-tag :type="getPersonalTagType()" size="small">
                {{ getPersonalStatusLabel() }}
              </el-tag>
            </div>
          </div>
          
          <div class="overview-card" :class="getEnterpriseStatusClass()">
            <div class="card-icon">
              <Icon icon="ep:office-building" class="icon-large" />
            </div>
            <div class="card-content">
              <h3 class="card-title">企业认证</h3>
              <p class="card-desc">{{ getEnterpriseStatusText() }}</p>
              <el-tag :type="getEnterpriseTagType()" size="small">
                {{ getEnterpriseStatusLabel() }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>
    </ContentWrap>

    <!-- 认证内容 -->
    <ContentWrap v-if="!loading">
      <el-tabs v-model="activeTab" class="certification-tabs">
        <el-tab-pane 
          label="个人认证" 
          name="personal"
          :disabled="!overview.canAccessPersonal"
        >
          <PersonalCertification 
            :certification="overview.personalCertification"
            @refresh="loadOverview"
          />
        </el-tab-pane>
        
        <el-tab-pane 
          label="企业认证" 
          name="enterprise"
          :disabled="!overview.canAccessEnterprise"
        >
          <EnterpriseCertification 
            :certification="overview.enterpriseCertification"
            @refresh="loadOverview"
          />
        </el-tab-pane>
      </el-tabs>
    </ContentWrap>

    <!-- 加载状态 -->
    <ContentWrap v-if="loading">
      <div class="loading-container">
        <el-skeleton :rows="6" animated />
      </div>
    </ContentWrap>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { CertificationApi, CertificationOverviewVO } from '@/api/enterprise/certification'
import PersonalCertification from './components/PersonalCertification.vue'
import EnterpriseCertification from './components/EnterpriseCertification.vue'

defineOptions({ name: 'Certification' })

const loading = ref(false)
const activeTab = ref('personal')
const overview = ref<CertificationOverviewVO>({
  personalCertification: {},
  enterpriseCertification: {},
  canAccessPersonal: true,
  canAccessEnterprise: false
})

// 加载认证概览
const loadOverview = async () => {
  loading.value = true
  try {
    const data = await CertificationApi.getCertificationOverview()
    overview.value = data
    
    // 如果个人认证已完成，默认显示企业认证tab
    if (data.personalCertification.status === 2 && data.canAccessEnterprise) {
      activeTab.value = 'enterprise'
    }
  } catch (error) {
    console.error('获取认证概览失败:', error)
    // 使用模拟数据
    overview.value = {
      personalCertification: {
        status: 0
      },
      enterpriseCertification: {
        status: 0
      },
      canAccessPersonal: true,
      canAccessEnterprise: true
    }
  } finally {
    loading.value = false
  }
}

// 个人认证状态相关方法
const getPersonalStatusClass = (): string => {
  const status = overview.value.personalCertification.status || 0
  switch (status) {
    case 0: return 'status-none'
    case 1: return 'status-pending'
    case 2: return 'status-success'
    case 3: return 'status-failed'
    default: return 'status-none'
  }
}

const getPersonalStatusText = (): string => {
  const status = overview.value.personalCertification.status || 0
  switch (status) {
    case 0: return '完善您的个人信息认证'
    case 1: return '个人认证正在审核中'
    case 2: return '个人认证已完成'
    case 3: return '个人认证审核未通过'
    default: return '完善您的个人信息认证'
  }
}

const getPersonalStatusLabel = (): string => {
  const status = overview.value.personalCertification.status || 0
  switch (status) {
    case 0: return '未认证'
    case 1: return '认证中'
    case 2: return '已认证'
    case 3: return '认证失败'
    default: return '未认证'
  }
}

const getPersonalTagType = (): string => {
  const status = overview.value.personalCertification.status || 0
  switch (status) {
    case 0: return 'info'
    case 1: return 'warning'
    case 2: return 'success'
    case 3: return 'danger'
    default: return 'info'
  }
}

// 企业认证状态相关方法
const getEnterpriseStatusClass = (): string => {
  const status = overview.value.enterpriseCertification.status || 0
  switch (status) {
    case 0: return 'status-none'
    case 1: return 'status-pending'
    case 2: return 'status-success'
    case 3: return 'status-failed'
    default: return 'status-none'
  }
}

const getEnterpriseStatusText = (): string => {
  const status = overview.value.enterpriseCertification.status || 0
  switch (status) {
    case 0: return '提交企业相关认证资料'
    case 1: return '企业认证正在审核中'
    case 2: return '企业认证已完成'
    case 3: return '企业认证审核未通过'
    default: return '提交企业相关认证资料'
  }
}

const getEnterpriseStatusLabel = (): string => {
  const status = overview.value.enterpriseCertification.status || 0
  switch (status) {
    case 0: return '未认证'
    case 1: return '认证中'
    case 2: return '已认证'
    case 3: return '认证失败'
    default: return '未认证'
  }
}

const getEnterpriseTagType = (): string => {
  const status = overview.value.enterpriseCertification.status || 0
  switch (status) {
    case 0: return 'info'
    case 1: return 'warning'
    case 2: return 'success'
    case 3: return 'danger'
    default: return 'info'
  }
}

// 初始化
onMounted(() => {
  loadOverview()
})
</script>

<style scoped lang="scss">
.certification-container {
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
    margin: 0;
    font-size: 14px;
  }
}

.overview-section {
  padding: 24px 0;
  
  .overview-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
    
    .overview-card {
      display: flex;
      align-items: center;
      padding: 24px;
      border-radius: 12px;
      border: 2px solid transparent;
      transition: all 0.3s ease;
      
      &.status-none {
        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        border-color: #e2e8f0;
      }
      
      &.status-pending {
        background: linear-gradient(135deg, #fef7e0 0%, #fdf4e1 100%);
        border-color: #f59e0b;
      }
      
      &.status-success {
        background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
        border-color: #0ea5e9;
      }
      
      &.status-failed {
        background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
        border-color: #ef4444;
      }
      
      .card-icon {
        margin-right: 16px;
        
        .icon-large {
          font-size: 48px;
          color: var(--el-color-primary);
        }
      }
      
      .card-content {
        flex: 1;
        
        .card-title {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--el-text-color-primary);
        }
        
        .card-desc {
          margin: 0 0 12px 0;
          color: var(--el-text-color-regular);
          font-size: 14px;
          line-height: 1.5;
        }
      }
    }
  }
}

.certification-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 24px;
    
    .el-tabs__nav-wrap {
      &::after {
        height: 2px;
        background: var(--el-border-color-light);
      }
    }
    
    .el-tabs__item {
      font-size: 16px;
      font-weight: 500;
      padding: 0 20px;
      height: 44px;
      line-height: 44px;
      
      &.is-active {
        color: var(--el-color-primary);
        font-weight: 600;
      }
      
      &.is-disabled {
        color: var(--el-text-color-disabled);
        cursor: not-allowed;
      }
    }
    
    .el-tabs__active-bar {
      height: 3px;
      background: var(--el-color-primary);
    }
  }
  
  :deep(.el-tabs__content) {
    padding: 0;
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
  }
  
  .overview-section {
    .overview-cards {
      grid-template-columns: 1fr;
      
      .overview-card {
        .card-icon {
          .icon-large {
            font-size: 40px;
          }
        }
        
        .card-content {
          .card-title {
            font-size: 16px;
          }
        }
      }
    }
  }
  
  .certification-tabs {
    :deep(.el-tabs__header) {
      .el-tabs__item {
        font-size: 14px;
        padding: 0 12px;
      }
    }
  }
}
</style> 