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

interface DealerAuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  setUserFromToken: (decoded: Record<string, unknown>) => Promise<void>;
  updateUserFields: (fields: Partial<Record<string, unknown>>) => Promise<void>;
  logout: () => Promise<void>;
}

const DealerAuthContext = createContext<DealerAuthContextValue | null>(null);

function buildDealer(decoded: Record<string, unknown>): AuthUser {
  return {
    id: String(decoded.id ?? decoded.sub ?? ""),
    name: String(
      decoded.businessName ??
        decoded.ownerName ??
        decoded.name ??
        decoded.email ??
        "Dealer"
    ),
    email: String(decoded.email ?? decoded.sub ?? ""),
    role: "dealer",
    dealerId: decoded.dealerId ? String(decoded.dealerId) : undefined,
  };
}

export function DealerAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      try {
        const raw = await AsyncStorage.getItem("dealerData");
        if (raw) {
          setUser(buildDealer(JSON.parse(raw)));
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    }
    restoreSession();
  }, []);

  const setUserFromToken = useCallback(async (decoded: Record<string, unknown>) => {
    setUser(buildDealer(decoded));
    await AsyncStorage.setItem("dealerData", JSON.stringify(decoded));
  }, []);

  const updateUserFields = useCallback(
    async (fields: Partial<Record<string, unknown>>) => {
      try {
        const raw = await AsyncStorage.getItem("dealerData");
        const existing = raw ? JSON.parse(raw) : {};
        const merged = { ...existing, ...fields };
        await AsyncStorage.setItem("dealerData", JSON.stringify(merged));
        setUser((prev) =>
          prev
            ? {
                ...prev,
                name: String(
                  fields.businessName ?? fields.ownerName ?? prev.name
                ),
              }
            : prev
        );
      } catch {
        /* ignore */
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      const token = (await AsyncStorage.getItem("dealerToken")) ?? "";
      await fetch(`${ENV.API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch {
      /* ignore */
    }
    await AsyncStorage.removeItem("dealerToken");
    await AsyncStorage.removeItem("dealerData");
    setUser(null);
  }, []);

  return (
    <DealerAuthContext.Provider
      value={{ user, loading, setUserFromToken, updateUserFields, logout }}
    >
      {children}
    </DealerAuthContext.Provider>
  );
}

export function useDealerAuth() {
  const ctx = useContext(DealerAuthContext);
  if (!ctx) {
    throw new Error("useDealerAuth must be used within DealerAuthProvider");
  }
  return ctx;
}
