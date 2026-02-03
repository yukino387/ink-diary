# 墨记 (Ink Diary)

> 一款完全离线运行的中国风 HTML 日记 PWA 应用

![版本](https://img.shields.io/badge/版本-3.0.0-8b4513)
![技术栈](https://img.shields.io/badge/技术栈-Vue3+Vite+Tailwind-2c3e50)
![许可证](https://img.shields.io/badge/许可证-MIT-556b2f)

## 📜 项目简介

**墨记**是一款将用户上传或 AI 生成的 HTML 网页作为日记，通过优雅的界面进行呈现与管理的桌面级 PWA 应用。

> ⚠️ **重要声明**：本项目部分代码由 AI 辅助生成，作者不对代码的完整性、准确性或适用性承担任何责任。本项目按 MIT 许可证开源，使用者需自行承担使用风险。

### 核心特性

- 📴 **完全离线运行** - 所有数据存储在本地浏览器，无需网络即可使用
- 🔐 **本地数据加密** - 日记内容和 API 密钥使用 AES-GCM 算法在本地加密存储
- 🔐 **加密备份** - 使用 AES-GCM 算法加密导出数据，密码保护您的隐私
- 🤖 **AI 灵感生成** - 支持自定义 OpenAI API，一键生成中国风 HTML 日记
- 📝 **提示词自定义** - 可自定义 AI 系统提示词、用户模板、标签/摘要生成规则

### 色彩体系

| 颜色名称 | 色值      | 用途                     |
| -------- | --------- | ------------------------ |
| 宣纸白   | `#fefcf5` | 主背景色                 |
| 墨青色   | `#2c3e50` | 深色背景/重点色          |
| 赭石     | `#8b4513` | 主点缀色（按钮、图标）   |
| 秋香绿   | `#556b2f` | 次级点缀色（悬浮、选中） |
| 淡檀木   | `#c1a173` | 边框、分割线             |
| 米黄     | `#d4b483` | 装饰边框                 |

### 字体

- **主字体**: [霞鹜文楷](https://github.com/lxgw/LxgwWenKai) (LXGW WenKai) - 开源中文字体

## 🚀 快速开始

### 方法一：使用批处理文件（推荐）

1. **简单启动**（已安装 Node.js）
   - 双击运行 `启动墨记应用.bat`（中文命名）
   - 自动启动开发服务器并打开浏览器

2. **完整启动**（未安装 Node.js）
   - 双击运行 `start-ink-diary.bat`（英文命名）
   - 自动检测、下载并安装 Node.js
   - 自动安装项目依赖
   - 启动开发服务器并打开浏览器

### 方法二：手动启动

#### 环境要求

- Node.js 18.0 或更高版本
- npm 8.0 或更高版本

#### 安装依赖

```bash
npm install
```

#### 启动开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:5173` 启动（默认端口）。

#### 构建生产版本

```bash
npm run build
```

构建输出将位于 `dist/` 目录。

#### 预览生产构建

```bash
npm run preview
```

## 📁 项目结构

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
├── src/
│   ├── main.js            # 应用入口
│   ├── App.vue            # 主应用框架
│   ├── assets/
│   │   └── styles/
│   │       └── global.css # 全局样式
│   ├── modules/
│   │   ├── db.js          # IndexedDB 数据操作
│   │   └── ai-client.js   # AI API 调用
  管理样管理\*\*:\*导出、导入、清空数据 -导\*\*应

- -KAPIeKe└敏等敏感信息仅本地存储，\*\*绝不上传到任何服务器

### 内容渲染

- 用户 HTML 内容在严格隔离的 **iframe 沙盒**中渲染
- 使用 `sand

### 1. 日记阁 (DiaryList)

- 网格/列表展示所有日记
- 支持按标题、日期、内容搜索
- 按创建时间或标题排序
- 水墨风格缩略图预览

服务器


### 2. 日记阅读 (DiaryReader)

- iframe 沙盒安全渲染 HTML 内容
- 横排/竖排阅读模式切换
- 底部随机闲章装饰
- 编辑、删除操作入口
- 上一篇/下一篇导航

### 3. 日记编辑器 (DiaryEditor)

三种编辑模式：

- **文思模式 (AI)**: 输入标题、心情、内容，选择视觉风格，AI 润色生成精美日记
- **上传模式**: 拖拽或选择 HTML 文件
- **代码模式**: 直接编写 HTML 代码

实时预览编辑内容，支持自动生成标签和摘要。

### 4. 提示词设置 (PromptSettings)

- **系统提示词**: 定义 AI 的角色和行为准则
- **用户提示词模板**: 定义发送给 AI 的具体指令，支持变量插入
- **标签生成提示词**: 自定义 AI 生成日记标签的规则
- **摘要生成提示词**: 自定义 AI 生成日记摘要的规则
- **变量快速插入**: 支持 `{{title}}`、`{{content}}`、`{{mood}}`、`{{date}}`、`{{style}}` 等变量
- **提示词预览**: 使用示例数据查看实际发送给 AI 的完整提示词
- **导入/导出**: 支持提示词配置的备份和恢复

### 5. 设置 (Settings)

- **AI 配置**: Base URL、API Key、模型选择（支持自定义模型）
- **本地安全**: 支持设置本地加密密码，使用用户密码+应用密钥双重加密
- **数据管理**: 
  - 加密导出：使用 AES-GCM 算法加密所有数据
  - 密码导入：解密并智能合并重复内容
  - 清空数据：删除所有本地数据
- **应用信息**: 版本、安全说明、特性介绍

## 🔐 安全说明

### 本地数据加密

- 日记的 **HTML 内容**和**原始内容**在存储到 IndexedDB 前自动加密
- **API Key** 等敏感配置项单独加密存储
- 使用 **AES-GCM** 对称加密算法
- 即使不设置密码，也使用应用内置密钥进行基础加密
- 可选设置**本地加密密码**，使用用户密码+应用密钥双重加密

### 数据存储

- 所有日记数据使用 **IndexedDB** 存储在本地浏览器
- API Key 等敏感信息仅本地存储，**绝不上传到任何服务器**
- 支持加密导出/导入，使用 **AES-GCM** 算法保护数据

### 加密备份

- 导出时使用 **PBKDF2** 从密码派生密钥（10万次迭代）
- 使用 **AES-GCM** 进行对称加密
- 随机生成 salt 和 IV，确保每次加密结果不同
- 密码仅用于本地加密，不会存储或传输

### 智能合并

导入数据时自动处理重复内容：
- **新增**: 日记 ID 不存在，直接添加
- **更新**: 日记 ID 存在但导入数据较新，更新内容
- **跳过**: 日记 ID 存在且现有数据较新，保留现有

### 内容渲染

- 用户 HTML 内容在严格隔离的 **iframe 沙盒**中渲染
- 使用 `sandbox="allow-scripts allow-same-origin"` 属性
- 通过 Blob URL 加载内容，确保与主应用非同源

### AI 通信

- 所有 AI API 调用**直接从用户浏览器发起**
- 绝不经手任何第三方服务器
- 支持自定义 Base URL，兼容 OpenAI API 格式的第三方服务

## 📝 使用指南

### 首次使用

1. 打开应用后，点击左侧"设置"
2. 配置您的 OpenAI API（Base URL 和 API Key）
3. 阅读并确认 AI 功能免责声明
4. （可选）进入"提示词"自定义 AI 生成规则
5. 返回"日记阁"，点击"新建"开始创作

### 创建日记

**方式一：AI 润色（文思模式）**

1. 进入编辑器，选择"文思"模式
2. 输入日记标题
3. 选择心情（开心、平静、忧郁、兴奋等）
4. 输入日记正文内容
5. 选择视觉风格（水墨山水、古风诗词、禅意空灵等）
6. 点击"生成日记"，等待 AI 润色
7. 预览生成效果，可二次编辑
8. 点击"保存日记"

**方式二：上传文件**

1. 选择"上传"模式
2. 拖拽或点击选择 HTML 文件
3. 预览并编辑（可选）
4. 输入标题，点击"保存"

**方式三：代码编辑**

1. 选择"代码"模式
2. 直接编写 HTML 代码
3. 实时预览效果
4. 输入标题，点击"保存"

### 阅读日记

1. 在"日记阁"点击任意日记卡片
2. 使用顶部按钮切换横排/竖排模式
3. 点击"编辑"修改日记
4. 底部闲章随机变化，增添雅趣

### 数据备份与恢复

**加密导出**

1. 进入"设置"页面
2. 点击"数据管理"中的"导出"
3. 设置导出密码（至少6位）
4. 下载加密备份文件

**密码导入**

1. 进入"设置"页面
2. 点击"数据管理"中的"导入"
3. 选择加密备份文件
4. 输入解密密码
5. 系统自动合并重复内容
6. 查看导入结果统计

### 自定义提示词

1. 进入"提示词"页面
2. 修改系统提示词定义 AI 角色
3. 编辑用户提示词模板，使用变量插入
4. 自定义标签和摘要生成规则
5. 使用预览功能查看效果
6. 可随时恢复默认设置

## 🛠️ 技术栈

- **框架**: Vue 3 (Composition API)
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **路由**: Vue Router 4
- **状态管理**: Pinia
- **数据存储**: localForage (IndexedDB 封装)
- **加密**: Web Crypto API (PBKDF2 + AES-GCM)
- **PWA**: Vite PWA Plugin + 自定义 Service Worker

## 📄 许可证与免责声明

### 开源许可证

本项目采用 [MIT 许可证](LICENSE) 开源。

```
MIT License

Copyright (c) 2024 墨记 (Ink Diary)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### 免责声明

1. **AI 生成内容**：本项目集成了 AI 功能，AI 生成的内容可能不准确、不适当或存在偏见。作者不对 AI 生成内容的质量、准确性或适用性承担任何责任。

2. **代码来源**：本项目部分代码由人工智能辅助生成，作者不对代码的完整性、安全性或可靠性做出任何保证。

3. **数据安全**：虽然本项目实现了本地数据加密，但作者不对因使用本软件导致的任何数据丢失、泄露或损坏承担责任。

4. **第三方服务**：本项目支持与第三方 AI 服务（如 OpenAI）集成，作者不对这些第三方服务的行为、隐私政策或服务可用性承担任何责任。

5. **使用风险**：使用本软件的风险由用户自行承担。在适用法律允许的最大范围内，作者不对因使用或无法使用本软件而导致的任何直接、间接、附带、特殊或后果性损害承担责任。

## 🙏 致谢

- [霞鹜文楷](https://github.com/lxgw/LxgwWenKai) - 开源中文字体
- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架

---

<p align="center">
  <span style="font-family: 'LXGW WenKai', serif; color: #8b4513;">
    墨香留痕 · 岁月静好
  </span>
</p>
