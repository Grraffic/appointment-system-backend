require('dotenv').config();
const { cloudinary } = require('./src/config/cloudinary');

// Test Cloudinary configuration
async function testCloudinary() {
  try {
    console.log('Testing Cloudinary configuration...');
    
    // Test connection by getting account details
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary connection successful:', result);
    
    // Test folder creation
    const folders = await cloudinary.api.root_folders();
    console.log('📁 Available folders:', folders);
    
  } catch (error) {
    console.error('❌ Cloudinary configuration error:', error.message);
    console.error('Please check your environment variables:');
    console.error('- CLOUDINARY_CLOUD_NAME');
    console.error('- CLOUDINARY_API_KEY');
    console.error('- CLOUDINARY_API_SECRET');
  }
}

testCloudinary();
