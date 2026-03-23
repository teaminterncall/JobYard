interface RateLimitOptions {
    limit: number
    windowMs: number
}

interface RateLimitTracker {
    count: number
    resetTime: number
}

const rateLimiters = new Map<string, RateLimitTracker>()

export function rateLimit(ip: string, action: string, options: RateLimitOptions) {
    const key = `${ip}:${action}`
    const now = Date.now()
    
    // Clean up old entries passively (not strictly necessary for small apps but good practice)
    if (Math.random() < 0.05) {
        for (const [k, v] of rateLimiters.entries()) {
            if (v.resetTime < now) rateLimiters.delete(k)
        }
    }

    let tracker = rateLimiters.get(key)

    if (!tracker || tracker.resetTime < now) {
        tracker = { count: 0, resetTime: now + options.windowMs }
    }

    tracker.count++
    rateLimiters.set(key, tracker)

    return {
        success: tracker.count <= options.limit,
        limit: options.limit,
        remaining: Math.max(0, options.limit - tracker.count),
        resetTime: tracker.resetTime
    }
}
