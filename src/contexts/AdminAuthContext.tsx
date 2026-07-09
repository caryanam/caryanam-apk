import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AuthUser } from "../types";
import { ENV } from "../utils/env";

interface AdminAuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  setUserFromToken: (decoded: Record<string, unknown>) => Promise<void>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

function buildAdmin(decoded: Record<string, unknown>): AuthUser {
  return {
    id: String(decoded.id ?? decoded.sub ?? ""),
    name: String(decoded.fullName ?? decoded.name ?? decoded.email ?? "Admin"),
    email: String(decoded.email ?? decoded.sub ?? ""),
    role: "admin",
  };
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore state on mount
  useEffect(() => {
    async function restoreSession() {
      try {
        const raw = await AsyncStorage.getItem("adminData");
        if (raw) {
          setUser(buildAdmin(JSON.parse(raw)));
        }
      } catch (err) {
        /* ignore */
      } finally {
        setLoading(false);
      }
    }
    restoreSession();
  }, []);

  const setUserFromToken = useCallback(async (decoded: Record<string, unknown>) => {
    setUser(buildAdmin(decoded));
    await AsyncStorage.setItem("adminData", JSON.stringify(decoded));
  }, []);

  const logout = useCallback(async () => {
    try {
      const token = (await AsyncStorage.getItem("adminToken")) ?? "";
      await fetch(`${ENV.API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch {
      /* ignore */
    }
    await AsyncStorage.removeItem("adminToken");
    await AsyncStorage.removeItem("adminData");
    setUser(null);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ user, loading, setUserFromToken, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return ctx;
}
