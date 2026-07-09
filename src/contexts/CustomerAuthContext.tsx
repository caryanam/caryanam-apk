import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import customerApiClient from "../lib/customerApiClient";

export interface CustomerUser {
  customerName: string;
  mobile: string;
  customerCity: string;
  email: string;
  token: string;
  decoded: Record<string, unknown>;
}

const STORAGE_KEY = "customerUser";

// Pure JS Base64 Decoder (since window.atob is not available in React Native by default)
const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
function b64decode(input: string): string {
  const str = String(input).replace(/=+$/, "");
  let output = "";
  if (str.length % 4 === 1) {
    throw new Error("Invalid base64 string.");
  }
  for (
    let bc = 0, bs = 0, rbuffer, idx = 0;
    (rbuffer = str.charAt(idx++));
    ~rbuffer &&
    ((bs = bc % 4 ? bs * 64 + rbuffer : rbuffer), bc++ % 4)
      ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
      : 0
  ) {
    rbuffer = chars.indexOf(rbuffer);
  }
  return output;
}

function decodeJwt(token: string): Record<string, unknown> {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const rawData = b64decode(base64);
    return JSON.parse(rawData);
  } catch (e) {
    return {};
  }
}

interface CustomerAuthContextValue {
  customer: CustomerUser | null;
  loading: boolean;
  login: (payload: { username: string; password: string }) => Promise<CustomerUser>;
  register: (payload: {
    customerName: string;
    mobile: string;
    customerCity: string;
    email: string;
    password: string;
  }) => Promise<void>;
  setUserFromToken: (token: string, decoded: Record<string, unknown>) => Promise<void>;
  logout: () => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null);

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          setCustomer(JSON.parse(raw) as CustomerUser);
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    }
    restoreSession();
  }, []);

  const login = useCallback(
    async (payload: { username: string; password: string }): Promise<CustomerUser> => {
      try {
        const { data: body } = await customerApiClient.post<{
          status: number;
          message: string;
          data: {
            token: string;
            customerName?: string;
            mobile?: string;
            customerCity?: string;
          };
        }>("/api/auth/login", payload);

        const token = body?.data?.token;
        if (!token) {
          throw new Error(body?.message ?? "Login failed — no token received");
        }

        const decoded = decodeJwt(token);

        // Role check
        const rawRole = String(
          decoded.role ?? decoded.roles ?? decoded.authority ?? ""
        ).toUpperCase();
        const isCustomer =
          rawRole.includes("CUSTOMER") ||
          (Array.isArray(decoded.roles) &&
            (decoded.roles as string[]).some((r) =>
              r.toUpperCase().includes("CUSTOMER")
            ));

        if (!isCustomer) {
          throw new Error("Access denied. Customer account required.");
        }

        const user: CustomerUser = {
          customerName:
            body.data?.customerName ??
            (decoded.customerName as string) ??
            (decoded.name as string) ??
            (decoded.sub as string) ??
            "",
          mobile:
            body.data?.mobile ??
            (decoded.mobile as string) ??
            (decoded.mobileNumber as string) ??
            "",
          customerCity:
            body.data?.customerCity ??
            (decoded.customerCity as string) ??
            (decoded.city as string) ??
            "",
          email: (decoded.email as string) ?? "",
          token,
          decoded,
        };

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        await AsyncStorage.setItem("customerToken", token);
        await AsyncStorage.setItem("customerDecoded", JSON.stringify(decoded));

        setCustomer(user);
        return user;
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const body = err.response?.data;
          throw new Error(body?.message ?? "Login failed");
        }
        throw err;
      }
    },
    []
  );

  const register = useCallback(
    async (payload: {
      customerName: string;
      mobile: string;
      customerCity: string;
      email: string;
      password: string;
    }): Promise<void> => {
      try {
        await customerApiClient.post("/api/customer/register", payload);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const body = err.response?.data;
          if (body?.errors && typeof body.errors === "object") {
            const errMsgs = Object.values(body.errors).filter(Boolean);
            if (errMsgs.length > 0) {
              throw new Error(errMsgs.join(", "));
            }
          }
          throw new Error(body?.message ?? "Registration failed");
        }
        throw err;
      }
    },
    []
  );

  const setUserFromToken = useCallback(async (token: string, decoded: Record<string, unknown>) => {
    const user: CustomerUser = {
      customerName:
        (decoded.customerName as string) ??
        (decoded.name as string) ??
        (decoded.sub as string) ??
        "",
      mobile:
        (decoded.mobile as string) ??
        (decoded.mobileNumber as string) ??
        "",
      customerCity:
        (decoded.customerCity as string) ??
        (decoded.city as string) ??
        "",
      email: (decoded.email as string) ?? "",
      token,
      decoded,
    };

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    await AsyncStorage.setItem("customerToken", token);
    await AsyncStorage.setItem("customerDecoded", JSON.stringify(decoded));

    setCustomer(user);
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    await AsyncStorage.removeItem("customerToken");
    await AsyncStorage.removeItem("customerDecoded");
    await AsyncStorage.removeItem("customerWishlist");
    setCustomer(null);
  }, []);

  return (
    <CustomerAuthContext.Provider
      value={{ customer, loading, login, register, setUserFromToken, logout }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

// ── Mapped Hooks and helper functions ──

export function useCustomer() {
  const ctx = useContext(CustomerAuthContext);
  return ctx ? ctx.customer : null;
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) {
    throw new Error("useCustomerAuth must be used within CustomerAuthProvider");
  }
  return ctx;
}

export function getCustomerId(customer: CustomerUser | null): string | null {
  if (!customer) return null;
  const decoded = customer.decoded || {};
  const resolvedId = decoded.id || decoded.customerId || decoded.userId || decoded.sub;
  return resolvedId ? String(resolvedId) : null;
}
