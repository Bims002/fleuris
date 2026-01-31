'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react'
import { Product } from '@/types/product'
import { createClient } from '@/utils/supabase/client'

export interface CartItem {
    product: Product
    quantity: number
    selectedSize: 'classic' | 'generous' | 'exceptional'
    price: number // Prix unitaire calculé avec la taille
}

interface CartContextType {
    items: CartItem[]
    addItem: (item: CartItem) => void
    removeItem: (itemId: string, size: string) => void
    updateQuantity: (itemId: string, size: string, quantity: number) => void
    clearCart: () => void
    totalValues: { count: number, price: number }
    syncCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const CART_STORAGE_KEY = 'fleuris-cart'

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([])
    const [isLoaded, setIsLoaded] = useState(false)
    const [user, setUser] = useState<any>(null)
    const supabase = createClient()

    // Charger l'utilisateur et le panier au montage
    useEffect(() => {
        async function loadUserAndCart() {
            // Vérifier l'utilisateur
            const { data: { user: currentUser } } = await supabase.auth.getUser()
            setUser(currentUser)

            if (currentUser) {
                // Utilisateur connecté : charger depuis la DB
                await loadCartFromDB()
            } else {
                // Utilisateur non connecté : charger depuis localStorage
                loadCartFromLocalStorage()
            }

            setIsLoaded(true)
        }

        loadUserAndCart()

        // Écouter les changements d'auth
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            const newUser = session?.user || null
            setUser(newUser)

            if (event === 'SIGNED_IN' && newUser) {
                // Synchroniser localStorage → DB lors du login
                await syncLocalStorageToDb()
                await loadCartFromDB()
            } else if (event === 'SIGNED_OUT') {
                // Charger depuis localStorage après logout
                loadCartFromLocalStorage()
            }
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    // Sauvegarder dans localStorage pour utilisateurs non connectés
    useEffect(() => {
        if (isLoaded && !user) {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
        }
    }, [items, isLoaded, user])

    // Sauvegarder dans DB pour utilisateurs connectés (debounced)
    useEffect(() => {
        if (isLoaded && user) {
            const timer = setTimeout(() => {
                saveCartToDb()
            }, 500) // Debounce de 500ms

            return () => clearTimeout(timer)
        }
    }, [items, isLoaded, user])

    function loadCartFromLocalStorage() {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY)
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart))
            } catch (e) {
                console.error('Erreur parsing panier localStorage', e)
                setItems([])
            }
        }
    }

    async function loadCartFromDB() {
        try {
            const response = await fetch('/api/cart')
            if (response.ok) {
                const data = await response.json()

                // Transformer les items de la DB en format CartItem
                const cartItems: CartItem[] = (data.items || []).map((item: any) => ({
                    product: {
                        id: item.products.id,
                        name: item.products.name,
                        price: item.products.price,
                        images: item.products.images,
                        description: item.products.description,
                        category: item.products.category
                    },
                    quantity: item.quantity,
                    selectedSize: item.selected_size,
                    price: calculatePrice(item.products.price / 100, item.selected_size)
                }))

                setItems(cartItems)
            }
        } catch (error) {
            console.error('Erreur chargement panier DB:', error)
        }
    }

    async function saveCartToDb() {
        try {
            await fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items })
            })
        } catch (error) {
            console.error('Erreur sauvegarde panier DB:', error)
        }
    }

    async function syncLocalStorageToDb() {
        const localCart = localStorage.getItem(CART_STORAGE_KEY)
        if (!localCart) return

        try {
            const localItems = JSON.parse(localCart)
            if (localItems.length > 0) {
                // Récupérer le panier DB actuel
                const response = await fetch('/api/cart')
                if (response.ok) {
                    const data = await response.json()
                    const dbItems = data.items || []

                    // Fusionner : garder la quantité max pour chaque produit
                    const merged = [...localItems]

                    dbItems.forEach((dbItem: any) => {
                        const existingIndex = merged.findIndex(
                            (item: CartItem) =>
                                item.product.id === dbItem.products.id &&
                                item.selectedSize === dbItem.selected_size
                        )

                        if (existingIndex > -1) {
                            // Garder la quantité max
                            merged[existingIndex].quantity = Math.max(
                                merged[existingIndex].quantity,
                                dbItem.quantity
                            )
                        } else {
                            // Ajouter l'item de la DB
                            merged.push({
                                product: {
                                    id: dbItem.products.id,
                                    name: dbItem.products.name,
                                    price: dbItem.products.price,
                                    images: dbItem.products.images,
                                    description: dbItem.products.description,
                                    category: dbItem.products.category
                                },
                                quantity: dbItem.quantity,
                                selectedSize: dbItem.selected_size,
                                price: calculatePrice(dbItem.products.price / 100, dbItem.selected_size)
                            })
                        }
                    })

                    // Sauvegarder le panier fusionné
                    await fetch('/api/cart', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ items: merged })
                    })

                    // Vider localStorage après sync
                    localStorage.removeItem(CART_STORAGE_KEY)
                }
            }
        } catch (error) {
            console.error('Erreur synchronisation panier:', error)
        }
    }

    function calculatePrice(basePrice: number, size: 'classic' | 'generous' | 'exceptional'): number {
        const multipliers = {
            classic: 1,
            generous: 1.4,
            exceptional: 1.8
        }
        return basePrice * multipliers[size]
    }

    const addItem = useCallback((newItem: CartItem) => {
        setItems((currentItems) => {
            const existingItemIndex = currentItems.findIndex(
                (i) => i.product.id === newItem.product.id && i.selectedSize === newItem.selectedSize
            )

            if (existingItemIndex > -1) {
                const updatedItems = [...currentItems]
                updatedItems[existingItemIndex].quantity += newItem.quantity
                return updatedItems
            } else {
                return [...currentItems, newItem]
            }
        })
    }, [])

    const removeItem = useCallback((itemId: string, size: string) => {
        setItems((currentItems) =>
            currentItems.filter((i) => !(i.product.id === itemId && i.selectedSize === size))
        )
    }, [])

    const updateQuantity = useCallback((itemId: string, size: string, quantity: number) => {
        setItems((currentItems) => {
            if (quantity < 1) {
                return currentItems.filter((i) => !(i.product.id === itemId && i.selectedSize === size))
            }
            return currentItems.map((i) =>
                (i.product.id === itemId && i.selectedSize === size) ? { ...i, quantity } : i
            )
        })
    }, [])

    const clearCart = useCallback(async () => {
        setItems([])
        if (user) {
            try {
                await fetch('/api/cart', { method: 'DELETE' })
            } catch (error) {
                console.error('Erreur suppression panier DB:', error)
            }
        } else {
            localStorage.removeItem(CART_STORAGE_KEY)
        }
    }, [user])

    const syncCart = useCallback(async () => {
        if (user) {
            await saveCartToDb()
        }
    }, [user, items])

    const totalValues = useMemo(() => items.reduce(
        (acc, item) => ({
            count: acc.count + item.quantity,
            price: acc.price + (item.price * item.quantity),
        }),
        { count: 0, price: 0 }
    ), [items])

    const value = useMemo(() => ({
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalValues,
        syncCart
    }), [items, addItem, removeItem, updateQuantity, clearCart, totalValues, syncCart])

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}
