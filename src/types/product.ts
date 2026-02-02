export interface ProductOption {
    id: string
    name: string
    price: number // en centimes
}

export interface Product {
    id: string
    name: string
    description: string
    price: number // prix de base ou standard
    imageUrl?: string
    images?: string[]
    category: string
    stock_quantity?: number
    track_stock?: boolean
    low_stock_threshold?: number
    long_description?: string
    rating?: number
    reviews?: number

    // Nouveaux champs pour tarification flexible
    pricing_type?: 'fixed' | 'tiered'
    price_voluminous?: number // en centimes
    options?: ProductOption[]
}

