import React from 'react';

const STEPS = [
    'Purpose',
    'Tech Knowledge',
    'Tech Stack',
    'Features',
    'Time Plan',
    'Learning',
    'Preview'
];

const StepIndicator = ({ currentStep }) => {
    return (
        <div className="w-full py-8 px-4">
            <div className="flex items-center max-w-5xl mx-auto">
                {STEPS.map((step, index) => (
                    <React.Fragment key={index}>
                        <div className="flex flex-col items-center relative">
                            <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all z-10 ${index + 1 < currentStep
                                    ? 'bg-green-600 dark:bg-green-700 text-white shadow-md'
                                    : index + 1 === currentStep
                                        ? 'bg-green-600 dark:bg-green-700 text-white ring-4 ring-green-200 dark:ring-green-900 shadow-lg scale-110'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                                    }`}
                            >
                                {index + 1 < currentStep ? '✓' : index + 1}
                            </div>
                            <span className={`text-xs mt-2 font-medium transition-all whitespace-nowrap ${index + 1 === currentStep ? 'font-bold text-green-700 dark:text-green-400' : index + 1 < currentStep ? 'text-green-600 dark:text-green-500' : 'text-gray-500 dark:text-gray-400'}`}>
                                {step}
                            </span>
                        </div>
                        {index < STEPS.length - 1 && (
                            <div className="flex-1 flex items-center px-1">
                                <div
                                    className={`w-full h-1.5 rounded-full transition-all ${index + 1 < currentStep ? 'bg-green-600 dark:bg-green-700 shadow-sm' : 'bg-gray-200 dark:bg-gray-700'
                                        }`}
                                />
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default StepIndicator;
