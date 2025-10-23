# 本地开发测试指南

本文档介绍了如何在本地环境中设置和运行Object Recognition Story Machine应用进行开发和测试。

## 🌿 分支策略

项目使用以下分支策略：

- `main` - 主分支，稳定版本
- `dev-local` - 本地开发测试分支（您当前所在的分支）
- `feature/*` - 功能开发分支

## 🛠️ 环境设置

### 1. 环境变量配置

在dev-local分支中，系统会自动使用本地开发配置。您可以通过创建`.env.local`文件来自定义配置：

```bash
# .env.local
NEXT_PUBLIC_USE_MOCK=true
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_DEBUG=true
NODE_ENV=development
```

### 2. 依赖安装

```bash
npm install
```

## ▶️ 启动开发环境

### 方法一：使用脚本（推荐）

```bash
./scripts/dev-test.sh
```

这将自动启动：
- 前端开发服务器 (http://localhost:3000)
- 后端模拟服务器 (http://localhost:3001)

### 方法二：手动启动

```bash
# 终端1: 启动模拟服务器
node mock-server.js

# 终端2: 启动前端开发服务器
npm run dev
```

## 🧪 测试

### 运行单元测试

```bash
npm run test
```

### 运行集成测试

```bash
npm run test:integration
```

### 测试特定功能

1. **相机功能测试**：
   - 访问 http://localhost:3000
   - 点击"启动相机"按钮
   - 授权相机访问
   - 点击拍照按钮

2. **API测试**：
   ```bash
   curl -X POST -F "image=@test-images/test.png" http://localhost:3001
   ```

## 🐛 调试

### 启用调试模式

在开发环境中，调试模式默认启用。您可以在浏览器控制台中看到详细的日志信息。

### 查看服务器日志

如果使用脚本启动，服务器日志将输出到`mock-server.log`文件中：

```bash
tail -f mock-server.log
```

## 📁 目录结构

在dev-local分支中，以下目录和文件特别重要：

```
├── .env.local              # 本地环境变量配置
├── mock-server.js          # 模拟后端服务器
├── test-images/            # 测试图片
├── scripts/
│   ├── dev-test.sh         # 本地开发测试脚本
│   └── debug-ai.js         # AI服务调试脚本
└── src/config/
    └── api.dev-local.ts    # 本地开发API配置
```

## 🔧 开发工作流

1. **创建功能分支**：
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **开发和测试**：
   - 进行代码修改
   - 运行本地测试环境验证更改
   - 运行自动化测试

3. **提交更改**：
   ```bash
   git add .
   git commit -m "Add your feature"
   git push origin feature/your-feature-name
   ```

4. **合并到dev-local**：
   ```bash
   git checkout dev-local
   git merge feature/your-feature-name
   ```

## 🚨 注意事项

1. **不要在dev-local分支上直接提交生产代码**
2. **确保所有测试通过后再合并到主分支**
3. **定期从main分支同步最新更改**：
   ```bash
   git checkout main
   git pull origin main
   git checkout dev-local
   git merge main
   ```

## 📞 支持

如遇到问题，请检查：
1. 所有依赖是否正确安装
2. 端口是否被占用
3. 浏览器控制台是否有错误信息
4. 服务器日志是否有异常