import express from 'express';
import axios from 'axios';

const router = express.Router();

// Token exchange endpoint (proxy to avoid CORS)
router.post('/token', async (req, res) => {
    try {
        const { code, redirect_uri, code_verifier, client_id } = req.body;

        if (!code || !redirect_uri || !code_verifier || !client_id) {
            return res.status(400).json({
                success: false,
                message: 'Missing required parameters',
            });
        }

        // Exchange code for token with Diksuchi OAuth server
        const authServerUrl = process.env.DIKSUCHI_AUTH_SERVER_URL;
        const tokenUrl = `${authServerUrl}/api/oauth/token`;

        const response = await axios.post(
            tokenUrl,
            {
                grant_type: 'authorization_code',
                code,
                redirect_uri,
                client_id,
                code_verifier,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        res.json({
            success: true,
            data: response.data,
        });
    } catch (error) {
        console.error('OAuth token exchange failed:', error.message);

        res.status(error.response?.status || 500).json({
            success: false,
            message: error.response?.data?.error || 'Token exchange failed',
            error: error.response?.data || error.message,
        });
    }
});

export default router;
