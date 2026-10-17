# 博客分类与脑屿集成

主要分类为前端开发 `/frontend`、Web 3D `/web-3d`、AI 应用开发 `/ai`、后端开发 `/backend`。`composables/useCategories.ts` 同时定义导航、分类封面与内容 schema 使用的分类 slug，新增分类时在这里维护。

`content/fullstack/nuxt3-fullstack.md` 已迁移到 `content/backend/nuxt3-fullstack.md`，原 `/fullstack` 及其文章、标签链接通过路由规则跳转到 `/backend`。原食谱内容由 `archives` 集合保留，旧链接及 `/recipes` 仍可访问，但不再出现在技术分类、首页新文或主搜索中。

## 脑屿

- `/web-3d/brain-atlas`：沿用博客默认布局的交互作品页面。
- `content/web-3d/brain-atlas.md`：作品的标题、摘要、日期、分类、标签与说明，使首页、分类、标签和搜索共用同一内容记录。
- `components/brain/BrainExplorer.vue`：选择、导览、加载状态、错误提示与重试，所有 CSS 均局限于组件内部，并适配 `.dark`。
- `components/brain/BrainScene.vue`：仅在作品页面客户端挂载后动态导入。普通文章和首页不加载 Three.js 渲染器。
- `utils/brainModel.ts`：原创程序化示意模型；组件卸载时释放网格、材质、渲染器、观察器和事件监听。
- `data/brain.ts`：脑结构、生活案例与参考来源。

模型的位置、形态和分区边界经过简化，不用于医学定位。内容解释的是区域参与和网络协作，不把心理能力一一归因到脑区。

## 本地验证

使用 Node 22 与 pnpm。`pnpm exec nuxt prepare` 生成内容类型后，可运行 `pnpm exec vue-tsc --noEmit`；模型与数据检查使用 `node --test tests/brain-model.test.mjs`。`pnpm build` 验证生产构建。

本地服务运行在 3001 端口时，`node --test tests/blog-routes.test.mjs` 检查分类、作品、标签、归档和旧链接跳转；可用 `BLOG_VERIFY_URL` 环境变量指定其他本机地址。该检查只发送 HTTP 请求，不会打开浏览器。

开发服务默认使用 `.nuxt`。若与开发服务同时验证生产构建，可将 `NUXT_BUILD_DIR` 设为 `.cache/nuxt-production` 后执行 `pnpm build`，隔离生成的模板和缓存；构建产物仍位于 `.output`。按用户要求，不自动启动浏览器预览。
