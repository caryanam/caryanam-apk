import * as React from "react";
import apiClient from "../../lib/apiClient";
import axios from "axios";

// ── Send OTP (Customer) ──
export function useCustomerSendOtp() {
  const [isPending, setIsPending] = React.useState(false);

  const sendOtp = React.useCallback(async (email: string) => {
    setIsPending(true);
    try {
      const { data: body } = await apiClient.post(
        `/api/auth/send-otp?email=${encodeURIComponent(email)}`
      );
      return body;
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const body = err.response?.data;
        throw new Error(body?.message ?? "Failed to send OTP");
      }
      throw err;
    } finally {
      setIsPending(false);
    }
  }, []);

  return { isPending, sendOtp };
}

// ── Verify OTP (Customer) ──
export function useCustomerVerifyOtp() {
  const [isPending, setIsPending] = React.useState(false);

  const verifyOtp = React.useCallback(async (payload: { email: string; otp: string }) => {
    setIsPending(true);
    try {
      const { data: body } = await apiClient.post(`/api/auth/verify-otp`, payload);
      return body;
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const body = err.response?.data;
        throw new Error(body?.message ?? "Failed to verify OTP");
      }
      throw err;
    } finally {
      setIsPending(false);
    }
  }, []);

  return { isPending, verifyOtp };
}

// ── Reset Password (Customer) ──
export function useCustomerResetPassword() {
  const [isPending, setIsPending] = React.useState(false);

  const resetPassword = React.useCallback(
    async (payload: { email: string; otp?: string; newPassword?: string; password?: string }) => {
      setIsPending(true);
      try {
        const dataPayload = {
          email: payload.email,
          otp: payload.otp,
          password: payload.password || payload.newPassword,
          newPassword: payload.newPassword || payload.password,
        };
        const { data: body } = await apiClient.post(`/api/auth/reset-password`, dataPayload);
        return body;
      } catch (err: any) {
        if (axios.isAxiosError(err)) {
          const body = err.response?.data;
          throw new Error(body?.message ?? "Failed to reset password");
        }
        throw err;
      } finally {
        setIsPending(false);
      }
    },
    []
  );

  return { isPending, resetPassword };
}
