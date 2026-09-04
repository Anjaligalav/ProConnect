const {default:axios} = require("axios");

// Automatically use the correct URL based on environment
// Development (localhost) -> localhost:9090
// Production (Vercel)    -> Render backend URL
export const BASE_URL =
    process.env.NODE_ENV === "production"
        ? "https://proconnectlinkedinclone-zw86.onrender.com"
        : "http://localhost:9090";

export const clientServer = axios.create({
    baseURL: BASE_URL
});