import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { Webhooks } from '@octokit/webhooks';
import { appConfig } from './config';
import { handlePullRequestEvent } from './webhook';

const app = new Hono();
const webhooks = new Webhooks({ secret: appConfig.webhookSecret });

// 健康检查
app.get('/', (c) => {
  return c.json({
    name: 'ai-code-review',
    status: 'running',
    version: '1.0.0',
  });
});

app.get('/health', (c) => {
  return c.json({ status: 'ok' });
});

// GitHub Webhook 入口
app.post('/webhook', async (c) => {
  const signature = c.req.header('x-hub-signature-256') || '';
  const event = c.req.header('x-github-event') || '';
  const body = await c.req.text();

  // 验证签名
  if (appConfig.webhookSecret) {
    const isValid = await webhooks.verify(body, signature);
    if (!isValid) {
      console.error('[server] Webhook 签名验证失败');
      return c.json({ error: '签名验证失败' }, 401);
    }
  }

  console.log(`[server] 收到 webhook 事件: ${event}`);

  if (event === 'pull_request') {
    const payload = JSON.parse(body);
    // 异步处理，不阻塞 webhook 响应
    handlePullRequestEvent(payload).catch((err) => {
      console.error('[server] 处理 webhook 失败:', err);
    });
  }

  return c.json({ received: true });
});

// 启动服务
console.log(`🚀 AI Code Review 服务启动在端口 ${appConfig.port}`);
serve({
  fetch: app.fetch,
  port: appConfig.port,
});
