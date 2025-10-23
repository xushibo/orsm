import { handleCorsPreflight } from './utils/cors';
import { handleImageUpload } from './handlers/image';

export interface Env {
  // Cloudflare Workers AI binding
  AI: any; // AI binding from wrangler.toml
}

// 添加 ExecutionContext 类型定义
interface ExecutionContext {
  waitUntil(promise: Promise<any>): void;
  passThroughOnException(): void;
}

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    // 处理 CORS 预检请求
    const corsPreflight = handleCorsPreflight(request);
    if (corsPreflight) {
      return corsPreflight;
    }

    // 只允许 POST 请求
    if (request.method !== 'POST') {
      const response = new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 
          'Content-Type': 'application/json'
        }
      });
      return response;
    }

    // 委托给图片处理处理器
    return handleImageUpload(request, env);
  },
};
