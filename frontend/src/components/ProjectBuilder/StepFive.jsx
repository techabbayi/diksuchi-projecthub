import React from 'react';
import { Label } from '../ui/Label';

const TIME_OPTIONS = [
    { value: '1-2 weeks', label: '1-2 weeks', icon: '⚡' },
    { value: '2-4 weeks', label: '2-4 weeks', icon: '📅' },
    { value: '1-2 months', label: '1-2 months', icon: '📆' },
    { value: '2-3 months', label: '2-3 months', icon: '🗓️' },
    { value: '3+ months', label: '3+ months', icon: '⏰' },
];

const DAILY_TIME = [
    { value: '1-2 hours', label: '1-2 hours/day', icon: '⏱️' },
    { value: '2-4 hours', label: '2-4 hours/day', icon: '⏲️' },
    { value: '4-6 hours', label: '4-6 hours/day', icon: '⏳' },
    { value: '6+ hours', label: '6+ hours/day (Full-time)', icon: '🕐' },
];

const SKILL_LEVELS = [
    { value: 'beginner', label: 'Beginner', desc: 'Never used this stack' },
    { value: 'intermediate', label: 'Intermediate', desc: 'Built 1-2 projects' },
    { value: 'advanced', label: 'Advanced', desc: 'Professional experience' },
];

const StepFive = ({ formData, setFormData }) => {
    const [hasDeadline, setHasDeadline] = React.useState(false);

    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h2 className="text-3xl font-bold mb-2">Time Investment & Skill Level</h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Help us create a realistic timeline
                </p>
            </div>

            <div className="space-y-4">
                <Label>How much total time can you dedicate? *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {TIME_OPTIONS.map((option) => (
                        <div
                            key={option.value}
                            onClick={() => handleChange('totalTimeEstimate', option.value)}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all text-center ${formData.totalTimeEstimate === option.value
                                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                                }`}
                        >
                            <div className="text-3xl mb-2">{option.icon}</div>
                            <p className="text-sm font-semibold">{option.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <Label>How much time per day? *</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {DAILY_TIME.map((option) => (
                        <div
                            key={option.value}
                            onClick={() => handleChange('dailyTimeCommitment', option.value)}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all text-center ${formData.dailyTimeCommitment === option.value
                                    ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                                }`}
                        >
                            <div className="text-3xl mb-2">{option.icon}</div>
                            <p className="text-sm font-semibold">{option.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center space-x-3">
                    <input
                        type="checkbox"
                        id="hasDeadline"
                        checked={hasDeadline}
                        onChange={(e) => setHasDeadline(e.target.checked)}
                        className="w-5 h-5"
                    />
                    <Label htmlFor="hasDeadline">I have a deadline</Label>
                </div>

                {hasDeadline && (
                    <div className="ml-8 space-y-2">
                        <Label htmlFor="deadline">Deadline Date</Label>
                        <input
                            type="date"
                            id="deadline"
                            className="px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                            value={formData.deadline || ''}
                            onChange={(e) => handleChange('deadline', e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <Label>Your skill level with selected tech stack *</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {SKILL_LEVELS.map((level) => (
                        <div
                            key={level.value}
                            onClick={() => handleChange('skillLevel', level.value)}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${formData.skillLevel === level.value
                                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                                }`}
                        >
                            <h3 className="font-bold mb-1">{level.label}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {level.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StepFive;
