import { z } from 'zod'

// Messages d'erreur personnalisés en français
const errorMessages = {
    required: 'Ce champ est requis',
    invalidEmail: 'Adresse email invalide',
    tooShort: (min: number) => `Minimum ${min} caractères requis`,
    tooLong: (max: number) => `Maximum ${max} caractères autorisés`,
    invalidNumber: 'Nombre invalide',
    tooSmall: (min: number) => `La valeur doit être au moins ${min}`,
    tooBig: (max: number) => `La valeur ne peut pas dépasser ${max}`,
    invalidUrl: 'URL invalide',
}

// Configuration Zod avec messages en français
const customErrorMap: z.ZodErrorMap = (issue, ctx) => {
    if (issue.code === z.ZodIssueCode.invalid_type) {
        if (issue.expected === 'string') {
            return { message: 'Texte requis' }
        }
        if (issue.expected === 'number') {
            return { message: 'Nombre requis' }
        }
    }

    if (issue.code === z.ZodIssueCode.too_small) {
        if (issue.type === 'string') {
            return { message: errorMessages.tooShort(issue.minimum as number) }
        }
        if (issue.type === 'number') {
            return { message: errorMessages.tooSmall(issue.minimum as number) }
        }
    }

    if (issue.code === z.ZodIssueCode.too_big) {
        if (issue.type === 'string') {
            return { message: errorMessages.tooLong(issue.maximum as number) }
        }
        if (issue.type === 'number') {
            return { message: errorMessages.tooBig(issue.maximum as number) }
        }
    }

    return { message: ctx.defaultError }
}

z.setErrorMap(customErrorMap)

// Schéma de validation pour les produits avec messages français
export const productSchema = z.object({
    name: z.string()
        .min(3, 'Le nom doit contenir au moins 3 caractères')
        .max(100, 'Le nom ne peut pas dépasser 100 caractères')
        .trim(),

    description: z.string()
        .min(10, 'La description doit contenir au moins 10 caractères')
        .max(500, 'La description ne peut pas dépasser 500 caractères')
        .trim(),

    longDescription: z.string()
        .min(20, 'La description détaillée doit contenir au moins 20 caractères')
        .max(2000, 'La description détaillée ne peut pas dépasser 2000 caractères')
        .trim()
        .optional(),

    price: z.number({
        required_error: 'Le prix est requis',
        invalid_type_error: 'Le prix doit être un nombre',
    })
        .positive('Le prix doit être positif')
        .max(100000, 'Le prix ne peut pas dépasser 100 000€')
        .multipleOf(0.01, 'Le prix doit avoir au maximum 2 décimales'),

    category: z.enum(['anniversaire', 'amour', 'remerciements', 'deuil', 'mariage', 'naissance'], {
        errorMap: () => ({ message: 'Veuillez sélectionner une catégorie valide' })
    }),

    is_available: z.boolean(),

    images: z.array(z.string().url('URL d\'image invalide'))
        .min(1, 'Au moins une image est requise')
        .max(5, 'Maximum 5 images autorisées'),

    rating: z.number()
        .min(0, 'La note doit être entre 0 et 5')
        .max(5, 'La note doit être entre 0 et 5')
        .optional(),

    reviews: z.number()
        .int('Le nombre d\'avis doit être un entier')
        .min(0, 'Le nombre d\'avis ne peut pas être négatif')
        .optional(),
})

export type ProductFormData = z.infer<typeof productSchema>

// Schéma pour la création de produit (formulaire)
export const productFormSchema = z.object({
    name: z.string()
        .min(3, 'Le nom doit contenir au moins 3 caractères')
        .max(100, 'Le nom ne peut pas dépasser 100 caractères')
        .trim(),

    description: z.string()
        .min(10, 'La description doit contenir au moins 10 caractères')
        .max(500, 'La description ne peut pas dépasser 500 caractères')
        .trim(),

    longDescription: z.string()
        .min(20, 'La description détaillée doit contenir au moins 20 caractères')
        .max(2000, 'La description détaillée ne peut pas dépasser 2000 caractères')
        .trim()
        .optional(),

    price: z.string()
        .regex(/^\d+(\.\d{1,2})?$/, 'Format de prix invalide (ex: 29.99)')
        .transform((val) => parseFloat(val)),

    category: z.enum(['anniversaire', 'amour', 'remerciements', 'deuil', 'mariage', 'naissance'], {
        errorMap: () => ({ message: 'Veuillez sélectionner une catégorie' })
    }),

    is_available: z.boolean(),

    images: z.array(z.string().url('URL invalide'))
        .min(1, 'Au moins une image est requise')
        .max(5, 'Maximum 5 images'),

    rating: z.number()
        .min(0, 'Note entre 0 et 5')
        .max(5, 'Note entre 0 et 5')
        .optional(),

    reviews: z.number()
        .int('Nombre entier requis')
        .min(0, 'Ne peut pas être négatif')
        .optional(),
})

// Schéma de validation pour le checkout avec messages français
export const checkoutSchema = z.object({
    email: z.string({
        required_error: 'L\'email est requis',
    })
        .email('Adresse email invalide')
        .max(255, 'Email trop long'),

    name: z.string({
        required_error: 'Le nom est requis',
    })
        .min(2, 'Le nom doit contenir au moins 2 caractères')
        .max(100, 'Le nom ne peut pas dépasser 100 caractères')
        .trim(),

    address: z.string({
        required_error: 'L\'adresse est requise',
    })
        .min(5, 'L\'adresse doit contenir au moins 5 caractères')
        .max(200, 'L\'adresse ne peut pas dépasser 200 caractères')
        .trim(),

    city: z.string({
        required_error: 'La ville est requise',
    })
        .min(2, 'La ville doit contenir au moins 2 caractères')
        .max(100, 'La ville ne peut pas dépasser 100 caractères')
        .trim(),

    postalCode: z.string({
        required_error: 'Le code postal est requis',
    })
        .regex(/^\d{5}$/, 'Code postal invalide (5 chiffres requis)'),

    phone: z.string()
        .regex(/^(\+33|0)[1-9](\d{2}){4}$/, 'Numéro de téléphone invalide (format: 0612345678)')
        .optional()
        .or(z.literal('')),
})

export type CheckoutFormData = z.infer<typeof checkoutSchema>

// Schéma de validation pour le formulaire de contact avec messages français
export const contactSchema = z.object({
    name: z.string({
        required_error: 'Le nom est requis',
    })
        .min(2, 'Le nom doit contenir au moins 2 caractères')
        .max(100, 'Le nom ne peut pas dépasser 100 caractères')
        .trim(),

    email: z.string({
        required_error: 'L\'email est requis',
    })
        .email('Adresse email invalide')
        .max(255, 'Email trop long'),

    subject: z.string({
        required_error: 'Le sujet est requis',
    })
        .min(5, 'Le sujet doit contenir au moins 5 caractères')
        .max(200, 'Le sujet ne peut pas dépasser 200 caractères')
        .trim(),

    message: z.string({
        required_error: 'Le message est requis',
    })
        .min(10, 'Le message doit contenir au moins 10 caractères')
        .max(2000, 'Le message ne peut pas dépasser 2000 caractères')
        .trim(),
})

export type ContactFormData = z.infer<typeof contactSchema>

// Schéma de validation pour la mise à jour du statut de commande
export const orderStatusSchema = z.object({
    orderId: z.string().uuid('ID de commande invalide'),
    status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled'], {
        errorMap: () => ({ message: 'Statut invalide' })
    }),
})

export type OrderStatusData = z.infer<typeof orderStatusSchema>
