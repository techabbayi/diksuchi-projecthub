import React from 'react';
import { Label } from '../ui/Label';

const LEARNING_STYLES = [
    { value: 'video', label: '🎥 Video tutorials + Code' },
    { value: 'written', label: '📝 Written docs + Examples' },
    { value: 'code-first', label: '💻 Code-first (learn by doing)' },
    { value: 'mixed', label: '🎯 Mixed (all formats)' },
];

const HELP_NEEDED = [
    'Project structure/architecture',
    'Best practices & design patterns',
    'Testing & debugging',
    'Deployment & DevOps',
    'All of the above',
];

const StepSix = ({ formData, setFormData }) => {
    const handleStyleSelect = (style) => {
        setFormData({ ...formData, learningStyle: style });
    };

    const handleHelpToggle = (help) => {
        const helpNeeded = formData.helpNeeded || [];
        const updated = helpNeeded.includes(help)
            ? helpNeeded.filter((h) => h !== help)
            : [...helpNeeded, help];
        setFormData({ ...formData, helpNeeded: updated });
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div>
                <h2 className="text-3xl font-bold mb-2">Learning Preferences</h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Customize your learning experience
                </p>
            </div>

            <div className="space-y-4">
                <Label>Preferred learning style *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {LEARNING_STYLES.map((style) => (
                        <div
                            key={style.value}
                            onClick={() => handleStyleSelect(style.value)}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${formData.learningStyle === style.value
                                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                                }`}
                        >
                            <p className="font-semibold">{style.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <Label>I need help with (Select multiple)</Label>
                <div className="space-y-3">
                    {HELP_NEEDED.map((help) => (
                        <div
                            key={help}
                            onClick={() => handleHelpToggle(help)}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${(formData.helpNeeded || []).includes(help)
                                    ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                                }`}
                        >
                            <div className="flex items-center space-x-3">
                                <div
                                    className={`w-5 h-5 rounded border-2 flex items-center justify-center ${(formData.helpNeeded || []).includes(help)
                                            ? 'border-green-600 bg-green-600'
                                            : 'border-gray-300'
                                        }`}
                                >
                                    {(formData.helpNeeded || []).includes(help) && (
                                        <span className="text-white text-xs">✓</span>
                                    )}
                                </div>
                                <span>{help}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-blue-800 dark:text-blue-200">
                    💡 <strong>Learn & Build Concept:</strong> Our AI will create a comprehensive guide
                    that focuses on teaching you WHY and HOW, not just WHAT. You'll understand the
                    concepts while building your project!
                </p>
            </div>
        </div>
    );
};

export default StepSix;
