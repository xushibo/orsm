/**
 * Tests for CORS utility
 */

import { getCorsHeaders, handleCorsPreflight, addCorsHeaders } from '../cors';

// Mock Web APIs for Node.js environment
global.Request = global.Request || class Request {
  constructor(public url: string, public init?: any) {}
  get method() { return this.init?.method || 'GET'; }
  get headers() { 
    return {
      get: (name: string) => this.init?.headers?.[name] || null,
      entries: () => Object.entries(this.init?.headers || {})
    };
  }
};

global.Response = global.Response || class Response {
  constructor(public body: any, public init?: any) {}
  get status() { return this.init?.status || 200; }
  get statusText() { return this.init?.statusText || 'OK'; }
  get headers() { 
    return {
      get: (name: string) => this.init?.headers?.[name] || null,
      entries: () => Object.entries(this.init?.headers || {})
    };
  }
};

describe('CORS Utility', () => {
  describe('getCorsHeaders', () => {
    it('should return CORS headers for allowed origin', () => {
      const headers = getCorsHeaders('https://orsm.xushibo.cn');
      
      expect(headers['Access-Control-Allow-Origin']).toBe('https://orsm.xushibo.cn');
      expect(headers['Access-Control-Allow-Methods']).toBe('POST, OPTIONS');
      expect(headers['Access-Control-Allow-Headers']).toBe('Content-Type');
      expect(headers['Access-Control-Max-Age']).toBe('86400');
    });

    it('should return CORS headers for localhost', () => {
      const headers = getCorsHeaders('http://localhost:3000');
      
      expect(headers['Access-Control-Allow-Origin']).toBe('http://localhost:3000');
    });

    it('should return default origin for disallowed origin', () => {
      const headers = getCorsHeaders('https://malicious-site.com');
      
      expect(headers['Access-Control-Allow-Origin']).toBe('https://orsm.xushibo.cn');
    });
  });

  describe('handleCorsPreflight', () => {
    it('should handle OPTIONS request', () => {
      const request = new Request('https://example.com', { method: 'OPTIONS' });
      const response = handleCorsPreflight(request);
      
      expect(response).not.toBeNull();
      expect(response?.status).toBe(200);
      expect(response?.headers.get('Access-Control-Allow-Origin')).toBe('https://orsm.xushibo.cn');
    });

    it('should return null for non-OPTIONS request', () => {
      const request = new Request('https://example.com', { method: 'POST' });
      const response = handleCorsPreflight(request);
      
      expect(response).toBeNull();
    });
  });

  describe('addCorsHeaders', () => {
    it('should add CORS headers to response', () => {
      const originalResponse = new Response('{"test": "data"}', {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      
      const request = new Request('https://example.com', { 
        method: 'POST',
        headers: { 'Origin': 'https://orsm.xushibo.cn' }
      });
      
      const response = addCorsHeaders(originalResponse, request);
      
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://orsm.xushibo.cn');
      expect(response.headers.get('Access-Control-Allow-Methods')).toBe('POST, OPTIONS');
      expect(response.headers.get('Content-Type')).toBe('application/json');
    });
  });
});
