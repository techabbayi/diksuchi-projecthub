import { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, File, FolderOpen, FileCode, FileCog, FileJson, BookOpen, Clock, Lightbulb, X } from 'lucide-react';
import { Card } from '../ui/Card';

const getFileIcon = (fileName) => {
    if (!fileName) return File;
    const ext = fileName.split('.').pop()?.toLowerCase();
    const icons = {
        'js': FileCode,
        'jsx': FileCode,
        'ts': FileCode,
        'tsx': FileCode,
        'py': FileCode,
        'java': FileCode,
        'json': FileJson,
        'config': FileCog,
        'env': FileCog,
        'md': BookOpen,
    };
    return icons[ext] || File;
};

const FolderStructureTree = ({ structure, fileDocumentation = [] }) => {
    const [expandAll, setExpandAll] = useState(null); // null = natural state, true = force expand, false = force collapse
    const [selectedFile, setSelectedFile] = useState(null);

    // Build full path for a node by traversing up the tree
    const buildFullPath = (nodeName, parentPath = '') => {
        return parentPath ? `${parentPath}/${nodeName}` : nodeName;
    };

    // Toggle expand all - cycles through: null (natural) -> true (all expanded) -> false (all collapsed) -> null
    const handleExpandToggle = () => {
        if (expandAll === null) {
            setExpandAll(true); // Expand all
        } else if (expandAll === true) {
            setExpandAll(false); // Collapse all
        } else {
            setExpandAll(null); // Reset to natural
        }
    };

    // Find file documentation for a given path
    const getFileDoc = (clickedPath) => {
        if (!fileDocumentation || fileDocumentation.length === 0) return null;

        // Remove 'project-root/' prefix if present
        let path = clickedPath.replace(/^project-root\//, '');

        // Try exact match first (using filePath from schema)
        let doc = fileDocumentation.find(doc => doc.filePath === path || doc.path === path);

        // Try without leading slash
        if (!doc && path.startsWith('/')) {
            doc = fileDocumentation.find(doc =>
                doc.filePath === path.substring(1) || doc.path === path.substring(1)
            );
        }

        // Try with leading slash
        if (!doc && !path.startsWith('/')) {
            doc = fileDocumentation.find(doc =>
                doc.filePath === `/${path}` || doc.path === `/${path}`
            );
        }

        // Try filename match (last resort)
        if (!doc) {
            const filename = path.split('/').pop();
            doc = fileDocumentation.find(doc => {
                const docPath = doc.filePath || doc.path;
                return docPath && docPath.endsWith(filename);
            });
        }

        return doc;
    };

    if (!structure) {
        return (
            <Card className="p-12 text-center bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                <div className="relative inline-block mb-4">
                    <Folder className="h-16 w-16 mx-auto text-gray-300 dark:text-slate-600" />
                </div>
                <p className="text-gray-700 dark:text-gray-400 text-lg font-semibold">No folder structure available</p>
                <p className="text-gray-500 dark:text-gray-500 mt-2 text-sm">The project structure will appear here once generated.</p>
            </Card>
        );
    }

    // Parse if structure is a string (markdown format)
    const parseMarkdownStructure = (markdown) => {
        if (typeof markdown !== 'string') return markdown;

        const lines = markdown.split('\n').filter(line => line.trim());
        const root = { name: 'project-root', type: 'directory', children: [] };
        const stack = [{ node: root, level: -1 }];

        lines.forEach(line => {
            // eslint-disable-next-line no-useless-escape
            const match = line.match(/^(\s*)[\│\├\└\─\├─\└─]*\s*([^\s]+)/);
            if (!match) return;

            const indent = match[1].length;
            const name = match[2].trim();
            const level = Math.floor(indent / 2);
            const isDirectory = name.endsWith('/');

            const node = {
                name: isDirectory ? name.slice(0, -1) : name,
                type: isDirectory ? 'directory' : 'file',
                children: isDirectory ? [] : undefined
            };

            while (stack.length > 0 && stack[stack.length - 1].level >= level) {
                stack.pop();
            }

            const parent = stack[stack.length - 1].node;
            if (parent.children) {
                parent.children.push(node);
            }

            if (isDirectory) {
                stack.push({ node, level });
            }
        });

        return root;
    };

    // Parse if structure is a string (markdown format) or JSON object
    const parseStructure = (structure) => {
        if (!structure) return null;

        // If it's already an object (JSON structure from DB)
        if (typeof structure === 'object' && !Array.isArray(structure)) {
            return convertJsonToTree(structure);
        }

        // If it's a string (markdown format)
        if (typeof structure === 'string') {
            return parseMarkdownStructure(structure);
        }

        return null;
    };

    // Convert JSON object to tree structure
    const convertJsonToTree = (obj, name = 'project-root') => {
        const node = {
            name,
            type: 'directory',
            children: []
        };

        Object.keys(obj).forEach(key => {
            const value = obj[key];

            if (value && typeof value === 'object' && !Array.isArray(value)) {
                // It's a folder
                node.children.push(convertJsonToTree(value, key));
            } else {
                // It's a file
                node.children.push({
                    name: key,
                    type: 'file'
                });
            }
        });

        return node;
    };

    const treeData = parseStructure(structure);

    const TreeNodeWithExpand = ({ node, level = 0, forceExpand, parentPath = '' }) => {
        const [isOpen, setIsOpen] = useState(level < 2);
        const isFolder = node.type === 'directory' || node.children;
        const paddingLeft = `${level * 1.5}rem`;
        const FileIcon = !isFolder ? getFileIcon(node.name) : null;

        // Build current path
        const currentPath = buildFullPath(node.name, parentPath);

        // Determine expansion state:
        // - If forceExpand is true, always expand
        // - If forceExpand is false, always collapse
        // - If forceExpand is null/undefined, use local state
        const shouldExpand = forceExpand === null || forceExpand === undefined ? isOpen : forceExpand;

        const handleClick = (e) => {
            e.stopPropagation();

            if (!isFolder) {
                // It's a file - check for documentation
                const doc = getFileDoc(currentPath);

                if (doc) {
                    setSelectedFile(doc);
                } else {
                    // Show placeholder info for files without documentation
                    const cleanPath = currentPath.replace(/^project-root\//, '');
                    setSelectedFile({
                        filePath: cleanPath,
                        purpose: 'Documentation not yet available for this file.',
                        whatYouLearn: ['This file is part of your project structure'],
                        keyConcepts: [],
                        estimatedTime: 'N/A',
                        isPlaceholder: true
                    });
                }
            } else {
                // It's a folder - toggle expand (always works with local state)
                setIsOpen(!isOpen);
            }
        };

        if (!isFolder) {
            return (
                <div
                    className="flex items-center py-2 px-3 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-md transition-all group cursor-pointer border-l-2 border-transparent hover:border-emerald-400"
                    style={{ paddingLeft }}
                    onClick={handleClick}
                >
                    {FileIcon && <FileIcon className="h-4 w-4 mr-2.5 text-gray-600 dark:text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex-shrink-0" />}
                    <span className="text-sm font-mono text-gray-700 dark:text-gray-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 font-medium">
                        {node.name}
                    </span>
                </div>
            );
        }

        return (
            <div>
                <div
                    className="flex items-center py-2 px-3 hover:bg-gray-100 dark:hover:bg-slate-800/50 rounded-md cursor-pointer transition-all group"
                    style={{ paddingLeft }}
                    onClick={handleClick}
                >
                    <div className="flex items-center gap-2 flex-1">
                        {shouldExpand ? (
                            <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex-shrink-0" />
                        ) : (
                            <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex-shrink-0" />
                        )}
                        {shouldExpand ? (
                            <FolderOpen className="h-4.5 w-4.5 text-emerald-500 group-hover:text-emerald-600 transition-colors flex-shrink-0" />
                        ) : (
                            <Folder className="h-4.5 w-4.5 text-emerald-500 group-hover:text-emerald-600 transition-colors flex-shrink-0" />
                        )}
                        <span className="text-sm font-mono font-semibold text-gray-800 dark:text-gray-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                            {node.name}/
                        </span>
                    </div>
                </div>
                {shouldExpand && node.children && (
                    <div className="ml-4 border-l border-gray-200 dark:border-slate-700 pl-1">
                        {node.children.map((child, idx) => (
                            <TreeNodeWithExpand
                                key={`${child.name}-${idx}`}
                                node={child}
                                level={level + 1}
                                forceExpand={forceExpand}
                                parentPath={currentPath}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex gap-4 h-full">
            {/* Main folder structure */}
            <Card className={`overflow-hidden border border-gray-200 dark:border-slate-700 shadow-lg transition-all ${selectedFile ? 'flex-1' : 'w-full'}`}>
                {/* Header with controls */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-700 px-6 py-4 border-b border-gray-200 dark:border-slate-600">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-lg shadow-md">
                                <FolderOpen className="h-5 w-5 text-white" />
                            </div>
                            <h4 className="font-semibold text-gray-900 dark:text-white text-base">Project Structure</h4>
                        </div>
                        <button
                            onClick={handleExpandToggle}
                            className="px-4 py-2 bg-white dark:bg-slate-700 hover:bg-emerald-50 dark:hover:bg-slate-600 border border-gray-300 dark:border-slate-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-emerald-500 transition-all hover:shadow-sm"
                        >
                            {expandAll === true ? 'Collapse All' : expandAll === false ? 'Reset' : 'Expand All'}
                        </button>
                    </div>
                    {fileDocumentation && fileDocumentation.length > 0 && (
                        <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg border border-blue-100 dark:border-blue-800">
                            <BookOpen className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="font-medium">💡 Click on any file to view detailed documentation and learning resources</span>
                        </div>
                    )}
                </div>

                {/* Tree structure */}
                <div className="p-6 space-y-1 max-h-[600px] overflow-y-auto">
                    {treeData ? (
                        <TreeNodeWithExpand node={treeData} forceExpand={expandAll} />
                    ) : (
                        <p className="text-slate-500 text-sm">No structure to display</p>
                    )}
                </div>
            </Card>

            {/* File documentation side panel */}
            {selectedFile && (
                <Card className="w-96 border border-blue-200 dark:border-blue-800 shadow-lg overflow-hidden flex flex-col">
                    {/* Side panel header */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 px-5 py-4 border-b border-blue-200 dark:border-blue-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-600 rounded-lg shadow-sm">
                                <BookOpen className="h-4 w-4 text-white" />
                            </div>
                            <h4 className="font-semibold text-blue-900 dark:text-blue-100 text-sm">File Documentation</h4>
                        </div>
                        <button
                            onClick={() => setSelectedFile(null)}
                            className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-800/50 rounded-lg transition-colors"
                        >
                            <X className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                        </button>
                    </div>

                    {/* Side panel content */}
                    <div className="p-5 space-y-4 overflow-y-auto flex-1">
                        {selectedFile.isPlaceholder && (
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                                <div className="flex items-start gap-3">
                                    <Lightbulb className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                                            Documentation Coming Soon
                                        </p>
                                        <p className="text-xs text-yellow-700 dark:text-yellow-300">
                                            This file doesn't have detailed documentation yet. Try clicking on these documented files:
                                        </p>
                                        {fileDocumentation && fileDocumentation.length > 0 && (
                                            <ul className="mt-2 space-y-1">
                                                {fileDocumentation.slice(0, 3).map((doc, idx) => (
                                                    <li key={idx} className="text-xs text-yellow-800 dark:text-yellow-200 font-mono">
                                                        • {doc.filePath || doc.path}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* File path */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <FileCode className="h-4 w-4 text-slate-500" />
                                <h5 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">File Path</h5>
                            </div>
                            <p className="text-sm font-mono bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg text-slate-800 dark:text-slate-200 break-all">
                                {selectedFile.filePath || selectedFile.path}
                            </p>
                        </div>

                        {/* Purpose */}
                        {selectedFile.purpose && (
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Lightbulb className="h-4 w-4 text-amber-500" />
                                    <h5 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Purpose</h5>
                                </div>
                                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg border border-amber-100 dark:border-amber-800">
                                    {selectedFile.purpose}
                                </p>
                            </div>
                        )}

                        {/* Estimated time */}
                        {selectedFile.estimatedTime && (
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock className="h-4 w-4 text-blue-500" />
                                    <h5 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Estimated Time</h5>
                                </div>
                                <p className="text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg border border-blue-100 dark:border-blue-800">
                                    {selectedFile.estimatedTime}
                                </p>
                            </div>
                        )}

                        {/* What you'll learn */}
                        {selectedFile.whatYouLearn && selectedFile.whatYouLearn.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <BookOpen className="h-4 w-4 text-green-500" />
                                    <h5 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">What You'll Learn</h5>
                                </div>
                                <ul className="space-y-2">
                                    {selectedFile.whatYouLearn.map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                                            <span className="text-green-500 mt-0.5">•</span>
                                            <span className="flex-1">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Key concepts */}
                        {selectedFile.keyConcepts && selectedFile.keyConcepts.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Lightbulb className="h-4 w-4 text-purple-500" />
                                    <h5 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Key Concepts</h5>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {selectedFile.keyConcepts.map((concept, idx) => (
                                        <span
                                            key={idx}
                                            className="px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full border border-purple-200 dark:border-purple-800"
                                        >
                                            {concept}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            )}
        </div>
    );
};

export default FolderStructureTree;
