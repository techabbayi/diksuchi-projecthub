// Script to create/update users with "creator@123" password
// Run this with: node update-passwords.js

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// User Schema (complete)
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'creator', 'admin'], default: 'user' },
    avatar: { type: String, default: 'https://res.cloudinary.com/demo/image/upload/avatar.png' },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
    wallet: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    purchasedProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const createOrUpdateUsers = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // New password
        const newPassword = 'creator@123';
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Users to create/update
        const users = [
            {
                username: 'admin',
                email: 'admin@projecthub.com',
                role: 'admin',
                password: hashedPassword,
                avatar: 'https://res.cloudinary.com/demo/image/upload/avatar.png',
                wallet: 0,
                isVerified: false,
                favorites: [],
                purchasedProjects: []
            },
            {
                username: 'Creator',
                email: 'creator@projecthub.com',
                role: 'creator',
                password: hashedPassword,
                avatar: 'https://res.cloudinary.com/demo/image/upload/avatar.png',
                wallet: 0,
                isVerified: false,
                favorites: [],
                purchasedProjects: []
            },
            {
                username: 'ProjectHUB User',
                email: 'user@projecthub.com',
                role: 'user',
                password: hashedPassword,
                avatar: 'https://res.cloudinary.com/demo/image/upload/avatar.png',
                wallet: 0,
                isVerified: false,
                favorites: [],
                purchasedProjects: []
            }
        ];

        console.log('\n🔐 Creating/Updating users...\n');

        for (const userData of users) {
            try {
                // Try to find existing user
                const existingUser = await User.findOne({ email: userData.email });

                if (existingUser) {
                    // Update existing user
                    await User.updateOne(
                        { email: userData.email },
                        {
                            $set: {
                                password: hashedPassword,
                                username: userData.username,
                                role: userData.role
                            }
                        }
                    );
                    console.log(`✅ Updated: ${userData.username} (${userData.email}) - Role: ${userData.role}`);
                } else {
                    // Create new user
                    await User.create(userData);
                    console.log(`✨ Created: ${userData.username} (${userData.email}) - Role: ${userData.role}`);
                }
            } catch (err) {
                console.log(`❌ Error with ${userData.email}: ${err.message}`);
            }
        }

        console.log('\n✨ Operation completed!');
        console.log(`\n🔑 Password for all users: ${newPassword}`);
        console.log('\n📧 User Credentials:');
        console.log('━'.repeat(60));
        console.log('1. Email: admin@projecthub.com');
        console.log('   Password: creator@123');
        console.log('   Role: Admin\n');
        console.log('2. Email: creator@projecthub.com');
        console.log('   Password: creator@123');
        console.log('   Role: Creator\n');
        console.log('3. Email: user@projecthub.com');
        console.log('   Password: creator@123');
        console.log('   Role: User');
        console.log('━'.repeat(60));

        // Display all users
        console.log('\n📋 All Users in Database:');
        const allUsers = await User.find({}).select('username email role createdAt');
        allUsers.forEach((user, index) => {
            console.log(`${index + 1}. ${user.username} (${user.email}) - ${user.role}`);
        });

        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

createOrUpdateUsers();
