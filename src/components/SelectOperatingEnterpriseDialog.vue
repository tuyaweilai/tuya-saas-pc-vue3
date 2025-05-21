<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="emits('update:visible', $event)"
    title="选择企业"
    width="400px"
  >
    <el-radio-group v-model="selectedId">
      <el-radio v-for="item in enterpriseList" :key="item.id" :label="item.id">
        {{ item.name }}
      </el-radio>
    </el-radio-group>
    <template #footer>
      <el-button @click="onSelect" type="primary">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, onMounted } from 'vue'
import { UserRelationApi } from '@/api/enterprise/userRelation'

const props = defineProps<{ visible: boolean }>()
const emits = defineEmits(['update:visible', 'success'])

const enterpriseList = ref<any[]>([])
const selectedId = ref()

onMounted(async () => {
  const res = await UserRelationApi.getEnterpriseSimpleList()
  enterpriseList.value = res || []
})

const onSelect = async () => {
  await UserRelationApi.setDefaultEnterprise({ relationId: selectedId.value })
  emits('update:visible', false)
  emits('success')
}
</script> 