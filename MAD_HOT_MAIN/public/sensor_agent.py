import requests
import time
import os
from scapy.all import sniff, IP, TCP, UDP, ICMP

BACKEND_ANALYZE_URL = os.getenv("BACKEND_ANALYZE_URL", "https://mad-hot-ids.onrender.com/analyze")

packet_counter = 0
last_sent = 0
last_packet_time = None


def send_packet(features):

    global packet_counter, last_sent

    now = time.time()

    if packet_counter >= 50:
         return

    # throttle packets
    if now - last_sent < 0.2:
        return

    last_sent = now

    try:

        data = {
            "sourceIp": features["sourceIp"],
            "destIp": features["destIp"],
            "protocol": features["protocol"],
            "packetRate": features["packetRate"],
            "packetSize": features["packetSize"],
            "flowDuration": features["flowDuration"]
        }

        r = requests.post(BACKEND_ANALYZE_URL, json=data, timeout=3)

        if r.status_code == 200:
            packet_counter += 1

            if packet_counter == 1:
                print("Packet capture and analysis started...\n")

            print(f"Sent packet {packet_counter}")

    except Exception as e:
        print("Error sending packet:", e)


def process_packet(pkt):

    global last_packet_time

    if not pkt.haslayer(IP):
        return

    now = time.time()

    src = pkt[IP].src
    dst = pkt[IP].dst

    packet_size = len(pkt)

    # protocol detection
    if pkt.haslayer(TCP):
        protocol = "tcp"
    elif pkt.haslayer(UDP):
        protocol = "udp"
    elif pkt.haslayer(ICMP):
        protocol = "icmp"
    else:
        protocol = "tcp"

    # packet rate calculation
    if last_packet_time:
        rate = 1 / (now - last_packet_time + 1e-6)
        flow_duration = now - last_packet_time
    else:
        rate = 1
        flow_duration = 0.1

    last_packet_time = now

    features = {
        "sourceIp": src,
        "destIp": dst,
        "protocol": protocol,
        "packetRate": rate,
        "packetSize": packet_size,
        "flowDuration": flow_duration
    }

    send_packet(features)


print("====================================")
print(" MAD-HOT IDS Sensor Started")
print("====================================")
print("Capturing network packets...")
print("Press CTRL+C to stop\n")

sniff(prn=process_packet, store=False)
