# Mini 广告墙

一个极简版的广告平台前端应用，支持广告的创建、编辑、复制、删除和点击排序功能。

## 技术栈

- **框架**: React 19 + TypeScript
- **构建工具**: Vite (rolldown)
- **状态管理**: Zustand
- **表单处理**: React Hook Form + Zod
- **UI 组件**: Radix UI (Dialog, Toast)
- **样式**: CSS Variables + 玻璃拟态设计

## 项目结构

```
src/
├── app/                    # 应用入口与路由
│   ├── AppShell.tsx       # 应用外壳组件
│   └── AppRouter.tsx      # 路由配置
├── features/              # 功能模块
│   └── ad-board/         # 广告墙功能
│       ├── components/   # UI 组件
│       │   ├── AdBoardPage.tsx
│       │   ├── AdCard.tsx
│       │   ├── AdFormDrawer.tsx
│       │   └── DeleteConfirmDialog.tsx
│       └── store/        # 状态管理
│           └── useAdsStore.ts
└── shared/               # 共享代码
    ├── repository/       # 数据仓储层
    │   ├── adRepository.ts
    │   └── adSeed.ts
    ├── styles/          # 样式系统
    │   └── tokens.css
    ├── types/          # 类型定义
    │   └── ad.ts
    └── utils/         # 工具函数
        └── bid.ts     # 竞价排序逻辑
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

### 进阶任务（预留接口）

- 🔄 前后端分离版本（`httpAdRepository` 已预留）
- 🔄 视频上传与播放（`mediaAssets`、`videoUrls` 字段已预留）
- 🔄 动态表单渲染（`FormFieldConfig` 已支持）

## 运行方式

### 开发环境

```bash
npm install
npm run dev
```

### 构建生产版本

```bash
npm run build
npm run preview
```

## 数据存储

当前版本使用 `localStorage` 存储广告数据，存储键为 `mini-adwall.ads.v1`。

首次访问时会自动初始化示例数据（3 条广告）。

## 设计说明

- **设计风格**: 现代极简主义，浅色系，玻璃拟态效果
- **交互**: 卡片点击跳转、操作菜单下拉、表单抽屉侧滑
- **响应式**: 支持移动端适配

## 开发说明

### 扩展后端接口

在 `src/shared/repository/adRepository.ts` 中实现 `httpAdRepository`，替换 `localAdRepository` 即可切换到 HTTP 模式。

### 扩展表单字段

修改 `src/shared/repository/adRepository.ts` 中的 `defaultFormSchema` 配置，或通过后端接口返回动态配置。

### 添加视频功能

在 `AdFormDrawer` 的 `mediaSlot` prop 中插入视频上传组件，数据会自动保存到 `videoUrls` 字段。

## License

MIT
