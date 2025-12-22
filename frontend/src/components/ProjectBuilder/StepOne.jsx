import React from 'react';
import { Label } from '../ui/Label';
import { Input } from '../ui/Input';
import { GraduationCap, Briefcase, Rocket, BookOpen, DollarSign, Star, Wrench } from 'lucide-react';

const MOTIVATIONS = [
    { value: 'college', label: 'College Project/Assignment', icon: GraduationCap },
    { value: 'portfolio', label: 'Personal Portfolio Showcase', icon: Briefcase },
    { value: 'business', label: 'Business Idea/Startup', icon: Rocket },
    { value: 'learning', label: 'Learning New Technology', icon: BookOpen },
    { value: 'freelance', label: 'Freelance Project', icon: DollarSign },
    { value: 'opensource', label: 'Open Source Contribution', icon: Star },
    { value: 'other', label: 'Other', icon: Wrench },
];

const StepOne = ({ formData, setFormData }) => {
    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    return (
        <div className="max-w-3xl mx-1 space-y-4">
            <div>
                <h2 className="text-2xl lg:text-3xl font-bold mb-2 text-gray-900 dark:text-white">What do you want to build?</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tell us about your project idea</p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="projectName">Project Name *</Label>
                <Input
                    id="projectName"
                    placeholder="e.g., E-Commerce Store, Social Media App"
                    value={formData.projectName || ''}
                    onChange={(e) => handleChange('projectName', e.target.value)}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Project Description * (Min 50 characters)</Label>
                <textarea
                    id="description"
                    className="w-full min-h-[100px] px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                    placeholder="Describe what you want to build and its main features..."
                    value={formData.description || ''}
                    onChange={(e) => handleChange('description', e.target.value)}
                    required
                />
                <p className="text-sm text-gray-500">
                    {(formData.description || '').length} / 50 characters
                </p>
            </div>

            <div className="space-y-2">
                <Label>What's your motivation? *</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {MOTIVATIONS.map((motivation) => {
                        const IconComponent = motivation.icon;
                        return (
                            <div
                                key={motivation.value}
                                onClick={() => handleChange('motivation', motivation.value)}
                                className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${formData.motivation === motivation.value
                                    ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                                    }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className={`p-2 rounded-lg ${formData.motivation === motivation.value
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                                        }`}>
                                        <IconComponent className="h-5 w-5" />
                                    </div>
                                    <span className="text-sm font-medium">{motivation.label}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="targetAudience">Target Audience/Users (Optional)</Label>
                <Input
                    id="targetAudience"
                    placeholder="e.g., Students, Small businesses, General public"
                    value={formData.targetAudience || ''}
                    onChange={(e) => handleChange('targetAudience', e.target.value)}
                />
            </div>
        </div>
    );
};

export default StepOne;
