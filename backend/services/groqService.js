import Groq from 'groq-sdk';
import { groqConfig, modelSpecs } from '../config/groq.config.js';

class GroqService {
    constructor() {
        this.primaryModel = groqConfig.primaryModel;
        this.fallbackModel = groqConfig.fallbackModel;
        this.settings = groqConfig.settings;
        this.retryConfig = groqConfig.retry;
        this._groq = null; // Lazy initialization

        // Request queue for handling concurrent users
        this.requestQueue = [];
        this.isProcessing = false;
        this.maxConcurrent = 5; // Max concurrent requests
        this.activeRequests = 0;

        // Rate limiting tracking
        this.requestCount = 0;
        this.tokenCount = 0;
        this.resetTime = Date.now() + 60000; // Reset every minute
    }

    // Lazy initialize Groq client
    getGroqClient() {
        if (!this._groq) {
            if (!process.env.GROQ_API_KEY) {
                throw new Error('GROQ_API_KEY environment variable is not set');
            }
            this._groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        }
        return this._groq;
    }

    /**
     * Reset rate limit counters
     */
    resetRateLimits() {
        const now = Date.now();
        if (now >= this.resetTime) {
            this.requestCount = 0;
            this.tokenCount = 0;
            this.resetTime = now + 60000;
            console.log('🔄 Rate limit counters reset');
        }
    }

    /**
     * Check if we're within rate limits
     */
    checkRateLimits() {
        this.resetRateLimits();
        return this.requestCount < groqConfig.rateLimit.requestsPerMinute;
    }

    /**
     * Add request to queue and process
     */
    async queueRequest(fn) {
        return new Promise((resolve, reject) => {
            this.requestQueue.push({ fn, resolve, reject });
            this.processQueue();
        });
    }

    /**
     * Process queued requests with concurrency control
     */
    async processQueue() {
        if (this.isProcessing || this.activeRequests >= this.maxConcurrent) {
            return;
        }

        if (this.requestQueue.length === 0) {
            return;
        }

        this.isProcessing = true;
        const { fn, resolve, reject } = this.requestQueue.shift();
        this.activeRequests++;

        try {
            const result = await fn();
            resolve(result);
        } catch (error) {
            reject(error);
        } finally {
            this.activeRequests--;
            this.isProcessing = false;
            // Process next request
            if (this.requestQueue.length > 0) {
                setImmediate(() => this.processQueue());
            }
        }
    }

    /**
     * Call Groq API with automatic fallback to faster model
     * @param {Array} messages - Chat messages array
     * @param {Object} options - Additional options
     * @returns {Promise} API response
     */
    async chat(messages, options = {}) {
        // Use queue for all requests to manage concurrency
        return this.queueRequest(async () => {
            // Check rate limits before making request
            if (!this.checkRateLimits()) {
                console.log('⚠️ Rate limit reached, using fallback model immediately');
                return await this.fallbackToFasterModel(messages, { ...options, skipQueue: true });
            }

            const model = options.model || this.primaryModel;
            const temperature = options.temperature || this.settings.temperature;
            const maxTokens = options.maxTokens || this.settings.maxTokens;
            const useJsonFormat = options.useJsonFormat !== false;

            try {
                console.log(`🤖 Groq AI: Using model ${model}... (Queue: ${this.requestQueue.length}, Active: ${this.activeRequests})`);
                const startTime = Date.now();

                const completionParams = {
                    messages,
                    model,
                    temperature,
                    max_tokens: maxTokens
                };

                if (useJsonFormat) {
                    completionParams.response_format = this.settings.responseFormat;
                }

                const completion = await this.getGroqClient().chat.completions.create(completionParams);

                const duration = ((Date.now() - startTime) / 1000).toFixed(2);
                const tokensUsed = completion.usage?.total_tokens || 0;

                // Update rate limit tracking
                this.requestCount++;
                this.tokenCount += tokensUsed;

                console.log(`✅ Groq AI: Success in ${duration}s (${tokensUsed} tokens) [Requests: ${this.requestCount}/${groqConfig.rateLimit.requestsPerMinute}]`);

                return {
                    success: true,
                    content: completion.choices[0].message.content,
                    model: model,
                    tokensUsed,
                    duration
                };

            } catch (error) {
                console.error(`❌ Groq AI Error (${model}):`, error.message);

                // Check if rate limit error
                if (this.isRateLimitError(error)) {
                    console.log(`⚠️ Rate limit hit, switching to fallback model: ${this.fallbackModel}`);
                    // Wait longer before fallback
                    await this.delay(2000);
                    return await this.fallbackToFasterModel(messages, { ...options, skipQueue: true });
                }

                // Check if quota/credit error
                if (this.isQuotaError(error)) {
                    console.log(`⚠️ Quota exhausted, using fallback model: ${this.fallbackModel}`);
                    await this.delay(1000);
                    return await this.fallbackToFasterModel(messages, { ...options, skipQueue: true });
                }

                // Other errors - try fallback once
                if (model === this.primaryModel && !options.isRetry) {
                    console.log(`⚠️ Primary model failed, trying fallback: ${this.fallbackModel}`);
                    await this.delay(1000);
                    return await this.fallbackToFasterModel(messages, { ...options, skipQueue: true });
                }

                throw error;
            }
        });
    }

    /**
     * Fallback to faster/lighter model
     */
    async fallbackToFasterModel(messages, options) {
        try {
            // If skipQueue is set, execute directly (already in queue)
            if (options.skipQueue) {
                // Wait briefly before retry
                await this.delay(this.retryConfig.delayMs);

                const model = this.fallbackModel;
                const temperature = options.temperature || this.settings.temperature;
                const maxTokens = 2000; // Reduced for fallback
                const useJsonFormat = options.useJsonFormat !== false;

                console.log(`🔄 Using fallback model: ${model}`);
                const startTime = Date.now();

                const completionParams = {
                    messages,
                    model,
                    temperature,
                    max_tokens: maxTokens
                };

                if (useJsonFormat) {
                    completionParams.response_format = this.settings.responseFormat;
                }

                const completion = await this.getGroqClient().chat.completions.create(completionParams);

                const duration = ((Date.now() - startTime) / 1000).toFixed(2);
                const tokensUsed = completion.usage?.total_tokens || 0;

                this.requestCount++;
                this.tokenCount += tokensUsed;

                console.log(`✅ Fallback model success in ${duration}s (${tokensUsed} tokens)`);

                return {
                    success: true,
                    content: completion.choices[0].message.content,
                    model: model,
                    tokensUsed,
                    duration,
                    isFallback: true
                };
            }

            // Normal queue flow
            await this.delay(this.retryConfig.delayMs);

            return await this.chat(messages, {
                ...options,
                model: this.fallbackModel,
                maxTokens: 2000,
                isRetry: true
            });

        } catch (error) {
            console.error(`❌ Fallback model also failed:`, error.message);

            // If both models fail, return a helpful error message
            throw new Error('AI service is temporarily busy. Please wait a moment and try again. Our system is handling multiple requests.');
        }
    }

    /**
     * Check if error is rate limit related
     */
    isRateLimitError(error) {
        const message = error.message?.toLowerCase() || '';
        return message.includes('rate limit') ||
            message.includes('too many requests') ||
            error.status === 429;
    }

    /**
     * Check if error is quota/credit related
     */
    isQuotaError(error) {
        const message = error.message?.toLowerCase() || '';
        return message.includes('quota') ||
            message.includes('credit') ||
            message.includes('insufficient') ||
            error.status === 402;
    }

    /**
     * Generate project guide with AI
     */
    async generateProjectGuide(projectData) {
        const { projectName, description, techStack, complexity, features, skillLevel, motivation, targetAudience } = projectData;

        // Build tech stack string
        let techStackStr = '';
        if (techStack.predefined) {
            techStackStr = techStack.predefined;
        } else {
            const parts = [];
            if (techStack.frontend?.length) parts.push(`Frontend: ${techStack.frontend.join(', ')}`);
            if (techStack.backend?.length) parts.push(`Backend: ${techStack.backend.join(', ')}`);
            if (techStack.database?.length) parts.push(`Database: ${techStack.database.join(', ')}`);
            if (techStack.others?.length) parts.push(`Others: ${techStack.others.join(', ')}`);
            techStackStr = parts.join(' | ');
        }

        const prompt = `You are an expert software development mentor creating a comprehensive learning-focused project guide.

PROJECT DETAILS:
- Project Name: ${projectName}
- Description: ${description}
- Tech Stack: ${techStackStr}
- Complexity: ${complexity}
- Features: ${features?.join(', ') || 'Not specified'}
- Skill Level: ${skillLevel}
- Motivation: ${motivation}
- Target Audience: ${targetAudience || 'General'}

Generate a detailed project guide in JSON format with these sections:

1. README: A comprehensive markdown README with:
   - Project overview
   - Learning objectives (specific to the tech stack)
   - Tech stack details
   - Key features list
   - Getting started guide
   - Project structure overview
   
2. FOLDER_STRUCTURE: A detailed JSON object representing a PROFESSIONAL, PRODUCTION-READY project structure. CRITICAL REQUIREMENTS:
   - Include ALL necessary files (not just folders)
   - Root level MUST include: README.md, .gitignore, package.json, .env.example
   - For frontend (React/Next/Vite): src/, public/, components/, pages/, hooks/, utils/, assets/, lib/
   - For backend (Node/Express): config/, controllers/, models/, routes/, middleware/, services/, utils/
   - For databases: Include migration files, seed data examples
   - Include configuration files: tsconfig.json (if TS), eslint.config.js, prettier.config.js, vite.config.js, etc.
   - Show proper nesting: Use nested objects for folders, use empty string "" or null for files
   - Example structure format:
     {
       "project-root": {
         "README.md": "",
         ".gitignore": "",
         "package.json": "",
         ".env.example": "",
         "frontend": {
           "package.json": "",
           "vite.config.js": "",
           "index.html": "",
           "src": {
             "main.jsx": "",
             "App.jsx": "",
             "index.css": "",
             "components": {
               "Navbar.jsx": "",
               "Footer.jsx": ""
             },
             "pages": {
               "Home.jsx": "",
               "About.jsx": ""
             },
             "hooks": {},
             "utils": {
               "api.js": ""
             }
           },
           "public": {
             "favicon.ico": ""
           }
         },
         "backend": {
           "package.json": "",
           "server.js": "",
           "config": {
             "database.js": "",
             "config.js": ""
           },
           "controllers": {},
           "models": {},
           "routes": {},
           "middleware": {
             "auth.js": "",
             "errorHandler.js": ""
           }
         }
       }
     }

3. FILE_DOCUMENTATION: CRITICAL - Generate documentation for EVERY SINGLE FILE in the folder structure (aim for 20-40 files):
   - filePath (MUST be exact path from folder structure, matching perfectly)
   - purpose (what this file does and why it exists)
   - whatYouLearn (array of 3-5 specific learning points)
   - keyConcepts (array of 4-6 technical concepts/patterns)
   - estimatedTime (realistic time to implement)
   
   MUST DOCUMENT ALL FILES INCLUDING:
   - Root files: README.md, .gitignore, package.json, .env.example
   - Configuration: vite.config.js, eslint.config.js, tailwind.config.js, tsconfig.json
   - Entry points: main.jsx, index.html, server.js, App.jsx
   - ALL components in src/components/ (Navbar.jsx, Footer.jsx, etc.)
   - ALL pages in src/pages/ (Home.jsx, Login.jsx, etc.)
   - ALL utilities in src/utils/, src/lib/, src/hooks/
   - ALL backend files: controllers/, models/, routes/, middleware/
   - Database: config files, models, migrations
   
   IMPORTANT: Document EVERY file you include in folderStructure - no file should be left without documentation!

4. SETUP_INSTRUCTIONS: Detailed step-by-step setup in markdown format with commands

5. CONFIGURATION_GUIDE: JSON object with ALL environment variables needed, separated by frontend/backend

IMPORTANT: 
- FOLDER STRUCTURE MUST BE COMPREHENSIVE - include ALL files a professional project needs
- Include proper configuration files for the chosen tech stack
- Show realistic file organization (don't just have empty folders)
- File paths in fileDocumentation MUST match the folder structure exactly
- Focus on LEARNING and WHY each part matters
- Return ONLY valid JSON, no markdown code blocks
- readme MUST be a MARKDOWN STRING (use \n for line breaks, ## for headers)
- setupInstructions MUST be a MARKDOWN STRING (not an object)
- folderStructure MUST be a nested JSON object (folders as objects, files as empty strings)

Format:
{
  "readme": "# Project Title\n\n## Overview\n\nDescription here...",
  "folderStructure": { "project-root": { "README.md": "", "src": { "main.js": "" } } },
  "fileDocumentation": [{ "path": "src/main.js", "purpose": "...", "whatYouLearn": [...], "keyConcepts": [...], "estimatedTime": "30 mins" }],
  "setupInstructions": "## Setup Instructions\n\n1. Step one\n2. Step two",
  "configurationGuide": { "frontend": { "VITE_API_URL": "description" }, "backend": { "PORT": "description" } }
}`;

        const messages = [
            {
                role: 'system',
                content: 'You are an expert software development educator. Always respond with valid JSON only, no markdown formatting.'
            },
            {
                role: 'user',
                content: prompt
            }
        ];

        const response = await this.chat(messages);
        const aiResponse = JSON.parse(response.content);

        // Validate and fix types
        let readme = aiResponse.readme;
        let setupInstructions = aiResponse.setupInstructions;

        // If readme is object, convert to markdown string
        if (typeof readme === 'object' && readme !== null) {
            console.warn('⚠️ AI returned object for readme, converting to string...');
            readme = this.convertObjectToMarkdown(readme, projectName, description);
        } else if (!readme || typeof readme !== 'string') {
            readme = `# ${projectName}\n\n## Overview\n${description}`;
        }

        // If setupInstructions is object, convert to markdown string
        if (typeof setupInstructions === 'object' && setupInstructions !== null) {
            console.warn('⚠️ AI returned object for setupInstructions, converting to string...');
            setupInstructions = this.convertSetupToMarkdown(setupInstructions);
        } else if (!setupInstructions || typeof setupInstructions !== 'string') {
            setupInstructions = '## Setup Instructions\n\n1. Clone repository\n2. Install dependencies\n3. Configure environment\n4. Run development servers';
        }

        // Get folder structure
        const folderStructure = aiResponse.folderStructure || this.getDefaultFolderStructure(projectName);

        // Get file documentation and fill gaps
        let fileDocumentation = aiResponse.fileDocumentation || [];
        fileDocumentation = this.ensureAllFilesDocumented(folderStructure, fileDocumentation);

        return {
            readme,
            folderStructure,
            fileDocumentation,
            setupInstructions,
            configurationGuide: aiResponse.configurationGuide || {},
            metadata: {
                model: response.model,
                tokensUsed: response.tokensUsed,
                duration: response.duration
            }
        };
    }

    /**
     * Ensure all files in folder structure have documentation
     */
    ensureAllFilesDocumented(folderStructure, existingDocs) {
        const allFiles = this.extractAllFilesFromStructure(folderStructure);
        const documentedPaths = new Set(existingDocs.map(doc => doc.filePath || doc.path));

        // Add placeholder docs for undocumented files
        const newDocs = [...existingDocs];

        allFiles.forEach(filePath => {
            if (!documentedPaths.has(filePath)) {
                const fileName = filePath.split('/').pop();
                const ext = fileName.split('.').pop();

                newDocs.push({
                    filePath,
                    purpose: this.getDefaultPurpose(fileName, ext),
                    whatYouLearn: this.getDefaultLearnings(fileName, ext),
                    keyConcepts: this.getDefaultConcepts(ext),
                    estimatedTime: '15-30 mins'
                });
            }
        });

        console.log(`📄 Generated documentation for ${newDocs.length} files (${existingDocs.length} from AI, ${newDocs.length - existingDocs.length} auto-generated)`);
        return newDocs;
    }

    /**
     * Extract all file paths from folder structure
     */
    extractAllFilesFromStructure(structure, currentPath = '') {
        const files = [];

        const traverse = (obj, path) => {
            for (const [key, value] of Object.entries(obj)) {
                const fullPath = path ? `${path}/${key}` : key;

                if (value === '' || value === null || typeof value === 'string') {
                    // It's a file
                    files.push(fullPath);
                } else if (typeof value === 'object' && value !== null) {
                    // It's a folder, recurse
                    traverse(value, fullPath);
                }
            }
        };

        // Skip 'project-root' wrapper if it exists
        if (structure['project-root']) {
            traverse(structure['project-root'], '');
        } else {
            traverse(structure, '');
        }

        return files;
    }

    /**
     * Get default purpose based on file name and extension
     */
    getDefaultPurpose(fileName, ext) {
        const purposes = {
            'package.json': 'Defines project dependencies, scripts, and metadata for npm/yarn package management.',
            '.gitignore': 'Specifies files and directories that should be ignored by Git version control.',
            '.env.example': 'Template for environment variables needed to run the application.',
            'README.md': 'Project documentation with setup instructions, features, and usage guidelines.',
            'vite.config.js': 'Configuration file for Vite build tool and development server.',
            'tailwind.config.js': 'Tailwind CSS configuration for customizing design system.',
            'eslint.config.js': 'ESLint configuration for code quality and style checking.',
            'index.html': 'Main HTML entry point for the web application.',
            'server.js': 'Node.js server entry point for backend application.',
        };

        if (purposes[fileName]) return purposes[fileName];

        const extPurposes = {
            'jsx': `React component file that renders UI elements.`,
            'js': `JavaScript module containing application logic and functionality.`,
            'css': `Stylesheet for styling UI components.`,
            'json': `JSON configuration or data file.`,
            'ts': `TypeScript module with type-safe code.`,
            'tsx': `TypeScript React component file.`
        };

        return extPurposes[ext] || `Project file for ${fileName}.`;
    }

    /**
     * Get default learning points based on file extension
     */
    getDefaultLearnings(fileName, ext) {
        if (fileName === 'package.json') {
            return ['Managing project dependencies', 'Defining npm scripts', 'Versioning and metadata'];
        }

        const extLearnings = {
            'jsx': ['React component structure', 'JSX syntax', 'Props and state management'],
            'js': ['JavaScript modules', 'ES6+ features', 'Code organization'],
            'css': ['CSS styling', 'Responsive design', 'Layout techniques'],
            'json': ['JSON data structure', 'Configuration management'],
        };

        return extLearnings[ext] || ['File purpose and usage', 'Best practices', 'Integration with project'];
    }

    /**
     * Get default concepts based on file extension
     */
    getDefaultConcepts(ext) {
        const extConcepts = {
            'jsx': ['Components', 'JSX', 'React'],
            'js': ['Modules', 'Functions', 'ES6'],
            'css': ['Styling', 'Selectors', 'Flexbox'],
            'json': ['JSON', 'Configuration'],
            'ts': ['TypeScript', 'Types', 'Interfaces'],
        };

        return extConcepts[ext] || ['File Management', 'Project Structure'];
    }

    /**
     * Generate task roadmap with AI
     */
    async generateTaskRoadmap(projectData) {
        const { projectName, description, techStack, complexity, features, skillLevel } = projectData;

        // Build tech stack string
        let techStackStr = '';
        if (techStack.predefined) {
            techStackStr = techStack.predefined;
        } else {
            const parts = [];
            if (techStack.frontend?.length) parts.push(`Frontend: ${techStack.frontend.join(', ')}`);
            if (techStack.backend?.length) parts.push(`Backend: ${techStack.backend.join(', ')}`);
            if (techStack.database?.length) parts.push(`Database: ${techStack.database.join(', ')}`);
            if (techStack.others?.length) parts.push(`Others: ${techStack.others.join(', ')}`);
            techStackStr = parts.join(' | ');
        }

        const prompt = `You are an expert curriculum designer creating a learning-focused task roadmap for software development projects.

PROJECT DETAILS:
- Project: ${projectName}
- Description: ${description}
- Tech Stack: ${techStackStr}
- Complexity: ${complexity}
- Features: ${features?.join(', ') || 'Not specified'}
- Skill Level: ${skillLevel}

Create a detailed task roadmap with 4-6 milestones. Each milestone should have 2-4 tasks.

TASK TYPES:
- setup: Initial configuration tasks
- code: Development tasks
- testing: Testing and debugging tasks
- deployment: Deployment tasks

ARTIFACT LINK TYPES (for submissions):
- github-repo: For repository creation
- github-commit: For code commits
- github-pr: For pull requests
- deployed-url: For live deployments
- screenshot-link: For UI screenshots (optional)

CRITICAL VALIDATION RULES:
1. First task MUST be "Create GitHub Repository" with linkType: "github-repo" and status: "active"
2. All other tasks start with status: "locked"
3. EVERY task MUST have artifactConfig with linkType (REQUIRED!)
4. secondaryArtifact is OPTIONAL (only add if relevant)
5. Include specific, actionable learning points (array of strings)
6. Provide relevant documentation URLs in resources array
7. Estimate realistic time for ${skillLevel} developers
8. Make tasks progressively build on each other

DEPLOYMENT PLATFORM GUIDELINES (for deployment type tasks):
For web development projects, recommend beginner-friendly, free deployment platforms:
- **Vercel**: Best for Next.js, React, Vue (Frontend frameworks) - Zero-config, instant deployments
- **Netlify**: Great for static sites, JAMstack (HTML/CSS/JS, React, Vue) - Simple drag-and-drop
- **Render**: Perfect for Full-stack apps (Node.js, Python, Docker) - Free tier with databases
- Choose based on tech stack:
  * Frontend only (React/Vue/Angular): Vercel or Netlify
  * Full-stack (MERN/MEVN/PERN): Render or Vercel (separate frontend/backend)
  * Static sites: Netlify
- In deployment task descriptions, specify the recommended platform and basic steps
- Include platform-specific documentation links in resources array

MANDATORY FIELDS FOR EACH TASK:
- taskId: number (sequential)
- title: string
- description: string
- type: "setup" | "code" | "testing" | "deployment"
- order: number (sequential)
- status: "active" (only task 1) | "locked" (all others)
- artifactConfig: REQUIRED object with:
  - linkType: REQUIRED (github-repo, github-commit, github-pr, deployed-url)
  - required: true
  - label: string
  - placeholder: string example URL
  - helpText: string (optional)
- learningPoints: array of strings (minimum 2)
- resources: array of URLs (can be empty [])
- estimatedTime: string (e.g., "30 mins", "2 hours")

Return ONLY valid JSON with this EXACT structure:
{
  "milestones": [
    {
      "milestoneId": 1,
      "name": "Milestone name",
      "estimatedDays": 2,
      "status": "pending",
      "tasks": [
        {
          "taskId": 1,
          "title": "Create GitHub Repository",
          "description": "Initialize your project repository",
          "type": "setup",
          "order": 1,
          "status": "active",
          "artifactConfig": {
            "linkType": "github-repo",
            "required": true,
            "label": "GitHub Repository URL",
            "placeholder": "https://github.com/username/project-name",
            "helpText": "Paste your repository URL"
          },
          "learningPoints": ["Git basics", "Repository setup"],
          "resources": ["https://docs.github.com"],
          "estimatedTime": "15 mins"
        },
        {
          "taskId": 2,
          "title": "Next task",
          "description": "Description",
          "type": "code",
          "order": 2,
          "status": "locked",
          "artifactConfig": {
            "linkType": "github-commit",
            "required": true,
            "label": "Commit URL",
            "placeholder": "https://github.com/user/repo/commit/abc123"
          },
          "learningPoints": ["Skill 1", "Skill 2"],
          "resources": [],
          "estimatedTime": "1 hour"
        }
      ]
    }
  ]
}`;

        const messages = [
            {
                role: 'system',
                content: 'You are an expert software development curriculum designer. Always respond with valid JSON only.'
            },
            {
                role: 'user',
                content: prompt
            }
        ];

        const response = await this.chat(messages);
        const aiResponse = JSON.parse(response.content);

        // Validate and fix milestones
        let milestones = aiResponse.milestones || this.getDefaultMilestones();
        milestones = this.validateAndFixMilestones(milestones);

        return {
            milestones,
            metadata: {
                model: response.model,
                tokensUsed: response.tokensUsed,
                duration: response.duration
            }
        };
    }

    /**
     * Validate and fix milestones to ensure all required fields
     */
    validateAndFixMilestones(milestones) {
        if (!Array.isArray(milestones) || milestones.length === 0) {
            console.warn('⚠️ Invalid milestones array, using default');
            return this.getDefaultMilestones();
        }

        let globalTaskId = 1;
        let hasWarnings = false;

        return milestones.map((milestone, mIndex) => {
            // Validate milestone fields
            if (!milestone.milestoneId) {
                milestone.milestoneId = mIndex + 1;
                hasWarnings = true;
            }
            if (!milestone.name) milestone.name = `Milestone ${mIndex + 1}`;
            if (!milestone.estimatedDays) milestone.estimatedDays = 3;
            if (!milestone.status) milestone.status = 'pending';
            if (!Array.isArray(milestone.tasks)) milestone.tasks = [];

            // Validate and fix each task
            milestone.tasks = milestone.tasks.map((task, tIndex) => {
                const fixedTask = { ...task };

                // Fix basic fields
                if (!fixedTask.taskId) fixedTask.taskId = globalTaskId;
                if (!fixedTask.title) fixedTask.title = `Task ${globalTaskId}`;
                if (!fixedTask.description) fixedTask.description = 'Complete this task';
                if (!fixedTask.type) fixedTask.type = 'code';
                if (!fixedTask.order) fixedTask.order = globalTaskId;

                // First task should be active, others locked
                if (globalTaskId === 1) {
                    fixedTask.status = 'active';
                } else {
                    fixedTask.status = fixedTask.status === 'active' ? 'locked' : (fixedTask.status || 'locked');
                }

                // CRITICAL: Fix artifactConfig
                if (!fixedTask.artifactConfig || typeof fixedTask.artifactConfig !== 'object') {
                    console.warn(`⚠️ Task ${globalTaskId}: Missing artifactConfig, adding default`);
                    fixedTask.artifactConfig = {};
                    hasWarnings = true;
                }

                // Ensure linkType is set (REQUIRED field)
                if (!fixedTask.artifactConfig.linkType) {
                    // Determine linkType based on task type and order
                    if (globalTaskId === 1) {
                        fixedTask.artifactConfig.linkType = 'github-repo';
                    } else if (fixedTask.type === 'deployment') {
                        fixedTask.artifactConfig.linkType = 'deployed-url';
                    } else {
                        fixedTask.artifactConfig.linkType = 'github-commit';
                    }
                    console.warn(`⚠️ Task ${globalTaskId}: Missing linkType, set to ${fixedTask.artifactConfig.linkType}`);
                    hasWarnings = true;
                }

                // Ensure other artifactConfig fields
                if (fixedTask.artifactConfig.required === undefined) {
                    fixedTask.artifactConfig.required = true;
                }
                if (!fixedTask.artifactConfig.label) {
                    fixedTask.artifactConfig.label = this.getLabelForLinkType(fixedTask.artifactConfig.linkType);
                }
                if (!fixedTask.artifactConfig.placeholder) {
                    fixedTask.artifactConfig.placeholder = this.getPlaceholderForLinkType(fixedTask.artifactConfig.linkType);
                }

                // Fix learningPoints
                if (!Array.isArray(fixedTask.learningPoints) || fixedTask.learningPoints.length === 0) {
                    fixedTask.learningPoints = ['Complete this task', 'Learn best practices'];
                }

                // Fix resources
                if (!Array.isArray(fixedTask.resources)) {
                    fixedTask.resources = [];
                }

                // Fix estimatedTime
                if (!fixedTask.estimatedTime) {
                    fixedTask.estimatedTime = '1 hour';
                }

                // Remove secondaryArtifact if it's invalid
                if (fixedTask.secondaryArtifact && (!fixedTask.secondaryArtifact.linkType || typeof fixedTask.secondaryArtifact !== 'object')) {
                    delete fixedTask.secondaryArtifact;
                }

                globalTaskId++;
                return fixedTask;
            });

            return milestone;
        });
    }

    /**
     * Get label for link type
     */
    getLabelForLinkType(linkType) {
        const labels = {
            'github-repo': 'GitHub Repository URL',
            'github-commit': 'Commit URL',
            'github-pr': 'Pull Request URL',
            'deployed-url': 'Live Application URL',
            'screenshot-link': 'Screenshot URL'
        };
        return labels[linkType] || 'Submission URL';
    }

    /**
     * Get placeholder for link type
     */
    getPlaceholderForLinkType(linkType) {
        const placeholders = {
            'github-repo': 'https://github.com/username/project-name',
            'github-commit': 'https://github.com/username/repo/commit/abc123',
            'github-pr': 'https://github.com/username/repo/pull/1',
            'deployed-url': 'https://your-app.vercel.app',
            'screenshot-link': 'https://imgur.com/abc123'
        };
        return placeholders[linkType] || 'https://example.com';
    }

    /**
     * Default folder structure fallback - comprehensive professional structure
     */
    getDefaultFolderStructure(projectName) {
        return {
            [projectName]: {
                'README.md': '',
                '.gitignore': '',
                'package.json': '',
                '.env.example': '',
                'frontend': {
                    'package.json': '',
                    'vite.config.js': '',
                    'index.html': '',
                    'eslint.config.js': '',
                    'postcss.config.js': '',
                    'tailwind.config.js': '',
                    'src': {
                        'main.jsx': '',
                        'App.jsx': '',
                        'index.css': '',
                        'App.css': '',
                        'components': {
                            'Navbar.jsx': '',
                            'Footer.jsx': '',
                            'ProtectedRoute.jsx': '',
                            'ui': {
                                'Button.jsx': '',
                                'Card.jsx': '',
                                'Input.jsx': ''
                            }
                        },
                        'pages': {
                            'Home.jsx': '',
                            'Login.jsx': '',
                            'Register.jsx': '',
                            'Dashboard.jsx': ''
                        },
                        'hooks': {
                            'useAuth.js': ''
                        },
                        'store': {
                            'authStore.js': '',
                            'themeStore.js': ''
                        },
                        'lib': {
                            'api.js': '',
                            'utils.js': ''
                        },
                        'assets': {}
                    },
                    'public': {
                        'favicon.ico': ''
                    }
                },
                'backend': {
                    'package.json': '',
                    'server.js': '',
                    '.env.example': '',
                    'config': {
                        'database.js': '',
                        'config.js': ''
                    },
                    'controllers': {
                        'authController.js': '',
                        'userController.js': ''
                    },
                    'models': {
                        'User.js': ''
                    },
                    'routes': {
                        'authRoutes.js': '',
                        'userRoutes.js': ''
                    },
                    'middleware': {
                        'auth.js': '',
                        'errorHandler.js': ''
                    },
                    'services': {},
                    'utils': {
                        'helpers.js': ''
                    }
                }
            }
        };
    }

    /**
     * Default milestones fallback
     */
    getDefaultMilestones() {
        return [
            {
                milestoneId: 1,
                name: 'Project Setup & Configuration',
                estimatedDays: 1,
                status: 'pending',
                tasks: [
                    {
                        taskId: 1,
                        title: 'Create GitHub Repository',
                        description: 'Initialize your project repository on GitHub with a README file',
                        type: 'setup',
                        order: 1,
                        status: 'active',
                        artifactConfig: {
                            linkType: 'github-repo',
                            required: true,
                            label: 'GitHub Repository URL',
                            placeholder: 'https://github.com/username/project-name',
                            validationPattern: '^https://github\\.com/[\\w-]+/[\\w-]+/?$',
                            helpText: 'Paste your newly created repository URL',
                        },
                        learningPoints: ['Git basics', 'Repository setup', 'Version control'],
                        resources: ['https://docs.github.com/en/get-started'],
                        estimatedTime: '15 mins',
                    },
                    {
                        taskId: 2,
                        title: 'Setup Project Structure',
                        description: 'Create folders and initialize npm projects',
                        type: 'setup',
                        order: 2,
                        status: 'locked',
                        artifactConfig: {
                            linkType: 'github-commit',
                            required: true,
                            label: 'Commit URL',
                            placeholder: 'https://github.com/username/repo/commit/abc123',
                        },
                        learningPoints: ['Project organization', 'NPM initialization'],
                        resources: ['https://docs.npmjs.com/'],
                        estimatedTime: '20 mins',
                    },
                ]
            },
            {
                milestoneId: 2,
                name: 'Core Development',
                estimatedDays: 7,
                status: 'pending',
                tasks: [
                    {
                        taskId: 3,
                        title: 'Implement Core Features',
                        description: 'Build main application features',
                        type: 'code',
                        order: 3,
                        status: 'locked',
                        artifactConfig: {
                            linkType: 'github-commit',
                            required: true,
                            label: 'Commit/PR URL',
                        },
                        learningPoints: ['Feature development', 'Best practices'],
                        resources: [],
                        estimatedTime: '4 hours',
                    },
                ]
            },
            {
                milestoneId: 3,
                name: 'Testing & Deployment',
                estimatedDays: 2,
                status: 'pending',
                tasks: [
                    {
                        taskId: 4,
                        title: 'Deploy Application',
                        description: 'Deploy your application to production using Vercel (for frontend) or Render (for full-stack). Connect your GitHub repo for automatic deployments. For beginners: Vercel/Netlify are easiest for React/Next.js apps, while Render is best for Node.js backends with databases.',
                        type: 'deployment',
                        order: 4,
                        status: 'locked',
                        artifactConfig: {
                            linkType: 'deployed-url',
                            required: true,
                            label: 'Live Application URL',
                            placeholder: 'https://your-app.vercel.app or https://your-app.onrender.com',
                        },
                        learningPoints: ['Cloud deployment', 'CI/CD basics', 'Platform selection'],
                        resources: ['https://vercel.com/docs', 'https://render.com/docs', 'https://docs.netlify.com'],
                        estimatedTime: '30 mins',
                    },
                ]
            }
        ];
    }

    /**
     * Delay utility
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Convert object readme to markdown string
     */
    convertObjectToMarkdown(obj, projectName, description) {
        let markdown = `# ${projectName}\n\n`;

        if (obj.projectOverview) {
            markdown += `## 📝 Project Overview\n${obj.projectOverview}\n\n`;
        } else {
            markdown += `## 📝 Project Overview\n${description}\n\n`;
        }

        if (obj.learningObjectives && Array.isArray(obj.learningObjectives)) {
            markdown += `## 🎯 Learning Objectives\n`;
            obj.learningObjectives.forEach(obj => markdown += `- ${obj}\n`);
            markdown += '\n';
        }

        if (obj.techStackDetails) {
            markdown += `## 🛠️ Tech Stack\n${obj.techStackDetails}\n\n`;
        }

        if (obj.keyFeaturesList && Array.isArray(obj.keyFeaturesList)) {
            markdown += `## 🚀 Key Features\n`;
            obj.keyFeaturesList.forEach(feature => markdown += `- ${feature}\n`);
            markdown += '\n';
        }

        if (obj.gettingStartedGuide) {
            markdown += `## 🏁 Getting Started\n${obj.gettingStartedGuide}\n\n`;
        }

        if (obj.projectStructureOverview) {
            markdown += `## 📁 Project Structure\n${obj.projectStructureOverview}\n\n`;
        }

        return markdown;
    }

    /**
     * Convert object setupInstructions to markdown string
     */
    convertSetupToMarkdown(obj) {
        let markdown = `## Setup Instructions\n\n`;

        // Extract steps from object
        const steps = Object.keys(obj)
            .filter(key => key.startsWith('step'))
            .sort()
            .map(key => obj[key]);

        if (steps.length > 0) {
            steps.forEach((step, index) => {
                markdown += `${index + 1}. ${step}\n`;
            });
        } else {
            markdown += '1. Clone repository\n2. Install dependencies\n3. Run development servers';
        }

        return markdown;
    }

    /**
     * Test Groq API connection
     */
    async testConnection() {
        try {
            console.log('🔌 Testing Groq API connection...');
            const startTime = Date.now();

            const response = await this.getGroqClient().chat.completions.create({
                messages: [
                    {
                        role: 'user',
                        content: 'Reply with just: OK'
                    }
                ],
                model: this.primaryModel,
                max_tokens: 10
            });

            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            const reply = response.choices[0].message.content.trim();

            console.log(`✅ Groq API Connected! (${duration}s) - Model: ${this.primaryModel}`);
            console.log(`   Primary: ${this.primaryModel}`);
            console.log(`   Fallback: ${this.fallbackModel}`);
            return true;

        } catch (error) {
            console.error('❌ Groq API Connection Failed:', error.message);
            if (error.message?.includes('API key')) {
                console.error('   💡 Check GROQ_API_KEY in .env file');
            }
            return false;
        }
    }

    /**
     * Get model info
     */
    getModelInfo(modelName) {
        return modelSpecs[modelName] || modelSpecs[this.primaryModel];
    }
}

// Export singleton instance
export default new GroqService();
