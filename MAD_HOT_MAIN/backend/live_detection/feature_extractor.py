import time

flows = {}

def update_flow(packet_info):

    key = (packet_info["src_ip"], packet_info["dst_ip"])

    now = time.time()

    if key not in flows:
        flows[key] = {
            "start": now,
            "count": 0
        }

    flow = flows[key]

    flow["count"] += 1

    duration = now - flow["start"]

    if duration <= 0:
        packet_rate = 0
    else:
        packet_rate = flow["count"] / duration

    features = {
        "sourceIp": packet_info["src_ip"],
        "destIp": packet_info["dst_ip"],
        "protocol": packet_info["protocol"],
        "packetRate": packet_rate,
        "packetSize": packet_info["size"],
        "flowDuration": duration
    }

    return features