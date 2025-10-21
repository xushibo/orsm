# Cloudflare Worker 部署指南

## 概述

本指南将帮助您部署 ORSM AI Worker 到 Cloudflare，该 Worker 提供 AI 识别和故事生成的后端服务。

## 前置要求

1. Cloudflare 账户
2. Google AI Gemini API 密钥
3. Wrangler CLI 已安装

## 部署步骤

### 1. 安装 Wrangler CLI

```bash
npm install -g wrangler
```

### 2. 登录 Cloudflare

```bash
wrangler login
```

### 3. 进入 Worker 目录

```bash
cd worker
```

### 4. 设置 API 密钥

```bash
wrangler secret put GEMINI_API_KEY
```

当提示时，输入您的 Google AI Gemini API 密钥。

### 5. 部署 Worker

```bash
wrangler deploy
```

### 6. 获取 Worker URL

部署成功后，您将获得一个 Worker URL，例如：
`https://orsm-ai-worker.your-subdomain.workers.dev/`

## 测试 Worker

### 使用测试脚本

```bash
cd worker
node test-worker.js https://your-worker-url.workers.dev/
```

### 使用 curl 测试

```bash
curl -X POST \
  -F "image=@/path/to/your/image.jpg" \
  https://your-worker-url.workers.dev/
```

### 使用 JavaScript 测试

```javascript
const formData = new FormData();
formData.append('image', imageFile);

const response = await fetch('https://your-worker-url.workers.dev/', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(result);
```

## API 文档

### 端点

`POST https://your-worker-url.workers.dev/`

### 请求格式

- **方法**: POST
- **Content-Type**: multipart/form-data
- **Body**: Form data with `image` field containing image file

### 响应格式

#### 成功响应 (200 OK)
```json
{
  "word": "apple",
  "story": "This is a red apple. It's sweet and crunchy!"
}
```

#### 错误响应 (4xx/5xx)
```json
{
  "error": "Error description"
}
```

### 错误代码

- **400 Bad Request**: 没有提供图片或文件类型无效
- **405 Method Not Allowed**: 非 POST 请求
- **500 Internal Server Error**: API 密钥未配置或 Gemini API 错误

## 环境变量

- `GEMINI_API_KEY`: Google AI Gemini API 密钥（必需）

## 本地开发

```bash
cd worker
npm run dev
```

## 监控和日志

在 Cloudflare Dashboard 中：
1. 进入 Workers & Pages
2. 选择您的 Worker
3. 查看 Analytics 和 Logs

## 故障排除

### 常见问题

1. **API 密钥错误**
   - 确保 `GEMINI_API_KEY` 已正确设置
   - 验证 API 密钥是否有效

2. **图片上传失败**
   - 确保图片文件大小合理
   - 检查图片格式是否支持

3. **Gemini API 错误**
   - 检查 API 配额是否充足
   - 验证 API 密钥权限

### 调试

启用详细日志：
```bash
wrangler tail
```

## 安全注意事项

1. API 密钥通过 Cloudflare Secrets 安全存储
2. 输入验证防止恶意文件上传
3. 错误消息不暴露敏感信息

## 性能优化

1. Worker 自动在全球边缘节点部署
2. 图片处理优化
3. 响应缓存策略

## 更新部署

```bash
cd worker
wrangler deploy
```

## 回滚

如果需要回滚到之前的版本：
1. 在 Cloudflare Dashboard 中选择 Worker
2. 进入 Settings > Versions
3. 选择要回滚的版本
