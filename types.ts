export enum AppState {
  IDLE = 'IDLE',
  RECORDING = 'RECORDING',
  PROCESSING = 'PROCESSING',
  REVIEW = 'REVIEW',
  SHARING = 'SHARING',
  SETTINGS = 'SETTINGS',
}

export interface AudioMetadata {
  blob: Blob;
  url: string;
  duration: number; // in seconds
  timestamp: number;
}

export interface AIAnalysisResult {
  title: string;
  summary: string;
  transcript: string;
}

export enum SocialPlatform {
  WECHAT = 'WeChat',
  DINGTALK = 'DingTalk',
  LARK = 'Lark',
}

export interface WebhookConfig {
  wechat?: string;
  dingtalk?: string;
  lark?: string;
}