// lib/api.ts
import axios from "axios";

export interface PacketFeatures {
  sourceIp: string;
  destIp: string;
  protocol: string;
  packetRate: number;
  packetSize: number;
  flowDuration: number;
}

export interface AnalysisResult {
  attack: string;
  confidence: number;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// =======================================
// Axios Instance
// =======================================

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// =======================================
// Automatically attach JWT
// =======================================

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// =======================================
// Handle Unauthorized
// =======================================

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      typeof window !== "undefined" &&
      error.response?.status === 401
    ) {
      localStorage.removeItem("token");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// =======================================
// Fetch Wrapper (Existing)
// =======================================

export const fetchWithAuth = async (
  url: string,
  options: RequestInit = {}
) => {
  const token = localStorage.getItem("token");
  const requestUrl = /^https?:\/\//.test(url)
    ? url
    : `${API_BASE}${url}`;

  const res = await fetch(requestUrl, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (res.status === 401 && token) {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  return res;
};

// =======================================
// Upload CSV
// =======================================

export async function uploadTrafficFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetchWithAuth("/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Upload failed");
  }

  return response.json();
}

// =======================================
// Analyze Packet
// =======================================

export async function analyzePacket(
  data: PacketFeatures
): Promise<AnalysisResult> {
  try {
    const response = await fetchWithAuth("/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    const result = await response.json();

    return {
      attack: result.attack,
      confidence: result.confidence,
    };
  } catch (error) {
    console.error("API request failed:", error);

    return {
      attack: "Error",
      confidence: 0,
    };
  }
}

export default api;