import { v2 as cloudinary } from 'cloudinary';

let isConfigured = false;

// Initialize Cloudinary config lazily
const initializeCloudinary = () => {
    if (!isConfigured) {
        // Debug Cloudinary configuration
        console.log('☁️ Cloudinary Config Check:');
        console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME || 'MISSING');
        console.log('API Key:', process.env.CLOUDINARY_API_KEY ? '✅ SET' : '❌ MISSING');
        console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? '✅ SET' : '❌ MISSING');

        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });

        isConfigured = true;
        console.log('✅ Cloudinary configured successfully!');
    }
};

// Create a proxy that initializes Cloudinary on first use
const cloudinaryProxy = new Proxy(cloudinary, {
    get(target, prop) {
        initializeCloudinary();
        return target[prop];
    }
});

export default cloudinaryProxy;
