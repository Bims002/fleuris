// Simple in-memory rate limiter
// Pour production, utiliser Redis ou Upstash

type RateLimitStore = {
    [key: string]: {
        count: number
        resetTime: number
    }
}

const store: RateLimitStore = {}

// Nettoyer le store toutes les heures
setInterval(() => {
    const now = Date.now()
    Object.keys(store).forEach(key => {
        if (store[key].resetTime < now) {
            delete store[key]
        }
    })
}, 60 * 60 * 1000) // 1 heure

export interface RateLimitConfig {
    interval: number // en millisecondes
    uniqueTokenPerInterval: number // nombre de requêtes autorisées
}

export class RateLimiter {
    private config: RateLimitConfig

    constructor(config: RateLimitConfig) {
        this.config = config
    }

    check(identifier: string): { success: boolean; limit: number; remaining: number; reset: number } {
        const now = Date.now()
        const tokenData = store[identifier]

        if (!tokenData || tokenData.resetTime < now) {
            // Nouvelle fenêtre
            store[identifier] = {
                count: 1,
                resetTime: now + this.config.interval
            }
            return {
                success: true,
                limit: this.config.uniqueTokenPerInterval,
                remaining: this.config.uniqueTokenPerInterval - 1,
                reset: store[identifier].resetTime
            }
        }

        // Vérifier si limite atteinte
        if (tokenData.count >= this.config.uniqueTokenPerInterval) {
            return {
                success: false,
                limit: this.config.uniqueTokenPerInterval,
                remaining: 0,
                reset: tokenData.resetTime
            }
        }

        // Incrémenter le compteur
        tokenData.count++
        return {
            success: true,
            limit: this.config.uniqueTokenPerInterval,
            remaining: this.config.uniqueTokenPerInterval - tokenData.count,
            reset: tokenData.resetTime
        }
    }
}

// Helpers pour extraire l'IP
export function getClientIp(request: Request): string {
    // Essayer différents headers
    const forwarded = request.headers.get('x-forwarded-for')
    if (forwarded) {
        return forwarded.split(',')[0].trim()
    }

    const realIp = request.headers.get('x-real-ip')
    if (realIp) {
        return realIp
    }

    // Fallback
    return 'unknown'
}

// Rate limiters pré-configurés
export const apiRateLimiter = new RateLimiter({
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 30, // 30 requêtes par minute
})

export const authRateLimiter = new RateLimiter({
    interval: 15 * 60 * 1000, // 15 minutes
    uniqueTokenPerInterval: 5, // 5 tentatives de login par 15 min
})

export const uploadRateLimiter = new RateLimiter({
    interval: 60 * 60 * 1000, // 1 heure
    uniqueTokenPerInterval: 10, // 10 uploads par heure
})
