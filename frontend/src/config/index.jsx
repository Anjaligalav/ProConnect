const {default:axios} = require("axios");

// Local development ke liye ye use karo:
export const BASE_URL = "http://localhost:9090";

// Production/Deployed URL (Render):
// export const BASE_URL = "https://proconnectlinkedinclone-zw86.onrender.com";

export const clientServer = axios.create({
    baseURL: BASE_URL
});