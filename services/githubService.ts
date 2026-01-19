import { AnalysisResult, CodeFile, PRDetails } from '../types';

const GITHUB_API_BASE = 'https://api.github.com';

export const parsePrUrl = (url: string): { owner: string; repo: string; number: number } => {
  try {
    const urlObj = new URL(url);
    const parts = urlObj.pathname.split('/').filter(Boolean);
    if (parts.length < 4 || (parts[2] !== 'pull' && parts[2] !== 'pulls')) {
      throw new Error('Invalid GitHub Pull Request URL.');
    }
    const numIdx = parts.findIndex(p => p === 'pull' || p === 'pulls') + 1;
    return {
      owner: parts[0],
      repo: parts[1],
      number: parseInt(parts[numIdx], 10),
    };
  } catch (e) {
    throw new Error('Invalid URL format.');
  }
};

const getHeaders = (token: string) => ({
  'Accept': 'application/vnd.github.v3+json',
  'Authorization': `token ${token.trim()}`,
  'X-GitHub-Api-Version': '2022-11-28'
});

export const getPrDetails = async (url: string, token: string): Promise<PRDetails> => {
  const { owner, repo, number } = parsePrUrl(url);
  const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls/${number}`, {
    headers: getHeaders(token),
  });
  if (!response.ok) throw new Error(`GitHub API Error: ${response.statusText}`);
  const data = await response.json();
  return {
    platform: 'github',
    owner,
    repo,
    number,
    title: data.title,
    description: data.body || '',
    author: data.user.login,
    url: data.html_url
  };
};

export const getPrFiles = async (url: string, token: string): Promise<CodeFile[]> => {
  const { owner, repo, number } = parsePrUrl(url);
  const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls/${number}/files?per_page=100`, {
    headers: getHeaders(token),
  });
  if (!response.ok) throw new Error('Failed to fetch files.');
  const data = await response.json();
  return data.map((file: any) => ({
    filename: file.filename,
    status: file.status,
    patch: file.patch || '',
  }));
};

export const submitReview = async (url: string, token: string, analysis: AnalysisResult): Promise<void> => {
  const { owner, repo, number } = parsePrUrl(url);

  let body = `${analysis.summary}\n\n`;
  
  if (analysis.comments.length > 0) {
    analysis.comments.forEach(c => {
      body += `**${c.filename}**\n`;
      if(c.lineContent) {
        body += `\`\`\`\n${c.lineContent}\n\`\`\`\n`;
      }
      body += `${c.comment}\n\n`;
    });
  }

  const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls/${number}/reviews`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({
      body,
      event: analysis.decision,
    }),
  });

  if (!response.ok) throw new Error('Failed to submit review');
};