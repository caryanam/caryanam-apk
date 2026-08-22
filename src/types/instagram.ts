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

export interface InstagramDealerVehicleStatusDTO {
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
  instagramPostUrl: string | null;
  selectable: boolean;
}

export interface InstagramPostRequestItemResultDTO {
  vehicleId: number;
  requestId: number | null;
  accepted: boolean;
  reason: string | null;
}

export interface InstagramPostRequestBulkResponseDTO {
  requestedCount: number;
  acceptedCount: number;
  skippedCount: number;
  results: InstagramPostRequestItemResultDTO[];
}

export interface InstagramAdminDealerSummaryDTO {
  dealerId: number;
  dealerBusinessName: string;
  pendingCount: number;
  processingCount: number;
  publishedCount: number;
  failedCount: number;
}

export interface InstagramAdminVehicleRequestDTO {
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

export interface InstagramBatchItemStatusDTO {
  requestId: number;
  vehicleId: number;
  vehicleName: string;
  status: SocialPostPublishStatus;
  retryCount: number;
  errorMessage: string | null;
  instagramPostUrl: string | null;
}

export interface InstagramBatchStatusDTO {
  batchId: number;
  status: SocialPostBatchStatus;
  totalCount: number;
  successCount: number;
  failedCount: number;
  pendingCount: number;
  createdAt: string;
  completedAt: string | null;
  items: InstagramBatchItemStatusDTO[];
}

export interface InstagramBulkApprovePublishResponseDTO {
  batchId: number;
  status: SocialPostBatchStatus;
  totalCount: number;
}

export interface InstagramPostRequestBulkRequestDTO {
  vehicleIds: number[];
}

export interface InstagramRejectRequestDTO {
  requestIds: number[];
  reason: string;
}

export interface InstagramBulkApprovePublishRequestDTO {
  dealerId: number;
  requestIds: number[];
}

export interface InstagramRetryFailedRequestDTO {
  batchId: number;
}
