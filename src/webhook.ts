import { PullRequestInfo } from './types';
import { getPRDiff, getRepoConfig, postReviewComment } from './github';
import { reviewCode } from './reviewer';

/**
 * 处理 PR webhook 事件
 */
export async function handlePullRequestEvent(payload: {
  action: string;
  pull_request: {
    number: number;
    title: string;
    body: string | null;
    head: { sha: string };
    base: { sha: string };
  };
  repository: {
    name: string;
    owner: { login: string };
  };
  installation?: { id: number };
}): Promise<void> {
  const { action, pull_request, repository, installation } = payload;

  // 只处理 opened 和 synchronize 事件
  if (action !== 'opened' && action !== 'synchronize') {
    console.log(`[webhook] 忽略 PR 事件: ${action}`);
    return;
  }

  if (!installation?.id) {
    console.error('[webhook] 缺少 installation id');
    return;
  }

  const pr: PullRequestInfo = {
    owner: repository.owner.login,
    repo: repository.name,
    number: pull_request.number,
    title: pull_request.title,
    body: pull_request.body || '',
    headSha: pull_request.head.sha,
    baseSha: pull_request.base.sha,
    installationId: installation.id,
  };

  console.log(`[webhook] 收到 PR #${pr.number} ${action} 事件: ${pr.owner}/${pr.repo}`);

  try {
    // 1. 获取仓库配置
    const config = await getRepoConfig(pr);
    console.log(`[webhook] 仓库配置: language=${config.language}, model=${config.model}`);

    // 2. 获取 PR diff
    const files = await getPRDiff(pr);
    console.log(`[webhook] 获取到 ${files.length} 个变更文件`);

    if (files.length === 0) {
      console.log('[webhook] 没有变更文件，跳过审查');
      return;
    }

    // 3. AI 审查
    const result = await reviewCode(files, config);
    console.log(`[webhook] 审查完成: rating=${result.rating}, comments=${result.comments.length}`);

    // 4. 发送审查结果
    await postReviewComment(pr, result);
    console.log(`[webhook] 审查结果已发送到 PR #${pr.number}`);
  } catch (error) {
    console.error(`[webhook] 处理 PR #${pr.number} 失败:`, error);
    throw error;
  }
}
