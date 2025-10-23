/**
 * 开发分支 API 配置
 * 专门用于develop分支的配置
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
  // 在develop分支中，默认使用development配置
  console.log('Using develop branch API configuration');
  return configs.development;
}

export const API_CONFIG = getApiConfig();