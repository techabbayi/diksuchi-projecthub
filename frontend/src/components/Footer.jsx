import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Github, Twitter, Mail, ExternalLink, Instagram, Youtube, Linkedin, MessageCircle } from 'lucide-react';
import { useEffect } from 'react';

const Footer = () => {
    const location = useLocation();
    const isHomePage = location.pathname === '/';

    const handleLinkClick = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <div className="container mx-auto px-4 py-12">
                <div className={`grid grid-cols-1 ${isHomePage ? 'md:grid-cols-3' : 'md:grid-cols-4'} gap-8`}>
                    {/* Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-xl shadow-lg" style={{ backgroundColor: '#2d6a4f' }}>
                                <Sparkles className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold" style={{ color: '#2d6a4f' }}>
                                ProjectHub
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-500 ml-1">
                            Powered by{' '}
                            <a
                                href="https://diksuchi-landing.vercel.app/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold inline-flex items-center gap-1 transition-colors hover:opacity-80"
                                style={{ color: '#2d6a4f' }}
                            >
                                Diksuchi
                                <ExternalLink className="h-3 w-3" />
                            </a>
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Your marketplace for quality projects. Download, learn, and build amazing things.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link to="/projects" onClick={handleLinkClick} className="text-gray-600 dark:text-gray-400 hover:opacity-80 transition-colors" style={{ color: '#6b7280' }}>
                                    Browse Projects
                                </Link>
                            </li>
                            <li>
                                <Link to="/project-builder" onClick={handleLinkClick} className="text-gray-600 dark:text-gray-400 hover:opacity-80 transition-colors" style={{ color: '#6b7280' }}>
                                    AI Project Builder
                                </Link>
                            </li>
                            <li>
                                <Link to="/support" onClick={handleLinkClick} className="text-gray-600 dark:text-gray-400 hover:opacity-80 transition-colors" style={{ color: '#6b7280' }}>
                                    Support Center
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Legal</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link to="/privacy-policy" onClick={handleLinkClick} className="text-gray-600 dark:text-gray-400 hover:opacity-80 transition-colors" style={{ color: '#6b7280' }}>
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link to="/terms-conditions" onClick={handleLinkClick} className="text-gray-600 dark:text-gray-400 hover:opacity-80 transition-colors" style={{ color: '#6b7280' }}>
                                    Terms & Conditions
                                </Link>
                            </li>
                            <li>
                                <Link to="/refund-policy" onClick={handleLinkClick} className="text-gray-600 dark:text-gray-400 hover:opacity-80 transition-colors" style={{ color: '#6b7280' }}>
                                    Refund Policy
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Connect With Us - Only for non-home pages */}
                    {!isHomePage && (
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Connect With Us</h3>
                            <div className="flex gap-3">
                                <a
                                    href="https://www.instagram.com/diksuchedtech"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center hover:bg-pink-500 dark:hover:bg-pink-600 transition-all hover:scale-110 group"
                                    aria-label="Instagram"
                                >
                                    <Instagram className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-white" />
                                </a>
                                <a
                                    href="https://www.youtube.com/@diksuchiedtech"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center hover:bg-red-500 dark:hover:bg-red-600 transition-all hover:scale-110 group"
                                    aria-label="YouTube"
                                >
                                    <Youtube className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-white" />
                                </a>
                                <a
                                    href="https://www.linkedin.com/in/diksuchi-edtech-8282b1393"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center hover:bg-blue-500 dark:hover:bg-blue-600 transition-all hover:scale-110 group"
                                    aria-label="LinkedIn"
                                >
                                    <Linkedin className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-white" />
                                </a>
                                <a
                                    href="https://whatsapp.com/channel/0029Vb6XokJG8l5Mw97gst0Q"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center hover:bg-green-500 dark:hover:bg-green-600 transition-all hover:scale-110 group"
                                    aria-label="WhatsApp"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-gray-600 dark:text-gray-400 group-hover:text-white" viewBox="0 0 16 16">
                                        <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                <div className="border-t border-gray-200 dark:border-slate-700 mt-8 pt-8 text-center text-sm text-gray-600 dark:text-gray-400">
                    <p>&copy; {new Date().getFullYear()} ProjectHub. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
