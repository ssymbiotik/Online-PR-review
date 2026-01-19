import React from 'react';
import { GithubIcon, Cloud, Gitlab } from 'lucide-react';
import { Platform } from '../types';

interface PlatformSelectorProps {
  onSelect: (platform: Platform) => void;
}

export const PlatformSelector: React.FC<PlatformSelectorProps> = ({ onSelect }) => {
  return (
    <div className="w-full max-w-4xl mx-auto animate-in fade-in duration-500">
      <h2 className="text-2xl font-semibold text-white text-center mb-8">Select Repository Platform</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => onSelect('github')}
          className="group relative flex flex-col items-center justify-center p-8 bg-github-header border border-github-border hover:border-github-accent rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-github-accent/10"
        >
          <div className="p-4 rounded-full bg-slate-800 mb-4 group-hover:bg-github-btn transition-colors">
            <GithubIcon className="w-12 h-12 text-white" />
          </div>
          <span className="text-xl font-bold text-white mb-2">GitHub</span>
          <p className="text-sm text-slate-400 text-center">
            Review Pull Requests from GitHub.com or Enterprise
          </p>
        </button>

        <button
          onClick={() => onSelect('gitlab')}
          className="group relative flex flex-col items-center justify-center p-8 bg-github-header border border-github-border hover:border-[#fc6d26] rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-[#fc6d26]/10"
        >
          <div className="p-4 rounded-full bg-slate-800 mb-4 group-hover:bg-[#fc6d26] transition-colors">
            <Gitlab className="w-12 h-12 text-white" />
          </div>
          <span className="text-xl font-bold text-white mb-2">GitLab</span>
          <p className="text-sm text-slate-400 text-center">
            Review Merge Requests from GitLab.com or self-hosted
          </p>
        </button>

        <button
          onClick={() => onSelect('azure')}
          className="group relative flex flex-col items-center justify-center p-8 bg-github-header border border-github-border hover:border-[#0078d4] rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-[#0078d4]/10"
        >
          <div className="p-4 rounded-full bg-slate-800 mb-4 group-hover:bg-[#0078d4] transition-colors">
            <Cloud className="w-12 h-12 text-white" />
          </div>
          <span className="text-xl font-bold text-white mb-2">Azure DevOps</span>
          <p className="text-sm text-slate-400 text-center">
            Review Pull Requests from Azure DevOps Services
          </p>
        </button>
      </div>
    </div>
  );
};