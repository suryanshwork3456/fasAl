"use client";
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("fasai_user");
      if (saved) setUser(JSON.parse(saved));
    } catch {}
  }, []);
  const login = (data) => {
    const next = { id: "demo-user", ...data };
    localStorage.setItem("fasai_user", JSON.stringify(next));
    localStorage.setItem("fasai_token", "demo-jwt-token");
    setUser(next);
  };
  const logout = () => {
    localStorage.removeItem("fasai_user");
    localStorage.removeItem("fasai_token");
    setUser(null);
  };
  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
