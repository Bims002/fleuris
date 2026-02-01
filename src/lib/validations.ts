import { z } from 'zod'

// Schéma de validation pour les produits
export const productSchema = z.object({
    name: z.string().min(3, 'Le nom doit contenir au moins 3 caractères').max(100, 'Le nom ne peut pas dépasser 100 caractères'),
    description: z.string().min(10, 'La description doit contenir au moins 10 caractères').max(500, 'La description ne peut pas dépasser 500 caractères'),
    longDescription: z.string().min(20, 'La description détaillée doit contenir au moins 20 caractères').max(2000, 'La description détaillée ne peut pas dépasser 2000 caractères').optional(),
    price: z.number().positive('Le prix doit être positif').max(100000, 'Le prix ne peut pas dépasser 100 000€'),
    category: z.string(),
    is_available: z.boolean(),
    images: z.array(z.string().url()).min(1, 'Au moins une image est requise'),
    rating: z.number().min(0).max(5).optional(),
    reviews: z.number().int().min(0).optional(),
})

export type ProductData = z.infer<typeof productSchema>

// Schéma pour le formulaire de produit
export const productFormSchema = z.object({
    name: z.string().min(3, 'Le nom est requis (min 3 chars)'),
    description: z.string().min(10, 'La description est requise (min 10 chars)'),
    longDescription: z.string().optional(),
    price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Format invalide (ex: 29.99)'),
    category: z.enum(['anniversaire', 'amour', 'remerciements', 'deuil', 'mariage', 'naissance']),
    is_available: z.boolean(),
    track_stock: z.boolean(),
    stock_quantity: z.number().int().min(0, 'Le stock ne peut pas être négatif'),
    low_stock_threshold: z.number().int().min(0),
    images: z.array(z.string()).min(1, 'Au moins une image'),
    rating: z.number().optional(),
    reviews: z.number().optional(),
})

export type ProductFormData = z.infer<typeof productFormSchema>

// Schéma pour le checkout
export const checkoutSchema = z.object({
    email: z.string().email('Email invalide'),
    name: z.string().min(2, 'Nom requis'),
    address: z.string().min(5, 'Adresse requise'),
    city: z.string().min(2, 'Ville requise'),
    postalCode: z.string().regex(/^\d{5}$/, 'Code postal à 5 chiffres'),
    phone: z.string().optional().or(z.literal('')),
    website_url: z.string().optional(),
})

export type CheckoutFormData = z.infer<typeof checkoutSchema>

// Schéma pour le formulaire de contact
export const contactSchema = z.object({
    name: z.string().min(2, 'Nom requis'),
    email: z.string().email('Email invalide'),
    subject: z.string().min(5, 'Sujet requis'),
    message: z.string().min(10, 'Message requis'),
    website_url: z.string().optional(),
})

export type ContactFormData = z.infer<typeof contactSchema>

// Schéma pour le statut de commande
export const orderStatusSchema = z.object({
    orderId: z.string().uuid(),
    status: z.enum(['pending', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled']),
})

export type OrderStatusData = z.infer<typeof orderStatusSchema>
