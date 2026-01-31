import { z } from 'zod'

// Validation des fichiers image
export const imageFileSchema = z.object({
    name: z.string(),
    size: z.number()
        .max(5 * 1024 * 1024, 'L\'image ne doit pas dépasser 5MB'),
    type: z.string()
        .refine(
            (type) => ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(type),
            'Format d\'image non supporté. Utilisez JPG, PNG ou WebP'
        ),
})

export type ImageFile = z.infer<typeof imageFileSchema>

// Fonction helper pour valider un fichier image
export function validateImageFile(file: File): { valid: boolean; error?: string } {
    try {
        imageFileSchema.parse({
            name: file.name,
            size: file.size,
            type: file.type,
        })
        return { valid: true }
    } catch (error: any) {
        if (error.errors && error.errors[0]) {
            return { valid: false, error: error.errors[0].message }
        }
        return { valid: false, error: 'Fichier invalide' }
    }
}

// Validation des dimensions d'image (à utiliser après chargement)
export async function validateImageDimensions(
    file: File,
    maxWidth: number = 2000,
    maxHeight: number = 2000
): Promise<{ valid: boolean; error?: string }> {
    return new Promise((resolve) => {
        const img = new Image()
        const url = URL.createObjectURL(file)

        img.onload = () => {
            URL.revokeObjectURL(url)
            if (img.width > maxWidth || img.height > maxHeight) {
                resolve({
                    valid: false,
                    error: `L'image ne doit pas dépasser ${maxWidth}x${maxHeight}px`
                })
            } else {
                resolve({ valid: true })
            }
        }

        img.onerror = () => {
            URL.revokeObjectURL(url)
            resolve({ valid: false, error: 'Impossible de charger l\'image' })
        }

        img.src = url
    })
}
