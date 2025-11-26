# Mini 广告墙

一个极简版的广告平台前端应用，支持广告的创建、编辑、复制、删除和点击排序功能。

## 技术栈

### 前端

- **框架**: React 19 + TypeScript
- **构建工具**: Vite (rolldown)
- **状态管理**: Zustand
- **表单处理**: React Hook Form + Zod
- **UI 组件**: Radix UI (Dialog, Toast)
- **样式**: CSS Variables + 玻璃拟态设计

### 后端

- **框架**: Express.js + TypeScript
- **运行时**: Node.js (ES Modules)
- **开发工具**: tsx (热重载)

## 项目结构

```text
adwall/
├── src/                    # 前端代码
│   ├── app/               # 应用入口与路由
│   ├── features/          # 功能模块
│   └── shared/           # 共享代码
│       ├── repository/   # 数据仓储层（支持 localStorage 和 HTTP）
│       ├── types/        # 类型定义
│       └── utils/        # 工具函数
└── server/                # 后端代码
    └── src/
        ├── routes/       # API 路由
        ├── services/     # 业务逻辑
        └── types.ts      # 类型定义
```

## 核心功能

### 基础任务（已完成）

- ✅ 广告列表展示（按竞价排名排序）
- ✅ 创建广告（表单验证 + localStorage 存储）
- ✅ 编辑广告
- ✅ 复制广告
- ✅ 删除广告（确认对话框）
- ✅ 点击广告（跳转落地页 + 点击数 +1）
- ✅ 竞价排序算法：`出价 + 出价 × 点击数 × 0.42`

### 进阶任务

- ✅ **任务1：前后端分离版本**（已完成）
  - Express.js 后端服务
  - RESTful API 接口
  - HTTP Repository 实现
  - 支持前后端独立部署
- 🔄 **任务2：视频上传与播放**（接口已预留）
  - `POST /api/media/upload` 接口已创建
  - `mediaAssets`、`videoUrls` 字段已支持
- ✅ **任务3：动态表单渲染**（已完成）
  - `GET /api/form-schema` 接口已实现，返回 JSON 格式的表单配置
  - 前端完全基于 schema 动态渲染表单项
  - 使用 Zod 根据 schema 动态生成校验规则
  - 表单字段映射完全动态化，无硬编码
  - 实现按需加载：点击新增时请求表单配置
  - 支持加载状态和错误处理

## 运行方式

### 开发环境

#### 方式一：前后端分离（推荐）

1. **安装依赖**：

   ```bash
   # 安装前端依赖
   npm install
   
   # 安装后端依赖
   cd server
   npm install
   cd ..
   ```

2. **启动服务**：

   ```bash
   # 同时启动前后端（推荐）
   npm run dev:all
   
   # 或分别启动
   npm run dev:server  # 启动后端（端口 3001）
   npm run dev         # 启动前端（端口 5173）
   ```

3. **访问应用**：
   - 前端：<http://localhost:5173>
   - 后端 API：<http://localhost:3001/api>

#### 方式二：纯前端模式（localStorage）

如果后端服务未启动，前端会自动降级到 localStorage 模式。

或通过环境变量强制使用 localStorage：

```bash
# 创建 .env.development 文件
VITE_USE_LOCAL_STORAGE=true
```

### 构建生产版本

```bash
# 构建前端
npm run build

# 构建后端
cd server
npm run build
cd ..

# 预览前端
npm run preview
```

## 数据存储

### 前后端分离模式（默认）

- 数据存储在服务器内存中
- 通过 RESTful API 进行数据交互
- 服务重启后数据会丢失（后续可扩展为数据库）

### 纯前端模式（降级方案）

- 使用 `localStorage` 存储广告数据
- 存储键为 `mini-adwall.ads.v1`
- 首次访问时会自动初始化示例数据（3 条广告）

## 环境配置

创建 `.env.development` 文件：

```env
# 开发环境
# 后端 API 地址
VITE_API_BASE_URL=http://localhost:3001

# 是否使用 localStorage（可选）
# VITE_USE_LOCAL_STORAGE=true
```

创建 `.env.production` 文件：

```env
# 生产环境配置
# 后端 API 地址
VITE_API_BASE_URL=https://adwall-thmr.onrender.com

# 生产环境默认使用 HTTP API（可选）
# VITE_USE_LOCAL_STORAGE=true
```

## 设计说明

- **设计风格**: 现代极简主义，浅色系，玻璃拟态效果
- **交互**: 卡片点击跳转、操作菜单下拉、表单抽屉侧滑
- **响应式**: 支持移动端适配

## 自动化流程

### 代码自动检测

项目配置了 Git Hooks 和 lint-staged，在提交代码前会自动进行代码质量检测：

- **Pre-commit 钩子**: 使用 Husky 管理 Git Hooks
- **自动检测**: 通过 lint-staged 对暂存的 TypeScript/TSX 文件进行 ESLint 检查
- **自动修复**: 检测到的问题会自动修复（如果可修复）
- **提交拦截**: 如果存在无法自动修复的错误，提交将被阻止

```bash
# 手动运行代码检测
npm run lint
```

### 自动部署

项目配置了 GitHub Actions 工作流，实现自动构建和部署：

- **触发条件**: 当代码推送到 `main` 分支时自动触发
- **构建流程**:
  1. 检出代码
  2. 安装依赖 (`npm ci`)
  3. 类型检查 (`tsc -b`)
  4. 构建项目 (`vite build`)
- **部署目标**: 自动部署到 GitHub Pages
- **工作流文件**: `.github/workflows/deploy.yml`

部署完成后，项目会自动发布到 GitHub Pages，无需手动操作。

## API 接口文档

### 广告相关接口

- `GET /api/ads` - 获取广告列表（已按竞价排序）
- `POST /api/ads` - 创建广告
- `PUT /api/ads/:id` - 更新广告
- `DELETE /api/ads/:id` - 删除广告
- `POST /api/ads/:id/click` - 点击广告（点击数+1）
- `POST /api/ads/:id/duplicate` - 复制广告

### 表单配置接口（任务3）

- `GET /api/form-schema` - 获取表单配置（返回 JSON 格式的 FormFieldConfig[]）

### 媒体上传接口（任务2预留）

- `POST /api/media/upload` - 上传媒体文件

## 开发说明

### Repository 切换

项目支持两种数据存储方式，通过环境变量自动切换：

- **HTTP 模式**（默认）：使用 `httpAdRepository`，调用后端 API
- **LocalStorage 模式**：使用 `localAdRepository`，数据存储在浏览器

切换方式在 `src/shared/repository/adRepository.ts` 中自动处理。

### 扩展表单字段（任务3）

表单完全基于后端配置动态渲染，修改 `server/src/routes/form-schema.ts` 中的配置即可：

1. **添加新字段**：在 schema 数组中添加新的 `FormFieldConfig` 对象
2. **修改字段**：更新现有字段的 `label`、`placeholder`、`validator` 等属性
3. **自动生效**：前端会自动根据新配置渲染表单和校验规则

**示例**：

```typescript
{
  field: 'title',
  label: '广告标题',
  placeholder: '请输入广告标题',
  component: 'input',
  validator: { required: true, maxLength: 30 },
}
```

**支持的组件类型**：`input`、`textarea`、`number`、`url`
**支持的校验规则**：`required`、`maxLength`、`min`、`max`、`url`

### 添加视频功能

1. 实现 `server/src/routes/media.ts` 中的上传逻辑
2. 在 `AdFormDrawer` 的 `mediaSlot` prop 中插入视频上传组件
3. 数据会自动保存到 `videoUrls` 字段

### 扩展数据库

在 `server/src/services/adService.ts` 中替换内存存储为数据库操作即可。

## License

MIT
