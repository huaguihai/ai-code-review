import { DiffFile, RepoConfig, ReviewResult, ReviewComment, Severity, ChatMessage } from './types';
import { createModel } from './models/base';

const SEVERITY_ORDER: Record<Severity, number> = { low: 0, medium: 1, high: 2 };

/**
 * 根据 ignore 规则过滤文件
 */
function filterFiles(files: DiffFile[], ignore: string[]): DiffFile[] {
  return files.filter((f) => {
    return !ignore.some((pattern) => {
      // 简单的 glob 匹配：*.ext / dir/
      if (pattern.endsWith('/')) {
        return f.filename.startsWith(pattern) || f.filename.includes('/' + pattern);
      }
      if (pattern.startsWith('*.')) {
        const ext = pattern.slice(1);
        return f.filename.endsWith(ext);
      }
      return f.filename === pattern;
    });
  });
}

/**
 * 构建审查 prompt
 */
function buildPrompt(files: DiffFile[], config: RepoConfig): ChatMessage[] {
  const lang = config.language === 'zh' ? '中文' : 'English';

  const systemPrompt = `你是一个资深代码审查专家。请使用${lang}进行代码审查。

审查维度：
1. Bug 检测：逻辑错误、边界条件、空指针等
2. 安全漏洞：SQL 注入、XSS、敏感信息泄露、不安全的依赖
3. 代码质量：可读性、命名、重复代码、复杂度
4. 性能：N+1 查询、不必要的循环、内存泄露风险
5. 最佳实践：语言特定的惯例和反模式

最低报告级别：${config.severity}（只报告该级别及以上的问题）

请严格按照以下 JSON 格式返回审查结果（不要包含 markdown 代码块标记）：
{
  "rating": "approve" | "comment" | "request_changes",
  "summary": "总结性评价（markdown 格式）",
  "comments": [
    {
      "path": "文件路径",
      "line": 行号,
      "body": "具体审查意见",
      "severity": "low" | "medium" | "high"
    }
  ]
}

注意：
- rating: approve 表示代码质量好，comment 表示有建议，request_changes 表示有必须修复的问题
- summary 要包含整体评级 emoji（✅ 通过 / ⚠️ 建议修改 / ❌ 需要修复）
- comments 中的 line 必须是 diff 中实际出现的行号（+ 号行的行号）
- 如果代码没有问题，comments 可以为空数组
- 只返回 JSON，不要返回其他内容`;

  const diffContent = files
    .map((f) => `### ${f.filename} (${f.status})\n\`\`\`diff\n${f.patch}\n\`\`\``)
    .join('\n\n');

  const userPrompt = `请审查以下 PR 的代码变更：\n\n${diffContent}`;

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];
}

/**
 * 解析 AI 返回的审查结果
 */
function parseReviewResult(raw: string, minSeverity: Severity): ReviewResult {
  // 尝试提取 JSON（可能被 markdown 代码块包裹）
  let jsonStr = raw.trim();
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  const parsed = JSON.parse(jsonStr);

  // 过滤低于最低严重级别的评论
  const filteredComments: ReviewComment[] = (parsed.comments || [])
    .filter((c: ReviewComment) => SEVERITY_ORDER[c.severity] >= SEVERITY_ORDER[minSeverity])
    .map((c: ReviewComment) => ({
      path: c.path,
      line: c.line,
      side: 'RIGHT' as const,
      body: `**[${c.severity.toUpperCase()}]** ${c.body}`,
      severity: c.severity,
    }));

  return {
    summary: parsed.summary || '审查完成',
    rating: parsed.rating || 'comment',
    comments: filteredComments,
  };
}

/**
 * 执行 AI 代码审查
 */
export async function reviewCode(
  files: DiffFile[],
  config: RepoConfig,
): Promise<ReviewResult> {
  // 过滤忽略的文件
  const filteredFiles = filterFiles(files, config.ignore);

  if (filteredFiles.length === 0) {
    return {
      summary: '✅ 没有需要审查的代码变更（所有文件已被忽略）',
      rating: 'approve',
      comments: [],
    };
  }

  // 如果 diff 太大，只保留前 10 个文件
  const filesToReview = filteredFiles.slice(0, 10);

  const modelName = config.model === 'auto' ? undefined : config.model;
  const model = createModel(modelName);

  console.log(`[reviewer] 使用模型: ${model.name}, 审查 ${filesToReview.length} 个文件`);

  const messages = buildPrompt(filesToReview, config);
  const response = await model.chat(messages);

  try {
    return parseReviewResult(response, config.severity);
  } catch (err) {
    console.error('[reviewer] 解析 AI 返回失败:', err);
    // 如果解析失败，返回原始内容作为 summary
    return {
      summary: `⚠️ AI 审查完成，但结果格式解析失败。原始回复：\n\n${response}`,
      rating: 'comment',
      comments: [],
    };
  }
}
