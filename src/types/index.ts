export type FuelType = "Petrol" | "Diesel" | "CNG" | "Electric" | "Hybrid";
export type Transmission = "Manual" | "Automatic";
export type Ownership = "1st Owner" | "2nd Owner" | "3rd Owner";
export type LeadStatus = "New" | "Contacted" | "Converted";
export type DealerStatus = "Pending" | "Approved" | "Suspended" | "Rejected";
export type SubscriptionTier = "Basic" | "Standard" | "Premium";

export interface Vehicle {
  id: number;
  vehicleId: string;
  dealerId: number;
  brand: string;
  model: string;
  variant: string;
  registrationYear: number;
  askingPrice: number;
  kilometerDriven: number;
  fuelType: string;
  transmission: Transmission;
  ownershipDetails: string;
  insuranceStatus: string;
  city: string;
  vehicleDescription: string;
  vehicleStatus: string;
  createdAt: string;
  dealerContactName?: string;
  dealerContactNumber?: string;
  dealerContactEmail?: string;
  dealerWhatsappNumber?: string;
  dealerBusinessName?: string;
  dealerLogo?: string;
  dealerShowroomImage?: string;
  dealerYearsInBusiness?: number;
  vehicleType?: string;
  images?: string[];
  videos?: string[];
  rtoInformation?: string;
  financeAvailability?: boolean;
  executiveMobile?: string | null;
}

export interface Dealer {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  mobile: string;
  whatsapp: string;
  address: string;
  city: string;
  state: string;
  logo: string;
  showroomImage: string;
  verified: boolean;
  status: DealerStatus;
  rating: number;
  totalListings: number;
  joinedAt: string;
  subscription: SubscriptionTier;
}

export interface Lead {
  id: string;
  customerName: string;
  uniqueLeadId: string;
  mobile: string;
  vehicleId: string;
  vehicleTitle: string;
  dealerId: string;
  status: LeadStatus;
  createdAt: string;
  customerCity?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: SubscriptionTier;
  price: number;
  listings: number | "Unlimited";
  featured: boolean;
  highlight?: boolean;
  features: string[];
}

export type AuthRole = "guest" | "dealer" | "admin" | "customer";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: AuthRole;
  dealerId?: string;
}
