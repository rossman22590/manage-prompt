export const getAppBaseUrl = () => {
  if (process.env.APP_BASE_URL) return process.env.APP_BASE_URL;

  return process.env.NODE_ENV === "production"
    ? "https://workflows.myapps.ai"
    : "http://localhost:3000";
};
