<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="1000px">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      v-loading="formLoading"
    >
      <el-row :gutter="20">
        <!-- 基本信息 -->
        <el-col :span="24">
          <div class="form-section-title">基本信息</div>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="预约单" prop="appointmentId">
            <el-select
              v-model="formData.appointmentId"
              placeholder="请选择预约单（可选）"
              clearable
              filterable
              @change="handleAppointmentChange"
            >
              <el-option
                v-for="appointment in appointmentList"
                :key="appointment.id"
                :label="appointment.appointmentNo"
                :value="appointment.id"
              >
                <span style="float: left">{{ appointment.appointmentNo }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">
                  {{ appointment.wasteName }}
                </span>
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="报价记录" prop="quotationId">
            <el-select
              v-model="formData.quotationId"
              placeholder="请选择报价记录（可选）"
              clearable
              filterable
              @change="handleQuotationChange"
            >
              <el-option
                v-for="quotation in quotationList"
                :key="quotation.id"
                :label="quotation.quotationNo"
                :value="quotation.id"
              >
                <span style="float: left">{{ quotation.quotationNo }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">
                  ¥{{ quotation.unitPrice }}/{{ quotation.quantityUnit }}
                </span>
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>

        <!-- 企业信息 -->
        <el-col :span="24">
          <div class="form-section-title">企业信息</div>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="产废企业" prop="producingEnterpriseId" required>
            <el-select
              v-model="formData.producingEnterpriseId"
              placeholder="请选择产废企业"
              filterable
              @change="handleProducingEnterpriseChange"
            >
              <el-option
                v-for="enterprise in producingEnterpriseList"
                :key="enterprise.id"
                :label="enterprise.name"
                :value="enterprise.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="产废门店" prop="producingStoreId">
            <el-select
              v-model="formData.producingStoreId"
              placeholder="请选择产废门店（可选）"
              clearable
              filterable
            >
              <el-option
                v-for="store in producingStoreList"
                :key="store.id"
                :label="store.name"
                :value="store.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="回收企业" prop="recyclingEnterpriseId" required>
            <el-select
              v-model="formData.recyclingEnterpriseId"
              placeholder="请选择回收企业"
              filterable
            >
              <el-option
                v-for="enterprise in recyclingEnterpriseList"
                :key="enterprise.id"
                :label="enterprise.name"
                :value="enterprise.id"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <!-- 危废信息 -->
        <el-col :span="24">
          <div class="form-section-title">危废信息</div>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="危废代码" prop="wasteCode" required>
            <el-input
              v-model="formData.wasteCode"
              placeholder="请输入危废代码"
              maxlength="20"
            />
          </el-form-item>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="危废名称" prop="wasteName" required>
            <el-input
              v-model="formData.wasteName"
              placeholder="请输入危废名称"
              maxlength="100"
            />
          </el-form-item>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="包装方式" prop="packagingType">
            <el-select
              v-model="formData.packagingType"
              placeholder="请选择包装方式"
              clearable
            >
              <el-option label="袋装" value="袋装" />
              <el-option label="桶装" value="桶装" />
              <el-option label="散装" value="散装" />
              <el-option label="其他" value="其他" />
            </el-select>
          </el-form-item>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="数量单位" prop="quantityUnit" required>
            <el-select
              v-model="formData.quantityUnit"
              placeholder="请选择数量单位"
            >
              <el-option label="吨" value="吨" />
              <el-option label="千克" value="千克" />
              <el-option label="升" value="升" />
              <el-option label="立方米" value="立方米" />
            </el-select>
          </el-form-item>
        </el-col>

        <!-- 数量和价格 -->
        <el-col :span="24">
          <div class="form-section-title">数量和价格</div>
        </el-col>
        
        <el-col :span="8">
          <el-form-item label="预估数量" prop="estimatedQuantity" required>
            <el-input-number
              v-model="formData.estimatedQuantity"
              :min="0"
              :precision="3"
              placeholder="请输入预估数量"
              style="width: 100%"
              @change="calculateEstimatedAmount"
            />
          </el-form-item>
        </el-col>
        
        <el-col :span="8">
          <el-form-item label="单价" prop="unitPrice" required>
            <el-input-number
              v-model="formData.unitPrice"
              :min="0"
              :precision="2"
              placeholder="请输入单价"
              style="width: 100%"
              @change="calculateEstimatedAmount"
            >
              <template #prefix>¥</template>
            </el-input-number>
          </el-form-item>
        </el-col>
        
        <el-col :span="8">
          <el-form-item label="预估金额" prop="estimatedAmount">
            <el-input-number
              v-model="formData.estimatedAmount"
              :min="0"
              :precision="2"
              placeholder="自动计算"
              style="width: 100%"
              readonly
            >
              <template #prefix>¥</template>
            </el-input-number>
          </el-form-item>
        </el-col>

        <!-- 确认数量（编辑时显示） -->
        <el-col :span="12" v-if="formType === 'update' && formData.id">
          <el-form-item label="确认数量" prop="confirmedQuantity">
            <el-input-number
              v-model="formData.confirmedQuantity"
              :min="0"
              :precision="3"
              placeholder="收运员现场确认数量"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>

        <!-- 付款配置 -->
        <el-col :span="24">
          <div class="form-section-title">付款配置</div>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="付款配置" prop="paymentConfigId">
            <el-select
              v-model="formData.paymentConfigId"
              placeholder="请选择付款配置（可选）"
              clearable
              filterable
            >
              <el-option
                v-for="config in paymentConfigList"
                :key="config.id"
                :label="config.configName"
                :value="config.id"
              >
                <span style="float: left">{{ config.configName }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">
                  {{ config.paymentMethodName }}
                </span>
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>

        <!-- 备注信息 -->
        <el-col :span="24">
          <div class="form-section-title">备注信息</div>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="用户备注" prop="userRemark">
            <el-input
              v-model="formData.userRemark"
              type="textarea"
              :rows="3"
              placeholder="请输入用户备注"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
        </el-col>
        
        <el-col :span="12">
          <el-form-item label="内部备注" prop="internalRemark">
            <el-input
              v-model="formData.internalRemark"
              type="textarea"
              :rows="3"
              placeholder="请输入内部备注"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    
    <template #footer>
      <el-button @click="submitForm" type="primary" :loading="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts" name="TransferOrderForm">
import * as TransferOrderApi from '@/api/waste/transferOrder'
import type { TransferOrderSaveReqVO } from '@/api/waste/transferOrder'

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref('')
const formData = ref<TransferOrderSaveReqVO>({
  producingEnterpriseId: 0,
  recyclingEnterpriseId: 0,
  wasteCode: '',
  wasteName: '',
  estimatedQuantity: 0,
  quantityUnit: '',
  unitPrice: 0,
  estimatedAmount: 0
})
const formRef = ref()

// 下拉选项数据
const appointmentList = ref([])
const quotationList = ref([])
const producingEnterpriseList = ref([])
const producingStoreList = ref([])
const recyclingEnterpriseList = ref([])
const paymentConfigList = ref([])

// 表单校验规则
const formRules = reactive({
  producingEnterpriseId: [{ required: true, message: '产废企业不能为空', trigger: 'change' }],
  recyclingEnterpriseId: [{ required: true, message: '回收企业不能为空', trigger: 'change' }],
  wasteCode: [
    { required: true, message: '危废代码不能为空', trigger: 'blur' },
    { max: 20, message: '危废代码长度不能超过20个字符', trigger: 'blur' }
  ],
  wasteName: [
    { required: true, message: '危废名称不能为空', trigger: 'blur' },
    { max: 100, message: '危废名称长度不能超过100个字符', trigger: 'blur' }
  ],
  estimatedQuantity: [
    { required: true, message: '预估数量不能为空', trigger: 'blur' },
    { type: 'number', min: 0.001, message: '预估数量必须大于0', trigger: 'blur' }
  ],
  quantityUnit: [{ required: true, message: '数量单位不能为空', trigger: 'change' }],
  unitPrice: [
    { required: true, message: '单价不能为空', trigger: 'blur' },
    { type: 'number', min: 0.01, message: '单价必须大于0', trigger: 'blur' }
  ]
})

// 计算预估金额
const calculateEstimatedAmount = () => {
  if (formData.value.estimatedQuantity && formData.value.unitPrice) {
    formData.value.estimatedAmount = formData.value.estimatedQuantity * formData.value.unitPrice
  }
}

// 处理预约单变更
const handleAppointmentChange = (appointmentId: number) => {
  if (appointmentId) {
    const appointment = appointmentList.value.find(item => item.id === appointmentId)
    if (appointment) {
      // 自动填充预约单相关信息
      formData.value.producingEnterpriseId = appointment.producingEnterpriseId
      formData.value.producingStoreId = appointment.producingStoreId
      formData.value.wasteCode = appointment.wasteCode
      formData.value.wasteName = appointment.wasteName
      formData.value.estimatedQuantity = appointment.estimatedQuantity
      formData.value.quantityUnit = appointment.quantityUnit
      formData.value.packagingType = appointment.packagingType
      
      // 加载对应的门店列表
      loadProducingStoreList(appointment.producingEnterpriseId)
    }
  }
}

// 处理报价记录变更
const handleQuotationChange = (quotationId: number) => {
  if (quotationId) {
    const quotation = quotationList.value.find(item => item.id === quotationId)
    if (quotation) {
      // 自动填充报价相关信息
      formData.value.recyclingEnterpriseId = quotation.recyclingEnterpriseId
      formData.value.wasteCode = quotation.wasteCode
      formData.value.wasteName = quotation.wasteName
      formData.value.unitPrice = quotation.unitPrice
      formData.value.quantityUnit = quotation.quantityUnit
      
      // 重新计算预估金额
      calculateEstimatedAmount()
    }
  }
}

// 处理产废企业变更
const handleProducingEnterpriseChange = (enterpriseId: number) => {
  if (enterpriseId) {
    loadProducingStoreList(enterpriseId)
    loadPaymentConfigList(enterpriseId)
  } else {
    producingStoreList.value = []
    paymentConfigList.value = []
  }
}

// 加载门店列表
const loadProducingStoreList = async (enterpriseId: number) => {
  // TODO: 调用门店API
  producingStoreList.value = []
}

// 加载付款配置列表
const loadPaymentConfigList = async (enterpriseId: number) => {
  // TODO: 调用付款配置API
  paymentConfigList.value = []
}

// 打开弹窗
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = type === 'create' ? '添加危废转移订单' : '修改危废转移订单'
  formType.value = type
  resetForm()
  
  // 加载基础数据
  await loadBaseData()
  
  if (id) {
    formLoading.value = true
    try {
      const data = await TransferOrderApi.getTransferOrder(id)
      Object.assign(formData.value, data)
      
      // 加载关联数据
      if (data.producingEnterpriseId) {
        await loadProducingStoreList(data.producingEnterpriseId)
        await loadPaymentConfigList(data.producingEnterpriseId)
      }
    } finally {
      formLoading.value = false
    }
  }
}

// 提交表单
const submitForm = async () => {
  const valid = await formRef.value.validate()
  if (!valid) return
  
  formLoading.value = true
  try {
    if (formType.value === 'create') {
      await TransferOrderApi.createTransferOrder(formData.value)
      message.success('新增成功')
    } else {
      await TransferOrderApi.updateTransferOrder(formData.value)
      message.success('修改成功')
    }
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}

// 重置表单
const resetForm = () => {
  formData.value = {
    producingEnterpriseId: 0,
    recyclingEnterpriseId: 0,
    wasteCode: '',
    wasteName: '',
    estimatedQuantity: 0,
    quantityUnit: '',
    unitPrice: 0,
    estimatedAmount: 0
  }
  formRef.value?.resetFields()
}

// 加载基础数据
const loadBaseData = async () => {
  // TODO: 并行加载各种基础数据
  // await Promise.all([
  //   loadAppointmentList(),
  //   loadQuotationList(),
  //   loadEnterpriseList()
  // ])
}

defineExpose({ open })

const emit = defineEmits(['success'])
</script>

<style scoped>
.form-section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-left: 12px;
  border-left: 4px solid #409eff;
  background-color: #f5f7fa;
  line-height: 24px;
  margin-top: 20px;
}

.form-section-title:first-child {
  margin-top: 0;
}
</style> 