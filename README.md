# Object Recognition Story Machine

一个基于 AI 的物体识别和故事生成应用，专为儿童设计。

## 🎯 功能特性

- 📸 **实时相机捕获**: 使用设备摄像头实时拍摄物体
- 🤖 **AI 识别**: 基于 AI 的物体识别
- 📖 **故事生成**: 为识别的物体生成适合儿童的故事
- 🎨 **卡通风格界面**: 半透明弹窗展示结果
- 📱 **移动端优化**: 专为移动设备设计的响应式界面

## 🏗️ 技术架构

### 前端
- **框架**: Next.js 15 + React 18
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **动画**: Framer Motion
- **部署**: Cloudflare Pages

### 后端
- **服务**: Cloudflare Workers
- **AI**: Google Gemini 1.5 Flash
- **语言**: TypeScript
- **部署**: Cloudflare Workers

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn
- Cloudflare 账户

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
# 启动前端开发服务器
npm run dev

# 启动模拟后端服务器
node mock-server.js
```

### 测试集成
```bash
# 测试完整的前后端集成
npm run test:integration

# 测试 API 端点
npm run test:api
```

## 📁 项目结构

```
├── app/                    # Next.js 应用页面
│   ├── page.tsx           # 主页面
│   └── layout.tsx         # 布局组件
├── src/                   # 源代码
│   ├── components/        # React 组件
│   ├── hooks/            # 自定义 Hooks
│   └── config/           # 配置文件
├── worker/               # Cloudflare Worker
│   ├── src/index.ts      # Worker 主文件
│   └── wrangler.toml     # Worker 配置
├── scripts/              # 部署脚本
└── docs/                 # 项目文档
```

## 🔧 配置

### 环境变量
复制 `env.example` 到 `.env.local` 并配置：

```bash
# API 配置
NEXT_PUBLIC_USE_MOCK=true
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001

# 生产环境
NEXT_PUBLIC_USE_MOCK=false
NEXT_PUBLIC_API_BASE_URL=https://orsm-ai.xushibo.cn
```

### Cloudflare Worker 配置
```bash
cd worker
wrangler secret put GEMINI_API_KEY
```

## 🚀 部署

### 自动部署
```bash
# 部署所有服务
npm run deploy:all

# 仅部署前端
npm run deploy:frontend

# 仅部署后端
npm run deploy:backend

# 生产环境部署
npm run deploy:production
```

### 手动部署

#### 前端 (Cloudflare Pages)
```bash
npm run build
npm run deploy:frontend
```

#### 后端 (Cloudflare Worker)
```bash
cd worker
wrangler deploy
```

## 🧪 测试

### 单元测试
```bash
npm run test
```

### 集成测试
```bash
# 启动测试环境
npm run test:integration

# 在浏览器中访问 http://localhost:3000
# 测试完整的用户流程
```

### API 测试
```bash
# 测试后端 API
npm run test:api

# 使用 curl 测试
curl -X POST -F "image=@test-images/test.png" http://localhost:3001
```

## 📱 使用说明

1. **访问应用**: 在浏览器中打开应用
2. **授权相机**: 点击"允许相机访问"按钮
3. **拍照识别**: 点击拍照按钮捕获物体
4. **查看结果**: 等待 AI 分析并查看识别结果和故事
5. **继续使用**: 关闭弹窗继续拍照

## 🔍 故障排除

### 常见问题

#### 相机无法访问
- 确保使用 HTTPS 或 localhost
- 检查浏览器权限设置
- 确认设备有摄像头

#### API 调用失败
- 检查网络连接
- 验证 API 端点配置
- 查看浏览器控制台错误

#### Worker 部署失败
- 检查 Cloudflare 账户配置
- 验证 API 密钥设置
- 查看 wrangler 日志

### 调试模式
```bash
# 启用调试模式
NEXT_PUBLIC_DEBUG=true npm run dev
```

## 📚 开发指南

### 添加新功能
1. 在 `src/` 目录下创建组件
2. 更新类型定义
3. 添加测试用例
4. 更新文档

### 自定义 AI 提示词
编辑 `worker/src/index.ts` 中的 `prompt` 变量：

```typescript
const prompt = "请识别这张图片里的主要物品，返回它的英文单词，并创作一个适合3岁儿童的、一到两句话的英文小故事。请以JSON格式返回，包含'word'和'story'两个字段。";
```

## 🤝 贡献

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📄 许可证

MIT License

## 🔗 相关链接

- [Next.js 文档](https://nextjs.org/docs)
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Google Gemini API](https://ai.google.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)