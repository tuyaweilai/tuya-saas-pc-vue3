<template>
  <Dialog title="确认收货" v-model="dialogVisible" width="600px">
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px">
      <el-form-item label="订单信息">
        <div class="order-info">
          <div class="order-no">{{ orderData?.orderNo }}</div>
          <div class="waste-info">{{ orderData?.wasteCode }} - {{ orderData?.wasteName }}</div>
          <div class="estimate-info">预估数量：{{ orderData?.estimatedQuantity }} {{ orderData?.quantityUnit }}</div>
        </div>
      </el-form-item>
      
      <el-form-item label="确认数量" prop="confirmedQuantity" required>
        <el-input-number
          v-model="formData.confirmedQuantity"
          :min="0"
          :precision="3"
          placeholder="请输入实际收货数量"
          style="width: 100%"
          @change="calculateVariance"
        >
          <template #append>{{ orderData?.quantityUnit }}</template>
        </el-input-number>
      </el-form-item>
      
      <el-form-item label="确认人员" prop="confirmedBy" required>
        <el-input
          v-model="formData.confirmedBy"
          placeholder="请输入确认人员姓名"
          maxlength="50"
        />
      </el-form-item>
      
      <el-form-item label="收货位置" prop="confirmedLocation">
        <el-input
          v-model="formData.confirmedLocation"
          placeholder="请输入收货位置或GPS坐标"
          maxlength="200"
        />
        <div class="location-tips">
          <el-button link type="primary" @click="getCurrentLocation">
            <Icon icon="ep:location" class="mr-5px" />
            获取当前位置
          </el-button>
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
      
      <!-- 差异提醒 -->
      <el-form-item v-if="varianceInfo.show">
        <el-alert
          :title="varianceInfo.message"
          :type="varianceInfo.type"
          show-icon
          :closable="false"
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <el-button @click="submitForm" type="primary" :loading="formLoading">确认收货</el-button>
      <el-button @click="dialogVisible = false">取消</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts" name="PickupConfirmDialog">
import * as TransferOrderApi from '@/api/waste/transferOrder'
import type { ConfirmPickupReqVO, TransferOrderRespVO } from '@/api/waste/transferOrder'

const message = useMessage()

const dialogVisible = ref(false)
const formLoading = ref(false)
const orderData = ref<TransferOrderRespVO>()
const formData = ref<ConfirmPickupReqVO>({
  id: 0,
  confirmedQuantity: 0,
  confirmedBy: '',
  confirmedLocation: '',
  remark: ''
})
const formRef = ref()

// 差异信息
const varianceInfo = ref({
  show: false,
  message: '',
  type: 'info'
})

// 表单校验规则
const formRules = reactive({
  confirmedQuantity: [
    { required: true, message: '确认数量不能为空', trigger: 'blur' },
    { type: 'number', min: 0.001, message: '确认数量必须大于0', trigger: 'blur' }
  ],
  confirmedBy: [
    { required: true, message: '确认人员不能为空', trigger: 'blur' },
    { max: 50, message: '确认人员姓名长度不能超过50个字符', trigger: 'blur' }
  ],
  confirmedLocation: [
    { max: 200, message: '收货位置长度不能超过200个字符', trigger: 'blur' }
  ],
  remark: [
    { max: 500, message: '备注长度不能超过500个字符', trigger: 'blur' }
  ]
})

// 计算差异信息
const calculateVariance = () => {
  if (!orderData.value || !formData.value.confirmedQuantity) {
    varianceInfo.value.show = false
    return
  }
  
  const estimatedQuantity = orderData.value.estimatedQuantity
  const confirmedQuantity = formData.value.confirmedQuantity
  const variance = confirmedQuantity - estimatedQuantity
  const varianceRate = Math.abs(variance / estimatedQuantity)
  
  if (Math.abs(variance) < 0.001) {
    varianceInfo.value.show = false
    return
  }
  
  varianceInfo.value.show = true
  varianceInfo.value.message = `数量差异：${variance > 0 ? '+' : ''}${variance.toFixed(3)} ${orderData.value.quantityUnit}，差异率：${(varianceRate * 100).toFixed(2)}%`
  
  if (varianceRate > 0.2) {
    varianceInfo.value.type = 'error'
    varianceInfo.value.message += '（差异较大，请核实）'
  } else if (varianceRate > 0.1) {
    varianceInfo.value.type = 'warning'
    varianceInfo.value.message += '（差异较大，请确认）'
  } else {
    varianceInfo.value.type = 'info'
  }
}

// 获取当前位置
const getCurrentLocation = () => {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        formData.value.confirmedLocation = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
        message.success('位置获取成功')
      },
      (error) => {
        console.error('获取位置失败:', error)
        message.error('位置获取失败，请手动输入')
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    )
  } else {
    message.error('浏览器不支持定位功能')
  }
}

// 打开弹窗
const open = (order: TransferOrderRespVO) => {
  dialogVisible.value = true
  orderData.value = order
  resetForm()
  
  // 设置默认值
  formData.value.id = order.id
  formData.value.confirmedQuantity = order.estimatedQuantity // 默认使用预估数量
  
  // 计算初始差异
  calculateVariance()
}

// 提交表单
const submitForm = async () => {
  const valid = await formRef.value.validate()
  if (!valid) return
  
  // 差异过大时需要确认
  if (varianceInfo.value.type === 'error') {
    try {
      await message.confirm('数量差异较大，确定要继续吗？', '确认提示')
    } catch {
      return
    }
  }
  
  formLoading.value = true
  try {
    await TransferOrderApi.confirmPickup(formData.value)
    message.success('收货确认成功')
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
    confirmedQuantity: 0,
    confirmedBy: '',
    confirmedLocation: '',
    remark: ''
  }
  varianceInfo.value.show = false
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

.estimate-info {
  font-size: 12px;
  color: #909399;
}

.location-tips {
  margin-top: 8px;
}
</style> 