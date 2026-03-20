"use client"

import { useEffect, useState } from "react"
import { connectLiveDetection } from "@/lib/live_detection"

export default function LiveTraffic() {

  const [events, setEvents] = useState<Array<{
    sourceIp: string
    destIp: string
    prediction: string
    confidence: number
    packetRate: number
  }>>([])

  useEffect(() => {

    const socket = connectLiveDetection((data: { sourceIp: string; destIp: string; prediction: string; confidence: number; packetRate: number }) => {

      setEvents(prev => [data, ...prev].slice(0, 25))

    })

    return () => socket.close()

  }, [])

  return (

    <div className="p-6">

      <h2 className="text-xl font-bold mb-4">
        Live Network Detection
      </h2>

      <div className="space-y-3">

        {events.map((event, index) => (

          <div
            key={index}
            className="border rounded-lg p-3 bg-black text-green-400"
          >

            <div>
              {event.sourceIp} → {event.destIp}
            </div>

            <div>
              Prediction: {event.prediction}
            </div>

            <div>
              Confidence: {(event.confidence * 100).toFixed(2)}%
            </div>

            <div>
              Packet Rate: {event.packetRate.toFixed(2)}
            </div>

          </div>

        ))}

      </div>

    </div>

  )

}