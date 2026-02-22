import { AIModel, ChatMessage } from '../types';
import { appConfig } from '../config';
import { OpenAICompatModel } from './openai-compat';
import { GeminiModel } from './gemini';

/**
 * 根据配置创建 AI 模型实例
 */
export function createModel(modelName?: string): AIModel {
  const name = modelName || appConfig.ai.defaultModel;

  switch (name) {
    case 'gemini':
      return new GeminiModel();
    case 'deepseek':
      return new OpenAICompatModel(
        'deepseek',
        appConfig.ai.openaiCompat.apiKey,
        appConfig.ai.openaiCompat.baseUrl,
        appConfig.ai.openaiCompat.model,
      );
    case 'openai':
    case 'openai-compat':
    default:
      return new OpenAICompatModel(
        'openai-compat',
        appConfig.ai.openaiCompat.apiKey,
        appConfig.ai.openaiCompat.baseUrl,
        appConfig.ai.openaiCompat.model,
      );
  }
}

export { AIModel, ChatMessage };
