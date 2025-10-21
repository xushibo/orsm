# 移动端测试指南

## Safari 摄像头权限问题解决方案

### 问题原因
移动端 Safari 对摄像头权限有严格限制：
1. **HTTPS 要求**：必须在 HTTPS 环境下才能访问摄像头
2. **用户手势要求**：权限请求必须在用户点击事件中触发
3. **权限状态检查**：需要正确处理权限状态变化

### 解决方案

#### 1. HTTPS 环境设置

**选项 A: 使用 ngrok（推荐）**
```bash
# 安装 ngrok
npm install -g ngrok

# 启动本地服务器
npm run dev

# 在另一个终端中创建 HTTPS 隧道
ngrok http 3000
```

**选项 B: 使用 Cloudflare Tunnel**
```bash
# 安装 cloudflared
# 创建隧道
cloudflared tunnel --url http://localhost:3000
```

**选项 C: 部署到 Cloudflare Pages**
```bash
# 按照 DEPLOYMENT.md 中的说明部署
npm run build
# 然后通过 Cloudflare Pages 访问 HTTPS 版本
```

#### 2. 移动端测试步骤

1. **获取 HTTPS URL**
   - 使用 ngrok 或 Cloudflare Tunnel 获取 HTTPS URL
   - 例如：`https://abc123.ngrok.io`

2. **在移动设备上测试**
   - 在 Safari 中打开 HTTPS URL
   - 点击 "Allow Camera Access" 按钮
   - 允许摄像头权限

3. **验证功能**
   - ✅ 权限请求正常弹出
   - ✅ 授权后视频流全屏显示
   - ✅ 拍照按钮有呼吸动画
   - ✅ 在不同屏幕尺寸下布局正常

#### 3. 常见问题排查

**问题：权限请求不弹出**
- 检查是否为 HTTPS 环境
- 确保在用户点击事件中触发权限请求
- 检查浏览器设置中的摄像头权限

**问题：视频不显示**
- 检查 `playsInline` 和 `muted` 属性
- 确保视频元素正确附加了 MediaStream
- 检查控制台是否有错误信息

**问题：按钮动画不流畅**
- 检查 Framer Motion 是否正确安装
- 确保移动端支持 CSS 动画
- 检查设备性能是否足够

#### 4. 调试技巧

**使用 Safari 开发者工具**
1. 在 Mac 上打开 Safari
2. 启用 "开发" 菜单
3. 连接 iOS 设备
4. 使用 Safari 开发者工具调试

**控制台日志**
```javascript
// 在浏览器控制台中检查
console.log('MediaDevices supported:', !!navigator.mediaDevices);
console.log('getUserMedia supported:', !!navigator.mediaDevices?.getUserMedia);
console.log('HTTPS:', location.protocol === 'https:');
```

#### 5. 生产环境部署

对于生产环境，建议：
1. 使用 Cloudflare Pages 部署（自动 HTTPS）
2. 配置自定义域名
3. 设置适当的 CSP 策略
4. 添加 PWA 支持

### 测试清单

- [ ] HTTPS 环境正常
- [ ] 权限请求在用户点击时触发
- [ ] 摄像头权限被正确授予
- [ ] 视频流全屏显示
- [ ] 拍照按钮动画正常
- [ ] 在不同设备上布局正确
- [ ] 错误处理正常工作
