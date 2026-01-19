import React, { useState } from 'react';
import { AnalysisResult, PRDetails, ReviewComment } from '../types';
import { CheckCircle2, XCircle, FileCode, MessageSquare, ExternalLink, Send, CheckSquare, Square, Edit3 } from 'lucide-react';

interface ReviewDashboardProps {
  analysis: AnalysisResult;
  prDetails: PRDetails;
  onSubmit: (filteredAnalysis: AnalysisResult) => void;
  onReset: () => void;
}

export const ReviewDashboard: React.FC<ReviewDashboardProps> = ({ analysis, prDetails, onSubmit, onReset }) => {
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(
    new Set(analysis.comments.map((_, i) => i))
  );
  
  // State for editable content
  const [editableSummary, setEditableSummary] = useState(analysis.summary);
  const [editableComments, setEditableComments] = useState<ReviewComment[]>(analysis.comments);

  const toggleSelect = (index: number) => {
    const next = new Set(selectedIndices);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setSelectedIndices(next);
  };

  const toggleAll = () => {
    if (selectedIndices.size === editableComments.length) {
      setSelectedIndices(new Set());
    } else {
      setSelectedIndices(new Set(editableComments.map((_, i) => i)));
    }
  };

  const handleCommentChange = (index: number, newText: string) => {
    const nextComments = [...editableComments];
    nextComments[index] = { ...nextComments[index], comment: newText };
    setEditableComments(nextComments);
  };

  const handlePost = () => {
    const filteredComments = editableComments.filter((_, i) => selectedIndices.has(i));
    onSubmit({
      decision: analysis.decision,
      summary: editableSummary,
      comments: filteredComments
    });
  };

  const getStatusColor = (decision: string) => {
    switch (decision) {
      case 'APPROVE': return 'text-green-400 border-green-400/30 bg-green-900/10';
      case 'REQUEST_CHANGES': return 'text-red-400 border-red-400/30 bg-red-900/10';
      default: return 'text-yellow-400 border-yellow-400/30 bg-yellow-900/10';
    }
  };

  const getStatusIcon = (decision: string) => {
    switch (decision) {
      case 'APPROVE': return <CheckCircle2 className="w-6 h-6" />;
      case 'REQUEST_CHANGES': return <XCircle className="w-6 h-6" />;
      default: return <MessageSquare className="w-6 h-6" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">CRITICAL</span>;
      case 'WARNING': return <span className="px-2 py-0.5 rounded text-xs font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">WARNING</span>;
      default: return <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">INFO</span>;
    }
  };

  const platformName = prDetails.platform === 'github' ? 'GitHub' : prDetails.platform === 'gitlab' ? 'GitLab' : 'Azure DevOps';
  const term = prDetails.platform === 'gitlab' ? 'Merge Request' : 'Pull Request';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
      
      {/* Left Column: Summary & Actions */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-github-header border border-github-border rounded-xl p-6 sticky top-6 shadow-xl">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-white line-clamp-2" title={prDetails.title}>
              {prDetails.title}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                prDetails.platform === 'github' ? 'bg-slate-700 text-slate-300' : 
                prDetails.platform === 'gitlab' ? 'bg-[#fc6d26]/20 text-[#fc6d26]' : 
                'bg-[#0078d4]/20 text-[#0078d4]'
              }`}>
                {platformName}
              </span>
              <a href={prDetails.url} target="_blank" rel="noreferrer" className="text-sm text-github-accent hover:underline flex items-center gap-1">
                #{prDetails.number} <ExternalLink className="w-3 h-3"/>
              </a>
            </div>
            <p className="text-xs text-slate-500 mt-1">Author: {prDetails.author}</p>
          </div>

          <div className={`flex items-center gap-3 p-4 rounded-lg border ${getStatusColor(analysis.decision)} mb-6`}>
            {getStatusIcon(analysis.decision)}
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">Recommendation</span>
              <span className="font-bold text-sm tracking-tight">{analysis.decision.replace('_', ' ')}</span>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Edit3 className="w-3 h-3" />
              Summary Text
            </h4>
            <textarea
              value={editableSummary}
              onChange={(e) => setEditableSummary(e.target.value)}
              className="w-full bg-github-dark/50 border border-github-border rounded-lg p-3 text-sm text-slate-300 leading-relaxed min-h-[120px] focus:ring-1 focus:ring-github-accent focus:border-transparent outline-none custom-scrollbar resize-none"
              placeholder="Edit the review summary..."
            />
          </div>

          <div className="space-y-3 pt-4 border-t border-github-border">
            <button 
              onClick={handlePost}
              className={`w-full ${
                prDetails.platform === 'azure' ? 'bg-[#0078d4] hover:bg-[#006cc1]' : 
                prDetails.platform === 'gitlab' ? 'bg-[#fc6d26] hover:bg-[#e24329]' : 
                'bg-github-btn hover:bg-github-btnHover'
              } text-white font-bold py-3 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50`}
              disabled={selectedIndices.size === 0 && editableComments.length > 0}
            >
              <Send className="w-4 h-4" />
              Post Review ({selectedIndices.size})
            </button>
            <button 
              onClick={onReset}
              className="w-full bg-transparent border border-github-border hover:bg-slate-800 text-slate-400 hover:text-white font-medium py-2 rounded-lg transition-colors text-sm"
            >
              Discard
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Detailed Comments */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Observations
            <span className="text-xs font-normal text-slate-500">({editableComments.length})</span>
          </h2>
          {editableComments.length > 0 && (
            <button 
              onClick={toggleAll}
              className="text-xs text-github-accent hover:underline flex items-center gap-1.5"
            >
              {selectedIndices.size === editableComments.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>

        {editableComments.length === 0 ? (
          <div className="bg-github-header border border-github-border rounded-xl p-12 text-center border-dashed">
            <CheckCircle2 className="w-16 h-16 text-green-500/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white">No Issues Detected</h3>
            <p className="text-slate-400 mt-2 max-w-sm mx-auto italic">
              Changes look solid. No specific improvements suggested.
            </p>
          </div>
        ) : (
          editableComments.map((item, idx) => {
            const isSelected = selectedIndices.has(idx);
            return (
              <div 
                key={idx} 
                className={`bg-github-header border border-github-border rounded-xl overflow-hidden shadow-lg border-l-4 transition-all ${isSelected ? 'opacity-100 ring-1 ring-github-accent/20' : 'opacity-40 grayscale-[0.5]'}`} 
                style={{ borderLeftColor: item.severity === 'CRITICAL' ? '#f87171' : item.severity === 'WARNING' ? '#fbbf24' : '#60a5fa' }}
              >
                <div className="bg-github-dark/40 border-b border-github-border px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleSelect(idx); }}
                      className="focus:outline-none"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-github-accent flex-shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-600 flex-shrink-0" />
                      )}
                    </button>
                    <FileCode className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <span className="text-xs font-mono text-slate-300 truncate" title={item.filename}>
                      {item.filename.split('/').pop()}
                    </span>
                    <span className="text-[10px] text-slate-600 hidden md:inline truncate">{item.filename}</span>
                  </div>
                  {getSeverityBadge(item.severity)}
                </div>
                
                <div className="p-5 space-y-4">
                  {item.lineContent && (
                    <div className="bg-black/40 rounded border border-github-border p-3 overflow-x-auto shadow-inner">
                      <code className="text-[11px] font-mono text-blue-300 whitespace-pre">
                        {item.lineContent}
                      </code>
                    </div>
                  )}
                  <div className="flex gap-3 items-start">
                    <div className="mt-1 flex-shrink-0">
                      <Edit3 className="w-4 h-4 text-slate-600" />
                    </div>
                    <textarea
                      value={item.comment}
                      onChange={(e) => handleCommentChange(idx, e.target.value)}
                      rows={2}
                      className="w-full bg-transparent text-slate-200 text-sm leading-relaxed whitespace-pre-wrap outline-none focus:ring-1 focus:ring-github-accent/30 rounded p-1 transition-all resize-y"
                      placeholder="Edit this comment..."
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};