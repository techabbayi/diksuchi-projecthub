import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Shield, Lock, Eye, UserCheck, Database, Bell } from 'lucide-react';

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-teal-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-4">
                        <Shield className="h-4 w-4 mr-2" />
                        Privacy Policy
                    </div>
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
                        Privacy Policy
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                        Last updated: December 17, 2025
                    </p>
                </div>

                {/* Content */}
                <div className="space-y-6">
                    <Card className="border-emerald-200 dark:border-emerald-900/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
                                <Eye className="h-5 w-5" />
                                Information We Collect
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="prose dark:prose-invert max-w-none">
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                We collect information that you provide directly to us, including:
                            </p>
                            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400 mt-1">•</span><div><strong>Account Information:</strong> Name, email address, username, and password</div></li>
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400 mt-1">•</span><div><strong>Profile Information:</strong> Optional profile details and preferences</div></li>
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400 mt-1">•</span><div><strong>Project Information:</strong> Details about projects you upload or purchase</div></li>
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400 mt-1">•</span><div><strong>Payment Information:</strong> Currently processed via UPI through direct contact. Payment gateway integration coming soon for secure card and other payment processing</div></li>
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400 mt-1">•</span><div><strong>Communication Data:</strong> Messages, support requests, and feedback</div></li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className="border-emerald-200 dark:border-emerald-900/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
                                <Database className="h-5 w-5" />
                                How We Use Your Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="prose dark:prose-invert max-w-none">
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                We use the information we collect to:
                            </p>
                            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400 mt-1">•</span><div>Provide, maintain, and improve our services</div></li>
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400 mt-1">•</span><div>Process transactions and send related information</div></li>
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400 mt-1">•</span><div>Send technical notices and support messages</div></li>
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400 mt-1">•</span><div>Respond to your comments and questions</div></li>
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400 mt-1">•</span><div>Detect, prevent, and address fraud and security issues</div></li>
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400 mt-1">•</span><div>Personalize and improve your experience</div></li>
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400 mt-1">•</span><div>Generate AI-powered project recommendations</div></li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className="border-emerald-200 dark:border-emerald-900/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
                                <Lock className="h-5 w-5" />
                                Data Security
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="prose dark:prose-invert max-w-none">
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                We implement appropriate technical and organizational measures to protect your personal information:
                            </p>
                            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400 mt-1">•</span><div>Encrypted data transmission using HTTPS/SSL</div></li>
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400 mt-1">•</span><div>Secure password hashing with bcrypt</div></li>
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400 mt-1">•</span><div>Regular security audits and updates</div></li>
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400 mt-1">•</span><div>Access controls and authentication</div></li>
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400 mt-1">•</span><div>Secure cloud storage with MongoDB Atlas</div></li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className="border-emerald-200 dark:border-emerald-900/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
                                <UserCheck className="h-5 w-5" />
                                Your Rights
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="prose dark:prose-invert max-w-none">
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                You have the right to:
                            </p>
                            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400 mt-1">•</span><div>Access your personal data</div></li>
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400 mt-1">•</span><div>Correct inaccurate data</div></li>
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400 mt-1">•</span><div>Request deletion of your data</div></li>
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400 mt-1">•</span><div>Object to data processing</div></li>
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400 mt-1">•</span><div>Data portability</div></li>
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400 mt-1">•</span><div>Withdraw consent at any time</div></li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className="border-emerald-200 dark:border-emerald-900/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
                                <Bell className="h-5 w-5" />
                                Cookies and Tracking
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="prose dark:prose-invert max-w-none">
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                We use cookies and similar tracking technologies to:
                            </p>
                            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400 mt-1">•</span><div>Maintain your session and keep you logged in</div></li>
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400 mt-1">•</span><div>Remember your preferences</div></li>
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400 mt-1">•</span><div>Analyze site usage and trends</div></li>
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400 mt-1">•</span><div>Improve user experience</div></li>
                            </ul>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                                You can control cookies through your browser settings.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-emerald-200 dark:border-emerald-900/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
                                <Shield className="h-5 w-5" />
                                Contact Us
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="prose dark:prose-invert max-w-none">
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                If you have any questions about this Privacy Policy, please contact us through our{' '}
                                <a href="/support" className="text-emerald-600 dark:text-emerald-400 hover:underline">
                                    Support Page
                                </a>.
                            </p>
                        </CardContent>
                    </Card>
                </div>

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

export default PrivacyPolicy;
