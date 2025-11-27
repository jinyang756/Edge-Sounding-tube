# 传声筒 - 专业录音与音频转换工具

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-web-green.svg)
![Language](https://img.shields.io/badge/language-JavaScript-yellow.svg)

传声筒是一个功能强大的网页版音频录制和处理工具，支持录音、音频转换、剪辑和音效处理等功能。所有操作都在浏览器中本地完成，保护您的隐私安全。

## 目录

- [功能特点](#功能特点)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [使用方法](#使用方法)
- [技术实现](#技术实现)
- [模块化架构](#模块化架构)
- [浏览器兼容性](#浏览器兼容性)
- [开发指南](#开发指南)
- [贡献](#贡献)
- [许可证](#许可证)

## 项目结构 <a name="项目结构"></a>

```
dege-megaphone/
├── index.html
├── README.md
├── .gitignore
├── package.json
├── LICENSE
├── docs/
│   ├── CHANGELOG.md
│   └── CONTRIBUTING.md
├── src/
│   ├── app.js (主应用文件)
│   ├── components/
│   │   ├── appState.js (应用状态管理)
│   │   └── config.js (应用配置)
│   ├── modules/
│   │   ├── recorder.js (录音模块)
│   │   ├── audioPlayer.js (音频播放模块)
│   │   ├── visualizer.js (可视化模块)
│   │   └── audioEffects.js (音频效果模块)
│   └── utils/
│       ├── helpers.js (通用工具函数)
│       └── domUtils.js (DOM操作工具函数)
```

## 快速开始 <a name="快速开始"></a>

### 本地运行

```bash
# 克隆项目
git clone <repository-url>

cd dege-megaphone

# 启动本地服务器
python -m http.server 8000

# 或者使用npm脚本
npm start
```

打开浏览器访问 `http://localhost:8000`

### 直接使用

1. 下载项目ZIP文件
2. 解压到本地目录
3. 双击打开 `index.html` 文件
4. 开始使用传声筒功能

## 功能特点 <a name="功能特点"></a>

- **高质量录音**：支持多种音频格式录制，提供清晰的录音效果
- **格式转换**：支持多种音频格式转换，满足不同平台需求
- **音频剪辑**：提供简单的音频剪辑功能
- **音效处理**：内置变调和混响效果器
- **隐私保护**：所有处理在本地完成，无需上传到服务器

## 使用方法 <a name="使用方法"></a>

### 基本操作流程

1. 打开 `index.html` 文件
2. 点击"录音"按钮开始录制音频
3. 使用各种功能对音频进行处理
4. 点击"下载"按钮保存处理后的音频文件

### 详细操作说明

## 功能说明

### 录音功能
- 点击红色"录音"按钮开始录音
- 再次点击按钮停止录音
- 录音过程中会显示波形图和录制时间

### 音频上传
- 点击"上传音频"按钮选择本地音频文件
- 支持 WAV、MP3、OGG 等常见音频格式

### 格式转换
- 点击"转MP3"按钮将音频转换为MP3格式
- 转换过程会显示进度条

### 音频剪辑
- 点击"剪辑"按钮激活剪辑功能
- 可通过时间轴选择需要保留的音频片段

### 音效处理
- 点击"音效"按钮打开音效面板
- 调整变调和混响参数
- 点击"应用"按钮应用音效

### 下载和分享
- 点击"下载"按钮保存处理后的音频文件
- 点击"分享"按钮获取分享提示

## 技术实现 <a name="技术实现"></a>

- 使用原生 HTML、CSS 和 JavaScript 实现
- 采用 Tailwind CSS 进行样式设计
- 使用 Web Audio API 实现音频处理功能
- 使用 MediaRecorder API 实现录音功能
- 采用模块化架构，使用ES6模块系统
- 实现了单一职责原则，每个模块只负责一个功能领域

### 核心技术

1. **Web Audio API**: 用于音频处理和可视化
2. **MediaRecorder API**: 用于录音功能
3. **Canvas API**: 用于音频波形可视化
4. **File API**: 用于文件处理和下载
5. **现代JavaScript (ES6+)**: 模块化架构和现代语法

## 模块化架构 <a name="模块化架构"></a>

传声筒采用了现代化的模块化架构设计：

- **RecorderModule**: 专门处理录音功能
- **AudioPlayerModule**: 专门处理音频播放功能
- **VisualizerModule**: 专门处理音频可视化
- **AudioEffectsModule**: 专门处理音效处理
- **AppState**: 统一的状态管理
- **AppConfig**: 集中的配置管理
- **Helpers**: 通用工具函数集合
- **DOMUtils**: DOM操作工具函数集合

### 架构优势

1. **可维护性**: 代码结构清晰，易于维护和扩展
2. **可重用性**: 模块可以在不同项目中重用
3. **可测试性**: 每个模块都可以独立测试
4. **团队协作**: 不同开发者可以并行开发不同模块

## 浏览器兼容性 <a name="浏览器兼容性"></a>

- Chrome 60+
- Firefox 56+
- Edge 79+
- Safari 14.1+

## 开发指南 <a name="开发指南"></a>

### 项目结构说明

传声筒采用模块化架构设计，各模块职责分明：

- `src/app.js`: 应用主入口，负责协调各模块
- `src/components/`: 应用组件，如状态管理和配置
- `src/modules/`: 功能模块，每个模块负责特定功能
- `src/utils/`: 工具函数，提供通用功能

### 开发环境

1. 确保安装了Python（用于本地服务器）
2. 无需额外依赖，纯原生JavaScript实现
3. 使用现代浏览器进行开发和测试

### 代码规范

- 使用ES6模块系统
- 遵循单一职责原则
- 保持代码简洁和可读性
- 添加适当的注释

### 构建和部署

传声筒是一个静态网页应用，无需构建步骤。直接部署所有文件到Web服务器即可。

## 隐私声明 <a name="隐私声明"></a>

传声筒完全在您的浏览器中运行，所有录音和处理操作都在本地完成，音频文件不会上传到任何服务器，确保您的隐私安全。

## 贡献 <a name="贡献"></a>

欢迎任何形式的贡献！请查看 [CONTRIBUTING.md](docs/CONTRIBUTING.md) 了解详情。

## 许可证 <a name="许可证"></a>

本项目采用 MIT 许可证，详情请见 [LICENSE](LICENSE) 文件。