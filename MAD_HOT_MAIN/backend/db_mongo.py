from pymongo import MongoClient
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

mongo_uri = os.getenv("MONGO_URI")

if not mongo_uri:
    raise ValueError("MONGO_URI environment variable is required")

client = MongoClient(mongo_uri)

db = client["ids_database"]
packets_collection = db["packets"]


def save_packet(packet, prediction, confidence):

    document = {
        "sourceIp": packet["sourceIp"],
        "destIp": packet["destIp"],
        "protocol": packet["protocol"],
        "packetRate": packet["packetRate"],
        "packetSize": packet["packetSize"],
        "flowDuration": packet["flowDuration"],
        "prediction": prediction,
        "confidence": confidence,
        "timestamp": datetime.utcnow()
    }

    packets_collection.insert_one(document)


def get_recent_packets():

    packets = packets_collection.find(
        {},
        {
            "_id": 1,
            "sourceIp": 1,
            "destIp": 1,
            "protocol": 1,
            "packetRate": 1,
            "packetSize": 1,
            "prediction": 1,
            "confidence": 1,
            "timestamp": 1
        }
    ).sort("timestamp", -1).limit(50)

    result = []

    for p in packets:
        p["_id"] = str(p["_id"])
        result.append(p)

    return result
