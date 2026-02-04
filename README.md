# 墨记 · Ink Diary

> 一个本地优先的 HTML 日记应用，支持多种编辑模式

<div align="center">

![版本](https://img.shields.io/badge/版本-3.0.0-4a5568?style=for-the-badge&logo=book&logoColor=white)
![技术栈](https://img.shields.io/badge/技术栈-Vue3+Vite+Tailwind-2d3748?style=for-the-badge&logo=vue.js&logoColor=white)
![许可证](https://img.shields.io/badge/许可证-MIT-4a5568?style=for-the-badge&logo=opensourceinitiative&logoColor=white)
![离线](https://img.shields.io/badge/离线-本地优先-718096?style=for-the-badge&logo=offline&logoColor=white)

</div>

<div align="center">
  <img src="https://img.shields.io/badge/在线演示-立即体验-4299e1?style=for-the-badge&logo=netlify&logoColor=white" />
</div>

<div align="center" style="margin: 20px 0;">
  <a href="https://ink-diary.netlify.app/settings" target="_blank" style="
    display: inline-block;
    background: linear-gradient(135deg, #4299e1 0%, #667eea 100%);
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    font-size: 1.1em;
    box-shadow: 0 4px 12px rgba(66, 153, 225, 0.3);
    transition: all 0.3s ease;
  ">
    🚀 立即体验在线演示
  </a>
</div>

<div align="center">
  <img src="https://img.shields.io/badge/安全-本地加密存储-brightgreen?style=flat-square" />
  <img src="https://img.shields.io/badge/多种模式-上传/代码/可选AI-blue?style=flat-square" />
  <img src="https://img.shields.io/badge/PWA-支持安装到桌面-purple?style=flat-square" />
</div>

## ✨ 核心特性

<table>
<tr>
<td width="33%">

### 🌐 在线演示
无需安装，立即体验所有功能：[ink-diary.netlify.app](https://ink-diary.netlify.app/settings)

</td>
<td width="33%">

### 📁 本地优先
所有数据存储在本地浏览器，不使用 AI 功能时可完全离线运行。

</td>
<td width="33%">

### 🎯 多模式编辑
支持上传 HTML、直接编码，以及可选的 AI 辅助功能。

</td>
</tr>
</table>

## 🚀 立即开始

### 方式一：在线体验（推荐）
1. 访问 [https://ink-diary.netlify.app/settings](https://ink-diary.netlify.app/settings)
2. 查看设置页面，了解应用功能
3. 点击左上角菜单进入日记阁
4. 开始创建和管理您的日记

### 方式二：本地安装
如果您希望完全控制数据，可以在本地运行：

```bash
# 克隆项目
git clone https://github.com/yourusername/ink-diary.git
cd ink-diary

# 安装依赖
npm install

# 启动本地服务器
npm run dev

# 访问 http://localhost:5173
```

### 方式三：PWA 安装
1. 访问在线演示页面
2. 在浏览器菜单中选择"安装应用"
3. 添加到桌面或应用列表
4. 像原生应用一样使用

## 📱 功能亮点

<div align="center">
  <table>
  <tr>
    <td align="center">
      <h4>🏮 日记阁</h4>
      <p>网格/列表展示所有日记<br>智能搜索与排序</p>
    </td>
    <td align="center">
      <h4>📖 阅读器</h4>
      <p>安全沙盒渲染<br>简洁阅读体验</p>
    </td>
    <td align="center">
      <h4>✍️ 编辑器</h4>
      <p>三种编辑模式<br>实时预览</p>
    </td>
    <td align="center">
      <h4>⚙️ 设置</h4>
      <p>AI配置管理<br>数据备份恢复</p>
    </td>
  </tr>
  </table>
</div>

## 🎨 设计理念

### 简洁实用的界面
- 清晰的功能分区
- 直观的操作流程
- 响应式布局，适配各种设备

### 颜色方案
<div align="center">
  <table>
  <tr>
    <td align="center" width="100">
      <div style="width: 60px; height: 60px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;"></div>
      <br><b>背景色</b><br>#f8fafc
    </td>
    <td align="center" width="100">
      <div style="width: 60px; height: 60px; background: #2d3748; border: 1px solid #e2e8f0; border-radius: 8px;"></div>
      <br><b>主色</b><br>#2d3748
    </td>
    <td align="center" width="100">
      <div style="width: 60px; height: 60px; background: #4a5568; border: 1px solid #e2e8f0; border-radius: 8px;"></div>
      <br><b>辅色</b><br>#4a5568
    </td>
  </tr>
  </table>
</div>

## 🔐 安全特性

<table>
<tr>
<td>

### 🛡️ 本地加密
- 日记内容 AES-GCM 加密
- 敏感信息单独保护
- 可选密码保护功能

</td>
<td>

### 📦 数据自主
- 所有数据存储在本地
- 支持加密备份导出
- 智能合并导入数据

</td>
</tr>
</table>

## 📝 快速指南

### 在线演示使用
1. **访问应用**：[https://ink-diary.netlify.app/settings](https://ink-diary.netlify.app/settings)
2. **了解功能**：在设置页面查看所有配置选项
3. **开始使用**：点击左上角菜单进入日记阁
4. **创建日记**：选择您喜欢的编辑模式

### 编辑模式选择

| 模式 | 适合场景 | 网络需求 |
|------|---------|---------|
| **上传模式** | 已有HTML文件 | 仅上传时需要 |
| **代码模式** | 自定义设计 | 不需要 |
| **AI模式** | 内容辅助 | 需要 |

### 数据管理
```yaml
备份流程:
  1. 设置 → 数据管理 → 导出
  2. 设置备份密码
  3. 下载加密文件
  
恢复流程:
  1. 选择加密备份文件
  2. 输入密码
  3. 自动合并数据
```

## 🌟 特色功能

### 1. 离线优先架构
```javascript
// 完全离线的工作流程
if (不使用AI功能) {
  所有操作都在本地完成
  无需网络连接
  数据加密存储在浏览器
} else {
  需要网络连接AI服务
  其他功能仍可离线使用
}
```

### 2. 智能数据合并
- **新增**：不存在的内容直接添加
- **更新**：较新的内容覆盖旧内容
- **保留**：较旧的内容保持不变

### 3. 安全沙盒渲染
```html
<iframe sandbox="allow-scripts allow-same-origin">
  <!-- 用户HTML内容在这里安全渲染 -->
</iframe>
```

## 🔧 技术栈

<div align="center">
  <img src="https://skillicons.dev/icons?i=vue,vite,tailwind,js,html,css" />
</div>

- **前端框架**: Vue 3 + Composition API
- **构建工具**: Vite
- **样式方案**: Tailwind CSS
- **状态管理**: Pinia
- **本地存储**: localForage (IndexedDB)
- **加密算法**: Web Crypto API
- **部署平台**: Netlify

## 📊 在线演示详情

### 访问地址
**主应用**: [https://ink-diary.netlify.app](https://ink-diary.netlify.app)

**设置页面**: [https://ink-diary.netlify.app/settings](https://ink-diary.netlify.app/settings)

### 演示功能
- ✅ 完整功能体验
- ✅ 本地数据存储
- ✅ 加密功能演示
- ✅ PWA 安装测试
- ✅ 多设备同步测试

### 限制说明
```yaml
在线演示限制:
  数据存储: 仅在当前浏览器有效
  清除缓存: 会丢失所有数据
  AI功能: 需要自行配置API密钥
  备份文件: 下载到本地保存
```

## ⚠️ 重要说明

<div align="center" style="background: #f8f9fa; border-left: 4px solid #4299e1; padding: 15px; margin: 20px 0; text-align: left;">
  <h4 style="margin: 0 0 10px 0; color: #2d3748;">🌐 网络连接说明</h4>
  <p style="margin: 0; color: #4a5568;">
    1. <strong>不使用 AI 功能时可完全离线运行</strong><br>
    2. 所有数据存储在本地浏览器<br>
    3. AI 功能需要网络连接和 API 密钥<br>
    4. 在线演示数据仅存储在您当前浏览器中
  </p>
</div>

### 数据安全提醒
1. **在线演示**：数据仅存储在您当前浏览器，清除缓存会丢失
2. **本地运行**：数据完全由您控制，可定期备份
3. **PWA安装**：安装后可像原生应用一样离线使用

### 浏览器兼容性
- **推荐**：Chrome 80+, Firefox 75+, Safari 14+
- **功能**：IndexedDB, Web Crypto API, Service Worker
- **移动端**：支持响应式设计，可在手机和平板上使用

## 🛠️ 开发与部署

### 本地开发
```bash
# 克隆项目
git clone [项目地址]
cd ink-diary

# 安装依赖
npm install

# 启动开发服务器
npm run dev
# 访问 http://localhost:5173
```

### 构建部署
```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 部署到Netlify（自动）
# 1. 推送代码到GitHub
# 2. 在Netlify连接仓库
# 3. 自动构建和部署
```

### 自定义配置
```javascript
// vite.config.js 中的关键配置
export default defineConfig({
  base: '/', // 部署路径
  build: {
    outDir: 'dist', // 输出目录
  },
  plugins: [
    vue(),
    VitePWA({
      // PWA 配置
      registerType: 'autoUpdate',
      // ... 其他配置
    })
  ]
})
```

## 📞 反馈与支持

### 问题反馈
如果您在使用在线演示时发现问题：
1. 检查浏览器控制台是否有错误
2. 清除浏览器缓存后重试
3. 在不同的浏览器中测试

### 功能建议
欢迎通过以下方式提出建议：
1. GitHub Issues（如果开源）
2. 项目讨论区
3. 直接联系开发者

### 自行部署
如果您需要：
1. 完全控制数据
2. 定制化功能
3. 私有化部署

建议克隆项目到本地运行或部署到自己的服务器。

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE) 开源。

```text
MIT License
Copyright (c) 2024 墨记 (Ink Diary)

允许自由使用、复制、修改、合并、发布、分发、再许可和/或销售本软件的副本...

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND...
```

## 🙏 致谢

<div align="center">
  
感谢使这个项目成为可能的开源技术：

[![Vue.js](https://img.shields.io/badge/框架-Vue.js-42b883?style=flat-square&logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/构建-Vite-646cff?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/样式-TailwindCSS-06b6d4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Netlify](https://img.shields.io/badge/部署-Netlify-00C7B7?style=flat-square&logo=netlify&logoColor=white)](https://netlify.com/)

</div>

---

<div align="center">
  <h3 style="color: #2d3748; font-weight: 600; margin-bottom: 10px;">
    📝 立即开始您的数字日记之旅
  </h3>
  
  <div style="margin: 20px 0;">
    <a href="https://ink-diary.netlify.app/settings" target="_blank" style="
      display: inline-block;
      background: linear-gradient(135deg, #4299e1 0%, #667eea 100%);
      color: white;
      padding: 12px 32px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 1.1em;
      box-shadow: 0 4px 15px rgba(66, 153, 225, 0.3);
      transition: all 0.3s ease;
      margin: 0 10px;
    ">
      🚀 访问在线演示
    </a>
    
    <a href="https://github.com/yourusername/ink-diary" target="_blank" style="
      display: inline-block;
      background: #f8fafc;
      color: #2d3748;
      padding: 12px 32px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 1.1em;
      border: 2px solid #e2e8f0;
      transition: all 0.3s ease;
      margin: 0 10px;
    ">
      💻 查看源代码
    </a>
  </div>
  
  <p style="font-size: 0.9em; color: #718096; max-width: 600px; margin: 0 auto;">
    一个简单但强大的本地日记工具，在需要时提供AI辅助，
    在不需要时完全离线工作。在线演示可直接体验，本地部署可完全控制数据。
  </p>
  
  <hr style="border: none; height: 1px; background: linear-gradient(to right, transparent, #e2e8f0, transparent); margin: 20px auto; width: 80%;">
  
  <div style="font-size: 0.8em; color: #a0aec0;">
    <p>📱 支持 PWA 安装到桌面 · 🔐 本地加密存储 · 🌐 在线演示随时体验</p>
    <p>💡 提示：在线演示数据仅存储在您当前浏览器中，建议重要数据定期备份</p>
  </div>
</div>

---

**开始记录** · **自主控制** · **专注创作**
