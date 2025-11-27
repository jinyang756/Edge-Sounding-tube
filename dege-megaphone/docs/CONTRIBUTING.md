# 贡献指南

感谢您对传声筒项目的关注！我们欢迎任何形式的贡献。

## 如何贡献

### 报告问题
如果您发现了bug或者有功能建议，请在GitHub上创建一个issue。

### 提交代码
1. Fork项目
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个Pull Request

## 开发环境设置

1. 克隆仓库
2. 在项目根目录运行 `npm start` 启动开发服务器
3. 打开浏览器访问 `http://localhost:8000`

## 代码规范

- 使用ES6模块系统
- 遵循单一职责原则
- 保持代码简洁和可读性
- 添加适当的注释

## 项目结构

```
src/
├── app.js (主应用文件)
├── components/ (应用组件)
├── modules/ (功能模块)
└── utils/ (工具函数)
```

## 测试

目前项目使用手动测试。请确保您的更改不会破坏现有功能。

## 许可证

通过贡献代码，您同意您的贡献将遵循项目的MIT许可证。