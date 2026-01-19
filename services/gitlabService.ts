import { AnalysisResult, CodeFile, PRDetails } from '../types';

export const parseGitLabUrl = (url: string): { host: string; projectPath: string; iid: number } => {
  try {
    const urlObj = new URL(url);
    const parts = urlObj.pathname.split('/').filter(Boolean);
    const mrIndex = parts.indexOf('merge_requests');
    const projectPath = parts.slice(0, mrIndex - 1).join('/');
    const iid = parseInt(parts[mrIndex + 1], 10);
    return { host: urlObj.origin, projectPath: encodeURIComponent(projectPath), iid };
  } catch (e) { throw new Error('Invalid GitLab URL.'); }
};

const getHeaders = (token: string) => ({ 'PRIVATE-TOKEN': token.trim(), 'Content-Type': 'application/json' });

export const getGitLabMrDetails = async (url: string, token: string): Promise<PRDetails> => {
  const { host, projectPath, iid } = parseGitLabUrl(url);
  const response = await fetch(`${host}/api/v4/projects/${projectPath}/merge_requests/${iid}`, { headers: getHeaders(token) });
  const data = await response.json();
  return { platform: 'gitlab', owner: data.namespace?.name || 'GitLab', repo: data.references?.short.split('!')[0] || 'Project', number: iid, title: data.title, description: data.description || '', author: data.author?.name || 'Unknown', url: data.web_url, projectId: data.project_id };
};

export const getGitLabMrFiles = async (url: string, token: string): Promise<CodeFile[]> => {
  const { host, projectPath, iid } = parseGitLabUrl(url);
  const response = await fetch(`${host}/api/v4/projects/${projectPath}/merge_requests/${iid}/changes`, { headers: getHeaders(token) });
  const data = await response.json();
  return (data.changes || []).map((change: any) => ({ filename: change.new_path || change.old_path, status: change.new_file ? 'added' : change.deleted_file ? 'removed' : 'modified', patch: change.diff || '' }));
};

export const submitGitLabReview = async (url: string, token: string, analysis: AnalysisResult): Promise<void> => {
  const { host, projectPath, iid } = parseGitLabUrl(url);
  let body = `${analysis.summary}\n\n`;
  if (analysis.comments.length > 0) {
    analysis.comments.forEach(c => {
      body += `**${c.filename}**\n`;
      if(c.lineContent) body += `\`\`\`\n${c.lineContent}\n\`\`\`\n`;
      body += `${c.comment}\n\n`;
    });
  }
  await fetch(`${host}/api/v4/projects/${projectPath}/merge_requests/${iid}/notes`, { method: 'POST', headers: getHeaders(token), body: JSON.stringify({ body }) });
};