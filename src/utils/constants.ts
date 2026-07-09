export type FuelType = "Petrol" | "Diesel" | "CNG" | "LPG" | "Electric" | "Hybrid";
export type Transmission = "Manual" | "Automatic";
export type Ownership = "1" | "2" | "3" | "4";

export const BUDGET_BANDS = [
  { label: "Under ₹1 Lakh", min: 0, max: 100000 },
  { label: "₹1-3 Lakh", min: 100000, max: 300000 },
  { label: "₹3-5 Lakh", min: 300000, max: 500000 },
  { label: "₹5-10 Lakh", min: 500000, max: 1000000 },
  { label: "₹10-15 Lakh", min: 1000000, max: 1500000 },
  { label: "Above ₹15 Lakh", min: 1500000, max: 100000000 },
];

export const QUICK_BRANDS = [
  "Hyundai",
  "Tata",
  "Mahindra",
  "Toyota",
  "Honda",
  "Kia",
  "MG",
  "Ford",
];

export const CITIES = ["Pune", "PCMC"];

export const FUELS: FuelType[] = [
  "Petrol",
  "Diesel",
  "CNG",
  "LPG",
  "Electric",
  "Hybrid",
];

export const TRANSMISSIONS: Transmission[] = ["Manual", "Automatic"];

export const OWNERSHIPS: Ownership[] = ["1", "2", "3", "4"];

export const INSURANCE_STATUSES = [
  { value: "ACTIVE", label: "Active" },
  { value: "EXPIRED", label: "Expired" },
  { value: "RENEWAL_DUE", label: "Renewal Due" },
  { value: "CANCELLED", label: "Cancelled" },
];
