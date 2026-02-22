import { RepoConfig } from './types';

/** 应用级配置，从环境变量读取 */
export const appConfig = {
  /** GitHub App ID */
  appId: process.env.GITHUB_APP_ID || '',
  /** GitHub App 私钥 */
  privateKey: (process.env.GITHUB_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  /** Webhook Secret */
  webhookSecret: process.env.WEBHOOK_SECRET || '',
  /** HTTP 端口 */
  port: parseInt(process.env.PORT || '3000', 10),

  /** AI 模型配置 */
  ai: {
    /** 默认使用的模型 */
    defaultModel: process.env.AI_MODEL || 'openai-compat',
    /** OpenAI 兼容 API 配置 */
    openaiCompat: {
      apiKey: process.env.OPENAI_API_KEY || '',
      baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
      model: process.env.OPENAI_MODEL || 'gpt-4o',
    },
    /** Gemini 配置 */
    gemini: {
      apiKey: process.env.GEMINI_API_KEY || '',
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    },
  },
};

/** 默认用户配置 */
export const defaultRepoConfig: RepoConfig = {
  language: 'zh',
  model: 'auto',
  severity: 'medium',
  ignore: ['*.md', '*.lock', 'vendor/', 'node_modules/', 'dist/', '*.min.js', '*.min.css'],
};
