<h1 align="center">🤖 AI Code Review</h1>

<p align="center">
  <strong>AI-Powered Code Review GitHub App</strong><br>
  Open PR → AI Reviews Automatically → Report Lands in PR Comments
</p>

<p align="center">
  <a href="#why">Why</a> •
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#model-configuration">Models</a> •
  <a href="#customization">Customization</a> •
  <a href="./README.zh-CN.md">中文文档</a>
</p>

---

## Why?

**Scenario 1: You just generated 500 lines with Cursor / Copilot**
> The AI wrote a bunch of code. It compiles. Tests pass. But did you actually read every line?
>
> Three days later, a weird bug hits production — turns out the AI silently removed a validation check.

**Scenario 2: A new teammate opens a PR and you're too busy to review**
> You merge it quickly. A week later, you find a SQL injection and sensitive data leaking into logs.

**Scenario 3: You're a solo developer with no one to review your code**
> Reviewing your own code is like proofreading your own essay — you'll miss things every time.

**AI Code Review is your second pair of eyes.** Every PR triggers an automatic review. It tells you what's wrong, why it's wrong, and how to fix it.

🇨🇳 **Chinese-first reports supported** — built for Chinese-speaking developers, with English also available.

---

## Features

🔍 **Five-Dimensional Review**
- 🐛 **Bug Detection** — Logic errors, edge cases, null references
- 🔒 **Security Vulnerabilities** — SQL injection, XSS, credential leaks
- 📐 **Code Quality** — Readability, naming, duplication, complexity
- ⚡ **Performance** — N+1 queries, unnecessary loops, memory leaks
- 📏 **Best Practices** — Language idioms, anti-pattern detection

🌐 **Multi-Model Support**
- OpenAI (GPT-4o, etc.)
- DeepSeek (cost-effective 🇨🇳)
- Google Gemini (free tier available)
- Qwen / Tongyi (Alibaba Cloud 🇨🇳)
- Any OpenAI-compatible API

🇨🇳 **Bilingual Reports**
- Chinese or English review reports (configurable per repo)
- Default: Chinese — switch to English with one line of config

📊 **Clear Review Reports**
- ✅ / ⚠️ / ❌ Overall rating at a glance
- Inline comments pinpointed to exact code lines
- Summary comment for the big picture

---

## Quick Start

### Step 1: Create a GitHub App

1. Go to GitHub → Settings → Developer settings → GitHub Apps → New GitHub App
2. Configure:

| Setting | Value |
|---------|-------|
| Webhook URL | `https://your-domain.com/webhook` |
| Webhook secret | Your custom secret |
| Permissions - Pull requests | Read & Write |
| Permissions - Contents | Read |
| Subscribe to events | Pull request |

3. After creation, note the **App ID** and download the **private key** (.pem file)

### Step 2: Deploy

**Option A: Docker (Recommended)**

```bash
docker build -t ai-code-review .

docker run -d \
  -p 3000:3000 \
  -e GITHUB_APP_ID=your_app_id \
  -e GITHUB_PRIVATE_KEY="$(cat your-app.pem)" \
  -e WEBHOOK_SECRET=your_secret \
  -e OPENAI_API_KEY=your_api_key \
  -e OPENAI_BASE_URL=https://api.openai.com/v1 \
  -e OPENAI_MODEL=gpt-4o \
  -e AI_MODEL=openai-compat \
  ai-code-review
```

**Option B: Run Directly**

```bash
npm install
npm run build
npm start
```

### Step 3: Install on Your Repo

1. Go to your GitHub App page → "Install App"
2. Select the repositories you want to review
3. Open a PR and watch the magic happen 🎉

---

## Model Configuration

Choose the model that fits your needs:

### OpenAI (Best quality)
```bash
OPENAI_API_KEY=sk-xxx
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o
AI_MODEL=openai-compat
```

### DeepSeek (Best value 🇨🇳)
```bash
OPENAI_API_KEY=your_deepseek_key
OPENAI_BASE_URL=https://api.deepseek.com/v1
OPENAI_MODEL=deepseek-chat
AI_MODEL=openai-compat
```

### Qwen / Tongyi (Alibaba Cloud 🇨🇳)
```bash
OPENAI_API_KEY=your_qwen_key
OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
OPENAI_MODEL=qwen-plus
AI_MODEL=openai-compat
```

### Google Gemini (Free tier available)
```bash
GEMINI_API_KEY=your_gemini_key
GEMINI_MODEL=gemini-2.0-flash
AI_MODEL=gemini
```

> 💡 **Cost-saving tip**: Use DeepSeek or Gemini's free tier for near-zero cost on personal projects.

---

## Customization

Add `.ai-review.yml` to your repository root:

```yaml
# Report language
language: zh        # zh (Chinese) | en (English)

# AI model
model: auto         # auto | gemini | deepseek | openai

# Minimum severity to report (filter noise)
severity: medium    # low | medium | high

# Files/directories to ignore
ignore:
  - "*.md"          # Documentation
  - "*.lock"        # Lock files
  - "vendor/"       # Third-party deps
  - "dist/"         # Build output
  - "*.min.js"      # Minified files
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GITHUB_APP_ID` | ✅ | GitHub App ID |
| `GITHUB_PRIVATE_KEY` | ✅ | GitHub App private key (PEM) |
| `WEBHOOK_SECRET` | ✅ | Webhook signature secret |
| `AI_MODEL` | ✅ | Model type: `openai-compat` or `gemini` |
| `OPENAI_API_KEY` | By model | OpenAI-compatible API key |
| `OPENAI_BASE_URL` | By model | API endpoint URL |
| `OPENAI_MODEL` | By model | Model name |
| `GEMINI_API_KEY` | By model | Gemini API key |
| `GEMINI_MODEL` | By model | Gemini model name |
| `PORT` | ❌ | Server port (default: 3000) |

---

## Project Structure

```
src/
  index.ts              # HTTP server entry (Hono)
  webhook.ts            # GitHub webhook event handler
  github.ts             # GitHub API (App auth + diff fetch + comment post)
  reviewer.ts           # AI review core (prompt building + result parsing)
  config.ts             # Environment & config management
  types.ts              # TypeScript type definitions
  models/
    base.ts             # Model factory
    openai-compat.ts    # OpenAI-compatible API (DeepSeek/Qwen/OpenAI)
    gemini.ts           # Google Gemini adapter
```

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **HTTP**: [Hono](https://hono.dev) (lightweight & fast)
- **GitHub**: [Octokit](https://github.com/octokit) (official SDK)
- **Deploy**: Docker

## Roadmap

- [x] MVP: Automatic PR review + bilingual reports
- [ ] GitHub Marketplace listing
- [ ] Gitee / GitLab support
- [ ] Custom review rules
- [ ] Review history dashboard
- [ ] OpenClaw Skill integration

## Contributing

PRs and Issues are welcome! This project is built with Chinese-speaking developers in mind, but contributions from everyone are appreciated.

## License

MIT
