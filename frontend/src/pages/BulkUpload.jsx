import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Download, FileJson, FileSpreadsheet, CheckCircle, XCircle, AlertCircle, Plus, Trash2, Edit } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import api from '../lib/api';
import toast from 'react-hot-toast';

const BulkUpload = () => {
    const [mode, setMode] = useState('form'); // 'form' or 'file'
    const [file, setFile] = useState(null);
    const [projects, setProjects] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [results, setResults] = useState(null);
    const [formProjects, setFormProjects] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingIndex, setEditingIndex] = useState(-1);
    const [currentProject, setCurrentProject] = useState({
        title: '',
        description: '',
        techStack: '',
        difficulty: 'Beginner',
        type: 'free',
        price: 0,
        mode: 'github',
        githubLink: '',
        zipUrl: '',
        screenshots: '',
        tags: '',
        category: 'Web Development'
    });
    const navigate = useNavigate();

    const downloadTemplate = async () => {
        try {
            const response = await api.get('/admin/projects/bulk-upload-template');
            const template = response.data.data;

            // Convert to JSON and download
            const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'bulk-upload-template.json';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success('Template downloaded successfully');
        } catch (error) {
            console.error('Download template error:', error);
            toast.error(error.response?.data?.message || 'Failed to download template');
        }
    };

    const downloadCSVTemplate = () => {
        const csvContent = `title,description,techStack,difficulty,type,price,mode,githubLink,zipUrl,screenshots,tags,category
"Example Project 1","This is a sample project description with at least 50 characters for demonstration.","React|Node.js|MongoDB",Intermediate,free,0,github,https://github.com/username/repo,,https://example.com/screenshot1.jpg|https://example.com/screenshot2.jpg,react|fullstack|mongodb,Web Development
"Example Project 2","This is another sample paid project with detailed description for demonstration purposes.","Python|Django|PostgreSQL",Advanced,paid,99,zip,,https://res.cloudinary.com/example/raw/upload/project.zip,https://example.com/screenshot1.jpg,python|django|backend,Web Development`;

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'bulk-upload-template.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast.success('CSV template downloaded');
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const text = event.target.result;
                let parsedProjects = [];

                if (selectedFile.name.endsWith('.json')) {
                    parsedProjects = JSON.parse(text);
                } else if (selectedFile.name.endsWith('.csv')) {
                    // Simple CSV parsing
                    const lines = text.split('\n');
                    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

                    for (let i = 1; i < lines.length; i++) {
                        if (!lines[i].trim()) continue;

                        const values = lines[i].match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
                        if (!values) continue;

                        const project = {};
                        headers.forEach((header, index) => {
                            let value = values[index]?.trim().replace(/^"|"$/g, '');

                            // Parse arrays (pipe-separated)
                            if (header === 'techStack' || header === 'tags' || header === 'screenshots') {
                                project[header] = value ? value.split('|').map(v => v.trim()) : [];
                            } else if (header === 'price') {
                                project[header] = parseInt(value) || 0;
                            } else {
                                project[header] = value || '';
                            }
                        });
                        parsedProjects.push(project);
                    }
                }

                setProjects(parsedProjects);
                toast.success(`Loaded ${parsedProjects.length} projects from file`);
            } catch (error) {
                console.error('Parse error:', error);
                toast.error('Failed to parse file. Please check format.');
            }
        };

        reader.readAsText(selectedFile);
    };

    const handleBulkUpload = async () => {
        if (!projects || projects.length === 0) {
            toast.error('No projects to upload');
            return;
        }

        setUploading(true);
        try {
            const response = await api.post('/admin/projects/bulk-upload', {
                projects,
                format: file.name.endsWith('.csv') ? 'csv' : 'json',
            });

            setResults(response.data.data.results);
            toast.success(
                `Uploaded ${response.data.data.summary.successful} projects successfully! ${response.data.data.summary.failed > 0
                    ? `${response.data.data.summary.failed} failed.`
                    : ''
                }`
            );
        } catch (error) {
            console.error('Bulk upload error:', error);
            toast.error(error.response?.data?.message || 'Bulk upload failed');
        } finally {
            setUploading(false);
        }
    };

    // Form Mode Functions
    const handleAddProject = () => {
        setCurrentProject({
            title: '',
            description: '',
            techStack: '',
            difficulty: 'Beginner',
            type: 'free',
            price: 0,
            mode: 'github',
            githubLink: '',
            zipUrl: '',
            screenshots: '',
            tags: '',
            category: 'Web Development'
        });
        setEditingIndex(-1);
        setShowForm(true);
    };

    const handleEditProject = (index) => {
        setCurrentProject(formProjects[index]);
        setEditingIndex(index);
        setShowForm(true);
    };

    const handleSaveProject = () => {
        // Validation
        if (!currentProject.title.trim()) {
            toast.error('Project title is required');
            return;
        }
        if (!currentProject.description.trim() || currentProject.description.length < 50) {
            toast.error('Description must be at least 50 characters');
            return;
        }
        if (!currentProject.techStack.trim()) {
            toast.error('Tech stack is required');
            return;
        }

        // Convert strings to arrays for API
        const projectData = {
            ...currentProject,
            techStack: currentProject.techStack.split(',').map(s => s.trim()).filter(Boolean),
            tags: currentProject.tags.split(',').map(s => s.trim()).filter(Boolean),
            screenshots: currentProject.screenshots.split(',').map(s => s.trim()).filter(Boolean),
            price: parseInt(currentProject.price) || 0
        };

        if (editingIndex >= 0) {
            // Edit existing project
            const updated = [...formProjects];
            updated[editingIndex] = projectData;
            setFormProjects(updated);
            toast.success('Project updated successfully');
        } else {
            // Add new project
            setFormProjects([...formProjects, projectData]);
            toast.success('Project added successfully');
        }

        setShowForm(false);
        setCurrentProject({
            title: '',
            description: '',
            techStack: '',
            difficulty: 'Beginner',
            type: 'free',
            price: 0,
            mode: 'github',
            githubLink: '',
            zipUrl: '',
            screenshots: '',
            tags: '',
            category: 'Web Development'
        });
    };

    const handleDeleteProject = (index) => {
        const updated = formProjects.filter((_, i) => i !== index);
        setFormProjects(updated);
        toast.success('Project deleted');
    };

    const handleFormBulkUpload = async () => {
        if (formProjects.length === 0) {
            toast.error('No projects to upload');
            return;
        }

        setUploading(true);
        try {
            const response = await api.post('/admin/projects/bulk-upload', {
                projects: formProjects,
                format: 'json'
            });

            setResults(response.data.data.results);
            toast.success(
                `Uploaded ${response.data.data.summary.successful} projects successfully! ${response.data.data.summary.failed > 0
                    ? `${response.data.data.summary.failed} failed.`
                    : ''
                }`
            );
        } catch (error) {
            console.error('Bulk upload error:', error);
            toast.error(error.response?.data?.message || 'Bulk upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-6 sm:py-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Bulk Upload Projects</h1>
                    <p className="text-muted-foreground">
                        Upload multiple projects using forms or file import (JSON/CSV)
                    </p>

                    {/* Mode Selection */}
                    <div className="flex flex-wrap gap-2 sm:gap-4 mt-4 sm:mt-6">
                        <Button
                            onClick={() => setMode('form')}
                            variant={mode === 'form' ? 'default' : 'outline'}
                            className="flex items-center gap-2"
                        >
                            <Edit className="h-4 w-4" />
                            Form Mode
                        </Button>
                        <Button
                            onClick={() => setMode('file')}
                            variant={mode === 'file' ? 'default' : 'outline'}
                            className="flex items-center gap-2"
                        >
                            <Upload className="h-4 w-4" />
                            File Upload Mode
                        </Button>
                    </div>
                </div>

                {/* Form Mode */}
                {mode === 'form' && (
                    <div className="space-y-6">
                        {/* Form Mode Header */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>Add Projects ({formProjects.length})</span>
                                    <Button onClick={handleAddProject} className="flex items-center gap-2">
                                        <Plus className="h-4 w-4" />
                                        Add New Project
                                    </Button>
                                </CardTitle>
                                <CardDescription>
                                    Add projects one by one using the form below
                                </CardDescription>
                            </CardHeader>
                        </Card>

                        {/* Project List */}
                        {formProjects.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Projects to Upload</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {formProjects.map((project, index) => (
                                            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                                                <div>
                                                    <h4 className="font-semibold">{project.title}</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        {project.techStack.join(', ')} • {project.difficulty} • {project.type}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleEditProject(index)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleDeleteProject(index)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-6 flex gap-4">
                                        <Button
                                            onClick={handleFormBulkUpload}
                                            disabled={formProjects.length === 0 || uploading}
                                            className="flex items-center gap-2"
                                        >
                                            <Upload className="h-4 w-4" />
                                            {uploading ? 'Uploading...' : `Upload ${formProjects.length} Projects`}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => setFormProjects([])}
                                            disabled={formProjects.length === 0}
                                        >
                                            Clear All
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Project Form Modal */}
                        {showForm && (
                            <Card className="border-2 border-blue-200">
                                <CardHeader>
                                    <CardTitle>
                                        {editingIndex >= 0 ? 'Edit Project' : 'Add New Project'}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {/* Title */}
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Project Title *</label>
                                            <input
                                                type="text"
                                                value={currentProject.title}
                                                onChange={(e) => setCurrentProject({ ...currentProject, title: e.target.value })}
                                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                                placeholder="Enter project title"
                                            />
                                        </div>

                                        {/* Category */}
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Category *</label>
                                            <select
                                                value={currentProject.category}
                                                onChange={(e) => setCurrentProject({ ...currentProject, category: e.target.value })}
                                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="Web Development">Web Development</option>
                                                <option value="Mobile App">Mobile App</option>
                                                <option value="Data Science">Data Science</option>
                                                <option value="Machine Learning">Machine Learning</option>
                                                <option value="Game Development">Game Development</option>
                                                <option value="Desktop App">Desktop App</option>
                                                <option value="DevOps">DevOps</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Description * (min 50 chars)</label>
                                        <textarea
                                            value={currentProject.description}
                                            onChange={(e) => setCurrentProject({ ...currentProject, description: e.target.value })}
                                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                            placeholder="Detailed project description..."
                                            rows={4}
                                        />
                                        <div className="text-sm text-muted-foreground mt-1">
                                            {currentProject.description.length}/50 characters
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-3 gap-4">
                                        {/* Difficulty */}
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Difficulty *</label>
                                            <select
                                                value={currentProject.difficulty}
                                                onChange={(e) => setCurrentProject({ ...currentProject, difficulty: e.target.value })}
                                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="Beginner">Beginner</option>
                                                <option value="Intermediate">Intermediate</option>
                                                <option value="Advanced">Advanced</option>
                                            </select>
                                        </div>

                                        {/* Type */}
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Type *</label>
                                            <select
                                                value={currentProject.type}
                                                onChange={(e) => setCurrentProject({ ...currentProject, type: e.target.value })}
                                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="free">Free</option>
                                                <option value="paid">Paid</option>
                                            </select>
                                        </div>

                                        {/* Price */}
                                        {currentProject.type === 'paid' && (
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Price (₹) *</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={currentProject.price}
                                                    onChange={(e) => setCurrentProject({ ...currentProject, price: e.target.value })}
                                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Enter price"
                                                />
                                            </div>
                                        )}

                                        {/* Mode */}
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Mode *</label>
                                            <select
                                                value={currentProject.mode}
                                                onChange={(e) => setCurrentProject({ ...currentProject, mode: e.target.value })}
                                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="github">GitHub Link</option>
                                                <option value="zip">ZIP File</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* GitHub/ZIP URL */}
                                    {currentProject.mode === 'github' ? (
                                        <div>
                                            <label className="block text-sm font-medium mb-1">GitHub Link *</label>
                                            <input
                                                type="url"
                                                value={currentProject.githubLink}
                                                onChange={(e) => setCurrentProject({ ...currentProject, githubLink: e.target.value })}
                                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                                placeholder="https://github.com/username/repo"
                                            />
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="block text-sm font-medium mb-1">ZIP URL *</label>
                                            <input
                                                type="url"
                                                value={currentProject.zipUrl}
                                                onChange={(e) => setCurrentProject({ ...currentProject, zipUrl: e.target.value })}
                                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                                placeholder="https://res.cloudinary.com/..."
                                            />
                                        </div>
                                    )}

                                    {/* Tech Stack */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Tech Stack * (comma separated)</label>
                                        <input
                                            type="text"
                                            value={currentProject.techStack}
                                            onChange={(e) => setCurrentProject({ ...currentProject, techStack: e.target.value })}
                                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                            placeholder="React, Node.js, MongoDB"
                                        />
                                    </div>

                                    {/* Tags */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                                        <input
                                            type="text"
                                            value={currentProject.tags}
                                            onChange={(e) => setCurrentProject({ ...currentProject, tags: e.target.value })}
                                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                            placeholder="react, fullstack, mongodb"
                                        />
                                    </div>

                                    {/* Screenshots */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Screenshots (comma separated URLs)</label>
                                        <input
                                            type="text"
                                            value={currentProject.screenshots}
                                            onChange={(e) => setCurrentProject({ ...currentProject, screenshots: e.target.value })}
                                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                            placeholder="https://image1.jpg, https://image2.jpg"
                                        />
                                    </div>

                                    {/* Form Actions */}
                                    <div className="flex gap-4 pt-4">
                                        <Button onClick={handleSaveProject} className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4" />
                                            {editingIndex >= 0 ? 'Update Project' : 'Add Project'}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowForm(false)}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}

                {/* File Upload Mode */}
                {mode === 'file' && (
                    <>
                        {/* Template Download Cards */}
                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <FileJson className="h-8 w-8 text-blue-500" />
                                        <div>
                                            <CardTitle>JSON Template</CardTitle>
                                            <CardDescription>Recommended for complex data</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Download a JSON template with example projects. Supports arrays and nested data.
                                    </p>
                                    <Button onClick={downloadTemplate} variant="outline" className="w-full">
                                        <Download className="mr-2 h-4 w-4" />
                                        Download JSON Template
                                    </Button>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <FileSpreadsheet className="h-8 w-8 text-green-500" />
                                        <div>
                                            <CardTitle>CSV Template</CardTitle>
                                            <CardDescription>Easy to edit in Excel/Sheets</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Download a CSV template. Use pipe (|) separator for arrays.
                                    </p>
                                    <Button onClick={downloadCSVTemplate} variant="outline" className="w-full">
                                        <Download className="mr-2 h-4 w-4" />
                                        Download CSV Template
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Upload Section */}
                        <Card className="mb-8">
                            <CardHeader>
                                <CardTitle>Upload Projects File</CardTitle>
                                <CardDescription>
                                    Select a JSON or CSV file containing your projects
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
                                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                    <input
                                        type="file"
                                        accept=".json,.csv"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="file-upload"
                                    />
                                    <label htmlFor="file-upload" className="cursor-pointer">
                                        <span className="text-primary hover:text-primary/80 font-medium">
                                            Click to upload
                                        </span>
                                        <span className="text-muted-foreground"> or drag and drop</span>
                                    </label>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        JSON or CSV files only
                                    </p>
                                </div>

                                {file && (
                                    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {file.name.endsWith('.json') ? (
                                                    <FileJson className="h-8 w-8 text-blue-500" />
                                                ) : (
                                                    <FileSpreadsheet className="h-8 w-8 text-green-500" />
                                                )}
                                                <div>
                                                    <p className="font-medium">{file.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {projects.length} projects loaded
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                onClick={handleBulkUpload}
                                                disabled={uploading || projects.length === 0}
                                            >
                                                {uploading ? 'Uploading...' : 'Upload All Projects'}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Results */}
                        {results && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Upload Results</CardTitle>
                                    <CardDescription>
                                        Summary of bulk upload operation
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Summary */}
                                    <div className="grid grid-cols-3 gap-4 mb-6">
                                        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 text-center">
                                            <p className="text-2xl font-bold text-blue-600">{results.total}</p>
                                            <p className="text-sm text-muted-foreground">Total</p>
                                        </div>
                                        <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 text-center">
                                            <p className="text-2xl font-bold text-green-600">
                                                {results.success.length}
                                            </p>
                                            <p className="text-sm text-muted-foreground">Successful</p>
                                        </div>
                                        <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-4 text-center">
                                            <p className="text-2xl font-bold text-red-600">
                                                {results.failed.length}
                                            </p>
                                            <p className="text-sm text-muted-foreground">Failed</p>
                                        </div>
                                    </div>

                                    {/* Success List */}
                                    {results.success.length > 0 && (
                                        <div>
                                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                                <CheckCircle className="h-5 w-5 text-green-600" />
                                                Successfully Uploaded
                                            </h3>
                                            <div className="space-y-2">
                                                {results.success.map((item, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg"
                                                    >
                                                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                                                        <span className="text-sm">
                                                            #{item.index} - {item.title}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Failed List */}
                                    {results.failed.length > 0 && (
                                        <div>
                                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                                <XCircle className="h-5 w-5 text-red-600" />
                                                Failed Uploads
                                            </h3>
                                            <div className="space-y-2">
                                                {results.failed.map((item, index) => (
                                                    <div
                                                        key={index}
                                                        className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg"
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <XCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                                                            <div className="flex-1">
                                                                <p className="text-sm font-medium">
                                                                    #{item.index} - {item.data?.title || 'Untitled'}
                                                                </p>
                                                                <p className="text-xs text-red-600 mt-1">
                                                                    {item.error}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-4 border-t">
                                        <Button onClick={() => navigate('/admin')} variant="outline" className="w-full">
                                            Back to Admin Dashboard
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Instructions */}
                        <Card className="mt-8">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5 text-blue-500" />
                                    <CardTitle>Instructions</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm text-muted-foreground">
                                <div>
                                    <h4 className="font-semibold text-foreground mb-1">Required Fields:</h4>
                                    <ul className="list-disc list-inside space-y-1 ml-2">
                                        <li>title - Project title</li>
                                        <li>description - Project description (min 50 characters)</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground mb-1">Optional Fields:</h4>
                                    <ul className="list-disc list-inside space-y-1 ml-2">
                                        <li>techStack - Array of technologies (e.g., ["React", "Node.js"])</li>
                                        <li>difficulty - Beginner, Intermediate, or Advanced (default: Beginner)</li>
                                        <li>type - free or paid (default: free)</li>
                                        <li>price - 0, 49, 99, or 299 (default: 0)</li>
                                        <li>mode - zip or github (default: github)</li>
                                        <li>githubLink - GitHub repository URL (required if mode=github)</li>
                                        <li>zipUrl - Cloudinary ZIP URL (required if mode=zip)</li>
                                        <li>screenshots - Array of image URLs</li>
                                        <li>tags - Array of tags</li>
                                        <li>category - Web Development, Mobile App, AI/ML, etc.</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-foreground mb-1">CSV Format Notes:</h4>
                                    <ul className="list-disc list-inside space-y-1 ml-2">
                                        <li>Use pipe (|) to separate array values</li>
                                        <li>Example: "React|Node.js|MongoDB" for techStack</li>
                                        <li>Enclose values with commas in quotes</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}

                {/* Results Section (common for both modes) */}
                {results && (
                    <Card className="mt-8">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                Upload Results
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex gap-4 text-sm">
                                    <span className="text-green-600">✅ Successful: {results.summary?.successful || 0}</span>
                                    <span className="text-red-600">❌ Failed: {results.summary?.failed || 0}</span>
                                    <span className="text-gray-600">📊 Total: {results.summary?.total || 0}</span>
                                </div>

                                {results.details && results.details.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="font-medium mb-2">Upload Details:</h4>
                                        <div className="space-y-2 max-h-60 overflow-y-auto">
                                            {results.details.map((item, index) => (
                                                <div key={index} className={`p-3 rounded-lg ${item.success ? 'bg-green-50' : 'bg-red-50'}`}>
                                                    <div className="flex items-start gap-3">
                                                        {item.success ? (
                                                            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                                                        ) : (
                                                            <XCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                                                        )}
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium">
                                                                #{item.index} - {item.data?.title || 'Untitled'}
                                                            </p>
                                                            {item.error && (
                                                                <p className="text-xs text-red-600 mt-1">
                                                                    {item.error}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="pt-4 border-t">
                                    <Button onClick={() => navigate('/admin')} variant="outline" className="w-full">
                                        Back to Admin Dashboard
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default BulkUpload;
