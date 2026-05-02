// 🔥 Base API URL (auto-switch between local & production)
const DEFAULT_API_BASE_URL = "http://localhost:8000"

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL

// 🔥 Convert HTTP → WS automatically
const apiAsWs = API_BASE_URL
  .replace(/^https:\/\//, "wss://")
  .replace(/^http:\/\//, "ws://")

// 🔥 Allow override for WebSocket (optional)
const WS_BASE_URL =
  process.env.NEXT_PUBLIC_WS_BASE_URL || apiAsWs

// 🔥 All endpoints
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
  register: `${API_BASE_URL}/auth/register`,
  login: `${API_BASE_URL}/auth/login`,
}
