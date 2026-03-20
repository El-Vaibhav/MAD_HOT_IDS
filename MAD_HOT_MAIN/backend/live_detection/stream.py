from .packet_sniffer import start_sniffing
from .feature_extractor import extract_features
from .live_predictor import predict
from ..db_mongo import save_packet


def start_stream(send_func):

    def handle_packet(packet):

        features = extract_features(packet)

        pred, conf = predict(features)

        save_packet(packet, pred, conf)

        send_func({
            **packet,
            "prediction": pred,
            "confidence": conf
        })

    start_sniffing(handle_packet)