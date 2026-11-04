import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

# Local Docker Mongo and Atlas differ only in this one value, so no code changes between environments
MONGODB_URI = os.environ.get("MONGODB_URI")
if not MONGODB_URI:
    raise RuntimeError("MONGODB_URI is not set. Copy backend/.env.example to backend/.env and fill it in.")

client = MongoClient(MONGODB_URI)
db = client["haas"]

users = db["users"]
projects = db["projects"]
hardware = db["hardware"]