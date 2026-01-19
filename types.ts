export type Platform = 'github' | 'azure' | 'gitlab';

export interface PRDetails {
  platform: Platform;
  owner: string; // Organization for Azure/GitLab (Namespace)
  repo: string; // Project/Repo
  number: string | number; // ID (IID for GitLab)
  title: string;
  description: string;
  author: string;
  url: string;
  projectId?: string | number; // Specific to GitLab/Azure
}

export interface CodeFile {
  filename: string;
  status: string; // 'added', 'modified', 'removed'
  patch?: string; // The diff
  content?: string; // Full content
}

export interface ReviewComment {
  filename: string;
  lineContent?: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  comment: string;
}

export interface AnalysisResult {
  summary: string;
  decision: 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT';
  comments: ReviewComment[];
}