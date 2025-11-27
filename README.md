# Dege Megaphone (传声筒) 📣

Dege Megaphone 是一个强大的浏览器侧边栏扩展（Chrome/Edge），旨在提供无缝的语音录制、AI 智能摘要以及一键分享到企业协作平台（企业微信、钉钉、飞书）的功能。

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ 主要功能

*   **🎙️ 语音录制**：高清录音，支持实时波形可视化。
*   **🧠 AI 智能分析**：集成 Google Gemini AI，自动生成录音标题、摘要和全文转录。
*   **🔊 自动降噪**：录音完成后自动进行音频优化处理。
*   **🔗 一键分享**：
    *   生成公共访问链接和二维码。
    *   **Webhook 集成**：支持配置 Webhook，直接将录音卡片推送到企业微信、钉钉或飞书群组。
*   **💾 本地保存**：支持将录音导出为 `.webm` 文件。

## 🚀 快速开始

### 前置要求

*   [Node.js](https://nodejs.org/) (v16 或更高版本)
*   Google Gemini API Key (用于 AI 分析)

### 1. 安装与构建

```bash
# 克隆仓库
git clone https://github.com/your-username/dege-megaphone.git
cd dege-megaphone

# 安装依赖
npm install

# 配置环境变量 (参考下方说明)
# 创建 .env 文件并填入 API_KEY

# 构建项目
npm run build
```

### 2. 配置环境变量

**本地开发**：
在项目根目录下创建一个 `.env` 文件，并填入您的 Google Gemini API Key：

```env
API_KEY=your_google_gemini_api_key_here
```

**GitHub Actions (重要)**：
如果您在 GitHub 上构建失败，请检查 Secrets 配置：
1.  进入 Settings -> Secrets and variables -> Actions。
2.  确保 Secret 名称是 **`API_KEY`** (全大写，下划线)。
3.  ❌ 错误示例：`API KEY`, `Gemini Key`.
4.  ✅ 正确示例：`API_KEY`.

> **注意**：`.env` 文件已被包含在 `.gitignore` 中，**请勿**将其提交到 GitHub。

### 3. 导入浏览器 (Edge / Chrome)

1.  构建完成后，项目目录下会生成一个 `dist` 文件夹。
2.  打开浏览器扩展管理页面：
    *   **Edge**: `edge://extensions/`
    *   **Chrome**: `chrome://extensions/`
3.  开启右上角的 **"开发人员模式" (Developer mode)**。
4.  点击 **"加载解压缩的扩展" (Load unpacked)**。
5.  选择项目目录下的 `dist` 文件夹。

## ❓ 常见问题 (Troubleshooting)

### 🔴 无法录音 / Microphone access denied
**现象**：点击录音按钮，提示 "Permission denied"，且浏览器没有弹出授权框。
**原因**：浏览器的侧边栏 (Side Panel) 有时会默认阻止权限请求弹窗。
**解决方法**：
1.  在插件报错界面，点击蓝色的 **"Authorize in New Tab"** 按钮。
2.  这会在一个全屏标签页中打开插件。
3.  再次点击录音，浏览器就会正常弹出“允许使用麦克风”的提示。
4.  点击“允许”后，回到侧边栏即可正常使用。

## ⚙️ Webhook 配置指南

为了实现分享到群组功能，您需要在插件的“设置”页面配置各平台的 Webhook URL。

1.  **飞书 (Lark)**:
    *   在飞书群组中添加“自定义机器人”。
    *   复制 Webhook 地址 (形如 `https://open.feishu.cn/open-apis/bot/v2/hook/...`)。
2.  **钉钉 (DingTalk)**:
    *   在钉钉群组添加“自定义机器人”，安全设置选择“自定义关键词” (建议填 "语音" 或 "Dege")。
    *   复制 Webhook 地址。
3.  **企业微信 (WeCom)**:
    *   在企业微信群组添加“群机器人”。
    *   复制 Webhook 地址。

## 🛠️ 技术栈

*   **Frontend**: React, TypeScript, Tailwind CSS
*   **Build Tool**: Vite
*   **AI**: Google Gemini API (`@google/genai`)
*   **Icons**: Lucide React

## 📄 许可证

MIT License