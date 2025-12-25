import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../lib/api';
import ProjectCard from '../components/ProjectCard';
import ProjectCardList from '../components/ProjectCardList';
import DiksuchAI from '../components/DiksuchAI';
import CustomSelect from '../components/CustomSelect';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Search, Filter, Sparkles, TrendingUp, Code2, Layers, PackageSearch, X, Grid3x3, List, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const Projects = () => {
    const { user } = useAuthStore();
    const [searchParams, setSearchParams] = useSearchParams();
    const [projects, setProjects] = useState([]);
    const [allProjects, setAllProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [favoriteIds, setFavoriteIds] = useState([]);
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'rating', 'downloads', 'price-low', 'price-high'
    const [filters, setFilters] = useState({
        difficulty: searchParams.get('difficulty') || '',
        type: searchParams.get('type') || '',
        category: searchParams.get('category') || '',
    });
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
    const searchInputRef = useRef(null);

    // Fetch all projects initially
    const fetchAllProjects = useCallback(async () => {
        let isMounted = true;
        setLoading(true);
        try {
            const [projectsRes, favoritesRes] = await Promise.all([
                api.get('/projects?limit=1000'),
                user ? api.get('/reviews/favorites/my').catch(() => ({ data: { data: [] } })) : Promise.resolve({ data: { data: [] } })
            ]);

            if (isMounted) {
                setAllProjects(projectsRes.data.data.projects);
                setProjects(projectsRes.data.data.projects);
                setFavoriteIds(favoritesRes.data.data.map(p => p._id));
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            if (isMounted) {
                setLoading(false);
            }
        }

        return () => {
            isMounted = false;
        };
    }, [user]);

    useEffect(() => {
        fetchAllProjects();
    }, [fetchAllProjects]);

    // Keyboard shortcut for search (Ctrl+K)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Realtime filtering and sorting
    useEffect(() => {
        let filtered = [...allProjects];

        // Apply search filter
        if (search.trim()) {
            const searchLower = search.toLowerCase();
            filtered = filtered.filter(project =>
                project.title?.toLowerCase().includes(searchLower) ||
                project.description?.toLowerCase().includes(searchLower) ||
                project.tags?.some(tag => tag.toLowerCase().includes(searchLower)) ||
                project.techStack?.some(tech => tech.toLowerCase().includes(searchLower))
            );
        }

        // Apply difficulty filter
        if (filters.difficulty) {
            filtered = filtered.filter(project => project.difficulty === filters.difficulty);
        }

        // Apply type filter
        if (filters.type) {
            filtered = filtered.filter(project => project.type === filters.type);
        }

        // Apply category filter
        if (filters.category) {
            filtered = filtered.filter(project => project.category === filters.category);
        }

        // Apply sorting
        switch (sortBy) {
            case 'newest':
                filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'oldest':
                filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'rating':
                filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'downloads':
                filtered.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
                break;
            case 'price-low':
                filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
                break;
            case 'price-high':
                filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
                break;
            default:
                break;
        }

        setProjects(filtered);
        setCurrentPage(1); // Reset to page 1 when filters change
    }, [search, filters, allProjects, sortBy]);

    // Reset to page 1 when view mode changes
    useEffect(() => {
        setCurrentPage(1);
    }, [viewMode]);

    // Pagination logic
    const itemsPerPage = viewMode === 'grid' ? 9 : 6;
    const totalPages = Math.ceil(projects.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProjects = projects.slice(startIndex, endIndex);

    const goToPage = (page) => {
        setCurrentPage(page);
        // Update URL with page number
        const params = new URLSearchParams(searchParams);
        params.set('page', page.toString());
        setSearchParams(params);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleFavoriteChange = (projectId, isFavorite) => {
        if (isFavorite) {
            setFavoriteIds(prev => [...prev, projectId]);
        } else {
            setFavoriteIds(prev => prev.filter(id => id !== projectId));
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters({ ...filters, [key]: value });
    };

    const clearAllFilters = () => {
        setSearch('');
        setFilters({
            difficulty: '',
            type: '',
            category: '',
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f8faf9] via-white to-[#d8e2dc]/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
            {/* SEO Meta Tags */}
            <Helmet>
                <title>Browse Projects - Free & Premium Source Code | ProjectHub</title>
                <meta name="description" content="Discover and download from our collection of {projects.length}+ projects. Filter by difficulty, category, and technology stack. Free and premium projects available." />
                <meta name="keywords" content="browse projects, source code download, web development, mobile apps, free projects, premium projects, coding examples, project templates" />
                <link rel="canonical" href="https://projecthub.diksuchiedtech.in/projects" />

                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://projecthub.diksuchiedtech.in/projects" />
                <meta property="og:title" content="Browse Projects - ProjectHub" />
                <meta property="og:description" content="Discover and download from our collection of production-ready projects" />

                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:title" content="Browse Projects - ProjectHub" />
                <meta property="twitter:description" content="Discover and download from our collection of production-ready projects" />
            </Helmet>

            <div className="container mx-auto px-4 py-4 max-w-9xl">
                <div className="space-y-4">
                    {/* Search Bar - Top Section - Centered and Small */}
                    <div className="flex justify-center">
                        <div className="relative w-full max-w-xl">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                            <Input
                                ref={searchInputRef}
                                placeholder="Search projects by name, tech stack... (Ctrl+K)"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 pr-9 h-10 text-sm border-2 border-[#d8e2dc] dark:border-slate-600 focus:ring-2 focus:ring-[#2d6a4f] focus:border-[#2d6a4f] rounded-full font-medium bg-white dark:bg-slate-800 shadow-sm"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch('')}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center justify-center transition-colors"
                                    aria-label="Clear search"
                                >
                                    <X className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Header and Filters Bar */}
                    <div>
                        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                            {/* Heading - Left */}
                            <div className="flex-shrink-0">
                                <h1 className="text-5xl font-black text-gray-900 dark:text-white m-y-4">
                                    Browse Projects
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                                    Discover verified projects from our community
                                </p>
                            </div>

                            {/* Filters and Controls - Right */}
                            <div className="flex flex-wrap gap-2 items-center">
                                {/* Category Filter */}
                                <CustomSelect
                                    value={filters.category}
                                    onChange={(value) => handleFilterChange('category', value)}
                                    options={[
                                        { value: 'Web Development', label: 'Web Development' },
                                        { value: 'Mobile App', label: 'Mobile App' },
                                        { value: 'AI/ML', label: 'AI/ML' },
                                        { value: 'Game Development', label: 'Game Development' },
                                        { value: 'Backend', label: 'Backend' },
                                        { value: 'Frontend', label: 'Frontend' },
                                        { value: 'Full Stack', label: 'Full Stack' },
                                        { value: 'DevOps', label: 'DevOps' },
                                        { value: 'Data Science', label: 'Data Science' },
                                    ]}
                                    placeholder="Categories"
                                    className="min-w-[160px]"
                                />

                                {/* Sort Filter */}
                                <CustomSelect
                                    value={sortBy}
                                    onChange={(value) => setSortBy(value)}
                                    options={[
                                        { value: 'newest', label: 'Newest First' },
                                        { value: 'oldest', label: 'Oldest First' },
                                        { value: 'rating', label: 'Highest Rated' },
                                        { value: 'downloads', label: 'Most Downloaded' },
                                        { value: 'price-low', label: 'Price: Low to High' },
                                        { value: 'price-high', label: 'Price: High to Low' },
                                    ]}
                                    placeholder="Sort By"
                                    className="min-w-[140px]"
                                />

                                {/* View Toggle - Same Height */}
                                <div className="flex items-center gap-1 bg-white dark:bg-slate-800 rounded-sm border border-[#d8e2dc] dark:border-slate-600 h-10 overflow-hidden">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`flex items-center justify-center gap-1.5 px-3 font-semibold text-xs transition-all duration-200 ease-in-out h-full ${viewMode === 'grid'
                                            ? 'bg-[#2d6a4f] text-white shadow-sm'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-[#f8faf9] dark:hover:bg-slate-700'
                                            }`}
                                    >
                                        <Grid3x3 className="h-4 w-4" />
                                        <span>Grid</span>
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`flex items-center justify-center gap-1.5 px-3 font-semibold text-xs transition-all duration-200 ease-in-out h-full ${viewMode === 'list'
                                            ? 'bg-[#2d6a4f] text-white shadow-sm'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-[#f8faf9] dark:hover:bg-slate-700'
                                            }`}
                                    >
                                        <List className="h-4 w-4" />
                                        <span>List</span>
                                    </button>
                                </div>

                                {(filters.category || sortBy !== 'newest') && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={clearAllFilters}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-300 dark:border-red-700 font-medium h-10 px-3 text-xs rounded-lg transition-all"
                                    >
                                        <X className="h-3.5 w-3.5 mr-1" />
                                        Clear
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Results Counter */}
                    <div className="flex items-center justify-between">
                        <p className="text-gray-700 dark:text-gray-300 font-semibold text-base">
                            <span className="text-2xl font-black text-[#2d6a4f] dark:text-[#74c69d]">{projects.length}</span>
                            <span className="ml-2">projects found</span>
                            {projects.length > 0 && (
                                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                                    (Showing {startIndex + 1}-{Math.min(endIndex, projects.length)})
                                </span>
                            )}
                        </p>
                        {totalPages > 1 && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Page {currentPage} of {totalPages}
                            </p>
                        )}
                    </div>

                    {/* Projects Grid/List - Compact */}
                    <div>
                        {loading ? (
                            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border-2 border-[#d8e2dc] dark:border-slate-700 shadow-lg">
                                <div className="animate-spin h-12 w-12 border-4 border-[#2d6a4f] border-t-transparent rounded-full mx-auto mb-3"></div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold">Loading amazing projects...</p>
                            </div>
                        ) : projects.length === 0 ? (
                            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border-4 border-dashed border-[#d8e2dc] dark:border-slate-700 shadow-lg">
                                <Layers className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                <p className="text-gray-600 dark:text-gray-400 text-lg font-bold mb-1">No projects found</p>
                                <p className="text-gray-500 dark:text-gray-500 text-xs">Try adjusting your search or filters</p>
                            </div>
                        ) : (
                            <div className={viewMode === 'grid'
                                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                                : 'space-y-4'
                            }>
                                {paginatedProjects.map((project) => (
                                    <div key={project._id}>
                                        {viewMode === 'grid' ? (
                                            <ProjectCard
                                                project={project}
                                                isFavorite={favoriteIds.includes(project._id)}
                                                onFavoriteChange={handleFavoriteChange}
                                            />
                                        ) : (
                                            <ProjectCardList
                                                project={project}
                                                isFavorite={favoriteIds.includes(project._id)}
                                                onFavoriteChange={handleFavoriteChange}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination Controls */}
                        {!loading && totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-8 pb-4">
                                <Button
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-2 border-[#d8e2dc] dark:border-slate-600 hover:bg-[#2d6a4f] hover:text-white dark:hover:bg-[#2d6a4f] disabled:opacity-50 disabled:cursor-not-allowed h-10 px-4 font-semibold"
                                >
                                    Previous
                                </Button>

                                <div className="flex gap-1">
                                    {[...Array(totalPages)].map((_, index) => {
                                        const page = index + 1;
                                        // Show first page, last page, current page, and pages around current
                                        if (
                                            page === 1 ||
                                            page === totalPages ||
                                            (page >= currentPage - 1 && page <= currentPage + 1)
                                        ) {
                                            return (
                                                <Button
                                                    key={page}
                                                    onClick={() => goToPage(page)}
                                                    className={`h-10 w-10 font-bold ${currentPage === page
                                                        ? 'bg-[#2d6a4f] text-white border-2 border-[#2d6a4f]'
                                                        : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-2 border-[#d8e2dc] dark:border-slate-600 hover:bg-[#2d6a4f] hover:text-white dark:hover:bg-[#2d6a4f]'
                                                        }`}
                                                >
                                                    {page}
                                                </Button>
                                            );
                                        } else if (
                                            page === currentPage - 2 ||
                                            page === currentPage + 2
                                        ) {
                                            return (
                                                <span
                                                    key={page}
                                                    className="flex items-center justify-center h-10 w-10 text-gray-500"
                                                >
                                                    ...
                                                </span>
                                            );
                                        }
                                        return null;
                                    })}
                                </div>

                                <Button
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-2 border-[#d8e2dc] dark:border-slate-600 hover:bg-[#2d6a4f] hover:text-white dark:hover:bg-[#2d6a4f] disabled:opacity-50 disabled:cursor-not-allowed h-10 px-4 font-semibold"
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Projects;
