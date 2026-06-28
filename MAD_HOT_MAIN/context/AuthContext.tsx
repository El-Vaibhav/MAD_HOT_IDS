"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { ENDPOINTS } from "@/lib/config";

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<string | null>(null);

  const loadCurrentUser = async () => {
    const response = await fetch(ENDPOINTS.me, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Invalid session");
    }

    const profile = await response.json();
    setUser(profile.email);
  };

  useEffect(() => {
    loadCurrentUser().catch(() => {
      setUser(null);
    });
  }, []);

  const login = async () => {
    try {
      await loadCurrentUser();
    } catch (error) {
      setUser(null);
      throw error;
    }
  };

  const logout = async () => {
    await fetch(ENDPOINTS.logout, { method: "POST", credentials: "include" });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);