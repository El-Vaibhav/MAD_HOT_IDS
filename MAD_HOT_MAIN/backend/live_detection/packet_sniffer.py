from scapy.all import sniff, IP, TCP, UDP
from .feature_extractor import update_flow


class PacketSniffer:

    def __init__(self, callback):
        self.callback = callback

    def process_packet(self, packet):

        if IP not in packet:
            return

        src_ip = packet[IP].src
        dst_ip = packet[IP].dst
        proto = packet[IP].proto
        size = len(packet)

        src_port = 0
        dst_port = 0

        if TCP in packet:
            src_port = packet[TCP].sport
            dst_port = packet[TCP].dport

        elif UDP in packet:
            src_port = packet[UDP].sport
            dst_port = packet[UDP].dport

        packet_info = {
            "src_ip": src_ip,
            "dst_ip": dst_ip,
            "src_port": src_port,
            "dst_port": dst_port,
            "protocol": proto,
            "size": size
        }

        features = update_flow(packet_info)

        if features:
            self.callback(features)

    def start(self):

        print("Starting IDS packet capture...\n")

        sniff(prn=self.process_packet, store=False)