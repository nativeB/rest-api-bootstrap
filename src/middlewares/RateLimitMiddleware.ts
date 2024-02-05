// middleware/RateLimiterMiddleware.ts
import {
  Middleware,
  ExpressMiddlewareInterface,
  HttpError,
  BadRequestError,
} from "routing-controllers";
import { Service } from "typedi";

// In-memory storage for request counts per IP address
const requestCounts: Record<string, { timestamp: number; count: number }> = {};

@Middleware({ type: "before" })
@Service()
export class RateLimiterMiddleware implements ExpressMiddlewareInterface {
  private readonly maxRequestsPerMinute: number = 100;
  private readonly minuteInMillis: number = 60000;

  use(request: any, response: any, next: (err?: any) => any): void {
    const clientIP: string = request.ip;

    // Initialize request count for the IP if not present
    if (!requestCounts[clientIP]) {
      requestCounts[clientIP] = { timestamp: 0, count: 0 };
    }

    const currentTimestamp: number = Date.now();
    const { timestamp, count } = requestCounts[clientIP];

    // Calculate the time difference in milliseconds
    const timeDifference: number = currentTimestamp - timestamp;

    // Reset request count if more than a minute has passed
    if (timeDifference > this.minuteInMillis) {
      requestCounts[clientIP] = { timestamp: currentTimestamp, count: 1 };
    } else {
      // Check if the request limit is exceeded
      if (count >= this.maxRequestsPerMinute) {
        return next("Rate limit exceeded");
      }

      // Increment the request count
      requestCounts[clientIP].count += 1;
    }

    // Continue to the next middleware or route handler
    next();
  }
}
