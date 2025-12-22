import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import { Button } from '../ui/Button';
import { CheckCircle, Circle, Lock, ExternalLink, Book, Lightbulb, Clock, Link as LinkIcon, HelpCircle, GraduationCap, Terminal, FileText, X, Copy, Check } from 'lucide-react';

const TaskCard = ({ task, projectId, onTaskComplete }) => {
    const [showSubmit, setShowSubmit] = useState(false);
    const [artifactUrl, setArtifactUrl] = useState('');
    const [secondaryUrl, setSecondaryUrl] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showHelp, setShowHelp] = useState(false);
    const [helpTab, setHelpTab] = useState('commands'); // 'commands' or 'guide'
    const [taskHelp, setTaskHelp] = useState(null);
    const [loadingHelp, setLoadingHelp] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState(null);

    // Copy command to clipboard
    const copyToClipboard = async (text, index) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedIndex(index);
            toast.success('Copied to clipboard!');
            setTimeout(() => setCopiedIndex(null), 2000);
        } catch {
            toast.error('Failed to copy');
        }
    };

    // Fetch task help data
    const fetchTaskHelp = async () => {
        if (taskHelp) {
            setShowHelp(true);
            return;
        }

        setShowHelp(true); // Show modal immediately
        setLoadingHelp(true);
        try {
            const response = await api.get(`/project-builder/${projectId}/tasks/${task.taskId}/help`);

            if (response.data && response.data.help) {
                setTaskHelp(response.data.help);
            } else {
                // Fallback if no help data
                setTaskHelp({
                    commands: [],
                    steps: [{ title: 'No help available', description: 'Please check the task description and resources.' }]
                });
                toast.error('No help content available');
            }
        } catch (error) {
            console.error('Help fetch error:', error);
            // Show modal with error message instead of just toast
            setTaskHelp({
                commands: [],
                steps: [{
                    title: 'Error loading help',
                    description: error.response?.data?.message || 'Failed to load help content. Please try again.'
                }]
            });
            toast.error('Failed to load help content');
        } finally {
            setLoadingHelp(false);
        }
    };

    // Get course search query for Learn From Us
    const getCourseSearchQuery = () => {
        // Create search query from task title and type
        const keywords = [task.type, ...task.title.split(' ').slice(0, 3)];
        return keywords.join(' ');
    };

    const handleLearnFromUs = () => {
        const searchQuery = getCourseSearchQuery();
        const coursesUrl = `https://gpt-v1-mauve.vercel.app/courses?search=${encodeURIComponent(searchQuery)}`;
        window.open(coursesUrl, '_blank');
    };

    const handleSubmit = async () => {
        if (task.artifactConfig.required && !artifactUrl) {
            toast.error('Please provide the required link');
            return;
        }

        setIsSubmitting(true);
        try {
            await onTaskComplete(projectId, task.taskId, {
                artifactUrl,
                secondaryUrl,
                notes,
            });
            setShowSubmit(false);
            setArtifactUrl('');
            setSecondaryUrl('');
            setNotes('');
        } catch (error) {
            toast.error(error.message || 'Failed to submit task');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusColor = () => {
        switch (task.status) {
            case 'completed':
                return 'from-green-500 to-emerald-500';
            case 'active':
            case 'reopened':
                return 'from-blue-500 to-cyan-500';
            case 'locked':
                return 'from-gray-400 to-gray-500';
            default:
                return 'from-gray-300 to-gray-400';
        }
    };

    const getStatusIcon = () => {
        switch (task.status) {
            case 'completed':
                return <CheckCircle className="h-6 w-6 text-white" />;
            case 'active':
            case 'reopened':
                return <Circle className="h-6 w-6 text-white" />;
            case 'locked':
                return <Lock className="h-6 w-6 text-white" />;
            default:
                return <Circle className="h-6 w-6 text-white" />;
        }
    };

    return (
        <div className="relative group">
            {/* Gradient border effect */}
            <div className={`absolute inset-0 bg-gradient-to-r ${getStatusColor()} rounded-2xl blur-sm opacity-30 group-hover:opacity-50 transition-opacity`}></div>

            <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6 border border-gray-200 dark:border-slate-700">
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                    <div className={`flex-shrink-0 p-3 rounded-xl bg-gradient-to-br ${getStatusColor()} shadow-lg shadow-emerald-500/15`}>
                        {getStatusIcon()}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                                {task.title}
                            </h3>
                            <span className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r ${getStatusColor()} text-white shadow-md`}>
                                {task.status === 'completed' ? '✓ Done' :
                                    task.status === 'active' ? '⚡ Active' :
                                        task.status === 'locked' ? '🔒 Locked' :
                                            task.status}
                            </span>
                        </div>

                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                            {task.description}
                        </p>

                        <div className="flex flex-wrap gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-semibold">
                                <Lightbulb className="h-3.5 w-3.5" />
                                {task.type}
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-lg text-xs font-semibold">
                                <Clock className="h-3.5 w-3.5" />
                                {task.estimatedTime}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Learning Points */}
                {task.learningPoints?.length > 0 && (
                    <div className="mb-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                        <div className="flex items-center gap-2 mb-3">
                            <Book className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            <p className="font-bold text-emerald-900 dark:text-emerald-300">What you'll learn</p>
                        </div>
                        <ul className="space-y-2">
                            {task.learningPoints.map((point, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                    <span className="text-emerald-600 dark:text-emerald-400 mt-0.5">•</span>
                                    <span>{point}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Resources */}
                {task.resources?.length > 0 && (
                    <div className="mb-4 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl border border-teal-200 dark:border-teal-800">
                        <div className="flex items-center gap-2 mb-3">
                            <ExternalLink className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                            <p className="font-bold text-teal-900 dark:text-teal-300">Resources</p>
                        </div>
                        <div className="space-y-2">
                            {task.resources.map((resource, idx) => (
                                <a
                                    key={idx}
                                    href={resource}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-teal-700 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-200 hover:underline transition-colors group/link"
                                >
                                    <LinkIcon className="h-4 w-4 flex-shrink-0 group-hover/link:scale-110 transition-transform" />
                                    <span className="truncate">{resource}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                )}

                {/* Completed Task Info */}
                {task.status === 'completed' && task.submission && (
                    <div className="mb-4 p-5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-2 border-green-300 dark:border-green-700 shadow-inner">
                        <div className="flex items-center gap-2 mb-3">
                            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                            <p className="font-bold text-green-800 dark:text-green-300 text-lg">
                                Completed on {new Date(task.submission.submittedAt).toLocaleDateString('en-US', {
                                    month: 'long', day: 'numeric', year: 'numeric'
                                })}
                            </p>
                        </div>
                        {task.submission.artifactUrl && (
                            <div className="mb-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Submitted Link:</p>
                                <a
                                    href={task.submission.artifactUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline break-all"
                                >
                                    <ExternalLink className="h-4 w-4 flex-shrink-0" />
                                    {task.submission.artifactUrl}
                                </a>
                            </div>
                        )}
                        {task.submission.notes && (
                            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    <strong className="text-gray-900 dark:text-white">Notes:</strong> {task.submission.notes}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Help and Learn Buttons */}
                {(task.status === 'active' || task.status === 'reopened' || task.status === 'completed') && (
                    <div className="mb-4 flex gap-3">
                        <Button
                            onClick={fetchTaskHelp}
                            disabled={loadingHelp}
                            variant="outline"
                            className="flex-1 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 font-semibold"
                        >
                            <HelpCircle className="h-4 w-4 mr-2" />
                            {loadingHelp ? 'Loading...' : 'Help'}
                        </Button>
                        <Button
                            onClick={() => toast('🚀 Coming Soon! Stay Connected', {
                                icon: '📚',
                                style: {
                                    background: '#0ea5e9',
                                    color: '#fff',
                                    fontWeight: 'bold'
                                }
                            })}
                            variant="outline"
                            className="flex-1 border-2 border-teal-500 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 font-semibold"
                        >
                            <GraduationCap className="h-4 w-4 mr-2" />
                            Learn From Us
                        </Button>
                    </div>
                )}

                {/* Help Modal */}
                {showHelp && ReactDOM.createPortal(
                    <div
                        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                        onClick={() => setShowHelp(false)}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            zIndex: 99999
                        }}
                    >
                        <div
                            className="rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden relative border-2 border-gray-300"
                            onClick={(e) => e.stopPropagation()}
                            style={{ backgroundColor: '#ffffff' }}
                        >
                            {loadingHelp ? (
                                <div className="p-12 text-center" style={{ backgroundColor: '#ffffff' }}>
                                    <div className="animate-spin h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                                    <p className="text-gray-700" style={{ color: '#374151' }}>Loading help content...</p>
                                </div>
                            ) : taskHelp ? (
                                <>
                                    {/* Modal Header */}
                                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-2xl font-bold mb-1">Task Help</h3>
                                                <p className="text-blue-100">{task.title}</p>
                                            </div>
                                            <button
                                                onClick={() => setShowHelp(false)}
                                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                            >
                                                <X className="h-6 w-6" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Tab Navigation */}
                                    <div className="border-b border-gray-200" style={{ backgroundColor: '#ffffff' }}>
                                        <div className="flex">
                                            <button
                                                onClick={() => setHelpTab('commands')}
                                                className={`flex-1 px-6 py-4 font-semibold transition-colors ${helpTab === 'commands'
                                                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                                                    : 'text-gray-600 hover:text-gray-900'
                                                    }`}
                                            >
                                                <Terminal className="h-5 w-5 inline mr-2" />
                                                Commands
                                            </button>
                                            <button
                                                onClick={() => setHelpTab('guide')}
                                                className={`flex-1 px-6 py-4 font-semibold transition-colors ${helpTab === 'guide'
                                                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                                                    : 'text-gray-600 hover:text-gray-900'
                                                    }`}
                                            >
                                                <FileText className="h-5 w-5 inline mr-2" />
                                                Step-by-Step Guide
                                            </button>
                                        </div>
                                    </div>

                                    {/* Tab Content */}
                                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]" style={{ backgroundColor: '#ffffff' }}>
                                        {helpTab === 'commands' && (
                                            <div className="space-y-4">
                                                <h4 className="text-lg font-bold text-gray-900 mb-4">Commands & Code Snippets</h4>
                                                {taskHelp.commands && taskHelp.commands.length > 0 ? (
                                                    <div className="space-y-3">
                                                        {taskHelp.commands.map((cmd, idx) => (
                                                            <div key={idx} className="bg-gray-900 rounded-lg p-4 relative group">
                                                                {cmd.description && (
                                                                    <p className="text-gray-400 text-sm mb-2">{cmd.description}</p>
                                                                )}
                                                                <pre className="text-green-400 font-mono text-sm overflow-x-auto pr-12">
                                                                    {cmd.command || cmd}
                                                                </pre>
                                                                <button
                                                                    onClick={() => copyToClipboard(cmd.command || cmd, `cmd-${idx}`)}
                                                                    className="absolute top-4 right-4 p-1.5 bg-gray-800 hover:bg-gray-700 rounded-md transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center"
                                                                    title="Copy command"
                                                                >
                                                                    {copiedIndex === `cmd-${idx}` ? (
                                                                        <Check className="h-3.5 w-3.5 text-green-400" />
                                                                    ) : (
                                                                        <Copy className="h-3.5 w-3.5 text-gray-400" />
                                                                    )}
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-gray-500 italic">No commands available for this task.</p>
                                                )}
                                            </div>
                                        )}

                                        {helpTab === 'guide' && (
                                            <div className="space-y-4">
                                                <h4 className="text-lg font-bold text-gray-900 mb-4">Step-by-Step Guide</h4>
                                                {taskHelp.steps && taskHelp.steps.length > 0 ? (
                                                    <div className="space-y-4">
                                                        {taskHelp.steps.map((step, idx) => (
                                                            <div key={idx} className="flex gap-4">
                                                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                                                                    {idx + 1}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <h5 className="font-bold text-gray-900 mb-2">
                                                                        {step.title || `Step ${idx + 1}`}
                                                                    </h5>
                                                                    <p className="text-gray-700 leading-relaxed">
                                                                        {step.description || step}
                                                                    </p>
                                                                    {step.code && (
                                                                        <div className="mt-2 bg-gray-900 rounded-lg p-3 relative group/code">
                                                                            <pre className="text-green-400 font-mono text-sm overflow-x-auto pr-12">
                                                                                {step.code}
                                                                            </pre>
                                                                            <button
                                                                                onClick={() => copyToClipboard(step.code, `step-${idx}`)}
                                                                                className="absolute top-3 right-3 p-1.5 bg-gray-800 hover:bg-gray-700 rounded-md transition-all opacity-0 group-hover/code:opacity-100 flex items-center justify-center"
                                                                                title="Copy code"
                                                                            >
                                                                                {copiedIndex === `step-${idx}` ? (
                                                                                    <Check className="h-3.5 w-3.5 text-green-400" />
                                                                                ) : (
                                                                                    <Copy className="h-3.5 w-3.5 text-gray-400" />
                                                                                )}
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-gray-500 italic">No step-by-step guide available for this task.</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="p-12 text-center">
                                    <p className="text-gray-600 dark:text-gray-400">No help content available.</p>
                                </div>
                            )}
                        </div>
                    </div>,
                    document.body
                )}

                {/* Action Buttons */}
                {(task.status === 'active' || task.status === 'reopened') && (
                    <div className="space-y-4">
                        {!showSubmit ? (
                            <Button
                                onClick={() => setShowSubmit(true)}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all text-white font-bold py-3"
                            >
                                📤 Submit Journal
                            </Button>
                        ) : (
                            <div className="space-y-4 p-5 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-600">
                                <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-3">Submit Your Work</h4>

                                <div>
                                    <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                                        {task.artifactConfig.label} {task.artifactConfig.required && <span className="text-red-500">*</span>}
                                    </label>
                                    <input
                                        type="url"
                                        placeholder={task.artifactConfig.placeholder}
                                        value={artifactUrl}
                                        onChange={(e) => setArtifactUrl(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                        required={task.artifactConfig.required}
                                    />
                                    {task.artifactConfig.helpText && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-start gap-1">
                                            <Lightbulb className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                                            {task.artifactConfig.helpText}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                                        Notes (Optional)
                                    </label>
                                    <textarea
                                        placeholder="Share your thoughts, challenges, or learnings..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 min-h-[100px] focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all text-white font-bold py-3"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="animate-spin mr-2">⏳</span>
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="h-5 w-5 mr-2" />
                                                Submit
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowSubmit(false)}
                                        className="flex-1 border-2 hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold py-3"
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Locked State */}
                {task.status === 'locked' && (
                    <div className="p-6 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-xl text-center border-2 border-gray-300 dark:border-gray-600">
                        <Lock className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                        <p className="text-gray-600 dark:text-gray-400 font-semibold">
                            Complete previous tasks to unlock this one
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskCard;
