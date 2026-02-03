# 墨记 - 部署指南

由于当前环境的文件系统限制，无法直接完成构建。请按照以下步骤在您自己的环境中部署墨记应用。

## 环境要求

- Node.js 18.0 或更高版本
- npm 8.0 或更高版本
- 支持符号链接的文件系统

## 部署步骤

### 1. 复制项目文件

将 `ink-diary` 目录复制到您的本地开发环境。

### 2. 安装依赖

```bash
cd ink-diary
npm install
```

### 3. 启动开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:5173` 启动。

### 4. 构建生产版本

```bash
npm run build
```

构建输出将位于 `dist/` 目录。

### 5. 部署

将 `dist/` 目录中的内容部署到您的 Web 服务器或静态托管服务（如 Vercel、Netlify、GitHub Pages）。

## 目录结构说明

```
ink-diary/
├── index.html              # HTML 入口
├── manifest.json           # PWA 配置
├── service-worker.js       # 离线缓存策略
├── package.json            # 项目依赖
├── vite.config.js          # Vite 配置
├── tailwind.config.js      # Tailwind CSS 配置
├── postcss.config.js       # PostCSS 配置
├── README.md               # 项目文档
├── DEPLOY.md               # 本部署指南
├── src/
│   ├── main.js            # 应用入口
│   ├── App.vue            # 主应用框架
│   ├── assets/
│   │   └── styles/
│   │       └── global.css # 全局样式
│   ├── modules/
│   │   ├── db.js          # IndexedDB 数据操作
│   │   └── ai-client.js   # AI API 调用
│   ├── components/        # 通用组件
│   │   ├── InkButton.vue  # 墨记按钮
│   │   ├── PaperCard.vue  # 纸张卡片
│   │   └── SandboxRenderer.vue # 沙盒渲染器
│   └── views/             # 页面视图
│       ├── DiaryList.vue  # 日记列表
│       ├── DiaryReader.vue # 日记阅读
│       ├── DiaryEditor.vue # 日记编辑器
│       ├── BrowseView.vue  # 览趣页面
│       └── Settings.vue   # 设置页面
└── public/                # 静态资源
    ├── favicon.svg        # 网站图标
    └── icons/             # PWA 图标（需自行添加）
```

## 注意事项

### PWA 图标

`public/icons/` 目录需要包含以下尺寸的 PNG 图标：
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

可以使用 [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator) 生成这些图标。

### AI 配置

首次使用时，需要在设置页面配置 OpenAI API：
- API Base URL: 如 `https://api.openai.com/v1`
- API Key: 您的 OpenAI API Key
- 模型: 推荐使用 `gpt-4o-mini`（性价比高）

### 数据备份

所有数据存储在浏览器本地 IndexedDB 中。建议定期使用设置页面的"导出数据"功能进行备份。

## 故障排除

### 安装依赖失败

如果 `npm install` 失败，尝试：

```bash
# 清除缓存
npm cache clean --force

# 删除 node_modules 后重试
rm -rf node_modules package-lock.json
npm install
```

### 构建失败

确保 Node.js 版本 >= 18.0：

```bash
node --version
```

### PWA 不工作

确保网站通过 HTTPS 访问（Service Worker 要求）。

## 技术栈

- **框架**: Vue 3 (Composition API)
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **路由**: Vue Router 4
- **状态管理**: Pinia
- **数据存储**: localForage (IndexedDB 封装)
- **PWA**: Vite PWA Plugin

## 许可证

MIT License
