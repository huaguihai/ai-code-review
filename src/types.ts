/** PR webhook 事件的核心信息 */
export interface PullRequestInfo {
  owner: string;
  repo: string;
  number: number;
  title: string;
  body: string;
  headSha: string;
  baseSha: string;
  installationId: number;
}

/** 解析后的 diff 文件 */
export interface DiffFile {
  filename: string;
  status: 'added' | 'modified' | 'removed' | 'renamed';
  patch: string;
  additions: number;
  deletions: number;
}

/** 单条审查意见 */
export interface ReviewComment {
  path: string;
  line: number;
  side: 'RIGHT';
  body: string;
  severity: Severity;
}

/** 严重程度 */
export type Severity = 'low' | 'medium' | 'high';

/** 整体评级 */
export type Rating = 'approve' | 'comment' | 'request_changes';

/** AI 审查结果 */
export interface ReviewResult {
  summary: string;
  rating: Rating;
  comments: ReviewComment[];
}

/** 用户 repo 配置 (.ai-review.yml) */
export interface RepoConfig {
  language: 'zh' | 'en';
  model: 'auto' | 'gemini' | 'deepseek' | 'openai';
  severity: Severity;
  ignore: string[];
}

/** AI 模型的聊天消息 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/** AI 模型接口 */
export interface AIModel {
  name: string;
  chat(messages: ChatMessage[]): Promise<string>;
}
