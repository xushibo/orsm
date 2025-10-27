/**
 * Speech synthesis related type definitions
 */

export interface SpeechSynthesisHook {
  isSpeaking: boolean;
  speakText: (text: string) => Promise<void>;
  stopSpeaking: () => void;
}

export interface SpeechConfig {
  language: 'en' | 'zh' | 'auto';
  rate: number;
  pitch: number;
  volume: number;
  voice?: SpeechSynthesisVoice;
}

export interface SpeechVoice {
  name: string;
  lang: string;
  localService: boolean;
  default: boolean;
  voiceURI: string;
}

export interface SpeechUtterance {
  text: string;
  lang: string;
  rate: number;
  pitch: number;
  volume: number;
  voice?: SpeechSynthesisVoice;
}

export interface SpeechEvent {
  type: 'start' | 'end' | 'error' | 'pause' | 'resume';
  utterance: SpeechSynthesisUtterance;
  charIndex?: number;
  charLength?: number;
  elapsedTime?: number;
  name?: string;
}

export interface SpeechError {
  code: string;
  message: string;
  utterance: SpeechSynthesisUtterance;
  timestamp: number;
}

export interface SpeechService {
  speak: (text: string, config?: Partial<SpeechConfig>) => Promise<void>;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  getVoices: () => Promise<SpeechSynthesisVoice[]>;
  isSupported: () => boolean;
  isSpeaking: () => boolean;
}

export interface SpeechQueueItem {
  id: string;
  text: string;
  config: SpeechConfig;
  priority: number;
  timestamp: number;
}

export interface SpeechQueue {
  items: SpeechQueueItem[];
  isProcessing: boolean;
  currentItem?: SpeechQueueItem;
  add: (item: Omit<SpeechQueueItem, 'id' | 'timestamp'>) => void;
  remove: (id: string) => void;
  clear: () => void;
  process: () => Promise<void>;
}

export interface SpeechAnalytics {
  totalSpeeches: number;
  totalDuration: number;
  averageDuration: number;
  languagesUsed: Record<string, number>;
  voicesUsed: Record<string, number>;
  errors: SpeechError[];
  lastUsed: number;
}

export interface SpeechPreferences {
  defaultLanguage: 'en' | 'zh' | 'auto';
  defaultRate: number;
  defaultPitch: number;
  defaultVolume: number;
  preferredVoice?: string;
  autoDetectLanguage: boolean;
  enableQueue: boolean;
  maxQueueSize: number;
}

export interface SpeechCapabilities {
  supported: boolean;
  voices: SpeechSynthesisVoice[];
  languages: string[];
  features: {
    rate: boolean;
    pitch: boolean;
    volume: boolean;
    voice: boolean;
    pause: boolean;
    resume: boolean;
    cancel: boolean;
  };
}

export interface SpeechState {
  isSpeaking: boolean;
  isPaused: boolean;
  currentText: string;
  currentVoice?: SpeechSynthesisVoice;
  queue: SpeechQueueItem[];
  error?: SpeechError;
  capabilities: SpeechCapabilities;
}
