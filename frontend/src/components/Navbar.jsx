import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { Button } from './ui/Button';
import { Moon, Sun, Menu, X, Sparkles, User, LogOut, LayoutGrid, Grid3x3, FileText, HelpCircle, ShieldCheck, UserCircle2, Upload, LayoutDashboard, Code2, Bot } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuthStore();
    const { theme, toggleTheme } = useThemeStore();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

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
                                <div className="hidden md:flex items-center space-x-2">
                                    <div >
                                        <button
                                            onClick={() => setShowUserMenu(!showUserMenu)}
                                            className="flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-[#d8e2dc] dark:hover:bg-slate-800 transition-colors"
                                            aria-label="User menu"
                                            aria-expanded={showUserMenu}
                                        >
                                            <div className="w-8 h-8 rounded-full bg-[#2ec4b6] flex items-center justify-center text-[#f8faf9] font-semibold text-sm shadow-md">
                                                {user?.name?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                            <span className="text-sm font-medium hidden lg:block">{user?.name || user?.username}</span>
                                        </button>

                                        {showUserMenu && (
                                            <>
                                                <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)}></div>
                                                <div
                                                    className="absolute right-0 mt-3 w-56 bg-[#f8faf9] dark:bg-slate-800 rounded-xl shadow-2xl border border-[#d8e2dc] dark:border-slate-700 z-50"
                                                    style={{ overflow: 'visible' }}
                                                >
                                                    <div className="px-4 py-3 border-b border-[#d8e2dc] dark:border-slate-700">
                                                        <p className="text-sm font-semibold text-gray-900 dark:text-[#f8faf9] truncate">{user?.name || user?.username}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{user?.email}</p>
                                                    </div>
                                                    <div className="py-1">
                                                        <Link
                                                            to="/profile"
                                                            onClick={() => setShowUserMenu(false)}
                                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-[#d8e2dc] dark:hover:bg-[#2d6a4f]/20 transition-colors w-full"
                                                        >
                                                            <User className="h-4 w-4 shrink-0" />
                                                            <span className="whitespace-nowrap">Profile Settings</span>
                                                        </Link>
                                                        <Link
                                                            to="/privacy-policy"
                                                            onClick={() => setShowUserMenu(false)}
                                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-[#d8e2dc] dark:hover:bg-[#2d6a4f]/20 transition-colors w-full"
                                                        >
                                                            <ShieldCheck className="h-4 w-4 shrink-0" />
                                                            <span className="whitespace-nowrap">Privacy Policy</span>
                                                        </Link>
                                                        <Link
                                                            to="/terms-conditions"
                                                            onClick={() => setShowUserMenu(false)}
                                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-[#d8e2dc] dark:hover:bg-[#2d6a4f]/20 transition-colors w-full"
                                                        >
                                                            <FileText className="h-4 w-4 shrink-0" />
                                                            <span className="whitespace-nowrap">Terms & Conditions</span>
                                                        </Link>
                                                        <Link
                                                            to="/support"
                                                            onClick={() => setShowUserMenu(false)}
                                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-[#d8e2dc] dark:hover:bg-[#2d6a4f]/20 transition-colors w-full"
                                                        >
                                                            <HelpCircle className="h-4 w-4 shrink-0" />
                                                            <span className="whitespace-nowrap">Support</span>
                                                        </Link>
                                                    </div>
                                                    <div className="border-t border-[#d8e2dc] dark:border-slate-700"></div>
                                                    <div className="py-1">
                                                        <button
                                                            onClick={() => { logout(); setShowUserMenu(false); }}
                                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                        >
                                                            <LogOut className="h-4 w-4 shrink-0" />
                                                            <span className="whitespace-nowrap">Logout</span>
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
                                    <div className="flex items-center space-x-3 px-3 py-3 mb-3 bg-[#d8e2dc] dark:bg-[#2d6a4f]/20 rounded-xl">
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
