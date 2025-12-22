import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { RefreshCw, DollarSign, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const RefundPolicy = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/30 to-teal-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-4">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refund Policy
                    </div>
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
                        Refund Policy
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
                                <DollarSign className="h-5 w-5" />
                                Refund Eligibility
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="prose dark:prose-invert max-w-none">
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                We strive to ensure all projects meet quality standards. You may be eligible for a refund if:
                            </p>
                            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400">•</span><div>The project files are corrupted or cannot be extracted</div></li>
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400">•</span><div>The project is significantly different from its description</div></li>
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400">•</span><div>Essential files or documentation are missing</div></li>
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400">•</span><div>The project contains malicious code or security vulnerabilities</div></li>
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400">•</span><div>You receive duplicate charges for the same project</div></li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className="border-emerald-200 dark:border-emerald-900/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
                                <Clock className="h-5 w-5" />
                                Refund Timeframe
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="prose dark:prose-invert max-w-none">
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 mb-4">
                                <p className="text-emerald-900 dark:text-emerald-100 font-semibold mb-2">
                                    7-Day Refund Window
                                </p>
                                <p className="text-emerald-700 dark:text-emerald-300 text-sm">
                                    You have 7 days from the date of purchase to request a refund. Refund requests submitted after this period will not be accepted unless there are exceptional circumstances.
                                </p>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                The refund window starts from the moment of successful payment, not from when you download the project.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-emerald-200 dark:border-emerald-900/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
                                <CheckCircle className="h-5 w-5" />
                                How to Request a Refund
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="prose dark:prose-invert max-w-none">
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                                To request a refund, follow these steps:
                            </p>
                            <ol className="space-y-3 text-gray-700 dark:text-gray-300">
                                <li>
                                    <strong>Contact Support:</strong> Submit a refund request through our{' '}
                                    <a href="/support" className="text-emerald-600 dark:text-emerald-400 hover:underline">
                                        Support Page
                                    </a>
                                </li>
                                <li>
                                    <strong>Provide Details:</strong> Include your transaction ID and detailed reason for the refund
                                </li>
                                <li>
                                    <strong>Evidence:</strong> If applicable, provide screenshots or documentation of the issue
                                </li>
                                <li>
                                    <strong>Review:</strong> Our team will review your request within 2-3 business days
                                </li>
                                <li>
                                    <strong>Decision:</strong> You'll receive an email with the decision and next steps
                                </li>
                            </ol>
                        </CardContent>
                    </Card>

                    <Card className="border-emerald-200 dark:border-emerald-900/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
                                <XCircle className="h-5 w-5" />
                                Non-Refundable Situations
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="prose dark:prose-invert max-w-none">
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                Refunds will NOT be issued in the following cases:
                            </p>
                            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400">•</span><div>You changed your mind after purchasing</div></li>
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400">•</span><div>You lack the technical skills to implement the project</div></li>
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400">•</span><div>The project doesn't fit your specific use case</div></li>
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400">•</span><div>You found a similar free project elsewhere</div></li>
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400">•</span><div>You've already used or modified the project code</div></li>
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400">•</span><div>The refund request is made after the 7-day window</div></li>
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400">•</span><div>You violate our Terms & Conditions</div></li>
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400">•</span><div>Free projects (no payment was made)</div></li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className="border-emerald-200 dark:border-emerald-900/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
                                <RefreshCw className="h-5 w-5" />
                                Refund Processing
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="prose dark:prose-invert max-w-none">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Processing Time</h3>
                            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                                <li><strong>Review:</strong> 2-3 business days</li>
                                <li><strong>Approval:</strong> Immediate after review approval</li>
                                <li><strong>Payment Gateway:</strong> 5-7 business days for funds to appear in your account</li>
                            </ul>

                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-3">Refund Method</h3>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                Refunds are processed through the original payment method (UPI). Payment gateway integration coming soon, which will enable automated refund processing.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-emerald-200 dark:border-emerald-900/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
                                <AlertCircle className="h-5 w-5" />
                                Partial Refunds
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="prose dark:prose-invert max-w-none">
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                In some cases, we may offer partial refunds:
                            </p>
                            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400">•</span><div>When only part of the project has issues</div></li>
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400">•</span><div>For minor discrepancies from the description</div></li>
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400">•</span><div>When you've already extracted significant value from the project</div></li>
                            </ul>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                                The amount of partial refund is determined on a case-by-case basis by our support team.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-emerald-200 dark:border-emerald-900/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
                                <CheckCircle className="h-5 w-5" />
                                Creator Protections
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="prose dark:prose-invert max-w-none">
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                To protect our creators from fraud:
                            </p>
                            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400">•</span><div>We verify all refund claims thoroughly</div></li>
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400">•</span><div>Creators are notified of refund requests</div></li>
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400">•</span><div>Creators can provide additional context or solutions</div></li>
                                <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-400">•</span><div>Repeated refund abuse results in account suspension</div></li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className="border-emerald-200 dark:border-emerald-900/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
                                <DollarSign className="h-5 w-5" />
                                Chargebacks
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="prose dark:prose-invert max-w-none">
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                                <p className="text-yellow-900 dark:text-yellow-100 font-semibold mb-2">
                                    ⚠️ Important Notice
                                </p>
                                <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                                    Filing a chargeback without contacting us first may result in immediate account suspension. Always attempt to resolve disputes through our support channel first.
                                </p>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                Chargebacks incur additional fees and administrative costs. We strongly encourage you to contact our support team to resolve any issues before initiating a chargeback with your bank.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-emerald-200 dark:border-emerald-900/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400">
                                <AlertCircle className="h-5 w-5" />
                                Contact Support
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="prose dark:prose-invert max-w-none">
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                For refund requests or questions about this policy, please contact us through our{' '}
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

export default RefundPolicy;
