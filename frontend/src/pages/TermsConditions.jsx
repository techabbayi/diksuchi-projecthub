import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { FileText, Scale, AlertCircle, Shield, Ban, CheckCircle } from 'lucide-react';

const TermsConditions = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-teal-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-4">
                        <FileText className="h-4 w-4 mr-2" />
                        Terms & Conditions
                    </div>
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
                        Terms & Conditions
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
                                <Scale className="h-5 w-5" />
                                Acceptance of Terms
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="prose dark:prose-invert max-w-none">
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                By accessing and using ProjectsHUB, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, please do not use our service.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-emerald-200 dark:border-emerald-900/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
                                <CheckCircle className="h-5 w-5" />
                                User Accounts
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="prose dark:prose-invert max-w-none">
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                To use certain features, you must create an account. You agree to:
                            </p>
                            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                                <li>Provide accurate and complete information</li>
                                <li>Maintain the security of your password</li>
                                <li>Accept responsibility for all activities under your account</li>
                                <li>Notify us immediately of any unauthorized use</li>
                                <li>Not create multiple accounts or share your account</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className="border-emerald-200 dark:border-emerald-900/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
                                <Shield className="h-5 w-5" />
                                Intellectual Property
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="prose dark:prose-invert max-w-none">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Content Ownership</h3>
                            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400">•</span><div>Project creators retain ownership of their uploaded content</div></li>
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400">•</span><div>Users who purchase projects receive a license to use the code</div></li>
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400">•</span><div>You may not resell or redistribute purchased projects</div></li>
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400">•</span><div>All platform design and branding remain property of ProjectsHUB</div></li>
                            </ul>

                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-3">License Grant</h3>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                When you purchase a project, you receive a non-exclusive, non-transferable license to use the code for personal or commercial projects. You may modify the code but may not resell it as-is.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-emerald-200 dark:border-emerald-900/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
                                <Ban className="h-5 w-5" />
                                Prohibited Activities
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="prose dark:prose-invert max-w-none">
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                You may not:
                            </p>
                            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400">•</span><div>Upload malicious code or viruses</div></li>
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400">•</span><div>Infringe on intellectual property rights</div></li>
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400">•</span><div>Engage in fraudulent activities</div></li>
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400">•</span><div>Harass or abuse other users</div></li>
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400">•</span><div>Attempt to hack or compromise the platform</div></li>
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400">•</span><div>Use automated systems to scrape content</div></li>
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400">•</span><div>Upload plagiarized or stolen content</div></li>
                                <li>Manipulate ratings or reviews</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className="border-emerald-200 dark:border-emerald-900/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
                                <AlertCircle className="h-5 w-5" />
                                Payment & Refunds
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="prose dark:prose-invert max-w-none">
                            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400">•</span><div>All payments are currently processed via UPI through direct contact. Payment gateway integration coming soon.</div></li>
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400">•</span><div>Prices are listed in the specified currency</div></li>
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400">•</span><div>Free projects remain free forever</div></li>
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400">•</span><div>Refunds are subject to our Refund Policy</div></li>
                            </ul>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                                See our{' '}
                                <a href="/refund-policy" className="text-emerald-600 dark:text-emerald-400 hover:underline">
                                    Refund Policy
                                </a>{' '}
                                for complete details.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-emerald-200 dark:border-emerald-900/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
                                <Shield className="h-5 w-5" />
                                Disclaimer of Warranties
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="prose dark:prose-invert max-w-none">
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                ProjectsHUB is provided "as is" without warranties of any kind. We do not guarantee:
                            </p>
                            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                                <li>Uninterrupted or error-free service</li>
                                <li>The quality or accuracy of user-uploaded projects</li>
                                <li>That projects will meet your specific requirements</li>
                                <li>The security of your data (though we implement best practices)</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className="border-emerald-200 dark:border-emerald-900/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
                                <Scale className="h-5 w-5" />
                                Limitation of Liability
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="prose dark:prose-invert max-w-none">
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                ProjectsHUB and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the service.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-emerald-200 dark:border-emerald-900/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
                                <FileText className="h-5 w-5" />
                                Changes to Terms
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="prose dark:prose-invert max-w-none">
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms. We will notify users of significant changes via email or platform notification.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-emerald-200 dark:border-emerald-900/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
                                <AlertCircle className="h-5 w-5" />
                                Contact Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="prose dark:prose-invert max-w-none">
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                For questions about these Terms & Conditions, please contact us through our{' '}
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

export default TermsConditions;
