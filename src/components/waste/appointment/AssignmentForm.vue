<template>
  <el-dialog
    v-model="dialogVisible"
    title="分配回收企业"
    width="600px"
    :close-on-click-modal="false"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      v-loading="formLoading"
    >
      <el-form-item label="分配方式" prop="assignmentType">
        <el-radio-group v-model="formData.assignmentType">
          <el-radio :label="AssignmentType.AUTO_ASSIGNMENT">自动分配</el-radio>
          <el-radio :label="AssignmentType.MANUAL_ASSIGNMENT">手动指定</el-radio>
        </el-radio-group>
      </el-form-item>
      
      <el-form-item 
        v-if="formData.assignmentType === AssignmentType.MANUAL_ASSIGNMENT"
        label="回收企业" 
        prop="recyclerEnterpriseId"
      >
        <el-select
          v-model="formData.recyclerEnterpriseId"
          placeholder="请选择回收企业"
          filterable
          clearable
          style="width: 100%"
          @change="handleRecyclerChange"
        >
          <el-option
            v-for="item in recyclerOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          >
            <div>
              <div>{{ item.name }}</div>
              <div class="text-xs text-gray-500">
                联系人：{{ item.contactName }} | 电话：{{ item.contactPhone }}
              </div>
            </div>
          </el-option>
        </el-select>
      </el-form-item>
      
      <el-form-item label="分配原因" prop="assignmentReason">
        <el-input
          v-model="formData.assignmentReason"
          type="textarea"
          :rows="3"
          placeholder="请输入分配原因"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>
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
 * 分配回收企业表单组件
 * 
 * 功能：
 * - 支持自动分配和手动指定
 * - 回收企业选择
 * - 表单验证
 * 
 * @author AI Assistant
 * @date 2024-01-01
 * @version 1.0.0
 */

import { ref, reactive, nextTick } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { 
  assignRecyclerEnterprise, 
  autoAssignRecyclerEnterprise,
  getRecyclerEnterpriseList,
  getAppointment
} from '@/api/waste/appointment'
import { AssignmentType, type EnterpriseOption, type AppointmentVO } from '@/types/waste/appointment'

interface Emits {
  /** 操作成功事件 */
  (e: 'success'): void
}

const emit = defineEmits<Emits>()

// 响应式数据
const dialogVisible = ref(false)
const formLoading = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()
const recyclerOptions = ref<EnterpriseOption[]>([])
const currentAppointment = ref<AppointmentVO>()

const formData = reactive({
  appointmentId: 0,
  recyclerEnterpriseId: undefined as number | undefined,
  assignmentType: AssignmentType.AUTO_ASSIGNMENT,
  assignmentReason: ''
})

// 表单验证规则
const formRules: FormRules = {
  assignmentType: [
    { required: true, message: '请选择分配方式', trigger: 'change' }
  ],
  recyclerEnterpriseId: [
    { 
      required: true, 
      message: '请选择回收企业', 
      trigger: 'change',
      validator: (rule, value, callback) => {
        if (formData.assignmentType === AssignmentType.MANUAL_ASSIGNMENT && !value) {
          callback(new Error('请选择回收企业'))
        } else {
          callback()
        }
      }
    }
  ]
}

// 方法定义
const open = async (appointmentId: number) => {
  dialogVisible.value = true
  formData.appointmentId = appointmentId
  
  // 重置表单
  resetForm()
  
  // 加载数据
  await loadData()
}

const resetForm = () => {
  formData.recyclerEnterpriseId = undefined
  formData.assignmentType = AssignmentType.AUTO_ASSIGNMENT
  formData.assignmentReason = ''
  
  nextTick(() => {
    formRef.value?.clearValidate()
  })
}

const loadData = async () => {
  formLoading.value = true
  try {
    // 并行加载数据
    const [appointmentData, recyclerList] = await Promise.all([
      getAppointment(formData.appointmentId),
      getRecyclerEnterpriseList()
    ])
    
    currentAppointment.value = appointmentData
    recyclerOptions.value = recyclerList
  } catch (error) {
    ElMessage.error('加载数据失败')
  } finally {
    formLoading.value = false
  }
}

const handleRecyclerChange = (value: number) => {
  // 可以在这里添加选择回收企业后的逻辑
  console.log('选择回收企业:', value)
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  
  submitLoading.value = true
  try {
    if (formData.assignmentType === AssignmentType.AUTO_ASSIGNMENT) {
      // 自动分配
      await autoAssignRecyclerEnterprise(formData.appointmentId)
      ElMessage.success('自动分配成功')
    } else {
      // 手动分配
      await assignRecyclerEnterprise({
        appointmentId: formData.appointmentId,
        recyclerEnterpriseId: formData.recyclerEnterpriseId!,
        assignmentType: formData.assignmentType,
        assignmentReason: formData.assignmentReason
      })
      ElMessage.success('分配成功')
    }
    
    dialogVisible.value = false
    emit('success')
  } catch (error) {
    ElMessage.error('分配失败')
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
.assignment-form {
  &__enterprise-option {
    .enterprise-name {
      font-weight: 500;
      color: #303133;
    }
    
    .enterprise-info {
      font-size: 12px;
      color: #909399;
      margin-top: 4px;
    }
  }
}
</style> 