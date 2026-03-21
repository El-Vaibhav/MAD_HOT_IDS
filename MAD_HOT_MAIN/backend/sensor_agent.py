import requests
import time
import threading
from live_detection.packet_sniffer import PacketSniffer

BACKEND_ANALYZE_URL = "https://mad-hot-ids.onrender.com/analyze"
LIVE_STATUS_URL = "https://mad-hot-ids.onrender.com/live-status"

packets_to_log = 30
packet_counter = 0
last_sent = 0
live_active = False


def live_status_monitor():

    global live_active, packet_counter
    prev_state = False

    while True:
        try:
            r = requests.get(LIVE_STATUS_URL, timeout=2)
            live_active = r.json().get("live", False)

            if live_active and not prev_state:
                packet_counter = 0
                print("Live detection started")

            prev_state = live_active

        except:
            live_active = False

        time.sleep(2)


def send_packet(features):

    global packet_counter, last_sent

    if not live_active:
        return

    if packet_counter >= packets_to_log:
        return

    if time.time() - last_sent < 0.5:
        return

    last_sent = time.time()

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

            if packet_counter % 5 == 0:
                print(f"Sent {packet_counter} packets to IDS server")

    except Exception as e:
        print("Error sending packet:", e)


print("Starting IDS sensor...")
print("Starting IDS packet capture...")

threading.Thread(target=live_status_monitor, daemon=True).start()

sniffer = PacketSniffer(send_packet)
sniffer.start()