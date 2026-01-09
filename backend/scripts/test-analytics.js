import Analytics from '../models/Analytics.js';
import PageVisit from '../models/PageVisit.js';
import Project from '../models/Project.js';
import connectDB from '../config/database.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function testAnalyticsSystem() {
    try {
        console.log('🔌 Connecting to database...');
        await connectDB();

        console.log('📊 Testing Analytics System...');

        // Check current data
        const analyticsCount = await Analytics.countDocuments();
        const pageVisitsCount = await PageVisit.countDocuments();
        const projectsCount = await Project.countDocuments();

        console.log('📈 Current Data Status:');
        console.log(`  Projects: ${projectsCount}`);
        console.log(`  Analytics: ${analyticsCount}`);
        console.log(`  Page Visits: ${pageVisitsCount}`);

        if (projectsCount === 0) {
            console.log('⚠️ No projects found. Creating test project...');
            const testProject = await Project.create({
                title: 'Test Analytics Project',
                description: 'Test project for analytics tracking',
                techStack: ['JavaScript', 'Node.js'],
                difficulty: 'beginner',
                type: 'free',
                mode: 'github',
                githubLink: 'https://github.com/test/test',
                category: 'web-development',
                author: '60a2b2b3b4b4b4b4b4b4b4b4', // Test author ID
                status: 'approved'
            });
            console.log(`✅ Test project created: ${testProject._id}`);
        }

        // Get a project ID for testing
        const testProject = await Project.findOne({ status: 'approved' });
        if (!testProject) {
            throw new Error('No approved projects found');
        }

        console.log(`🎯 Using project: ${testProject.title} (${testProject._id})`);

        // Create test analytics data
        console.log('📝 Creating test analytics events...');

        const testEvents = [
            {
                type: 'view',
                resourceId: testProject._id.toString(),
                resourceType: 'Project',
                userId: null,
                sessionId: 'test-session-1',
                ipAddress: '127.0.0.1',
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                country: 'United States',
                city: 'New York',
                referrer: 'https://google.com',
                source: 'search',
                device: 'desktop',
                browser: 'Chrome',
                os: 'Windows',
                metadata: { projectId: testProject._id.toString(), method: 'GET' }
            },
            {
                type: 'download',
                resourceId: testProject._id.toString(),
                resourceType: 'Project',
                userId: null,
                sessionId: 'test-session-2',
                ipAddress: '192.168.1.100',
                userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X)',
                country: 'United Kingdom',
                city: 'London',
                referrer: '',
                source: 'direct',
                device: 'mobile',
                browser: 'Safari',
                os: 'iOS',
                downloadSize: 1024000,
                downloadSuccess: true,
                metadata: { projectId: testProject._id.toString(), downloadType: 'github' }
            },
            {
                type: 'page_visit',
                page: '/projects',
                userId: null,
                sessionId: 'test-session-3',
                ipAddress: '10.0.0.1',
                userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
                country: 'Canada',
                city: 'Toronto',
                referrer: 'https://twitter.com',
                source: 'social',
                device: 'desktop',
                browser: 'Firefox',
                os: 'macOS',
                metadata: { route: '/projects', method: 'GET' }
            }
        ];

        for (const event of testEvents) {
            await Analytics.create(event);
            console.log(`  ✅ Created ${event.type} event`);
        }

        // Create test page visits
        console.log('🌐 Creating test page visits...');

        const testPageVisits = [
            {
                page: '/projects',
                route: '/projects',
                title: 'Browse Projects',
                visitId: 'visit-1',
                sessionId: 'session-1',
                userId: null,
                isAuthenticated: false,
                ipAddress: '127.0.0.1',
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                country: 'United States',
                region: 'CA',
                city: 'San Francisco',
                timezone: 'America/Los_Angeles',
                referrer: '',
                referrerDomain: '',
                source: 'direct',
                medium: 'none',
                device: 'desktop',
                browser: 'Chrome',
                os: 'Windows',
                isNewVisitor: true,
                isReturningVisitor: false,
                startTime: new Date()
            },
            {
                page: `/projects/${testProject._id}`,
                route: `/projects/${testProject._id}`,
                title: testProject.title,
                visitId: 'visit-2',
                sessionId: 'session-2',
                userId: null,
                isAuthenticated: false,
                ipAddress: '192.168.1.100',
                userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X)',
                country: 'United Kingdom',
                region: 'ENG',
                city: 'London',
                timezone: 'Europe/London',
                referrer: 'https://google.com',
                referrerDomain: 'google.com',
                source: 'search',
                medium: 'organic',
                device: 'mobile',
                browser: 'Safari',
                os: 'iOS',
                isNewVisitor: false,
                isReturningVisitor: true,
                startTime: new Date()
            }
        ];

        for (const visit of testPageVisits) {
            await PageVisit.create(visit);
            console.log(`  ✅ Created page visit: ${visit.page}`);
        }

        // Final count
        const finalAnalyticsCount = await Analytics.countDocuments();
        const finalPageVisitsCount = await PageVisit.countDocuments();

        console.log('🎉 Test Complete!');
        console.log(`📊 Final Analytics Count: ${finalAnalyticsCount}`);
        console.log(`🌐 Final Page Visits Count: ${finalPageVisitsCount}`);

        // Test aggregation queries
        console.log('🧮 Testing aggregation queries...');

        const projectViews = await Analytics.getProjectViews(testProject._id.toString());
        const projectDownloads = await Analytics.getProjectDownloads(testProject._id.toString());
        const pageViews = await Analytics.getPageViews();

        console.log('📈 Aggregation Results:');
        console.log(`  Project Views: ${projectViews.length} entries`);
        console.log(`  Project Downloads: ${projectDownloads.length} entries`);
        console.log(`  Page Views: ${pageViews.length} entries`);

        if (projectViews.length > 0) {
            console.log('  Sample Project View:', JSON.stringify(projectViews[0], null, 2));
        }

        console.log('✅ Analytics system test completed successfully!');

        process.exit(0);

    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

testAnalyticsSystem();