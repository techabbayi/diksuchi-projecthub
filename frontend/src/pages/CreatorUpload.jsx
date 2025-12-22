import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import toast from 'react-hot-toast';
import { Upload, X } from 'lucide-react';

const CreatorUpload = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [uploadingFiles, setUploadingFiles] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        techStack: '',
        difficulty: 'Beginner',
        type: 'free',
        price: 0,
        mode: 'github',
        zipUrl: '',
        githubLink: '',
        guideUrl: '',
        screenshots: [],
        tags: '',
        category: 'Web Development',
    });

    const handleFileUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingFiles(true);
        const formDataFile = new FormData();
        formDataFile.append('file', file);
        formDataFile.append('fileType', type);

        try {
            const { data } = await api.post('/projects/upload', formDataFile, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (type === 'zip') {
                setFormData({ ...formData, zipUrl: data.data.url });
                toast.success('ZIP file uploaded!');
            } else {
                setFormData({
                    ...formData,
                    screenshots: [...formData.screenshots, data.data.url],
                });
                toast.success('Screenshot uploaded!');
            }
        } catch (error) {
            toast.error('Upload failed');
        } finally {
            setUploadingFiles(false);
        }
    };

    const removeScreenshot = (index) => {
        setFormData({
            ...formData,
            screenshots: formData.screenshots.filter((_, i) => i !== index),
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                techStack: formData.techStack.split(',').map((t) => t.trim()),
                tags: formData.tags.split(',').map((t) => t.trim()),
                price: formData.type === 'free' ? 0 : parseInt(formData.price, 10),
            };

            await api.post('/projects', payload);

            if (user?.role === 'admin') {
                toast.success('Project uploaded successfully!');
                navigate('/admin/dashboard');
            } else {
                toast.success('Project submitted for review!');
                navigate('/creator/dashboard');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Upload failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
            <div className="space-y-4 sm:space-y-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading">Upload Project</h1>
                    <p className="text-sm sm:text-base text-muted-foreground mt-2">
                        {user?.role === 'admin'
                            ? 'Upload and publish projects directly to the platform.'
                            : 'Share your project with the community. All projects are reviewed by admins.'}
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Project Details</CardTitle>
                        <CardDescription>Fill in the information about your project</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Title */}
                            <div className="space-y-2">
                                <Label htmlFor="title">Project Title *</Label>
                                <Input
                                    id="title"
                                    placeholder="Amazing Full Stack App"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Description *</Label>
                                <textarea
                                    id="description"
                                    placeholder="Describe your project in detail..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    required
                                />
                            </div>

                            {/* Tech Stack */}
                            <div className="space-y-2">
                                <Label htmlFor="techStack">Tech Stack (comma-separated) *</Label>
                                <Input
                                    id="techStack"
                                    placeholder="React, Node.js, MongoDB"
                                    value={formData.techStack}
                                    onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                                    required
                                />
                            </div>

                            {/* Category and Difficulty */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category *</Label>
                                    <select
                                        id="category"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="Web Development">Web Development</option>
                                        <option value="Mobile App">Mobile App</option>
                                        <option value="AI/ML">AI/ML</option>
                                        <option value="Game Development">Game Development</option>
                                        <option value="DevOps">DevOps</option>
                                        <option value="Data Science">Data Science</option>
                                        <option value="Blockchain">Blockchain</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="difficulty">Difficulty *</Label>
                                    <select
                                        id="difficulty"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={formData.difficulty}
                                        onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                    >
                                        <option value="Beginner">Beginner</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced">Advanced</option>
                                    </select>
                                </div>
                            </div>

                            {/* Type and Price */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="type">Project Type *</Label>
                                    <select
                                        id="type"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value, price: e.target.value === 'free' ? 0 : 49 })}
                                    >
                                        <option value="free">Free</option>
                                        <option value="paid">Paid</option>
                                    </select>
                                </div>

                                {formData.type === 'paid' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="price">Price (₹) *</Label>
                                        <select
                                            id="price"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        >
                                            <option value="49">₹49 (Mini)</option>
                                            <option value="99">₹99 (Medium)</option>
                                            <option value="299">₹299 (Full Stack)</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* Upload Mode */}
                            <div className="space-y-2">
                                <Label htmlFor="mode">Upload Mode *</Label>
                                <select
                                    id="mode"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={formData.mode}
                                    onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                                >
                                    <option value="github">GitHub Link</option>
                                    <option value="zip">ZIP Upload</option>
                                </select>
                            </div>

                            {/* GitHub Link or ZIP Upload */}
                            {formData.mode === 'github' ? (
                                <div className="space-y-2">
                                    <Label htmlFor="githubLink">GitHub Repository URL *</Label>
                                    <Input
                                        id="githubLink"
                                        type="url"
                                        placeholder="https://github.com/username/repo"
                                        value={formData.githubLink}
                                        onChange={(e) => setFormData({ ...formData, githubLink: e.target.value })}
                                        required
                                    />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Label htmlFor="zipFile">Upload ZIP File *</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            id="zipFile"
                                            type="file"
                                            accept=".zip"
                                            onChange={(e) => handleFileUpload(e, 'zip')}
                                            disabled={uploadingFiles}
                                        />
                                        {formData.zipUrl && (
                                            <Badge variant="secondary" className="text-green-600">
                                                ✓ Uploaded
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Screenshots */}
                            <div className="space-y-2">
                                <Label htmlFor="screenshots">Screenshots (at least 1 required) *</Label>
                                <Input
                                    id="screenshots"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileUpload(e, 'image')}
                                    disabled={uploadingFiles}
                                />
                                <div className="grid grid-cols-3 gap-2 mt-2">
                                    {formData.screenshots.map((screenshot, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={screenshot}
                                                alt={`Screenshot ${index + 1}`}
                                                className="w-full h-32 object-cover rounded-md"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeScreenshot(index)}
                                                className="absolute top-1 right-1 bg-destructive text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Tags */}
                            <div className="space-y-2">
                                <Label htmlFor="tags">Tags (comma-separated)</Label>
                                <Input
                                    id="tags"
                                    placeholder="fullstack, ecommerce, responsive"
                                    value={formData.tags}
                                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                />
                            </div>

                            {/* Guide URL */}
                            <div className="space-y-2">
                                <Label htmlFor="guideUrl">Documentation/Guide URL (optional)</Label>
                                <Input
                                    id="guideUrl"
                                    type="url"
                                    placeholder="https://docs.example.com"
                                    value={formData.guideUrl}
                                    onChange={(e) => setFormData({ ...formData, guideUrl: e.target.value })}
                                />
                            </div>

                            {/* Submit */}
                            <div className="flex gap-4">
                                <Button type="submit" disabled={loading || uploadingFiles} className="flex-1">
                                    {loading ? 'Uploading...' : (user?.role === 'admin' ? 'Upload Project' : 'Submit for Review')}
                                </Button>
                                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                                    Cancel
                                </Button>
                            </div>

                            {user?.role !== 'admin' && (
                                <div className="bg-muted p-4 rounded-md text-sm text-muted-foreground">
                                    <p>
                                        <strong>Note:</strong> Your project will be reviewed by our admin team before it
                                        becomes publicly available. This usually takes 24-48 hours.
                                    </p>
                                </div>
                            )}
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default CreatorUpload;
