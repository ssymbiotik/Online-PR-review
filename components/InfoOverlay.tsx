import React, { useState } from 'react';
import { Info, ShieldCheck, Zap, X, MousePointerClick, DatabaseZap, ClipboardCheck } from 'lucide-react';

export const InfoOverlay: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="fixed top-4 left-4 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 p-2 px-4 bg-github-header/40 hover:bg-github-header/90 backdrop-blur-md border border-github-border rounded-full transition-all text-slate-300 hover:text-white shadow-xl group"
          aria-label="How it works"
        >
          <Info className="w-4 h-4 text-github-accent group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold tracking-tight">How it works</span>
        </button>
      ) : (
        <div className="w-80 bg-github-header/95 backdrop-blur-xl border border-github-border rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200 ring-1 ring-white/10">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-black text-white flex items-center gap-2 tracking-tight">
              <ClipboardCheck className="w-4 h-4 text-github-accent" />
              THE PROCESS
            </h3>
            <button 
              onClick={() => { setIsOpen(false); setShowMore(false); }}
              className="p-1 hover:bg-white/10 rounded-full text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-5">
            <div className="relative pl-6 border-l-2 border-github-accent/30 space-y-4">
              <div className="relative">
                <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-github-dark border-2 border-github-accent flex items-center justify-center text-[8px] font-bold text-github-accent">1</div>
                <p className="text-[11px] text-slate-200 leading-relaxed">
                  <strong>Create PR Review:</strong> Provide your URL and keys. Gemini analyzes the code locally in your browser context.
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-github-dark border-2 border-github-accent flex items-center justify-center text-[8px] font-bold text-github-accent">2</div>
                <p className="text-[11px] text-slate-200 leading-relaxed">
                  <strong>Review & Decide:</strong> See the AI suggestions first. You choose whether to <strong>Submit</strong> the review or discard it. We never post automatically.
                </p>
              </div>
            </div>

            <div className="bg-green-500/5 border border-green-500/20 p-3 rounded-xl flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-[11px] text-green-200 font-bold">Privacy Policy</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  <strong>We do not save any information.</strong> Everything is stored in-memory for the current session only.
                </p>
              </div>
            </div>

            {!showMore ? (
              <button 
                onClick={() => setShowMore(true)}
                className="w-full text-center py-1 text-[10px] text-github-accent hover:text-blue-300 font-bold transition-colors"
              >
                Read more...
              </button>
            ) : (
              <div className="space-y-3 pt-3 border-t border-github-border/50 animate-in slide-in-from-top-1">
                <p className="text-[10px] text-slate-400 leading-relaxed italic">
                  Analysis is performed using the Google Gemini API. Your API keys and tokens are never sent to our servers—they only travel from your browser to the official GitHub/Azure/Google endpoints.
                </p>
                <button 
                  onClick={() => setShowMore(false)}
                  className="text-[10px] text-slate-500 hover:underline block w-full text-center"
                >
                  Show less
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};