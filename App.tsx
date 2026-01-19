import React, { useState } from 'react';
import { PrInput } from './components/PrInput';
import { PlatformSelector } from './components/PlatformSelector';
import { ReviewDashboard } from './components/ReviewDashboard';
import { InfoOverlay } from './components/InfoOverlay';
import { getPrDetails, getPrFiles, submitReview } from './services/githubService';
import { getAzurePrDetails, getAzurePrFiles, submitAzureReview } from './services/azureService';
import { getGitLabMrDetails, getGitLabMrFiles, submitGitLabReview } from './services/gitlabService';
import { analyzePullRequest } from './services/geminiService';
import { GithubIcon, Loader2, Code2, Gitlab } from 'lucide-react';
import { AnalysisResult, PRDetails, Platform } from './types';

export default function App() {
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [githubToken, setGithubToken] = useState<string>('');
  const [geminiApiKey, setGeminiApiKey] = useState<string>('');
  const [prUrl, setPrUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [prDetails, setPrDetails] = useState<PRDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStartReview = async (url: string, token: string, geminiKey: string) => {
    setIsLoading(true);
    setError(null);
    setPrUrl(url);
    setGithubToken(token);
    setGeminiApiKey(geminiKey);
    setAnalysisResult(null);

    try {
      setStatusMessage(`Connecting to ${platform}...`);
      
      let details, files;

      if (platform === 'github') {
        details = await getPrDetails(url, token);
        setStatusMessage('Fetching file diffs...');
        files = await getPrFiles(url, token);
      } else if (platform === 'gitlab') {
        details = await getGitLabMrDetails(url, token);
        setStatusMessage('Fetching MR changes...');
        files = await getGitLabMrFiles(url, token);
      } else {
        details = await getAzurePrDetails(url, token);
        setStatusMessage('Fetching modified files...');
        files = await getAzurePrFiles(url, token);
      }

      setPrDetails(details);

      if (files.length === 0) {
        throw new Error('No changes found in this PR to review.');
      }

      setStatusMessage('Gemini is analyzing the code...');
      const review = await analyzePullRequest(geminiKey, files, details.title, details.description);
      
      setAnalysisResult(review);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  const handleSubmitReview = async (filteredAnalysis: AnalysisResult) => {
    if (!prDetails || !platform) return;
    
    setIsSubmitting(true);
    setStatusMessage('Submitting review...');
    try {
      if (platform === 'github') {
        await submitReview(prUrl, githubToken, filteredAnalysis);
      } else if (platform === 'gitlab') {
        await submitGitLabReview(prUrl, githubToken, filteredAnalysis);
      } else {
        await submitAzureReview(prUrl, githubToken, filteredAnalysis);
      }
      alert('Review submitted successfully!');
    } catch (err: any) {
      setError(`Failed to submit review: ${err.message}`);
    } finally {
      setIsSubmitting(false);
      setStatusMessage('');
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setPrDetails(null);
    setError(null);
  };

  const handleBackToPlatform = () => {
    setPlatform(null);
    handleReset();
    setPrUrl('');
    setGithubToken('');
    setGeminiApiKey('');
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 max-w-7xl mx-auto w-full relative">
      <InfoOverlay />
      
      <header className="mb-8 text-center space-y-2 cursor-pointer" onClick={handleBackToPlatform}>
        <div className="flex items-center justify-center gap-3 mb-2">
          {platform === 'azure' ? (
             <Code2 className="w-10 h-10 text-[#0078d4]" />
          ) : platform === 'gitlab' ? (
             <Gitlab className="w-10 h-10 text-[#fc6d26]" />
          ) : (
             <GithubIcon className="w-10 h-10 text-white" />
          )}
          <h1 className="text-3xl font-bold text-white tracking-tight underline decoration-github-accent decoration-4 underline-offset-8">Online PR Review</h1>
        </div>
        <p className="text-slate-400">Your personal AI companion for better code</p>
      </header>

      <main className="w-full flex-grow">
        {error && (
          <div className="mb-6 bg-red-900/30 border border-red-500/50 text-red-200 p-4 rounded-lg flex items-center justify-between animate-in fade-in">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-sm underline">Dismiss</button>
          </div>
        )}

        {(isLoading || isSubmitting) && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4 animate-in fade-in duration-500">
            <Loader2 className={`w-12 h-12 animate-spin ${platform === 'azure' ? 'text-[#0078d4]' : platform === 'gitlab' ? 'text-[#fc6d26]' : 'text-github-accent'}`} />
            <p className="text-lg text-slate-300 font-medium">{statusMessage}</p>
          </div>
        )}

        {!platform && !isLoading && !isSubmitting && (
          <PlatformSelector onSelect={setPlatform} />
        )}

        {platform && !analysisResult && !isLoading && !isSubmitting && (
          <PrInput 
            platform={platform} 
            onSubmit={handleStartReview} 
            onBack={handleBackToPlatform}
          />
        )}

        {analysisResult && prDetails && !isLoading && !isSubmitting && (
          <ReviewDashboard 
            analysis={analysisResult} 
            prDetails={prDetails}
            onSubmit={handleSubmitReview}
            onReset={handleReset}
          />
        )}
      </main>

      <footer className="w-full mt-12 pt-8 border-t border-github-border/50 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="bg-github-header/50 border border-github-border rounded-lg p-4 min-h-[100px] flex flex-col items-center justify-center text-slate-500 text-xs">
            <span className="mb-2 font-semibold uppercase tracking-widest text-[10px]">Advertisement</span>
            <ins className="adsbygoogle"
                 style={{ display: 'block', width: '100%' }}
                 data-ad-client="ca-pub-9087490008856815"
                 data-ad-slot="8139556854"
                 data-ad-format="auto"
                 data-full-width-responsive="true"></ins>
            <p className="mt-2 italic opacity-50">Support our AI tool by keeping ads enabled</p>
          </div>
          <p className="mt-6 text-[10px] text-slate-600">
            &copy; {new Date().getFullYear()} Online PR Review • Powered by Gemini 3.0
          </p>
        </div>
      </footer>
    </div>
  );
}