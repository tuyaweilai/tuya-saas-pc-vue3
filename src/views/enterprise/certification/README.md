# 认证中心

## 功能概述

认证中心是企业用户完善个人信息和企业资质认证的页面，分为个人认证和企业认证两个模块。通过认证可以提升账户安全和信任度，享受更多专业服务。

## 页面配置

- 页面路径：通过管理后台动态配置菜单（`enterprise/certification`）
- 页面名称：`Certification`
- 无需在路由中单独配置

## 主要功能

### 1. 认证概览
- 顶部展示个人认证和企业认证的状态卡片
- 不同认证状态有不同的背景色和边框
- 状态包括：未认证、认证中、已认证、认证失败

### 2. Tab切换
- 个人认证和企业认证使用Tab方式切换
- 支持禁用状态（当条件不满足时）
- 智能默认显示逻辑

### 3. 个人认证模块
#### 认证表单
- **真实姓名**：中文姓名验证
- **身份证号**：18位身份证号码验证
- **身份证正面**：上传身份证正面照片
- **身份证反面**：上传身份证反面照片

#### 状态管理
- 未认证：显示认证表单
- 认证中：禁用表单，显示审核中提示
- 已认证：显示认证成功状态，脱敏显示个人信息
- 认证失败：显示失败原因，支持重新提交

### 4. 企业认证模块
#### 认证资料分类
1. **基础证件材料**
   - 营业执照（必需）
   - 组织机构代码证（可选，三证合一可不传）

2. **税务财务证件**
   - 税务登记证（可选，三证合一可不传）
   - 银行开户许可证（可选）

3. **法定代表人证件**
   - 法人身份证正面（必需）
   - 法人身份证反面（必需）

4. **授权委托书**
   - 授权委托书（可选，非法人申请时需要）

#### 状态管理
- 未认证：显示认证表单
- 认证中：禁用表单，显示审核中提示
- 已认证：显示认证成功状态，提供证书下载
- 认证失败：显示失败原因，支持重新提交

## API 接口

### 获取认证状态概览
```
GET /admin-api/enterprise/certification/overview
```

### 个人认证相关
```
GET /admin-api/enterprise/certification/personal
POST /admin-api/enterprise/certification/personal/submit
```

### 企业认证相关
```
GET /admin-api/enterprise/certification/enterprise
POST /admin-api/enterprise/certification/enterprise/submit
```

## 数据结构

### CertificationOverviewVO
```typescript
interface CertificationOverviewVO {
  personalCertification: PersonalCertificationVO
  enterpriseCertification: EnterpriseCertificationVO
  canAccessPersonal: boolean    // 是否可以进行个人认证
  canAccessEnterprise: boolean  // 是否可以进行企业认证
}
```

### PersonalCertificationVO
```typescript
interface PersonalCertificationVO {
  id?: number
  realName?: string                 // 真实姓名
  idCardNo?: string                 // 身份证号
  idCardFrontFileId?: number        // 身份证正面文件ID
  idCardBackFileId?: number         // 身份证反面文件ID
  status?: number                   // 认证状态
  auditRemark?: string              // 审核备注
  submitTime?: string               // 提交时间
  auditTime?: string                // 审核时间
}
```

### EnterpriseCertificationVO
```typescript
interface EnterpriseCertificationVO {
  id?: number
  enterpriseId?: number
  businessLicenseFileId?: number           // 营业执照文件ID
  organizationCodeFileId?: number          // 组织机构代码证文件ID
  taxRegistrationFileId?: number           // 税务登记证文件ID
  bankAccountPermitFileId?: number         // 银行开户许可证文件ID
  legalPersonIdCardFrontFileId?: number    // 法人身份证正面文件ID
  legalPersonIdCardBackFileId?: number     // 法人身份证反面文件ID
  authorizationLetterFileId?: number       // 授权委托书文件ID
  status?: number                          // 认证状态
  auditRemark?: string                     // 审核备注
  submitTime?: string                      // 提交时间
  auditTime?: string                       // 审核时间
}
```

## 认证状态

- **0**: 未认证 - 初始状态，可以提交认证申请
- **1**: 认证中 - 已提交认证，等待审核，表单禁用
- **2**: 已认证 - 认证通过，显示认证成功状态
- **3**: 认证失败 - 认证被拒绝，显示失败原因，可重新提交

## 文件上传要求

### 个人认证
- **身份证照片**：PNG、JPG、JPEG格式，最大5MB
- 要求照片清晰，四角完整，信息可见

### 企业认证
- **证件扫描件**：PNG、JPG、JPEG、PDF格式，最大10MB
- **身份证照片**：PNG、JPG、JPEG格式，最大5MB
- 要求证件信息清晰可见，完整无缺

## 表单验证

### 个人认证验证规则
- 真实姓名：2-20个字符，仅支持中文和·
- 身份证号：18位身份证号码格式验证
- 文件上传：必须上传身份证正反面

### 企业认证验证规则
- 营业执照：必须上传
- 法人身份证：必须上传正反面
- 其他证件：可选上传

## 页面特色

### 1. 状态驱动的UI设计
- 根据认证状态动态显示不同的界面
- 状态卡片使用渐变背景和边框强调
- 表单禁用状态的视觉反馈

### 2. 分步骤的企业认证
- 按证件类型分组展示
- 每个分组有清晰的标题和图标
- 详细的上传要求说明

### 3. 用户体验优化
- 智能Tab默认显示逻辑
- 表单数据自动回填
- 脱敏信息显示
- 友好的错误提示

### 4. 响应式设计
- 移动端自动调整布局
- 上传区域响应式排列
- 保持良好的可用性

## 使用说明

1. 在管理后台菜单管理中配置菜单，路径设置为 `enterprise/certification`
2. 用户访问页面可看到认证概览和具体认证表单
3. 根据业务规则控制用户是否可以访问各认证模块
4. 支持认证状态的实时更新和错误处理

## 技术特点

- Vue 3 Composition API + TypeScript
- Element Plus 组件库
- 文件上传组件集成
- 表单验证和错误处理
- 状态管理和响应式数据
- @SaasApi接口集成
- 模块化组件设计

## 注意事项

1. 页面通过管理后台动态配置，无需在前端路由中配置
2. 使用@SaasApi方式接入后端接口
3. 文件上传依赖系统的文件管理模块
4. 认证状态需要与后端保持同步
5. 敏感信息需要脱敏处理
6. 需要合理的权限控制机制 