# AI Code Review - 中文 AI 代码审查 GitHub App

安装到 GitHub 仓库后，每次提交 PR 自动进行 AI 代码审查，审查结果以中文报告发到 PR Comment。

## 功能

- 自动监听 PR 的 opened / synchronize 事件
- 抓取 PR diff，调用 AI 模型审查代码
- 支持多种 AI 模型：OpenAI / DeepSeek / Gemini / 通义千问等
- 审查维度：Bug 检测、安全漏洞、代码质量、性能、最佳实践
- 审查结果包含：整体评级 + 行内评论 + 总结性 Comment
- 支持通过 `.ai-review.yml` 自定义配置

## 快速开始

### 1. 创建 GitHub App

在 GitHub 的 Settings → Developer settings → GitHub Apps 中创建一个新 App：

- **Webhook URL**: `https://你的域名/webhook`
- **Webhook secret**: 自定义一个密钥
- **权限**:
  - Pull requests: Read & Write
  - Contents: Read
- **事件订阅**: Pull request

创建后记录 App ID，并生成私钥文件下载。

### 2. 配置环境变量

```bash
# GitHub App 配置
GITHUB_APP_ID=你的App_ID
GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
WEBHOOK_SECRET=你的Webhook密钥

# AI 模型配置（以下选一种）
# OpenAI 兼容 API（支持 OpenAI / DeepSeek / 通义千问等）
OPENAI_API_KEY=你的API_KEY
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o

# Gemini
GEMINI_API_KEY=你的Gemini_API_KEY
GEMINI_MODEL=gemini-1.5-flash

# 默认使用的模型
AI_MODEL=openai-compat  # openai-compat | gemini

# 服务端口
PORT=3000
```

### 3. 本地运行

```bash
npm install
npm run build
npm start
```

### 4. Docker 部署

```bash
docker build -t ai-code-review .
docker run -d \
  -p 3000:3000 \
  -e GITHUB_APP_ID=xxx \
  -e GITHUB_PRIVATE_KEY="xxx" \
  -e WEBHOOK_SECRET=xxx \
  -e OPENAI_API_KEY=xxx \
  -e OPENAI_BASE_URL=https://api.openai.com/v1 \
  -e OPENAI_MODEL=gpt-4o \
  ai-code-review
```

## 仓库配置

在你的仓库根目录添加 `.ai-review.yml` 文件来自定义审查行为：

```yaml
language: zh        # zh | en - 审查报告语言
model: auto         # auto | gemini | deepseek | openai - AI 模型
severity: medium    # low | medium | high - 最低报告级别
ignore:             # 忽略的文件/目录
  - "*.md"
  - "*.lock"
  - "vendor/"
```

## 使用 DeepSeek 模型

```bash
OPENAI_API_KEY=你的DeepSeek_API_KEY
OPENAI_BASE_URL=https://api.deepseek.com/v1
OPENAI_MODEL=deepseek-chat
AI_MODEL=openai-compat
```

## 使用通义千问

```bash
OPENAI_API_KEY=你的通义千问_API_KEY
OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
OPENAI_MODEL=qwen-plus
AI_MODEL=openai-compat
```

## 项目结构

```
src/
  index.ts            - HTTP 服务入口
  webhook.ts          - GitHub webhook 处理
  github.ts           - GitHub API 封装
  reviewer.ts         - AI 审查核心逻辑
  models/
    base.ts           - 模型工厂
    gemini.ts         - Gemini 适配
    openai-compat.ts  - OpenAI 兼容 API 适配
  config.ts           - 配置管理
  types.ts            - 类型定义
```

## 技术栈

- Node.js + TypeScript
- Hono（HTTP 框架）
- Octokit（GitHub API）
- Docker 部署

## License

MIT
