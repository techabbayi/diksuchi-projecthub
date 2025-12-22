import React from 'react';
import { Label } from '../ui/Label';

const PREDEFINED_STACKS = [
    { value: 'MERN Stack', label: 'MERN Stack', desc: 'MongoDB, Express, React, Node.js' },
    { value: 'MEAN Stack', label: 'MEAN Stack', desc: 'MongoDB, Express, Angular, Node.js' },
    { value: 'Next.js Full Stack', label: 'Next.js Full Stack', desc: 'Next.js 14, MongoDB/PostgreSQL' },
    { value: 'Python Django', label: 'Python Django', desc: 'Django, PostgreSQL, React' },
    { value: 'Python Flask', label: 'Python Flask', desc: 'Flask, SQLite/PostgreSQL, React' },
    { value: 'Java Spring Boot', label: 'Java Spring Boot', desc: 'Spring Boot, MySQL, React/Angular' },
    { value: 'LAMP Stack', label: 'LAMP Stack', desc: 'Linux, Apache, MySQL, PHP' },
    { value: 'JAMstack', label: 'JAMstack', desc: 'Next.js, Headless CMS, APIs' },
    { value: 'React Native', label: 'Mobile - React Native', desc: 'React Native, Expo' },
    { value: 'Flutter', label: 'Mobile - Flutter', desc: 'Flutter, Dart' },
    { value: 'AI/ML Python', label: 'AI/ML - Python', desc: 'TensorFlow, FastAPI, Python' },
    { value: 'Blockchain Web3', label: 'Blockchain - Web3', desc: 'Solidity, Hardhat, React' },
];

const StepThree = ({ formData, setFormData }) => {
    const [useCustom, setUseCustom] = React.useState(false);

    const handleStackSelect = (stack) => {
        setFormData({
            ...formData,
            techStack: {
                predefined: stack,
                custom: [],
                frontend: [],
                backend: [],
                database: [],
                others: [],
            },
        });
    };

    const handleCustomStack = (field, value) => {
        const values = value.split(',').map(v => v.trim()).filter(v => v);
        setFormData({
            ...formData,
            techStack: {
                ...formData.techStack,
                predefined: null,
                [field]: values,
            },
        });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h2 className="text-3xl font-bold mb-2">Choose Your Tech Stack</h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Select a predefined stack or create your own
                </p>
            </div>

            <div className="flex gap-4 mb-6">
                <button
                    type="button"
                    onClick={() => setUseCustom(false)}
                    className={`px-6 py-2 rounded-lg font-semibold transition-all ${!useCustom
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                >
                    Predefined Stacks
                </button>
                <button
                    type="button"
                    onClick={() => setUseCustom(true)}
                    className={`px-6 py-2 rounded-lg font-semibold transition-all ${useCustom
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                >
                    Custom Stack
                </button>
            </div>

            {!useCustom ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {PREDEFINED_STACKS.map((stack) => (
                        <div
                            key={stack.value}
                            onClick={() => handleStackSelect(stack.value)}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${formData.techStack?.predefined === stack.value
                                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                                }`}
                        >
                            <h3 className="font-bold mb-1">{stack.label}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{stack.desc}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-4 bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                    <div className="space-y-2">
                        <Label htmlFor="frontend">Frontend Technologies</Label>
                        <input
                            id="frontend"
                            type="text"
                            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                            placeholder="e.g., React, Vue, Angular (comma separated)"
                            value={formData.techStack?.frontend?.join(', ') || ''}
                            onChange={(e) => handleCustomStack('frontend', e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="backend">Backend Technologies</Label>
                        <input
                            id="backend"
                            type="text"
                            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                            placeholder="e.g., Node.js, Python, Java (comma separated)"
                            value={formData.techStack?.backend?.join(', ') || ''}
                            onChange={(e) => handleCustomStack('backend', e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="database">Database</Label>
                        <input
                            id="database"
                            type="text"
                            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                            placeholder="e.g., MongoDB, PostgreSQL, MySQL (comma separated)"
                            value={formData.techStack?.database?.join(', ') || ''}
                            onChange={(e) => handleCustomStack('database', e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="others">Other Tools/Technologies</Label>
                        <input
                            id="others"
                            type="text"
                            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                            placeholder="e.g., Redis, AWS, Docker (comma separated)"
                            value={formData.techStack?.others?.join(', ') || ''}
                            onChange={(e) => handleCustomStack('others', e.target.value)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default StepThree;
