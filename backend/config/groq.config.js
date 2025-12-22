// Groq API Configuration
export const groqConfig = {
    // Primary model - fastest and most capable
    primaryModel: 'llama-3.3-70b-versatile',

    // Fallback model - when primary fails or rate limit hit
    fallbackModel: 'llama-3.1-8b-instant',

    // Model settings
    settings: {
        temperature: 0.7,
        maxTokens: 3000, // Reduced from 4096 to handle more requests
        responseFormat: { type: 'json_object' }
    },

    // Rate limit settings (conservative to avoid hitting API limits)
    rateLimit: {
        requestsPerMinute: 25, // Reduced from 30 to leave buffer
        tokensPerMinute: 15000 // Increased buffer
    },

    // Retry configuration
    retry: {
        maxAttempts: 3, // Increased from 2
        delayMs: 1500 // Increased delay between retries
    },

    // Concurrency settings
    concurrency: {
        maxConcurrent: 5, // Max 5 users can chat simultaneously
        queueTimeout: 30000 // 30 seconds timeout for queued requests
    }
};

// Model specifications
export const modelSpecs = {
    'llama-3.3-70b-versatile': {
        name: 'Llama 3.3 70B Versatile',
        contextWindow: 32768,
        maxOutput: 8192,
        speedTokensPerSec: 300,
        bestFor: 'Complex reasoning, detailed content'
    },
    'llama-3.1-8b-instant': {
        name: 'Llama 3.1 8B Instant',
        contextWindow: 8192,
        maxOutput: 4096,
        speedTokensPerSec: 500,
        bestFor: 'Fast responses, simple tasks'
    }
};
