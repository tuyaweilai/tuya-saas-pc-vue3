<template>
  <ContentWrap>
    <!-- 搜索表单 -->
    <el-form
      ref="queryFormRef"
      :model="queryParams"
      :inline="true"
      label-width="68px"
      class="-mb-15px"
    >
      <el-form-item label="合同名称" prop="contractName">
        <el-input
          v-model="queryParams.contractName"
          placeholder="请输入合同名称"
          clearable
          class="!w-240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      
      <el-form-item label="合同编号" prop="contractNo">
        <el-input
          v-model="queryParams.contractNo"
          placeholder="请输入合同编号"
          clearable
          class="!w-240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      
      <el-form-item label="合同状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择状态"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="(item, key) in CONTRACT_STATUS"
            :key="key"
            :label="item.label"
            :value="Number(key)"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="合同类型" prop="contractTypeId">
        <el-select
          v-model="queryParams.contractTypeId"
          placeholder="请选择类型"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="type in contractTypes"
            :key="type.id"
            :label="type.name"
            :value="type.id"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          class="!w-240px"
        />
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" @click="handleQuery">
          <Icon icon="ep:search" class="mr-5px" />
          搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon icon="ep:refresh" class="mr-5px" />
          重置
        </el-button>
        <el-button
          v-permission="['contract:contract:create']"
          type="primary"
          plain
          @click="handleCreate"
        >
          <Icon icon="ep:plus" class="mr-5px" />
          新建合同
        </el-button>
        <el-button
          v-permission="['contract:contract:export']"
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
        >
          <Icon icon="ep:download" class="mr-5px" />
          导出
        </el-button>
        <el-button
          v-permission="['contract:contract:delete']"
          type="danger"
          plain
          :disabled="!multipleSelection.length"
          @click="handleBatchDelete"
        >
          <Icon icon="ep:delete" class="mr-5px" />
          批量删除
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table
      v-loading="loading"
      :data="contractList"
      @selection-change="handleSelectionChange"
      :stripe="true"
      :show-overflow-tooltip="true"
    >
      <el-table-column type="selection" width="55" align="center" />
      
      <el-table-column label="合同编号" prop="contractNo" width="180" />
      
      <el-table-column label="合同名称" prop="contractName" min-width="200" />
      
      <el-table-column label="合同类型" prop="typeName" width="120" />
      
      <el-table-column label="状态" prop="status" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatusInfo(row.status).type">
            {{ getStatusInfo(row.status).label }}
          </el-tag>
        </template>
      </el-table-column>
      
      <el-table-column label="总金额" prop="totalAmount" width="120" align="right">
        <template #default="{ row }">
          <span v-if="row.totalAmount">
            {{ formatCurrency(row.totalAmount, row.currency) }}
          </span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      
      <el-table-column label="优先级" prop="priorityLevel" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getPriorityInfo(row.priorityLevel).type" size="small">
            {{ getPriorityInfo(row.priorityLevel).label }}
          </el-tag>
        </template>
      </el-table-column>
      
      <el-table-column label="生效日期" prop="effectiveDate" width="120" align="center">
        <template #default="{ row }">
          {{ row.effectiveDate ? formatDate(row.effectiveDate) : '-' }}
        </template>
      </el-table-column>
      
      <el-table-column label="到期日期" prop="expiryDate" width="120" align="center">
        <template #default="{ row }">
          <span v-if="row.expiryDate" :class="getExpiryClass(row.expiryDate)">
            {{ formatDate(row.expiryDate) }}
          </span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      
      <el-table-column label="创建时间" prop="createTime" width="160" align="center">
        <template #default="{ row }">
          {{ formatDate(row.createTime) }}
        </template>
      </el-table-column>
      
      <el-table-column label="操作" width="200" align="center" fixed="right">
        <template #default="{ row }">
          <div class="flex items-center justify-center">
            <el-button
              v-permission="['contract:contract:query']"
              type="primary"
              link
              @click="handleDetail(row)"
            >
              查看
            </el-button>
            
            <el-dropdown
              v-if="hasMoreActions(row)"
              @command="(command) => handleCommand(command, row)"
            >
              <el-button type="primary" link>
                <Icon icon="ep:d-arrow-right" />
                更多
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    v-if="row.status === 0"
                    v-permission="['contract:contract:update']"
                    command="handleEdit"
                  >
                    <Icon icon="ep:edit" />
                    编辑
                  </el-dropdown-item>
                  
                  <el-dropdown-item
                    v-if="row.status === 0"
                    v-permission="['contract:contract:submit']"
                    command="handleSubmit"
                  >
                    <Icon icon="ep:upload" />
                    提交审核
                  </el-dropdown-item>
                  
                  <el-dropdown-item
                    v-if="row.status === 1"
                    v-permission="['contract:contract:approve']"
                    command="handleApprove"
                  >
                    <Icon icon="ep:circle-check" />
                    审核
                  </el-dropdown-item>
                  
                  <el-dropdown-item
                    v-if="row.status === 3"
                    v-permission="['contract:contract:sign']"
                    command="handleSign"
                  >
                    <Icon icon="ep:edit-pen" />
                    签署
                  </el-dropdown-item>
                  
                  <el-dropdown-item
                    v-if="[0, 10].includes(row.status)"
                    v-permission="['contract:contract:delete']"
                    command="handleDelete"
                  >
                    <Icon icon="ep:delete" />
                    删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <Pagination
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      :total="total"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 审核对话框 -->
  <el-dialog
    v-model="approveDialogVisible"
    title="合同审核"
    width="500px"
    append-to-body
  >
    <el-form ref="approveFormRef" :model="approveForm" label-width="80px">
      <el-form-item label="审核结果" prop="approved" required>
        <el-radio-group v-model="approveForm.approved">
          <el-radio :label="true">通过</el-radio>
          <el-radio :label="false">拒绝</el-radio>
        </el-radio-group>
      </el-form-item>
      
      <el-form-item label="审核意见" prop="remark">
        <el-input
          v-model="approveForm.remark"
          type="textarea"
          :rows="4"
          placeholder="请输入审核意见"
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <el-button @click="approveDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="confirmApprove">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useContractStore, CONTRACT_STATUS } from '@/store/modules/contract'
import { contractTypeApi } from '@/api/contract/contract'
import type { ContractResp, ContractType } from '@/api/contract/contract'

defineOptions({ name: 'ContractList' })

const router = useRouter()
const contractStore = useContractStore()

// 响应式数据
const loading = ref(false)
const exportLoading = ref(false)
const contractList = ref<ContractResp[]>([])
const contractTypes = ref<ContractType[]>([])
const total = ref(0)
const multipleSelection = ref<ContractResp[]>([])

// 查询参数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  contractName: '',
  contractNo: '',
  status: undefined,
  contractTypeId: undefined,
  createTime: []
})

// 审核对话框
const approveDialogVisible = ref(false)
const approveForm = reactive({
  id: 0,
  approved: true,
  remark: ''
})

// 获取状态信息
const getStatusInfo = contractStore.getStatusInfo
const getPriorityInfo = contractStore.getPriorityInfo

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
  return new Date(date).toLocaleDateString()
}

// 获取到期日期样式
const getExpiryClass = (expiryDate: string) => {
  const now = new Date()
  const expiry = new Date(expiryDate)
  const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'text-red-500' // 已过期
  if (diffDays <= 30) return 'text-orange-500' // 即将到期
  return ''
}

// 判断是否有更多操作
const hasMoreActions = (row: ContractResp) => {
  return (
    (row.status === 0) || // 草稿状态可以编辑、提交审核、删除
    (row.status === 1) || // 审核中可以审核
    (row.status === 3) || // 审核通过可以签署
    ([0, 10].includes(row.status)) // 草稿和已拒绝可以删除
  )
}

// 处理下拉菜单命令
const handleCommand = (command: string, row: ContractResp) => {
  switch (command) {
    case 'handleEdit':
      handleEdit(row)
      break
    case 'handleSubmit':
      handleSubmit(row)
      break
    case 'handleApprove':
      handleApprove(row)
      break
    case 'handleSign':
      handleSign(row)
      break
    case 'handleDelete':
      handleDelete(row)
      break
  }
}

// 获取列表数据
const getList = async () => {
  loading.value = true
  try {
    const result = await contractStore.fetchContractList(queryParams)
    contractList.value = result.list
    total.value = result.total
  } finally {
    loading.value = false
  }
}

// 获取合同类型
const getContractTypes = async () => {
  try {
    contractTypes.value = await contractTypeApi.getContractTypeList()
  } catch (error) {
    console.error('获取合同类型失败:', error)
  }
}

// 搜索
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

// 重置搜索
const resetQuery = () => {
  Object.assign(queryParams, {
    pageNo: 1,
    pageSize: 10,
    contractName: '',
    contractNo: '',
    status: undefined,
    contractTypeId: undefined,
    createTime: []
  })
  getList()
}

// 新建合同
const handleCreate = () => {
  router.push('/contract/create')
}

// 查看详情
const handleDetail = (row: ContractResp) => {
  router.push(`/contract/detail/${row.id}`)
}

// 编辑合同
const handleEdit = (row: ContractResp) => {
  router.push(`/contract/edit/${row.id}`)
}

// 提交审核
const handleSubmit = async (row: ContractResp) => {
  try {
    await ElMessageBox.confirm('确认提交该合同进行审核吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await contractStore.submitContract(row.id)
    ElMessage.success('提交成功')
    getList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('提交失败')
    }
  }
}

// 审核合同
const handleApprove = (row: ContractResp) => {
  approveForm.id = row.id
  approveForm.approved = true
  approveForm.remark = ''
  approveDialogVisible.value = true
}

// 确认审核
const confirmApprove = async () => {
  try {
    await contractStore.approveContract(
      approveForm.id,
      approveForm.approved,
      approveForm.remark
    )
    
    ElMessage.success(approveForm.approved ? '审核通过' : '审核拒绝')
    approveDialogVisible.value = false
    getList()
  } catch (error) {
    ElMessage.error('审核失败')
  }
}

// 签署合同
const handleSign = (row: ContractResp) => {
  router.push(`/contract/sign/${row.id}`)
}

// 删除合同
const handleDelete = async (row: ContractResp) => {
  try {
    await ElMessageBox.confirm(`确认删除合同"${row.contractName}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await contractStore.deleteContract(row.id)
    ElMessage.success('删除成功')
    getList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (!multipleSelection.value.length) {
    ElMessage.warning('请选择要删除的合同')
    return
  }
  
  try {
    await ElMessageBox.confirm(`确认删除选中的${multipleSelection.value.length}个合同吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const promises = multipleSelection.value.map(item => contractStore.deleteContract(item.id))
    await Promise.all(promises)
    
    ElMessage.success('批量删除成功')
    getList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
    }
  }
}

// 导出
const handleExport = async () => {
  try {
    exportLoading.value = true
    // await contractStore.exportContract(queryParams)
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败')
  } finally {
    exportLoading.value = false
  }
}

// 表格选择变化
const handleSelectionChange = (selection: ContractResp[]) => {
  multipleSelection.value = selection
}

// 初始化
onMounted(() => {
  getList()
  getContractTypes()
})
</script>

<style scoped>
.text-red-500 {
  color: #f56565;
}

.text-orange-500 {
  color: #ed8936;
}
</style> 