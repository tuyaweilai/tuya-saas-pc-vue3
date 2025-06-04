<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="1000px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      v-loading="formLoading"
    >
      <el-row :gutter="20">
        <!-- 产废企业信息 -->
        <el-col :span="24">
          <el-divider content-position="left">产废企业信息</el-divider>
        </el-col>
        <el-col :span="12">
          <el-form-item label="产废企业" prop="producerEnterpriseId">
            <el-select
              v-model="formData.producerEnterpriseId"
              placeholder="请选择产废企业"
              filterable
              clearable
              style="width: 100%"
              @change="handleProducerChange"
            >
              <el-option
                v-for="item in producerOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系人姓名" prop="producerContactName">
            <el-input
              v-model="formData.producerContactName"
              placeholder="请输入联系人姓名"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系人电话" prop="producerContactPhone">
            <el-input
              v-model="formData.producerContactPhone"
              placeholder="请输入联系人电话"
            />
          </el-form-item>
        </el-col>

        <!-- 废物信息 -->
        <el-col :span="24">
          <el-divider content-position="left">废物信息</el-divider>
        </el-col>
        <el-col :span="12">
          <el-form-item label="废物代码" prop="wasteCode">
            <el-select
              v-model="formData.wasteCode"
              placeholder="请选择废物代码"
              filterable
              clearable
              style="width: 100%"
              @change="handleWasteCodeChange"
            >
              <el-option
                v-for="item in wasteCodeOptions"
                :key="item.code"
                :label="`${item.code} - ${item.name}`"
                :value="item.code"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="废物名称" prop="wasteName">
            <el-input
              v-model="formData.wasteName"
              placeholder="请输入废物名称"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="废物类别" prop="wasteCategory">
            <el-select
              v-model="formData.wasteCategory"
              placeholder="请选择废物类别"
              clearable
              style="width: 100%"
            >
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.WASTE_CATEGORY)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-row :gutter="8">
            <el-col :span="16">
              <el-form-item label="预估数量" prop="estimatedQuantity">
                <el-input-number
                  v-model="formData.estimatedQuantity"
                  :min="0"
                  :precision="2"
                  placeholder="请输入预估数量"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="单位" prop="quantityUnit">
                <el-select
                  v-model="formData.quantityUnit"
                  placeholder="单位"
                  clearable
                  style="width: 100%"
                >
                  <el-option
                    v-for="dict in getStrDictOptions(DICT_TYPE.WASTE_UNIT)"
                    :key="dict.value"
                    :label="dict.label"
                    :value="dict.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-col>
        <el-col :span="24">
          <el-form-item label="废物描述" prop="wasteDescription">
            <el-input
              v-model="formData.wasteDescription"
              type="textarea"
              :rows="3"
              placeholder="请输入废物描述"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
        </el-col>

        <!-- 地址信息 -->
        <el-col :span="24">
          <el-divider content-position="left">地址信息</el-divider>
        </el-col>
        <el-col :span="24">
          <el-form-item label="取货地址" prop="pickupAddress">
            <el-input
              v-model="formData.pickupAddress"
              placeholder="请输入取货地址"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="送货地址" prop="deliveryAddress">
            <el-input
              v-model="formData.deliveryAddress"
              placeholder="请输入送货地址（可选）"
            />
          </el-form-item>
        </el-col>

        <!-- 时间信息 -->
        <el-col :span="24">
          <el-divider content-position="left">时间信息</el-divider>
        </el-col>
        <el-col :span="12">
          <el-form-item label="期望取货时间" prop="expectedPickupTime">
            <el-date-picker
              v-model="formData.expectedPickupTime"
              type="datetime"
              placeholder="请选择期望取货时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="期望送达时间" prop="expectedDeliveryTime">
            <el-date-picker
              v-model="formData.expectedDeliveryTime"
              type="datetime"
              placeholder="请选择期望送达时间（可选）"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>

        <!-- 业务信息 -->
        <el-col :span="24">
          <el-divider content-position="left">业务信息</el-divider>
        </el-col>
        <el-col :span="12">
          <el-form-item label="业务模式" prop="businessMode">
            <el-radio-group v-model="formData.businessMode">
              <el-radio :label="BusinessMode.INDEPENDENT_OPERATION">独立运营</el-radio>
              <el-radio :label="BusinessMode.PLATFORM_BIDDING">平台竞价</el-radio>
              <el-radio :label="BusinessMode.HYBRID_MODE">混合模式</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="紧急程度" prop="isUrgent">
            <el-radio-group v-model="formData.isUrgent">
              <el-radio :label="false">普通</el-radio>
              <el-radio :label="true">紧急</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="优先级" prop="priorityLevel">
            <el-input-number
              v-model="formData.priorityLevel"
              :min="1"
              :max="10"
              placeholder="请输入优先级（1-10）"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>

        <!-- 回收企业信息（可选） -->
        <el-col :span="24">
          <el-divider content-position="left">回收企业信息（可选）</el-divider>
        </el-col>
        <el-col :span="24">
          <el-form-item label="指定回收企业" prop="recyclerEnterpriseId">
            <el-select
              v-model="formData.recyclerEnterpriseId"
              placeholder="请选择回收企业（可选，留空则系统自动分配）"
              filterable
              clearable
              style="width: 100%"
            >
              <el-option
                v-for="item in recyclerOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>

        <!-- 备注信息 -->
        <el-col :span="24">
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
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
/**
 * 预约表单组件
 * 
 * 功能：
 * - 支持新增和编辑预约
 * - 表单验证
 * - 数据联动
 * 
 * @author AI Assistant
 * @date 2024-01-01
 * @version 1.0.0
 */

import { ref, reactive, computed, nextTick } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { DICT_TYPE, getIntDictOptions, getStrDictOptions } from '@/utils/dict'
import {
  getAppointment,
  createAppointment,
  updateAppointment,
} from '@/api/waste/appointment'
import { getEnterpriseSimpleList, type EnterpriseSimple } from '@/api/enterprise/info'
import {
  BusinessMode,
  type AppointmentCreateReqVO,
  type AppointmentUpdateReqVO,
  type WasteCodeOption
} from '@/types/waste/appointment'

interface Emits {
  /** 操作成功事件 */
  (e: 'success'): void
}

const emit = defineEmits<Emits>()

// 表单数据类型（扩展原有类型，允许null值）
interface FormDataType extends Omit<AppointmentCreateReqVO, 'producerEnterpriseId' | 'recyclerEnterpriseId'> {
  producerEnterpriseId: number | undefined
  recyclerEnterpriseId: number | undefined
}

// 响应式数据
const dialogVisible = ref(false)
const formLoading = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()
const formType = ref<'create' | 'update'>('create')
const formId = ref<number>()

const producerOptions = ref<EnterpriseSimple[]>([])
const recyclerOptions = ref<EnterpriseSimple[]>([])
const wasteCodeOptions = ref<WasteCodeOption[]>([])

const formData = reactive<FormDataType>({
  // 产废企业信息
  producerEnterpriseId: undefined,
  producerContactName: '',
  producerContactPhone: '',
  
  // 废物信息
  wasteCode: '',
  wasteName: '',
  wasteCategory: '',
  estimatedQuantity: 0,
  quantityUnit: '',
  wasteDescription: '',
  
  // 地址信息
  pickupAddress: '',
  deliveryAddress: '',
  
  // 时间信息
  expectedPickupTime: '',
  expectedDeliveryTime: '',
  
  // 业务信息
  businessMode: BusinessMode.INDEPENDENT_OPERATION,
  isUrgent: false,
  priorityLevel: 5,
  
  // 回收企业信息
  recyclerEnterpriseId: undefined,
  
  remark: ''
})

// 表单验证规则
const formRules: FormRules = {
  producerEnterpriseId: [
    { required: true, message: '请选择产废企业', trigger: 'change' },
    { type: 'number', message: '产废企业ID必须是数字类型', trigger: 'change' }
  ],
  producerContactName: [
    { required: true, message: '请输入联系人姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '联系人姓名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  producerContactPhone: [
    { required: true, message: '请输入联系人电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  wasteCode: [
    { required: true, message: '请选择废物代码', trigger: 'change' }
  ],
  wasteName: [
    { required: true, message: '请输入废物名称', trigger: 'blur' }
  ],
  wasteCategory: [
    { required: true, message: '请选择废物类别', trigger: 'change' }
  ],
  estimatedQuantity: [
    { required: true, message: '请输入预估数量', trigger: 'blur' },
    { type: 'number', min: 0.01, message: '预估数量必须大于0', trigger: 'blur' }
  ],
  quantityUnit: [
    { required: true, message: '请选择数量单位', trigger: 'change' }
  ],
  pickupAddress: [
    { required: true, message: '请输入取货地址', trigger: 'blur' }
  ],
  expectedPickupTime: [
    { required: true, message: '请选择期望取货时间', trigger: 'change' },
    {
      validator: (rule, value, callback) => {
        if (value && new Date(value) <= new Date()) {
          callback(new Error('期望取货时间不能早于当前时间'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  businessMode: [
    { required: true, message: '请选择业务模式', trigger: 'change' }
  ],
  priorityLevel: [
    { required: true, message: '请输入优先级', trigger: 'blur' },
    { type: 'number', min: 1, max: 10, message: '优先级范围为1-10', trigger: 'blur' }
  ]
}

// 计算属性
const dialogTitle = computed(() => {
  return formType.value === 'create' ? '新增预约' : '编辑预约'
})

// 方法定义
const open = async (type: 'create' | 'update', id?: number) => {
  dialogVisible.value = true
  formType.value = type
  formId.value = id
  
  // 重置表单
  resetForm()
  
  // 加载基础数据
  await loadBaseData()
  
  // 编辑时加载详情
  if (type === 'update' && id) {
    await loadDetail(id)
  }
}

const resetForm = () => {
  Object.assign(formData, {
    producerEnterpriseId: undefined,
    producerContactName: '',
    producerContactPhone: '',
    wasteCode: '',
    wasteName: '',
    wasteCategory: '',
    estimatedQuantity: 0,
    quantityUnit: '',
    wasteDescription: '',
    pickupAddress: '',
    deliveryAddress: '',
    expectedPickupTime: '',
    expectedDeliveryTime: '',
    businessMode: BusinessMode.INDEPENDENT_OPERATION,
    isUrgent: false,
    priorityLevel: 5,
    recyclerEnterpriseId: undefined,
    remark: ''
  })
  
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

const loadBaseData = async () => {
  formLoading.value = true
  try {
    // 加载产废企业
    const producerList = await getEnterpriseSimpleList({ enterpriseType: 1 }) // 1表示产废企业
    producerOptions.value = producerList
    
    // 加载回收企业
    const recyclerList = await getEnterpriseSimpleList({ enterpriseType: 2 }) // 2表示回收企业
    recyclerOptions.value = recyclerList
    
    // 使用字典接口加载废物代码列表
    // 注意：这里不再调用 getWasteCodeList() 接口
    wasteCodeOptions.value = getStrDictOptions(DICT_TYPE.WASTE_CODE)
      .map(item => ({
        code: item.value,
        name: item.label,
        category: ''
      }))
    
    // 字典接口已通过 store 中的 getDictOptions 加载，无需单独调用
  } catch (error) {
    ElMessage.error('加载基础数据失败')
  } finally {
    formLoading.value = false
  }
}

const loadDetail = async (id: number) => {
  formLoading.value = true
  try {
    const data = await getAppointment(id)
    Object.assign(formData, data)
  } catch (error) {
    ElMessage.error('加载详情失败')
  } finally {
    formLoading.value = false
  }
}

const handleProducerChange = (value: number) => {
  const producer = producerOptions.value.find(item => item.id === value)
  if (producer) {
    formData.producerContactName = producer.contactName || ''
    formData.producerContactPhone = producer.contactPhone || ''
  }
}

const handleWasteCodeChange = async (value: string) => {
  if (!value) return
  
  // 从字典选项中获取废物名称
  const wasteOption = wasteCodeOptions.value.find(item => item.code === value)
  if (wasteOption) {
    formData.wasteName = wasteOption.name
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  
  submitLoading.value = true
  try {
    // 提交前将undefined转为对应的数字类型
    const submitData = {
      ...formData,
      producerEnterpriseId: formData.producerEnterpriseId as number,
      recyclerEnterpriseId: formData.recyclerEnterpriseId
    }
    
    if (formType.value === 'create') {
      await createAppointment(submitData)
      ElMessage.success('创建成功')
    } else {
      const updateData: AppointmentUpdateReqVO = {
        ...submitData,
        id: formId.value!
      }
      await updateAppointment(updateData)
      ElMessage.success('更新成功')
    }
    
    dialogVisible.value = false
    emit('success')
  } catch (error) {
    ElMessage.error(formType.value === 'create' ? '创建失败' : '更新失败')
  } finally {
    submitLoading.value = false
  }
}

// 暴露给父组件的方法
defineExpose({
  open
})
</script>

<style lang="scss" scoped>
.appointment-form {
  .el-divider {
    margin: 20px 0 16px 0;
    
    &:first-child {
      margin-top: 0;
    }
  }
  
  .el-form-item {
    margin-bottom: 20px;
  }
}
</style> 