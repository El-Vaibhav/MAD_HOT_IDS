const DEFAULT_API_BASE_URL = "https://mad-hot-ids.onrender.com"
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL

const apiAsWs = API_BASE_URL.replace(/^https:\/\//, "wss://").replace(/^http:\/\//, "ws://")
const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_BASE_URL || apiAsWs
const runtimeApiBase =
  typeof window !== "undefined" ? window.location.origin : "http://localhost:8000"
const runtimeWsBase =
  typeof window !== "undefined"
    ? `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}`
    : "ws://localhost:8000"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || runtimeApiBase
const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_BASE_URL || runtimeWsBase

export const ENDPOINTS = {
  analyze: `${API_BASE_URL}/analyze`,
  upload: `${API_BASE_URL}/upload`,
  startLive: `${API_BASE_URL}/start-live`,
  stopLive: `${API_BASE_URL}/stop-live`,
  liveDetectionWs: `${WS_BASE_URL}/ws/live-detection`,
  attackIntelligence: `${API_BASE_URL}/attack-intelligence`,
  recentPackets: `${API_BASE_URL}/recent-packets`,
  accountData: `${API_BASE_URL}/account-data`,
  getProfile: `${API_BASE_URL}/get-profile`,
  updateProfile: `${API_BASE_URL}/update-profile`,
}
