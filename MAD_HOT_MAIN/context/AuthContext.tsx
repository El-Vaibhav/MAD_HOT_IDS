"use client";

import { createContext, useContext, useEffect, useState } from "react";
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<{
    name: string;
    email: string;
  } | null>(null);

  const loadProfile = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE}/get-profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error();
      }

      const profile = await response.json();

      setUser(profile);
    } catch {
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  useEffect(() => {
  const token = localStorage.getItem("token");

  if (token) {
    loadProfile(token);
  }
}, []);

  const login = async (token: string) => {
  localStorage.setItem("token", token);
  await loadProfile(token);
};

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);