import { useEffect, useState } from 'react';
import { X, Download, CheckCircle, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DownloadModal = ({ isOpen, onClose, projectTitle, onDownloadComplete }) => {
    const [countdown, setCountdown] = useState(3);
    const [downloading, setDownloading] = useState(false);
    const [completed, setCompleted] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            // Reset state when modal closes
            setCountdown(3);
            setDownloading(false);
            setCompleted(false);
            return;
        }

        // Start countdown
        if (countdown > 0 && !downloading) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }

        // Trigger download when countdown reaches 0
        if (countdown === 0 && !downloading) {
            setDownloading(true);
            onDownloadComplete();

            // Show completion message
            setTimeout(() => {
                setCompleted(true);
                // Auto-close after 15 seconds of showing completion
                setTimeout(() => {
                    onClose();
                }, 15000);
            }, 500);
        }
    }, [isOpen, countdown, downloading, onDownloadComplete, onClose]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-emerald-500/20"
                >
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors z-10 flex items-center justify-center"
                        aria-label="Close"
                    >
                        <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </button>

                    {/* Header with gradient */}
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-8 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-4">
                            {completed ? (
                                <CheckCircle className="h-10 w-10 text-white" />
                            ) : (
                                <Download className="h-10 w-10 text-white animate-bounce" />
                            )}
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">
                            {completed ? 'Download Complete!' : downloading ? 'Downloading...' : 'Preparing Download'}
                        </h2>
                        <p className="text-white/90 text-sm">
                            {projectTitle}
                        </p>
                    </div>

                    {/* Content */}
                    <div className="p-8 space-y-6">
                        {!completed ? (
                            <>
                                {/* Countdown timer */}
                                {countdown > 0 && (
                                    <div className="text-center">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-3">
                                            <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                                                {countdown}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Download will start automatically...
                                        </p>
                                    </div>
                                )}

                                {/* Downloading state */}
                                {downloading && (
                                    <div className="text-center">
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4 overflow-hidden">
                                            <motion.div
                                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                                                initial={{ width: '0%' }}
                                                animate={{ width: '100%' }}
                                                transition={{ duration: 0.5 }}
                                            />
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Please wait...
                                        </p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                {/* Success message */}
                                <div className="text-center space-y-4">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                                        <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                            Thanks for downloading!
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                            Your download should start automatically. If not, please check your downloads folder.
                                        </p>
                                    </div>

                                    {/* Contact info */}
                                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-lg p-4 border border-emerald-200/50 dark:border-emerald-800/50">
                                        <div className="flex items-center justify-center gap-2 text-sm text-gray-700 dark:text-gray-300 mb-2">
                                            <Mail className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                            <span className="font-medium">Need help?</span>
                                        </div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 text-center mb-1">
                                            Feel free to ask any queries via email
                                        </p>
                                        <a
                                            href="mailto:diksuchielearning@gmail.com"
                                            className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors text-center block"
                                        >
                                            diksuchielearning@gmail.com
                                        </a>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Branding */}
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                                <span className="font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                    ProjectHub
                                </span>
                                {' '}powered by{' '}
                                <a
                                    href="https://diksuchi-landing.vercel.app"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-semibold text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors underline decoration-dotted underline-offset-2"
                                >
                                    diksuchi
                                </a>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default DownloadModal;
