<template>
  <div class="select-enterprise-container">
    <el-card class="select-enterprise-card">
      <template #header>
        <div class="card-header">
          <h2>选择企业</h2>
          <p class="sub-title">请选择一个企业作为默认操作企业</p>
        </div>
      </template>
      
      <div v-if="loading" class="loading-wrapper">
        <el-skeleton :rows="3" animated />
      </div>
      
      <div v-else-if="enterpriseList.length > 0" class="enterprise-list">
        <el-radio-group v-model="selectedId" class="enterprise-radio-group">
          <el-radio 
            v-for="item in enterpriseList" 
            :key="item.id" 
            :label="item.id"
            class="enterprise-radio-item"
          >
            <div class="enterprise-info">
              <div class="enterprise-name">{{ item.name }}</div>
              <div class="enterprise-type" v-if="item.enterpriseType">
                {{ getEnterpriseTypeLabel(item.enterpriseType) }}
              </div>
            </div>
          </el-radio>
        </el-radio-group>
        
        <div class="action-buttons">
          <el-button type="primary" @click="handleSelect" :disabled="!selectedId" :loading="submitting">
            确认选择
          </el-button>
          <el-button @click="logout">退出登录</el-button>
        </div>
      </div>
      
      <div v-else class="empty-data">
        <el-empty description="暂无关联企业" />
        <div class="action-buttons">
          <el-button type="primary" @click="goToAuthGuide">立即认证</el-button>
          <el-button @click="logout">退出登录</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import * as LoginApi from '@/api/login'
import * as authUtil from '@/utils/auth'
import { UserRelationApi } from '@/api/enterprise/userRelation'
import { useUserStore } from '@/store/modules/user'

defineOptions({ name: 'SelectEnterprise' })

const router = useRouter()
const userStore = useUserStore()
const loading = ref(true)
const submitting = ref(false)
const enterpriseList = ref<any[]>([])
const selectedId = ref()

// 企业类型映射
const enterpriseTypeMap = {
  1: '产废',
  2: '回收',
  3: '处置',
  4: '物流',
  99: '其他'
}

// 获取企业类型标签
const getEnterpriseTypeLabel = (type) => {
  return enterpriseTypeMap[type] || '未知类型'
}

// 获取企业列表
const fetchEnterpriseList = async () => {
  loading.value = true
  try {
    const res = await UserRelationApi.getEnterpriseSimpleList()
    enterpriseList.value = res || []
    // 如果只有一个企业，默认选中
    if (enterpriseList.value.length === 1) {
      selectedId.value = enterpriseList.value[0].id
    }
  } catch (error) {
    console.error('获取企业列表失败:', error)
    ElMessage.error('获取企业列表失败，请稍后再试')
  } finally {
    loading.value = false
  }
}

// 选择企业
const handleSelect = async () => {
  if (!selectedId.value) {
    ElMessage.warning('请选择一个企业')
    return
  }
  
  submitting.value = true
  try {
    // 设置默认企业 - 从userStore获取用户ID
    const userId = userStore.getUser.id
    await UserRelationApi.setDefaultEnterprise({ 
      relationId: selectedId.value,
      userId: userId
    })
    ElMessage.success('设置默认企业成功')
    
    // 刷新用户信息 - 使用登录接口
    try {
      const res = await LoginApi.getInfo()
      
      // 检查是否设置成功
      if (!res.boundEnterpriseId) {
        ElMessage.warning('设置默认企业未生效，请稍后再试')
        return
      }
      
      // 跳转到首页
      router.push('/')
    } catch (error) {
      ElMessage.error('获取用户信息失败，请重新登录')
      await logout()
    }
  } catch (error) {
    console.error('设置默认企业失败:', error)
    ElMessage.error('设置默认企业失败，请稍后再试')
  } finally {
    submitting.value = false
  }
}

// 去认证页面
const goToAuthGuide = () => {
  router.push('/enterprise/auth-guide')
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

onMounted(() => {
  fetchEnterpriseList()
})
</script>

<style lang="scss" scoped>
.select-enterprise-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;
  
  .select-enterprise-card {
    width: 500px;
    max-width: 90%;
    
    .card-header {
      text-align: center;
      
      .sub-title {
        color: #909399;
        margin-top: 8px;
      }
    }
    
    .loading-wrapper {
      padding: 20px 0;
    }
    
    .enterprise-list {
      .enterprise-radio-group {
        display: flex;
        flex-direction: column;
        gap: 16px;
        width: 100%;
        
        .enterprise-radio-item {
          margin-right: 0;
          padding: 16px;
          border-radius: 4px;
          border: 1px solid #ebeef5;
          
          &:hover {
            background-color: #f5f7fa;
          }
          
          .enterprise-info {
            display: flex;
            flex-direction: column;
            
            .enterprise-name {
              font-weight: bold;
              font-size: 16px;
            }
            
            .enterprise-type {
              color: #909399;
              font-size: 12px;
              margin-top: 4px;
            }
          }
        }
      }
    }
    
    .action-buttons {
      margin-top: 24px;
      display: flex;
      justify-content: center;
      gap: 16px;
    }
    
    .empty-data {
      padding: 30px 0;
      text-align: center;
    }
  }
}
</style> 