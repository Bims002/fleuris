// Utilitaires pour la gestion de stock
import { createClient } from '@/utils/supabase/client'

export type StockMovementType = 'sale' | 'restock' | 'adjustment' | 'reservation' | 'release'

export interface StockCheckResult {
    available: boolean
    currentStock: number
    requestedQuantity: number
}

/**
 * Vérifier la disponibilité du stock pour un produit
 */
export async function checkStockAvailability(
    productId: string,
    quantity: number
): Promise<StockCheckResult> {
    const supabase = createClient()

    const { data: product, error } = await supabase
        .from('products')
        .select('stock_quantity, track_stock')
        .eq('id', productId)
        .single()

    if (error || !product) {
        throw new Error('Produit introuvable')
    }

    // Si le suivi de stock est désactivé, toujours disponible
    if (!product.track_stock) {
        return {
            available: true,
            currentStock: Infinity,
            requestedQuantity: quantity
        }
    }

    return {
        available: product.stock_quantity >= quantity,
        currentStock: product.stock_quantity,
        requestedQuantity: quantity
    }
}

/**
 * Vérifier le stock pour plusieurs produits (panier)
 */
export async function checkMultipleStockAvailability(
    items: Array<{ productId: string; quantity: number }>
): Promise<{ available: boolean; unavailableItems: string[] }> {
    const supabase = createClient()

    const productIds = items.map(item => item.productId)

    const { data: products, error } = await supabase
        .from('products')
        .select('id, stock_quantity, track_stock, name')
        .in('id', productIds)

    if (error || !products) {
        throw new Error('Erreur lors de la vérification du stock')
    }

    const unavailableItems: string[] = []

    for (const item of items) {
        const product = products.find(p => p.id === item.productId)

        if (!product) {
            unavailableItems.push(item.productId)
            continue
        }

        // Vérifier uniquement si le suivi est activé
        if (product.track_stock && product.stock_quantity < item.quantity) {
            unavailableItems.push(product.name)
        }
    }

    return {
        available: unavailableItems.length === 0,
        unavailableItems
    }
}

/**
 * Déduire le stock après un paiement confirmé
 * Utilise la fonction SQL pour garantir l'atomicité
 */
export async function deductStock(
    productId: string,
    quantity: number,
    orderId: string
): Promise<void> {
    const supabase = createClient()

    const { error } = await supabase.rpc('deduct_stock', {
        p_product_id: productId,
        p_quantity: quantity,
        p_order_id: orderId
    })

    if (error) {
        console.error('Erreur lors de la déduction du stock:', error)
        throw new Error(`Impossible de déduire le stock: ${error.message}`)
    }
}

/**
 * Ajouter du stock (réapprovisionnement admin)
 */
export async function addStock(
    productId: string,
    quantity: number,
    notes?: string
): Promise<void> {
    const supabase = createClient()

    const { error } = await supabase.rpc('add_stock', {
        p_product_id: productId,
        p_quantity: quantity,
        p_notes: notes || null
    })

    if (error) {
        console.error('Erreur lors de l\'ajout du stock:', error)
        throw new Error(`Impossible d'ajouter le stock: ${error.message}`)
    }
}

/**
 * Obtenir les produits avec stock faible
 */
export async function getLowStockProducts() {
    const supabase = createClient()

    // Récupérer tous les produits avec suivi de stock activé
    const { data, error } = await supabase
        .from('products')
        .select('id, name, stock_quantity, low_stock_threshold, track_stock')
        .eq('track_stock', true)
        .order('stock_quantity', { ascending: true })

    if (error) {
        console.error('Erreur lors de la récupération des produits en stock faible:', error)
        return []
    }

    // Filtrer côté client les produits avec stock <= threshold
    const lowStock = (data || []).filter(
        product => product.stock_quantity <= product.low_stock_threshold
    )

    return lowStock
}

/**
 * Obtenir l'historique des mouvements de stock pour un produit
 */
export async function getStockMovements(productId: string, limit = 50) {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('stock_movements')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false })
        .limit(limit)

    if (error) {
        console.error('Erreur lors de la récupération de l\'historique:', error)
        return []
    }

    return data || []
}

/**
 * Formater le type de mouvement pour l'affichage
 */
export function formatMovementType(type: StockMovementType): string {
    const labels: Record<StockMovementType, string> = {
        sale: 'Vente',
        restock: 'Réapprovisionnement',
        adjustment: 'Ajustement',
        reservation: 'Réservation',
        release: 'Libération'
    }
    return labels[type] || type
}

/**
 * Obtenir le badge de statut de stock
 */
export function getStockStatus(
    stockQuantity: number,
    lowStockThreshold: number,
    trackStock: boolean
): { label: string; color: string; available: boolean } {
    if (!trackStock) {
        return {
            label: 'Toujours disponible',
            color: 'green',
            available: true
        }
    }

    if (stockQuantity === 0) {
        return {
            label: 'Rupture de stock',
            color: 'red',
            available: false
        }
    }

    if (stockQuantity <= lowStockThreshold) {
        return {
            label: `Stock limité (${stockQuantity})`,
            color: 'orange',
            available: true
        }
    }

    return {
        label: 'En stock',
        color: 'green',
        available: true
    }
}
