import time
import os
import json
from dotenv import load_dotenv
from kafka import KafkaProducer
from live_detection.packet_sniffer import PacketSniffer

# Load env variables
load_dotenv()

# Kafka Configuration
KAFKA_BROKER = "localhost:9092"
KAFKA_TOPIC = "network_packets"

# Initialize Kafka Producer
producer = KafkaProducer(
    bootstrap_servers=KAFKA_BROKER,
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

packet_counter = 0
last_sent = 0
MAX_PACKETS = 65


def send_packet(features):
    global packet_counter, last_sent

    now = time.time()

    # Throttle packets (avoid flooding)
    if now - last_sent < 0.2:
        return

    if packet_counter >= MAX_PACKETS:
        return

    last_sent = now

    try:
        proto_map = {
            6: "tcp",
            17: "udp",
            1: "icmp"
        }

        protocol = proto_map.get(features.get("protocol", 6), "tcp")

        data = {
            "sourceIp": str(features.get("sourceIp", "0.0.0.0")),
            "destIp": str(features.get("destIp", "0.0.0.0")),
            "protocol": protocol,
            "packetRate": float(features.get("packetRate", 1.0)),
            "packetSize": float(features.get("packetSize", 60)),
            "flowDuration": float(features.get("flowDuration", 0.1))
        }

        # 🔥 Send to Kafka instead of API
        producer.send(KAFKA_TOPIC, data)

        packet_counter += 1

        if packet_counter == 1:
            print("🚀 Packet capture and Kafka streaming started...")

        print(f"📡 Sent packet {packet_counter}: {data}")

    except Exception as e:
        print("❌ Error sending packet:", e)


print("🚀 Starting IDS sensor...")
print("📡 Starting packet capture...")

# Start Sniffer
sniffer = PacketSniffer(send_packet)
sniffer.start()