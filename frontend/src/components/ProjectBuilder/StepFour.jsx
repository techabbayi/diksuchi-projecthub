import React from 'react';
import { Label } from '../ui/Label';

const COMPLEXITY_LEVELS = [
    { value: 'basic', label: 'Basic', desc: 'CRUD operations, simple UI', icon: '📝' },
    { value: 'intermediate', label: 'Intermediate', desc: 'Auth + API + Database', icon: '⚙️' },
    { value: 'advanced', label: 'Advanced', desc: 'Real-time, Payments, Complex logic', icon: '🚀' },
    { value: 'production', label: 'Production-Ready', desc: 'CI/CD, Testing, Deployment', icon: '🏆' },
];

const FEATURE_OPTIONS = [
    'User Authentication (Login/Register)',
    'File Upload/Storage',
    'Payment Integration',
    'Real-time Features (Chat/Notifications)',
    'Admin Dashboard',
    'API Integration (Third-party)',
    'Search & Filters',
    'Email Notifications',
    'Social Media Login',
    'Dark Mode',
];

const StepFour = ({ formData, setFormData }) => {
    const handleComplexitySelect = (complexity) => {
        setFormData({ ...formData, complexity });
    };

    const handleFeatureToggle = (feature) => {
        const features = formData.features || [];
        const updatedFeatures = features.includes(feature)
            ? features.filter((f) => f !== feature)
            : [...features, feature];
        setFormData({ ...formData, features: updatedFeatures });
    };

    const handleCustomFeature = (e) => {
        if (e.key === 'Enter' && e.target.value.trim()) {
            const features = formData.features || [];
            setFormData({
                ...formData,
                features: [...features, e.target.value.trim()],
            });
            e.target.value = '';
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h2 className="text-3xl font-bold mb-2">Project Complexity & Features</h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Define the scope of your project
                </p>
            </div>

            <div className="space-y-4">
                <Label>Select Project Complexity *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {COMPLEXITY_LEVELS.map((level) => (
                        <div
                            key={level.value}
                            onClick={() => handleComplexitySelect(level.value)}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${formData.complexity === level.value
                                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                                }`}
                        >
                            <div className="flex items-start space-x-3">
                                <span className="text-3xl">{level.icon}</span>
                                <div>
                                    <h3 className="font-bold">{level.label}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {level.desc}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <Label>Key Features (Select multiple)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {FEATURE_OPTIONS.map((feature) => (
                        <div
                            key={feature}
                            onClick={() => handleFeatureToggle(feature)}
                            className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${(formData.features || []).includes(feature)
                                    ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                                }`}
                        >
                            <div className="flex items-center space-x-2">
                                <div
                                    className={`w-5 h-5 rounded border-2 flex items-center justify-center ${(formData.features || []).includes(feature)
                                            ? 'border-green-600 bg-green-600'
                                            : 'border-gray-300'
                                        }`}
                                >
                                    {(formData.features || []).includes(feature) && (
                                        <span className="text-white text-xs">✓</span>
                                    )}
                                </div>
                                <span className="text-sm">{feature}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4">
                    <input
                        type="text"
                        className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                        placeholder="Add custom feature (press Enter)"
                        onKeyDown={handleCustomFeature}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                        Type a custom feature and press Enter to add
                    </p>
                </div>

                {(formData.features || []).filter(f => !FEATURE_OPTIONS.includes(f)).length > 0 && (
                    <div className="mt-4">
                        <p className="text-sm font-semibold mb-2">Custom Features:</p>
                        <div className="flex flex-wrap gap-2">
                            {(formData.features || [])
                                .filter(f => !FEATURE_OPTIONS.includes(f))
                                .map((feature, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm"
                                    >
                                        {feature}
                                    </span>
                                ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StepFour;
