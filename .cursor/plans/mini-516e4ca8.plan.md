<!-- 516e4ca8-4180-456b-bfa0-e490c3ee82a7 40b30f21-9d6e-48f1-974d-f92c3dae3e62 -->
# Mini 广告墙实施计划

## 1. 依赖与项目骨架

- 安装并配置 `react-router-dom`, `zustand`, `react-hook-form`, `@hookform/resolvers`, `zod`, `classnames`, `uuid`, 以及 UI 辅助库（如 `@radix-ui/react-dialog`）。
- 新建约定目录：`src/app`, `src/components`, `src/features/ad-board`, `src/shared`，并在 `tsconfig` 中完善路径别名。

## 2. 领域模型与数据层

- 在 `src/shared/types/ad.ts` 定义 `Ad`, `AdDraft`, `BidScore`, `FormFieldConfig` 等类型，补充枚举与常量（预留视频、动态字段）
- 在 `src/shared/utils/bid.ts` 实现竞价排序公式与通用排序工具，暴露 `calculateBidScore`、`sortAdsByBid` 等方法。
- 在 `src/shared/repository/adRepository.ts` 定义 `AdRepository` 接口与 `localStorage` 实现，包含 `seed`, `list`, `create`, `update`, `duplicate`, `delete`, `click`，并为未来 HTTP 适配器保留抽象。

## 3. 状态管理与服务

- 创建 `src/features/ad-board/store/useAdsStore.ts`（Zustand）封装 `loadAds`, `createAd`, `updateAd`, `duplicateAd`, `deleteAd`, `clickAd` 等 action，内部调用 repository + 排序逻辑。
- 引入轻量通知/错误状态（可用内置 toast hooks）并在 store 中统一处理。

## 4. UI 结构与交互

- 在 `src/app/AppRouter.tsx` 组织路由，`App.tsx` 仅注入 `AppShell`（顶栏、内容区、主题 provider）。
- 在 `src/features/ad-board/components/` 实现：
- `AdBoardPage`：加载与布局，包含筛选区与排序信息。
- `AdCard`：展示标题/发布者/出价/热度/落地链接按钮 + 操作按钮（编辑/复制/删除/点击）。
- `AdFormDrawer`（依托 React Hook Form + Zod）：支持创建/编辑/复制模式，利用 `FormFieldConfig` 预留动态渲染点及“媒体上传 slot”。
- `DeleteConfirmDialog` 与 `EmptyState`、`StatBadge` 等小组件。
- 交互流程：页面初始化 `loadAds`（无数据则 `seed`）；所有 CRUD 行为后刷新 store；点击卡片同时 `window.open` + `clickAd`。

## 5. 样式与设计系统

- 在 `src/shared/styles/tokens.css` 或 `src/index.css` 建立浅色系、玻璃拟态风格的 CSS 变量、柔和阴影、圆角体系，并封装通用 `Button`, `Tag`, `Drawer` 样式。
- 使用现代字体（如 `"HarmonyOS Sans"` 或 `"Inter"`）并在组件中应用统一 spacing / radius / blur。

## 6. 预留进阶扩展

- 在 repository 导出 `HttpAdRepository` stub，`AdFormDrawer` 通过 `FormFieldConfig[]` 渲染，保留 `mediaSlots` prop。
- 在类型与 store 中预留 `mediaAssets`, `videoUrls` 字段，UI 中显示占位提示。

## 7. 文档与校验

- 更新 `README.md` 简述技术栈、运行方式、进阶预留点；新增 `docs/architecture.md`（或补写基础任务说明）。
- 执行 `npm run lint` & `npm run build` 验证。

## 实施 Todos

- setup-deps: 安装依赖与目录模板
- domain-repo: 编写类型、排序工具、repository
- state-ui: 完成 Zustand store 与核心页面组件
- styles-docs: 主题样式与 README/architecture 文档

### To-dos

- [ ] 安装依赖并搭建目录结构
- [ ] 实现类型、竞价工具、广告仓储
- [ ] 构建 store 与广告墙核心界面
- [ ] 完善主题样式与文档说明