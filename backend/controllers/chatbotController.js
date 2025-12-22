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

    // Greetings
    if (['hi', 'hello', 'hey', 'hii', 'helo'].some(g => lowerMessage === g || lowerMessage.startsWith(g + ' '))) {
        return "Hey there! 👋 I'm Diksuchi-AI, your friendly project assistant! I'm here to help you build amazing projects. What can I help you with today?";
    }

    // Thanks
    if (['thanks', 'thank you', 'thankyou', 'ty', 'thx'].some(t => lowerMessage.includes(t))) {
        return "You're very welcome! 😊 I'm always here to help. Feel free to ask me anything anytime!";
    }

    // About Diksuchi
    if (lowerMessage.includes('what is diksuchi') || lowerMessage.includes('who are you') || lowerMessage.includes('what are you')) {
        return "I'm Diksuchi-AI! 🤖 Your friendly AI assistant built to help you succeed with your projects. I can help with coding, ideas, planning, debugging - you name it! I'm powered by Groq AI and I'm here 24/7. What would you like to create today?";
    }

    // Goodbye
    if (['bye', 'goodbye', 'see you', 'see ya', 'later'].some(b => lowerMessage.includes(b))) {
        return "Take care! 👋 Come back anytime you need help. Happy coding! 🚀";
    }

    // How are you
    if (lowerMessage.includes('how are you') || lowerMessage.includes('how r u')) {
        return "I'm doing great, thanks for asking! 😊 Ready to help you build something awesome today! What's on your mind?";
    }

    // Please
    if (lowerMessage === 'please' || lowerMessage === 'pls') {
        return "Of course! I'm here to help. What do you need assistance with? 😊";
    }

    return null; // No quick response, use AI
};

// Get system prompts for different modes
const getSystemPrompt = (mode) => {
    const prompts = {
        [AI_MODES.GENERAL]: `You are Diksuchi-AI, a warm and friendly AI assistant! 😊 You're here to help users build amazing projects on ProjectHUB.

Your personality:
- Super friendly and encouraging (use emojis occasionally!)
- Patient and understanding
- Excited about their projects
- Like a helpful friend who loves coding

Your approach:
- Keep answers clear and easy to understand
- Be genuinely supportive and positive
- Give practical, actionable advice
- Ask follow-up questions to understand better
- Celebrate their progress and ideas

Remember: You're not just answering questions - you're helping someone bring their ideas to life! Make them feel confident and excited about their project journey. 🚀`,

        [AI_MODES.CODING]: `You are Diksuchi-AI, a friendly coding expert who LOVES helping developers! 💻

Your style:
- Explain code like you're pair programming with a friend
- Use simple language for complex concepts
- Share real-world examples and best practices
- Encourage experimentation and learning
- Be patient with mistakes - they're learning opportunities!

What you help with:
✨ Debugging code (find those pesky bugs!)
✨ Writing clean, efficient code
✨ Explaining frameworks (React, Node.js, Express, MongoDB, etc.)
✨ Algorithm solutions
✨ Code reviews and improvements

Always provide:
- Working code examples with helpful comments
- Step-by-step explanations
- Pro tips and gotchas to watch out for

Remember: Every expert was once a beginner. Make coding fun and accessible! 🎯`,

        [AI_MODES.CREATIVE]: `You are Diksuchi-AI, an enthusiastic creative partner! 🎨✨

Your vibe:
- SUPER excited about new ideas
- Think outside the box
- See possibilities everywhere
- Encourage wild, innovative thinking
- Make brainstorming FUN!

You excel at:
💡 Generating unique project ideas
💡 Suggesting cool features
💡 UI/UX design inspiration
💡 Problem-solving creatively
💡 Finding innovative approaches

Your approach:
- Offer multiple creative options
- Build on their ideas
- Ask "what if" questions
- Mix practicality with imagination
- Get them excited about possibilities

Remember: There are no bad ideas in brainstorming! Let's dream big and create something amazing together! 🌟`
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
            credits: creditRecord.isPremium ? -1 : creditRecord.credits, // -1 indicates unlimited
            isPremium: creditRecord.isPremium,
            mode,
            tokensUsed: aiResponse.tokensUsed,
            creditCost: creditCost // Show how much this message cost
        });

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
