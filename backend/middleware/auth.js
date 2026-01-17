import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cache for public key and user data to improve performance
let cachedPublicKey = null;
const userCache = new Map();
const CACHE_DURATION = 300000; // 5 minutes

// Load RSA public key for OAuth token verification with caching
const getPublicKey = () => {
    // Return cached key if available
    if (cachedPublicKey) {
        return cachedPublicKey;
    }

    try {
        // Priority 1: Environment variable (for production deployment)
        if (process.env.DIKSUCHI_PUBLIC_KEY) {
            let key = process.env.DIKSUCHI_PUBLIC_KEY;
            key = key.replace(/^["']|["']$/g, '');
            key = key.replace(/\\n/g, '\n');
            key = key.trim();

            if (key.includes('BEGIN PUBLIC KEY')) {
                try {
                    const keyObject = crypto.createPublicKey({
                        key: key,
                        format: 'pem'
                    });
                    const pemKey = keyObject.export({
                        type: 'spki',
                        format: 'pem'
                    });
                    cachedPublicKey = pemKey; // Cache the key
                    return pemKey;
                } catch (keyError) {
                    console.error('❌ [getPublicKey] Failed to parse key from environment:', keyError.message);
                }
            }
        }

        // Priority 2: Load from file (for local development only)
        const keyPath = path.join(__dirname, '../config/diksuchi-public.pem');
        if (fs.existsSync(keyPath)) {
            const key = fs.readFileSync(keyPath, 'utf8');
            try {
                const keyObject = crypto.createPublicKey({
                    key: key,
                    format: 'pem'
                });
                const pemKey = keyObject.export({
                    type: 'spki',
                    format: 'pem'
                });
                cachedPublicKey = pemKey; // Cache the key
                return pemKey;
            } catch (keyError) {
                console.error('❌ [getPublicKey] Failed to parse key from file:', keyError.message);
            }
        }

        console.error('❌ [getPublicKey] No valid public key found');
        console.error('   Production: Set DIKSUCHI_PUBLIC_KEY environment variable');
        console.error('   Local Dev: Place key in', keyPath);
        return null;
    } catch (error) {
        console.error('❌ [getPublicKey] Unexpected error:', error.message);
        return null;
    }
};

// Verify OAuth token with RSA public key
const verifyOAuthToken = (token) => {
    const publicKey = getPublicKey();
    if (!publicKey) {
        throw new Error('Public key not configured');
    }

    try {


        const verified = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
        return verified;
    } catch (error) {
        console.error('❌ [Verify OAuth Token] Verification failed:', error.message);
        throw error;
    }
};

// Sync OAuth user to database
const syncOAuthUser = async (decoded) => {


    try {
        let user = await User.findOne({ oauthId: decoded.sub });

        if (!user) {

            // Check if user exists by email (might have been created manually)
            user = await User.findOne({ email: decoded.email });

            if (user) {

                // User exists with this email, just link the OAuth ID
                user.oauthId = decoded.sub;
                if (decoded.name) user.name = decoded.name;
                if (decoded.picture) user.avatar = decoded.picture;

                // Set authProvider from JWT or detect from profile picture
                if (decoded.authProviders && decoded.authProviders.length > 0) {
                    user.authProvider = decoded.authProviders.find(p => p !== 'local') || 'diksuchi';
                } else if (decoded.picture) {
                    // Fallback: detect provider from profile picture URL
                    if (decoded.picture.includes('github')) {
                        user.authProvider = 'github';
                    } else if (decoded.picture.includes('google') || decoded.picture.includes('googleapis')) {
                        user.authProvider = 'google';
                    } else if (decoded.picture.includes('licdn')) {
                        user.authProvider = 'linkedin';
                    } else {
                        user.authProvider = 'diksuchi';
                    }
                }

                user.isVerified = true;
                await user.save();

            } else {

                // Create new user from OAuth data
                const baseUsername = decoded.email.split('@')[0];
                let username = baseUsername + '_' + decoded.sub.substring(0, 8);

                // Detect auth provider from JWT or profile picture
                let authProvider = 'diksuchi';
                if (decoded.authProviders && decoded.authProviders.length > 0) {
                    authProvider = decoded.authProviders.find(p => p !== 'local') || 'diksuchi';
                } else if (decoded.picture) {
                    if (decoded.picture.includes('github')) authProvider = 'github';
                    else if (decoded.picture.includes('google') || decoded.picture.includes('googleapis')) authProvider = 'google';
                    else if (decoded.picture.includes('licdn')) authProvider = 'linkedin';
                }

                // Handle potential username collision with a more unique approach
                try {
                    user = await User.create({
                        oauthId: decoded.sub,
                        email: decoded.email,
                        username: username,
                        name: decoded.name || baseUsername,
                        avatar: decoded.picture,
                        authProvider: authProvider,
                        role: 'user',
                        isVerified: true,
                    });

                } catch (createError) {
                    // If username collision, try with timestamp
                    if (createError.code === 11000) {

                        username = baseUsername + '_' + Date.now();
                        user = await User.create({
                            oauthId: decoded.sub,
                            email: decoded.email,
                            username: username,
                            name: decoded.name || baseUsername,
                            authProvider: authProvider,
                            avatar: decoded.picture,
                            role: 'user',
                            isVerified: true,
                        });

                    } else {
                        throw createError;
                    }
                }
            }
        } else {

            // Update existing user data
            if (decoded.email && user.email !== decoded.email) {
                user.email = decoded.email;
            }
            if (decoded.name && user.name !== decoded.name) {
                user.name = decoded.name;
            }
            if (decoded.picture && user.avatar !== decoded.picture) {
                user.avatar = decoded.picture;
            }

            // Update auth provider from JWT or detect from picture
            if (decoded.authProviders && decoded.authProviders.length > 0) {
                const provider = decoded.authProviders.find(p => p !== 'local');
                if (provider && user.authProvider !== provider) {
                    user.authProvider = provider;
                }
            } else if (decoded.picture && !user.authProvider) {
                // Fallback: detect provider from profile picture URL
                if (decoded.picture.includes('github')) {
                    user.authProvider = 'github';
                } else if (decoded.picture.includes('google') || decoded.picture.includes('googleapis')) {
                    user.authProvider = 'google';
                } else if (decoded.picture.includes('licdn')) {
                    user.authProvider = 'linkedin';
                }
            }

            await user.save();
        }


        return user;
    } catch (error) {
        console.error('❌ [Sync OAuth User] Error:', error);
        throw error;
    }
};

// Protect routes - verify JWT token (both OAuth and regular) with caching
export const protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ message: 'Not authorized, no token' });
        }

        // Check cache first for performance
        const cached = userCache.get(token);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            req.user = cached.user;
            req.dbUser = cached.dbUser;
            return next();
        }

        let decoded;
        let isOAuthToken = false;

        // Try verifying as OAuth token first (RS256)
        try {
            decoded = verifyOAuthToken(token);
            isOAuthToken = true;
        } catch (oauthError) {
            // If OAuth verification fails, try regular JWT (HS256)
            try {
                decoded = jwt.verify(token, process.env.JWT_SECRET);
            } catch (regularError) {
                return res.status(401).json({ message: 'Not authorized, token failed' });
            }
        }

        let user, dbUser;

        if (isOAuthToken) {
            // OAuth token - sync user from token data
            user = { _id: decoded.sub };
            dbUser = await syncOAuthUser(decoded);
            user = dbUser;
        } else {
            // Regular token - get user from database with optimized query
            user = await User.findById(decoded.id)
                .select('-password')
                .lean(); // Use lean() for faster queries

            if (!user) {
                return res.status(401).json({ message: 'User not found' });
            }
        }

        // Cache the user data for performance
        userCache.set(token, {
            user: user,
            dbUser: dbUser,
            timestamp: Date.now()
        });

        // Clean up old cache entries (keep only last 100)
        if (userCache.size > 100) {
            const firstKey = userCache.keys().next().value;
            userCache.delete(firstKey);
        }

        req.user = user;
        req.dbUser = dbUser;

        next();
    } catch (error) {
        console.error('❌ [Auth Middleware] Unexpected error:', error);
        return res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

// Role-based authorization
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `User role '${req.user.role}' is not authorized to access this route`,
            });
        }
        next();
    };
};

// Check if user is creator or admin
export const isCreatorOrAdmin = (req, res, next) => {
    if (req.user.role !== 'creator' && req.user.role !== 'admin') {
        return res.status(403).json({
            message: 'Access denied. Creator or Admin role required.',
        });
    }
    next();
};
