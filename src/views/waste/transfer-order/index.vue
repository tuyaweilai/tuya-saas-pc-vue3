<template>
  <ContentWrap>
    <!-- 搜索 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="120px"
    >
      <el-form-item label="订单编号" prop="orderNo">
        <el-input
          v-model="queryParams.orderNo"
          placeholder="请输入订单编号"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="危废代码" prop="wasteCode">
        <el-input
          v-model="queryParams.wasteCode"
          placeholder="请输入危废代码"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="产废企业" prop="producingEnterpriseId">
        <el-select
          v-model="queryParams.producingEnterpriseId"
          placeholder="请选择产废企业"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="enterprise in producingEnterpriseList"
            :key="enterprise.id"
            :label="enterprise.name"
            :value="enterprise.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="回收企业" prop="recyclingEnterpriseId">
        <el-select
          v-model="queryParams.recyclingEnterpriseId"
          placeholder="请选择回收企业"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="enterprise in recyclingEnterpriseList"
            :key="enterprise.id"
            :label="enterprise.name"
            :value="enterprise.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="业务状态" prop="businessStatus">
        <el-select
          v-model="queryParams.businessStatus"
          placeholder="请选择业务状态"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.WASTE_ORDER_BUSINESS_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="付款状态" prop="paymentStatus">
        <el-select
          v-model="queryParams.paymentStatus"
          placeholder="请选择付款状态"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.WASTE_ORDER_PAYMENT_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery">
          <Icon icon="ep:search" class="mr-5px" />
          搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon icon="ep:refresh" class="mr-5px" />
          重置
        </el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['waste:transfer-order:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" />
          新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['waste:transfer-order:export']"
        >
          <Icon icon="ep:download" class="mr-5px" />
          导出
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table 
      v-loading="loading" 
      :data="list" 
      :stripe="true" 
      :show-overflow-tooltip="true"
      class="transfer-order-table"
      :cell-style="{ padding: '8px 12px' }"
      :header-cell-style="{ 
        padding: '12px 12px', 
        backgroundColor: '#f8f9fa',
        fontWeight: '600',
        fontSize: '14px',
        color: '#303133'
      }"
      border
    >
      <el-table-column label="订单编号" prop="orderNo" width="180" fixed="left" />
      <el-table-column label="危废信息" width="200">
        <template #default="scope">
          <div class="waste-info">
            <div class="waste-code">{{ scope.row.wasteCode }}</div>
            <div class="waste-name">{{ scope.row.wasteName }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="数量信息" width="160">
        <template #default="scope">
          <div class="quantity-info">
            <div class="quantity-item">预估：{{ scope.row.estimatedQuantity }} {{ scope.row.quantityUnit }}</div>
            <div v-if="scope.row.confirmedQuantity" class="quantity-item confirmed">
              确认：{{ scope.row.confirmedQuantity }} {{ scope.row.quantityUnit }}
            </div>
            <div v-if="scope.row.allocatedQuantity" class="quantity-item allocated">
              分摊：{{ scope.row.allocatedQuantity }} {{ scope.row.quantityUnit }}
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="金额信息" width="140">
        <template #default="scope">
          <div class="amount-info">
            <div class="amount-item">预估：¥{{ scope.row.estimatedAmount?.toFixed(2) }}</div>
            <div v-if="scope.row.finalAmount" class="amount-item final">
              最终：¥{{ scope.row.finalAmount?.toFixed(2) }}
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="产废企业" prop="producingEnterpriseName" width="140" />
      <el-table-column label="回收企业" prop="recyclingEnterpriseName" width="140" />
      <el-table-column label="业务状态" width="100" align="center">
        <template #default="scope">
          <OrderStatusTag :status="scope.row.businessStatus" type="business" />
        </template>
      </el-table-column>
      <el-table-column label="付款状态" width="120" align="center">
        <template #default="scope">
          <OrderStatusTag :status="scope.row.paymentStatus" type="payment" />
        </template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        prop="createTime"
        width="180"
        :formatter="dateFormatter"
      />
      <el-table-column label="备注" prop="userRemark" width="150" :show-overflow-tooltip="true" />
      <el-table-column label="操作" fixed="right" width="200" align="center">
        <template #default="scope">
          <div class="action-buttons">
            <el-button
              link
              type="primary"
              size="small"
              @click="openDetail(scope.row.id)"
              v-hasPermi="['waste:transfer-order:query']"
            >
              详情
            </el-button>
            <el-button
              link
              type="primary"
              size="small"
              @click="openForm('update', scope.row.id)"
              v-hasPermi="['waste:transfer-order:update']"
            >
              编辑
            </el-button>
            <el-dropdown
              @command="(command) => handleCommand(command, scope.row)"
              v-hasPermi="['waste:transfer-order:update']"
              trigger="click"
            >
              <el-button link type="primary" size="small">
                更多<Icon icon="ep:arrow-down" class="ml-5px" />
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    command="confirm"
                    v-if="scope.row.businessStatus === 0"
                  >
                    确认订单
                  </el-dropdown-item>
                  <el-dropdown-item
                    command="pickup"
                    v-if="scope.row.businessStatus === 1 && !scope.row.pickupConfirmedTime"
                  >
                    确认收货
                  </el-dropdown-item>
                  <el-dropdown-item
                    command="allocate"
                    v-if="scope.row.pickupConfirmedTime && !scope.row.allocationCompletedTime"
                  >
                    分摊数量
                  </el-dropdown-item>
                  <el-dropdown-item
                    command="payment"
                    v-if="scope.row.businessStatus === 2"
                  >
                    处理付款
                  </el-dropdown-item>
                  <el-dropdown-item
                    command="settle"
                    v-if="scope.row.businessStatus === 2 && scope.row.paymentStatus === 1"
                  >
                    结算订单
                  </el-dropdown-item>
                  <el-dropdown-item
                    command="complete"
                    v-if="scope.row.businessStatus === 3"
                  >
                    完成订单
                  </el-dropdown-item>
                  <el-dropdown-item
                    command="cancel"
                    v-if="scope.row.businessStatus < 3"
                    divided
                  >
                    取消订单
                  </el-dropdown-item>
                  <el-dropdown-item
                    command="delete"
                    v-if="scope.row.businessStatus === 0"
                    divided
                  >
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
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <TransferOrderForm ref="formRef" @success="getList" />
  
  <!-- 收货确认弹窗 -->
  <PickupConfirmDialog ref="pickupDialogRef" @success="getList" />
  
  <!-- 分摊数量弹窗 -->
  <AllocateQuantityDialog ref="allocateDialogRef" @success="getList" />
  
  <!-- 处理付款弹窗 -->
  <PaymentProcessDialog ref="paymentDialogRef" @success="getList" />
</template>

<script setup lang="ts" name="WasteTransferOrder">
import { dateFormatter } from '@/utils/formatTime'
import { getIntDictOptions, DICT_TYPE } from '@/utils/dict'
import download from '@/utils/download'
import { useMessage } from '@/hooks/web/useMessage'
import { useRouter } from 'vue-router'
import * as TransferOrderApi from '@/api/waste/transferOrder'
import type { TransferOrderPageReqVO, TransferOrderRespVO } from '@/api/waste/transferOrder'
import TransferOrderForm from './TransferOrderForm.vue'
import PickupConfirmDialog from './components/PickupConfirmDialog.vue'
import AllocateQuantityDialog from './components/AllocateQuantityDialog.vue'
import PaymentProcessDialog from './components/PaymentProcessDialog.vue'
import OrderStatusTag from '@/components/waste/transfer-order/OrderStatusTag.vue'

const message = useMessage()
const router = useRouter()

// 数据相关
const loading = ref(true)
const total = ref(0)
const list = ref<TransferOrderRespVO[]>([])

// 企业类型定义
interface EnterpriseOption {
  id: number
  name: string
}

// 查询参数类型扩展
interface ExtendedTransferOrderPageReqVO extends TransferOrderPageReqVO {
  createTime?: string[]
}

const queryParams = reactive<ExtendedTransferOrderPageReqVO>({
  pageNo: 1,
  pageSize: 10,
  orderNo: undefined,
  wasteCode: undefined,
  producingEnterpriseId: undefined,
  recyclingEnterpriseId: undefined,
  businessStatus: undefined,
  paymentStatus: undefined,
  createTime: undefined
})
const queryFormRef = ref()
const exportLoading = ref(false)

// 企业数据
const producingEnterpriseList = ref<EnterpriseOption[]>([])
const recyclingEnterpriseList = ref<EnterpriseOption[]>([])

// 弹窗相关
const formRef = ref()
const pickupDialogRef = ref()
const allocateDialogRef = ref()
const paymentDialogRef = ref()

// 查询列表
const getList = async () => {
  loading.value = true
  try {
    const data = await TransferOrderApi.getTransferOrderPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

// 搜索按钮操作
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

// 重置按钮操作
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

// 添加/修改操作
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

// 详情操作
const openDetail = (id: number) => {
  router.push('/waste/transfer-order/detail/' + id)
}

// 删除操作
const handleDelete = async (id: number) => {
  try {
    await message.delConfirm()
    await TransferOrderApi.deleteTransferOrder(id)
    message.success('删除成功')
    getList()
  } catch {}
}

// 导出操作
const handleExport = async () => {
  try {
    await message.exportConfirm()
    exportLoading.value = true
    const data = await TransferOrderApi.exportTransferOrderExcel(queryParams)
    download.excel(data, '危废转移订单.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

// 更多操作下拉菜单
const handleCommand = async (command: string, row: TransferOrderRespVO) => {
  switch (command) {
    case 'confirm':
      await handleConfirmOrder(row.id)
      break
    case 'pickup':
      pickupDialogRef.value.open(row)
      break
    case 'allocate':
      allocateDialogRef.value.open(row)
      break
    case 'payment':
      paymentDialogRef.value.open(row)
      break
    case 'settle':
      await handleSettleOrder(row.id)
      break
    case 'complete':
      await handleCompleteOrder(row.id)
      break
    case 'cancel':
      await handleCancelOrder(row.id)
      break
    case 'delete':
      await handleDelete(row.id)
      break
  }
}

// 确认订单
const handleConfirmOrder = async (id: number) => {
  try {
    await message.confirm('确定要确认该订单吗？')
    await TransferOrderApi.confirmOrder(id)
    message.success('确认成功')
    getList()
  } catch {}
}

// 结算订单
const handleSettleOrder = async (id: number) => {
  try {
    await message.confirm('确定要结算该订单吗？')
    await TransferOrderApi.settleOrder(id)
    message.success('结算成功')
    getList()
  } catch {}
}

// 完成订单
const handleCompleteOrder = async (id: number) => {
  try {
    await message.confirm('确定要完成该订单吗？')
    await TransferOrderApi.completeOrder(id)
    message.success('完成成功')
    getList()
  } catch {}
}

// 取消订单
const handleCancelOrder = async (id: number) => {
  try {
    const { value: reason } = await ElMessageBox.prompt('请输入取消原因', '取消订单', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /.+/,
      inputErrorMessage: '取消原因不能为空'
    })
    await TransferOrderApi.cancelOrder(id, reason)
    message.success('取消成功')
    getList()
  } catch {}
}

// 初始化
onMounted(() => {
  getList()
  // TODO: 加载企业列表数据
})
</script>

<style scoped>
/* 表格整体样式 */
.transfer-order-table {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

/* 危废信息样式 */
.waste-info {
  line-height: 1.4;
}

.waste-code {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
  margin-bottom: 2px;
}

.waste-name {
  font-size: 12px;
  color: #909399;
  line-height: 1.2;
}

/* 数量信息样式 */
.quantity-info {
  line-height: 1.3;
}

.quantity-item {
  font-size: 13px;
  margin-bottom: 2px;
  color: #303133;
}

.quantity-item:last-child {
  margin-bottom: 0;
}

.quantity-item.confirmed {
  color: #67c23a;
  font-weight: 500;
}

.quantity-item.allocated {
  color: #e6a23c;
  font-weight: 500;
}

/* 金额信息样式 */
.amount-info {
  line-height: 1.3;
}

.amount-item {
  font-size: 13px;
  margin-bottom: 2px;
  color: #303133;
}

.amount-item:last-child {
  margin-bottom: 0;
}

.amount-item.final {
  color: #67c23a;
  font-weight: 600;
}

/* 操作按钮样式 */
.action-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex-wrap: wrap;
}

.action-buttons .el-button {
  margin: 0;
  padding: 4px 8px;
  font-size: 12px;
}

/* 表格行高优化 */
:deep(.el-table .el-table__row) {
  height: auto;
  min-height: 48px;
}

:deep(.el-table .el-table__cell) {
  vertical-align: middle;
}

/* 表格头部样式 */
:deep(.el-table .el-table__header-wrapper .el-table__header) {
  border-radius: 8px 8px 0 0;
}

/* 状态标签居中 */
:deep(.el-table .el-table__cell .el-tag) {
  margin: 0;
}

/* 备注列省略号样式 */
:deep(.el-table .el-table__cell .el-tooltip) {
  width: 100%;
}

/* 响应式优化 */
@media (max-width: 1200px) {
  .action-buttons {
    flex-direction: column;
    gap: 2px;
  }
  
  .action-buttons .el-button {
    width: 100%;
    justify-content: center;
  }
}

/* 表格边框优化 */
:deep(.el-table--border .el-table__cell) {
  border-right: 1px solid #ebeef5;
}

:deep(.el-table--border .el-table__header .el-table__cell) {
  border-right: 1px solid #ebeef5;
}

/* 斑马纹优化 */
:deep(.el-table--striped .el-table__row:nth-child(2n)) {
  background-color: #fafafa;
}

/* 悬停效果 */
:deep(.el-table__row:hover) {
  background-color: #f5f7fa !important;
}

/* 固定列阴影 */
:deep(.el-table__fixed-right) {
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
}

:deep(.el-table__fixed) {
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}
</style> 