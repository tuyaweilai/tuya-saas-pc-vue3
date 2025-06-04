import type { AppRouteRecordRaw } from '@/router/types'
import { t } from '@/hooks/web/useI18n'

const Layout = () => import('@/layout/Layout.vue')

const wasteTransferOrderRoutes: AppRouteRecordRaw = {
  path: '/waste-transfer-order',
  component: Layout,
  name: 'WasteTransferOrder',
  meta: {
    title: t('router.wasteTransferOrder'),
    icon: 'ep:document-copy',
    alwaysShow: true
  },
  children: [
    {
      path: 'list',
      component: () => import('@/views/waste/transfer-order/index.vue'),
      name: 'WasteTransferOrderList',
      meta: {
        title: '订单列表',
        icon: 'ep:list',
        activeMenu: '/waste-transfer-order/list'
      }
    },
    {
      path: 'detail/:id',
      component: () => import('@/views/waste/transfer-order/detail.vue'),
      name: 'WasteTransferOrderDetail',
      meta: {
        title: '订单详情',
        icon: 'ep:view',
        activeMenu: '/waste-transfer-order/list',
        noCache: true,
        hidden: true
      }
    }
  ]
}

export default wasteTransferOrderRoutes 