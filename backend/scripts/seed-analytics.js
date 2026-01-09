#!/usr/bin/env node

/**
 * Analytics Seeding Script for ProjectHUB
 * This script seeds basic analytics data from existing projects to initialize the dashboard
 */

import mongoose from 'mongoose';
import Analytics from '../models/Analytics.js';
import PageVisit from '../models/PageVisit.js';
import Project from '../models/Project.js';
import { config } from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
config();

async function seedAnalytics() {
    console.log('🌱 Starting analytics seeding...\n');

    try {
        // Connect to MongoDB
        console.log('📡 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // Get existing projects
        const projects = await Project.find();
        console.log(`📁 Found ${projects.length} projects to seed analytics for\n`);

        if (projects.length === 0) {
            console.log('❌ No projects found. Please create some projects first.');
            process.exit(1);
        }

        // Check current analytics count
        const currentAnalytics = await Analytics.countDocuments();
        const currentPageVisits = await PageVisit.countDocuments();

        console.log(`📊 Current analytics: ${currentAnalytics} events, ${currentPageVisits} page visits\n`);

        if (currentAnalytics > 0 || currentPageVisits > 0) {
            console.log('ℹ️  Analytics data already exists. Skipping seeding.');
            console.log('💡 Real analytics will be tracked when users visit your site.\n');
            process.exit(0);
        }

        console.log('🔧 Seeding basic analytics structure...');

        // Seed a few page visits for main pages
        const mainPages = [
            { page: '/', title: 'ProjectHUB - Home' },
            { page: '/projects', title: 'ProjectHUB - Browse Projects' },
            { page: '/login', title: 'ProjectHUB - Login' },
            { page: '/signup', title: 'ProjectHUB - Sign Up' }
        ];

        const pageVisits = [];
        for (const pageData of mainPages) {
            const now = new Date();
            const startTime = new Date(now.getTime() - Math.random() * 86400000); // Last 24 hours
            const endTime = new Date(startTime.getTime() + Math.random() * 300000); // 0-5 minutes

            pageVisits.push({
                page: pageData.page,
                route: pageData.page,
                title: pageData.title,
                visitId: uuidv4(),
                sessionId: uuidv4(),
                userId: null,
                isAuthenticated: false,
                ipAddress: '127.0.0.1',
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0',
                country: 'United States',
                city: 'New York',
                region: 'NY',
                timezone: 'UTC',
                device: 'desktop',
                browser: 'Chrome',
                os: 'Windows',
                source: 'direct',
                referrer: null,
                utmSource: null,
                startTime,
                endTime,
                duration: endTime.getTime() - startTime.getTime(),
                scrollDepth: 75,
                bounced: false,
                isNewVisitor: true,
                isReturningVisitor: false,
                pageLoadTime: 1500,
                exitPage: false,
                conversionGoal: null
            });
        }

        await PageVisit.insertMany(pageVisits);
        console.log(`✅ Seeded ${pageVisits.length} basic page visits\n`);

        // Seed minimal project analytics for first few projects
        const analytics = [];
        const sampleProjects = projects.slice(0, 5); // Just first 5 projects

        for (const project of sampleProjects) {
            const now = new Date();
            const createdAt = new Date(now.getTime() - Math.random() * 86400000); // Last 24 hours

            // Add a view event
            analytics.push({
                type: 'view',
                resourceType: 'Project',
                resourceId: project._id,
                userId: null,
                ipAddress: '127.0.0.1',
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0',
                country: 'United States',
                city: 'New York',
                region: 'NY',
                device: 'desktop',
                browser: 'Chrome',
                os: 'Windows',
                source: 'direct',
                referrer: null,
                sessionId: uuidv4(),
                metadata: {
                    projectTitle: project.title,
                    projectType: project.type,
                    projectPrice: project.price || 0
                },
                createdAt
            });

            // Update project analytics
            await Project.findByIdAndUpdate(project._id, {
                $set: {
                    'analytics.totalViews': 1,
                    'analytics.totalDownloads': 0,
                    'analytics.conversionRate': 0,
                    'analytics.lastViewAt': createdAt,
                    'analytics.dailyViews': 1,
                    'analytics.weeklyViews': 1,
                    'analytics.monthlyViews': 1
                }
            });
        }

        await Analytics.insertMany(analytics);
        console.log(`✅ Seeded ${analytics.length} project analytics events\n`);

        console.log('📈 Analytics seeding complete!');
        console.log('💡 From now on, real analytics will be tracked automatically when users:');
        console.log('   - Visit any page (tracked by middleware)');
        console.log('   - View projects (tracked in project controller)');
        console.log('   - Download projects (tracked in download controller)\n');

        console.log('🎯 You can now view analytics at: /admin/analytics');
        console.log('📊 The dashboard will populate with real data as users interact with your site.\n');

    } catch (error) {
        console.error('❌ Error seeding analytics:', error);
    } finally {
        await mongoose.disconnect();
        console.log('📡 Disconnected from MongoDB');
    }
}

// Run the script
seedAnalytics();