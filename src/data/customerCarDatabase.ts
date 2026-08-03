import {
  MASTER_DATABASE,
  PREMIUM_DATABASE,
  NON_PREMIUM_DATABASE,
  getCarBrands,
  getModels,
  getVariants
} from './carDatabase';

export type CarFilterType = "premium" | "non-premium" | "all";

export function getCustomerBrands(filterType: CarFilterType = "all") {
  if (filterType === "premium") return getCarBrands('PREMIUM');
  if (filterType === "non-premium") return getCarBrands('NON_PREMIUM');
  return getCarBrands('MASTER');
}

export function getCustomerModels(brand: string, filterType: CarFilterType = "all") {
  if (filterType === "premium") return getModels(brand, 'PREMIUM');
  if (filterType === "non-premium") return getModels(brand, 'NON_PREMIUM');
  return getModels(brand, 'MASTER');
}

export function getCustomerVariants(brand: string, model: string, filterType: CarFilterType = "all") {
  if (filterType === "premium") return getVariants(brand, model, 'PREMIUM');
  if (filterType === "non-premium") return getVariants(brand, model, 'NON_PREMIUM');
  return getVariants(brand, model, 'MASTER');
}
