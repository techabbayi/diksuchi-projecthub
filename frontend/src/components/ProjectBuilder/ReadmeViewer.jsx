import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FileText, BookOpen, Copy, Check, Code2, Sparkles, CheckCircle2, Layers, Download } from 'lucide-react';
import { Card } from '../ui/Card';
import { useState } from 'react';

const ReadmeViewer = ({ readme }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(readme);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const blob = new Blob([readme], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'README.md';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // Custom components for markdown rendering
    const components = {
        h1: ({ children }) => (
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent border-b-4 border-gradient-to-r from-blue-600 to-purple-600 pb-4 mb-8 flex items-center gap-3">
                <Sparkles className="h-8 w-8 text-blue-600" />
                {children}
            </h1>
        ),
        h2: ({ children }) => {
            const text = String(children);
            const isTechStack = text.toLowerCase().includes('tech stack') || text.toLowerCase().includes('technology');
            const isFeatures = text.toLowerCase().includes('feature') || text.toLowerCase().includes('key');
            const isOverview = text.toLowerCase().includes('overview');

            return (
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-10 mb-6 pb-3 border-b-2 border-gray-200 dark:border-gray-700 flex items-center gap-3">
                    {isTechStack && <Code2 className="h-7 w-7 text-blue-600" />}
                    {isFeatures && <CheckCircle2 className="h-7 w-7 text-green-600" />}
                    {isOverview && <Layers className="h-7 w-7 text-purple-600" />}
                    {!isTechStack && !isFeatures && !isOverview && <span className="w-1.5 h-7 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></span>}
                    {children}
                </h2>
            );
        },
        h3: ({ children }) => (
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-6 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></span>
                {children}
            </h3>
        ),
        p: ({ children }) => {
            const text = String(children);
            // Check if this is part of tech stack or features
            if (text.includes('Frontend:') || text.includes('Backend:') || text.includes('Database:')) {
                return (
                    <p className="my-3 flex items-center gap-3 text-gray-700 dark:text-gray-300 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 px-4 py-3 rounded-lg border-l-4 border-blue-500">
                        <Code2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
                        <span className="font-medium">{children}</span>
                    </p>
                );
            }
            return <p className="my-4 text-gray-700 dark:text-gray-300 leading-relaxed">{children}</p>;
        },
        ul: ({ children }) => (
            <ul className="my-6 space-y-3 ml-6">{children}</ul>
        ),
        li: ({ children }) => {
            const text = String(children);
            const isFeature = text.length > 10; // Assume longer items are features

            return (
                <li className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className={isFeature ? 'font-medium' : ''}>{children}</span>
                </li>
            );
        },
        code: ({ inline, children }) => {
            if (inline) {
                return (
                    <code className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded font-mono text-sm font-semibold border border-purple-200 dark:border-purple-800">
                        {children}
                    </code>
                );
            }
            return (
                <code className="block bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto border border-gray-700">
                    {children}
                </code>
            );
        },
        pre: ({ children }) => (
            <pre className="my-6 bg-gray-900 rounded-lg overflow-hidden shadow-lg border border-gray-700">
                {children}
            </pre>
        ),
        strong: ({ children }) => (
            <strong className="font-bold text-gray-900 dark:text-white bg-yellow-100 dark:bg-yellow-900/20 px-1 rounded">
                {children}
            </strong>
        ),
        blockquote: ({ children }) => (
            <blockquote className="my-6 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20 py-4 px-6 rounded-r-lg shadow-sm">
                <div className="flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
                    <div>{children}</div>
                </div>
            </blockquote>
        ),
    };

    if (!readme) {
        return (
            <Card className="p-12 text-center bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                <div className="relative inline-block">
                    <div className="absolute inset-0 bg-gray-300 dark:bg-gray-600 blur-2xl opacity-30"></div>
                    <FileText className="h-20 w-20 mx-auto text-gray-400 dark:text-gray-600 relative z-10" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 mt-6 text-lg font-semibold">No README available yet</p>
                <p className="text-gray-500 dark:text-gray-500 mt-2">Documentation will appear here once generated.</p>
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <BookOpen className="h-7 w-7 text-white" />
                    <h3 className="text-2xl font-bold text-white">Project Documentation</h3>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-all text-white font-semibold"
                    >
                        {copied ? (
                            <>
                                <Check className="h-4 w-4" />
                                Copied!
                            </>
                        ) : (
                            <>
                                <Copy className="h-4 w-4" />
                                Copy
                            </>
                        )}
                    </button>
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-all text-white font-semibold"
                    >
                        <Download className="h-4 w-4" />
                        Download
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                <div className="prose prose-lg dark:prose-invert max-w-none
                    prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-a:font-semibold
                    prose-table:border-2 prose-table:border-gray-300 dark:prose-table:border-gray-700 prose-table:rounded-lg prose-table:overflow-hidden
                    prose-th:bg-gradient-to-r prose-th:from-blue-100 prose-th:to-purple-100 dark:prose-th:from-blue-900/30 dark:prose-th:to-purple-900/30 prose-th:font-bold prose-th:p-4
                    prose-td:border prose-td:border-gray-300 dark:prose-td:border-gray-700 prose-td:p-4
                    prose-hr:border-gray-300 dark:prose-hr:border-gray-700 prose-hr:my-8
                ">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={components}
                    >
                        {readme}
                    </ReactMarkdown>
                </div>
            </div>
        </Card>
    );
};

export default ReadmeViewer;
