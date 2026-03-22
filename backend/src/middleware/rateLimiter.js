import rateLimit from 'express-rate-limit';

/**
 * General rate limiter for all API routes.
 * 100 requests per 15 minutes.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    error: 'Too many requests from this IP, please try again after 15 minutes.',
  },
});

/**
 * Stricter rate limiter for OpenAI-dependent endpoints (search and upload).
 * 5 requests per minute.
 */
export const openaiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 requests per minute for AI features
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json({
      error: 'AI usage limit reached for this minute. Please wait to prevent excessive API credit usage.',
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});
