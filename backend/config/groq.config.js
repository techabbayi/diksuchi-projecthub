// Groq API Configuration
export const groqConfig = {
    // Primary model - fastest and most capable
    primaryModel: 'llama-3.3-70b-versatile',

    // Fallback model - when primary fails or rate limit hit
    fallbackModel: 'llama-3.1-8b-instant',

    // Model settings
    settings: {
        temperature: 0.7,
        maxTokens: 4096,
        responseFormat: { type: 'json_object' }
    },

    // Rate limit settings
    rateLimit: {
        requestsPerMinute: 30,
        tokensPerMinute: 6000
    },

    // Retry configuration
    retry: {
        maxAttempts: 2,
        delayMs: 1000
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
