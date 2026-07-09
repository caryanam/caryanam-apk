export const formatINR = (n?: number) => {
  if (n === undefined || n === null) return "₹0";
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
};

export const formatKM = (n?: number) => {
  if (n === undefined || n === null) return "0 km";
  return `${n.toLocaleString("en-IN")} km`;
};

export const formatDate = (iso: string) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
