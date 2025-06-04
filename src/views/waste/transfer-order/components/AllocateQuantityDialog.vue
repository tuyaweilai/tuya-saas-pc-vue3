<template>
  <Dialog title="分摊数量" v-model="dialogVisible" width="700px">
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px">
      <el-form-item label="订单信息">
        <div class="order-info">
          <div class="order-no">{{ orderData?.orderNo }}</div>
          <div class="waste-info">{{ orderData?.wasteCode }} - {{ orderData?.wasteName }}</div>
          <div class="quantity-info">
            <span>预估数量：{{ orderData?.estimatedQuantity }} {{ orderData?.quantityUnit }}</span>
            <span class="ml-20px">确认数量：{{ orderData?.confirmedQuantity }} {{ orderData?.quantityUnit }}</span>
          </div>
        </div>
      </el-form-item>
      
      <el-form-item label="分摊方法" prop="allocationMethod" required>
        <el-radio-group v-model="formData.allocationMethod" @change="handleMethodChange">
          <el-radio :label="1">按预估量比例</el-radio>
          <el-radio :label="2">按确认量比例</el-radio>
          <el-radio :label="3">人工指定</el-radio>
          <el-radio :label="4">平均分摊</el-radio>
        </el-radio-group>
      </el-form-item>
      
      <!-- 车辆过磅信息 -->
      <el-form-item label="车辆过磅信息" v-if="vehicleWeighingData">
        <div class="weighing-info">
          <el-descriptions :column="2" size="small" border>
            <el-descriptions-item label="车辆号牌">{{ vehicleWeighingData.vehicleNumber }}</el-descriptions-item>
            <el-descriptions-item label="总重量">{{ vehicleWeighingData.totalWeight }} {{ vehicleWeighingData.weightUnit }}</el-descriptions-item>
            <el-descriptions-item label="空车重量">{{ vehicleWeighingData.emptyWeight }} {{ vehicleWeighingData.weightUnit }}</el-descriptions-item>
            <el-descriptions-item label="净重量">{{ vehicleWeighingData.netWeight }} {{ vehicleWeighingData.weightUnit }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </el-form-item>
      
      <!-- 分摊比例计算 -->
      <el-form-item label="分摊比例" prop="allocationRatio" required>
        <el-row :gutter="10">
          <el-col :span="16">
            <el-input-number
              v-model="formData.allocationRatio"
              :min="0"
              :max="1"
              :precision="4"
              placeholder="分摊比例"
              style="width: 100%"
              @change="calculateAllocatedQuantity"
            />
          </el-col>
          <el-col :span="8">
            <span class="ratio-text">{{ (formData.allocationRatio * 100).toFixed(2) }}%</span>
          </el-col>
        </el-row>
        <div class="tips">
          <span v-if="formData.allocationMethod === 1">基于预估量比例自动计算</span>
          <span v-else-if="formData.allocationMethod === 2">基于确认量比例自动计算</span>
          <span v-else-if="formData.allocationMethod === 3">请手动输入分摊比例</span>
          <span v-else-if="formData.allocationMethod === 4">基于平均分摊自动计算</span>
        </div>
      </el-form-item>
      
      <el-form-item label="分摊数量" prop="allocatedQuantity" required>
        <el-row :gutter="10">
          <el-col :span="16">
            <el-input-number
              v-model="formData.allocatedQuantity"
              :min="0"
              :precision="3"
              placeholder="分摊数量"
              style="width: 100%"
              :disabled="formData.allocationMethod !== 3"
              @change="calculateRatioFromQuantity"
            />
          </el-col>
          <el-col :span="8">
            <span class="unit-text">{{ orderData?.quantityUnit }}</span>
          </el-col>
        </el-row>
      </el-form-item>
      
      <!-- 分摊结果预览 -->
      <el-form-item label="分摊结果">
        <div class="allocation-result">
          <el-table :data="allocationPreview" size="small" border>
            <el-table-column label="项目" prop="item" width="120" />
            <el-table-column label="数值" prop="value" />
            <el-table-column label="单位" prop="unit" width="80" />
          </el-table>
        </div>
      </el-form-item>
      
      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="3"
          placeholder="请输入备注信息"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <el-button @click="submitForm" type="primary" :loading="formLoading">确认分摊</el-button>
      <el-button @click="dialogVisible = false">取消</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts" name="AllocateQuantityDialog">
import * as TransferOrderApi from '@/api/waste/transferOrder'
import type { AllocateQuantityReqVO, TransferOrderRespVO } from '@/api/waste/transferOrder'

const message = useMessage()

const dialogVisible = ref(false)
const formLoading = ref(false)
const orderData = ref<TransferOrderRespVO>()
const vehicleWeighingData = ref<any>() // 车辆过磅数据
const formData = ref<AllocateQuantityReqVO>({
  id: 0,
  allocatedQuantity: 0,
  allocationRatio: 0,
  allocationMethod: 1,
  remark: ''
})
const formRef = ref()

// 分摊结果预览
const allocationPreview = computed(() => {
  if (!orderData.value) return []
  
  return [
    {
      item: '预估数量',
      value: orderData.value.estimatedQuantity.toFixed(3),
      unit: orderData.value.quantityUnit
    },
    {
      item: '确认数量',
      value: (orderData.value.confirmedQuantity || 0).toFixed(3),
      unit: orderData.value.quantityUnit
    },
    {
      item: '分摊比例',
      value: (formData.value.allocationRatio * 100).toFixed(2),
      unit: '%'
    },
    {
      item: '分摊数量',
      value: formData.value.allocatedQuantity.toFixed(3),
      unit: orderData.value.quantityUnit
    },
    {
      item: '与预估差异',
      value: (formData.value.allocatedQuantity - orderData.value.estimatedQuantity).toFixed(3),
      unit: orderData.value.quantityUnit
    },
    {
      item: '与确认差异',
      value: (formData.value.allocatedQuantity - (orderData.value.confirmedQuantity || 0)).toFixed(3),
      unit: orderData.value.quantityUnit
    }
  ]
})

// 表单校验规则
const formRules = reactive({
  allocationMethod: [{ required: true, message: '分摊方法不能为空', trigger: 'change' }],
  allocationRatio: [
    { required: true, message: '分摊比例不能为空', trigger: 'blur' },
    { type: 'number', min: 0.0001, max: 1, message: '分摊比例必须在0.01%到100%之间', trigger: 'blur' }
  ],
  allocatedQuantity: [
    { required: true, message: '分摊数量不能为空', trigger: 'blur' },
    { type: 'number', min: 0.001, message: '分摊数量必须大于0', trigger: 'blur' }
  ],
  remark: [
    { max: 500, message: '备注长度不能超过500个字符', trigger: 'blur' }
  ]
})

// 处理分摊方法变更
const handleMethodChange = (method: number) => {
  if (!orderData.value || !vehicleWeighingData.value) return
  
  switch (method) {
    case 1: // 按预估量比例
      calculateRatioByEstimated()
      break
    case 2: // 按确认量比例
      calculateRatioByConfirmed()
      break
    case 3: // 人工指定
      // 不自动计算，用户手动输入
      break
    case 4: // 平均分摊
      calculateRatioByAverage()
      break
  }
}

// 按预估量比例计算
const calculateRatioByEstimated = () => {
  if (!orderData.value || !vehicleWeighingData.value) return
  
  // TODO: 实现按预估量比例计算逻辑
  // 这里需要获取同车其他订单的预估量，然后计算比例
  // 示例：假设当前订单预估量占同车所有订单预估量的比例
  const estimatedRatio = 0.3 // 示例值
  formData.value.allocationRatio = estimatedRatio
  calculateAllocatedQuantity()
}

// 按确认量比例计算
const calculateRatioByConfirmed = () => {
  if (!orderData.value || !vehicleWeighingData.value) return
  
  // TODO: 实现按确认量比例计算逻辑
  const confirmedRatio = 0.35 // 示例值
  formData.value.allocationRatio = confirmedRatio
  calculateAllocatedQuantity()
}

// 按平均分摊计算
const calculateRatioByAverage = () => {
  if (!orderData.value || !vehicleWeighingData.value) return
  
  // TODO: 实现平均分摊计算逻辑
  // 假设同车有3个订单，平均分摊
  const orderCount = 3 // 示例值，需要从API获取
  formData.value.allocationRatio = 1 / orderCount
  calculateAllocatedQuantity()
}

// 根据比例计算分摊数量
const calculateAllocatedQuantity = () => {
  if (!vehicleWeighingData.value) return
  
  // 根据车辆净重量和分摊比例计算分摊数量
  const netWeight = vehicleWeighingData.value.netWeight
  formData.value.allocatedQuantity = netWeight * formData.value.allocationRatio
}

// 根据数量计算分摊比例
const calculateRatioFromQuantity = () => {
  if (!vehicleWeighingData.value || formData.value.allocatedQuantity <= 0) return
  
  const netWeight = vehicleWeighingData.value.netWeight
  if (netWeight > 0) {
    formData.value.allocationRatio = formData.value.allocatedQuantity / netWeight
  }
}

// 打开弹窗
const open = async (order: TransferOrderRespVO) => {
  dialogVisible.value = true
  orderData.value = order
  resetForm()
  
  // 设置默认值
  formData.value.id = order.id
  
  // 加载车辆过磅数据
  await loadVehicleWeighingData(order.vehicleWeighingId)
  
  // 默认按预估量比例计算
  if (vehicleWeighingData.value) {
    handleMethodChange(1)
  }
}

// 加载车辆过磅数据
const loadVehicleWeighingData = async (vehicleWeighingId?: number) => {
  if (!vehicleWeighingId) {
    message.warning('该订单未关联车辆过磅记录')
    return
  }
  
  try {
    // TODO: 调用车辆过磅API获取数据
    // const data = await VehicleWeighingApi.getVehicleWeighing(vehicleWeighingId)
    // vehicleWeighingData.value = data
    
    // 模拟数据
    vehicleWeighingData.value = {
      vehicleNumber: '京A12345',
      totalWeight: 15.5,
      emptyWeight: 8.2,
      netWeight: 7.3,
      weightUnit: '吨'
    }
  } catch (error) {
    message.error('加载车辆过磅数据失败')
  }
}

// 提交表单
const submitForm = async () => {
  const valid = await formRef.value.validate()
  if (!valid) return
  
  // 检查分摊比例是否合理
  if (formData.value.allocationRatio > 0.8) {
    try {
      await message.confirm('分摊比例较高，确定要继续吗？', '确认提示')
    } catch {
      return
    }
  }
  
  formLoading.value = true
  try {
    await TransferOrderApi.allocateQuantity(formData.value)
    message.success('数量分摊成功')
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}

// 重置表单
const resetForm = () => {
  formData.value = {
    id: 0,
    allocatedQuantity: 0,
    allocationRatio: 0,
    allocationMethod: 1,
    remark: ''
  }
  vehicleWeighingData.value = null
  formRef.value?.resetFields()
}

defineExpose({ open })

const emit = defineEmits(['success'])
</script>

<style scoped>
.order-info {
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
  border-left: 4px solid #409eff;
}

.order-no {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.waste-info {
  font-size: 14px;
  color: #606266;
  margin-bottom: 4px;
}

.quantity-info {
  font-size: 12px;
  color: #909399;
}

.weighing-info {
  width: 100%;
}

.ratio-text {
  font-size: 16px;
  font-weight: 600;
  color: #409eff;
  line-height: 32px;
}

.unit-text {
  font-size: 14px;
  color: #666;
  line-height: 32px;
}

.tips {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
}

.allocation-result {
  width: 100%;
}
</style> 