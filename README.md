<h1 align="center">🤖 AI Code Review</h1>

<p align="center">
  <strong>中文 AI 代码审查 GitHub App</strong><br>
  提交 PR → AI 自动审查 → 中文报告直达 PR Comment
</p>

<p align="center">
  <a href="#快速开始">快速开始</a> •
  <a href="#为什么需要它">为什么需要它</a> •
  <a href="#功能特性">功能</a> •
  <a href="#模型配置">模型配置</a> •
  <a href="#自定义配置">自定义</a>
</p>

---

## 为什么需要它？

**场景 1：你用 Cursor / Copilot 写了 500 行代码**
> AI 帮你生成了一大堆代码，看起来能跑，测试也过了。但你真的逐行看过吗？
> 
> 三天后线上出了个诡异 bug——原来 AI 悄悄把一个校验删了。

**场景 2：团队里来了个新人**
> 新人提了个 PR，你忙得没空 review，直接 merge 了。
> 
> 一周后发现代码里有 SQL 注入，敏感信息还打到了日志里。

**场景 3：你是独立开发者，没人帮你 review**
> 一个人写代码最大的问题——没有第二双眼睛。
> 
> 手动 review 自己的代码？效果跟自己改自己的作文一样。

**AI Code Review 就是你的第二双眼睛。** 每次提交 PR，AI 自动审查代码，用中文告诉你哪里有问题、为什么有问题、怎么改。

---

## 功能特性

🔍 **五维审查**
- 🐛 Bug 检测 — 逻辑错误、边界条件、空指针
- 🔒 安全漏洞 — SQL 注入、XSS、敏感信息泄露
- 📐 代码质量 — 可读性、命名规范、重复代码
- ⚡ 性能问题 — N+1 查询、不必要的循环、内存泄露
- 📏 最佳实践 — 语言惯例、反模式检测

🌐 **多模型支持**
- OpenAI（GPT-4o 等）
- DeepSeek（国产，性价比高）
- Google Gemini（免费额度）
- 通义千问（阿里云）
- 任何 OpenAI 兼容 API

🇨🇳 **中文优先**
- 审查报告默认中文输出
- 也支持英文（通过配置切换）

📊 **清晰的审查报告**
- ✅ / ⚠️ / ❌ 整体评级一目了然
- 行内注释精确到代码行
- 总结性 Comment 概览全局

---

## 快速开始

### 第一步：创建 GitHub App

1. 打开 GitHub → Settings → Developer settings → GitHub Apps → New GitHub App
2. 填写配置：

| 配置项 | 值 |
|--------|-----|
| Webhook URL | `https://你的域名/webhook` |
| Webhook secret | 自定义密钥 |
| 权限 - Pull requests | Read & Write |
| 权限 - Contents | Read |
| 订阅事件 | Pull request |

3. 创建后记录 **App ID**，并下载**私钥文件**（.pem）

### 第二步：部署服务

**方式 A：Docker 部署（推荐）**

```bash
docker build -t ai-code-review .

docker run -d \
  -p 3000:3000 \
  -e GITHUB_APP_ID=你的AppID \
  -e GITHUB_PRIVATE_KEY="$(cat your-app.pem)" \
  -e WEBHOOK_SECRET=你的密钥 \
  -e OPENAI_API_KEY=你的APIKey \
  -e OPENAI_BASE_URL=https://api.openai.com/v1 \
  -e OPENAI_MODEL=gpt-4o \
  -e AI_MODEL=openai-compat \
  ai-code-review
```

**方式 B：直接运行**

```bash
npm install
npm run build
npm start
```

### 第三步：安装到仓库

1. 在 GitHub App 页面点击 "Install App"
2. 选择你要审查的仓库
3. 提一个 PR 试试看 🎉

---

## 模型配置

根据你的需求选择合适的模型：

### OpenAI（效果最好）
```bash
OPENAI_API_KEY=sk-xxx
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o
AI_MODEL=openai-compat
```

### DeepSeek（性价比之王 🇨🇳）
```bash
OPENAI_API_KEY=你的DeepSeek密钥
OPENAI_BASE_URL=https://api.deepseek.com/v1
OPENAI_MODEL=deepseek-chat
AI_MODEL=openai-compat
```

### 通义千问（阿里云 🇨🇳）
```bash
OPENAI_API_KEY=你的通义千问密钥
OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
OPENAI_MODEL=qwen-plus
AI_MODEL=openai-compat
```

### Google Gemini（有免费额度）
```bash
GEMINI_API_KEY=你的Gemini密钥
GEMINI_MODEL=gemini-2.0-flash
AI_MODEL=gemini
```

> 💡 **省钱技巧**：用 DeepSeek 或 Gemini 免费额度，个人项目几乎零成本。

---

## 自定义配置

在仓库根目录创建 `.ai-review.yml`：

```yaml
# 审查报告语言
language: zh        # zh（中文）| en（英文）

# AI 模型选择
model: auto         # auto | gemini | deepseek | openai

# 最低报告级别（过滤噪音）
severity: medium    # low | medium | high

# 忽略的文件/目录（不需要审查的）
ignore:
  - "*.md"          # 文档
  - "*.lock"        # 锁文件
  - "vendor/"       # 第三方依赖
  - "dist/"         # 编译产物
  - "*.min.js"      # 压缩文件
```

---

## 项目结构

```
src/
  index.ts              # HTTP 服务入口（Hono 框架）
  webhook.ts            # GitHub webhook 事件处理
  github.ts             # GitHub API 封装（App 认证 + diff 抓取 + comment 发送）
  reviewer.ts           # AI 审查核心（prompt 构建 + 结果解析）
  config.ts             # 环境变量 & 配置管理
  types.ts              # TypeScript 类型定义
  models/
    base.ts             # 模型工厂（根据配置创建实例）
    openai-compat.ts    # OpenAI 兼容 API（通吃 DeepSeek/通义/OpenAI）
    gemini.ts           # Google Gemini 适配
```

## 技术栈

- **Runtime**: Node.js + TypeScript
- **HTTP**: [Hono](https://hono.dev)（轻量快速）
- **GitHub**: [Octokit](https://github.com/octokit)（官方 SDK）
- **部署**: Docker

## 环境变量一览

| 变量 | 必填 | 说明 |
|------|------|------|
| `GITHUB_APP_ID` | ✅ | GitHub App ID |
| `GITHUB_PRIVATE_KEY` | ✅ | GitHub App 私钥 |
| `WEBHOOK_SECRET` | ✅ | Webhook 签名密钥 |
| `AI_MODEL` | ✅ | 模型类型：`openai-compat` 或 `gemini` |
| `OPENAI_API_KEY` | 按模型 | OpenAI 兼容 API 密钥 |
| `OPENAI_BASE_URL` | 按模型 | API 地址 |
| `OPENAI_MODEL` | 按模型 | 模型名称 |
| `GEMINI_API_KEY` | 按模型 | Gemini API 密钥 |
| `GEMINI_MODEL` | 按模型 | Gemini 模型名称 |
| `PORT` | ❌ | 服务端口（默认 3000） |

---

## Roadmap

- [x] MVP：PR 自动审查 + 中文报告
- [ ] GitHub Marketplace 上架
- [ ] 支持 Gitee / GitLab
- [ ] 审查规则自定义
- [ ] 审查历史统计面板
- [ ] OpenClaw Skill 集成

## Contributing

欢迎 PR 和 Issue！这是一个面向中文开发者的开源项目，期待你的参与。

## License

MIT
