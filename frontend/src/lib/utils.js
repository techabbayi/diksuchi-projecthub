import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
    return twMerge(clsx(inputs))
}

export const formatCurrency = (amount) => {
    if (amount === 0 || amount === '0') {
        return 'Free';
    }
    return `₹${amount}`;
};

export const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

export const getTierBadgeColor = (tier) => {
    const colors = {
        'Free': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        'Mini': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        'Medium': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
        'Full Stack': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    };
    return colors[tier] || colors['Free'];
};

export const getDifficultyColor = (difficulty) => {
    const colors = {
        'Beginner': 'text-gray-900 bg-blue-300 dark:bg-gray-800 border-2 border-blue-500 dark:border-blue-300 dark:text-blue-300 hover:bg-blue-500',
        'Intermediate': 'bg-orange-400 text-gray-900 border-2 border-orange-500 dark:border-orange-400 dark:text-orange-400 dark:bg-gray-800 hover:bg-orange-500',
        'Advanced': 'bg-red-400 text-black border-2 border-red-500 dark:border-red-400 dark:text-red-400 dark:bg-gray-800 hover:bg-red-500',
    };
    return colors[difficulty] || colors['Beginner'];
};
