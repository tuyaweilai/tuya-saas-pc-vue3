# 危废转移订单进度组件

本目录包含了用于显示危废转移订单处理进度的多个组件，适用于不同的使用场景。

## 组件列表

### 1. OrderProgressSteps.vue
**用途**: 订单详情页面的详细进度展示
**特点**: 
- 垂直步骤条布局
- 显示详细的步骤信息、时间戳、操作人员
- 包含可折叠的详细时间线
- 支持不同状态的视觉反馈

**使用示例**:
```vue
<template>
  <OrderProgressSteps :order="orderData" />
</template>

<script setup>
import OrderProgressSteps from '@/components/waste/transfer-order/OrderProgressSteps.vue'
</script>
```

### 2. OrderProgressBar.vue
**用途**: 订单详情页面头部的紧凑进度条
**特点**:
- 水平进度条布局
- 显示进度百分比
- 紧凑的设计，适合放在页面头部
- 包含进度条和节点状态

**使用示例**:
```vue
<template>
  <OrderProgressBar :order="orderData" />
</template>

<script setup>
import OrderProgressBar from '@/components/waste/transfer-order/OrderProgressBar.vue'
</script>
```

### 3. OrderProgressIndicator.vue
**用途**: 订单列表页面的简化进度指示器
**特点**:
- 极简的点状进度显示
- 显示当前步骤和进度百分比
- 适合在表格中使用
- 鼠标悬停显示步骤提示

**使用示例**:
```vue
<template>
  <el-table-column label="处理进度" width="200">
    <template #default="scope">
      <OrderProgressIndicator :order="scope.row" />
    </template>
  </el-table-column>
</template>

<script setup>
import OrderProgressIndicator from '@/components/waste/transfer-order/OrderProgressIndicator.vue'
</script>
```

### 4. OrderStatusTag.vue
**用途**: 显示订单状态标签
**特点**:
- 支持业务状态和付款状态
- 不同状态使用不同颜色
- 简洁的标签样式

**使用示例**:
```vue
<template>
  <!-- 业务状态 -->
  <OrderStatusTag :status="order.businessStatus" type="business" />
  
  <!-- 付款状态 -->
  <OrderStatusTag :status="order.paymentStatus" type="payment" />
</template>

<script setup>
import OrderStatusTag from '@/components/waste/transfer-order/OrderStatusTag.vue'
</script>
```

## 订单状态说明

### 业务状态 (businessStatus)
- `0`: 待确认 - 订单已创建，等待确认
- `1`: 已确认 - 订单信息已确认
- `2`: 待结算 - 等待结算处理
- `3`: 已结算 - 订单已结算
- `4`: 已完成 - 订单处理完成
- `5`: 已取消 - 订单已取消

### 付款状态 (paymentStatus)
- `0`: 未付款 - 尚未付款
- `1`: 已付款 - 付款已完成
- `2`: 付款失败 - 付款处理失败
- `3`: 待凭证上传 - 等待上传付款凭证
- `4`: 凭证已上传 - 付款凭证已上传
- `5`: 凭证已确认 - 付款凭证已确认

## 进度计算逻辑

进度组件根据以下关键时间节点来判断订单处理进度：

1. **订单创建** - `createTime` (始终完成)
2. **订单确认** - `businessStatus >= 1`
3. **收货确认** - `pickupConfirmedTime` 存在
4. **数量分摊** - `allocationCompletedTime` 存在
5. **付款处理** - `paymentCompletedTime` 存在
6. **订单结算** - `businessStatus >= 3`
7. **订单完成** - `businessStatus === 4` 或 `businessStatus === 5` (取消)

## 样式特点

### 颜色系统
- **待处理**: 灰色 (#f5f7fa, #e4e7ed)
- **进行中**: 蓝色 (#409eff) - 带有脉冲动画
- **已完成**: 绿色 (#67c23a)
- **已取消**: 红色 (#f56c6c)

### 响应式设计
- 所有组件都支持响应式布局
- 在移动设备上会自动调整尺寸和间距
- 支持深色模式适配

### 动画效果
- 当前活动步骤带有脉冲动画
- 悬停效果和过渡动画
- 渐入动画效果

## 扩展说明

如需添加新的进度步骤或修改现有逻辑，请修改各组件中的 `progressSteps` 计算属性。所有组件都使用相同的状态判断逻辑，确保一致性。

## 依赖项

- Element Plus (el-timeline, el-progress, el-tag 等)
- @iconify/vue (图标系统)
- Vue 3 Composition API
- TypeScript 支持 