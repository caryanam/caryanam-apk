import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DeviceEventEmitter } from "react-native";
import { ENV } from "../utils/env";

const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
});

apiClient.interceptors.request.use(async (config) => {
  const url = config.url ?? "";
  const isAdminApi = url.includes("/api/admin");

  let token = "";
  if (isAdminApi) {
    token = (await AsyncStorage.getItem("adminToken")) ?? "";
  } else {
    token =
      (await AsyncStorage.getItem("dealerToken")) ??
      (await AsyncStorage.getItem("adminToken")) ??
      "";
  }

  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const url = error.config?.url ?? "";
      const isAdminApi = url.includes("/api/admin");
      DeviceEventEmitter.emit("auth-session-expired", {
        role: isAdminApi ? "admin" : "dealer",
      });
    }
    return Promise.reject(error);
  }
);

export default apiClient;
