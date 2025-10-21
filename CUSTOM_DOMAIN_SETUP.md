# 自定义域名设置指南

## 域名配置

您的 Worker 将使用自定义域名：`orsm-ai.xushibo.cn`

## 部署步骤

### 1. 进入 Worker 目录

```bash
cd worker
```

### 2. 设置 API 密钥

```bash
wrangler secret put GEMINI_API_KEY
```

### 3. 部署 Worker

```bash
wrangler deploy
```

### 4. 配置自定义域名

部署完成后，需要在 Cloudflare Dashboard 中配置自定义域名：

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 **Workers & Pages**
3. 选择您的 Worker：`orsm-ai-worker`
4. 进入 **Settings** > **Triggers**
5. 添加自定义域名：`orsm-ai.xushibo.cn`

## DNS 配置

确保您的域名 DNS 设置正确：

### 方法 1: 使用 Cloudflare DNS

如果 `xushibo.cn` 使用 Cloudflare DNS：

1. 在 Cloudflare Dashboard 中进入域名管理
2. 添加 CNAME 记录：
   - **Name**: `orsm-ai`
   - **Target**: `orsm-ai-worker.your-subdomain.workers.dev`
   - **Proxy status**: 已代理（橙色云）

### 方法 2: 使用其他 DNS 提供商

如果使用其他 DNS 提供商：

1. 添加 CNAME 记录：
   - **Name**: `orsm-ai`
   - **Value**: `orsm-ai-worker.your-subdomain.workers.dev`
   - **TTL**: 300（5分钟）

## 测试自定义域名

### 使用测试脚本

```bash
cd worker
node test-worker.js https://orsm-ai.xushibo.cn/
```

### 使用 curl 测试

```bash
curl -X POST \
  -F "image=@/path/to/your/image.jpg" \
  https://orsm-ai.xushibo.cn/
```

### 使用 JavaScript 测试

```javascript
const formData = new FormData();
formData.append('image', imageFile);

const response = await fetch('https://orsm-ai.xushibo.cn/', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(result);
```

## SSL 证书

Cloudflare 会自动为自定义域名提供 SSL 证书，无需额外配置。

## 验证部署

1. **检查 DNS 解析**：
   ```bash
   nslookup orsm-ai.xushibo.cn
   ```

2. **检查 SSL 证书**：
   ```bash
   curl -I https://orsm-ai.xushibo.cn/
   ```

3. **测试 API 端点**：
   ```bash
   curl -X GET https://orsm-ai.xushibo.cn/
   ```
   应该返回 405 Method Not Allowed（这是正常的，因为只允许 POST 请求）

## 故障排除

### 常见问题

1. **DNS 解析失败**
   - 检查 CNAME 记录是否正确设置
   - 等待 DNS 传播（最多 24 小时）

2. **SSL 证书问题**
   - 确保域名已添加到 Cloudflare
   - 检查 SSL/TLS 设置

3. **Worker 不响应**
   - 检查 Worker 是否已正确部署
   - 验证自定义域名配置

### 调试命令

```bash
# 检查 DNS 解析
dig orsm-ai.xushibo.cn

# 检查 SSL 证书
openssl s_client -connect orsm-ai.xushibo.cn:443 -servername orsm-ai.xushibo.cn

# 测试 HTTP 连接
curl -v https://orsm-ai.xushibo.cn/
```

## 更新部署

当需要更新 Worker 时：

```bash
cd worker
wrangler deploy
```

自定义域名配置会自动保持。

## 监控

在 Cloudflare Dashboard 中监控：
- **Analytics**: 查看请求统计
- **Logs**: 查看实时日志
- **Security**: 查看安全事件

## 性能优化

1. **全球边缘部署**：Worker 自动在全球边缘节点部署
2. **缓存策略**：可以配置缓存规则
3. **压缩**：自动启用 gzip 压缩

## 安全配置

1. **访问控制**：可以配置 IP 白名单
2. **速率限制**：防止 API 滥用
3. **CORS 设置**：配置跨域访问策略
