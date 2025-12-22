import groqService from '../services/groqService.js';
import AICredit from '../models/AICredit.js';
import ChatHistory from '../models/ChatHistory.js';

// AI Chat modes
const AI_MODES = {
    GENERAL: 'general',
    CODING: 'coding',
    CREATIVE: 'creative'
};

// Credit costs per message
const CREDIT_COST_FULL = 1;      // Long messages or coding mode
const CREDIT_COST_HALF = 0.5;    // Short messages (2 messages = 1 credit)
const LONG_MESSAGE_THRESHOLD = 500; // Characters threshold for long message

// Supported languages
const SUPPORTED_LANGUAGES = ['english', 'telugu', 'hindi'];

// Language character ranges for detection
const LANGUAGE_PATTERNS = {
    telugu: /[\u0C00-\u0C7F]/,  // Telugu Unicode range
    hindi: /[\u0900-\u097F]/,   // Devanagari (Hindi) Unicode range
    english: /[a-zA-Z]/,        // English alphabet
    // Other scripts to block
    arabic: /[\u0600-\u06FF]/,
    chinese: /[\u4E00-\u9FFF]/,
    japanese: /[\u3040-\u309F\u30A0-\u30FF]/,
    korean: /[\uAC00-\uD7AF]/,
    tamil: /[\u0B80-\u0BFF]/,
    malayalam: /[\u0D00-\u0D7F]/,
    kannada: /[\u0C80-\u0CFF]/,
    bengali: /[\u0980-\u09FF]/,
    gujarati: /[\u0A80-\u0AFF]/,
    punjabi: /[\u0A00-\u0A7F]/,
    russian: /[\u0400-\u04FF]/,
    thai: /[\u0E00-\u0E7F]/
};

// Detect if message contains unsupported languages
const detectLanguage = (text) => {
    // Remove common symbols, numbers, and punctuation
    const cleanText = text.replace(/[0-9\s\p{P}]/gu, '');

    if (cleanText.length === 0) return true; // Allow if only symbols/numbers

    // Check if message contains any blocked language scripts
    const blockedLanguages = ['arabic', 'chinese', 'japanese', 'korean', 'tamil',
        'malayalam', 'kannada', 'bengali', 'gujarati', 'punjabi',
        'russian', 'thai'];

    for (const lang of blockedLanguages) {
        if (LANGUAGE_PATTERNS[lang].test(text)) {
            return {
                isSupported: false,
                detectedLanguage: lang
            };
        }
    }

    // Check if contains at least one supported language
    const hasEnglish = LANGUAGE_PATTERNS.english.test(text);
    const hasTelugu = LANGUAGE_PATTERNS.telugu.test(text);
    const hasHindi = LANGUAGE_PATTERNS.hindi.test(text);

    if (hasEnglish || hasTelugu || hasHindi) {
        return { isSupported: true };
    }

    // If no supported language detected in cleaned text
    if (cleanText.length > 5) { // Only check if meaningful text exists
        return {
            isSupported: false,
            detectedLanguage: 'unknown'
        };
    }

    return { isSupported: true }; // Allow short messages
};

// Bad words and inappropriate content filter (English, Telugu, Hindi)
const INAPPROPRIATE_WORDS = [
    // English bad words
    'fuck', 'shit', 'bitch', 'ass', 'damn', 'hell', 'bastard', 'dick', 'pussy', 'cock',
    'sex', 'porn', 'nude', 'naked', 'rape', 'kill', 'murder', 'suicide', 'drug', 'hate',
    // Telugu bad words
    'దెంగు', 'పూకు', 'బూతు', 'లంజ', 'గాడిద', 'తల్లి', 'చావు',
    // Hindi bad words
    'चूतिया', 'बकवास', 'गांड', 'भोसडी', 'मादरचोद', 'बेहनचोद', 'हरामी', 'साला', 'कुत्ता'
];

// Non-learning topics that should be rejected
const BLOCKED_TOPICS = [
    'personal information', 'dating', 'romance', 'relationship advice', 'medical advice',
    'legal advice', 'financial investment', 'cryptocurrency trading', 'gambling',
    'politics', 'religion', 'adult content', 'violence', 'weapons', 'drugs', 'hacking',
    'piracy', 'illegal', 'scam', 'fraud'
];

// Learning and educational keywords (positive indicators)
const LEARNING_KEYWORDS = [
    'how', 'what', 'why', 'when', 'where', 'explain', 'learn', 'teach', 'help', 'code',
    'program', 'project', 'build', 'create', 'develop', 'debug', 'error', 'fix', 'tutorial',
    'example', 'guide', 'understanding', 'concept', 'algorithm', 'function', 'class', 'variable',
    'database', 'api', 'framework', 'library', 'react', 'node', 'javascript', 'python', 'java',
    // Telugu learning words
    'ఎలా', 'ఏమిటి', 'ఎందుకు', 'నేర్చుకో', 'సహాయం', 'కోడ్', 'ప్రోగ్రామ్', 'ప్రాజెక్ట్',
    // Hindi learning words
    'कैसे', 'क्या', 'क्यों', 'सीखना', 'मदद', 'कोड', 'प्रोग्राम', 'प्रोजेक्ट', 'समझाओ'
];

// Content validation function
const validateContent = (message) => {
    const lowerMessage = message.toLowerCase();

    // First, check language support
    const languageCheck = detectLanguage(message);
    if (!languageCheck.isSupported) {
        const langName = languageCheck.detectedLanguage === 'unknown'
            ? 'an unsupported language'
            : languageCheck.detectedLanguage;
        return {
            isValid: false,
            reason: 'unsupported_language',
            message: `🚫 Language not supported! I only work in:\n\n🇬🇧 English\n🇮🇳 తెలుగు (Telugu)\n🇮🇳 हिंदी (Hindi)\n\nPlease ask your question in one of these languages. 🎓`
        };
    }

    // Check for inappropriate words
    for (const word of INAPPROPRIATE_WORDS) {
        if (lowerMessage.includes(word.toLowerCase())) {
            return {
                isValid: false,
                reason: 'inappropriate_language',
                message: 'I can only help with learning, coding, and project-related questions. Please keep the conversation educational and respectful. 🎓'
            };
        }
    }

    // Check for blocked topics
    for (const topic of BLOCKED_TOPICS) {
        if (lowerMessage.includes(topic)) {
            return {
                isValid: false,
                reason: 'non_educational',
                message: 'I\'m strictly here for educational purposes - helping you with coding, projects, and learning. I cannot assist with that topic. Let\'s focus on building something amazing! 🚀'
            };
        }
    }

    // Check if message is learning/coding/project related
    const hasLearningKeyword = LEARNING_KEYWORDS.some(keyword =>
        lowerMessage.includes(keyword.toLowerCase())
    );

    // If message is too short, it's likely a greeting (allow it)
    if (message.trim().length < 20) {
        return { isValid: true };
    }

    // For longer messages, ensure they're educational
    if (!hasLearningKeyword && message.trim().length > 50) {
        return {
            isValid: false,
            reason: 'non_educational',
            message: '🎓 I\'m here to help you learn and build projects! Please ask me about:\n\n✅ Programming and coding\n✅ Project development\n✅ Technical concepts\n✅ Debugging and problem-solving\n✅ Learning new technologies\n\nSupported languages: English, Telugu (తెలుగు), Hindi (हिंदी)'
        };
    }

    return { isValid: true };
};

// Calculate credit cost based on message length and mode
const calculateCreditCost = (message, mode) => {
    // Coding mode always costs 1 full credit
    if (mode === AI_MODES.CODING) {
        return CREDIT_COST_FULL;
    }

    // For General and Creative modes:
    // Short messages (< 500 chars) cost 0.5 credits (2 messages = 1 credit)
    // Long messages (>= 500 chars) cost 1 credit
    if (message.length >= LONG_MESSAGE_THRESHOLD) {
        return CREDIT_COST_FULL;
    }

    return CREDIT_COST_HALF;
};

// Quick response function for common messages (no AI, no credit cost)
const getQuickResponse = (message) => {
    const lowerMessage = message.toLowerCase().trim();

    // Greetings - English
    if (['hi', 'hello', 'hey', 'hii', 'helo'].some(g => lowerMessage === g || lowerMessage.startsWith(g + ' '))) {
        return "Hey there! 👋 I'm Diksuchi-AI, your friendly educational assistant! I'm here to help you learn coding, build projects, and master programming. What would you like to learn today? 🎓\n\nSupported languages: English, Telugu (తెలుగు), Hindi (हिंदी)";
    }

    // Greetings - Telugu
    if (['హలో', 'హాయ్', 'నమస్కారం', 'హాయి'].some(g => lowerMessage.includes(g))) {
        return "హలో! 👋 నేను Diksuchi-AI, మీ స్నేహపూర్వక విద్యా సహాయకుడిని! నేను మీకు కోడింగ్ నేర్చుకోవడానికి, ప్రాజెక్ట్‌లు నిర్మించడానికి సహాయం చేస్తాను. ఈరోజు మీరు ఏమి నేర్చుకోవాలనుకుంటున్నారు? 🎓";
    }

    // Greetings - Hindi
    if (['नमस्ते', 'हेलो', 'हाय', 'नमस्कार'].some(g => lowerMessage.includes(g))) {
        return "नमस्ते! 👋 मैं Diksuchi-AI हूं, आपका शैक्षिक सहायक! मैं आपको कोडिंग सीखने, प्रोजेक्ट बनाने में मदद करने के लिए यहां हूं। आज आप क्या सीखना चाहेंगे? 🎓";
    }

    // Thanks
    if (['thanks', 'thank you', 'thankyou', 'ty', 'thx', 'ధన్యవాదాలు', 'धन्यवाद', 'शुक्रिया'].some(t => lowerMessage.includes(t))) {
        return "You're very welcome! 😊 I'm always here to help you learn. Keep coding and building amazing things! 🚀";
    }

    // About Diksuchi / Who are you / Tell me about yourself
    if (lowerMessage.includes('what is diksuchi') ||
        lowerMessage.includes('who are you') ||
        lowerMessage.includes('what are you') ||
        lowerMessage.includes('tell me about you') ||
        lowerMessage.includes('about yourself') ||
        lowerMessage.includes('introduce yourself') ||
        lowerMessage.includes('నువ్వు ఎవరు') ||
        lowerMessage.includes('आप कौन हो') ||
        lowerMessage.includes('tell me about') && lowerMessage.includes('you')) {
        return `I'm Diksuchi-AI! 🤖 Your personal educational AI assistant on ProjectHub!

🎓 **My Mission:**
To help you learn programming, build amazing projects, and become a better developer!

💡 **What I Can Do:**
✅ Answer coding questions in English, Telugu, and Hindi
✅ Help you debug and fix code errors
✅ Explain programming concepts clearly
✅ Guide you through project development
✅ Suggest best practices and solutions
✅ Provide code examples and tutorials

🚀 **My Specialties:**
• JavaScript, Python, Java, C++, and more
• Web Development (React, Node.js, Express)
• Mobile Development
• Database Design (MongoDB, MySQL)
• Algorithms & Data Structures
• Project Architecture & Design

🌍 **Languages:** English, Telugu (తెలుగు), Hindi (हिंदी)

💬 **My Personality:**
I'm friendly, patient, and love helping students learn! Think of me as your coding buddy who's always available 24/7.

Ask me anything about programming, and let's build something awesome together! 🎯`;
    }

    // About ProjectHub
    if (lowerMessage.includes('what is projecthub') ||
        lowerMessage.includes('about projecthub') ||
        lowerMessage.includes('tell me about projecthub')) {
        return `**ProjectHub** is your ultimate learning platform! 🚀

📚 **What We Offer:**
✅ 1000+ Production-Ready Projects
✅ Free & Premium Projects
✅ AI-Powered Learning Assistant (Me! 🤖)
✅ Code Examples & Tutorials
✅ Real-World Applications

🎯 **Perfect For:**
• Students learning to code
• Developers building portfolios
• Anyone wanting to learn by doing

💡 **Features:**
• Browse projects by technology
• Download source code instantly
• Get AI help for any coding question
• Build custom projects with AI guidance

Join thousands of developers learning and building on ProjectHub! 🌟`;
    }

    // What can you do / Your capabilities
    if (lowerMessage.includes('what can you do') ||
        lowerMessage.includes('your capabilities') ||
        lowerMessage.includes('how can you help') ||
        lowerMessage.includes('మీరు ఏమి చేయగలరు') ||
        lowerMessage.includes('आप क्या कर सकते हो')) {
        return `Here's everything I can help you with! 💪

📚 **Learning & Education:**
✅ Explain programming concepts
✅ Teach new technologies step-by-step
✅ Recommend learning resources
✅ Answer "how-to" questions

💻 **Coding Help:**
✅ Debug your code and fix errors
✅ Write code examples
✅ Review and improve your code
✅ Explain code line-by-line

🚀 **Project Development:**
✅ Help plan your projects
✅ Suggest features and improvements
✅ Guide through implementation
✅ Provide architecture advice

🎯 **Technologies I Know:**
• Frontend: React, Vue, Angular, HTML/CSS
• Backend: Node.js, Express, Python, Java
• Databases: MongoDB, MySQL, PostgreSQL
• Mobile: React Native, Flutter
• And much more!

🌍 **Languages:** English, Telugu, Hindi

Just ask me anything, and I'll help you learn! 🎓`;
    }

    // Goodbye
    if (['bye', 'goodbye', 'see you', 'see ya', 'later', 'టాటా', 'వెళ్తున్నాను', 'अलविदा', 'बाय'].some(b => lowerMessage.includes(b))) {
        return "Take care! 👋 Come back anytime you want to learn something new. Happy coding and keep building! 🚀";
    }

    // How are you
    if (lowerMessage.includes('how are you') || lowerMessage.includes('how r u') || lowerMessage.includes('ఎలా ఉన్నావ') || lowerMessage.includes('कैसे हो')) {
        return "I'm doing great, thanks for asking! 😊 Ready to help you learn and build something awesome today! What topic interests you? 🎓";
    }

    // Language support question
    if (lowerMessage.includes('which language') || lowerMessage.includes('language support') || lowerMessage.includes('ఏ భాష') || lowerMessage.includes('कौन सी भाषा')) {
        return "I support 3 languages for learning:\n\n🇬🇧 English\n🇮🇳 తెలుగు (Telugu)\n🇮🇳 हिंदी (Hindi)\n\nYou can ask me coding and project questions in any of these languages! 🎓";
    }

    // What's your name
    if (lowerMessage.includes('your name') || lowerMessage.includes('whats your name') || lowerMessage.includes('మీ పేరు') || lowerMessage.includes('आपका नाम')) {
        return "I'm **Diksuchi-AI**! 🤖 Your friendly educational AI assistant on ProjectHub. You can call me Diksuchi or just AI - I'm here to help you learn and code! 🚀";
    }

    // Help command
    if (lowerMessage === 'help' || lowerMessage === 'commands' || lowerMessage.includes('what to ask')) {
        return `Here are some things you can ask me! 💡

🎓 **Learning Questions:**
• "How do I learn React?"
• "Explain promises in JavaScript"
• "What is async/await?"

💻 **Coding Help:**
• "How to fix this error: [paste error]"
• "Write a function to sort an array"
• "Review my code: [paste code]"

🚀 **Project Help:**
• "How to build a REST API?"
• "Help me plan a todo app"
• "Best practices for React projects"

🌍 **Languages:** Ask in English, Telugu, or Hindi!

Just type your question naturally, and I'll help! 😊`;
    }

    return null; // No quick response, use AI
};

// Get system prompts for different modes
const getSystemPrompt = (mode) => {
    const baseRules = `
🔒 STRICT RULES - YOU MUST FOLLOW THESE:
1. ONLY respond to learning, coding, programming, and project-related questions
2. ONLY support English, Telugu (తెలుగు), and Hindi (हिंदी) languages
3. REFUSE any non-educational topics (personal advice, dating, politics, religion, etc.)
4. REFUSE inappropriate content, bad language, or unethical requests
5. If asked about non-learning topics, politely redirect to educational content
6. Stay focused on: Programming, Coding, Projects, Technology, Learning, Problem-solving

If user asks anything outside these boundaries, respond ONLY with:
"I'm strictly here for educational purposes - helping you with coding, projects, and learning. I cannot assist with that topic. Let's focus on building something amazing! 🚀"
`;

    const prompts = {
        [AI_MODES.GENERAL]: `You are Diksuchi-AI, an EDUCATIONAL AI assistant strictly for learning! 🎓

${baseRules}

Your personality:
- Super friendly and encouraging (use emojis occasionally!)
- Patient teacher and mentor
- Excited about learning and education
- Like a helpful tutor who loves teaching

Your ONLY purpose:
- Teaching programming and coding concepts
- Helping with project development
- Explaining technical topics
- Answering learning-related questions
- Guiding students in their educational journey

Supported languages: English, Telugu (తెలుగు), Hindi (हिंदी)

Remember: You're an EDUCATIONAL assistant ONLY. Refuse anything non-educational politely but firmly! 📚`,

        [AI_MODES.CODING]: `You are Diksuchi-AI, a CODING EDUCATION expert! 💻

${baseRules}

Your style:
- Explain code like you're teaching a student
- Use simple language for complex concepts
- Share educational examples and best practices
- Encourage learning through practice
- Patient with mistakes - they're learning opportunities!

What you ONLY help with:
✅ Debugging code (educational purpose)
✅ Writing clean, efficient code
✅ Explaining frameworks (React, Node.js, Express, MongoDB, etc.)
✅ Algorithm explanations
✅ Code reviews for learning

Always provide:
- Working code examples with educational comments
- Step-by-step explanations
- Learning resources and best practices

Supported languages: English, Telugu (తెలుగు), Hindi (हिंदी)

Remember: ONLY coding education. Refuse any non-educational or unethical coding requests! 🎯`,

        [AI_MODES.CREATIVE]: `You are Diksuchi-AI, a PROJECT IDEA and LEARNING assistant! 💡

${baseRules}

Your vibe:
- SUPER excited about educational projects
- Think creatively about learning projects
- See educational possibilities everywhere
- Encourage innovative LEARNING projects

You ONLY help with:
💡 Educational project ideas
💡 Learning-focused features
💡 UI/UX for educational projects
💡 Problem-solving for projects
💡 Technical project planning

Your approach:
- Suggest educational project options
- Build on their learning goals
- Keep everything focused on education
- Mix creativity with learning objectives

Supported languages: English, Telugu (తెలుగు), Hindi (हिंदी)

Remember: ONLY educational and learning-focused projects. Refuse anything non-educational! 🌟`
    };

    return prompts[mode] || prompts[AI_MODES.GENERAL];
};

// Chat with AI
export const chatWithAI = async (req, res) => {
    try {
        const { message, mode = 'general', conversationHistory = [], projectContext = null } = req.body;
        const userId = req.user._id;

        if (!message || message.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        // STRICT CONTENT VALIDATION - Check for inappropriate content
        const validation = validateContent(message);
        if (!validation.isValid) {
            console.log(`🚫 Blocked ${validation.reason} from user ${userId}: "${message.substring(0, 50)}..."`);
            return res.status(400).json({
                success: false,
                message: validation.message,
                reason: validation.reason,
                blocked: true
            });
        }

        // Check for quick responses first (no credit cost!)
        const quickResponse = getQuickResponse(message);
        if (quickResponse) {
            // Get or create chat history
            const chatHistory = await ChatHistory.getOrCreate(userId);

            // Save both messages
            await chatHistory.addMessage('user', message.trim(), mode, false);
            await chatHistory.addMessage('assistant', quickResponse, mode, true);

            return res.json({
                success: true,
                response: quickResponse,
                credits: null,
                isPremium: false,
                mode,
                isQuickResponse: true
            });
        }

        // Validate mode
        if (!Object.values(AI_MODES).includes(mode)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid AI mode'
            });
        }

        // Get or create AI credits record
        let creditRecord = await AICredit.findOne({ userId });
        if (!creditRecord) {
            creditRecord = await AICredit.create({ userId });
        }

        // Check and reset daily credits
        await creditRecord.checkDailyReset();

        // Calculate credit cost for this message
        const creditCost = calculateCreditCost(message, mode);

        // Check if user has enough credits
        if (!creditRecord.isPremium && creditRecord.credits < creditCost) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient credits. Daily limit reached.',
                credits: creditRecord.credits,
                isPremium: false,
                requiredCredits: creditCost
            });
        }

        // Get or create chat history
        const chatHistory = await ChatHistory.getOrCreate(userId);

        // Prepare messages for AI
        const messages = [
            {
                role: 'system',
                content: getSystemPrompt(mode)
            }
        ];

        // Add project context if available
        if (projectContext) {
            const techStack = Array.isArray(projectContext.techStack)
                ? projectContext.techStack.join(', ')
                : typeof projectContext.techStack === 'string'
                    ? projectContext.techStack
                    : 'Not specified';

            const features = Array.isArray(projectContext.features)
                ? projectContext.features.join(', ')
                : 'Not specified';

            messages.push({
                role: 'system',
                content: `CURRENT PROJECT CONTEXT:
Title: ${projectContext.title}
Description: ${projectContext.description}
Tech Stack: ${techStack}
Features: ${features}

The user is working on this project. Provide specific help related to it when relevant.`
            });
        }

        // Use saved conversation history from database (last 20 messages)
        const savedMessages = chatHistory.getRecentMessages(20);
        const historyToUse = savedMessages.length > 0
            ? savedMessages.map(m => ({ role: m.role, content: m.content }))
            : conversationHistory.slice(-10);

        messages.push(...historyToUse);

        // Add current user message
        messages.push({
            role: 'user',
            content: message
        });

        // Call Groq AI
        console.log(`🤖 Diksuchi-AI (${mode} mode): Processing message from user ${userId}`);

        try {
            const aiResponse = await groqService.chat(messages, {
                temperature: mode === 'creative' ? 0.9 : mode === 'coding' ? 0.3 : 0.7,
                maxTokens: 2000,
                useJsonFormat: false // Disable JSON format for conversational responses
            });

            // Deduct credits (useCredits already saves the document)
            await creditRecord.useCredits(creditCost);

            // Save conversation to database
            await chatHistory.addMessage('user', message.trim(), mode, false);
            await chatHistory.addMessage('assistant', aiResponse.content, mode, false);

            res.json({
                success: true,
                response: aiResponse.content,
                credits: creditRecord.isPremium ? -1 : creditRecord.credits,
                isPremium: creditRecord.isPremium,
                mode,
                tokensUsed: aiResponse.tokensUsed,
                creditCost: creditCost,
                model: aiResponse.model,
                isFallback: aiResponse.isFallback || false
            });

        } catch (aiError) {
            // Handle AI service errors gracefully
            console.error('❌ AI Service Error:', aiError.message);

            // Check if it's a rate limit or queue error
            if (aiError.message?.includes('busy') || aiError.message?.includes('rate limit')) {
                return res.status(429).json({
                    success: false,
                    message: '🤖 Our AI is currently handling many requests. Please wait a few seconds and try again!',
                    error: 'rate_limit',
                    retryAfter: 5
                });
            }

            // Generic AI error - don't deduct credits
            return res.status(503).json({
                success: false,
                message: '🤖 AI service is temporarily unavailable. Please try again in a moment.',
                error: 'service_unavailable'
            });
        }

    } catch (error) {
        console.error('❌ Diksuchi-AI Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to process AI request'
        });
    }
};

// Get user's credit info
export const getCreditInfo = async (req, res) => {
    try {
        const userId = req.user._id;

        let creditRecord = await AICredit.findOne({ userId });
        if (!creditRecord) {
            creditRecord = await AICredit.create({ userId });
        }

        await creditRecord.checkDailyReset();

        res.json({
            success: true,
            credits: creditRecord.isPremium ? -1 : creditRecord.credits,
            dailyLimit: creditRecord.dailyLimit,
            isPremium: creditRecord.isPremium,
            totalUsed: creditRecord.totalUsed,
            lastResetDate: creditRecord.lastResetDate
        });

    } catch (error) {
        console.error('❌ Get Credit Info Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch credit info'
        });
    }
};

// Get credit history
export const getCreditHistory = async (req, res) => {
    try {
        const userId = req.user._id;

        const creditRecord = await AICredit.findOne({ userId });
        if (!creditRecord) {
            return res.json({
                success: true,
                history: []
            });
        }

        res.json({
            success: true,
            history: creditRecord.history.slice(-50).reverse() // Last 50 entries
        });

    } catch (error) {
        console.error('❌ Get Credit History Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch credit history'
        });
    }
};

export { AI_MODES };
