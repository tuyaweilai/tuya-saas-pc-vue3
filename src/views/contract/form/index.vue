<template>
  <ContentWrap>
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '编辑合同' : '新建合同' }}</span>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        v-loading="loading"
      >
        <!-- 基本信息 -->
        <el-divider content-position="left">基本信息</el-divider>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="合同名称" prop="contractName">
              <el-input
                v-model="formData.contractName"
                placeholder="请输入合同名称"
                maxlength="100"
                show-word-limit
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="合同类型" prop="contractTypeId">
              <el-select
                v-model="formData.contractTypeId"
                placeholder="请选择合同类型"
                style="width: 100%"
                @change="handleTypeChange"
              >
                <el-option
                  v-for="type in contractTypes"
                  :key="type.id"
                  :label="type.name"
                  :value="type.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="合同模板" prop="templateId">
              <el-select
                v-model="formData.templateId"
                placeholder="请选择合同模板"
                style="width: 100%"
                clearable
                @change="handleTemplateChange"
              >
                <el-option
                  v-for="template in contractTemplates"
                  :key="template.id"
                  :label="template.name"
                  :value="template.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="主要负责企业" prop="primaryOwnerEnterpriseId">
              <el-select
                v-model="formData.primaryOwnerEnterpriseId"
                placeholder="请选择主要负责企业"
                style="width: 100%"
                filterable
              >
                <el-option
                  v-for="enterprise in enterprises"
                  :key="enterprise.id"
                  :label="enterprise.name"
                  :value="enterprise.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 金额信息 -->
        <el-divider content-position="left">金额信息</el-divider>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="合同总金额" prop="totalAmount">
              <el-input-number
                v-model="formData.totalAmount"
                placeholder="请输入合同总金额"
                style="width: 100%"
                :precision="2"
                :min="0"
                :max="999999999.99"
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="币种" prop="currency">
              <el-select
                v-model="formData.currency"
                placeholder="请选择币种"
                style="width: 100%"
              >
                <el-option label="人民币" value="CNY" />
                <el-option label="美元" value="USD" />
                <el-option label="欧元" value="EUR" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 时间信息 -->
        <el-divider content-position="left">时间信息</el-divider>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="生效日期" prop="effectiveDate">
              <el-date-picker
                v-model="formData.effectiveDate"
                type="date"
                placeholder="请选择生效日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="到期日期" prop="expiryDate">
              <el-date-picker
                v-model="formData.expiryDate"
                type="date"
                placeholder="请选择到期日期"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 其他信息 -->
        <el-divider content-position="left">其他信息</el-divider>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="优先级" prop="priorityLevel">
              <el-select
                v-model="formData.priorityLevel"
                placeholder="请选择优先级"
                style="width: 100%"
              >
                <el-option label="低" :value="1" />
                <el-option label="中" :value="2" />
                <el-option label="高" :value="3" />
                <el-option label="紧急" :value="4" />
              </el-select>
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="电子合同">
              <el-switch
                v-model="formData.isElectronic"
                active-text="是"
                inactive-text="否"
              />
            </el-form-item>
          </el-col>
        </el-row>

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

        <!-- 合同内容 -->
        <el-divider content-position="left">合同内容</el-divider>
        
        <el-form-item label="合同内容" prop="content">
          <div class="editor-container">
            <Toolbar
              :editor="editorRef"
              :defaultConfig="toolbarConfig"
              mode="default"
              style="border-bottom: 1px solid #ccc"
            />
            <Editor
              v-model="formData.content"
              :defaultConfig="editorConfig"
              mode="default"
              style="height: 400px; overflow-y: hidden;"
              @on-created="handleCreated"
            />
          </div>
        </el-form-item>

        <!-- 操作按钮 -->
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
            {{ isEdit ? '更新' : '创建' }}
          </el-button>
          <el-button @click="handleSaveDraft" :loading="draftLoading">
            保存草稿
          </el-button>
          <el-button @click="handleCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </ContentWrap>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, shallowRef } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import '@wangeditor/editor/dist/css/style.css'
import { useContractStore } from '@/store/modules/contract'
import { contractTypeApi, contractTemplateApi } from '@/api/contract/contract'
import type { ContractCreateReq, ContractUpdateReq, ContractType, ContractTemplate } from '@/api/contract/contract'

defineOptions({ name: 'ContractForm' })

const router = useRouter()
const route = useRoute()
const contractStore = useContractStore()

// 编辑器实例
const editorRef = shallowRef()

// 响应式数据
const loading = ref(false)
const submitLoading = ref(false)
const draftLoading = ref(false)
const isEdit = ref(false)
const contractId = ref<number>()

const contractTypes = ref<ContractType[]>([])
const contractTemplates = ref<ContractTemplate[]>([])
const enterprises = ref([]) // 企业列表，需要从企业管理模块获取

// 表单数据
const formData = reactive<ContractCreateReq>({
  contractName: '',
  contractTypeId: undefined,
  templateId: undefined,
  primaryOwnerEnterpriseId: undefined,
  totalAmount: undefined,
  currency: 'CNY',
  priorityLevel: 2,
  remark: '',
  effectiveDate: '',
  expiryDate: '',
  content: '',
  isElectronic: true
})

// 表单验证规则
const formRules = {
  contractName: [
    { required: true, message: '请输入合同名称', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  contractTypeId: [
    { required: true, message: '请选择合同类型', trigger: 'change' }
  ],
  primaryOwnerEnterpriseId: [
    { required: true, message: '请选择主要负责企业', trigger: 'change' }
  ],
  currency: [
    { required: true, message: '请选择币种', trigger: 'change' }
  ],
  priorityLevel: [
    { required: true, message: '请选择优先级', trigger: 'change' }
  ],
  effectiveDate: [
    { required: true, message: '请选择生效日期', trigger: 'change' }
  ],
  expiryDate: [
    { required: true, message: '请选择到期日期', trigger: 'change' },
    {
      validator: (rule, value, callback) => {
        if (value && formData.effectiveDate && new Date(value) <= new Date(formData.effectiveDate)) {
          callback(new Error('到期日期必须晚于生效日期'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}

// 富文本编辑器配置
const toolbarConfig = {
  excludeKeys: ['group-video']
}

const editorConfig = {
  placeholder: '请输入合同内容...',
  MENU_CONF: {
    uploadImage: {
      server: '/api/infra/file/upload',
      fieldName: 'file',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }
  }
}

// 编辑器创建回调
const handleCreated = (editor) => {
  editorRef.value = editor
}

// 获取合同类型
const getContractTypes = async () => {
  try {
    contractTypes.value = await contractTypeApi.getContractTypeList()
  } catch (error) {
    console.error('获取合同类型失败:', error)
  }
}

// 获取合同模板
const getContractTemplates = async (typeId?: number) => {
  try {
    contractTemplates.value = await contractTemplateApi.getContractTemplateList(typeId)
  } catch (error) {
    console.error('获取合同模板失败:', error)
  }
}

// 获取企业列表（模拟数据，实际应该从企业管理模块获取）
const getEnterprises = async () => {
  // 这里应该调用企业管理的API
  enterprises.value = [
    { id: 1, name: '示例企业A' },
    { id: 2, name: '示例企业B' },
    { id: 3, name: '示例企业C' }
  ]
}

// 合同类型变化处理
const handleTypeChange = (typeId: number) => {
  formData.templateId = undefined
  getContractTemplates(typeId)
}

// 模板变化处理
const handleTemplateChange = async (templateId: number) => {
  if (!templateId) return
  
  try {
    const template = contractTemplates.value.find(t => t.id === templateId)
    if (template) {
      formData.content = template.content
    }
  } catch (error) {
    console.error('加载模板内容失败:', error)
  }
}

// 获取合同详情（编辑模式）
const getContractDetail = async (id: number) => {
  loading.value = true
  try {
    const contract = await contractStore.fetchContractDetail(id)
    
    // 填充表单数据
    Object.assign(formData, {
      contractName: contract.contractName,
      contractTypeId: contract.contractTypeId,
      templateId: contract.templateId,
      primaryOwnerEnterpriseId: contract.primaryOwnerEnterpriseId,
      totalAmount: contract.totalAmount,
      currency: contract.currency || 'CNY',
      priorityLevel: contract.priorityLevel || 2,
      remark: contract.remark,
      effectiveDate: contract.effectiveDate,
      expiryDate: contract.expiryDate,
      content: contract.content,
      isElectronic: contract.isElectronic
    })
    
    // 加载对应类型的模板
    if (contract.contractTypeId) {
      await getContractTemplates(contract.contractTypeId)
    }
  } finally {
    loading.value = false
  }
}

// 提交表单
const handleSubmit = async () => {
  const formRef = ref()
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitLoading.value = true
    
    if (isEdit.value) {
      const updateData: ContractUpdateReq = {
        id: contractId.value!,
        ...formData
      }
      await contractStore.updateContract(updateData)
      ElMessage.success('更新成功')
    } else {
      await contractStore.createContract(formData)
      ElMessage.success('创建成功')
    }
    
    router.push('/contract/list')
  } catch (error) {
    if (error !== 'validation failed') {
      ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
    }
  } finally {
    submitLoading.value = false
  }
}

// 保存草稿
const handleSaveDraft = async () => {
  try {
    draftLoading.value = true
    
    if (isEdit.value) {
      const updateData: ContractUpdateReq = {
        id: contractId.value!,
        ...formData
      }
      await contractStore.updateContract(updateData)
    } else {
      await contractStore.createContract(formData)
    }
    
    ElMessage.success('草稿保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    draftLoading.value = false
  }
}

// 取消操作
const handleCancel = async () => {
  try {
    await ElMessageBox.confirm('确认取消吗？未保存的数据将丢失', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    router.push('/contract/list')
  } catch (error) {
    // 用户取消
  }
}

// 初始化
onMounted(async () => {
  // 检查是否为编辑模式
  const id = route.params.id as string
  if (id && id !== 'create') {
    isEdit.value = true
    contractId.value = Number(id)
  }
  
  // 加载基础数据
  await Promise.all([
    getContractTypes(),
    getEnterprises()
  ])
  
  // 编辑模式下加载合同详情
  if (isEdit.value && contractId.value) {
    await getContractDetail(contractId.value)
  }
})

// 组件销毁时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
}

.editor-container {
  border: 1px solid #ccc;
  z-index: 100;
}

:deep(.w-e-text-placeholder) {
  top: 10px;
  left: 10px;
}
</style> 