import Analytics from '../models/Analytics.js';
import PageVisit from '../models/PageVisit.js';
import UAParser from 'ua-parser-js';
import geoip from 'geoip-lite';
import { v4 as uuidv4 } from 'uuid';

// Helper function to parse user agent
const parseUserAgent = (userAgent) => {
    try {
        const parser = new UAParser(userAgent);
        const result = parser.getResult();

        // Map device types to match our enum
        let deviceType = result.device.type || 'desktop';
        switch (deviceType.toLowerCase()) {
            case 'mobile':
                deviceType = 'mobile';
                break;
            case 'tablet':
                deviceType = 'tablet';
                break;
            case 'desktop':
            case 'pc':
            default:
                deviceType = 'desktop';
                break;
        }

        return {
            browser: result.browser.name || 'Unknown',
            browserVersion: result.browser.version || 'Unknown',
            os: result.os.name || 'Unknown',
            osVersion: result.os.version || 'Unknown',
            device: deviceType,
            isMobile: deviceType === 'mobile' || deviceType === 'tablet'
        };
    } catch (error) {
        // User agent parsing error - continue without parsed data
        return {
            browser: 'Unknown',
            browserVersion: 'Unknown',
            os: 'Unknown',
            osVersion: 'Unknown',
            device: 'desktop',
            isMobile: false
        };
    }
};

// Helper function to get geographic info from IP
const getGeoInfo = (ip) => {
    try {
        // Skip local IPs
        if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
            return {
                country: 'Local',
                region: 'Local',
                city: 'Local',
                timezone: 'Local'
            };
        }

        const geo = geoip.lookup(ip);
        if (geo) {
            return {
                country: geo.country || 'Unknown',
                region: geo.region || 'Unknown',
                city: geo.city || 'Unknown',
                timezone: geo.timezone || 'Unknown'
            };
        }
    } catch (error) {
        // GeoIP lookup error - continue without geo data
    }

    return {
        country: 'Unknown',
        region: 'Unknown',
        city: 'Unknown',
        timezone: 'Unknown'
    };
};

// Helper function to determine traffic source
const determineTrafficSource = (referrer) => {
    if (!referrer || referrer === '') {
        return { source: 'direct', medium: 'none' };
    }

    const referrerDomain = new URL(referrer).hostname.toLowerCase();

    // Search engines
    if (referrerDomain.includes('google')) {
        return { source: 'search', medium: 'organic' };
    }
    if (referrerDomain.includes('bing')) {
        return { source: 'search', medium: 'organic' };
    }
    if (referrerDomain.includes('yahoo')) {
        return { source: 'search', medium: 'organic' };
    }
    if (referrerDomain.includes('duckduckgo')) {
        return { source: 'search', medium: 'organic' };
    }

    // Social media
    if (referrerDomain.includes('facebook')) {
        return { source: 'social', medium: 'social' };
    }
    if (referrerDomain.includes('twitter') || referrerDomain.includes('x.com')) {
        return { source: 'social', medium: 'social' };
    }
    if (referrerDomain.includes('linkedin')) {
        return { source: 'social', medium: 'social' };
    }
    if (referrerDomain.includes('instagram')) {
        return { source: 'social', medium: 'social' };
    }
    if (referrerDomain.includes('youtube')) {
        return { source: 'social', medium: 'social' };
    }
    if (referrerDomain.includes('reddit')) {
        return { source: 'social', medium: 'social' };
    }
    if (referrerDomain.includes('github')) {
        return { source: 'referral', medium: 'referral' };
    }

    return { source: 'referral', medium: 'referral' };
};

// Get client IP address
const getClientIP = (req) => {
    return req.ip ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
        req.headers['x-forwarded-for']?.split(',')[0] ||
        req.headers['x-real-ip'] ||
        '127.0.0.1';
};

// Analytics middleware for tracking page visits
export const trackPageVisit = async (req, res, next) => {
    try {
        // Skip tracking for certain routes
        const skipRoutes = ['/api', '/health', '/robots.txt', '/.well-known'];
        const skipFiles = ['/favicon.ico', '/favicon.png', '/apple-touch-icon.png', '/manifest.json'];

        const shouldSkip = skipRoutes.some(route => req.path.startsWith(route)) ||
            skipFiles.some(file => req.path === file) ||
            req.path.endsWith('.ico') ||
            req.path.endsWith('.png') ||
            req.path.endsWith('.js') ||
            req.path.endsWith('.css');

        if (shouldSkip) {
            return next();
        }

        const ip = getClientIP(req);
        const userAgent = req.headers['user-agent'] || '';
        const referrer = req.headers['referer'] || req.headers['referrer'] || '';
        const sessionId = req.sessionID || req.headers['x-session-id'] || uuidv4();
        const visitId = uuidv4();

        // Parse user agent
        const deviceInfo = parseUserAgent(userAgent);

        // Get geographic info
        const geoInfo = getGeoInfo(ip);

        // Determine traffic source
        const trafficSource = determineTrafficSource(referrer);

        // Get referrer domain
        let referrerDomain = '';
        try {
            if (referrer) {
                referrerDomain = new URL(referrer).hostname;
            }
        } catch (error) {
            // Invalid referrer URL
            referrerDomain = referrer;
        }

        // Check if user is authenticated
        const userId = req.user?._id || null;
        const isAuthenticated = !!req.user;

        // Determine if this is a new or returning visitor
        const isNewVisitor = !req.cookies?.visitor_id;
        const isReturningVisitor = !isNewVisitor;

        // Set visitor cookie if new (expires in 2 years)
        if (isNewVisitor) {
            res.cookie('visitor_id', uuidv4(), {
                maxAge: 63072000000, // 2 years in milliseconds
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax'
            });
        }

        // Create page visit record
        const pageVisitData = {
            page: req.path,
            route: req.originalUrl,
            title: req.headers['x-page-title'] || req.path,
            visitId,
            sessionId,
            userId,
            isAuthenticated,
            ipAddress: ip,
            userAgent,
            ...geoInfo,
            referrer,
            referrerDomain,
            ...trafficSource,
            ...deviceInfo,
            isNewVisitor,
            isReturningVisitor,
            startTime: new Date(),
            metadata: {
                protocol: req.protocol,
                method: req.method,
                host: req.headers.host,
                acceptLanguage: req.headers['accept-language'],
                acceptEncoding: req.headers['accept-encoding']
            }
        };

        // Save page visit asynchronously
        setImmediate(async () => {
            try {
                await PageVisit.create(pageVisitData);

                // Also create a general analytics record for page visits
                await Analytics.create({
                    type: 'page_visit',
                    page: req.path,
                    userId,
                    sessionId,
                    ipAddress: ip,
                    userAgent,
                    ...geoInfo,
                    referrer,
                    source: trafficSource.source,
                    ...deviceInfo,
                    metadata: {
                        route: req.originalUrl,
                        method: req.method,
                        ...trafficSource
                    }
                });
            } catch (error) {
                console.error('Page visit tracking error:', error);
            }
        });

        // Add visit info to request for use in routes
        req.visitInfo = {
            visitId,
            sessionId,
            ...deviceInfo,
            ...geoInfo,
            ip,
            isNewVisitor,
            isReturningVisitor
        };

    } catch (error) {
        console.error('Analytics middleware error:', error);
    }

    next();
};

// Track specific resource interactions (views, downloads)
export const trackInteraction = (type) => {
    return async (req, res, next) => {
        try {
            // Store interaction data for later tracking
            req.trackInteraction = {
                type,
                ip: getClientIP(req),
                userAgent: req.headers['user-agent'] || '',
                sessionId: req.sessionID || req.headers['x-session-id'] || uuidv4(),
                userId: req.user?._id || null,
                referrer: req.headers['referer'] || req.headers['referrer'] || '',
                ...parseUserAgent(req.headers['user-agent'] || ''),
                ...getGeoInfo(getClientIP(req)),
                timestamp: new Date()
            };
        } catch (error) {
            console.error('Interaction tracking setup error:', error);
        }

        next();
    };
};

// Helper function to record analytics event
export const recordAnalyticsEvent = async (eventData) => {
    try {
        await Analytics.create(eventData);
    } catch (error) {
        console.error('Analytics recording error:', error);
    }
};

// Helper function to track project view
export const trackProjectView = async (projectId, req) => {
    try {
        const trackingData = req.trackInteraction || {};

        await Analytics.create({
            type: 'view',
            resourceId: projectId,
            resourceType: 'Project',
            userId: trackingData.userId,
            sessionId: trackingData.sessionId,
            ipAddress: trackingData.ip,
            userAgent: trackingData.userAgent,
            country: trackingData.country,
            city: trackingData.city,
            referrer: trackingData.referrer,
            source: determineTrafficSource(trackingData.referrer).source,
            device: trackingData.device,
            browser: trackingData.browser,
            os: trackingData.os,
            metadata: {
                projectId,
                route: req.originalUrl,
                method: req.method
            }
        });
    } catch (error) {
        console.error('Project view tracking error:', error);
    }
};

// Helper function to track project download
export const trackProjectDownload = async (projectId, downloadData, req) => {
    try {
        const trackingData = req.trackInteraction || {};

        await Analytics.create({
            type: 'download',
            resourceId: projectId,
            resourceType: 'Project',
            userId: trackingData.userId,
            sessionId: trackingData.sessionId,
            ipAddress: trackingData.ip,
            userAgent: trackingData.userAgent,
            country: trackingData.country,
            city: trackingData.city,
            referrer: trackingData.referrer,
            source: determineTrafficSource(trackingData.referrer).source,
            device: trackingData.device,
            browser: trackingData.browser,
            os: trackingData.os,
            downloadSize: downloadData.size || 0,
            downloadSuccess: downloadData.success !== false,
            metadata: {
                projectId,
                downloadType: downloadData.type || 'zip',
                fileName: downloadData.fileName,
                route: req.originalUrl,
                method: req.method
            }
        });
    } catch (error) {
        console.error('Project download tracking error:', error);
    }
};

// Middleware to track API endpoint usage
export const trackAPIUsage = (endpoint) => {
    return async (req, res, next) => {
        try {
            setImmediate(async () => {
                try {
                    const trackingData = {
                        type: 'page_visit',
                        page: endpoint,
                        userId: req.user?._id || null,
                        sessionId: req.sessionID || uuidv4(),
                        ipAddress: getClientIP(req),
                        userAgent: req.headers['user-agent'] || '',
                        ...parseUserAgent(req.headers['user-agent'] || ''),
                        ...getGeoInfo(getClientIP(req)),
                        metadata: {
                            endpoint,
                            method: req.method,
                            route: req.originalUrl,
                            authenticated: !!req.user
                        }
                    };

                    await Analytics.create(trackingData);
                } catch (error) {
                    console.error('API usage tracking error:', error);
                }
            });
        } catch (error) {
            console.error('API tracking middleware error:', error);
        }

        next();
    };
};

// Clean up old analytics data (run as scheduled job)
export const cleanupAnalyticsData = async (olderThanDays = 730) => {
    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

        const analyticsResult = await Analytics.deleteMany({
            createdAt: { $lt: cutoffDate }
        });

        const pageVisitsResult = await PageVisit.deleteMany({
            createdAt: { $lt: cutoffDate }
        });

        console.log(`Analytics cleanup: Removed ${analyticsResult.deletedCount} analytics records and ${pageVisitsResult.deletedCount} page visit records older than ${olderThanDays} days`);

        return {
            analytics: analyticsResult.deletedCount,
            pageVisits: pageVisitsResult.deletedCount
        };
    } catch (error) {
        console.error('Analytics cleanup error:', error);
        throw error;
    }
};