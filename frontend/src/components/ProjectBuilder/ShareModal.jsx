import React from 'react';

const ShareModal = ({ achievement, projectName, onClose }) => {
    const achievementMessages = {
        'first-task': `Just completed my first task in ${projectName}! 🎯`,
        'milestone-completed': `Reached another milestone in ${projectName}! 🏆`,
        'project-started': `Started building ${projectName} on ProjectHUB! 🚀`,
        'halfway': `50% done with ${projectName}! Halfway there! 🎉`,
        'project-completed': `Successfully completed ${projectName}! 🎊 Check it out!`,
        'week-streak': `7 days streak working on ${projectName}! 🔥`,
        'fast-learner': `Completed ${projectName} ahead of schedule! ⚡`,
    };

    const message = achievementMessages[achievement.type] || `Making progress on ${projectName}!`;
    const hashtags = ['ProjectHUB', 'LearnAndBuild', 'Coding', 'WebDevelopment'];

    const shareToTwitter = () => {
        const text = encodeURIComponent(`${message}\n\n${hashtags.map(h => `#${h}`).join(' ')}`);
        const url = `https://twitter.com/intent/tweet?text=${text}`;
        window.open(url, '_blank', 'width=600,height=400');
    };

    const shareToLinkedIn = () => {
        const text = encodeURIComponent(message);
        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&summary=${text}`;
        window.open(url, '_blank', 'width=600,height=600');
    };

    const shareToFacebook = () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(message)}`;
        window.open(url, '_blank', 'width=600,height=400');
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(message);
        alert('Message copied to clipboard!');
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-8 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Share Your Achievement</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl"
                    >
                        ×
                    </button>
                </div>

                <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{message}</p>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={shareToTwitter}
                        className="w-full px-6 py-3 bg-[#1DA1F2] text-white rounded-lg font-semibold hover:bg-[#1a8cd8] transition-all flex items-center justify-center gap-3"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                        </svg>
                        Share on Twitter
                    </button>

                    <button
                        onClick={shareToLinkedIn}
                        className="w-full px-6 py-3 bg-[#0A66C2] text-white rounded-lg font-semibold hover:bg-[#004182] transition-all flex items-center justify-center gap-3"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                        Share on LinkedIn
                    </button>

                    <button
                        onClick={shareToFacebook}
                        className="w-full px-6 py-3 bg-[#1877F2] text-white rounded-lg font-semibold hover:bg-[#166fe5] transition-all flex items-center justify-center gap-3"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        Share on Facebook
                    </button>

                    <button
                        onClick={copyToClipboard}
                        className="w-full px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all flex items-center justify-center gap-3"
                    >
                        📋 Copy Message
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
