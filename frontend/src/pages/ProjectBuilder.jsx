import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/api';
import StepIndicator from '../components/ProjectBuilder/StepIndicator';
import StepOne from '../components/ProjectBuilder/StepOne';
import StepThree from '../components/ProjectBuilder/StepThree';
import StepFour from '../components/ProjectBuilder/StepFour';
import StepFive from '../components/ProjectBuilder/StepFive';
import StepSix from '../components/ProjectBuilder/StepSix';
import StepSeven from '../components/ProjectBuilder/StepSeven';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { AlertCircle, Sparkles, Code2, CheckCircle2, Send } from 'lucide-react';

const ProjectBuilder = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({});
    const [isGenerating, setIsGenerating] = useState(false);
    const [existingProject, setExistingProject] = useState(null);
    const [quotaInfo, setQuotaInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [requestReason, setRequestReason] = useState('');
    const [submittingRequest, setSubmittingRequest] = useState(false);

    useEffect(() => {
        checkExistingProject();
    }, []);

    const checkExistingProject = async () => {
        try {
            const response = await api.get('/project-builder/my-project');
            if (response.data.success && response.data.project) {
                setExistingProject(response.data.project);
                setQuotaInfo(response.data.quotaInfo);
            }
        } catch {
            // No existing project or error - silently continue
        } finally {
            setLoading(false);
        }
    };

    const handleRequestMoreProjects = async () => {
        if (!requestReason.trim()) {
            toast.error('Please provide a reason for your request');
            return;
        }

        setSubmittingRequest(true);
        try {
            await api.post('/project-builder/request-quota', {
                reason: requestReason
            });
            toast.success('Request submitted successfully! Admin will review your request.');
            setShowRequestForm(false);
            setRequestReason('');
            checkExistingProject();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit request');
        } finally {
            setSubmittingRequest(false);
        }
    };

    const handleNext = () => {
        // Validation
        if (currentStep === 1) {
            if (!formData.projectName || !formData.description || !formData.motivation) {
                toast.error('Please fill all required fields');
                return;
            }
            if (formData.description.length < 50) {
                toast.error('Description must be at least 50 characters');
                return;
            }
        }

        if (currentStep === 2 && !formData.techStack) {
            toast.error('Please select a tech stack');
            return;
        }

        if (currentStep === 3 && !formData.complexity) {
            toast.error('Please select project complexity');
            return;
        }

        if (currentStep === 4) {
            if (!formData.totalTimeEstimate || !formData.dailyTimeCommitment || !formData.skillLevel) {
                toast.error('Please fill all required fields');
                return;
            }
        }

        if (currentStep === 5) {
            if (!formData.learningStyle) {
                toast.error('Please select a learning style');
                return;
            }
        }

        setCurrentStep(currentStep + 1);
    };

    const handleBack = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleEditStep = (step) => {
        setCurrentStep(step);
    };

    const handleShowSuggestions = () => {
        // Navigate to suggestions page (implement separately)
        navigate('/project-builder/suggestions');
    };

    const handleSubmit = async () => {
        setIsGenerating(true);
        try {
            const response = await api.post('/project-builder/create', formData);

            // Show success message
            toast.success('🎉 Project created! Generating your personalized guide...', {
                duration: 3000,
            });

            // Small delay to ensure backend processing is complete
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Navigate to dashboard
            navigate(`/project-builder/${response.data.project._id}`);
        } catch (error) {
            console.error('Error creating project:', error);
            if (error.response?.status === 403) {
                // Quota exceeded
                setQuotaInfo(error.response.data.quotaInfo);
                toast.error('Project limit reached. Request more projects from admin.');
            } else {
                toast.error(error.response?.data?.message || 'Failed to create project');
            }
            setIsGenerating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200 border-t-green-600 dark:border-green-900 dark:border-t-green-400 mx-auto"></div>
                    <p className="text-green-700 dark:text-green-300 font-medium">Loading your project...</p>
                </div>
            </div>
        );
    }

    // If user already has a custom project, show it
    if (existingProject) {
        return (
            <div className="min-h-screen bg-white dark:bg-gray-950 py-8 sm:py-12 px-4">
                <div className="container mx-auto max-w-5xl">
                    {/* Header Section */}
                    <div className="bg-green-700 dark:bg-green-900 text-white rounded-2xl p-6 sm:p-8 mb-6 shadow-lg">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-green-600 dark:bg-green-800 p-3 rounded-xl">
                                    <Sparkles className="h-7 w-7 sm:h-8 sm:w-8" />
                                </div>
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold">Your Custom Project</h1>
                                    <p className="text-green-100 text-sm mt-1">Personalized AI-powered development guide</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Card */}
                    <Card className="border-2 border-green-200 dark:border-green-800 shadow-lg overflow-hidden">
                        <CardContent className="p-6 sm:p-8 space-y-6">
                            {/* Project Details Grid */}
                            <div className="grid gap-6">
                                {/* Project Name */}
                                <div className="bg-green-50 dark:bg-green-950/30 rounded-xl p-5 border border-green-200 dark:border-green-800">
                                    <h3 className="text-sm font-semibold text-green-800 dark:text-green-300 mb-2 uppercase tracking-wide">Project Name</h3>
                                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white break-words">{existingProject.projectName}</p>
                                </div>

                                {/* Description */}
                                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
                                    <h3 className="text-sm font-semibold text-green-800 dark:text-green-300 mb-2 uppercase tracking-wide">Description</h3>
                                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{existingProject.description}</p>
                                </div>

                                {/* Tech Stack & Metrics Grid */}
                                <div className="grid lg:grid-cols-2 gap-6">
                                    {/* Tech Stack */}
                                    <div className="bg-green-50 dark:bg-green-950/30 rounded-xl p-5 border border-green-200 dark:border-green-800">
                                        <h3 className="text-sm font-semibold text-green-800 dark:text-green-300 mb-3 uppercase tracking-wide">Tech Stack</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {Array.isArray(existingProject.techStack) && existingProject.techStack.map((tech, idx) => (
                                                <span key={idx} className="px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg text-sm font-semibold shadow-sm">
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Project Metrics */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-green-100 dark:bg-green-900/40 rounded-xl p-5 border border-green-300 dark:border-green-700">
                                            <h3 className="text-xs font-semibold text-green-700 dark:text-green-400 mb-2 uppercase tracking-wide">Complexity</h3>
                                            <p className="text-xl font-bold text-green-900 dark:text-green-100 capitalize">{existingProject.complexity}</p>
                                        </div>
                                        <div className="bg-green-600 dark:bg-green-700 rounded-xl p-5 text-white">
                                            <h3 className="text-xs font-semibold mb-2 uppercase tracking-wide opacity-90">Progress</h3>
                                            <p className="text-xl font-bold">{existingProject.progress?.overallPercentage || 0}%</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Tasks Summary */}
                                {existingProject.milestones && existingProject.milestones.length > 0 && (
                                    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
                                        <h3 className="text-sm font-semibold text-green-800 dark:text-green-300 mb-4 uppercase tracking-wide">Milestones Overview</h3>
                                        <div className="space-y-3">
                                            {existingProject.milestones.slice(0, 3).map((milestone, idx) => (
                                                <div key={idx} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800">
                                                    <div className="bg-green-100 dark:bg-green-900/40 p-2 rounded-lg">
                                                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <span className="text-gray-900 dark:text-gray-100 font-medium">{milestone.title}</span>
                                                        <span className="text-green-600 dark:text-green-400 text-sm ml-2">({milestone.tasks?.length || 0} tasks)</span>
                                                    </div>
                                                </div>
                                            ))}
                                            {existingProject.milestones.length > 3 && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400 pl-3 pt-2">+{existingProject.milestones.length - 3} more milestones</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="grid sm:grid-cols-2 gap-4 pt-6 border-t-2 border-gray-200 dark:border-gray-800">
                                <Button
                                    onClick={() => navigate(`/project-builder/${existingProject._id}`)}
                                    className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white py-6 text-base font-semibold shadow-md"
                                >
                                    <Code2 className="mr-2 h-5 w-5" />
                                    View Full Project Dashboard
                                </Button>
                                <Button
                                    onClick={() => setShowRequestForm(true)}
                                    variant="outline"
                                    className="border-2 border-green-600 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-400 dark:hover:bg-green-950/30 py-6 text-base font-semibold"
                                >
                                    <Send className="mr-2 h-5 w-5" />
                                    Request Another Project
                                </Button>
                            </div>

                            {/* Quota Info */}
                            {quotaInfo && (
                                <div className="bg-green-50 dark:bg-green-950/30 border-2 border-green-200 dark:border-green-800 rounded-xl p-5">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-green-600 dark:bg-green-700 p-2 rounded-lg">
                                            <AlertCircle className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="text-sm text-gray-800 dark:text-gray-200">
                                            <p className="font-bold text-green-800 dark:text-green-300 mb-1 text-base">Project Quota: {quotaInfo.used}/1</p>
                                            <p className="text-gray-700 dark:text-gray-300">You've used your free custom project. Need another? Contact admin for approval.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Request Form Modal */}
                    {showRequestForm && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                            <Card className="max-w-lg w-full border-2 border-green-200 dark:border-green-800 shadow-2xl">
                                <CardHeader className="bg-green-600 dark:bg-green-800 text-white p-6">
                                    <CardTitle className="text-xl font-bold">Request Additional Custom Project</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Reason for Request</label>
                                        <textarea
                                            value={requestReason}
                                            onChange={(e) => setRequestReason(e.target.value)}
                                            placeholder="Explain why you need another custom project..."
                                            className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-900 dark:text-white min-h-[140px]"
                                        />
                                    </div>
                                    <div className="bg-green-50 dark:bg-green-950/30 border-2 border-green-300 dark:border-green-700 rounded-xl p-4">
                                        <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                                            <strong className="text-green-800 dark:text-green-300">Note:</strong> Additional custom projects require admin approval and payment of ₹299. You'll be contacted once your request is reviewed.
                                        </p>
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <Button
                                            onClick={handleRequestMoreProjects}
                                            disabled={submittingRequest}
                                            className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white py-3 font-semibold"
                                        >
                                            {submittingRequest ? 'Submitting...' : 'Submit Request'}
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                setShowRequestForm(false);
                                                setRequestReason('');
                                            }}
                                            variant="outline"
                                            className="border-2 border-gray-300 dark:border-gray-600 py-3"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <div className="flex flex-col lg:flex-row min-h-screen">
                {/* Left Sidebar - Progress & Info */}
                <div className="lg:w-[400px] xl:w-[450px] bg-green-700 dark:bg-green-900 text-white p-6 lg:p-8 flex flex-col">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-green-600 dark:bg-green-800 p-3 rounded-xl">
                                <Code2 className="h-7 w-7" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Project Builder</h1>
                                <p className="text-green-100 text-sm">AI-Powered Guide</p>
                            </div>
                        </div>
                        <div className="bg-green-600 dark:bg-green-800 rounded-xl p-4">
                            <p className="text-sm leading-relaxed">
                                Create your personalized project roadmap with AI-generated tasks, folder structure, and step-by-step guidance.
                            </p>
                        </div>
                    </div>

                    {/* Vertical Step Indicator */}
                    <div className="flex-1 mb-8">
                        <div className="space-y-1">
                            {[
                                { num: 1, label: 'Purpose', desc: 'Define your project' },
                                { num: 2, label: 'Tech Stack', desc: 'Choose technologies' },
                                { num: 3, label: 'Features', desc: 'Project complexity' },
                                { num: 4, label: 'Time Plan', desc: 'Schedule & commitment' },
                                { num: 5, label: 'Learning', desc: 'Preferred style' },
                                { num: 6, label: 'Preview', desc: 'Review & generate' }
                            ].map((step) => (
                                <div key={step.num} className="flex items-start gap-3 relative">
                                    {/* Connector Line */}
                                    {step.num < 6 && (
                                        <div className="absolute left-[18px] top-10 w-0.5 h-12 bg-green-600 dark:bg-green-800"></div>
                                    )}

                                    {/* Step Circle */}
                                    <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all z-10 ${step.num < currentStep
                                        ? 'bg-green-500 dark:bg-green-600 text-white shadow-md'
                                        : step.num === currentStep
                                            ? 'bg-white text-green-700 ring-4 ring-green-500/30 shadow-lg'
                                            : 'bg-green-600 dark:bg-green-800 text-green-300 dark:text-green-400'
                                        }`}>
                                        {step.num < currentStep ? '✓' : step.num}
                                    </div>

                                    {/* Step Info */}
                                    <div className={`flex-1 pt-1 transition-all ${step.num === currentStep ? 'opacity-100' : 'opacity-70'
                                        }`}>
                                        <p className={`font-semibold ${step.num === currentStep ? 'text-white' : 'text-green-100'
                                            }`}>
                                            {step.label}
                                        </p>
                                        <p className="text-xs text-green-200 dark:text-green-300">
                                            {step.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="bg-green-600 dark:bg-green-800 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="h-5 w-5" />
                            <p className="font-semibold">Step {currentStep} of 6</p>
                        </div>
                        <div className="w-full bg-green-700 dark:bg-green-900 rounded-full h-2">
                            <div
                                className="bg-white h-2 rounded-full transition-all duration-300"
                                style={{ width: `${(currentStep / 6) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Right Content - Form */}
                <div className="flex-1 flex flex-col lg:h-screen bg-white dark:bg-gray-900">
                    <div className="flex-1 flex flex-col w-full p-4 lg:px-6 lg:py-2 max-h-screen">
                        {/* Form Content - No Card Background */}
                        <div className="flex-1 overflow-y-auto mb-4 pb-4">
                            <div className="h-full">
                                {currentStep === 1 && <StepOne formData={formData} setFormData={setFormData} />}
                                {currentStep === 2 && <StepThree formData={formData} setFormData={setFormData} />}
                                {currentStep === 3 && <StepFour formData={formData} setFormData={setFormData} />}
                                {currentStep === 4 && <StepFive formData={formData} setFormData={setFormData} />}
                                {currentStep === 5 && <StepSix formData={formData} setFormData={setFormData} />}
                                {currentStep === 6 && <StepSeven formData={formData} onEdit={handleEditStep} />}
                            </div>
                        </div>

                        {/* Navigation Buttons - Fixed at bottom */}
                        <div className="flex justify-between items-center gap-4 py-3 px-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                            {currentStep > 1 ? (
                                <Button
                                    variant="outline"
                                    onClick={handleBack}
                                    className="border-2 border-green-600 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-400 dark:hover:bg-green-950/30 px-6 py-3 text-sm font-semibold"
                                >
                                    ← Back
                                </Button>
                            ) : (
                                <div></div>
                            )}
                            {currentStep < 6 ? (
                                <Button
                                    onClick={handleNext}
                                    className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white px-6 py-3 text-sm font-semibold shadow-md"
                                >
                                    Next Step →
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isGenerating}
                                    className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white px-8 py-3 text-sm font-bold shadow-lg disabled:opacity-60"
                                >
                                    {isGenerating ? (
                                        <>
                                            <span className="animate-spin mr-2">⏳</span>
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="mr-2 h-5 w-5" />
                                            Generate Project
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Generation Loading Modal */}
            {isGenerating && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-900 border-2 border-green-600 dark:border-green-700 rounded-2xl p-8 sm:p-10 max-w-md w-full shadow-2xl">
                        <div className="text-center mb-6">
                            <div className="bg-green-100 dark:bg-green-900/40 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                <Sparkles className="h-10 w-10 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Creating Your Project</h3>
                            <p className="text-gray-600 dark:text-gray-400">Please wait while we generate your personalized guide</p>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                                <div className="bg-green-600 dark:bg-green-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">✓</div>
                                <span className="text-gray-900 dark:text-gray-100 font-medium">Analyzing requirements</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                                <div className="bg-green-600 dark:bg-green-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">✓</div>
                                <span className="text-gray-900 dark:text-gray-100 font-medium">Generating folder structure</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-green-100 dark:bg-green-900/50 rounded-lg border-2 border-green-600 dark:border-green-700">
                                <div className="bg-green-600 dark:bg-green-700 text-white rounded-full w-6 h-6 flex items-center justify-center">
                                    <span className="animate-spin text-sm">⏳</span>
                                </div>
                                <span className="text-gray-900 dark:text-gray-100 font-bold">Creating task roadmap...</span>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-700 opacity-60">
                                <div className="bg-gray-300 dark:bg-gray-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">⏳</div>
                                <span className="text-gray-600 dark:text-gray-400">Writing documentation...</span>
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-950/30 px-4 py-2 rounded-lg border border-green-200 dark:border-green-800">
                                <div className="h-2 w-2 bg-green-600 dark:bg-green-500 rounded-full animate-pulse"></div>
                                <p className="text-sm text-green-800 dark:text-green-300 font-medium">Estimated time: 10-15 seconds</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectBuilder;
