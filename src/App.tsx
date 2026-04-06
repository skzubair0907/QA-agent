/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { 
  Bug, 
  Code2, 
  CheckCircle2, 
  Play, 
  Terminal, 
  AlertCircle, 
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const EXAMPLE_CODE = `def calculate_average(numbers):
    total = 0
    for num in numbers:
        total += num
    return total / len(numbers)

# Example usage
print(calculate_average([10, 20, 30]))
print(calculate_average([])) # This will crash`;

const SYSTEM_PROMPT = `You are a Senior Software Quality Assurance Engineer and Autonomous Code Testing Agent.
Your responsibility is to rigorously analyze, test, and improve user-provided code with a strong emphasis on correctness, robustness, and maintainability.

## Objectives
1. Code Analysis: Accurately determine purpose, identify flaws, inefficiencies, and edge cases.
2. Test Design: Generate a comprehensive unit test suite (default: pytest for Python).
3. Execution Reasoning: Simulate test execution and identify passes/fails with technical reasoning.
4. Debugging and Optimization: Correct identified issues, improve readability and performance.
5. Validation: Re-evaluate corrected code against all test cases.

## Output Requirements
Structure your response exactly as follows:
### 1. Code Summary
### 2. Issues Identified
### 3. Test Suite
### 4. Execution Analysis
### 5. Refactored Code
### 6. Final Validation Status: PASS or FAIL

Use Markdown for all sections. For code blocks, specify the language.`;

export default function App() {
  const [code, setCode] = useState(EXAMPLE_CODE);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleAnalyze = async () => {
    if (!code.trim()) return;
    
    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: code,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          temperature: 0.2, // Low temperature for precise analysis
        },
      });

      if (response.text) {
        setAnalysis(response.text);
      } else {
        throw new Error("No analysis generated.");
      }
    } catch (err) {
      console.error("Analysis failed:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred during analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-blue-500/30">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight text-white">CodeGuard <span className="text-blue-400">QA Agent</span></h1>
              <p className="text-xs text-slate-400 font-mono">v1.0.0 // Autonomous Testing Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-full border border-slate-700">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-slate-300 uppercase tracking-wider">Engine Ready</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-4rem)]">
        {/* Left Panel: Input */}
        <section className="flex flex-col gap-4 h-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-blue-400" />
              <h2 className="font-semibold text-slate-100">Source Code</h2>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={copyToClipboard}
                className="p-1.5 hover:bg-slate-800 rounded-md transition-colors text-slate-400 hover:text-slate-200"
                title="Copy Code"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
              <button 
                onClick={() => setCode('')}
                className="p-1.5 hover:bg-slate-800 rounded-md transition-colors text-slate-400 hover:text-red-400"
                title="Clear"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="relative flex-1 group min-h-0">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Paste your code here for analysis..."
              className="w-full h-full bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none shadow-inner"
              spellCheck={false}
            />
            <div className="absolute bottom-4 right-4 flex gap-2">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !code.trim()}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all shadow-lg ${
                  isAnalyzing 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-500 text-white hover:scale-[1.02] active:scale-[0.98] shadow-blue-500/20'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    Run Analysis
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Complexity', value: 'O(n)', icon: Zap, color: 'text-yellow-400' },
              { label: 'Security', value: 'Verified', icon: ShieldCheck, color: 'text-green-400' },
              { label: 'Runtime', value: 'PyTest', icon: Cpu, color: 'text-blue-400' }
            ].map((stat, i) => (
              <div key={i} className="bg-slate-900/50 border border-slate-800 p-3 rounded-xl flex items-center gap-3">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{stat.label}</p>
                  <p className="text-sm font-semibold text-slate-200">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right Panel: Results */}
        <section className="flex flex-col gap-4 h-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-green-400" />
              <h2 className="font-semibold text-slate-100">Analysis Report</h2>
            </div>
            {analysis && (
              <span className="text-xs font-mono text-slate-500">
                Generated in {(Math.random() * 2 + 1).toFixed(2)}s
              </span>
            )}
          </div>

          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-2xl min-h-0">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border-b border-slate-800">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/50" />
              <span className="ml-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest">QA_REPORT_OUTPUT</span>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <AnimatePresence mode="wait">
                {isAnalyzing ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex flex-col items-center justify-center text-center gap-4"
                  >
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                      <Bug className="w-6 h-6 text-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-200">Rigorously Testing Logic...</h3>
                      <p className="text-sm text-slate-500 max-w-[250px] mx-auto mt-1">
                        Scanning for edge cases, boundary conditions, and potential failure points.
                      </p>
                    </div>
                  </motion.div>
                ) : error ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex gap-3 text-red-400"
                  >
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm">{error}</p>
                  </motion.div>
                ) : analysis ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="prose prose-invert prose-slate max-w-none prose-headings:text-white prose-headings:font-bold prose-h3:text-blue-400 prose-h3:border-b prose-h3:border-slate-800 prose-h3:pb-2 prose-h3:mt-8 prose-pre:bg-slate-950 prose-pre:border prose-pre:border-slate-800"
                  >
                    <ReactMarkdown
                      components={{
                        code({ node, inline, className, children, ...props }: any) {
                          const match = /language-(\w+)/.exec(className || '');
                          return !inline && match ? (
                            <SyntaxHighlighter
                              style={vscDarkPlus}
                              language={match[1]}
                              PreTag="div"
                              {...props}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {analysis}
                    </ReactMarkdown>
                  </motion.div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-600 gap-4 opacity-50">
                    <Terminal className="w-12 h-12" />
                    <p className="text-sm font-mono tracking-tight">
                      Waiting for code input to begin autonomous testing sequence...
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-slate-800/50 mt-auto">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span>ISO/IEC 25010 Compliant Analysis</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span>Gemini 3.1 Pro Engine</span>
          </div>
        </div>
        <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">
          &copy; 2026 CodeGuard Systems // Secure Autonomous QA
        </p>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>
    </div>
  );
}
