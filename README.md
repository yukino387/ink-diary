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

## 📋 目录
- [✨ 核心特性](#-核心特性)
- [🚀 立即开始](#-立即开始)
- [🎨 设计理念](#-设计理念)
- [📱 功能模块](#-功能模块)
- [🔐 安全特性](#-安全特性)
- [📝 使用指南](#-使用指南)
- [⚠️ 免责声明](#️-免责声明)
- [🛠️ 技术栈](#️-技术栈)
- [📄 许可证](#-许可证)

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

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

### 方式三：PWA 安装
1. 访问在线演示页面
2. 在浏览器菜单中选择"安装应用"
3. 添加到桌面或应用列表
4. 像原生应用一样使用

### 方法四：使用批处理文件

#### 🟢 简单启动（已安装 Node.js）
```bash
双击运行 `启动墨记应用.bat`
```

#### 🟡 完整启动（未安装 Node.js）
```bash
双击运行 `start-ink-diary.bat`
```
> 自动检测并安装所需环境

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

## 📱 功能模块

### 🏮 日记阁 (DiaryList)
- 网格/列表展示所有日记
- 智能搜索与排序
- 内容预览与快速访问

### 📖 日记阅读器 (DiaryReader)
- 安全沙盒渲染 HTML 内容
- 简洁的阅读界面
- 编辑和管理入口
- 上一篇/下一篇导航

### ✍️ 日记编辑器 (DiaryEditor)
<table>
<tr>
<td width="33%">

#### 上传模式
- 拖拽或选择 HTML 文件
- 自动提取内容预览
- 支持文件批量上传

</td>
<td width="33%">

#### 代码模式
- 直接编写 HTML/CSS/JS
- 实时预览效果
- 代码高亮和格式化

</td>
<td width="33%">

#### AI 模式（可选）
- 需要配置 API 密钥
- 辅助内容润色
- 可自定义提示词

</td>
</tr>
</table>

### ⚙️ 设置 (Settings)
- **AI 配置**（可选）：Base URL、API Key、模型选择
- **本地安全**：设置加密密码，保护数据隐私
- **数据管理**：加密导出/导入、清空数据

## 🔐 安全特性

<table>
<tr>
<td>

### 🛡️ 本地加密
- 日记内容使用 **AES-GCM** 算法加密
- API Key 等敏感信息单独保护
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

## 📝 使用指南

### 首次使用流程
1. **打开应用** → 访问在线演示或本地安装版本
2. **了解功能** → 查看设置页面了解各项功能
3. **选择模式** → 根据需求选择编辑模式
4. **开始创作** → 创建您的第一篇日记

### 三种编辑模式对比

| 功能特性 | 上传模式 | 代码模式 | AI模式 |
|---------|---------|---------|--------|
| **网络需求** | 不需要 | 不需要 | 需要 |
| **技术要求** | 低 | 中 | 低 |
| **灵活性** | 中 | 高 | 中 |
| **内容来源** | 现有HTML文件 | 手工编写 | AI生成+编辑 |
| **完全离线** | ✓ | ✓ | ✗ |

### 数据管理指南

#### 📤 加密导出
1. 进入"设置" → "数据管理"
2. 点击"导出"
3. 设置导出密码（至少6位）
4. 下载加密备份文件

#### 📥 密码导入
1. 选择加密备份文件
2. 输入解密密码
3. 系统智能合并重复内容
4. 查看导入结果统计

## ⚠️ 免责声明

<div align="center" style="background: #fff5f5; border-left: 4px solid #f56565; padding: 20px; margin: 30px 0; border-radius: 8px;">
  <h3 style="color: #c53030; margin-top: 0;">⚠️ 重要：请仔细阅读以下免责声明</h3>
  <p style="color: #718096; margin-bottom: 0;">
    使用本软件前，请确保您已理解并接受所有条款。
  </p>
</div>

### 1. 🛡️ 核心免责条款

<div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">

#### 1.1 关于 AI 生成内容
> **本软件部分代码由 AI 辅助生成，作者不对代码的完整性、准确性或适用性承担任何责任。**

- AI 生成的内容可能不准确、不适当或存在偏见
- 作者不对 AI 生成内容的质量、准确性或适用性承担任何责任
- AI 功能为可选附加功能，非核心功能

#### 1.2 关于数据安全
> **虽然实现了本地数据加密，但不能保证绝对安全。**

- 任何加密系统都可能存在漏洞
- 浏览器被攻击可能导致数据泄露
- 用户需自行负责数据备份

#### 1.3 关于网络连接
> **重要：只有不使用 AI 功能的前提下才是完全离线应用。**

- AI 功能需要网络连接和有效的 API 密钥
- 上传模式仅在文件上传时需要网络
- 代码模式完全不需要网络连接

</div>

### 2. 📊 详细风险说明

#### 2.1 数据风险
<table style="width:100%; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
  <thead>
    <tr style="background: #4a5568; color: white;">
      <th style="padding: 12px; text-align: left;">风险类型</th>
      <th style="padding: 12px; text-align: left;">影响程度</th>
      <th style="padding: 12px; text-align: left;">发生概率</th>
      <th style="padding: 12px; text-align: left;">应对建议</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">数据永久丢失</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;"><span style="color: #e53e3e; font-weight: bold;">严重</span></td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">中等</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">定期加密备份</td>
    </tr>
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">AI生成有害内容</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;"><span style="color: #ed8936; font-weight: bold;">中等</span></td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">较高</td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">人工审核内容</td>
    </tr>
    <tr>
      <td style="padding: 12px;">加密被破解</td>
      <td style="padding: 12px;"><span style="color: #e53e3e; font-weight: bold;">严重</span></td>
      <td style="padding: 12px;">较低</td>
      <td style="padding: 12px;">使用强密码保护</td>
    </tr>
  </tbody>
</table>

#### 2.2 技术限制
```yaml
浏览器兼容性:
  - 现代浏览器: Chrome 80+, Firefox 75+, Safari 14+
  - 功能依赖: IndexedDB, Web Crypto API, Service Worker
  - 移动设备: 支持响应式设计，功能可能受限

离线功能说明:
  - 上传模式: 仅上传文件时需要网络
  - 代码模式: 完全离线可用
  - AI模式: 需要网络连接
  - 数据读写: 完全本地，无需网络

PWA功能:
  - 支持安装到桌面
  - 需要浏览器支持Service Worker
  - 离线可用性取决于功能选择
```

### 3. 🔒 安全与隐私声明

<div style="background: #e6fffa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #38b2ac;">

#### 3.1 数据存储
- **所有日记数据**使用 IndexedDB 存储在本地浏览器
- **API Key 等敏感信息**仅本地存储，绝不上传到任何服务器
- 支持加密导出/导入，使用 AES-GCM 算法保护数据

#### 3.2 加密机制
- 使用 **AES-GCM** 对称加密算法
- 即使不设置密码，也使用应用内置密钥进行基础加密
- 可选设置**本地加密密码**，使用用户密码+应用密钥双重加密

#### 3.3 内容渲染安全
- 用户 HTML 内容在严格隔离的 **iframe 沙盒**中渲染
- 使用 `sandbox="allow-scripts allow-same-origin"` 属性
- 通过 Blob URL 加载内容，确保与主应用非同源

</div>

### 4. 🤖 AI 功能免责声明

<div style="background: #fffaf0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ed8936;">

#### 4.1 AI 服务集成
- 所有 AI API 调用**直接从用户浏览器发起**
- 绝不经手任何第三方服务器
- 支持自定义 Base URL，兼容 OpenAI API 格式的第三方服务
- 用户需自行承担 AI 服务的使用费用

#### 4.2 生成内容风险
1. **准确性风险**：
   - AI 可能生成不准确、过时或错误的信息
   - 历史、科学、医疗等专业内容需特别验证

2. **适宜性风险**：
   - AI 可能生成不适当、冒犯性或有害的内容
   - 生成内容不代表开发者立场或观点

3. **版权风险**：
   - AI 可能生成侵犯第三方版权的内容
   - 使用生成内容需自行确认版权归属

#### 4.3 第三方服务责任
- 本项目支持与第三方 AI 服务（如 OpenAI）集成
- 作者不对这些第三方服务的行为、隐私政策或服务可用性承担任何责任
- 用户需遵守 AI 服务提供商的使用条款

</div>

### 5. ⚖️ 法律责任限制

<div style="background: #fed7d7; padding: 20px; border-radius: 8px; margin: 20px 0;">

#### 5.1 责任免除
1. **在适用法律允许的最大范围内**，作者不对因使用或无法使用本软件而导致的任何直接、间接、附带、特殊或后果性损害承担责任。

2. **损害包括但不限于**：
   - 利润损失、数据丢失、业务中断
   - 个人伤害、隐私泄露
   - 任何其他商业损害或损失

#### 5.2 用户责任
1. **遵守法律**：用户需遵守所在国家/地区的法律法规
2. **内容责任**：用户需对生成内容和使用行为承担全部责任
3. **年龄限制**：18 岁以下用户需在监护人指导下使用

#### 5.3 权利保留
- 保留修改功能的权力
- 可能停止维护或更新
- 不提供技术支持承诺

</div>

### 6. 📋 使用确认清单

<div style="background: #c6f6d5; padding: 20px; border-radius: 8px; margin: 20px 0;">

**在使用本软件前，请确认您已：**

- [ ] **理解并接受**本免责声明的所有条款
- [ ] **了解**不使用 AI 功能时才可完全离线运行
- [ ] **承诺**定期备份重要数据，制定备份策略
- [ ] **确认**使用 AI 功能不违反当地法律法规
- [ ] **知晓**软件可能存在的缺陷和限制
- [ ] **同意**自行承担使用本软件的所有风险

</div>

### 7. 🚨 紧急安全建议

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
  <div style="background: #c6f6d5; padding: 15px; border-radius: 8px;">
    <h4 style="color: #276749; margin-top: 0;">✅ 建议行为</h4>
    <ul style="margin: 0; color: #276749;">
      <li>定期备份重要数据</li>
      <li>使用强密码保护加密文件</li>
      <li>在安全环境中使用 AI 功能</li>
      <li>验证重要信息的准确性</li>
      <li>测试备份文件的恢复功能</li>
    </ul>
  </div>
  
  <div style="background: #fed7d7; padding: 15px; border-radius: 8px;">
    <h4 style="color: #c53030; margin-top: 0;">❌ 风险行为</h4>
    <ul style="margin: 0; color: #c53030;">
      <li>将密码等敏感信息存储在日记中</li>
      <li>完全依赖 AI 生成重要内容</li>
      <li>在公共设备上使用未加密的数据</li>
      <li>忽视定期备份的重要性</li>
      <li>使用弱密码保护备份文件</li>
    </ul>
  </div>
</div>

### 8. 📞 责任联系与支持

> **重要**：本项目为开源软件，按"原样"提供，不提供任何形式的保证。

1. **无技术支持承诺**：
   - 不保证及时响应用户问题
   - 不保证解决所有技术问题
   - 不提供定制化开发服务

2. **问题反馈渠道**：
   - GitHub Issues（如果开源）
   - 项目讨论区
   - 用户需自行解决问题或寻求社区帮助

3. **商业使用**：
   - 如需商业使用，建议进行全面的安全评估
   - 建议聘请专业技术人员进行代码审查
   - 自行承担商业使用风险

---

<div align="center" style="margin: 30px 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 12px;">
  <h3 style="margin-top: 0; color: white;">最终确认</h3>
  <p style="margin-bottom: 0; opacity: 0.9;">
    点击"同意"或开始使用本软件，即表示您已阅读、理解并接受本免责声明的所有条款。<br>
    如果您不同意任何条款，请立即停止使用本软件。
  </p>
</div>

## 🛠️ 技术栈

<div align="center">
  <img src="https://skillicons.dev/icons?i=vue,vite,tailwind,js,html,css" />
</div>

- **框架**: Vue 3 (Composition API)
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **路由**: Vue Router 4
- **状态管理**: Pinia
- **数据存储**: localForage (IndexedDB 封装)
- **加密**: Web Crypto API (PBKDF2 + AES-GCM)
- **PWA**: Vite PWA Plugin + 自定义 Service Worker

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE) 开源。

```text
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

## 🙏 致谢

<div align="center">
  
感谢以下开源项目：

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
  </div>
  
  <p style="font-size: 0.9em; color: #718096; max-width: 600px; margin: 0 auto;">
    <strong>提示：</strong>使用前请务必阅读完整的免责声明，了解您的权利和责任。
    这是一个开源项目，旨在提供一种新的日记体验方式，请谨慎使用。
  </p>
  
  <hr style="border: none; height: 1px; background: linear-gradient(to right, transparent, #e2e8f0, transparent); margin: 20px auto; width: 80%;">
  
  <div style="font-size: 0.8em; color: #a0aec0;">
    <p>📱 支持 PWA 安装到桌面 · 🔐 本地加密存储 · 🌐 在线演示随时体验</p>
    <p>⚠️ 重要：在线演示数据仅存储在您当前浏览器中，建议重要数据定期备份</p>
  </div>
</div>

---

**自主控制数据 · 谨慎使用功能 · 享受创作乐趣**
