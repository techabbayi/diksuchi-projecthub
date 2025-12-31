#!/usr/bin/env node

/**
 * Generate production-ready DIKSUCHI_PUBLIC_KEY environment variable
 * This converts the multi-line PEM file into a single-line format for deployment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const keyPath = path.join(__dirname, '../config/diksuchi-public.pem');

try {
    if (!fs.existsSync(keyPath)) {
        console.error('❌ Error: Public key file not found at:', keyPath);
        console.error('   Make sure config/diksuchi-public.pem exists');
        process.exit(1);
    }

    // Read the key
    const publicKey = fs.readFileSync(keyPath, 'utf8');

    // Convert to single-line format
    const singleLine = publicKey.replace(/\n/g, '\\n');

    console.log('\n' + '='.repeat(80));
    console.log('📋 PRODUCTION ENVIRONMENT VARIABLE');
    console.log('='.repeat(80));
    console.log('\nCopy this EXACT value to your deployment platform:');
    console.log('(Vercel, Railway, Render, AWS, etc.)\n');
    console.log('Variable Name: DIKSUCHI_PUBLIC_KEY');
    console.log('Variable Value:');
    console.log('─'.repeat(80));
    console.log(singleLine);
    console.log('─'.repeat(80));
    console.log('\n✅ Steps to deploy:');
    console.log('1. Copy the value above (from -----BEGIN to -----END)');
    console.log('2. Go to your deployment platform dashboard');
    console.log('3. Add environment variable: DIKSUCHI_PUBLIC_KEY');
    console.log('4. Paste the value');
    console.log('5. Redeploy your application');
    console.log('\n' + '='.repeat(80) + '\n');
} catch (error) {
    console.error('❌ Error reading public key:', error.message);
    process.exit(1);
}
