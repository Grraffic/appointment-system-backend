require("dotenv").config();

// Test with your actual credentials
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dp9hjzio8",
  api_key: "549258433219286",
  api_secret: "Y3YY_zxpOva4LZI6jkC2qWLP-R8",
});

// Test Cloudinary configuration
async function testCloudinary() {
  try {
    console.log("Testing Cloudinary configuration...");
    console.log("Cloud name: dp9hjzio8");

    // Test connection by getting account details
    const result = await cloudinary.api.ping();
    console.log("✅ Cloudinary connection successful:", result);

    // Test a simple upload
    console.log("Testing upload...");
    const uploadResult = await cloudinary.uploader.upload(
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
      {
        folder: "appointment-system/test",
        public_id: "test-image",
      }
    );
    console.log("✅ Upload successful:", uploadResult.secure_url);

    // Clean up test image
    await cloudinary.uploader.destroy("appointment-system/test/test-image");
    console.log("✅ Test cleanup successful");
  } catch (error) {
    console.error("❌ Cloudinary test failed:", error.message);
    console.error("Full error:", error);
  }
}

testCloudinary();
