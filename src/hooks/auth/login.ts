import * as React from "react";
import axios from "axios";
import apiClient from "../../lib/apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";

type LoginPayload = {
  username: string;
  password: string;
};

type LoginData = {
  token: string;
};

export class LoginError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "LoginError";
    this.status = status;
  }
}

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

export function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const rawData = b64decode(base64);
    return JSON.parse(rawData);
  } catch {
    return {};
  }
}

export function useLogin() {
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);

  const login = React.useCallback(async (payload: LoginPayload) => {
    setIsLoggingIn(true);
    try {
      const { data: body } = await apiClient.post<{
        status: number;
        message: string;
        data: LoginData;
      }>("/api/auth/login", payload);

      const token = body?.data?.token;
      if (!token) {
        throw new LoginError(
          body?.message ?? "Login failed — no token received",
          body?.status ?? 401
        );
      }

      const decoded = decodeJwtPayload(token);
      const rawRole = String(
        decoded.role ?? decoded.roles ?? decoded.authority ?? ""
      ).toUpperCase();

      const isAdmin =
        rawRole.includes("ADMIN") ||
        (Array.isArray(decoded.roles) &&
          (decoded.roles as string[]).some((r) =>
            r.toUpperCase().includes("ADMIN")
          ));

      const isDealer =
        rawRole.includes("DEALER") ||
        (Array.isArray(decoded.roles) &&
          (decoded.roles as string[]).some((r) =>
            r.toUpperCase().includes("DEALER")
          ));

      const isCustomer =
        rawRole.includes("CUSTOMER") ||
        (Array.isArray(decoded.roles) &&
          (decoded.roles as string[]).some((r) =>
            r.toUpperCase().includes("CUSTOMER")
          ));

      if (isAdmin) {
        await AsyncStorage.setItem("adminToken", token);
        await AsyncStorage.setItem("adminData", JSON.stringify(decoded));
        return { role: "admin" as const, token, data: decoded };
      } else if (isDealer) {
        await AsyncStorage.setItem("dealerToken", token);
        await AsyncStorage.setItem("dealerData", JSON.stringify(decoded));
        return { role: "dealer" as const, token, data: decoded };
      } else if (isCustomer) {
        // Customer context handles its own specific formatting, but we will store tokens here as base
        // Then Login screen can hydrate the customer context if needed, or we just pass it back.
        return { role: "customer" as const, token, data: decoded };
      } else {
        throw new LoginError(
          "Access denied. Unrecognized user role.",
          403
        );
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const body = err.response?.data;
        throw new LoginError(
          body?.message ?? "Login failed",
          body?.status ?? err.response?.status ?? 500
        );
      }
      throw err;
    } finally {
      setIsLoggingIn(false);
    }
  }, []);

  return { isLoggingIn, login };
}
