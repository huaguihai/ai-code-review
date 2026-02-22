# AI Code Review - 中文 AI 代码审查 GitHub App

## 产品定位
面向中文开发者的免费 AI 代码审查工具。安装 GitHub App 后，每次 PR 自动审查，中文报告直接写到 PR Comment。

## MVP 功能（第一版）
1. GitHub App 接收 PR webhook（opened / synchronize）
2. 抓取 PR diff
3. 调用 AI 模型审查代码（支持多模型：Gemini Free / DeepSeek / OpenAI）
4. 审查结果以中文 PR comment 形式发回 GitHub
5. 支持中英文审查报告切换（通过 repo 配置文件 `.ai-review.yml`）

## 技术栈
- **Runtime**: Node.js + TypeScript
- **Framework**: Hono（轻量 HTTP 框架）
- **GitHub 集成**: Octokit + Webhooks
- **AI 调用**: 多模型适配层（Gemini / DeepSeek / OpenAI 兼容 API）
- **部署**: Docker → 先跑在我们服务器上

## 项目结构
```
src/
  index.ts          - HTTP 服务入口
  webhook.ts        - GitHub webhook 处理
  github.ts         - GitHub API 封装（获取 diff、发 comment）
  reviewer.ts       - AI 审查核心逻辑
  models/           - 多模型适配
    base.ts         - 模型接口定义
    gemini.ts       - Gemini 适配
    openai-compat.ts - OpenAI 兼容 API（DeepSeek/通义等）
  config.ts         - 配置管理
  types.ts          - 类型定义
.ai-review.yml      - 示例用户配置
Dockerfile
package.json
tsconfig.json
README.md
```

## 审查维度
1. **Bug 检测**：逻辑错误、边界条件、空指针等
2. **安全漏洞**：SQL 注入、XSS、敏感信息泄露、不安全的依赖
3. **代码质量**：可读性、命名、重复代码、复杂度
4. **性能**：N+1 查询、不必要的循环、内存泄露风险
5. **最佳实践**：语言特定的惯例和反模式

## 输出格式
- 整体评级：✅ 通过 / ⚠️ 建议修改 / ❌ 需要修复
- 按文件的行内评论（Review Comment API）
- 一个总结性 PR Comment

## 配置文件 .ai-review.yml
```yaml
language: zh  # zh | en
model: auto   # auto | gemini | deepseek | openai
severity: medium  # low | medium | high（最低报告级别）
ignore:
  - "*.md"
  - "*.lock"
  - "vendor/"
```

## 变现计划（后期）
- 开源仓库：永久免费
- 私有仓库：每月 20 次免费审查，超出 $9.99/月
- 团队版：$19.99/月/5人
