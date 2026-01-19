import { AnalysisResult, CodeFile, PRDetails } from '../types';

const parseAzureUrl = (url: string): { org: string; project: string; repo: string; id: number } => {
  try {
    const urlObj = new URL(url);
    const parts = urlObj.pathname.split('/').filter(Boolean);
    let org = '', project = '', repo = '', id = 0;
    if (urlObj.hostname.includes('dev.azure.com')) {
      org = parts[0]; project = parts[1];
      const prIdx = parts.indexOf('pullrequest');
      repo = parts[prIdx - 1]; id = parseInt(parts[prIdx + 1], 10);
    } else {
      org = urlObj.hostname.split('.')[0]; project = parts[0];
      const prIdx = parts.indexOf('pullrequest');
      repo = parts[prIdx - 1]; id = parseInt(parts[prIdx + 1], 10);
    }
    return { org, project, repo, id };
  } catch (e) { throw new Error('Invalid Azure URL.'); }
};

const getHeaders = (token: string) => ({
  'Authorization': `Basic ${btoa(`:${token.trim()}`)}`,
  'Content-Type': 'application/json',
});

export const getAzurePrDetails = async (url: string, token: string): Promise<PRDetails> => {
  const { org, project, repo, id } = parseAzureUrl(url);
  const response = await fetch(`https://dev.azure.com/${org}/${project}/_apis/git/repositories/${repo}/pullRequests/${id}?api-version=7.0`, { headers: getHeaders(token) });
  if (!response.ok) throw new Error('Azure API Error');
  const data = await response.json();
  return { platform: 'azure', owner: org, repo: repo, number: id, title: data.title, description: data.description || '', author: data.createdBy?.displayName || 'Unknown', url: url };
};

export const getAzurePrFiles = async (url: string, token: string): Promise<CodeFile[]> => {
  const { org, project, repo, id } = parseAzureUrl(url);
  const headers = getHeaders(token);
  const details = await (await fetch(`https://dev.azure.com/${org}/${project}/_apis/git/repositories/${repo}/pullRequests/${id}?api-version=7.0`, { headers })).json();
  const sourceBranch = details.sourceRefName.replace('refs/heads/', '');
  const iterations = await (await fetch(`https://dev.azure.com/${org}/${project}/_apis/git/repositories/${repo}/pullRequests/${id}/iterations?api-version=7.0`, { headers })).json();
  let entries = [];
  if (iterations.value?.length > 0) {
    const latest = iterations.value[iterations.value.length - 1].id;
    entries = (await (await fetch(`https://dev.azure.com/${org}/${project}/_apis/git/repositories/${repo}/pullRequests/${id}/iterations/${latest}/changes?api-version=7.0`, { headers })).json()).changeEntries || [];
  }
  const files: CodeFile[] = [];
  for (const entry of entries) {
    if (!entry.item || entry.item.isFolder) continue;
    const file: CodeFile = { filename: entry.item.path, status: entry.changeType };
    if (entry.changeType !== 'delete') {
      const contentRes = await fetch(`https://dev.azure.com/${org}/${project}/_apis/git/repositories/${repo}/items?path=${encodeURIComponent(entry.item.path)}&versionDescriptor.version=${encodeURIComponent(sourceBranch)}&versionDescriptor.versionType=branch&api-version=7.0&$format=text`, { headers });
      if (contentRes.ok) file.content = (await contentRes.text()).slice(0, 50000);
    }
    files.push(file);
  }
  return files;
};

export const submitAzureReview = async (url: string, token: string, analysis: AnalysisResult): Promise<void> => {
  const { org, project, repo, id } = parseAzureUrl(url);
  const headers = getHeaders(token);
  const apiBase = `https://dev.azure.com/${org}/${project}/_apis/git/repositories/${repo}/pullRequests/${id}`;

  let body = `${analysis.summary}\n\n`;
  if (analysis.comments.length > 0) {
    analysis.comments.forEach(c => {
      body += `**${c.filename}**\n`;
      if(c.lineContent) body += `\`\`\`\n${c.lineContent}\n\`\`\`\n`;
      body += `${c.comment}\n\n`;
    });
  }

  await fetch(`${apiBase}/threads?api-version=7.0`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ comments: [{ content: body, commentType: 1 }], status: 1 })
  });
  let vote = analysis.decision === 'APPROVE' ? 10 : analysis.decision === 'REQUEST_CHANGES' ? -10 : 5;
  await fetch(`${apiBase}/reviewers/${encodeURIComponent(org)}?api-version=7.0`, { method: 'PUT', headers, body: JSON.stringify({ vote }) }).catch(() => {});
};