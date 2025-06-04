<template>
  <ContentWrap>
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="mb-20px">
      <el-col :span="6" v-for="stat in statistics" :key="stat.key">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" :style="{ backgroundColor: stat.color }">
              <el-icon :size="24" color="white">
                <component :is="stat.icon" />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷操作 -->
    <el-card class="mb-20px">
      <template #header>
        <span>快捷操作</span>
      </template>
      
      <div class="quick-actions">
        <el-button
          v-permission="['contract:contract:create']"
          type="primary"
          size="large"
          @click="handleCreate"
        >
          <el-icon><Plus /></el-icon>
          新建合同
        </el-button>
        
        <el-button
          v-permission="['contract:template:query']"
          type="success"
          size="large"
          @click="handleTemplate"
        >
          <el-icon><Document /></el-icon>
          合同模板
        </el-button>
        
        <el-button
          v-permission="['contract:type:query']"
          type="warning"
          size="large"
          @click="handleType"
        >
          <el-icon><Collection /></el-icon>
          合同类型
        </el-button>
        
        <el-button
          v-permission="['contract:statistics:query']"
          type="info"
          size="large"
          @click="handleStatistics"
        >
          <el-icon><DataAnalysis /></el-icon>
          统计分析
        </el-button>
      </div>
    </el-card>

    <el-row :gutter="20">
      <!-- 最近合同 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最近合同</span>
              <el-button type="primary" link @click="handleViewAll">
                查看全部
              </el-button>
            </div>
          </template>
          
          <div class="recent-contracts">
            <div
              v-for="contract in recentContracts"
              :key="contract.id"
              class="contract-item"
              @click="handleViewContract(contract)"
            >
              <div class="contract-info">
                <div class="contract-name">{{ contract.contractName }}</div>
                <div class="contract-meta">
                  <el-tag :type="getStatusInfo(contract.status).type" size="small">
                    {{ getStatusInfo(contract.status).label }}
                  </el-tag>
                  <span class="contract-time">{{ formatDate(contract.createTime) }}</span>
                </div>
              </div>
              <el-icon class="contract-arrow">
                <ArrowRight />
              </el-icon>
            </div>
            
            <el-empty v-if="!recentContracts.length" description="暂无最近合同" />
          </div>
        </el-card>
      </el-col>

      <!-- 待处理事项 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>待处理事项</span>
          </template>
          
          <div class="pending-items">
            <div
              v-for="item in pendingItems"
              :key="item.key"
              class="pending-item"
              @click="handlePendingItem(item)"
            >
              <div class="pending-icon" :style="{ backgroundColor: item.color }">
                <el-icon color="white">
                  <component :is="item.icon" />
                </el-icon>
              </div>
              <div class="pending-info">
                <div class="pending-title">{{ item.title }}</div>
                <div class="pending-count">{{ item.count }} 项</div>
              </div>
              <el-icon class="pending-arrow">
                <ArrowRight />
              </el-icon>
            </div>
            
            <el-empty v-if="!pendingItems.length" description="暂无待处理事项" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 即将到期合同 -->
    <el-card class="mt-20px">
      <template #header>
        <div class="card-header">
          <span>即将到期合同</span>
          <el-button type="warning" link @click="handleExpiringContracts">
            查看全部
          </el-button>
        </div>
      </template>
      
      <el-table :data="expiringContracts" stripe>
        <el-table-column label="合同名称" prop="contractName" show-overflow-tooltip />
        <el-table-column label="合同编号" prop="contractNo" width="180" />
        <el-table-column label="状态" prop="status" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusInfo(row.status).type">
              {{ getStatusInfo(row.status).label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="到期日期" prop="expiryDate" width="120" align="center">
          <template #default="{ row }">
            <span class="text-orange-500">{{ formatDate(row.expiryDate) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="剩余天数" width="100" align="center">
          <template #default="{ row }">
            <el-tag type="warning" size="small">
              {{ getRemainingDays(row.expiryDate) }} 天
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleViewContract(row)">
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <el-empty v-if="!expiringContracts.length" description="暂无即将到期的合同" />
    </el-card>
  </ContentWrap>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Plus, 
  Document, 
  Collection, 
  DataAnalysis, 
  ArrowRight,
  Edit,
  Check,
  Warning,
  Clock
} from '@element-plus/icons-vue'
import { useContractStore } from '@/store/modules/contract'
import { contractApi } from '@/api/contract/contract'
import type { ContractResp } from '@/api/contract/contract'

defineOptions({ name: 'ContractHome' })

const router = useRouter()
const contractStore = useContractStore()

// 响应式数据
const recentContracts = ref<ContractResp[]>([])
const expiringContracts = ref<ContractResp[]>([])

// 统计数据
const statistics = ref([
  {
    key: 'total',
    label: '合同总数',
    value: 0,
    icon: Document,
    color: '#409eff'
  },
  {
    key: 'pending',
    label: '待审核',
    value: 0,
    icon: Edit,
    color: '#e6a23c'
  },
  {
    key: 'active',
    label: '已生效',
    value: 0,
    icon: Check,
    color: '#67c23a'
  },
  {
    key: 'expiring',
    label: '即将到期',
    value: 0,
    icon: Warning,
    color: '#f56c6c'
  }
])

// 待处理事项
const pendingItems = ref([
  {
    key: 'review',
    title: '待审核合同',
    count: 0,
    icon: Edit,
    color: '#e6a23c'
  },
  {
    key: 'sign',
    title: '待签署合同',
    count: 0,
    icon: Check,
    color: '#409eff'
  },
  {
    key: 'expiring',
    title: '即将到期',
    count: 0,
    icon: Clock,
    color: '#f56c6c'
  }
])

// 获取状态信息
const getStatusInfo = contractStore.getStatusInfo

// 格式化日期
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}

// 计算剩余天数
const getRemainingDays = (expiryDate: string) => {
  const now = new Date()
  const expiry = new Date(expiryDate)
  const diffTime = expiry.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}

// 获取统计数据
const getStatistics = async () => {
  try {
    const stats = await contractApi.getContractStatistics()
    
    statistics.value[0].value = stats.total || 0
    statistics.value[1].value = stats.pending || 0
    statistics.value[2].value = stats.active || 0
    statistics.value[3].value = stats.expiring || 0
    
    // 更新待处理事项
    pendingItems.value[0].count = stats.pending || 0
    pendingItems.value[1].count = stats.waitingSign || 0
    pendingItems.value[2].count = stats.expiring || 0
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 获取最近合同
const getRecentContracts = async () => {
  try {
    const result = await contractApi.getContractPage({
      pageNo: 1,
      pageSize: 5
    })
    recentContracts.value = result.list
  } catch (error) {
    console.error('获取最近合同失败:', error)
  }
}

// 获取即将到期合同
const getExpiringContracts = async () => {
  try {
    expiringContracts.value = await contractApi.getExpiringContracts(30)
  } catch (error) {
    console.error('获取即将到期合同失败:', error)
  }
}

// 新建合同
const handleCreate = () => {
  router.push('/contract/create')
}

// 合同模板
const handleTemplate = () => {
  router.push('/contract/template')
}

// 合同类型
const handleType = () => {
  router.push('/contract/type')
}

// 统计分析
const handleStatistics = () => {
  router.push('/contract/statistics')
}

// 查看全部合同
const handleViewAll = () => {
  router.push('/contract/list')
}

// 查看合同详情
const handleViewContract = (contract: ContractResp) => {
  router.push(`/contract/detail/${contract.id}`)
}

// 处理待处理事项
const handlePendingItem = (item: any) => {
  const routeMap = {
    review: '/contract/list?status=1',
    sign: '/contract/list?status=3',
    expiring: '/contract/list?expiring=true'
  }
  
  const route = routeMap[item.key]
  if (route) {
    router.push(route)
  }
}

// 查看即将到期合同
const handleExpiringContracts = () => {
  router.push('/contract/list?expiring=true')
}

// 初始化
onMounted(async () => {
  await Promise.all([
    getStatistics(),
    getRecentContracts(),
    getExpiringContracts()
  ])
})
</script>

<style scoped>
.stat-card {
  cursor: pointer;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  line-height: 1;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.quick-actions {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.recent-contracts {
  max-height: 300px;
  overflow-y: auto;
}

.contract-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.3s;
}

.contract-item:hover {
  background-color: #f5f7fa;
  padding-left: 10px;
  padding-right: 10px;
  margin-left: -10px;
  margin-right: -10px;
  border-radius: 4px;
}

.contract-item:last-child {
  border-bottom: none;
}

.contract-info {
  flex: 1;
}

.contract-name {
  font-size: 14px;
  color: #303133;
  margin-bottom: 5px;
  font-weight: 500;
}

.contract-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.contract-time {
  font-size: 12px;
  color: #909399;
}

.contract-arrow {
  color: #c0c4cc;
  transition: all 0.3s;
}

.contract-item:hover .contract-arrow {
  color: #409eff;
  transform: translateX(3px);
}

.pending-items {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.pending-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.pending-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.pending-icon {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.pending-info {
  flex: 1;
}

.pending-title {
  font-size: 14px;
  color: #303133;
  margin-bottom: 3px;
  font-weight: 500;
}

.pending-count {
  font-size: 12px;
  color: #909399;
}

.pending-arrow {
  color: #c0c4cc;
  transition: all 0.3s;
}

.pending-item:hover .pending-arrow {
  color: #409eff;
  transform: translateX(3px);
}

.text-orange-500 {
  color: #ed8936;
}

.mb-20px {
  margin-bottom: 20px;
}

.mt-20px {
  margin-top: 20px;
}
</style> 