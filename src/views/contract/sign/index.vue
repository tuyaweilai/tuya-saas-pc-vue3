<template>
  <ContentWrap>
    <el-card v-loading="loading">
      <template #header>
        <div class="sign-header">
          <h2>合同签署</h2>
          <el-tag :type="getStatusInfo(contract?.status).type" size="large">
            {{ getStatusInfo(contract?.status).label }}
          </el-tag>
        </div>
      </template>

      <div class="sign-content">
        <!-- 合同基本信息 -->
        <el-card class="contract-info mb-20px">
          <template #header>
            <span>合同信息</span>
          </template>
          
          <el-descriptions :column="2" border>
            <el-descriptions-item label="合同名称">
              {{ contract?.contractName }}
            </el-descriptions-item>
            <el-descriptions-item label="合同编号">
              {{ contract?.contractNo }}
            </el-descriptions-item>
            <el-descriptions-item label="合同类型">
              {{ contract?.typeName }}
            </el-descriptions-item>
            <el-descriptions-item label="总金额">
              <span v-if="contract?.totalAmount">
                {{ formatCurrency(contract.totalAmount, contract.currency) }}
              </span>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="生效日期">
              {{ contract?.effectiveDate ? formatDate(contract.effectiveDate) : '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="到期日期">
              {{ contract?.expiryDate ? formatDate(contract.expiryDate) : '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 参与方签署状态 -->
        <el-card class="parties-status mb-20px">
          <template #header>
            <span>参与方签署状态</span>
          </template>
          
          <el-table :data="parties" border>
            <el-table-column label="企业名称" prop="enterpriseName" />
            <el-table-column label="参与方类型" prop="partyType">
              <template #default="{ row }">
                <el-tag :type="getPartyTypeInfo(row.partyType).type">
                  {{ getPartyTypeInfo(row.partyType).label }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="签署状态" prop="signStatus">
              <template #default="{ row }">
                <el-tag :type="getSignStatusInfo(row.signStatus).type">
                  {{ getSignStatusInfo(row.signStatus).label }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="签署人" prop="signatoryName" />
            <el-table-column label="签署时间" prop="signTime">
              <template #default="{ row }">
                {{ row.signTime ? formatDate(row.signTime) : '-' }}
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <!-- 合同内容 -->
        <el-card class="contract-content mb-20px">
          <template #header>
            <span>合同内容</span>
          </template>
          
          <div class="content-viewer" v-html="contract?.content"></div>
        </el-card>

        <!-- 签署区域 -->
        <el-card class="sign-area">
          <template #header>
            <span>签署合同</span>
          </template>

          <el-form
            ref="signFormRef"
            :model="signForm"
            :rules="signRules"
            label-width="120px"
          >
            <el-form-item label="签署方" prop="partyId">
              <el-select
                v-model="signForm.partyId"
                placeholder="请选择签署方"
                style="width: 300px"
                @change="handlePartyChange"
              >
                <el-option
                  v-for="party in unsignedParties"
                  :key="party.id"
                  :label="party.enterpriseName"
                  :value="party.id"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="签署人姓名" prop="signatoryName">
              <el-input
                v-model="signForm.signatoryName"
                placeholder="请输入签署人姓名"
                style="width: 300px"
              />
            </el-form-item>

            <el-form-item label="签署方式" prop="signatureMethod">
              <el-radio-group v-model="signForm.signatureMethod">
                <el-radio :label="1">点击确认签署</el-radio>
                <el-radio :label="2">手写签名</el-radio>
                <el-radio :label="3">电子印章</el-radio>
                <el-radio :label="4">密码验证</el-radio>
              </el-radio-group>
            </el-form-item>

            <!-- 手写签名板 -->
            <el-form-item v-if="signForm.signatureMethod === 2" label="手写签名">
              <div class="signature-pad-container">
                <canvas
                  ref="signaturePadRef"
                  :width="signaturePadWidth"
                  :height="signaturePadHeight"
                  @mousedown="startDrawing"
                  @mousemove="draw"
                  @mouseup="stopDrawing"
                  @mouseleave="stopDrawing"
                  @touchstart="startDrawing"
                  @touchmove="draw"
                  @touchend="stopDrawing"
                ></canvas>
                <div class="signature-controls">
                  <el-button @click="clearSignature">清除</el-button>
                  <el-button type="primary" @click="saveSignature">保存签名</el-button>
                </div>
              </div>
            </el-form-item>

            <!-- 电子印章上传 -->
            <el-form-item v-if="signForm.signatureMethod === 3" label="电子印章">
              <el-upload
                class="seal-upload"
                :action="uploadUrl"
                :headers="uploadHeaders"
                :on-success="handleSealUpload"
                :before-upload="beforeSealUpload"
                :show-file-list="false"
                accept="image/*"
              >
                <el-button type="primary">上传印章</el-button>
                <template #tip>
                  <div class="el-upload__tip">
                    只能上传jpg/png文件，且不超过2MB
                  </div>
                </template>
              </el-upload>
              <div v-if="sealImageUrl" class="seal-preview">
                <img :src="sealImageUrl" alt="电子印章" />
              </div>
            </el-form-item>

            <!-- 密码验证 -->
            <el-form-item v-if="signForm.signatureMethod === 4" label="签署密码" prop="signPassword">
              <el-input
                v-model="signForm.signPassword"
                type="password"
                placeholder="请输入签署密码"
                style="width: 300px"
                show-password
              />
            </el-form-item>

            <!-- 签署确认 -->
            <el-form-item>
              <el-checkbox v-model="agreeToSign" :disabled="!canSign">
                我已仔细阅读合同内容，同意签署此合同
              </el-checkbox>
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                size="large"
                :loading="signLoading"
                :disabled="!canSign || !agreeToSign"
                @click="handleSign"
              >
                确认签署
              </el-button>
              <el-button size="large" @click="handleCancel">
                取消
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </el-card>
  </ContentWrap>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useContractStore } from '@/store/modules/contract'
import { contractPartyApi } from '@/api/contract/contract'
import type { ContractResp, ContractParty, ContractSignReq } from '@/api/contract/contract'

defineOptions({ name: 'ContractSign' })

const router = useRouter()
const route = useRoute()
const contractStore = useContractStore()

// 响应式数据
const loading = ref(false)
const signLoading = ref(false)
const contract = ref<ContractResp>()
const parties = ref<ContractParty[]>([])
const agreeToSign = ref(false)

// 签名板相关
const signaturePadRef = ref<HTMLCanvasElement>()
const signaturePadWidth = 400
const signaturePadHeight = 200
const isDrawing = ref(false)
const lastX = ref(0)
const lastY = ref(0)

// 电子印章
const sealImageUrl = ref('')
const uploadUrl = '/api/infra/file/upload'
const uploadHeaders = {
  Authorization: `Bearer ${localStorage.getItem('token')}`
}

// 签署表单
const signForm = reactive<Partial<ContractSignReq>>({
  contractId: 0,
  partyId: undefined,
  signatureMethod: 1,
  signatoryName: '',
  signPassword: '',
  signatureData: ''
})

// 表单验证规则
const signRules = {
  partyId: [
    { required: true, message: '请选择签署方', trigger: 'change' }
  ],
  signatoryName: [
    { required: true, message: '请输入签署人姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  signatureMethod: [
    { required: true, message: '请选择签署方式', trigger: 'change' }
  ],
  signPassword: [
    {
      validator: (rule, value, callback) => {
        if (signForm.signatureMethod === 4 && !value) {
          callback(new Error('请输入签署密码'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 获取状态信息
const getStatusInfo = contractStore.getStatusInfo

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

// 未签署的参与方
const unsignedParties = computed(() => {
  return parties.value.filter(party => party.signStatus === 0)
})

// 是否可以签署
const canSign = computed(() => {
  return signForm.partyId && signForm.signatoryName && signForm.signatureMethod
})

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

// 获取合同详情
const getContractDetail = async () => {
  const contractId = Number(route.params.id)
  if (!contractId) return
  
  loading.value = true
  try {
    contract.value = await contractStore.fetchContractDetail(contractId)
    signForm.contractId = contractId
    
    // 获取参与方列表
    parties.value = await contractPartyApi.getContractParties(contractId)
    
    // 如果URL中指定了参与方ID，自动选择
    const partyId = route.params.partyId
    if (partyId) {
      signForm.partyId = Number(partyId)
    }
  } finally {
    loading.value = false
  }
}

// 参与方变化处理
const handlePartyChange = (partyId: number) => {
  const party = parties.value.find(p => p.id === partyId)
  if (party) {
    // 可以根据参与方信息预填一些数据
  }
}

// 开始绘制签名
const startDrawing = (e: MouseEvent | TouchEvent) => {
  if (!signaturePadRef.value) return
  
  isDrawing.value = true
  const canvas = signaturePadRef.value
  const ctx = canvas.getContext('2d')!
  const rect = canvas.getBoundingClientRect()
  
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
  
  lastX.value = clientX - rect.left
  lastY.value = clientY - rect.top
  
  ctx.beginPath()
  ctx.moveTo(lastX.value, lastY.value)
  
  e.preventDefault()
}

// 绘制签名
const draw = (e: MouseEvent | TouchEvent) => {
  if (!isDrawing.value || !signaturePadRef.value) return
  
  const canvas = signaturePadRef.value
  const ctx = canvas.getContext('2d')!
  const rect = canvas.getBoundingClientRect()
  
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
  
  const currentX = clientX - rect.left
  const currentY = clientY - rect.top
  
  ctx.lineWidth = 2
  ctx.lineCap = 'round'
  ctx.strokeStyle = '#000'
  
  ctx.lineTo(currentX, currentY)
  ctx.stroke()
  
  lastX.value = currentX
  lastY.value = currentY
  
  e.preventDefault()
}

// 停止绘制
const stopDrawing = () => {
  isDrawing.value = false
}

// 清除签名
const clearSignature = () => {
  if (!signaturePadRef.value) return
  
  const canvas = signaturePadRef.value
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  // 绘制边框
  ctx.strokeStyle = '#ddd'
  ctx.lineWidth = 1
  ctx.strokeRect(0, 0, canvas.width, canvas.height)
  
  signForm.signatureData = ''
}

// 保存签名
const saveSignature = () => {
  if (!signaturePadRef.value) return
  
  const canvas = signaturePadRef.value
  const dataURL = canvas.toDataURL('image/png')
  signForm.signatureData = dataURL
  
  ElMessage.success('签名保存成功')
}

// 印章上传前检查
const beforeSealUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2
  
  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('上传文件大小不能超过 2MB!')
    return false
  }
  return true
}

// 印章上传成功
const handleSealUpload = (response: any) => {
  if (response.code === 0) {
    sealImageUrl.value = response.data.url
    signForm.signatureData = response.data.url
    ElMessage.success('印章上传成功')
  } else {
    ElMessage.error('印章上传失败')
  }
}

// 执行签署
const handleSign = async () => {
  const signFormRef = ref()
  if (!signFormRef.value) return
  
  try {
    await signFormRef.value.validate()
    
    // 根据签署方式验证必要数据
    if (signForm.signatureMethod === 2 && !signForm.signatureData) {
      ElMessage.error('请先绘制签名')
      return
    }
    
    if (signForm.signatureMethod === 3 && !signForm.signatureData) {
      ElMessage.error('请先上传电子印章')
      return
    }
    
    await ElMessageBox.confirm('确认签署此合同吗？签署后将不可撤销', '确认签署', {
      confirmButtonText: '确认签署',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    signLoading.value = true
    
    await contractStore.signContract(signForm as ContractSignReq)
    
    ElMessage.success('签署成功')
    
    // 跳转到合同详情页
    router.push(`/contract/detail/${signForm.contractId}`)
  } catch (error) {
    if (error !== 'cancel' && error !== 'validation failed') {
      ElMessage.error('签署失败')
    }
  } finally {
    signLoading.value = false
  }
}

// 取消签署
const handleCancel = async () => {
  try {
    await ElMessageBox.confirm('确认取消签署吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    router.push(`/contract/detail/${signForm.contractId}`)
  } catch (error) {
    // 用户取消
  }
}

// 初始化签名板
const initSignaturePad = async () => {
  await nextTick()
  
  if (!signaturePadRef.value) return
  
  const canvas = signaturePadRef.value
  const ctx = canvas.getContext('2d')!
  
  // 设置画布样式
  canvas.style.border = '1px solid #ddd'
  canvas.style.borderRadius = '4px'
  canvas.style.cursor = 'crosshair'
  
  // 绘制边框
  ctx.strokeStyle = '#ddd'
  ctx.lineWidth = 1
  ctx.strokeRect(0, 0, canvas.width, canvas.height)
}

// 初始化
onMounted(async () => {
  await getContractDetail()
  await initSignaturePad()
})
</script>

<style scoped>
.sign-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sign-header h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.sign-content {
  padding: 20px 0;
}

.contract-info,
.parties-status,
.contract-content,
.sign-area {
  margin-bottom: 20px;
}

.content-viewer {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 20px;
  line-height: 1.6;
}

.signature-pad-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
}

.signature-controls {
  display: flex;
  gap: 10px;
}

.seal-upload {
  margin-bottom: 10px;
}

.seal-preview {
  width: 100px;
  height: 100px;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.seal-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.mb-20px {
  margin-bottom: 20px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-checkbox__label) {
  font-size: 14px;
  line-height: 1.5;
}
</style> 