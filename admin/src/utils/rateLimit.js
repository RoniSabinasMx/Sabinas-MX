/**
 * Creates a submit-lock to prevent duplicate API calls.
 * Usage:  const lock = useSubmitLock()
 *         if (!lock.acquire()) return
 *         await doWork()
 *         lock.release()
 */
export function useSubmitLock() {
    let busy = false
    return {
        acquire() { if (busy) return false; busy = true; return true },
        release() { busy = false }
    }
}

/**
 * Simple in-memory rate limiter.
 * Allows at most `max` calls within `windowMs` milliseconds.
 */
export function createRateLimiter({ max = 5, windowMs = 10000 } = {}) {
    const timestamps = []
    return function isAllowed() {
        const now = Date.now()
        // Remove entries outside the window
        while (timestamps.length && now - timestamps[0] > windowMs) timestamps.shift()
        if (timestamps.length >= max) return false
        timestamps.push(now)
        return true
    }
}

/**
 * Debounce a function.
 */
export function debounce(fn, delay = 400) {
    let timer
    return (...args) => {
        clearTimeout(timer)
        timer = setTimeout(() => fn(...args), delay)
    }
}
