import { ENDPOINTS } from "./config"

export function connectLiveDetection(onMessage: (data: any) => void) {

  const socket = new WebSocket(ENDPOINTS.liveDetectionWs)

  socket.onopen = () => {
    console.log("Connected to Live IDS")

    // send heartbeat every 5 seconds
    setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send("ping")
      }
    }, 5000)
  }

  socket.onmessage = (event) => {

    const data = JSON.parse(event.data)

    onMessage(data)

  }

  socket.onerror = (error) => {
    console.error("WebSocket error:", error)
  }

  socket.onclose = () => {
    console.log("WebSocket closed")
  }

  return socket
}
