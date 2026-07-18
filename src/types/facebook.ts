export type SocialPostApprovalStatus = "PENDING" | "APPROVED" | "REJECTED" | null;

export type SocialPostPublishStatus =
  | "NOT_STARTED"
  | "QUEUED"
  | "PROCESSING"
  | "RETRY_SCHEDULED"
  | "PUBLISHED"
  | "FAILED"
  | null;

export type SocialPostBatchStatus =
  | "QUEUED"
  | "PROCESSING"
  | "COMPLETED"
  | "PARTIALLY_COMPLETED"
  | "FAILED";

export interface FacebookDealerVehicleStatusDTO {
  rejectionReason: any;
  vehicleId: number;
  brand: string;
  model: string;
  variant: string;
  registrationYear: number;
  askingPrice: number | null;
  primaryImageUrl: string | null;
  requestId: number | null;
  approvalStatus: SocialPostApprovalStatus;
  publishStatus: SocialPostPublishStatus;
  facebookPostUrl: string | null;
  selectable: boolean;
}

export interface FacebookPostRequestItemResultDTO {
  vehicleId: number;
  requestId: number | null;
  accepted: boolean;
  reason: string | null;
}

export interface FacebookPostRequestBulkResponseDTO {
  requestedCount: number;
  acceptedCount: number;
  skippedCount: number;
  results: FacebookPostRequestItemResultDTO[];
}

export interface FacebookAdminDealerSummaryDTO {
  dealerId: number;
  dealerBusinessName: string;
  pendingCount: number;
  processingCount: number;
  publishedCount: number;
  failedCount: number;
}

export interface FacebookAdminVehicleRequestDTO {
  requestId: number;
  vehicleId: number;
  brand: string;
  model: string;
  variant: string;
  primaryImageUrl: string | null;
  askingPrice: number | null;
  fuelType: string;
  registrationYear: number;
  approvalStatus: SocialPostApprovalStatus;
  publishStatus: SocialPostPublishStatus;
  requestedAt: string;
}

export interface FacebookBatchItemStatusDTO {
  requestId: number;
  vehicleId: number;
  vehicleName: string;
  status: SocialPostPublishStatus;
  retryCount: number;
  errorMessage: string | null;
  facebookPostUrl: string | null;
}

export interface FacebookBatchStatusDTO {
  batchId: number;
  status: SocialPostBatchStatus;
  totalCount: number;
  successCount: number;
  failedCount: number;
  pendingCount: number;
  createdAt: string;
  completedAt: string | null;
  items: FacebookBatchItemStatusDTO[];
}

export interface FacebookBulkApprovePublishResponseDTO {
  batchId: number;
  status: SocialPostBatchStatus;
  totalCount: number;
}

export interface FacebookPostRequestBulkRequestDTO {
  vehicleIds: number[];
}

export interface FacebookRejectRequestDTO {
  requestIds: number[];
  reason: string;
}

export interface FacebookBulkApprovePublishRequestDTO {
  dealerId: number;
  requestIds: number[];
}

export interface FacebookRetryFailedRequestDTO {
  batchId: number;
}
