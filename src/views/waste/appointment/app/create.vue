<template>
  <div class="app-create-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <el-button 
        type="text" 
        @click="$router.back()"
        class="back-btn"
      >
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <h2 class="page-title">创建预约</h2>
    </div>

    <!-- 表单内容 -->
    <div class="form-container">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-position="top"
        v-loading="formLoading"
        class="app-form"
      >
        <!-- 废物信息 -->
        <div class="form-section">
          <div class="section-title">
            <el-icon><Box /></el-icon>
            废物信息
          </div>
          
          <el-form-item label="废物代码" prop="wasteCode">
            <el-select
              v-model="formData.wasteCode"
              placeholder="请选择废物代码"
              filterable
              @change="handleWasteCodeChange"
              class="full-width"
            >
              <el-option
                v-for="item in wasteCodeOptions"
                :key="item.code"
                :label="`${item.code} - ${item.name}`"
                :value="item.code"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="废物名称" prop="wasteName">
            <el-input
              v-model="formData.wasteName"
              placeholder="请输入废物名称"
            />
          </el-form-item>
          
          <el-form-item label="废物类别" prop="wasteCategory">
            <el-select
              v-model="formData.wasteCategory"
              placeholder="请选择废物类别"
              class="full-width"
            >
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.WASTE_CATEGORY)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
          
          <el-row :gutter="12">
            <el-col :span="16">
              <el-form-item label="预估数量" prop="estimatedQuantity">
                <el-input-number
                  v-model="formData.estimatedQuantity"
                  :min="0"
                  :precision="2"
                  placeholder="请输入数量"
                  class="full-width"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="单位" prop="quantityUnit">
                <el-select
                  v-model="formData.quantityUnit"
                  placeholder="请选择单位"
                  clearable
                  class="full-width"
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
          
          <el-form-item label="废物描述（可选）" prop="wasteDescription">
            <el-input
              v-model="formData.wasteDescription"
              type="textarea"
              :rows="3"
              placeholder="请描述废物的具体情况"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
        </div>

        <!-- 地址信息 -->
        <div class="form-section">
          <div class="section-title">
            <el-icon><Location /></el-icon>
            地址信息
          </div>
          
          <el-form-item label="取货地址" prop="pickupAddress">
            <el-input
              v-model="formData.pickupAddress"
              placeholder="请输入详细的取货地址"
              type="textarea"
              :rows="2"
            />
          </el-form-item>
        </div>

        <!-- 时间信息 -->
        <div class="form-section">
          <div class="section-title">
            <el-icon><Clock /></el-icon>
            时间信息
          </div>
          
          <el-form-item label="期望取货时间" prop="expectedPickupTime">
            <el-date-picker
              v-model="formData.expectedPickupTime"
              type="datetime"
              placeholder="请选择期望取货时间"
              value-format="YYYY-MM-DD HH:mm:ss"
              class="full-width"
            />
          </el-form-item>
        </div>

        <!-- 业务信息 -->
        <div class="form-section">
          <div class="section-title">
            <el-icon><Setting /></el-icon>
            业务信息
          </div>
          
          <el-form-item label="业务模式" prop="businessMode">
            <el-radio-group v-model="formData.businessMode" class="radio-group">
              <el-radio :label="BusinessMode.INDEPENDENT_OPERATION" class="radio-item">
                独立运营
              </el-radio>
              <el-radio :label="BusinessMode.PLATFORM_BIDDING" class="radio-item">
                平台竞价
              </el-radio>
              <el-radio :label="BusinessMode.HYBRID_MODE" class="radio-item">
                混合模式
              </el-radio>
            </el-radio-group>
          </el-form-item>
          
          <el-form-item label="紧急程度" prop="isUrgent">
            <el-radio-group v-model="formData.isUrgent" class="radio-group">
              <el-radio :label="false" class="radio-item">普通</el-radio>
              <el-radio :label="true" class="radio-item">紧急</el-radio>
            </el-radio-group>
          </el-form-item>
        </div>

        <!-- 指定回收企业（可选） -->
        <div class="form-section">
          <div class="section-title">
            <el-icon><OfficeBuilding /></el-icon>
            指定回收企业（可选）
          </div>
          
          <el-form-item label="回收企业" prop="recyclerEnterpriseId">
            <el-select
              v-model="formData.recyclerEnterpriseId"
              placeholder="留空则系统自动分配"
              filterable
              clearable
              class="full-width"
            >
              <el-option
                v-for="item in recyclerOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              >
                <div class="enterprise-option">
                  <div class="enterprise-name">{{ item.name }}</div>
                  <div class="enterprise-info">
                    {{ item.contactName }} | {{ item.contactPhone }}
                  </div>
                </div>
              </el-option>
            </el-select>
          </el-form-item>
        </div>

        <!-- 备注信息 -->
        <div class="form-section">
          <div class="section-title">
            <el-icon><Document /></el-icon>
            备注信息（可选）
          </div>
          
          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="formData.remark"
              type="textarea"
              :rows="3"
              placeholder="请输入其他需要说明的信息"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
        </div>
      </el-form>
    </div>

    <!-- 底部操作栏 -->
    <div class="bottom-actions">
      <el-button 
        @click="$router.back()"
        class="cancel-btn"
      >
        取消
      </el-button>
      <el-button 
        type="primary" 
        @click="handleSubmit" 
        :loading="submitLoading"
        class="submit-btn"
      >
        提交预约
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * APP端预约创建页面
 * 
 * 功能：
 * - 移动端适配的预约创建表单
 * - 分步骤展示表单内容
 * - 数据联动和验证
 * 
 * @author AI Assistant
 * @date 2024-01-01
 * @version 1.0.0
 */

import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { 
  ArrowLeft, 
  Box, 
  Location, 
  Clock, 
  Setting, 
  OfficeBuilding, 
  Document 
} from '@element-plus/icons-vue'
import { DICT_TYPE, getIntDictOptions, getStrDictOptions } from '@/utils/dict'
import {
  createAppointmentByApp,
  getRecyclerEnterpriseList
} from '@/api/waste/appointment'
import {
  BusinessMode,
  type AppAppointmentCreateReqVO,
  type EnterpriseOption,
  type WasteCodeOption
} from '@/types/waste/appointment'

defineOptions({ name: 'WasteAppAppointmentCreate' })

const router = useRouter()

// 响应式数据
const formLoading = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()

const recyclerOptions = ref<EnterpriseOption[]>([])
const wasteCodeOptions = ref<WasteCodeOption[]>([])

const showUnitPicker = ref(false)

const formData = reactive<AppAppointmentCreateReqVO>({
  // 废物信息
  wasteCode: '',
  wasteName: '',
  wasteCategory: '',
  estimatedQuantity: 0,
  quantityUnit: '',
  wasteDescription: '',
  
  // 地址信息
  pickupAddress: '',
  
  // 时间信息
  expectedPickupTime: '',
  
  // 业务信息
  businessMode: BusinessMode.INDEPENDENT_OPERATION,
  isUrgent: false,
  
  // 回收企业信息
  recyclerEnterpriseId: undefined,
  
  remark: ''
})

// 表单验证规则
const formRules: FormRules = {
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
  ]
}

// 方法定义
const loadBaseData = async () => {
  formLoading.value = true
  try {
    const recyclerList = await getRecyclerEnterpriseList()
    recyclerOptions.value = recyclerList
    
    // 使用字典接口加载废物代码列表
    wasteCodeOptions.value = getStrDictOptions(DICT_TYPE.WASTE_CODE)
      .map(item => ({
        code: item.value,
        name: item.label,
        category: ''
      }))
  } catch (error) {
    ElMessage.error('加载基础数据失败')
  } finally {
    formLoading.value = false
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
    await createAppointmentByApp(formData)
    ElMessage.success('预约创建成功')
    router.back()
  } catch (error) {
    ElMessage.error('创建失败')
  } finally {
    submitLoading.value = false
  }
}

onMounted(() => {
  loadBaseData()
})
</script>

<style lang="scss" scoped>
.app-create-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 80px; // 为底部操作栏留出空间
}

.page-header {
  background: white;
  padding: 16px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  
  .back-btn {
    margin-right: 12px;
    color: #409eff;
    font-size: 16px;
    
    .el-icon {
      margin-right: 4px;
    }
  }
  
  .page-title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
    margin: 0;
  }
}

.form-container {
  padding: 16px;
}

.app-form {
  .form-section {
    background: white;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    
    .section-title {
      display: flex;
      align-items: center;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 16px;
      
      .el-icon {
        margin-right: 8px;
        color: #409eff;
      }
    }
  }
  
  .full-width {
    width: 100%;
  }
  
  .radio-group {
    width: 100%;
    
    .radio-item {
      display: block;
      margin-bottom: 12px;
      margin-right: 0;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      :deep(.el-radio__label) {
        font-size: 14px;
      }
    }
  }
  
  .enterprise-option {
    .enterprise-name {
      font-weight: 500;
      color: #303133;
    }
    
    .enterprise-info {
      font-size: 12px;
      color: #909399;
      margin-top: 2px;
    }
  }
  
  :deep(.el-form-item__label) {
    font-weight: 500;
    color: #606266;
    margin-bottom: 8px;
  }
  
  :deep(.el-input__wrapper) {
    border-radius: 8px;
  }
  
  :deep(.el-select .el-input__wrapper) {
    border-radius: 8px;
  }
  
  :deep(.el-textarea__inner) {
    border-radius: 8px;
  }
  
  :deep(.el-date-editor) {
    width: 100%;
  }
}

.bottom-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 16px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 12px;
  z-index: 100;
  
  .cancel-btn {
    flex: 1;
    height: 44px;
    border-radius: 22px;
    font-size: 16px;
  }
  
  .submit-btn {
    flex: 2;
    height: 44px;
    border-radius: 22px;
    font-size: 16px;
    font-weight: 600;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .form-container {
    padding: 12px;
  }
  
  .form-section {
    padding: 12px !important;
    margin-bottom: 12px !important;
  }
  
  .section-title {
    font-size: 14px !important;
    margin-bottom: 12px !important;
  }
  
  .bottom-actions {
    padding: 12px;
  }
}
</style> 