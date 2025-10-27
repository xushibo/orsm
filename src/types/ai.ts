/**
 * AI recognition related type definitions
 */

export interface AIResult {
  word: string;
  story: string;
  chineseName?: string;
  chineseStory?: string;
  confidence?: number;
  processingTime?: number;
  model?: string;
}

export interface RecognitionRequest {
  image: Blob;
  language?: 'en' | 'zh';
  includeTranslation?: boolean;
  includeConfidence?: boolean;
}

export interface RecognitionResponse {
  success: boolean;
  result?: AIResult;
  error?: string;
  processingTime?: number;
  timestamp?: number;
}

export interface AIModel {
  name: string;
  version: string;
  type: 'recognition' | 'generation' | 'translation';
  capabilities: string[];
  isActive: boolean;
}

export interface RecognitionConfig {
  model: string;
  confidenceThreshold: number;
  maxRetries: number;
  timeout: number;
  includeTranslation: boolean;
  language: 'en' | 'zh' | 'auto';
}

export interface StoryGenerationConfig {
  maxLength: number;
  language: 'en' | 'zh';
  style: 'simple' | 'detailed' | 'poetic';
  targetAge: number;
  includeMoral?: boolean;
}

export interface TranslationConfig {
  sourceLanguage: 'en' | 'zh';
  targetLanguage: 'en' | 'zh';
  preserveFormatting: boolean;
  includePinyin?: boolean;
}

export interface AIError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
  retryable: boolean;
}

export interface AIHook {
  result: AIResult | null;
  isProcessing: boolean;
  error: string | null;
  recognizeObject: (image: Blob) => Promise<AIResult>;
  clearResult: () => void;
  retry: () => Promise<void>;
}

export interface RecognitionService {
  recognize: (image: Blob, config?: RecognitionConfig) => Promise<AIResult>;
  generateStory: (object: string, config?: StoryGenerationConfig) => Promise<string>;
  translate: (text: string, config?: TranslationConfig) => Promise<string>;
  getAvailableModels: () => Promise<AIModel[]>;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: number;
  requestId?: string;
}

export interface BatchRecognitionRequest {
  images: Blob[];
  config?: RecognitionConfig;
  callback?: (result: RecognitionResponse, index: number) => void;
}

export interface BatchRecognitionResponse {
  results: RecognitionResponse[];
  totalProcessed: number;
  totalSuccessful: number;
  totalFailed: number;
  processingTime: number;
}
