import React, { useState } from 'react';
import { ArrowRight, Lock, Github, Cloud, ArrowLeft, Sparkles, Gitlab } from 'lucide-react';
import { Platform } from '../types';

interface PrInputProps {
  platform: Platform;
  onSubmit: (url: string, token: string, geminiKey: string) => void;
  onBack: () => void;
}

export const PrInput: React.FC<PrInputProps> = ({ platform, onSubmit, onBack }) => {
  const [url, setUrl] = useState('');
  const [token, setToken] = useState('');
  const [geminiKey, setGeminiKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url && token && geminiKey) {
      onSubmit(url, token, geminiKey);
    }
  };

  const isAzure = platform === 'azure';
  const isGitLab = platform === 'gitlab';
  
  const ringColor = isAzure ? 'focus:ring-[#0078d4]' : isGitLab ? 'focus:ring-[#fc6d26]' : 'focus:ring-github-accent';
  const btnColor = isAzure ? 'bg-[#0078d4] hover:bg-[#006cc1]' : isGitLab ? 'bg-[#fc6d26] hover:bg-[#e24329]' : 'bg-github-btn hover:bg-github-btnHover';
  
  const Icon = isAzure ? Cloud : isGitLab ? Gitlab : Github;

  return (
    <div className="w-full max-w-md mx-auto bg-github-header border border-github-border rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            Review {isAzure ? 'Azure' : isGitLab ? 'GitLab' : 'GitHub'} {isGitLab ? 'MR' : 'PR'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Gemini API Key Input */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-2">Gemini API Key <span className="text-xs text-slate-600 font-normal">(Required)</span></span>
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-xs text-github-accent hover:underline">
                Get Key
              </a>
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy..."
                className={`w-full bg-github-dark border border-github-border text-white text-sm rounded-lg focus:ring-2 ${ringColor} focus:border-transparent block w-full p-2.5 pl-10 placeholder-slate-600`}
              />
              <Sparkles className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
          </div>

          <div className="border-t border-github-border/50 my-2"></div>

          {/* Platform Specific Inputs */}
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5">
              {isGitLab ? 'Merge Request' : 'Pull Request'} URL
            </label>
            <div className="relative">
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={
                  isAzure ? "https://dev.azure.com/org/proj/_git/repo/pullrequest/1" : 
                  isGitLab ? "https://gitlab.com/namespace/project/-/merge_requests/1" :
                  "https://github.com/owner/repo/pull/123"
                }
                className={`w-full bg-github-dark border border-github-border text-white text-sm rounded-lg focus:ring-2 ${ringColor} focus:border-transparent block w-full p-2.5 pl-10 placeholder-slate-600`}
              />
              <Icon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1.5 flex items-center gap-2">
              {isGitLab ? 'Personal Access Token' : 'Personal Access Token'}
              <span className="text-xs text-slate-600 font-normal">(Required)</span>
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder={isAzure ? "Paste Azure DevOps PAT" : isGitLab ? "glpat-xxxxxxxx" : "ghp_xxxxxxxxxxxx"}
                className={`w-full bg-github-dark border border-github-border text-white text-sm rounded-lg focus:ring-2 ${ringColor} focus:border-transparent block w-full p-2.5 pl-10 placeholder-slate-600`}
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {isAzure ? (
                <>Token needs <strong>Code (Read)</strong> and <strong>Pull Request Threads (Read & Write)</strong> scopes.</>
              ) : isGitLab ? (
                <>Token needs <strong>api</strong> or <strong>read_api</strong> scopes.</>
              ) : (
                <>Token needs <code>repo</code> scope for private repos.</>
              )}
            </p>
          </div>

          <button
            type="submit"
            disabled={!url || !token || !geminiKey}
            className={`w-full text-white ${btnColor} font-medium rounded-lg text-sm px-5 py-3 text-center flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg`}
          >
            Analyze {isGitLab ? 'MR' : 'PR'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};