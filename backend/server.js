// Load environment variables FIRST (before any other imports)
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file with explicit path
dotenv.config({ path: path.join(__dirname, '.env') });

// Debug: Check if .env file is being loaded
console.log('🔧 Environment Variables Check:');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Missing');
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Missing');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Missing');
console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY ? '✅ Set' : '❌ Missing');

// Verify critical environment variables are loaded
if (!process.env.CLOUDINARY_API_KEY) {
    console.error('❌ ERROR: CLOUDINARY_API_KEY is not set in .env file');
    console.error('💡 Make sure .env file exists in backend/ directory');
    process.exit(1);
}

// Now import other modules
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import connectDB from './config/database.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import projectBuilderRoutes from './routes/projectBuilderRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import chatbotRoutes from './routes/chatbotRoutes.js';
import groqService from './services/groqService.js';

// Connect to database
connectDB();

// Test Groq API connection after database
if (process.env.GROQ_API_KEY) {
    groqService.testConnection().catch(err => {
        console.error('⚠️ Groq API test failed, but server will continue...');
    });
} else {
    console.warn('⚠️ GROQ_API_KEY not set - AI features will use fallback templates');
}

// Initialize app
const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
});

app.use('/api/', limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Compression
app.use(compression());

// CORS - More permissive configuration
app.use(
    cors({
        origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/project-builder', projectBuilderRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'ProjectHub API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            projects: '/api/projects',
            admin: '/api/admin',
            payment: '/api/payment',
            reviews: '/api/reviews',
        },
    });
});

// Error handlers
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

export default app;
