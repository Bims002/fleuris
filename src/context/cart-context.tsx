'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Product } from '@/types/product'

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
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([])
    const [isLoaded, setIsLoaded] = useState(false)

    // Charger depuis le localStorage au montage
    useEffect(() => {
        const savedCart = localStorage.getItem('fleuris-cart')
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart))
            } catch (e) {
                console.error('Erreur parsing panier', e)
            }
        }
        setIsLoaded(true)
    }, [])

    // Sauvegarder dans le localStorage à chaque changement
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('fleuris-cart', JSON.stringify(items))
        }
    }, [items, isLoaded])

    const addItem = (newItem: CartItem) => {
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
    }

    const removeItem = (itemId: string, size: string) => {
        setItems((currentItems) =>
            currentItems.filter((i) => !(i.product.id === itemId && i.selectedSize === size))
        )
    }

    const updateQuantity = (itemId: string, size: string, quantity: number) => {
        if (quantity < 1) return removeItem(itemId, size)

        setItems((currentItems) =>
            currentItems.map((i) =>
                (i.product.id === itemId && i.selectedSize === size) ? { ...i, quantity } : i
            )
        )
    }

    const clearCart = () => setItems([])

    const totalValues = items.reduce(
        (acc, item) => ({
            count: acc.count + item.quantity,
            price: acc.price + (item.price * item.quantity),
        }),
        { count: 0, price: 0 }
    )

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalValues }}>
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
