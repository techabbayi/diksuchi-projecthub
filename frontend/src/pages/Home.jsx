import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '../components/ui/Button';
import { ArrowRight, Code2, Shield, Zap, Sparkles, TrendingUp, Users, Download, Heart, Search, Rocket, BookOpen, GitBranch, Package, Star, Boxes, Wand2, CheckCircle, Brain, Layers, Workflow, Terminal, Instagram, Youtube, Linkedin, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import axios from 'axios';

const Home = () => {
    const [backendStatus, setBackendStatus] = useState('checking'); // 'checking', 'connected', 'disconnected'

    // Scroll to top on component mount
    useEffect(() => {
        try {
            window.scrollTo(0, 0);
        } catch (err) {
            console.error('Scroll error:', err);
        }
    }, []);

    // Check backend status
    useEffect(() => {
        let retryCount = 0;
        const maxRetries = 3;

        const checkBackendStatus = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                // Remove /api suffix to get base URL for health check
                const BASE_URL = API_URL.replace('/api', '');

                // Set to checking/waking state
                setBackendStatus('checking');

                const response = await axios.get(`${BASE_URL}/health`, {
                    timeout: 30000 // 30 seconds timeout for cold start on Render
                });

                if (response.status === 200) {
                    setBackendStatus('connected');
                    retryCount = 0; // Reset retry count on success
                } else {
                    setBackendStatus('disconnected');
                }
            } catch (_error) {
                // Retry if we haven't exceeded max retries
                if (retryCount < maxRetries) {
                    retryCount++;
                    setBackendStatus('checking');
                    // Retry after 5 seconds (backend might be waking up)
                    setTimeout(checkBackendStatus, 5000);
                } else {
                    setBackendStatus('disconnected');
                }
                // Don't set error state for backend status check failures
            }
        };

        // Initial check to wake up backend
        checkBackendStatus();

        // Recheck every 60 seconds to keep backend alive
        const interval = setInterval(() => {
            retryCount = 0; // Reset retry count for periodic checks
            checkBackendStatus();
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    // Get indicator color and animation based on status
    const getIndicatorStyle = () => {
        switch (backendStatus) {
            case 'checking':
                return {
                    className: 'w-2 h-2 bg-yellow-500 rounded-full animate-pulse',
                    animation: true,
                    tooltip: 'Waking up backend server...'
                };
            case 'connected':
                return {
                    className: 'w-2 h-2 bg-emerald-500 rounded-full animate-pulse',
                    animation: true,
                    tooltip: 'Backend server connected'
                };
            case 'disconnected':
                return {
                    className: 'w-2 h-2 bg-red-500 rounded-full',
                    animation: false,
                    tooltip: 'Backend server offline'
                };
            default:
                return {
                    className: 'w-2 h-2 bg-yellow-500 rounded-full animate-pulse',
                    animation: true,
                    tooltip: 'Checking backend status...'
                };
        }
    };

    const indicatorStyle = getIndicatorStyle();

    return (
        <div className="w-full overflow-x-hidden">
            {/* SEO Meta Tags */}
            <Helmet>
                <title>ProjectHub - Download 1000+ Free & Premium Projects | Learn by Building</title>
                <meta name="description" content="Access 1000+ production-ready projects with AI-powered guidance. Learn web development, mobile apps, and more with source code downloads. Free and premium projects available." />
                <meta name="keywords" content="project download, source code, web development projects, mobile app projects, free projects, premium projects, coding tutorials, learn programming, github projects, project hub" />
                <link rel="canonical" href="https://projecthub.diksuchiedtech.in" />

                {/* Open Graph / Facebook */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://projecthub.diksuchiedtech.in" />
                <meta property="og:title" content="ProjectHub - Download 1000+ Free & Premium Projects" />
                <meta property="og:description" content="Access production-ready projects with AI-powered guidance. Build real applications and accelerate your learning." />
                <meta property="og:image" content="https://projecthub.diksuchiedtech.in/og-image.jpg" />

                {/* Twitter */}
                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:url" content="https://projecthub.diksuchiedtech.in" />
                <meta property="twitter:title" content="ProjectHub - Download 1000+ Free & Premium Projects" />
                <meta property="twitter:description" content="Access production-ready projects with AI-powered guidance. Build real applications and accelerate your learning." />
                <meta property="twitter:image" content="https://projecthub.diksuchiedtech.in/og-image.jpg" />

                {/* Structured Data */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebSite",
                        "name": "ProjectHub",
                        "description": "Download 1000+ production-ready projects with AI-powered guidance",
                        "url": "https://projecthub.diksuchiedtech.in",
                        "potentialAction": {
                            "@type": "SearchAction",
                            "target": "https://projecthub.diksuchiedtech.in/projects?search={search_term_string}",
                            "query-input": "required name=search_term_string"
                        },
                        "publisher": {
                            "@type": "Organization",
                            "name": "Diksuchi EdTech",
                            "logo": {
                                "@type": "ImageObject",
                                "url": "https://projecthub.diksuchiedtech.in/logo.png"
                            }
                        }
                    })}
                </script>
            </Helmet>

            {/* Hero Section - Completely Redesigned */}
            <section className="relative min-h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] flex items-center justify-center overflow-x-hidden bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/30 transition-colors duration-200">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {/* Floating Orbs */}
                    <motion.div
                        animate={{
                            y: [0, -30, 0],
                            rotate: [0, 180, 360],
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        className="absolute top-20 left-[10%] w-72 h-72 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl"
                    />
                    <motion.div
                        animate={{
                            y: [0, 40, 0],
                            rotate: [360, 180, 0],
                        }}
                        transition={{
                            duration: 25,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        className="absolute bottom-20 right-[10%] w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"
                    />
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{
                            duration: 15,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl"
                    />
                </div>

                {/* Content Container */}
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 max-w-7xl w-full max-h-full overflow-hidden">
                    <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center w-full h-full">
                        {/* Left Content */}
                        <div className="space-y-8 text-center lg:text-left max-h-full overflow-hidden">
                            {/* Top Badge */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-emerald-200 dark:border-emerald-800 shadow-lg transition-[background-color,border-color] duration-200"
                            >
                                <div
                                    className={indicatorStyle.className}
                                    title={indicatorStyle.tooltip}
                                ></div>
                                <Brain className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                <span className="text-sm font-bold text-gray-900 dark:text-white">Powered by Diksuchi AI</span>
                            </motion.div>

                            {/* Main Heading */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.8 }}
                                className="space-y-4 w-full"
                            >
                                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.3] pb-4 w-full break-words">
                                    <span className="block text-gray-900 dark:text-white mb-2">
                                        The Future of
                                    </span>
                                    <span className="block bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 bg-clip-text text-transparent pb-3" style={{ WebkitBoxDecorationBreak: 'clone' }}>
                                        Code Learning
                                    </span>
                                </h1>
                            </motion.div>

                            {/* Description */}
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4, duration: 0.8 }}
                                className="text-base sm:text-lg text-gray-700 dark:text-gray-300 leading-relaxed max-w-2xl"
                            >
                                Access <span className="font-bold text-emerald-600 dark:text-emerald-400">1000+ production-ready projects</span> with AI-powered guidance.
                                Build real applications, learn industry best practices, and accelerate your development journey.
                            </motion.p>

                            {/* CTA Buttons */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6, duration: 0.8 }}
                                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                            >
                                <Link to="/projects">
                                    <Button
                                        size="lg"
                                        className="text-base px-8 py-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-2xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all hover:scale-105 rounded-sm"
                                    >
                                        <span className="flex items-center gap-2">
                                            Explore Projects
                                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                        </span>
                                    </Button>
                                </Link>
                                <Link to="/project-builder">
                                    <Button
                                        size="lg"
                                        className="text-base px-8 py-6 bg-white dark:bg-slate-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-700 font-bold border-2 border-gray-200 dark:border-slate-600 shadow-xl transition-all hover:scale-105 rounded-sm"
                                    >
                                        <Wand2 className="h-5 w-5 mr-2" />
                                        Try AI Builder
                                    </Button>
                                </Link>
                            </motion.div>

                            {/* Trust Indicators */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8, duration: 0.8 }}
                                className="flex flex-wrap items-center gap-6 justify-center lg:justify-start pt-4"
                            >
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Free projects</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">No credit card</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Instant access</span>
                                </div>
                            </motion.div>
                        </div>

                        {/* Right Content - Stats Cards */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4, duration: 1 }}
                            className="relative w-full max-w-full"
                        >
                            <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full">
                                {/* Stat Card 1 */}
                                <motion.div
                                    whileHover={{ scale: 1.05, rotate: 2 }}
                                    className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl border border-emerald-200/50 dark:border-emerald-800/50 relative overflow-hidden group transition-[background-color,border-color] duration-200"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="relative z-10">
                                        <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                                            <Boxes className="h-7 w-7 text-white" />
                                        </div>
                                        <div className="text-4xl font-black text-gray-900 dark:text-white mb-1">1000+</div>
                                        <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">Projects</div>
                                    </div>
                                </motion.div>

                                {/* Stat Card 2 */}
                                <motion.div
                                    whileHover={{ scale: 1.05, rotate: -2 }}
                                    className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl border border-purple-200/50 dark:border-purple-800/50 relative overflow-hidden group transition-[background-color,border-color] duration-200"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="relative z-10">
                                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                                            <Users className="h-7 w-7 text-white" />
                                        </div>
                                        <div className="text-4xl font-black text-gray-900 dark:text-white mb-1">5000+</div>
                                        <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">Developers</div>
                                    </div>
                                </motion.div>

                                {/* Stat Card 3 */}
                                <motion.div
                                    whileHover={{ scale: 1.05, rotate: -2 }}
                                    className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl border border-blue-200/50 dark:border-blue-800/50 relative overflow-hidden group transition-[background-color,border-color] duration-200"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="relative z-10">
                                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                                            <Download className="h-7 w-7 text-white" />
                                        </div>
                                        <div className="text-4xl font-black text-gray-900 dark:text-white mb-1">10K+</div>
                                        <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">Downloads</div>
                                    </div>
                                </motion.div>

                                {/* Stat Card 4 */}
                                <motion.div
                                    whileHover={{ scale: 1.05, rotate: 2 }}
                                    className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl border border-amber-200/50 dark:border-amber-800/50 relative overflow-hidden group transition-[background-color,border-color] duration-200"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="relative z-10">
                                        <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                                            <Star className="h-7 w-7 text-white" />
                                        </div>
                                        <div className="text-4xl font-black text-gray-900 dark:text-white mb-1">4.9</div>
                                        <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">Rating</div>
                                    </div>
                                </motion.div>
                            </div>

                        </motion.div>
                    </div>

                    {/* Scroll Indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 }}
                        className="absolute bottom-0 left-3/4 -translate-x-1/2 z-50"
                    >
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Scroll to explore</span>
                            <div className="w-6 h-10 border-2 border-gray-300 dark:border-gray-600 rounded-full flex items-start justify-center p-2">
                                <motion.div
                                    animate={{ y: [0, 12, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                    className="w-1.5 h-1.5 bg-[#2d6a4f] dark:bg-[#74c69d] rounded-full"
                                ></motion.div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section - Modern Design */}
            <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 via-gray-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 overflow-hidden -mt-1">
                {/* Seamless transition overlay */}
                <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-slate-50/50 to-transparent dark:from-slate-950/50 pointer-events-none"></div>
                <div className="container mx-auto max-w-7xl overflow-visible">
                    <div className="text-center space-y-6 mb-20">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-base font-bold mb-4 shadow-lg"
                        >
                            <Sparkles className="h-5 w-5" />
                            Why Choose Us
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white"
                        >
                            Built for Modern Developers
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-gray-700 dark:text-gray-300 text-xl font-medium max-w-3xl mx-auto"
                        >
                            Everything you need to accelerate your development workflow with enterprise-grade projects
                        </motion.p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="group relative bg-white dark:bg-slate-800 p-10 rounded-3xl border-2 border-emerald-100 dark:border-emerald-900/30 hover:border-emerald-400 dark:hover:border-emerald-500 shadow-xl hover:shadow-2xl transition-all duration-500"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-2xl shadow-emerald-500/30">
                                    <CheckCircle className="h-10 w-10 text-white" />
                                </div>
                                <h3 className="text-3xl font-black mb-4 text-gray-900 dark:text-white">Verified Quality</h3>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                                    Every project undergoes rigorous testing and admin verification to ensure production-ready quality.
                                </p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="group relative bg-white dark:bg-slate-800 p-10 rounded-3xl border-2 border-emerald-100 dark:border-emerald-900/30 hover:border-emerald-400 dark:hover:border-emerald-500 shadow-xl hover:shadow-2xl transition-all duration-500"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-2xl shadow-emerald-500/30">
                                    <Terminal className="h-10 w-10 text-white" />
                                </div>
                                <h3 className="text-3xl font-black mb-4 text-gray-900 dark:text-white">Production Ready</h3>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                                    Battle-tested code with complete documentation, deployment guides, and best practices included.
                                </p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="group relative bg-white dark:bg-slate-800 p-10 rounded-3xl border-2 border-emerald-100 dark:border-emerald-900/30 hover:border-emerald-400 dark:hover:border-emerald-500 shadow-xl hover:shadow-2xl transition-all duration-500"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-2xl shadow-emerald-500/30">
                                    <Brain className="h-10 w-10 text-white" />
                                </div>
                                <h3 className="text-3xl font-black mb-4 text-gray-900 dark:text-white">AI-Powered</h3>
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                                    Leverage Diksuchi AI to generate custom projects, get instant help, and accelerate learning.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden -mt-1">
                {/* Seamless transition overlay */}
                <div className="absolute top-0 left-0 right-0 h-20  pointer-events-none"></div>
                <div className="container mx-auto max-w-7xl overflow-visible">
                    <div className="text-center space-y-4 mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center px-4 py-2 rounded-full bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-4 shadow-lg border border-emerald-500/20"
                        >
                            <Rocket className="h-4 w-4 mr-2" />
                            How It Works
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white"
                        >
                            Get Started in 3 Simple Steps
                        </motion.h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* Step 1 */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="relative group"
                        >
                            <div className="absolute inset-0 bg-[#2d6a4f] rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                            <div className="relative bg-white dark:bg-slate-800 p-8 rounded-3xl border-2 border-[#d8e2dc] dark:border-slate-700 shadow-xl hover:shadow-2xl hover:border-[#2d6a4f] dark:hover:border-[#74c69d] transition-all duration-300 hover:-translate-y-2">
                                {/* Number Badge - Top Right Corner */}
                                <div className="absolute -top-1 -right-1 w-12 h-12 rounded-full bg-[#ffb703] flex items-center justify-center text-white font-black text-2xl shadow-lg z-10">
                                    1
                                </div>
                                {/* Title at Top */}
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-1">Browse Projects</h3>

                                {/* Content and Icon Layout */}
                                <div className="flex gap-6 items-start">
                                    {/* Left: Content */}
                                    <div className="flex-1">
                                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-base">
                                            Explore our extensive collection of 1000+ production-ready projects across various categories, difficulty levels, and modern tech stacks.
                                        </p>
                                    </div>

                                    {/* Right: Icon */}
                                    <div className="w-16 h-16 rounded-2xl bg-[#2d6a4f] flex items-center justify-center shadow-lg shrink-0">
                                        <Search className="h-8 w-8 text-white" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Step 2 */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="relative group"
                        >
                            <div className="absolute inset-0 bg-[#2d6a4f] rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                            <div className="relative bg-white dark:bg-slate-800 p-8 rounded-3xl border-2 border-[#d8e2dc] dark:border-slate-700 shadow-xl hover:shadow-2xl hover:border-[#2d6a4f] dark:hover:border-[#74c69d] transition-all duration-300 hover:-translate-y-2">
                                {/* Number Badge - Top Right Corner */}
                                <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-[#ffb703] flex items-center justify-center text-white font-black text-2xl shadow-lg z-10">
                                    2
                                </div>
                                {/* Title at Bottom */}
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white">Choose & Save</h3>

                                {/* Content and Icon Layout */}
                                <div className="flex gap-6 items-start">
                                    {/* Left: Content */}
                                    <div className="flex-1">
                                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-base">
                                            Find projects that match your learning goals, save favorites, and review community ratings before downloading.
                                        </p>
                                    </div>

                                    {/* Right: Icon */}
                                    <div className="w-16 h-16 rounded-2xl bg-[#2d6a4f] flex items-center justify-center shadow-lg shrink-0">
                                        <Heart className="h-8 w-8 text-white" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Step 3 */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="relative group"
                        >
                            <div className="absolute inset-0 bg-[#2d6a4f] rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                            <div className="relative bg-white dark:bg-slate-800 p-8 rounded-3xl border-2 border-[#d8e2dc] dark:border-slate-700 shadow-xl hover:shadow-2xl hover:border-[#2d6a4f] dark:hover:border-[#74c69d] transition-all duration-300 hover:-translate-y-2">
                                {/* Number Badge - Top Right Corner */}
                                <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-[#ffb703] flex items-center justify-center text-white font-black text-2xl shadow-lg z-10">
                                    3
                                </div>
                                {/* Title at Bottom */}
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white">Download & Build</h3>

                                {/* Content and Icon Layout */}
                                <div className="flex gap-6 items-start">
                                    {/* Left: Content */}
                                    <div className="flex-1">
                                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-base">
                                            Get instant access to complete source code, comprehensive documentation, and start building amazing projects immediately.
                                        </p>
                                    </div>

                                    {/* Right: Icon */}
                                    <div className="w-16 h-16 rounded-2xl bg-[#2d6a4f] flex items-center justify-center shadow-lg shrink-0">
                                        <Download className="h-8 w-8 text-white" />
                                    </div>
                                </div>


                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Additional Features */}
            <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900 overflow-hidden -mt-1">
                <div className="container mx-auto max-w-6xl overflow-visible">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="flex gap-6"
                        >
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0">
                                <BookOpen className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Complete Documentation</h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Every project includes comprehensive documentation, setup guides, and usage instructions.
                                </p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="flex gap-6"
                        >
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0">
                                <GitBranch className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">GitHub & ZIP Downloads</h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Access projects via GitHub repositories or download as ZIP files for offline use.
                                </p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="flex gap-6"
                        >
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0">
                                <Package className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Organized by Category</h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Find projects easily with our organized categories, difficulty levels, and tech stack filters.
                                </p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="flex gap-6"
                        >
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0">
                                <Star className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Ratings & Reviews</h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Make informed decisions with community ratings, reviews, and download statistics.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Custom Project Builder Section - Diksuchi AI Powered */}
            <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900 overflow-hidden">
                {/* Subtle Pattern Background */}
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#d1d5db_1px,transparent_1px),linear-gradient(to_bottom,#d1d5db_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-50 dark:opacity-40"></div>
                </div>

                <div className="container mx-auto max-w-7xl relative z-10 overflow-visible">
                    <div className="text-center space-y-6 mb-20">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-base font-bold mb-4 shadow-lg"
                        >
                            <Brain className="h-6 w-6" />
                            Diksuchi AI Project Builder
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white"
                        >
                            Can't Find What You Need?
                            <br />
                            <span className="text-emerald-600 dark:text-emerald-400">Let AI Build It For You!</span>
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-lg text-gray-700 dark:text-gray-300 font-medium max-w-4xl mx-auto leading-relaxed"
                        >
                            Powered by <span className="text-emerald-600 dark:text-emerald-400 font-bold">Diksuchi AI</span>, create fully custom projects tailored to your exact requirements in minutes
                        </motion.p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-12">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 p-10 rounded-3xl shadow-xl hover:shadow-2xl hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all duration-500"
                        >
                            <div className="w-20 h-20 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-8 shadow-lg">
                                <Workflow className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Complete Architecture</h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                                Diksuchi AI generates production-ready code with proper folder structure, documentation, and deployment guides.
                            </p>
                            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                                <li className="flex items-center gap-3">
                                    <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                    <span className="font-medium">Full project architecture</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                    <span className="font-medium">Step-by-step guide</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                    <span className="font-medium">Best practices included</span>
                                </li>
                            </ul>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 p-10 rounded-3xl shadow-xl hover:shadow-2xl hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all duration-500"
                        >
                            <div className="w-20 h-20 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-8 shadow-lg">
                                <Layers className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">100% Customizable</h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                                Choose your tech stack, features, complexity, and get exactly what you need without compromise.
                            </p>
                            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                                <li className="flex items-center gap-3">
                                    <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                    <span className="font-medium">Any programming language</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                    <span className="font-medium">Modern frameworks</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                    <span className="font-medium">Database integration</span>
                                </li>
                            </ul>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center"
                    >
                        <Link to="/project-builder">
                            <Button size="lg" className="text-base px-10 py-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xl hover:shadow-2xl transition-all hover:scale-105 rounded-sm">
                                <Wand2 className="mr-3 h-5 w-5" />
                                Create with Diksuchi AI
                            </Button>
                        </Link>
                        <p className="mt-6 text-gray-700 dark:text-gray-300 text-base font-medium">
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">FREE</span> • No credit card • 1 custom project per user
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Final CTA Section - Join the Community */}
            <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gray-200 dark:bg-slate-800 overflow-hidden">
                {/* Subtle Pattern Background */}
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#d1d5db_1px,transparent_1px),linear-gradient(to_bottom,#d1d5db_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-50 dark:opacity-40"></div>
                </div>

                {/* Content */}
                <div className="container mx-auto text-center space-y-10 relative z-10 max-w-5xl overflow-visible">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="space-y-6"
                    >
                        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-base font-bold mb-4 shadow-lg">
                            <Sparkles className="h-5 w-5" />
                            Join the Community
                        </div>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white">
                            Ready to Build Something
                            <br />
                            <span className="text-emerald-600 dark:text-emerald-400">Amazing?</span>
                        </h2>
                        <p className="text-lg text-gray-700 dark:text-gray-300 font-medium max-w-3xl mx-auto leading-relaxed">
                            Join thousands of developers building the future with ProjectHub,
                            <br />
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">powered by Diksuchi AI</span>
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8"
                    >
                        <Link to="/projects">
                            <Button
                                size="lg"
                                className="text-base px-10 py-6 bg-white dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-600 font-bold shadow-xl transition-all hover:scale-105 rounded-full"
                            >
                                Browse Projects
                            </Button>
                        </Link>
                        <Link to="/register">
                            <Button
                                size="lg"
                                className=" text-base px-7 py-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xl hover:shadow-2xl transition-all hover:scale-105 rounded-sm"
                            >
                                Start Free Today <ArrowRight className="ml-3 h-5 w-5" />
                            </Button>
                        </Link>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="pt-8"
                    >
                        <div className="flex flex-wrap justify-center gap-6 mb-8">
                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
                                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                No credit card required
                            </div>
                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
                                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                Free projects available
                            </div>
                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium">
                                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                Instant access
                            </div>
                        </div>
                        <div className="inline-flex items-center gap-3 px-8 py-4 bg-white dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 rounded-2xl shadow-lg">
                            <Brain className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-gray-900 dark:text-white font-bold">Trusted by developers worldwide</span>
                            <span className="text-gray-400 dark:text-gray-500">•</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Powered by Diksuchi</span>
                        </div>

                        {/* Social Media Links */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 }}
                            className="flex gap-4 justify-center pt-6"
                        >
                            <a
                                href="https://www.instagram.com/diksuchedtech"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-12 h-12 rounded-full bg-white dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 flex items-center justify-center hover:border-pink-500 hover:bg-emerald-50 dark:hover:bg-pink-900/20 transition-all hover:scale-110 shadow-md"
                                aria-label="Instagram"
                            >
                                <Instagram className="h-5 w-5 text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400" />
                            </a>
                            <a
                                href="https://www.youtube.com/@diksuchiedtech"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-12 h-12 rounded-full bg-white dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 flex items-center justify-center hover:border-red-500 hover:bg-emerald-50 dark:hover:bg-red-900/20 transition-all hover:scale-110 shadow-md"
                                aria-label="YouTube"
                            >
                                <Youtube className="h-5 w-5 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400" />
                            </a>
                            <a
                                href="https://www.linkedin.com/in/diksuchi-edtech-8282b1393"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-12 h-12 rounded-full bg-white dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 flex items-center justify-center hover:border-blue-500 hover:bg-emerald-50 dark:hover:bg-blue-900/20 transition-all hover:scale-110 shadow-md"
                                aria-label="LinkedIn"
                            >
                                <Linkedin className="h-5 w-5 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400" />
                            </a>
                            <a
                                href="https://whatsapp.com/channel/0029Vb6XokJG8l5Mw97gst0Q"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-12 h-12 rounded-full bg-white dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 flex items-center justify-center hover:border-green-500 hover:bg-emerald-50 dark:hover:bg-green-900/20 transition-all hover:scale-110 shadow-md"
                                aria-label="WhatsApp"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className='text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400' viewBox="0 0 16 16">
                                    <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
                                </svg>
                            </a>
                        </motion.div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default Home;
