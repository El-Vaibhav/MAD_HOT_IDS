// lib/api.ts

export interface PacketFeatures {
  sourceIp: string
  destIp: string
  protocol: string
  packetRate: number
  packetSize: number
  flowDuration: number
}

export interface AnalysisResult {
  attack: string
  confidence: number
}

export async function uploadTrafficFile(file: File) {

  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch("https://mad-hot-ids.onrender.com/upload", {
    method: "POST",
    body: formData
  })

  if (!response.ok) {
    throw new Error("Upload failed")
  }

  return response.json()
}

export async function analyzePacket(
  data: PacketFeatures
): Promise<AnalysisResult> {

  try {

    const response = await fetch("https://mad-hot-ids.onrender.com/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`)
    }

    const result = await response.json()

    return {
      attack: result.attack,
      confidence: result.confidence
    }

  } catch (error) {

    console.error("API request failed:", error)

    return {
      attack: "Error",
      confidence: 0
    }
  }
}