// utils/cookieOptions.js

const isProd = process.env.NODE_ENV === "production";

const cookieOptions = {
    httpOnly: true,              // JS cannot access
    secure: isProd,              // only over HTTPS in production
    sameSite: isProd ? "none" : "lax", // allow cross-origin in prod, relaxed in dev
    maxAge: 24 * 60 * 60 * 1000, // 1 day
};

module.exports = cookieOptions;
