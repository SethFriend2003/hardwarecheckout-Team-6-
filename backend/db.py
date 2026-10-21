import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()
client = MongoClient(os.environ["MONGODB_URI"])
db = client["haas"]

users = db["users"]
projects = db["projects"]
hardware = db["hardware"]