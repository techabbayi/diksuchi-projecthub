import mongoose from 'mongoose';

const aiCreditSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    credits: {
        type: Number,
        default: 50,
        min: 0
    },
    dailyLimit: {
        type: Number,
        default: 50
    },
    isPremium: {
        type: Boolean,
        default: false
    },
    lastResetDate: {
        type: Date,
        default: Date.now
    },
    totalUsed: {
        type: Number,
        default: 0
    },
    history: [{
        action: {
            type: String,
            enum: ['use', 'reset', 'admin_add', 'admin_deduct', 'premium_activated']
        },
        amount: Number,
        timestamp: {
            type: Date,
            default: Date.now
        },
        message: String
    }]
}, {
    timestamps: true
});

// Method to check and reset daily credits
aiCreditSchema.methods.checkDailyReset = async function () {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastReset = new Date(this.lastResetDate);
    lastReset.setHours(0, 0, 0, 0);

    if (today > lastReset && !this.isPremium) {
        this.credits = this.dailyLimit;
        this.lastResetDate = Date.now();
        this.history.push({
            action: 'reset',
            amount: this.dailyLimit,
            message: 'Daily credits reset'
        });
        await this.save();
    }
};

// Method to use credits
aiCreditSchema.methods.useCredits = async function (amount) {
    if (this.isPremium) {
        this.totalUsed += amount;
        await this.save();
        return true;
    }

    await this.checkDailyReset();

    if (this.credits >= amount) {
        this.credits -= amount;
        this.totalUsed += amount;
        this.history.push({
            action: 'use',
            amount: -amount,
            message: `Used ${amount} credits for AI chat`
        });
        await this.save();
        return true;
    }

    return false;
};

const AICredit = mongoose.model('AICredit', aiCreditSchema);

export default AICredit;
