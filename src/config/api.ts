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
  
  console.log('API Config Debug:', {
    env,
    useMock,
    isProduction,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_USE_MOCK: process.env.NEXT_PUBLIC_USE_MOCK
  });
  
  // 生产环境：默认使用生产 API，除非明确设置使用模拟
  if (isProduction) {
    if (useMock) {
      console.log('Production with mock enabled, using mock API:', configs.mock.baseUrl);
      return configs.mock;
    } else {
      console.log('Production environment, using production API:', configs.production.baseUrl);
      return configs.production;
    }
  }
  
  // 开发环境：优先使用模拟 API（如果设置了），否则使用开发 API
  if (useMock) {
    console.log('Development with mock enabled, using mock API:', configs.mock.baseUrl);
    return configs.mock;
  }
  
  // 默认使用对应环境的配置
  const config = configs[env] || configs.development;
  console.log('Using default API for', env, ':', config.baseUrl);
  return config;
}

export const API_CONFIG = getApiConfig();
