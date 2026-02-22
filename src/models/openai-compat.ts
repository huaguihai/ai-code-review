import { AIModel, ChatMessage } from '../types';

/**
 * OpenAI 兼容 API 适配器
 * 支持 OpenAI / DeepSeek / 通义千问 / 任何 OpenAI 兼容接口
 */
export class OpenAICompatModel implements AIModel {
  name: string;
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(name: string, apiKey: string, baseUrl: string, model: string) {
    this.name = name;
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.model = model;
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    const url = `${this.baseUrl}/chat/completions`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: 0.1,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI API 请求失败 [${response.status}]: ${errorText}`);
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('AI 返回内容为空');
    }

    return content;
  }
}
