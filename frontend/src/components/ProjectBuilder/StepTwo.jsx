import React from 'react';
import { Label } from '../ui/Label';
import { CheckCircle2, Lightbulb, Check, Target } from 'lucide-react';

const StepTwo = ({ formData, setFormData, onShowSuggestions }) => {
    const handleKnowledgeSelect = (knows) => {
        setFormData({ ...formData, knowsTechStack: knows });

        if (!knows) {
            // Show suggestions
            onShowSuggestions();
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 text-center">
            <div>
                <h2 className="text-3xl font-bold mb-2">Do you know what tech stack to use?</h2>
                <p className="text-gray-600 dark:text-gray-400">
                    We'll help you either way!
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <div
                    onClick={() => handleKnowledgeSelect(true)}
                    className={`p-8 border-2 rounded-xl cursor-pointer transition-all ${formData.knowsTechStack === true
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 shadow-lg'
                        : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300'
                        }`}
                >
                    <div className="flex justify-center mb-4">
                        <div className={`p-4 rounded-full ${formData.knowsTechStack === true
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                            }`}>
                            <CheckCircle2 className="h-12 w-12" />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Yes, I know</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        I'll select my own tech stack
                    </p>
                </div>

                <div
                    onClick={() => handleKnowledgeSelect(false)}
                    className={`p-8 border-2 rounded-xl cursor-pointer transition-all ${formData.knowsTechStack === false
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 shadow-lg'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                        }`}
                >
                    <div className="flex justify-center mb-4">
                        <div className={`p-4 rounded-full ${formData.knowsTechStack === false
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                            }`}>
                            <Lightbulb className="h-12 w-12" />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2">No, suggest me</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        Show me project ideas
                    </p>
                </div>
            </div>

            {formData.knowsTechStack === true && (
                <div className="mt-8 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center justify-center gap-2">
                        <Check className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
                        <p className="text-emerald-700 dark:text-emerald-300 font-medium">
                            Great! Continue to select your tech stack
                        </p>
                    </div>
                </div>
            )}

            {formData.knowsTechStack === false && (
                <div className="mt-8 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center justify-center gap-2">
                        <Target className="h-5 w-5 text-purple-700 dark:text-purple-300" />
                        <p className="text-purple-700 dark:text-purple-300 font-medium">
                            We'll show you curated project suggestions!
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StepTwo;
