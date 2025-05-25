<template>
  <ContentWrap>
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-content">
        <h2>我的企业入驻申请</h2>
        <p class="text-gray-500">查看您提交的企业入驻申请状态</p>
      </div>
      <el-button type="primary" @click="refreshApplications" :loading="loading">
        <Icon icon="ep:refresh" class="mr-1" />
        刷新状态
      </el-button>
    </div>

    <!-- 申请列表 -->
    <div v-if="applications.length > 0" class="application-list">
      <div 
        v-for="application in applications" 
        :key="application.id"
        class="application-card"
        :class="{ 'expanded': expandedId === application.id }"
      >
        <!-- 卡片头部 -->
        <div class="card-header" @click="toggleExpand(application.id)">
          <div class="enterprise-info">
            <div class="title-row">
              <h3>{{ application.name }}</h3>
              <el-tag 
                :type="getStatusTagType(application.status)" 
                size="large"
                class="status-tag"
              >
                {{ getStatusLabel(application.status) }}
              </el-tag>
            </div>
            <div class="meta-info">
              <div class="meta-item">
                <Icon icon="ep:office-building" class="meta-icon" />
                <span class="enterprise-type">{{ getEnterpriseTypeLabel(application.enterpriseType) }}</span>
              </div>
              <div class="meta-item">
                <Icon icon="ep:calendar" class="meta-icon" />
                <span class="apply-time">{{ formatDateTime(application.createTime) }}</span>
              </div>
              <div class="meta-item">
                <Icon icon="ep:document" class="meta-icon" />
                <span class="credit-code">{{ application.creditCode }}</span>
              </div>
            </div>
          </div>
          <div class="expand-icon">
            <Icon 
              :icon="expandedId === application.id ? 'ep:arrow-up' : 'ep:arrow-down'" 
              :size="20"
            />
          </div>
        </div>

        <!-- 展开的详细内容 -->
        <div v-show="expandedId === application.id" class="card-details">
          <div class="details-grid">
            <!-- 基本信息 -->
            <div class="detail-section">
              <h4 class="section-title">
                <Icon icon="ep:info-filled" />
                基本信息
              </h4>
              <div class="detail-items">
                <div class="detail-item">
                  <span class="label">法定代表人：</span>
                  <span class="value">{{ application.legalPersonName }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">法人身份证：</span>
                  <span class="value">{{ application.legalPersonIdCardNo }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">注册资本：</span>
                  <span class="value">{{ application.registeredCapital }}万元</span>
                </div>
                <div class="detail-item">
                  <span class="label">成立日期：</span>
                  <span class="value">{{ application.establishmentDate }}</span>
                </div>
              </div>
            </div>

            <!-- 联系信息 -->
            <div class="detail-section">
              <h4 class="section-title">
                <Icon icon="ep:phone" />
                联系信息
              </h4>
              <div class="detail-items">
                <div class="detail-item">
                  <span class="label">联系人：</span>
                  <span class="value">{{ application.contactName }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">联系电话：</span>
                  <span class="value">{{ application.contactPhone }}</span>
                </div>
                <div class="detail-item">
                  <span class="label">注册地址：</span>
                  <span class="value">{{ application.registeredAddressDetail }}</span>
                </div>
              </div>
            </div>

            <!-- 审核信息 -->
            <div class="detail-section full-width">
              <h4 class="section-title">
                <Icon icon="ep:document-checked" />
                审核信息
              </h4>
              <div class="audit-timeline">
                <div class="timeline-item" :class="{ active: application.status >= 0 }">
                  <div class="timeline-dot"></div>
                  <div class="timeline-content">
                    <div class="timeline-title">申请提交</div>
                    <div class="timeline-time">{{ formatDateTime(application.createTime) }}</div>
                  </div>
                </div>
                <div class="timeline-item" :class="{ active: application.status === 1 || application.status === 2 }">
                  <div class="timeline-dot"></div>
                  <div class="timeline-content">
                    <div class="timeline-title">
                      {{ application.status === 1 ? '审核通过' : application.status === 2 ? '审核拒绝' : '等待审核' }}
                    </div>
                    <div v-if="application.auditTime" class="timeline-time">
                      {{ formatDateTime(application.auditTime) }}
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- 审核备注 -->
              <div v-if="application.auditRemarks" class="audit-remarks">
                <div class="remarks-label">
                  <Icon icon="ep:warning" />
                  审核备注
                </div>
                <div class="remarks-content">{{ application.auditRemarks }}</div>
              </div>
            </div>

            <!-- 经营范围 -->
            <div class="detail-section full-width">
              <h4 class="section-title">
                <Icon icon="ep:document" />
                经营范围
              </h4>
              <div class="business-scope">
                {{ application.businessScope }}
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="card-actions">
            <el-button 
              v-if="application.status === 2" 
              type="warning"
              @click="resubmitApplication(application)"
              :loading="resubmitLoading"
            >
              <Icon icon="ep:refresh-right" class="mr-1" />
              重新提交
            </el-button>
            
            <el-button 
              v-if="application.status === 1" 
              type="success"
              @click="goToAuthCenter"
            >
              <Icon icon="ep:right" class="mr-1" />
              进入认证中心
            </el-button>

            <el-button 
              type="primary"
              plain
              @click="downloadCertificate(application)"
              v-if="application.status === 1"
            >
              <Icon icon="ep:download" class="mr-1" />
              下载证书
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <el-empty 
        description="暂无企业入驻申请记录"
        :image-size="120"
      >
        <template #image>
          <Icon icon="ep:document" :size="120" color="#dcdfe6" />
        </template>
        <template #description>
          <div class="empty-description">
            <p>您还没有提交过企业入驻申请</p>
            <p class="text-sm text-gray-400">请先完成企业入驻申请流程</p>
          </div>
        </template>
        <el-button type="primary" @click="goToGuide">
          <Icon icon="ep:plus" class="mr-1" />
          开始入驻申请
        </el-button>
      </el-empty>
    </div>
  </ContentWrap>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { InfoApi } from '@/api/enterprise/info'
import { EnterpriseAuthApi, type MyApplicationVO } from '@/api/enterprise/auth'
import { useMessage } from '@/hooks/web/useMessage'
import { formatDate } from '@/utils/formatTime'

defineOptions({ name: 'EnterpriseMyApplication' })

const router = useRouter()
const message = useMessage()

// 响应式数据
const loading = ref(false)
const resubmitLoading = ref(false)
const applications = ref<MyApplicationVO[]>([])
const expandedId = ref<number | null>(null)

// 企业类型映射
const enterpriseTypeMap = {
  1: '产废企业',
  2: '回收企业', 
  3: '处置企业',
  4: '物流企业',
  99: '其他'
}

// 状态映射
const statusMap = {
  0: '待审核',
  1: '已通过',
  2: '已拒绝'
}

// 获取企业类型标签
const getEnterpriseTypeLabel = (type: number) => {
  return enterpriseTypeMap[type] || '未知类型'
}

// 获取状态标签
const getStatusLabel = (status: number) => {
  return statusMap[status] || '未知状态'
}

// 获取状态标签类型
const getStatusTagType = (status: number) => {
  switch (status) {
    case 0: return 'warning'  // 待审核
    case 1: return 'success'  // 已通过
    case 2: return 'danger'   // 已拒绝
    default: return 'info'
  }
}

// 格式化日期时间
const formatDateTime = (dateStr: string) => {
  return formatDate(new Date(dateStr), 'YYYY-MM-DD HH:mm:ss')
}

// 切换展开状态
const toggleExpand = (id: number) => {
  expandedId.value = expandedId.value === id ? null : id
}

// 获取申请列表
const getApplications = async () => {
  try {
    loading.value = true
    const data = await InfoApi.getMyApplications()
    applications.value = data || []
    // 如果只有一个申请，默认展开
    if (applications.value.length === 1) {
      expandedId.value = applications.value[0].id
    }
  } catch (error) {
    console.error('获取申请列表失败:', error)
    message.error('获取申请列表失败')
  } finally {
    loading.value = false
  }
}

// 刷新申请状态
const refreshApplications = () => {
  getApplications()
}

// 重新提交申请
const resubmitApplication = async (application: MyApplicationVO) => {
  try {
    resubmitLoading.value = true
    await EnterpriseAuthApi.resubmitApplication(application.id)
    message.success('重新提交成功，请等待审核')
    await getApplications() // 刷新列表
  } catch (error) {
    console.error('重新提交失败:', error)
    message.error('重新提交失败，请重试')
  } finally {
    resubmitLoading.value = false
  }
}

// 前往认证中心
const goToAuthCenter = () => {
  router.push('/enterprise/auth')
}

// 前往入驻引导
const goToGuide = () => {
  router.push('/enterprise/guide')
}

// 下载证书
const downloadCertificate = (application: MyApplicationVO) => {
  message.success('证书下载功能开发中...')
}

// 页面初始化
onMounted(() => {
  getApplications()
})
</script>

<style lang="scss" scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px 0;
  border-bottom: 1px solid #f0f0f0;

  .header-content {
    h2 {
      font-size: 24px;
      color: #303133;
      margin: 0 0 8px 0;
    }
  }
}

.application-list {
  .application-card {
    background: #fff;
    border: 1px solid #e4e7ed;
    border-radius: 12px;
    margin-bottom: 20px;
    overflow: hidden;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    &:hover {
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      border-color: #409eff;
    }

    &.expanded {
      border-color: #409eff;
      box-shadow: 0 8px 24px rgba(64, 158, 255, 0.15);
    }

    .card-header {
      padding: 24px;
      cursor: pointer;
      border-bottom: 1px solid transparent;
      transition: all 0.3s ease;

      &:hover {
        background: #f8f9fa;
      }

      .enterprise-info {
        flex: 1;

        .title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;

          h3 {
            font-size: 20px;
            color: #303133;
            margin: 0;
            font-weight: 600;
          }

          .status-tag {
            font-size: 14px;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 500;
          }
        }

        .meta-info {
          display: flex;
          flex-wrap: wrap;
          gap: 24px;

          .meta-item {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 14px;
            color: #606266;

            .meta-icon {
              color: #909399;
              font-size: 16px;
            }

            .enterprise-type {
              color: #409eff;
              font-weight: 500;
            }
          }
        }
      }

      .expand-icon {
        display: flex;
        align-items: center;
        color: #909399;
        transition: transform 0.3s ease;
      }
    }

    &.expanded .card-header {
      border-bottom-color: #f0f0f0;
      
      .expand-icon {
        transform: rotate(180deg);
      }
    }

    .card-details {
      padding: 0 24px 24px;
      background: #fafbfc;

      .details-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
        margin-bottom: 24px;

        .detail-section {
          background: #fff;
          border-radius: 8px;
          padding: 20px;
          border: 1px solid #f0f0f0;

          &.full-width {
            grid-column: 1 / -1;
          }

          .section-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 16px;
            color: #303133;
            margin: 0 0 16px 0;
            font-weight: 600;
            padding-bottom: 8px;
            border-bottom: 2px solid #f0f0f0;

            .icon {
              color: #409eff;
            }
          }

          .detail-items {
            .detail-item {
              display: flex;
              margin-bottom: 12px;
              
              &:last-child {
                margin-bottom: 0;
              }

              .label {
                min-width: 100px;
                color: #909399;
                font-size: 14px;
              }

              .value {
                color: #303133;
                font-size: 14px;
                font-weight: 500;
              }
            }
          }

          .business-scope {
            color: #606266;
            line-height: 1.6;
            font-size: 14px;
            background: #f8f9fa;
            padding: 16px;
            border-radius: 6px;
            border-left: 4px solid #409eff;
          }

          .audit-timeline {
            display: flex;
            gap: 40px;
            margin-bottom: 20px;

            .timeline-item {
              display: flex;
              align-items: center;
              gap: 12px;
              position: relative;

              &:not(:last-child)::after {
                content: '';
                position: absolute;
                left: calc(100% + 20px);
                top: 50%;
                width: 20px;
                height: 2px;
                background: #e4e7ed;
                transform: translateY(-50%);
              }

              &.active {
                .timeline-dot {
                  background: #67c23a;
                  border-color: #67c23a;
                }

                .timeline-title {
                  color: #67c23a;
                  font-weight: 600;
                }

                &:not(:last-child)::after {
                  background: #67c23a;
                }
              }

              .timeline-dot {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: #e4e7ed;
                border: 3px solid #e4e7ed;
                transition: all 0.3s ease;
              }

              .timeline-content {
                .timeline-title {
                  font-size: 14px;
                  color: #909399;
                  margin-bottom: 4px;
                  transition: all 0.3s ease;
                }

                .timeline-time {
                  font-size: 12px;
                  color: #c0c4cc;
                }
              }
            }
          }

          .audit-remarks {
            background: #fef7e6;
            border: 1px solid #faecd8;
            border-radius: 6px;
            padding: 16px;

            .remarks-label {
              display: flex;
              align-items: center;
              gap: 6px;
              font-size: 14px;
              color: #e6a23c;
              font-weight: 600;
              margin-bottom: 8px;
            }

            .remarks-content {
              font-size: 14px;
              color: #606266;
              line-height: 1.5;
            }
          }
        }
      }

      .card-actions {
        display: flex;
        gap: 12px;
        align-items: center;
        padding-top: 20px;
        border-top: 1px solid #f0f0f0;
      }
    }
  }
}

.empty-state {
  padding: 60px 0;
  text-align: center;

  .empty-description {
    margin: 16px 0;

    p {
      margin: 4px 0;
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .details-grid {
    grid-template-columns: 1fr !important;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .application-card {
    .card-header {
      padding: 16px;

      .enterprise-info .title-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .enterprise-info .meta-info {
        flex-direction: column;
        gap: 8px;
      }
    }

    .card-details {
      padding: 0 16px 16px;

      .details-grid {
        gap: 16px;
      }

      .detail-section {
        padding: 16px;
      }

      .audit-timeline {
        flex-direction: column;
        gap: 16px;

        .timeline-item:not(:last-child)::after {
          display: none;
        }
      }

      .card-actions {
        flex-wrap: wrap;
      }
    }
  }
}
</style> 