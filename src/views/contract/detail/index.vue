<template>
  <ContentWrap>
    <!-- 合同基本信息头部 -->
    <el-card v-loading="loading" class="contract-header-card">
      <div class="contract-header">
        <div class="header-left">
          <div class="contract-title">
            <div class="title-content">
              <h2>{{ contract?.contractName }}</h2>
              <div class="contract-meta">
                <span class="contract-no">
                  <Icon icon="ep:tickets" />
                  合同编号：{{ contract?.contractNo }}
                </span>
                <span class="contract-type">
                  <Icon icon="ep:collection-tag" />
                  类型：{{ contract?.typeName }}
                </span>
              </div>
            </div>
          </div>
          <div class="header-status">
            <el-tag :type="getStatusInfo(contract?.status || 0).type" size="large" effect="dark" class="status-tag">
              <Icon icon="ep:info-filled" />
              {{ getStatusInfo(contract?.status || 0).label }}
            </el-tag>
          </div>
        </div>
        <div class="header-actions">
          <div class="primary-actions">
            <el-button
              v-permission="['contract:contract:update']"
              v-if="contract?.status === 0"
              type="primary"
              size="large"
              class="action-btn primary-btn"
              @click="handleEdit"
            >
              <Icon icon="ep:edit" />
              编辑合同
            </el-button>
            
            <el-button
              v-permission="['contract:contract:submit']"
              v-if="contract?.status === 0"
              type="warning"
              size="large"
              class="action-btn warning-btn"
              @click="handleSubmit"
            >
              <Icon icon="ep:upload" />
              提交审核
            </el-button>
            
            <el-button
              v-permission="['contract:contract:approve']"
              v-if="contract?.status === 1"
              type="success"
              size="large"
              class="action-btn success-btn"
              @click="handleApprove"
            >
              <Icon icon="ep:circle-check" />
              审核通过
            </el-button>
            
            <el-button
              v-permission="['contract:contract:sign']"
              v-if="contract?.status === 3"
              type="warning"
              size="large"
              class="action-btn sign-btn"
              @click="handleSign"
            >
              <Icon icon="ep:edit-pen" />
              立即签署
            </el-button>
          </div>
          
          <div class="secondary-actions">
            <el-dropdown @command="handleCommand" trigger="click" class="more-dropdown">
              <el-button class="more-btn" size="large">
                <Icon icon="ep:more" />
                <span class="more-text">更多</span>
                <Icon icon="ep:arrow-down" class="arrow-icon" />
              </el-button>
              <template #dropdown>
                <el-dropdown-menu class="custom-dropdown">
                  <el-dropdown-item command="export" class="dropdown-item">
                    <Icon icon="ep:download" />
                    <span>导出PDF</span>
                  </el-dropdown-item>
                  <el-dropdown-item command="print" class="dropdown-item">
                    <Icon icon="ep:printer" />
                    <span>打印合同</span>
                  </el-dropdown-item>
                  <el-dropdown-item command="copy" class="dropdown-item">
                    <Icon icon="ep:copy-document" />
                    <span>复制合同</span>
                  </el-dropdown-item>
                  <el-dropdown-item 
                    v-if="[0, 10].includes(contract?.status || 0)"
                    command="delete"
                    divided
                    class="dropdown-item danger-item"
                  >
                    <Icon icon="ep:delete" />
                    <span>删除合同</span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 快速统计卡片 -->
    <el-row :gutter="20" class="stats-cards">
      <el-col :span="6">
        <el-card class="stat-card amount-card">
          <div class="stat-content">
            <div class="stat-icon">
              <Icon icon="ep:money" />
            </div>
            <div class="stat-info">
              <div class="stat-value">
                {{ contract?.totalAmount ? formatCurrency(contract.totalAmount, contract.currency) : '-' }}
              </div>
              <div class="stat-label">合同总金额</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card priority-card">
          <div class="stat-content">
            <div class="stat-icon">
              <Icon icon="ep:flag" />
            </div>
            <div class="stat-info">
              <div class="stat-value">
                <el-tag :type="getPriorityInfo(contract?.priorityLevel || 1).type" size="large">
                  {{ getPriorityInfo(contract?.priorityLevel || 1).label }}
                </el-tag>
              </div>
              <div class="stat-label">优先级</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card date-card">
          <div class="stat-content">
            <div class="stat-icon">
              <Icon icon="ep:calendar" />
            </div>
            <div class="stat-info">
              <div class="stat-value">
                {{ contract?.effectiveDate ? formatDate(contract.effectiveDate) : '-' }}
              </div>
              <div class="stat-label">生效日期</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card expiry-card">
          <div class="stat-content">
            <div class="stat-icon">
              <Icon icon="ep:alarm-clock" />
            </div>
            <div class="stat-info">
              <div class="stat-value" :class="contract?.expiryDate ? getExpiryClass(contract.expiryDate) : ''">
                {{ contract?.expiryDate ? formatDate(contract.expiryDate) : '-' }}
              </div>
              <div class="stat-label">到期日期</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Tab页内容 -->
    <el-card class="content-card">
      <el-tabs v-model="activeTab" type="border-card" class="custom-tabs">
        <!-- 合同详情 -->
        <el-tab-pane name="detail">
          <template #label>
            <span class="tab-label">
              <Icon icon="ep:document" />
              合同详情
            </span>
          </template>
          <div class="detail-content">
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="info-section">
                  <h3 class="section-title">
                    <Icon icon="ep:info-filled" />
                    基本信息
                  </h3>
                  <el-descriptions :column="1" border class="custom-descriptions">
                    <el-descriptions-item label="合同名称">
                      <span class="desc-value">{{ contract?.contractName }}</span>
                    </el-descriptions-item>
                    <el-descriptions-item label="合同类型">
                      <el-tag type="primary">{{ contract?.typeName }}</el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="合同状态">
                      <el-tag :type="getStatusInfo(contract?.status || 0).type" effect="dark">
                        {{ getStatusInfo(contract?.status || 0).label }}
                      </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="主要负责企业">
                      <span class="desc-value">{{ contract?.primaryOwnerEnterpriseId || '-' }}</span>
                    </el-descriptions-item>
                    <el-descriptions-item label="电子合同">
                      <el-tag :type="contract?.isElectronic ? 'success' : 'info'" effect="light">
                        <Icon :icon="contract?.isElectronic ? 'ep:check' : 'ep:close'" />
                        {{ contract?.isElectronic ? '是' : '否' }}
                      </el-tag>
                    </el-descriptions-item>
                  </el-descriptions>
                </div>
              </el-col>
              
              <el-col :span="12">
                <div class="info-section">
                  <h3 class="section-title">
                    <Icon icon="ep:timer" />
                    时间信息
                  </h3>
                  <el-descriptions :column="1" border class="custom-descriptions">
                    <el-descriptions-item label="创建时间">
                      <span class="desc-value">
                        <Icon icon="ep:clock" />
                        {{ contract?.createTime ? formatDate(contract.createTime) : '-' }}
                      </span>
                    </el-descriptions-item>
                    <el-descriptions-item label="更新时间">
                      <span class="desc-value">
                        <Icon icon="ep:refresh" />
                        {{ contract?.updateTime ? formatDate(contract.updateTime) : '-' }}
                      </span>
                    </el-descriptions-item>
                    <el-descriptions-item label="生效日期">
                      <span class="desc-value success-text">
                        <Icon icon="ep:calendar" />
                        {{ contract?.effectiveDate ? formatDate(contract.effectiveDate) : '-' }}
                      </span>
                    </el-descriptions-item>
                    <el-descriptions-item label="到期日期">
                      <span v-if="contract?.expiryDate" :class="['desc-value', getExpiryClass(contract.expiryDate)]">
                        <Icon icon="ep:alarm-clock" />
                        {{ formatDate(contract.expiryDate) }}
                      </span>
                      <span v-else class="desc-value">-</span>
                    </el-descriptions-item>
                  </el-descriptions>
                </div>
              </el-col>
            </el-row>

            <!-- 备注信息 -->
            <div v-if="contract?.remark" class="info-section">
              <h3 class="section-title">
                <Icon icon="ep:chat-line-square" />
                备注信息
              </h3>
              <el-card class="remark-card">
                <p class="remark-text">{{ contract.remark }}</p>
              </el-card>
            </div>

            <!-- 合同内容 -->
            <div class="info-section">
              <h3 class="section-title">
                <Icon icon="ep:document-copy" />
                合同内容
              </h3>
              <el-card class="content-card-inner">
                <div class="content-viewer" v-html="contract?.content"></div>
              </el-card>
            </div>
          </div>
        </el-tab-pane>

        <!-- 版本历史 -->
        <el-tab-pane name="versions">
          <template #label>
            <span class="tab-label">
              <Icon icon="ep:clock" />
              版本历史
            </span>
          </template>
          <div class="versions-content">
            <el-timeline class="custom-timeline">
              <el-timeline-item
                v-for="version in versions"
                :key="version.id"
                :timestamp="formatDate(version.createTime)"
                placement="top"
                type="primary"
              >
                <el-card class="timeline-card">
                  <div class="version-header">
                    <h4>
                      <Icon icon="ep:document" />
                      版本 {{ version.version }}
                    </h4>
                    <div class="version-actions">
                      <el-button type="primary" link @click="viewVersion(version)">
                        <Icon icon="ep:view" />
                        查看
                      </el-button>
                      <el-button type="success" link @click="compareVersion(version)">
                        <Icon icon="ep:sort" />
                        对比
                      </el-button>
                    </div>
                  </div>
                  <p class="version-desc">{{ version.description }}</p>
                </el-card>
              </el-timeline-item>
            </el-timeline>
          </div>
        </el-tab-pane>

        <!-- 参与方 -->
        <el-tab-pane name="parties">
          <template #label>
            <span class="tab-label">
              <Icon icon="ep:user" />
              参与方
            </span>
          </template>
          <div class="parties-content">
            <div class="parties-header">
              <h3 class="section-title">
                <Icon icon="ep:user-filled" />
                参与方管理
              </h3>
              <el-button
                v-permission="['contract:party:create']"
                type="primary"
                @click="handleAddParty"
              >
                <Icon icon="ep:plus" />
                添加参与方
              </el-button>
            </div>
            
            <el-table :data="parties" class="custom-table">
              <el-table-column label="企业名称" prop="enterpriseName" min-width="200">
                <template #default="{ row }">
                  <div class="enterprise-cell">
                    <Icon icon="ep:office-building" />
                    <span>{{ row.enterpriseName }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="参与方类型" prop="partyType" width="120">
                <template #default="{ row }">
                  <el-tag :type="getPartyTypeInfo(row.partyType).type" effect="dark">
                    {{ getPartyTypeInfo(row.partyType).label }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="签署状态" prop="signStatus" width="120">
                <template #default="{ row }">
                  <el-tag :type="getSignStatusInfo(row.signStatus).type" effect="light">
                    <Icon :icon="row.signStatus === 1 ? 'ep:check' : row.signStatus === 2 ? 'ep:close' : 'ep:clock'" />
                    {{ getSignStatusInfo(row.signStatus).label }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="签署人" prop="signatoryName" width="120">
                <template #default="{ row }">
                  <span v-if="row.signatoryName" class="signatory-name">
                    <Icon icon="ep:user" />
                    {{ row.signatoryName }}
                  </span>
                  <span v-else class="text-gray">-</span>
                </template>
              </el-table-column>
              <el-table-column label="签署时间" prop="signTime" width="180">
                <template #default="{ row }">
                  <span v-if="row.signTime" class="sign-time">
                    <Icon icon="ep:clock" />
                    {{ formatDate(row.signTime) }}
                  </span>
                  <span v-else class="text-gray">-</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150" fixed="right">
                <template #default="{ row }">
                  <div class="action-buttons">
                    <el-button
                      v-if="row.signStatus === 0"
                      type="warning"
                      link
                      @click="handlePartySign(row)"
                    >
                      <Icon icon="ep:edit-pen" />
                      签署
                    </el-button>
                    <el-button
                      v-permission="['contract:party:delete']"
                      type="danger"
                      link
                      @click="handleRemoveParty(row)"
                    >
                      <Icon icon="ep:delete" />
                      移除
                    </el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 附件管理 -->
        <el-tab-pane name="attachments">
          <template #label>
            <span class="tab-label">
              <Icon icon="ep:paperclip" />
              附件管理
            </span>
          </template>
          <div class="attachments-content">
            <div class="upload-section">
              <h3 class="section-title">
                <Icon icon="ep:upload-filled" />
                上传附件
              </h3>
              <UploadFile
                v-model="attachments"
                :limit="10"
                :file-size="50"
                :file-type="['doc', 'docx', 'pdf', 'jpg', 'png']"
                @upload-success="handleAttachmentUpload"
                class="custom-upload"
              />
            </div>
            
            <div class="attachments-list">
              <h3 class="section-title">
                <Icon icon="ep:folder" />
                附件列表
              </h3>
              <el-table :data="attachments" class="custom-table">
                <el-table-column label="文件名" prop="name" min-width="200">
                  <template #default="{ row }">
                    <div class="file-cell">
                      <Icon icon="ep:document" />
                      <span>{{ row.name }}</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="文件大小" prop="size" width="120">
                  <template #default="{ row }">
                    <el-tag type="info" size="small">
                      {{ formatFileSize(row.size) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="上传时间" prop="createTime" width="180">
                  <template #default="{ row }">
                    <span class="upload-time">
                      <Icon icon="ep:clock" />
                      {{ formatDate(row.createTime) }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="150" fixed="right">
                  <template #default="{ row }">
                    <div class="action-buttons">
                      <el-button type="primary" link @click="downloadAttachment(row)">
                        <Icon icon="ep:download" />
                        下载
                      </el-button>
                      <el-button type="danger" link @click="deleteAttachment(row)">
                        <Icon icon="ep:delete" />
                        删除
                      </el-button>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-tab-pane>

        <!-- 关联对象 -->
        <el-tab-pane name="links">
          <template #label>
            <span class="tab-label">
              <Icon icon="ep:link" />
              关联对象
            </span>
          </template>
          <div class="links-content">
            <el-empty description="暂无关联对象" :image-size="120">
              <template #image>
                <Icon icon="ep:connection" style="font-size: 120px; color: #e6e8eb;" />
              </template>
            </el-empty>
          </div>
        </el-tab-pane>

        <!-- 操作日志 -->
        <el-tab-pane name="logs">
          <template #label>
            <span class="tab-label">
              <Icon icon="ep:list" />
              操作日志
            </span>
          </template>
          <div class="logs-content">
            <h3 class="section-title">
              <Icon icon="ep:clock" />
              操作记录
            </h3>
            <el-timeline class="custom-timeline">
              <el-timeline-item
                v-for="log in operateLogs"
                :key="log.id"
                :timestamp="formatDate(log.createTime)"
                placement="top"
                type="primary"
              >
                <el-card class="timeline-card log-card">
                  <div class="log-item">
                    <div class="log-header">
                      <div class="log-user">
                        <Icon icon="ep:user" />
                        {{ log.operatorName }}
                      </div>
                      <div class="log-action">
                        <el-tag type="primary" size="small">{{ log.action }}</el-tag>
                      </div>
                    </div>
                    <div class="log-detail">{{ log.detail }}</div>
                  </div>
                </el-card>
              </el-timeline-item>
            </el-timeline>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 状态流转图 -->
    <ContractStatusFlow
      v-if="contract"
      :current-status="contract.status"
      class="status-flow-card"
    />
  </ContentWrap>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useContractStore } from '@/store/modules/contract'
import { contractPartyApi } from '@/api/contract/contract'
import ContractStatusFlow from '../components/ContractStatusFlow.vue'
import type { ContractResp, ContractParty } from '@/api/contract/contract'

defineOptions({ name: 'ContractDetail' })

const router = useRouter()
const route = useRoute()
const contractStore = useContractStore()

// 响应式数据
const loading = ref(false)
const activeTab = ref('detail')
const contract = ref<ContractResp>()
const parties = ref<ContractParty[]>([])
const versions = ref<any[]>([])
const attachments = ref<any[]>([])
const operateLogs = ref<any[]>([])

// 获取状态信息
const getStatusInfo = contractStore.getStatusInfo
const getPriorityInfo = contractStore.getPriorityInfo

// 参与方类型信息
const getPartyTypeInfo = (type: number) => {
  const typeMap = {
    1: { label: '甲方', type: 'success' },
    2: { label: '乙方', type: 'primary' },
    3: { label: '丙方', type: 'warning' },
    4: { label: '见证方', type: 'info' }
  }
  return typeMap[type] || { label: '未知', type: 'info' }
}

// 签署状态信息
const getSignStatusInfo = (status: number) => {
  const statusMap = {
    0: { label: '未签署', type: 'info' },
    1: { label: '已签署', type: 'success' },
    2: { label: '拒绝签署', type: 'danger' }
  }
  return statusMap[status] || { label: '未知', type: 'info' }
}

// 格式化货币
const formatCurrency = (amount: number, currency: string = 'CNY') => {
  const currencyMap = {
    CNY: '¥',
    USD: '$',
    EUR: '€'
  }
  const symbol = currencyMap[currency] || currency
  return `${symbol}${amount.toLocaleString()}`
}

// 格式化日期
const formatDate = (date: string) => {
  return new Date(date).toLocaleString()
}

// 格式化文件大小
const formatFileSize = (size: number) => {
  if (size < 1024) return `${size}B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)}KB`
  return `${(size / (1024 * 1024)).toFixed(1)}MB`
}

// 获取到期日期样式
const getExpiryClass = (expiryDate: string) => {
  const now = new Date()
  const expiry = new Date(expiryDate)
  const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'danger-text' // 已过期
  if (diffDays <= 30) return 'warning-text' // 即将到期
  return 'success-text'
}

// 获取合同详情
const getContractDetail = async () => {
  const id = Number(route.params.id)
  if (!id) return
  
  loading.value = true
  try {
    contract.value = await contractStore.fetchContractDetail(id)
    
    // 加载相关数据
    await Promise.all([
      getContractParties(id),
      getVersionHistory(id),
      getAttachments(id),
      getOperateLogs(id)
    ])
  } finally {
    loading.value = false
  }
}

// 获取参与方列表
const getContractParties = async (contractId: number) => {
  try {
    parties.value = await contractPartyApi.getContractParties(contractId)
  } catch (error) {
    console.error('获取参与方失败:', error)
  }
}

// 获取版本历史（模拟数据）
const getVersionHistory = async (contractId: number) => {
  versions.value = [
    {
      id: 1,
      version: '1.0',
      description: '初始版本',
      createTime: '2024-01-01 10:00:00'
    }
  ]
}

// 获取附件列表（模拟数据）
const getAttachments = async (contractId: number) => {
  attachments.value = []
}

// 获取操作日志（模拟数据）
const getOperateLogs = async (contractId: number) => {
  operateLogs.value = [
    {
      id: 1,
      operatorName: '张三',
      action: '创建合同',
      detail: '创建了新的合同',
      createTime: '2024-01-01 10:00:00'
    }
  ]
}

// 编辑合同
const handleEdit = () => {
  router.push(`/contract/edit/${contract.value?.id}`)
}

// 提交审核
const handleSubmit = async () => {
  try {
    await ElMessageBox.confirm('确认提交该合同进行审核吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await contractStore.submitContract(contract.value!.id)
    ElMessage.success('提交成功')
    getContractDetail()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('提交失败')
    }
  }
}

// 审核合同
const handleApprove = () => {
  router.push(`/contract/approve/${contract.value?.id}`)
}

// 签署合同
const handleSign = () => {
  router.push(`/contract/sign/${contract.value?.id}`)
}

// 更多操作
const handleCommand = (command: string) => {
  switch (command) {
    case 'export':
      handleExport()
      break
    case 'print':
      handlePrint()
      break
    case 'copy':
      handleCopy()
      break
    case 'delete':
      handleDelete()
      break
  }
}

// 导出PDF
const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}

// 打印
const handlePrint = () => {
  window.print()
}

// 复制合同
const handleCopy = () => {
  ElMessage.info('复制功能开发中...')
}

// 删除合同
const handleDelete = async () => {
  try {
    await ElMessageBox.confirm(`确认删除合同"${contract.value?.contractName}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await contractStore.deleteContract(contract.value!.id)
    ElMessage.success('删除成功')
    router.push('/contract/list')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 添加参与方
const handleAddParty = () => {
  ElMessage.info('添加参与方功能开发中...')
}

// 参与方签署
const handlePartySign = (party: ContractParty) => {
  router.push(`/contract/sign/${contract.value?.id}/${party.id}`)
}

// 移除参与方
const handleRemoveParty = async (party: ContractParty) => {
  try {
    await ElMessageBox.confirm(`确认移除参与方"${party.enterpriseName}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await contractPartyApi.removeContractParty(party.id)
    ElMessage.success('移除成功')
    getContractParties(contract.value!.id)
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('移除失败')
    }
  }
}

// 附件上传成功
const handleAttachmentUpload = (file: any) => {
  ElMessage.success('附件上传成功')
  getAttachments(contract.value!.id)
}

// 下载附件
const downloadAttachment = (attachment: any) => {
  ElMessage.info('下载功能开发中...')
}

// 删除附件
const deleteAttachment = async (attachment: any) => {
  try {
    await ElMessageBox.confirm(`确认删除附件"${attachment.name}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    ElMessage.success('删除成功')
    getAttachments(contract.value!.id)
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 查看版本
const viewVersion = (version: any) => {
  ElMessage.info('查看版本功能开发中...')
}

// 对比版本
const compareVersion = (version: any) => {
  ElMessage.info('版本对比功能开发中...')
}

// 初始化
onMounted(() => {
  getContractDetail()
})
</script>

<style scoped>
/* 头部卡片样式 */
.contract-header-card {
  margin-bottom: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
  overflow: hidden;
}

.contract-header-card :deep(.el-card__body) {
  padding: 30px;
}

.contract-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.contract-title {
  margin-bottom: 12px;
}

.title-content {
  width: 100%;
}

.contract-title h2 {
  margin: 0 0 12px 0;
  font-size: 28px;
  font-weight: 700;
  color: white;
  line-height: 1.2;
}

.contract-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.contract-no,
.contract-type {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  font-weight: 500;
}

.header-status {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-tag {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white !important;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
}

.header-actions {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-left: 20px;
}

.primary-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: white;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-width: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.primary-btn {
  background: rgba(103, 194, 58, 0.9);
}

.primary-btn:hover {
  background: rgba(103, 194, 58, 1);
}

.warning-btn {
  background: rgba(230, 162, 60, 0.9);
}

.warning-btn:hover {
  background: rgba(230, 162, 60, 1);
}

.success-btn {
  background: rgba(103, 194, 58, 0.9);
}

.success-btn:hover {
  background: rgba(103, 194, 58, 1);
}

.sign-btn {
  background: rgba(245, 108, 108, 0.9);
}

.sign-btn:hover {
  background: rgba(245, 108, 108, 1);
}

.secondary-actions {
  display: flex;
  align-items: center;
}

.more-dropdown {
  position: relative;
}

.more-btn {
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: white;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.more-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.more-text {
  font-size: 14px;
}

.arrow-icon {
  font-size: 12px;
  transition: transform 0.3s ease;
}

.more-dropdown.is-opened .arrow-icon {
  transform: rotate(180deg);
}

/* 下拉菜单样式 */
.custom-dropdown {
  background: white;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 1px solid #e4e7ed;
  padding: 8px 0;
  min-width: 160px;
}

.dropdown-item {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #303133;
  font-size: 14px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.dropdown-item:hover {
  background: #f5f7fa;
  color: #409eff;
}

.dropdown-item span {
  flex: 1;
}

.danger-item {
  color: #f56c6c;
}

.danger-item:hover {
  background: #fef0f0;
  color: #f56c6c;
}

/* 统计卡片样式 */
.stats-cards {
  margin-bottom: 20px;
}

.stat-card {
  border: none;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
}

.amount-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.priority-card {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.date-card {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.expiry-card {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 20px;
  gap: 15px;
}

.stat-icon {
  font-size: 36px;
  opacity: 0.8;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.8;
}

/* 内容卡片样式 */
.content-card {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: none;
  margin-bottom: 20px;
}

/* 自定义标签页样式 */
.custom-tabs :deep(.el-tabs__header) {
  margin: 0;
  background: #f8f9fa;
  border-radius: 8px 8px 0 0;
}

.custom-tabs :deep(.el-tabs__nav-wrap) {
  padding: 0 20px;
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

/* 详情内容样式 */
.detail-content {
  padding: 30px;
}

.info-section {
  margin-bottom: 30px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  padding-bottom: 10px;
  border-bottom: 2px solid #e4e7ed;
}

.custom-descriptions :deep(.el-descriptions__label) {
  font-weight: 600;
  color: #606266;
  background: #f8f9fa;
}

.desc-value {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #303133;
}

.remark-card {
  background: #f8f9fa;
  border: 1px solid #e4e7ed;
}

.remark-text {
  margin: 0;
  line-height: 1.6;
  color: #606266;
}

.content-card-inner {
  background: #fafafa;
  border: 1px solid #e4e7ed;
}

.content-viewer {
  min-height: 200px;
  line-height: 1.8;
  color: #303133;
}

/* 时间轴样式 */
.custom-timeline :deep(.el-timeline-item__timestamp) {
  color: #909399;
  font-size: 13px;
}

.timeline-card {
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  transition: all 0.3s ease;
}

.timeline-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.version-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.version-header h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  color: #303133;
}

.version-actions {
  display: flex;
  gap: 8px;
}

.version-desc {
  margin: 0;
  color: #606266;
  line-height: 1.5;
}

/* 表格样式 */
.custom-table {
  border-radius: 8px;
  overflow: hidden;
}

.custom-table :deep(.el-table__header) {
  background: #f8f9fa;
}

.custom-table :deep(.el-table__header th) {
  background: #f8f9fa;
  color: #303133;
  font-weight: 600;
}

.enterprise-cell,
.file-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.signatory-name,
.sign-time,
.upload-time {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #606266;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

/* 参与方内容样式 */
.parties-content {
  padding: 30px;
}

.parties-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

/* 附件内容样式 */
.attachments-content {
  padding: 30px;
}

.upload-section,
.attachments-list {
  margin-bottom: 30px;
}

.custom-upload {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s ease;
}

.custom-upload:hover {
  border-color: #409eff;
  background: #f0f9ff;
}

/* 版本和日志内容样式 */
.versions-content,
.logs-content {
  padding: 30px;
}

.log-card {
  background: #fafafa;
}

.log-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.log-user {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: #409eff;
}

.log-detail {
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}

/* 关联对象样式 */
.links-content {
  padding: 60px 30px;
  text-align: center;
}

/* 状态流转图样式 */
.status-flow-card {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

/* 文本颜色样式 */
.success-text {
  color: #67c23a;
}

.warning-text {
  color: #e6a23c;
}

.danger-text {
  color: #f56c6c;
}

.text-gray {
  color: #909399;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .header-actions {
    margin-left: 0;
    margin-top: 20px;
  }
  
  .contract-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .primary-actions {
    justify-content: flex-start;
  }
}

@media (max-width: 768px) {
  .contract-header-card :deep(.el-card__body) {
    padding: 20px;
  }
  
  .contract-header {
    flex-direction: column;
    gap: 20px;
    align-items: stretch;
  }
  
  .header-left {
    gap: 16px;
  }
  
  .contract-title {
    margin-bottom: 12px;
  }
  
  .title-content {
    width: 100%;
  }
  
  .contract-title h2 {
    font-size: 24px;
    margin: 0;
  }
  
  .contract-meta {
    flex-direction: column;
    gap: 8px;
  }
  
  .header-status {
    justify-content: flex-start;
  }
  
  .status-tag {
    padding: 8px 16px;
    font-size: 13px;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 12px;
    margin-left: 0;
    margin-top: 0;
  }
  
  .primary-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .action-btn {
    width: 100%;
    min-width: auto;
    padding: 12px 16px;
    font-size: 14px;
  }
  
  .more-btn {
    width: 100%;
    justify-content: center;
    padding: 12px 16px;
  }
  
  .stats-cards .el-col {
    margin-bottom: 15px;
  }
  
  .detail-content,
  .parties-content,
  .attachments-content,
  .versions-content,
  .logs-content {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .contract-header-card :deep(.el-card__body) {
    padding: 16px;
  }
  
  .contract-title h2 {
    font-size: 20px;
    line-height: 1.3;
  }
  
  .contract-meta {
    font-size: 13px;
  }
  
  .action-btn {
    padding: 10px 14px;
    font-size: 13px;
  }
  
  .more-btn {
    padding: 10px 14px;
    font-size: 13px;
  }
}
</style> 