/**
 * Strips HTML tags and dangerous characters from user input.
 * Prevents XSS before data is sent to Supabase.
 */
export function sanitize(value) {
    if (typeof value !== 'string') return value
    return value
        .replace(/<[^>]*>/g, '')           // strip HTML tags
        .replace(/javascript:/gi, '')       // kill JS protocol
        .replace(/on\w+\s*=/gi, '')         // kill event handlers
        .replace(/data:/gi, '')             // kill data URIs
        .trim()
}

/**
 * Sanitizes all string values in an object recursively.
 */
export function sanitizeObject(obj) {
    if (!obj || typeof obj !== 'object') return obj
    const clean = {}
    for (const [key, val] of Object.entries(obj)) {
        clean[key] = typeof val === 'string' ? sanitize(val) : val
    }
    return clean
}
