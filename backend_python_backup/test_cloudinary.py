# test_cloudinary.py
import cloudinary
import cloudinary.uploader
from app.core.config import settings

print("=== Cloudinary Test ===")
print(f"Cloud Name: {settings.CLOUDINARY_CLOUD_NAME}")
print(f"API Key:    {settings.CLOUDINARY_API_KEY}")
print(f"Secret:     {settings.CLOUDINARY_API_SECRET[:6]}...")

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True
)

print("\nTesting upload...")

test_bytes = b"Hello PlagiaGuard test file content"

try:
    result = cloudinary.uploader.upload(
        test_bytes,
        resource_type="raw",
        folder="plagiarguard/test",
        public_id="test_file_123"
    )
    print(f"SUCCESS: {result['secure_url']}")

except Exception as e:
    print(f"ERROR: {str(e)}")