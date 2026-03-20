import requests
import time
import threading
from live_detection.packet_sniffer import PacketSniffer

BACKEND_ANALYZE_URL = "http://127.0.0.1:8000/analyze"
LIVE_STATUS_URL = "http://127.0.0.1:8000/live-status"

packets_to_log = 30
packet_counter = 0
last_sent = 0

# cached live status
live_active = False


# --------------------------------
# Check backend every 2 seconds
# --------------------------------
def live_status_monitor():

    global live_active

    while True:
        try:
            r = requests.get(LIVE_STATUS_URL, timeout=2)
            live_active = r.json().get("live", False)
        except:
            live_active = False

        time.sleep(2)


# --------------------------------
# Send packet to backend
# --------------------------------
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

        r = requests.post(BACKEND_ANALYZE_URL, json=data)

        if r.status_code == 200:
            packet_counter += 1

            if packet_counter % 5 == 0:
                print(f"Sent {packet_counter} packets to IDS server")

    except Exception as e:
        print("Error sending packet:", e)


print("Starting IDS sensor...")
print("Starting IDS packet capture...")

# start status monitor thread
threading.Thread(target=live_status_monitor, daemon=True).start()

sniffer = PacketSniffer(send_packet)
sniffer.start()