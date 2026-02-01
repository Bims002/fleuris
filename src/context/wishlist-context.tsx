'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'

interface WishlistContextType {
    wishlist: string[]
    toggleFavorite: (productId: string) => void
    isFavorite: (productId: string) => boolean
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

const WISHLIST_STORAGE_KEY = 'fleuris-wishlist'

export function WishlistProvider({ children }: { children: ReactNode }) {
    const [wishlist, setWishlist] = useState<string[]>([])
    const [isLoaded, setIsLoaded] = useState(false)

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem(WISHLIST_STORAGE_KEY)
        if (saved) {
            try {
                setWishlist(JSON.parse(saved))
            } catch (e) {
                console.error('Error parsing wishlist', e)
            }
        }
        setIsLoaded(true)
    }, [])

    // Save to localStorage when wishlist changes
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist))
        }
    }, [wishlist, isLoaded])

    const toggleFavorite = useCallback((productId: string) => {
        setWishlist((prev) => {
            if (prev.includes(productId)) {
                return prev.filter((id) => id !== productId)
            } else {
                return [...prev, productId]
            }
        })
    }, [])

    const isFavorite = useCallback((productId: string) => {
        return wishlist.includes(productId)
    }, [wishlist])

    return (
        <WishlistContext.Provider value={{ wishlist, toggleFavorite, isFavorite }}>
            {children}
        </WishlistContext.Provider>
    )
}

export function useWishlist() {
    const context = useContext(WishlistContext)
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider')
    }
    return context
}
