/**
 * API Configuration
 * Supports different environments for development and production
 */

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
}

const configs: Record<string, ApiConfig> = {
  development: {
    baseUrl: 'http://localhost:3001',
    timeout: 10000,
    retries: 3
  },
  production: {
    baseUrl: 'https://orsm-ai.xushibo.cn',
    timeout: 30000,
    retries: 2
  },
  mock: {
    baseUrl: 'http://localhost:3001',
    timeout: 5000,
    retries: 1
  }
};

export function getApiConfig(): ApiConfig {
  const env = process.env.NODE_ENV || 'development';
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true';
  const isProduction = env === 'production';
  
  // 在生产环境中，除非明确设置使用模拟，否则使用生产 API
  if (isProduction && !useMock) {
    return configs.production;
  }
  
  if (useMock) {
    return configs.mock;
  }
  
  return configs[env] || configs.development;
}

export const API_CONFIG = getApiConfig();
