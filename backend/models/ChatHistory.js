import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['user', 'assistant', 'system'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    mode: {
        type: String,
        enum: ['general', 'coding', 'creative'],
        default: 'general'
    },
    isQuickResponse: {
        type: Boolean,
        default: false
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

const chatHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    messages: [messageSchema],
    lastActivity: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for efficient querying
chatHistorySchema.index({ userId: 1, lastActivity: -1 });

// Method to add message
chatHistorySchema.methods.addMessage = async function (role, content, mode, isQuickResponse = false) {
    this.messages.push({
        role,
        content,
        mode,
        isQuickResponse,
        timestamp: new Date()
    });

    this.lastActivity = new Date();

    // Limit history to last 100 messages (50 exchanges) to prevent huge documents
    if (this.messages.length > 100) {
        this.messages = this.messages.slice(-100);
    }

    await this.save();
};

// Method to get recent messages
chatHistorySchema.methods.getRecentMessages = function (limit = 20) {
    return this.messages.slice(-limit);
};

// Method to clear history
chatHistorySchema.methods.clearHistory = async function () {
    this.messages = [];
    this.lastActivity = new Date();
    await this.save();
};

// Static method to get or create chat history
chatHistorySchema.statics.getOrCreate = async function (userId) {
    let chatHistory = await this.findOne({ userId });
    if (!chatHistory) {
        chatHistory = await this.create({ userId, messages: [] });
    }
    return chatHistory;
};

// Auto-delete old inactive conversations (older than 30 days)
chatHistorySchema.index({ lastActivity: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);

export default ChatHistory;
