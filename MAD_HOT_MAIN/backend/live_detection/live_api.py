from fastapi import FastAPI, WebSocket
from live_detection.packet_sniffer import PacketSniffer
from live_detection.live_predictor import LivePredictor
import asyncio

from fastapi import APIRouter

router = APIRouter()
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "model" / "iot23_ids_model.pkl"

predictor = LivePredictor(str(MODEL_PATH))
clients = []


async def broadcast(data):
    for client in clients:
        await client.send_json(data)


def analyze(features):

    result = predictor.predict(features)

    if result:
        asyncio.create_task(broadcast(result))


sniffer = PacketSniffer(analyze)


@router.websocket("/ws/live-detection")
async def websocket_endpoint(websocket: WebSocket):

    await websocket.accept()
    clients.append(websocket)

    try:
        while True:
            await websocket.receive_text()
    except:
        clients.remove(websocket)


@router.on_event("startup")
def start_sniffer():
    import threading
    threading.Thread(target=sniffer.start, daemon=True).start()