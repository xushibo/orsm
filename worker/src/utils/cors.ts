/**
 * CORS utility for Cloudflare Worker
 * Provides secure CORS headers for specific domains
 */

export interface CorsConfig {
  allowedOrigins: string[];
  allowedMethods: string[];
  allowedHeaders: string[];
  maxAge: number;
}

const DEFAULT_CORS_CONFIG: CorsConfig = {
  allowedOrigins: [
    'https://orsm.xushibo.cn',
    'https://object-recognition-story-machine.pages.dev',
    'https://*.orsm.pages.dev',
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  allowedMethods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  maxAge: 86400
};

/**
 * Get CORS headers for a specific origin
 */
export function getCorsHeaders(origin: string, config: CorsConfig = DEFAULT_CORS_CONFIG): Record<string, string> {
  const isAllowed = config.allowedOrigins.includes(origin) || 
                   config.allowedOrigins.includes('*') ||
                   origin?.includes('localhost') ||
                   config.allowedOrigins.some(allowedOrigin => {
                     if (allowedOrigin.includes('*')) {
                       const pattern = allowedOrigin.replace('*', '.*');
                       return new RegExp(pattern).test(origin);
                     }
                     return false;
                   });

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : config.allowedOrigins[0],
    'Access-Control-Allow-Methods': config.allowedMethods.join(', '),
    'Access-Control-Allow-Headers': config.allowedHeaders.join(', '),
    'Access-Control-Max-Age': config.maxAge.toString(),
  };
}

/**
 * Handle CORS preflight request
 */
export function handleCorsPreflight(request: Request, config: CorsConfig = DEFAULT_CORS_CONFIG): Response | null {
  if (request.method === 'OPTIONS') {
    const origin = request.headers.get('Origin') || '';
    const corsHeaders = getCorsHeaders(origin, config);
    
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }
  
  return null;
}

/**
 * Add CORS headers to any response
 */
export function addCorsHeaders(response: Response, request: Request, config: CorsConfig = DEFAULT_CORS_CONFIG): Response {
  const origin = request.headers.get('Origin') || '';
  const corsHeaders = getCorsHeaders(origin, config);
  
  // Create new response with CORS headers
  const newResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      ...Object.fromEntries(response.headers.entries()),
      ...corsHeaders
    }
  });
  
  return newResponse;
}
