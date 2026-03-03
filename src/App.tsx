import React, { useState, useEffect } from 'react';
import { ScoringEngine } from './ScoringEngine';
import { ScoreReport } from './types';
import { CheckCircle2, AlertTriangle, XCircle, FileText, Award, Lightbulb, Moon, Sun } from 'lucide-react';

export default function App() {
  const [markdown, setMarkdown] = useState<string>('# My Project\n\nThis is a great project.\n\n## Installation\n\n```bash\nnpm install\n```\n\n## Usage\n\n```bash\nnpm start\n```\n\n## Author\n\n[My Name](https://github.com/myname)\n');
  const [report, setReport] = useState<ScoreReport | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check system preference on initial load
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  const handleScore = () => {
    if (!markdown.trim()) {
      setReport({
        fileSize: 0,
        totalScore: 0,
        details: [],
        suggestions: ['File is empty. Please enter some markdown content.']
      });
      return;
    }
    
    // In the browser, we approximate file size by string length
    const size = new Blob([markdown]).size;
    const result = ScoringEngine.score(markdown, size);
    setReport(result);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500 dark:text-emerald-400';
    if (score >= 50) return 'text-amber-500 dark:text-amber-400';
    return 'text-rose-500 dark:text-rose-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500 dark:bg-emerald-600';
    if (score >= 50) return 'bg-amber-500 dark:bg-amber-600';
    return 'bg-rose-500 dark:bg-rose-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Needs Improvement';
    return 'Poor';
  };

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans p-4 md:p-8 transition-colors duration-200">
        <div className="max-w-6xl mx-auto space-y-6">
          <header className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-black dark:bg-white rounded-lg text-white dark:text-black transition-colors">
                <FileText size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">README Scorer</h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Automated quality assurance for your documentation</p>
              </div>
            </div>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun size={24} className="text-neutral-100" /> : <Moon size={24} className="text-neutral-900" />}
            </button>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <span>Markdown Input</span>
                </h2>
                <button 
                  onClick={handleScore}
                  className="px-4 py-2 bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 dark:text-black text-white rounded-md font-medium transition-colors shadow-sm"
                >
                  Score README
                </button>
              </div>
              <textarea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                className="w-full h-[600px] p-4 font-mono text-sm bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg shadow-sm focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white resize-none transition-colors dark:text-neutral-100"
                placeholder="Paste your README.md content here..."
              />
            </div>

            {/* Results Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Score Report</h2>
              
              {!report ? (
                <div className="h-[600px] flex flex-col items-center justify-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg border-dashed text-neutral-400 dark:text-neutral-500 transition-colors">
                  <Award size={48} className="mb-4 opacity-50" />
                  <p>Click "Score README" to see the results</p>
                </div>
              ) : (
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm overflow-hidden flex flex-col h-[600px] transition-colors">
                  {/* Score Header */}
                  <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/50">
                    <div>
                      <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1">Final Score</p>
                      <div className="flex items-baseline gap-2">
                        <span className={`text-5xl font-bold ${getScoreColor(report.totalScore)}`}>
                          {report.totalScore}
                        </span>
                        <span className="text-xl text-neutral-400 dark:text-neutral-500 font-medium">/ 100</span>
                      </div>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-white font-medium ${getScoreBgColor(report.totalScore)}`}>
                      {getScoreLabel(report.totalScore)}
                    </div>
                  </div>

                  <div className="overflow-y-auto flex-1 p-6 space-y-8">
                    {/* Details */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">Section Breakdown</h3>
                      <div className="space-y-3">
                        {report.details.map((detail, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 transition-colors">
                            <div className="mt-0.5">
                              {detail.status === 'success' && <CheckCircle2 className="text-emerald-500 dark:text-emerald-400" size={20} />}
                              {detail.status === 'warning' && <AlertTriangle className="text-amber-500 dark:text-amber-400" size={20} />}
                              {detail.status === 'error' && <XCircle className="text-rose-500 dark:text-rose-400" size={20} />}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-medium text-neutral-900 dark:text-neutral-100">{detail.name}</span>
                                <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                                  {detail.maxScore > 0 ? `${detail.score}/${detail.maxScore}` : `${detail.score > 0 ? '+' : ''}${detail.score}`} pts
                                </span>
                              </div>
                              <p className="text-sm text-neutral-600 dark:text-neutral-400">{detail.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Suggestions */}
                    {report.suggestions.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider flex items-center gap-2">
                          <Lightbulb size={16} className="text-amber-500 dark:text-amber-400" />
                          Suggestions for Improvement
                        </h3>
                        <ul className="space-y-2">
                          {report.suggestions.map((suggestion, idx) => (
                            <li key={idx} className="text-sm text-neutral-600 dark:text-neutral-400 flex items-start gap-2">
                              <span className="text-amber-500 dark:text-amber-400 mt-0.5">•</span>
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
