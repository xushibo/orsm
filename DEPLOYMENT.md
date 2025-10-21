# Cloudflare Pages 部署指南

## 项目配置

项目已经配置为支持 Cloudflare Pages 静态站点托管：

- ✅ Next.js 配置为静态导出模式
- ✅ 图片优化已禁用（适配静态托管）
- ✅ 构建脚本已更新
- ✅ Wrangler 配置文件已创建

## 部署方法

### 方法一：通过 Cloudflare Dashboard（推荐）

1. **准备代码仓库**
   ```bash
   # 将代码推送到 GitHub
   git add .
   git commit -m "Configure for Cloudflare Pages deployment"
   git push origin main
   ```

2. **在 Cloudflare Pages 中部署**
   - 访问 [Cloudflare Pages](https://pages.cloudflare.com/)
   - 点击 "Create a project"
   - 选择 "Connect to Git"
   - 连接你的 GitHub 仓库
   - 配置构建设置：
     - **Framework preset**: Next.js (Static HTML Export)
     - **Build command**: `npm run build`
     - **Build output directory**: `out`
     - **Root directory**: `/` (项目根目录)

3. **部署完成**
   - Cloudflare 会自动构建和部署你的应用
   - 你会获得一个 `*.pages.dev` 的域名

### 方法二：使用 Wrangler CLI

1. **安装 Wrangler**
   ```bash
   npm install -g wrangler
   ```

2. **登录 Cloudflare**
   ```bash
   wrangler login
   ```

3. **构建并部署**
   ```bash
   npm run deploy
   ```

## 本地测试

在部署前，你可以本地测试静态导出：

```bash
# 构建静态文件
npm run build

# 查看输出目录
ls -la out/

# 本地预览（可选）
npx serve out
```

## 注意事项

- 项目使用静态导出，不支持服务端功能（API routes、getServerSideProps 等）
- 图片优化已禁用，所有图片将使用原始格式
- 如果需要服务端功能，考虑使用 Cloudflare Workers 或其他平台

## 自定义域名

部署完成后，你可以在 Cloudflare Pages 设置中添加自定义域名。

## 环境变量

如果需要环境变量，在 Cloudflare Pages 设置中添加：
- 进入项目设置
- 选择 "Environment variables"
- 添加所需的变量
