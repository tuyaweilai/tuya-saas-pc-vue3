import { Layout } from '@/utils/routerHelper'
import { useI18n } from 'vue-i18n'

// 动态获取，不能全局使用
const getI18nTitle = (key: string) => {
  const { t } = useI18n()
  return t(key)
}

export default {
  path: '/enterprise',
  component: Layout,
  redirect: '/enterprise/info',
  name: 'Enterprise',
  meta: {
    title: getI18nTitle('router.enterprise'),
    icon: 'carbon:home',
    order: 3
  },
  children: [
    {
      path: 'info',
      component: () => import('@/views/enterprise/info/index.vue'),
      name: 'EnterpriseInfo',
      meta: {
        title: getI18nTitle('router.enterpriseInfo')
      }
    },
    {
      path: 'qualification',
      component: () => import('@/views/enterprise/qualification/index.vue'),
      name: 'EnterpriseQualification',
      meta: {
        title: getI18nTitle('router.enterpriseQualification')
      }
    },
    {
      path: 'store',
      component: () => import('@/views/enterprise/store/index.vue'),
      name: 'EnterpriseStore',
      meta: {
        title: getI18nTitle('router.enterpriseStore')
      }
    },
    {
      path: 'userRelation',
      component: () => import('@/views/enterprise/userRelation/index.vue'),
      name: 'EnterpriseUserRelation',
      meta: {
        title: getI18nTitle('router.enterpriseUserRelation')
      }
    },
    // 新增企业认证引导页
    {
      path: 'auth-guide',
      component: () => import('@/views/enterprise/auth/AuthGuide.vue'),
      name: 'EnterpriseAuthGuide',
      meta: {
        title: '企业认证引导',
        noTagsView: true,
        noCache: true,
        hidden: true,
        canTo: false, // 表示不能通过常规菜单进入
        requiresAuth: false // 不需要认证也能访问，因为此时用户刚登录但未完成认证
      }
    },
    // 新增企业选择页
    {
      path: 'select',
      component: () => import('@/views/enterprise/auth/SelectEnterprise.vue'),
      name: 'EnterpriseSelect',
      meta: {
        title: '选择企业',
        noTagsView: true,
        noCache: true,
        hidden: true,
        canTo: false,
        requiresAuth: false
      }
    }
  ]
} 