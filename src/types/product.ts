export interface Product {
    id: string
    name: string
    description: string
    price: number
    imageUrl?: string
    images?: string[] // Nouveau champ pour le support multi-images
    category: string
    stock_quantity?: number
    track_stock?: boolean
    low_stock_threshold?: number
}

