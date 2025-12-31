import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { Button } from './ui/Button';
import { Moon, Sun, Menu, X, Sparkles, User, LogOut, LayoutGrid, Grid3x3, FileText, HelpCircle, ShieldCheck, UserCircle2, Upload, LayoutDashboard, Code2, Bot } from 'lucide-react';
import { useState, useEffect } from 'react';

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuthStore();
    const { theme, toggleTheme } = useThemeStore();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    // Handle keyboard navigation for user menu
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (showUserMenu && e.key === 'Escape') {
                setShowUserMenu(false);
            }
        };

        if (showUserMenu) {
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [showUserMenu]);

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            if (showUserMenu) setShowUserMenu(false);
        };

        if (showUserMenu) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [showUserMenu]);

    return (
        <nav className="sticky top-0 w-full z-50 border-b border-border/40 bg-[#f8faf9]/80 dark:bg-gray-800 backdrop-blur-xl">
            <div className="w-full px-4 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-3 group">
                        <div className="p-2 bg-[#2d6a4f] rounded-xl shadow-lg group-hover:shadow-[#2d6a4f]/25 transition-all duration-300 group-hover:scale-105">
                            <svg className="h-6 w-6 text-[#f8faf9]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2L3 7L12 12L21 7L12 2Z" fill="currentColor" fillOpacity="0.9" />
                                <path d="M3 17L12 22L21 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M3 12L12 17L21 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="12" cy="7" r="1.5" fill="#f8faf9" />
                            </svg>
                        </div>
                        <div className="hidden sm:flex flex-col">
                            <span className="text-2xl font-bold text-[#2d6a4f] dark:text-[#74c69d] leading-tight">
                                ProjectHub
                            </span>
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium -mt-1">
                                powered by diksuchi
                            </span>
                        </div>
                    </Link>

                    {/* Center Navigation */}
                    <div className="hidden md:flex items-center space-x-1">
                        <Link to="/projects">
                            <Button variant="ghost" className="text-sm font-medium gap-2">
                                <Grid3x3 className="h-4 w-4" />
                                Browse Projects
                            </Button>
                        </Link>
                        {isAuthenticated && (user?.role === 'admin' || user?.role === 'creator') && (
                            <Link to="/creator/upload">
                                <Button variant="ghost" className="text-sm font-medium gap-2">
                                    <Upload className="h-4 w-4" />
                                    Upload Project
                                </Button>
                            </Link>
                        )}
                        {isAuthenticated && user?.role !== 'admin' && (
                            <Link to="/project-builder">
                                <Button variant="ghost" className="text-sm font-medium gap-2">
                                    <Sparkles className="h-4 w-4" />
                                    Project Builder
                                </Button>
                            </Link>
                        )}
                        {isAuthenticated && (
                            <Link to="/diksuchi-ai">
                                <Button variant="ghost" className="text-sm font-medium gap-2">
                                    <Bot className="h-4 w-4" />
                                    Diksuchi-AI
                                </Button>
                            </Link>
                        )}
                        {isAuthenticated && (
                            <Link to="/dashboard">
                                <Button variant="ghost" className="text-sm font-medium gap-2">
                                    <LayoutGrid className="h-4 w-4" />
                                    Dashboard
                                </Button>
                            </Link>
                        )}
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center space-x-2">
                        {/* Theme Toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleTheme}
                            className="relative rounded-full hover:bg-[#d8e2dc] dark:hover:bg-[#2d6a4f]/20"
                            aria-label="Toggle theme"
                        >
                            {theme === 'light' ? (
                                <Moon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            ) : (
                                <Sun className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            )}
                        </Button>

                        {/* Auth Buttons */}
                        {isAuthenticated ? (
                            <>
                                {/* Desktop User Menu */}
                                <div className="hidden relative md:flex items-center space-x-2">
                                    <div className="relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowUserMenu(!showUserMenu);
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    setShowUserMenu(!showUserMenu);
                                                }
                                            }}
                                            className="flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-[#d8e2dc] dark:hover:bg-slate-800 transition-colors"
                                            aria-label="User menu"
                                            aria-expanded={showUserMenu}
                                            aria-haspopup="true"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-[#2ec4b6] flex items-center justify-center text-[#f8faf9] font-semibold text-sm shadow-md">
                                                {user?.name?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                            <span className="text-sm font-medium hidden lg:block">{user?.name || user?.username}</span>
                                        </button>

                                        {showUserMenu && (
                                            <>
                                                <div
                                                    className="fixed inset-0 z-40"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowUserMenu(false);
                                                    }}
                                                ></div>
                                                <div className="absolute top-14 -right-2 mt-2 min-w-[320px] bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 z-50 overflow-hidden">
                                                    {/* User Info Header - Clean and Spacious */}
                                                    <div className="px-5 py-4 bg-gradient-to-br from-[#2ec4b6]/5 to-[#2d6a4f]/5 dark:from-[#2ec4b6]/10 dark:to-[#2d6a4f]/10 border-b border-gray-100 dark:border-slate-700/50">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#2ec4b6] to-[#2d6a4f] flex items-center justify-center text-white font-bold text-xl shadow-lg ring-2 ring-white dark:ring-slate-800">
                                                                {user?.name?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U'}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-bold text-gray-900 dark:text-white break-words line-clamp-1">
                                                                    {user?.name || user?.username}
                                                                </p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400 break-words line-clamp-1 mt-0.5">
                                                                    {user?.email}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Menu Items - Properly Spaced */}
                                                    <div className="py-2 px-2">
                                                        <Link
                                                            to="/profile"
                                                            onClick={() => setShowUserMenu(false)}
                                                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-[#2ec4b6]/10 dark:hover:bg-[#2d6a4f]/20 transition-all duration-150 group"
                                                        >
                                                            <div className="w-9 h-9 rounded-lg bg-[#2ec4b6]/10 dark:bg-[#2ec4b6]/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                                                <User className="h-4.5 w-4.5 text-[#2ec4b6]" />
                                                            </div>
                                                            <span className="flex-1">Profile Settings</span>
                                                        </Link>
                                                        <Link
                                                            to="/privacy-policy"
                                                            onClick={() => setShowUserMenu(false)}
                                                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-150 group"
                                                        >
                                                            <div className="w-9 h-9 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                                                <ShieldCheck className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
                                                            </div>
                                                            <span className="flex-1">Privacy Policy</span>
                                                        </Link>
                                                        <Link
                                                            to="/terms-conditions"
                                                            onClick={() => setShowUserMenu(false)}
                                                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-150 group"
                                                        >
                                                            <div className="w-9 h-9 rounded-lg bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                                                <FileText className="h-4.5 w-4.5 text-purple-600 dark:text-purple-400" />
                                                            </div>
                                                            <span className="flex-1">Terms & Conditions</span>
                                                        </Link>
                                                        <Link
                                                            to="/support"
                                                            onClick={() => setShowUserMenu(false)}
                                                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all duration-150 group"
                                                        >
                                                            <div className="w-9 h-9 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                                                <HelpCircle className="h-4.5 w-4.5 text-amber-600 dark:text-amber-400" />
                                                            </div>
                                                            <span className="flex-1">Support</span>
                                                        </Link>
                                                    </div>

                                                    {/* Logout Section - Prominent */}
                                                    <div className="border-t border-gray-100 dark:border-slate-700/50 p-2">
                                                        <button
                                                            onClick={() => { logout(); setShowUserMenu(false); }}
                                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-150 group"
                                                        >
                                                            <div className="w-9 h-9 rounded-lg bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                                                <LogOut className="h-4.5 w-4.5" />
                                                            </div>
                                                            <span className="flex-1 text-left">Logout</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="hidden md:flex items-center space-x-2">
                                <Link to="/login">
                                    <Button variant="ghost" className="text-sm font-medium">Login</Button>
                                </Link>
                                <Link to="/register">
                                    <Button className="text-sm font-medium bg-[#2d6a4f] hover:bg-[#74c69d] text-[#f8faf9] shadow-lg shadow-[#2d6a4f]/15">
                                        Sign Up
                                    </Button>
                                </Link>
                            </div>
                        )}

                        {/* Mobile Menu Button - Only show on mobile */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden rounded-full"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle mobile menu"
                            aria-expanded={mobileMenuOpen}
                        >
                            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-[#f8faf9] dark:bg-slate-800 border-t border-[#d8e2dc] dark:border-slate-700 shadow-xl">
                        <div className="container mx-auto px-4 py-4 space-y-1">
                            {isAuthenticated && (
                                <>
                                    <div
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center space-x-3 px-3 py-3 mb-3 bg-[#d8e2dc] dark:bg-[#2d6a4f]/20 rounded-xl cursor-pointer"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-[#2ec4b6] flex items-center justify-center text-[#f8faf9] font-semibold shadow-md">
                                            {user?.name?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-[#f8faf9]">{user?.name || user?.username}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                                        </div>
                                    </div>
                                    <Link to="/projects" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-[#d8e2dc] dark:hover:bg-[#2d6a4f]/20 rounded-lg transition-colors">
                                        <Code2 className="h-5 w-5" />
                                        <span>Browse Projects</span>
                                    </Link>
                                    <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-[#d8e2dc] dark:hover:bg-[#2d6a4f]/20 rounded-lg transition-colors">
                                        <LayoutDashboard className="h-5 w-5" />
                                        <span>Dashboard</span>
                                    </Link>
                                    <div className="border-t border-[#d8e2dc] dark:border-slate-700 my-2"></div>
                                    <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-[#d8e2dc] dark:hover:bg-[#2d6a4f]/20 rounded-lg transition-colors">
                                        <User className="h-5 w-5" />
                                        <span>Profile Settings</span>
                                    </Link>
                                    <Link to="/privacy-policy" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-[#d8e2dc] dark:hover:bg-[#2d6a4f]/20 rounded-lg transition-colors">
                                        <ShieldCheck className="h-5 w-5" />
                                        <span>Privacy Policy</span>
                                    </Link>
                                    <Link to="/terms-conditions" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-[#d8e2dc] dark:hover:bg-[#2d6a4f]/20 rounded-lg transition-colors">
                                        <FileText className="h-5 w-5" />
                                        <span>Terms & Conditions</span>
                                    </Link>
                                    <Link to="/support" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-[#d8e2dc] dark:hover:bg-[#2d6a4f]/20 rounded-lg transition-colors">
                                        <HelpCircle className="h-5 w-5" />
                                        <span>Support</span>
                                    </Link>
                                    <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                        <LogOut className="h-5 w-5" />
                                        <span>Logout</span>
                                    </button>
                                </>
                            )}
                            {!isAuthenticated && (
                                <>
                                    <Link to="/projects" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-[#d8e2dc] dark:hover:bg-[#2d6a4f]/20 rounded-lg transition-colors">
                                        <Code2 className="h-5 w-5" />
                                        <span>Browse Projects</span>
                                    </Link>
                                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                                        <Button variant="ghost" className="w-full justify-start text-sm font-medium">Login</Button>
                                    </Link>
                                    <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                                        <Button className="w-full justify-start text-sm font-medium bg-[#2d6a4f] hover:bg-[#74c69d] text-[#f8faf9] shadow-lg shadow-[#2d6a4f]/15">
                                            Sign Up
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
