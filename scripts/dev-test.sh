#!/bin/bash

# 本地开发测试脚本
# 用于在dev-local分支上进行开发测试

set -e

echo "🚀 启动本地开发测试环境..."

# 颜色输出定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印状态信息
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    print_error "请在项目根目录运行此脚本"
    exit 1
fi

# 检查当前分支
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "dev-local" ]; then
    print_warning "当前不在dev-local分支，建议切换到dev-local分支进行开发测试"
    read -p "是否继续? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 安装依赖
print_status "安装项目依赖..."
npm install

# 启动本地开发服务器
print_status "启动本地开发服务器..."
print_status "前端服务将运行在 http://localhost:3000"
print_status "后端模拟服务将运行在 http://localhost:3001"

# 在后台启动模拟服务器
node mock-server.js > mock-server.log 2>&1 &
MOCK_SERVER_PID=$!
print_status "模拟服务器已启动 (PID: $MOCK_SERVER_PID)"

# 启动Next.js开发服务器
print_status "启动Next.js开发服务器..."
npm run dev

# 清理工作
trap "print_status '正在停止模拟服务器...'; kill $MOCK_SERVER_PID 2>/dev/null || true; print_success '开发环境已停止'" EXIT

print_success "本地开发测试环境已启动!"
print_status "请在浏览器中访问 http://localhost:3000"
print_status "查看模拟服务器日志: tail -f mock-server.log"