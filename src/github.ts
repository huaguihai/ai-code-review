import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';
import * as yaml from 'js-yaml';
import { PullRequestInfo, DiffFile, ReviewResult, RepoConfig, ReviewComment } from './types';
import { appConfig, defaultRepoConfig } from './config';

/**
 * 为指定 installation 创建 Octokit 实例
 */
function getOctokit(installationId: number): Octokit {
  return new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: appConfig.appId,
      privateKey: appConfig.privateKey,
      installationId,
    },
  });
}

/**
 * 获取 PR 的文件 diff 列表
 */
export async function getPRDiff(pr: PullRequestInfo): Promise<DiffFile[]> {
  const octokit = getOctokit(pr.installationId);

  const { data: files } = await octokit.pulls.listFiles({
    owner: pr.owner,
    repo: pr.repo,
    pull_number: pr.number,
    per_page: 100,
  });

  return files.map((f) => ({
    filename: f.filename,
    status: f.status as DiffFile['status'],
    patch: f.patch || '',
    additions: f.additions,
    deletions: f.deletions,
  }));
}

/**
 * 获取仓库中的 .ai-review.yml 配置
 */
export async function getRepoConfig(pr: PullRequestInfo): Promise<RepoConfig> {
  const octokit = getOctokit(pr.installationId);

  try {
    const { data } = await octokit.repos.getContent({
      owner: pr.owner,
      repo: pr.repo,
      path: '.ai-review.yml',
      ref: pr.headSha,
    });

    if ('content' in data && data.content) {
      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      const parsed = yaml.load(content) as Partial<RepoConfig>;
      return { ...defaultRepoConfig, ...parsed };
    }
  } catch {
    // 配置文件不存在，使用默认值
  }

  return { ...defaultRepoConfig };
}

/**
 * 发送审查总结 comment 到 PR
 */
export async function postReviewComment(
  pr: PullRequestInfo,
  result: ReviewResult,
): Promise<void> {
  const octokit = getOctokit(pr.installationId);

  // 1. 发送总结性 PR comment
  await octokit.issues.createComment({
    owner: pr.owner,
    repo: pr.repo,
    issue_number: pr.number,
    body: result.summary,
  });

  // 2. 如果有行内评论，通过 review API 提交
  if (result.comments.length > 0) {
    const event = result.rating === 'approve'
      ? 'APPROVE' as const
      : result.rating === 'request_changes'
        ? 'REQUEST_CHANGES' as const
        : 'COMMENT' as const;

    const reviewComments = result.comments.map((c: ReviewComment) => ({
      path: c.path,
      line: c.line,
      side: c.side,
      body: c.body,
    }));

    await octokit.pulls.createReview({
      owner: pr.owner,
      repo: pr.repo,
      pull_number: pr.number,
      commit_id: pr.headSha,
      event,
      body: '🤖 AI Code Review - 行内审查意见',
      comments: reviewComments,
    });
  }
}
