<template>
  <div class="app-appointment-page">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input 
        v-model="queryParams.appointmentNo" 
        placeholder="搜索预约单号"
        clearable
        @clear="handleQuery"
        @keyup.enter="handleQuery"
        class="search-input"
      >
        <template #suffix>
          <el-icon @click="handleQuery" class="search-icon">
            <Search />
          </el-icon>
        </template>
      </el-input>
    </div>

    <!-- 筛选标签 -->
    <div class="filter-tabs">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="全部" name="all" />
        <el-tab-pane label="待处理" name="pending" />
        <el-tab-pane label="待确认" name="waiting" />
        <el-tab-pane label="已确认" name="confirmed" />
        <el-tab-pane label="已取消" name="cancelled" />
      </el-tabs>
    </div>

    <!-- 预约列表 -->
    <div class="appointment-list" v-loading="loading">
      <div 
        v-for="item in list" 
        :key="item.id" 
        class="appointment-item"
        @click="openDetail(item.id!)"
      >
        <div class="item-header">
          <div class="appointment-no">{{ item.appointmentNo }}</div>
          <StatusTag :status="item.appointmentStatus" size="small" />
        </div>
        
        <div class="item-content">
          <div class="waste-info">
            <div class="waste-name">{{ item.wasteName }}</div>
            <div class="waste-detail">
              {{ item.wasteCode }} | {{ item.estimatedQuantity }}{{ item.quantityUnit }}
            </div>
          </div>
          
          <div class="time-info">
            <div class="pickup-time">
              <el-icon><Clock /></el-icon>
              期望取货：{{ safeFormatDate(item.expectedPickupTime, 'MM-DD HH:mm') }}
            </div>
          </div>
          
          <div class="enterprise-info" v-if="item.recyclerEnterpriseName">
            <div class="recycler">
              <el-icon><OfficeBuilding /></el-icon>
              回收企业：{{ item.recyclerEnterpriseName }}
            </div>
          </div>
          
          <div class="address-info">
            <div class="pickup-address">
              <el-icon><Location /></el-icon>
              {{ item.pickupAddress }}
            </div>
          </div>
        </div>
        
        <div class="item-footer">
          <div class="create-time">{{ safeFormatDate(item.createTime) }}</div>
          <div class="actions">
            <el-tag 
              v-if="item.isUrgent" 
              type="danger" 
              size="small"
              class="urgent-tag"
            >
              紧急
            </el-tag>
            <el-button 
              v-if="canCancel(item.appointmentStatus)" 
              type="danger" 
              size="small" 
              @click.stop="handleCancel(item)"
            >
              取消
            </el-button>
          </div>
        </div>
      </div>
      
      <!-- 空状态 -->
      <el-empty 
        v-if="!loading && list.length === 0" 
        description="暂无预约记录"
        :image-size="120"
      />
    </div>

    <!-- 加载更多 -->
    <div class="load-more" v-if="hasMore && list.length > 0">
      <el-button 
        @click="loadMore" 
        :loading="loadingMore"
        class="load-more-btn"
      >
        加载更多
      </el-button>
    </div>

    <!-- 浮动操作按钮 -->
    <el-affix :offset="80" position="bottom">
      <div class="fab-container">
        <el-button 
          type="primary" 
          size="large" 
          circle 
          @click="$router.push('/waste/app/appointment/create')"
          class="fab-button"
        >
          <el-icon><Plus /></el-icon>
        </el-button>
      </div>
    </el-affix>

    <!-- 详情弹窗 -->
    <AppointmentDetail ref="detailRef" @success="getList" />
  </div>
</template>

<script setup lang="ts">
/**
 * APP端预约列表页面
 * 
 * 功能：
 * - 移动端适配的预约列表
 * - 支持搜索和筛选
 * - 无限滚动加载
 * - 快速操作
 * 
 * @author AI Assistant
 * @date 2024-01-01
 * @version 1.0.0
 */

import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, Clock, OfficeBuilding, Location } from '@element-plus/icons-vue'
import { formatDate } from '@/utils/formatTime'
import { getMyAppointmentPage, cancelMyAppointment } from '@/api/waste/appointment'
import { AppointmentStatus, type AppAppointmentPageReqVO, type AppointmentVO } from '@/types/waste/appointment'
import StatusTag from '@/components/waste/appointment/StatusTag.vue'
import AppointmentDetail from '../detail.vue'

defineOptions({ name: 'WasteAppAppointment' })

const router = useRouter()

// 响应式数据
const loading = ref(false)
const loadingMore = ref(false)
const list = ref<AppointmentVO[]>([])
const hasMore = ref(true)
const activeTab = ref('all')
const detailRef = ref()

const queryParams = reactive<AppAppointmentPageReqVO>({
  pageNo: 1,
  pageSize: 20,
  appointmentNo: '',
  appointmentStatus: undefined,
  wasteCode: ''
})

// 方法定义
const getList = async (isLoadMore = false) => {
  if (isLoadMore) {
    loadingMore.value = true
  } else {
    loading.value = true
    queryParams.pageNo = 1
    list.value = []
  }
  
  try {
    const data = await getMyAppointmentPage(queryParams)
    if (isLoadMore) {
      list.value.push(...data.list)
    } else {
      list.value = data.list
    }
    hasMore.value = data.list.length === queryParams.pageSize
  } catch (error) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

const handleQuery = () => {
  getList()
}

const handleTabChange = (tabName: string) => {
  const statusMap = {
    all: undefined,
    pending: AppointmentStatus.PENDING,
    waiting: AppointmentStatus.WAITING_RECYCLER_CONFIRM,
    confirmed: AppointmentStatus.CONFIRMED,
    cancelled: AppointmentStatus.CANCELLED
  }
  queryParams.appointmentStatus = statusMap[tabName]
  getList()
}

const loadMore = () => {
  if (queryParams.pageNo) {
    queryParams.pageNo++
  } else {
    queryParams.pageNo = 2
  }
  getList(true)
}

const openDetail = (id: number) => {
  detailRef.value.open(id)
}

const handleCancel = async (item: any) => {
  const { value: cancelReason } = await ElMessageBox.prompt(
    '请输入取消原因',
    '取消预约',
    { 
      inputType: 'textarea',
      inputValidator: (value) => !!value || '取消原因不能为空',
      inputErrorMessage: '取消原因不能为空'
    }
  ).catch(() => ({ value: '' }))
  
  if (!cancelReason) return
  
  try {
    await cancelMyAppointment(item.id, cancelReason)
    ElMessage.success('取消成功')
    getList()
  } catch (error) {
    ElMessage.error('取消失败')
  }
}

const canCancel = (status: AppointmentStatus) => {
  return status === AppointmentStatus.PENDING || status === AppointmentStatus.WAITING_RECYCLER_CONFIRM
}

// 辅助函数：安全的日期格式化
const safeFormatDate = (dateStr?: string, format?: string) => {
  if (!dateStr) return ''
  return formatDate(new Date(dateStr), format)
}

onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
.app-appointment-page {
  padding: 16px;
  background-color: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 100px; // 为浮动按钮留出空间
}

.search-bar {
  margin-bottom: 16px;
  
  .search-input {
    border-radius: 20px;
    
    :deep(.el-input__wrapper) {
      border-radius: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }
  
  .search-icon {
    cursor: pointer;
    color: #409eff;
    
    &:hover {
      color: #337ecc;
    }
  }
}

.filter-tabs {
  background: white;
  border-radius: 12px;
  margin-bottom: 16px;
  padding: 0 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  :deep(.el-tabs__header) {
    margin: 0;
  }
  
  :deep(.el-tabs__nav-wrap::after) {
    display: none;
  }
  
  :deep(.el-tabs__item) {
    font-weight: 500;
  }
  
  :deep(.el-tabs__item.is-active) {
    color: #409eff;
  }
}

.appointment-list {
  .appointment-item {
    background: white;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      transform: translateY(-2px);
    }
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  
  .appointment-no {
    font-weight: 600;
    color: #303133;
    font-size: 16px;
  }
}

.item-content {
  margin-bottom: 12px;
  
  .waste-info {
    margin-bottom: 8px;
    
    .waste-name {
      font-weight: 500;
      color: #606266;
      margin-bottom: 4px;
      font-size: 15px;
    }
    
    .waste-detail {
      font-size: 13px;
      color: #909399;
    }
  }
  
  .time-info, .enterprise-info, .address-info {
    font-size: 14px;
    color: #606266;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    
    .el-icon {
      margin-right: 6px;
      color: #909399;
    }
  }
  
  .pickup-time {
    color: #e6a23c;
  }
  
  .recycler {
    color: #67c23a;
  }
  
  .pickup-address {
    color: #909399;
    font-size: 13px;
  }
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #909399;
  
  .create-time {
    flex: 1;
  }
  
  .actions {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .urgent-tag {
      margin-right: 8px;
    }
  }
}

.load-more {
  text-align: center;
  margin-top: 20px;
  
  .load-more-btn {
    border-radius: 20px;
    padding: 12px 32px;
  }
}

.fab-container {
  position: fixed;
  bottom: 80px;
  right: 20px;
  z-index: 1000;
  
  .fab-button {
    width: 56px;
    height: 56px;
    box-shadow: 0 4px 16px rgba(64, 158, 255, 0.3);
    
    &:hover {
      box-shadow: 0 6px 20px rgba(64, 158, 255, 0.4);
    }
    
    .el-icon {
      font-size: 24px;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .app-appointment-page {
    padding: 12px;
  }
  
  .appointment-item {
    padding: 12px !important;
  }
  
  .item-header .appointment-no {
    font-size: 14px;
  }
  
  .waste-info .waste-name {
    font-size: 14px;
  }
}
</style> 