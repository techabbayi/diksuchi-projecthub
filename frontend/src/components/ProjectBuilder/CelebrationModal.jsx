import React from 'react';
import confetti from 'canvas-confetti';

const CelebrationModal = ({ achievement, onClose, onShare }) => {
    React.useEffect(() => {
        // Trigger confetti
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }, []);

    const achievementData = {
        'first-task': {
            title: '🎯 First Task Complete!',
            message: 'Great start! You\'ve completed your first task. Keep the momentum going!',
            icon: '🎯',
            color: 'from-blue-500 to-blue-600'
        },
        'milestone-completed': {
            title: '🏆 Milestone Achieved!',
            message: 'Amazing progress! You\'ve completed a major milestone in your project!',
            icon: '🏆',
            color: 'from-yellow-500 to-orange-500'
        },
        'project-started': {
            title: '🚀 Project Started!',
            message: 'Your learning journey begins! Excited to see what you\'ll build!',
            icon: '🚀',
            color: 'from-green-500 to-emerald-600'
        },
        'halfway': {
            title: '🎉 Halfway There!',
            message: 'You\'re 50% done! The finish line is in sight. Keep pushing!',
            icon: '🎉',
            color: 'from-purple-500 to-pink-500'
        },
        'project-completed': {
            title: '🎊 Project Completed!',
            message: 'Congratulations! You\'ve successfully completed your project. Time to celebrate! 🎊🎉',
            icon: '🎊',
            color: 'from-red-500 to-pink-600'
        },
        'week-streak': {
            title: '🔥 Week Streak!',
            message: '7 days of consistent work! You\'re on fire!',
            icon: '🔥',
            color: 'from-orange-500 to-red-500'
        },
        'fast-learner': {
            title: '⚡ Fast Learner!',
            message: 'You\'re ahead of schedule! Impressive speed!',
            icon: '⚡',
            color: 'from-cyan-500 to-blue-500'
        }
    };

    const data = achievementData[achievement.type] || achievementData['first-task'];

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-8 shadow-2xl animate-bounce-in">
                <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${data.color} flex items-center justify-center text-5xl mx-auto mb-6`}>
                    {data.icon}
                </div>

                <h2 className="text-3xl font-bold text-center mb-4">
                    {data.title}
                </h2>

                <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
                    {data.message}
                </p>

                <div className="space-y-3">
                    <button
                        onClick={onShare}
                        className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
                    >
                        🎉 Share Achievement
                    </button>

                    <button
                        onClick={onClose}
                        className="w-full px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                    >
                        Continue Building
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CelebrationModal;
