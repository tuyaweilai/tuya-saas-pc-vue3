<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="emits('update:visible', $event)"
    title="企业认证引导"
    width="500px"
  >
    <el-form :model="form" label-width="100px">
      <el-form-item label="企业名称" prop="name">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="统一社会信用代码" prop="creditCode">
        <el-input v-model="form.creditCode" />
      </el-form-item>
      <!-- 可根据实际需求补充更多表单项 -->
    </el-form>
    <template #footer>
      <el-button @click="onSubmit" type="primary">提交认证</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue'
import { InfoApi } from '@/api/enterprise/info'

const props = defineProps<{ visible: boolean }>()
const emits = defineEmits(['update:visible', 'success'])

const form = ref({
  name: '',
  creditCode: ''
})

const onSubmit = async () => {
  await InfoApi.createInfo(form.value)
  emits('update:visible', false)
  emits('success')
}
</script> 