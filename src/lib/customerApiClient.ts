import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DeviceEventEmitter } from "react-native";
import { ENV } from "../utils/env";

const customerApiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
});

customerApiClient.interceptors.request.use(async (config) => {
  const token = (await AsyncStorage.getItem("customerToken")) ?? "";
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

customerApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      DeviceEventEmitter.emit("customer-session-expired");
    }
    return Promise.reject(error);
  }
);

export default customerApiClient;
