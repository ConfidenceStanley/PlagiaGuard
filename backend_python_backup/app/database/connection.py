from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB connection URI from environment
MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = "plagiarism_db"

# Global client variable
client = None
database = None


def connect_to_database():
    """Connect to MongoDB Atlas"""
    global client, database

    try:
        client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)

        # Test the connection
        client.admin.command("ping")

        database = client[DATABASE_NAME]
        print(f"✅ Connected to MongoDB Atlas - Database: {DATABASE_NAME}")

        # Create indexes for better performance
        create_indexes()

    except ConnectionFailure as e:
        print(f"❌ MongoDB Connection Failed: {e}")
        raise e


def disconnect_from_database():
    """Disconnect from MongoDB"""
    global client
    if client:
        client.close()
        print("🔌 Disconnected from MongoDB")


def get_database():
    """Return the database instance"""
    global database
    if database is None:
        connect_to_database()
    return database


def create_indexes():
    """Create database indexes for performance"""
    global database

    try:
        # Users collection indexes
        database.users.create_index("email", unique=True)
        database.users.create_index("role")

        # Documents collection indexes
        database.documents.create_index("user_id")
        database.documents.create_index("status")
        database.documents.create_index("submitted_at")

        # Detection results indexes
        database.detection_results.create_index("document_id", unique=True)
        database.detection_results.create_index("user_id")
        database.detection_results.create_index("overall_score")

        # Notifications indexes
        database.notifications.create_index("user_id")
        database.notifications.create_index("is_read")

        print("✅ Database indexes created successfully")

    except Exception as e:
        print(f"⚠️ Index creation warning: {e}")


# Collection helpers - use these throughout the app
def get_users_collection():
    return get_database().users


def get_documents_collection():
    return get_database().documents


def get_results_collection():
    return get_database().detection_results


def get_notifications_collection():
    return get_database().notifications


def get_settings_collection():
    return get_database().system_settings