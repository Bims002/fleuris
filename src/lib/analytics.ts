'use client'

declare global {
    interface Window {
        gtag?: (...args: any[]) => void
    }
}

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

// Envoyer un événement générique
export const trackEvent = (
    eventName: string,
    params?: Record<string, any>
) => {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', eventName, params)
    }
}

// Tracker une page vue
export const trackPageView = (url: string) => {
    if (typeof window !== 'undefined' && window.gtag && GA_MEASUREMENT_ID) {
        window.gtag('config', GA_MEASUREMENT_ID, {
            page_path: url
        })
    }
}

// E-commerce: Vue produit
export const trackProductView = (product: {
    id: string
    name: string
    price: number
    category?: string
}) => {
    trackEvent('view_item', {
        currency: 'EUR',
        value: product.price / 100,
        items: [{
            item_id: product.id,
            item_name: product.name,
            price: product.price / 100,
            item_category: product.category || 'Bouquets'
        }]
    })
}

// E-commerce: Ajout au panier
export const trackAddToCart = (
    product: {
        id: string
        name: string
        price: number
        category?: string
    },
    quantity: number,
    size: string
) => {
    const sizePrice = size === 'classic' ? 1 : size === 'generous' ? 1.4 : 1.8
    const finalPrice = (product.price / 100) * sizePrice

    trackEvent('add_to_cart', {
        currency: 'EUR',
        value: finalPrice * quantity,
        items: [{
            item_id: product.id,
            item_name: product.name,
            price: finalPrice,
            quantity,
            item_variant: size,
            item_category: product.category || 'Bouquets'
        }]
    })
}

// E-commerce: Retrait du panier
export const trackRemoveFromCart = (
    product: {
        id: string
        name: string
    },
    quantity: number,
    price: number
) => {
    trackEvent('remove_from_cart', {
        currency: 'EUR',
        value: price * quantity,
        items: [{
            item_id: product.id,
            item_name: product.name,
            price,
            quantity
        }]
    })
}

// E-commerce: Début du checkout
export const trackBeginCheckout = (
    items: Array<{
        product: { id: string; name: string }
        quantity: number
        price: number
    }>,
    total: number
) => {
    trackEvent('begin_checkout', {
        currency: 'EUR',
        value: total,
        items: items.map(item => ({
            item_id: item.product.id,
            item_name: item.product.name,
            price: item.price,
            quantity: item.quantity
        }))
    })
}

// E-commerce: Achat complété
export const trackPurchase = (
    orderId: string,
    total: number,
    items: Array<{
        product_id?: string
        id?: string
        name: string
        price: number
        quantity: number
    }>
) => {
    trackEvent('purchase', {
        transaction_id: orderId,
        value: total,
        currency: 'EUR',
        shipping: 0,
        tax: 0,
        items: items.map(item => ({
            item_id: item.product_id || item.id,
            item_name: item.name,
            price: item.price,
            quantity: item.quantity
        }))
    })
}

// Recherche
export const trackSearch = (searchTerm: string) => {
    trackEvent('search', {
        search_term: searchTerm
    })
}

// Inscription newsletter
export const trackNewsletterSignup = () => {
    trackEvent('newsletter_signup', {
        method: 'footer_form'
    })
}

// Clic sur bouton
export const trackButtonClick = (buttonName: string, location: string) => {
    trackEvent('button_click', {
        button_name: buttonName,
        location
    })
}
