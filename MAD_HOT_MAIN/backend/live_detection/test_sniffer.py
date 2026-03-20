from live_detection.packet_sniffer import PacketSniffer
from live_detection.live_predictor import LivePredictor

predictor = LivePredictor(r"C:\Users\HP\OneDrive\Desktop\v0-ai-cybersecurity-website-main\v0-ai-cybersecurity-website-main\backend\model\iot23_ids_model.pkl")

def analyze(features):

    result = predictor.predict(features)

    if result:
        print(result)


sniffer = PacketSniffer(analyze)

sniffer.start()