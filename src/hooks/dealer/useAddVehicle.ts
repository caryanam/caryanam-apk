import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import axios from "axios";
import apiClient from "../../lib/apiClient";

export class VehicleError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;
  constructor(message: string, status: number, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = "VehicleError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export function useAddVehicle(dealerId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    any,
    Error,
    { vehicleData: any; images: any[]; videos: any[] }
  >({
    mutationFn: async ({ vehicleData, images, videos }) => {
      const formData = new FormData();
      
      // In React Native, we can append stringified JSON as a field or as a blob part string
      formData.append("vehicle", JSON.stringify(vehicleData));
      
      images.forEach((image, index) => {
        if (image) {
          formData.append("images", {
            uri: image.uri,
            type: image.type || "image/jpeg",
            name: image.fileName || `image_${index}.jpg`,
          } as any);
        }
      });

      videos.forEach((video, index) => {
        if (video) {
          formData.append("videos", {
            uri: video.uri,
            type: video.type || "video/mp4",
            name: video.fileName || `video_${index}.mp4`,
          } as any);
        }
      });

      try {
        const { data: body } = await apiClient.post(
          `/api/vehicle/add/${dealerId}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        return body?.data !== undefined ? body.data : body;
      } catch (err: any) {
        if (axios.isAxiosError(err)) {
          const body = err.response?.data;
          throw new VehicleError(
            body?.message ?? "Failed to add vehicle",
            body?.status ?? err.response?.status ?? 500,
            body?.errors ?? undefined
          );
        }
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles", dealerId] });
      Alert.alert("Success", "Vehicle added successfully");
    },
    onError: (error: any) => {
      if (error instanceof VehicleError && error.fieldErrors && Object.keys(error.fieldErrors).length > 0) {
        const errorMessages = Object.values(error.fieldErrors).join("\n");
        Alert.alert("Validation Error", errorMessages);
      } else {
        Alert.alert("Error", error.message ?? "Failed to add vehicle");
      }
    }
  });
}
