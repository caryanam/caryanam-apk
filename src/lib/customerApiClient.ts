import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DeviceEventEmitter, Alert } from "react-native";
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
    if (error.response && error.response.status === 429) {
      Alert.alert("Too many requests", "Please try again later.");
    }
    return Promise.reject(error);
  }
);

export default customerApiClient;
