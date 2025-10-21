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
    baseUrl: 'https://orsm-ai-worker.xu57.workers.dev',
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
  
  if (useMock) {
    return configs.mock;
  }
  
  return configs[env] || configs.development;
}

export const API_CONFIG = getApiConfig();
