from fastapi import FastAPI, WebSocket
from live_detection.packet_sniffer import PacketSniffer
from live_detection.live_predictor import LivePredictor
import asyncio

app = FastAPI()

predictor = LivePredictor("C:\\Users\\HP\\OneDrive\\Desktop\\v0-ai-cybersecurity-website-main\\v0-ai-cybersecurity-website-main\\backend\\model\\iot23_ids_model.pkl")

clients = []


async def broadcast(data):
    for client in clients:
        await client.send_json(data)


def analyze(features):

    result = predictor.predict(features)

    if result:
        asyncio.create_task(broadcast(result))


sniffer = PacketSniffer(analyze)


@app.websocket("/ws/live-detection")
async def websocket_endpoint(websocket: WebSocket):

    await websocket.accept()
    clients.append(websocket)

    try:
        while True:
            await websocket.receive_text()
    except:
        clients.remove(websocket)


@app.on_event("startup")
def start_sniffer():
    import threading
    threading.Thread(target=sniffer.start, daemon=True).start()