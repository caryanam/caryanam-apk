import { useQuery } from "@tanstack/react-query";
import apiClient from "../../lib/apiClient";

export interface MonthlyDealerRegistration {
  month: string;
  dealer: number;
}

export interface MonthlyLead {
  month: string;
  leads: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export interface DealerCountResponse {
  totalDealers: number;
}
export interface VehicleCountResponse {
  totalVehicles: number;
}
export interface PendingCountResponse {
  totalPendingDealers: number;
}
export interface LeadCountResponse {
  totalCustomerLeads: number;
}
export interface TotalRevenueResponse {
  totalRevenue: number;
}

const fetchMonthlyDealerRegistrations = async (): Promise<
  MonthlyDealerRegistration[]
> => {
  const { data } = await apiClient.get<MonthlyDealerRegistration[]>(
    "/api/admin/monthly-dealer-registrations"
  );
  return data;
};

const fetchMonthlyLeads = async (): Promise<MonthlyLead[]> => {
  const { data } = await apiClient.get<MonthlyLead[]>("/api/admin/monthly-leads");
  return data;
};

const fetchMonthlyRevenue = async (): Promise<MonthlyRevenue[]> => {
  const { data } = await apiClient.get<MonthlyRevenue[]>("/api/admin/monthly-revenue");
  return data;
};

const fetchDealerCount = async () =>
  (await apiClient.get<DealerCountResponse>("/api/admin/dealer/count")).data;
const fetchVehicleCount = async () =>
  (await apiClient.get<VehicleCountResponse>("/api/admin/vehicle/count")).data;
const fetchPendingCount = async () =>
  (await apiClient.get<PendingCountResponse>("/api/admin/pending/count")).data;
const fetchLeadCount = async () =>
  (await apiClient.get<LeadCountResponse>("/api/admin/customer-lead/count")).data;
const fetchTotalRevenue = async () =>
  (await apiClient.get<TotalRevenueResponse>("/api/admin/total-revenue/count")).data;

export function useMonthlyDealerRegistrations() {
  return useQuery({
    queryKey: ["admin-monthly-dealer-registrations"],
    queryFn: fetchMonthlyDealerRegistrations,
    staleTime: 5 * 60 * 1000,
  });
}

export function useMonthlyLeads() {
  return useQuery({
    queryKey: ["admin-monthly-leads"],
    queryFn: fetchMonthlyLeads,
    staleTime: 5 * 60 * 1000,
  });
}

export function useMonthlyRevenue() {
  return useQuery({
    queryKey: ["admin-monthly-revenue"],
    queryFn: fetchMonthlyRevenue,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdminDealerCount() {
  return useQuery({
    queryKey: ["admin-count-dealers"],
    queryFn: fetchDealerCount,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdminVehicleCount() {
  return useQuery({
    queryKey: ["admin-count-vehicles"],
    queryFn: fetchVehicleCount,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdminPendingCount() {
  return useQuery({
    queryKey: ["admin-count-pending"],
    queryFn: fetchPendingCount,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdminLeadCount() {
  return useQuery({
    queryKey: ["admin-count-leads"],
    queryFn: fetchLeadCount,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdminTotalRevenue() {
  return useQuery({
    queryKey: ["admin-total-revenue"],
    queryFn: fetchTotalRevenue,
    staleTime: 5 * 60 * 1000,
  });
}
