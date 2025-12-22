import express from 'express';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// @route   POST /api/support/contact
// @desc    Submit support contact form
// @access  Public
router.post(
    '/contact',
    [
        body('name').notEmpty().trim().withMessage('Name is required'),
        body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
        body('subject').notEmpty().trim().withMessage('Subject is required'),
        body('message').notEmpty().trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters'),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { name, email, subject, message } = req.body;

            // In production, you would:
            // 1. Save to database
            // 2. Send email notification to support team
            // 3. Send confirmation email to user

            // For now, we'll just log it
            console.log('📧 Support Request Received:');
            console.log('Name:', name);
            console.log('Email:', email);
            console.log('Subject:', subject);
            console.log('Message:', message);
            console.log('Timestamp:', new Date().toISOString());

            // Example: Save to database (implement when you have a Support model)
            // const supportTicket = await Support.create({
            //     name,
            //     email,
            //     subject,
            //     message,
            //     status: 'open',
            //     createdAt: new Date()
            // });

            res.status(200).json({
                success: true,
                message: 'Support request submitted successfully. We will respond within 24 hours.',
                data: {
                    name,
                    email,
                    subject,
                }
            });
        } catch (error) {
            console.error('Support form error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to submit support request. Please try again later.'
            });
        }
    }
);

export default router;
