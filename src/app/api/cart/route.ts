import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Récupérer ou créer le panier
    let { data: cart } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', user.id)
        .single()

    if (!cart) {
        const { data: newCart, error: createError } = await supabase
            .from('carts')
            .insert({ user_id: user.id })
            .select('id')
            .single()

        if (createError) {
            return NextResponse.json({ error: 'Erreur création panier' }, { status: 500 })
        }
        cart = newCart
    }

    // Récupérer les items avec les détails produits
    const { data: items, error: itemsError } = await supabase
        .from('cart_items')
        .select(`
            id,
            product_id,
            quantity,
            selected_size,
            products (
                id,
                name,
                price,
                images,
                description,
                category
            )
        `)
        .eq('cart_id', cart.id)

    if (itemsError) {
        return NextResponse.json({ error: 'Erreur récupération items' }, { status: 500 })
    }

    return NextResponse.json({ items: items || [] })
}

export async function POST(req: NextRequest) {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await req.json()
    const { items } = body

    if (!Array.isArray(items)) {
        return NextResponse.json({ error: 'Format invalide' }, { status: 400 })
    }

    // Récupérer ou créer le panier
    let { data: cart } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', user.id)
        .single()

    if (!cart) {
        const { data: newCart, error: createError } = await supabase
            .from('carts')
            .insert({ user_id: user.id })
            .select('id')
            .single()

        if (createError) {
            return NextResponse.json({ error: 'Erreur création panier' }, { status: 500 })
        }
        cart = newCart
    }

    // Supprimer les items existants
    await supabase
        .from('cart_items')
        .delete()
        .eq('cart_id', cart.id)

    // Insérer les nouveaux items
    if (items.length > 0) {
        const cartItems = items.map((item: any) => ({
            cart_id: cart.id,
            product_id: item.product.id,
            quantity: item.quantity,
            selected_size: item.selectedSize
        }))

        const { error: insertError } = await supabase
            .from('cart_items')
            .insert(cartItems)

        if (insertError) {
            return NextResponse.json({ error: 'Erreur sauvegarde items' }, { status: 500 })
        }
    }

    return NextResponse.json({ success: true })
}

export async function DELETE() {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Supprimer le panier (cascade supprimera les items)
    const { error } = await supabase
        .from('carts')
        .delete()
        .eq('user_id', user.id)

    if (error) {
        return NextResponse.json({ error: 'Erreur suppression panier' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
