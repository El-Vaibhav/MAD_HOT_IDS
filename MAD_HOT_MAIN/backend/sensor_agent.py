import requests
import time
import threading
from live_detection.packet_sniffer import PacketSniffer

BACKEND_ANALYZE_URL = "https://mad-hot-ids.onrender.com/analyze"
LIVE_STATUS_URL = "https://mad-hot-ids.onrender.com/live-status"

LIVE_PACKET_LIMIT = 30
BACKGROUND_PACKET_LIMIT = 5
BACKGROUND_INTERVAL = 7200   # 2 hours

packet_counter = 0
last_sent = 0
last_background_time = 0
live_active = False


def live_status_monitor():
    global live_active, packet_counter

    while True:
        try:
            r = requests.get(LIVE_STATUS_URL, timeout=3)
            state = r.json().get("live", False)

            if state and not live_active:
                print("Live detection triggered")
                packet_counter = 0

            live_active = state

        except:
            pass

        time.sleep(2)


def send_packet(features):

    global packet_counter, last_sent, last_background_time

    now = time.time()

    # throttle packets
    if now - last_sent < 0.3:
        return

    last_sent = now

    # determine allowed packets
    if live_active:
        if packet_counter >= LIVE_PACKET_LIMIT:
            return
    else:
        if now - last_background_time < BACKGROUND_INTERVAL:
            return
        if packet_counter >= BACKGROUND_PACKET_LIMIT:
            return

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
                print(f"Sent {packet_counter} packets")

            # reset background cycle
            if not live_active and packet_counter >= BACKGROUND_PACKET_LIMIT:
                last_background_time = time.time()
                packet_counter = 0

            # reset live cycle
            if live_active and packet_counter >= LIVE_PACKET_LIMIT:
                print("Live packet batch complete")
                packet_counter = 0

    except Exception as e:
        print("Error sending packet:", e)


print("Starting IDS sensor...")
print("Starting IDS packet capture...")

threading.Thread(target=live_status_monitor, daemon=True).start()

sniffer = PacketSniffer(send_packet)
sniffer.start()