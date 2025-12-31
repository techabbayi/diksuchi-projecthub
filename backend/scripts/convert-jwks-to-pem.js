import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// JWKS data from https://diksuchi-auth-identity.vercel.app/.well-known/jwks.json
const jwks = {
    "keys": [
        {
            "kty": "RSA",
            "n": "tJTkOQhENZYoShn8Mo73A280e10jdAXczNMgwrKABPsGdQLd9b0HecV9vNNhbTOMn-lKJ_ta4R4bZYpUBfJRQDGbvxavcZ_TRXvriXFNYQf9GkxxCrgLn-0LOyGnjN-Eg3kaLmlEwDCBGRQt_hwKOV97hs8shJhj15ShnPSvZPdWQMS2DFLaRNK4rFdAnpgxRSG-DmbC2BaCeCjJiZ6v-Teeobw5gD258RLi7xUaMx-AT_KTXxfIUgLcGDlCdMnthpiY7kREeNwdQQAHshzmikhRg9_--d8mMpIuTKjP7ghxfwQMFgaWy5tkpWrdtmNooAk24h051E3CsqQmi-tUwQ",
            "e": "AQAB",
            "alg": "RS256",
            "use": "sig",
            "kid": "diksuchi-auth-key-1"
        }
    ]
};

/**
 * Convert base64url to base64
 */
function base64urlToBase64(base64url) {
    let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
        base64 += '=';
    }
    return base64;
}

/**
 * Convert JWKS to PEM format
 */
function jwkToPem(jwk) {
    try {
        // Convert base64url to buffer
        const nBuffer = Buffer.from(base64urlToBase64(jwk.n), 'base64');
        const eBuffer = Buffer.from(base64urlToBase64(jwk.e), 'base64');

        // Create public key object
        const publicKey = crypto.createPublicKey({
            key: {
                kty: jwk.kty,
                n: nBuffer.toString('base64'),
                e: eBuffer.toString('base64')
            },
            format: 'jwk'
        });

        // Export as PEM
        const pem = publicKey.export({
            type: 'spki',
            format: 'pem'
        });

        return pem;
    } catch (error) {
        console.error('❌ Error converting JWK to PEM:', error);
        throw error;
    }
}

// Convert the key
try {
    console.log('🔄 Converting JWKS to PEM format...\n');
    
    const key = jwks.keys[0];
    console.log('📋 Key info:');
    console.log('  - Key ID:', key.kid);
    console.log('  - Algorithm:', key.alg);
    console.log('  - Use:', key.use);
    console.log('  - Type:', key.kty);
    console.log('');

    const pem = jwkToPem(key);
    
    console.log('✅ PEM format generated:\n');
    console.log(pem);
    
    // Save to file
    const outputPath = path.join(__dirname, '../config/diksuchi-public.pem');
    fs.writeFileSync(outputPath, pem, 'utf8');
    console.log('✅ Saved to:', outputPath);
    
    // Also output for environment variable (single line format)
    const envFormat = pem.replace(/\n/g, '\\n');
    console.log('\n📋 For environment variable (.env file):');
    console.log('DIKSUCHI_PUBLIC_KEY="' + envFormat + '"');
    
} catch (error) {
    console.error('❌ Conversion failed:', error);
    process.exit(1);
}
