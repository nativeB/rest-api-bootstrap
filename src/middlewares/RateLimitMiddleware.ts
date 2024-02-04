import rateLimit from "express-rate-limit";

export const rateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, //each IP can make 100 requests per windowMs
  message: "Too many requests from this IP, please try again later",
});
