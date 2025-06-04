<template>
  <Dialog title="处理付款" v-model="dialogVisible" width="600px">
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px">
      <el-form-item label="订单信息">
        <div class="order-info">
          <div class="order-no">{{ orderData?.orderNo }}</div>
          <div class="waste-info">{{ orderData?.wasteCode }} - {{ orderData?.wasteName }}</div>
          <div class="amount-info">
            <span>预估金额：¥{{ orderData?.estimatedAmount?.toFixed(2) }}</span>
            <span class="ml-20px" v-if="orderData?.finalAmount">最终金额：¥{{ orderData.finalAmount.toFixed(2) }}</span>
          </div>
        </div>
      </el-form-item>
      
      <el-form-item label="付款方式" prop="paymentMethodType" required>
        <el-radio-group v-model="formData.paymentMethodType">
          <el-radio :label="1">对公结算</el-radio>
          <el-radio :label="2">个人结算</el-radio>
        </el-radio-group>
      </el-form-item>
      
      <!-- 对公结算时显示 -->
      <template v-if="formData.paymentMethodType === 1">
        <el-form-item label="收款企业">
          <div class="enterprise-info">
            <div class="enterprise-name">{{ orderData?.recyclingEnterpriseName }}</div>
            <div class="account-info">
              <span>开户行：{{ paymentAccountInfo.bankName || '待获取' }}</span>
              <span class="ml-20px">账号：{{ paymentAccountInfo.accountNumber || '待获取' }}</span>
            </div>
          </div>
        </el-form-item>
        
        <el-form-item label="付款凭证" prop="paymentVoucherId">
          <el-upload
            class="upload-demo"
            :action="uploadAction"
            :headers="uploadHeaders"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :before-upload="beforeUpload"
            :file-list="fileList"
            list-type="picture-card"
            :limit="3"
          >
            <el-icon><Plus /></el-icon>
            <template #tip>
              <div class="el-upload__tip">
                支持jpg/png/pdf文件，且不超过5MB，最多3个文件
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </template>
      
      <!-- 个人结算时显示 -->
      <template v-if="formData.paymentMethodType === 2">
        <el-form-item label="收款方式">
          <el-radio-group v-model="personalPaymentMethod">
            <el-radio label="alipay">支付宝</el-radio>
            <el-radio label="wechat">微信支付</el-radio>
            <el-radio label="bank">银行转账</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="收款信息">
          <div class="payment-qrcode" v-if="personalPaymentMethod === 'alipay' || personalPaymentMethod === 'wechat'">
            <el-image
              :src="qrcodeUrl"
              fit="contain"
              style="width: 200px; height: 200px"
              :preview-src-list="[qrcodeUrl]"
            />
            <div class="qrcode-tips">请扫码支付后上传付款截图</div>
          </div>
          <div class="bank-info" v-else-if="personalPaymentMethod === 'bank'">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="收款人">{{ personalBankInfo.accountName }}</el-descriptions-item>
              <el-descriptions-item label="开户行">{{ personalBankInfo.bankName }}</el-descriptions-item>
              <el-descriptions-item label="账号">{{ personalBankInfo.accountNumber }}</el-descriptions-item>
            </el-descriptions>
          </div>
        </el-form-item>
        
        <el-form-item label="付款截图" prop="paymentVoucherId">
          <el-upload
            class="upload-demo"
            :action="uploadAction"
            :headers="uploadHeaders"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :before-upload="beforeUpload"
            :file-list="fileList"
            list-type="picture-card"
            :limit="1"
          >
            <el-icon><Plus /></el-icon>
            <template #tip>
              <div class="el-upload__tip">
                请上传付款截图，支持jpg/png文件，不超过5MB
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </template>
      
      <el-form-item label="付款时间" prop="paymentTime">
        <el-date-picker
          v-model="formData.paymentTime"
          type="datetime"
          placeholder="请选择付款时间"
          value-format="YYYY-MM-DD HH:mm:ss"
          style="width: 100%"
        />
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
      
      <!-- 付款确认 -->
      <el-form-item>
        <el-alert
          title="请确认付款信息无误后提交，提交后将更新订单付款状态"
          type="warning"
          show-icon
          :closable="false"
        />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <el-button @click="submitForm" type="primary" :loading="formLoading">确认付款</el-button>
      <el-button @click="dialogVisible = false">取消</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts" name="PaymentProcessDialog">
import { Plus } from '@element-plus/icons-vue'
import * as TransferOrderApi from '@/api/waste/transferOrder'
import type { ProcessPaymentReqVO, TransferOrderRespVO } from '@/api/waste/transferOrder'

const message = useMessage()

const dialogVisible = ref(false)
const formLoading = ref(false)
const orderData = ref<TransferOrderRespVO>()
const formData = ref<ProcessPaymentReqVO>({
  id: 0,
  paymentMethodType: 1,
  paymentVoucherId: undefined,
  remark: ''
})
const formRef = ref()

// 个人结算相关
const personalPaymentMethod = ref('alipay')
const qrcodeUrl = ref('')
const personalBankInfo = ref({
  accountName: '张三',
  bankName: '中国工商银行北京分行',
  accountNumber: '6222020000001234567'
})

// 企业付款账户信息
const paymentAccountInfo = ref({
  bankName: '',
  accountNumber: ''
})

// 文件上传相关
const uploadAction = ref('/api/infra/file/upload')
const uploadHeaders = ref({})
const fileList = ref([])

// 表单校验规则
const formRules = reactive({
  paymentMethodType: [{ required: true, message: '付款方式不能为空', trigger: 'change' }],
  paymentVoucherId: [
    { 
      validator: (rule, value, callback) => {
        if (formData.value.paymentMethodType === 1 && !value) {
          callback(new Error('对公结算必须上传付款凭证'))
        } else if (formData.value.paymentMethodType === 2 && !value) {
          callback(new Error('个人结算必须上传付款截图'))
        } else {
          callback()
        }
      }, 
      trigger: 'change' 
    }
  ],
  remark: [
    { max: 500, message: '备注长度不能超过500个字符', trigger: 'blur' }
  ]
})

// 上传前检查
const beforeUpload = (file) => {
  const isImage = file.type.indexOf('image/') === 0
  const isPdf = file.type === 'application/pdf'
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isImage && !isPdf) {
    message.error('只能上传图片或PDF文件!')
    return false
  }
  if (!isLt5M) {
    message.error('文件大小不能超过 5MB!')
    return false
  }
  return true
}

// 上传成功回调
const handleUploadSuccess = (response, file, fileList) => {
  if (response.code === 0) {
    formData.value.paymentVoucherId = response.data.id
    message.success('文件上传成功')
  } else {
    message.error(response.msg || '文件上传失败')
  }
}

// 上传失败回调
const handleUploadError = (error, file, fileList) => {
  message.error('文件上传失败')
}

// 加载企业付款账户信息
const loadPaymentAccountInfo = async (enterpriseId: number) => {
  try {
    // TODO: 调用企业付款账户API
    // const data = await EnterpriseApi.getPaymentAccount(enterpriseId)
    // paymentAccountInfo.value = data
    
    // 模拟数据
    paymentAccountInfo.value = {
      bankName: '中国建设银行北京分行',
      accountNumber: '11001020000056789012'
    }
  } catch (error) {
    console.error('加载付款账户信息失败:', error)
  }
}

// 生成付款二维码
const generatePaymentQrcode = async () => {
  try {
    // TODO: 调用二维码生成API
    // const data = await PaymentApi.generateQrcode({
    //   amount: orderData.value.finalAmount,
    //   orderNo: orderData.value.orderNo,
    //   paymentMethod: personalPaymentMethod.value
    // })
    // qrcodeUrl.value = data.qrcodeUrl
    
    // 模拟数据
    qrcodeUrl.value = 'https://via.placeholder.com/200x200/409EFF/FFFFFF?text=QR+Code'
  } catch (error) {
    message.error('生成付款二维码失败')
  }
}

// 监听个人付款方式变更
watch(personalPaymentMethod, (newMethod) => {
  if (newMethod === 'alipay' || newMethod === 'wechat') {
    generatePaymentQrcode()
  }
})

// 打开弹窗
const open = async (order: TransferOrderRespVO) => {
  dialogVisible.value = true
  orderData.value = order
  resetForm()
  
  // 设置默认值
  formData.value.id = order.id
  formData.value.paymentTime = new Date().toISOString().slice(0, 19).replace('T', ' ')
  
  // 加载相关数据
  if (order.recyclingEnterpriseId) {
    await loadPaymentAccountInfo(order.recyclingEnterpriseId)
  }
  
  // 生成默认的付款二维码
  generatePaymentQrcode()
}

// 提交表单
const submitForm = async () => {
  const valid = await formRef.value.validate()
  if (!valid) return
  
  formLoading.value = true
  try {
    await TransferOrderApi.processPayment(formData.value)
    message.success('付款处理成功')
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
    paymentMethodType: 1,
    paymentVoucherId: undefined,
    remark: ''
  }
  fileList.value = []
  personalPaymentMethod.value = 'alipay'
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

.amount-info {
  font-size: 12px;
  color: #909399;
}

.enterprise-info {
  padding: 12px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.enterprise-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.account-info {
  font-size: 14px;
  color: #606266;
}

.payment-qrcode {
  text-align: center;
}

.qrcode-tips {
  margin-top: 10px;
  font-size: 12px;
  color: #909399;
}

.bank-info {
  width: 100%;
}

:deep(.upload-demo .el-upload--picture-card) {
  width: 80px;
  height: 80px;
}

:deep(.upload-demo .el-upload-list--picture-card .el-upload-list__item) {
  width: 80px;
  height: 80px;
}
</style> 