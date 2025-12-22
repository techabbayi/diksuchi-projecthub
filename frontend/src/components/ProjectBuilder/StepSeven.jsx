import React from 'react';
import { Button } from '../ui/Button';

const StepSeven = ({ formData, onEdit }) => {
    const getTechStackDisplay = () => {
        const ts = formData.techStack || {};
        if (ts.predefined) return ts.predefined;

        const parts = [];
        if (ts.frontend?.length) parts.push(`Frontend: ${ts.frontend.join(', ')}`);
        if (ts.backend?.length) parts.push(`Backend: ${ts.backend.join(', ')}`);
        if (ts.database?.length) parts.push(`Database: ${ts.database.join(', ')}`);
        if (ts.others?.length) parts.push(`Others: ${ts.others.join(', ')}`);

        return parts.join(' | ') || 'Not specified';
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">Review Your Project</h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Make sure everything looks good before generating your guide
                </p>
            </div>

            <div className="space-y-6 bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                <div className="border-b pb-4 dark:border-gray-700">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold">Project Details</h3>
                        <Button variant="outline" size="sm" onClick={() => onEdit(1)}>
                            Edit
                        </Button>
                    </div>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                        {formData.projectName}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                        {formData.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm">
                            {formData.motivation}
                        </span>
                        {formData.targetAudience && (
                            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm">
                                Target: {formData.targetAudience}
                            </span>
                        )}
                    </div>
                </div>

                <div className="border-b pb-4 dark:border-gray-700">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold">Tech Stack</h3>
                        <Button variant="outline" size="sm" onClick={() => onEdit(3)}>
                            Edit
                        </Button>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                        {getTechStackDisplay()}
                    </p>
                </div>

                <div className="border-b pb-4 dark:border-gray-700">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold">Project Scope</h3>
                        <Button variant="outline" size="sm" onClick={() => onEdit(4)}>
                            Edit
                        </Button>
                    </div>
                    <p className="mb-2">
                        <strong>Complexity:</strong>{' '}
                        <span className="capitalize">{formData.complexity}</span>
                    </p>
                    {formData.features?.length > 0 && (
                        <div>
                            <strong>Features:</strong>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {formData.features.slice(0, 6).map((feature, idx) => (
                                    <span
                                        key={idx}
                                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-sm"
                                    >
                                        {feature}
                                    </span>
                                ))}
                                {formData.features.length > 6 && (
                                    <span className="px-2 py-1 text-sm text-gray-600">
                                        +{formData.features.length - 6} more
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="border-b pb-4 dark:border-gray-700">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold">Time & Skill</h3>
                        <Button variant="outline" size="sm" onClick={() => onEdit(5)}>
                            Edit
                        </Button>
                    </div>
                    <div className="space-y-1 text-gray-700 dark:text-gray-300">
                        <p>
                            <strong>Total Time:</strong> {formData.totalTimeEstimate}
                        </p>
                        <p>
                            <strong>Daily Commitment:</strong> {formData.dailyTimeCommitment}
                        </p>
                        {formData.deadline && (
                            <p>
                                <strong>Deadline:</strong> {new Date(formData.deadline).toLocaleDateString()}
                            </p>
                        )}
                        <p>
                            <strong>Skill Level:</strong>{' '}
                            <span className="capitalize">{formData.skillLevel}</span>
                        </p>
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold">Learning Preferences</h3>
                        <Button variant="outline" size="sm" onClick={() => onEdit(6)}>
                            Edit
                        </Button>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                        <strong>Style:</strong> {formData.learningStyle}
                    </p>
                    {formData.helpNeeded?.length > 0 && (
                        <p className="text-gray-700 dark:text-gray-300">
                            <strong>Help with:</strong> {formData.helpNeeded.join(', ')}
                        </p>
                    )}
                </div>
            </div>

            <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
                <h3 className="font-bold text-lg mb-2">🎉 Ready to Generate Your Guide!</h3>
                <p className="text-gray-700 dark:text-gray-300">
                    Our AI will create a comprehensive project guide with:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-gray-700 dark:text-gray-300">
                    <li>Complete README with learning objectives</li>
                    <li>Folder structure and file organization</li>
                    <li>Step-by-step task roadmap</li>
                    <li>Configuration guides and setup instructions</li>
                    <li>Learning resources for each task</li>
                </ul>
            </div>
        </div>
    );
};

export default StepSeven;
