export function connectLiveDetection(onMessage: (data: any) => void) {

  const socket = new WebSocket("wss://mad-hot-ids.onrender.com/ws/live-detection")

  socket.onopen = () => {
    console.log("Connected to Live IDS")
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