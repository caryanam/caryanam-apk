export const ENV = {
  API_BASE_URL: "https://c1.caryanam.com",
  LOCAL_API_BASE_URL: "https://c1.caryanam.com", // Always point to production server, no localhost
};

export const getApiUrl = (isLocal = false) => {
  return ENV.API_BASE_URL;
};
