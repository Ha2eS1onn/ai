export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  thinking?: string;
  timestamp: number;
  isStreaming?: boolean;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  base64?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  mode: 'fast' | 'thinking';
}

export interface Settings {
  apiKey: string;
  apiUrl: string;
  theme: 'light' | 'dark' | 'system';
  defaultMode: 'fast' | 'thinking';
}

export interface StreamResponse {
  choices?: Array<{
    delta: {
      content?: string;
      thinking?: string;
      role?: string;
    };
    index?: number;
    finish_reason?: string | null;
  }>;
  done?: boolean;
  error?: string;
}

// kimi-k2.5 is the only model, thinking is controlled via API parameter
export const KIMI_MODEL = 'kimi-k2.5' as const;

export const DEFAULT_SETTINGS: Settings = {
  apiKey: '',
  apiUrl: 'https://api.moonshot.cn/v1/chat/completions',
  theme: 'system',
  defaultMode: 'fast',
};

// File upload constants
export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
export const ALLOWED_FILE_TYPES = [
  // Images
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
  // Documents
  'application/pdf',
  'text/plain',
  'text/markdown',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  // Code files
  'text/javascript',
  'text/typescript',
  'text/html',
  'text/css',
  'application/json',
  'text/x-python',
  'text/x-java',
  'text/x-c',
  'text/x-cpp',
];
