import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Button } from '../components/ui/Button';
import { MessageCircle, Mail, User, FileText, Send, CheckCircle, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/api';

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-gray-200 dark:border-slate-700 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between py-4 px-2 text-left hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors rounded-lg"
            >
                <span className="font-medium text-gray-900 dark:text-white pr-4">{question}</span>
                {isOpen ? (
                    <ChevronUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                )}
            </button>
            {isOpen && (
                <div className="pb-4 px-2 text-gray-600 dark:text-gray-400 leading-relaxed">
                    {answer}
                </div>
            )}
        </div>
    );
};

const Support = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.name || !formData.email || !formData.subject || !formData.message) {
            toast.error('Please fill in all fields');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            toast.error('Please enter a valid email address');
            return;
        }

        setLoading(true);

        try {
            // Send to backend API
            const response = await api.post('/support/contact', formData);

            setSubmitted(true);
            toast.success(response.data.message || 'Message sent successfully! We\'ll get back to you soon.');

            // Reset form
            setFormData({
                name: '',
                email: '',
                subject: '',
                message: '',
            });
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to send message. Please try again.';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-teal-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 py-6 sm:py-8 md:py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="text-center mb-8 sm:mb-12">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-4">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Support Center
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
                        How Can We Help?
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
                        Have a question or need assistance? Fill out the form below and our support team will get back to you within 24 hours.
                    </p>
                </div>

                {/* FAQ Section */}
                <Card className="mb-8 sm:mb-12 border-emerald-200 dark:border-emerald-900/30">
                    <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-b border-emerald-200 dark:border-emerald-800">
                        <CardTitle className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
                            <HelpCircle className="h-5 w-5" />
                            Frequently Asked Questions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-1">
                            <FAQItem
                                question="Is ProjectHub free to use?"
                                answer="Yes! ProjectHub offers both free and premium projects. You can browse and download free projects without any cost. Premium projects require a one-time purchase to support our creators."
                            />
                            <FAQItem
                                question="How do I download a project?"
                                answer="Simply browse the projects, click on any project you like, and hit the download button. For free projects, download starts immediately. For premium projects, you'll need to complete the payment first."
                            />
                            <FAQItem
                                question="What is the Project Builder feature?"
                                answer="Project Builder is an AI-powered tool that helps you plan and build custom projects. It generates roadmaps, task lists, and learning resources tailored to your project idea and skill level."
                            />
                            <FAQItem
                                question="What payment methods do you accept?"
                                answer="Currently, we accept UPI-based payments through direct contact. Payment gateway integration for credit/debit cards and other methods will be available soon."
                            />
                            <FAQItem
                                question="Do you offer refunds?"
                                answer="Yes, we have a refund policy. Please check our Refund Policy page for detailed information about refund eligibility and the process."
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Form */}
                <Card className="border-emerald-200 dark:border-emerald-900/30 shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-b border-emerald-200 dark:border-emerald-800">
                        <CardTitle className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
                            <Mail className="h-5 w-5" />
                            Contact Support
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {submitted ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white mx-auto mb-4">
                                    <CheckCircle className="h-8 w-8" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    Message Sent Successfully!
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    We've received your message and will respond within 24 hours.
                                </p>
                                <Button
                                    onClick={() => setSubmitted(false)}
                                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                                >
                                    Send Another Message
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                            Full Name *
                                        </Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            type="text"
                                            placeholder="Enter your full name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="border-emerald-200 dark:border-emerald-800 focus:ring-emerald-500"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                            Email Address *
                                        </Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="your.email@example.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="border-emerald-200 dark:border-emerald-800 focus:ring-emerald-500"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="subject" className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                        Subject *
                                    </Label>
                                    <Input
                                        id="subject"
                                        name="subject"
                                        type="text"
                                        placeholder="Brief description of your issue"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        className="border-emerald-200 dark:border-emerald-800 focus:ring-emerald-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="message" className="flex items-center gap-2">
                                        <MessageCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                        Message *
                                    </Label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        rows="6"
                                        placeholder="Please provide as much detail as possible..."
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-3 py-2 border-2 border-emerald-200 dark:border-emerald-800 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white resize-none transition-colors"
                                    />
                                </div>

                                <div className="flex items-center justify-between pt-4">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        * Required fields
                                    </p>
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/30 min-w-[150px]"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="h-4 w-4 mr-2" />
                                                Send Message
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>

                {/* Additional Info */}
                <Card className="mt-6 border-blue-200 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-900/10">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white flex-shrink-0 mt-0.5">
                                <HelpCircle className="h-4 w-4" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                                    Response Time
                                </h3>
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    Our support team typically responds within 24 hours during business days (Monday-Friday, 9 AM - 6 PM IST).
                                    For urgent issues, please mention "URGENT" in your subject line.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Powered by Diksuchi */}
                <div className="text-center mt-12 pt-8 border-t border-gray-200 dark:border-slate-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        ProjectsHUB is powered by{' '}
                        <a
                            href="https://diksuchi-landing.vercel.app/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold transition-colors"
                        >
                            Diksuchi
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Support;
