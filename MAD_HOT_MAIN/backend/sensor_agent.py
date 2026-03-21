import requests
import time
from live_detection.packet_sniffer import PacketSniffer

BACKEND_ANALYZE_URL = "https://mad-hot-ids.onrender.com/analyze"

packet_counter = 0
last_sent = 0


def send_packet(features):

    global packet_counter, last_sent

    now = time.time()

    # throttle packets
    if now - last_sent < 0.2:
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

        r = requests.post(BACKEND_ANALYZE_URL, json=data, timeout=3)

        if r.status_code == 200:
            packet_counter += 1
            print(f"Sent packet {packet_counter}")

    except Exception as e:
        print("Error sending packet:", e)


print("Starting IDS sensor...")
print("Starting IDS packet capture...")

sniffer = PacketSniffer(send_packet)
sniffer.start()
