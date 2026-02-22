import { AIModel, ChatMessage } from '../types';
import { appConfig } from '../config';

/**
 * Google Gemini 适配器
 * 使用 Gemini REST API (generateContent)
 */
export class GeminiModel implements AIModel {
  name = 'gemini';
  private apiKey: string;
  private model: string;

  constructor() {
    this.apiKey = appConfig.ai.gemini.apiKey;
    this.model = appConfig.ai.gemini.model;
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    // 转换消息格式: ChatMessage[] -> Gemini contents[]
    const systemInstruction = messages
      .filter((m) => m.role === 'system')
      .map((m) => m.content)
      .join('\n');

    const contents = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    const body: Record<string, unknown> = { contents };
    if (systemInstruction) {
      body.systemInstruction = { parts: [{ text: systemInstruction }] };
    }
    body.generationConfig = { temperature: 0.1, maxOutputTokens: 4096 };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API 请求失败 [${response.status}]: ${errorText}`);
    }

    const data = (await response.json()) as {
      candidates: Array<{ content: { parts: Array<{ text: string }> } }>;
    };

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('Gemini 返回内容为空');
    }

    return text;
  }
}
