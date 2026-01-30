export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    updated_at: string | null
                    full_name: string | null
                    avatar_url: string | null
                    role: 'customer' | 'admin' | 'partner'
                    phone: string | null
                }
                Insert: {
                    id: string
                    updated_at?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    role?: 'customer' | 'admin' | 'partner'
                    phone?: string | null
                }
                Update: {
                    id?: string
                    updated_at?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    role?: 'customer' | 'admin' | 'partner'
                    phone?: string | null
                }
            }
            products: {
                Row: {
                    id: string
                    created_at: string
                    name: string
                    description: string | null
                    price: number
                    images: string[] | null
                    category: string | null
                    is_available: boolean
                    slug: string | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    name: string
                    description?: string | null
                    price: number
                    images?: string[] | null
                    category?: string | null
                    is_available?: boolean
                    slug?: string | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    name?: string
                    description?: string | null
                    price?: number
                    images?: string[] | null
                    category?: string | null
                    is_available?: boolean
                    slug?: string | null
                }
            }
            orders: {
                Row: {
                    id: string
                    created_at: string
                    user_id: string | null
                    status: 'pending' | 'paid' | 'preparing' | 'shipped' | 'delivered' | 'cancelled'
                    total_amount: number
                    recipient_name: string
                    recipient_address: string
                    recipient_phone: string | null
                    message_card: string | null
                    delivery_date: string
                    delivery_instructions: string | null
                    partner_id: string | null
                    stripe_payment_id: string | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    user_id?: string | null
                    status?: 'pending' | 'paid' | 'preparing' | 'shipped' | 'delivered' | 'cancelled'
                    total_amount: number
                    recipient_name: string
                    recipient_address: string
                    recipient_phone?: string | null
                    message_card?: string | null
                    delivery_date: string
                    delivery_instructions?: string | null
                    partner_id?: string | null
                    stripe_payment_id?: string | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    user_id?: string | null
                    status?: 'pending' | 'paid' | 'preparing' | 'shipped' | 'delivered' | 'cancelled'
                    total_amount?: number
                    recipient_name?: string
                    recipient_address?: string
                    recipient_phone?: string | null
                    message_card?: string | null
                    delivery_date?: string
                    delivery_instructions?: string | null
                    partner_id?: string | null
                    stripe_payment_id?: string | null
                }
            }
        }
    }
}
