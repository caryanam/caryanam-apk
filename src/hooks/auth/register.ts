import * as React from "react";
import axios from "axios";
import apiClient from "../../lib/apiClient";

export type DealerRegistrationPayload = {
  businessName: string;
  ownerName: string;
  dateOfBirth?: string;
  gstNumber?: string;
  yearsInBusiness: number;
  dealerMobile: string;
  executiveMobile?: string;
  whatsapp: string;
  email?: string;
  password: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
};

export class ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;

  constructor(
    message: string,
    status: number,
    fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export function useDealerRegister() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const registerDealer = React.useCallback(
    async (
      payload: DealerRegistrationPayload,
      showroomImageUri?: string | null,
      dealerLogoUri?: string | null,
    ) => {
      setIsSubmitting(true);
      try {
        const formData = new FormData();
        
        // In React Native, passing JSON string to FormData for a Multipart
        formData.append("dealer", JSON.stringify(payload));
        
        if (showroomImageUri) {
          const fileName = showroomImageUri.split('/').pop() || 'showroom.jpg';
          formData.append("showroomImage", {
            uri: showroomImageUri,
            name: fileName,
            type: "image/jpeg"
          } as any);
        }

        if (dealerLogoUri) {
          const fileName = dealerLogoUri.split('/').pop() || 'logo.jpg';
          formData.append("dealerLogo", {
            uri: dealerLogoUri,
            name: fileName,
            type: "image/jpeg"
          } as any);
        }

        const { data: body } = await apiClient.post(
          "/api/dealer/register",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        return body;
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const body = err.response?.data;
          throw new ApiError(
            body?.message ?? err.message,
            body?.status ?? err.response?.status ?? 500,
            body?.errors,
          );
        }
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [],
  );

  return { isSubmitting, registerDealer };
}

export function useSendRegistrationOtp() {
  const [isSending, setIsSending] = React.useState(false);

  const sendOtp = React.useCallback(async (email: string) => {
    setIsSending(true);
    try {
      const baseURL = apiClient.defaults.baseURL;
      const { data } = await axios.post(`${baseURL}/api/dealer/send-registration-otp?email=${encodeURIComponent(email)}`);
      return data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const body = err.response?.data;
        throw new ApiError(
          body?.message ?? err.message,
          body?.status ?? err.response?.status ?? 500,
          body?.errors,
        );
      }
      throw err;
    } finally {
      setIsSending(false);
    }
  }, []);

  return { isSending, sendOtp };
}

export function useVerifyRegistrationOtp() {
  const [isVerifying, setIsVerifying] = React.useState(false);

  const verifyOtp = React.useCallback(async (email: string, otp: string) => {
    setIsVerifying(true);
    try {
      const baseURL = apiClient.defaults.baseURL;
      const { data } = await axios.post(`${baseURL}/api/dealer/verify-registration-otp`, { email, otp });
      return data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const body = err.response?.data;
        throw new ApiError(
          body?.message ?? err.message,
          body?.status ?? err.response?.status ?? 500,
          body?.errors,
        );
      }
      throw err;
    } finally {
      setIsVerifying(false);
    }
  }, []);

  return { isVerifying, verifyOtp };
}

export function useCustomerSendRegistrationOtp() {
  const [isSending, setIsSending] = React.useState(false);

  const sendOtp = React.useCallback(async (email: string) => {
    setIsSending(true);
    try {
      const baseURL = apiClient.defaults.baseURL;
      const { data } = await axios.post(`${baseURL}/api/customer/send-registration-otp?email=${encodeURIComponent(email)}`);
      return data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const body = err.response?.data;
        throw new ApiError(
          body?.message ?? err.message,
          body?.status ?? err.response?.status ?? 500,
          body?.errors,
        );
      }
      throw err;
    } finally {
      setIsSending(false);
    }
  }, []);

  return { isSending, sendOtp };
}

export function useCustomerVerifyRegistrationOtp() {
  const [isVerifying, setIsVerifying] = React.useState(false);

  const verifyOtp = React.useCallback(async (email: string, otp: string) => {
    setIsVerifying(true);
    try {
      const baseURL = apiClient.defaults.baseURL;
      const { data } = await axios.post(`${baseURL}/api/customer/verify-registration-otp`, { email, otp });
      return data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const body = err.response?.data;
        throw new ApiError(
          body?.message ?? err.message,
          body?.status ?? err.response?.status ?? 500,
          body?.errors,
        );
      }
      throw err;
    } finally {
      setIsVerifying(false);
    }
  }, []);

  return { isVerifying, verifyOtp };
}
