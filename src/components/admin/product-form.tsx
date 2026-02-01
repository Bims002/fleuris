'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, Upload, X, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productFormSchema } from '@/lib/validations'
import { FormInput, FormTextarea, FormSelect, FormCheckbox } from '@/components/ui/form-fields'
import { useState } from 'react'
import { z } from 'zod'

// ProductFormData est maintenant importé de @/lib/validations
import { type ProductFormData } from '@/lib/validations'

type ProductData = {
    id?: string
    name: string
    description: string
    long_description?: string
    longDescription?: string // Support pour les données formatées
    price: number | string // Support pour les deux formats
    category: string
    is_available: boolean
    images: string[]
    rating?: number
    reviews?: number
    stock_quantity?: number
    track_stock?: boolean
    low_stock_threshold?: number
}

const CATEGORIES = [
    { value: 'anniversaire', label: 'Anniversaire' },
    { value: 'amour', label: 'Amour & Romance' },
    { value: 'remerciements', label: 'Remerciements' },
    { value: 'deuil', label: 'Deuil' },
    { value: 'mariage', label: 'Mariage' },
    { value: 'naissance', label: 'Naissance' }
]

export function ProductForm({ initialData }: { initialData?: ProductData }) {
    const router = useRouter()
    const supabase = createClient()
    const isEditMode = !!initialData?.id
    const [uploading, setUploading] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        watch,
        setValue,
    } = useForm<ProductFormData>({
        resolver: zodResolver(productFormSchema) as any,
        mode: 'onBlur', // Validation générale au blur
        defaultValues: {
            name: initialData?.name || '',
            description: initialData?.description || '',
            longDescription: initialData?.longDescription || initialData?.long_description || '',
            price: initialData?.price?.toString() || '',
            category: (initialData?.category as any) || 'anniversaire',
            is_available: initialData?.is_available ?? true,
            images: initialData?.images || [],
            rating: initialData?.rating || 4.8,
            reviews: initialData?.reviews || 0,
            track_stock: initialData?.track_stock ?? true,
            stock_quantity: initialData?.stock_quantity ?? 0,
            low_stock_threshold: initialData?.low_stock_threshold ?? 5,
        }
    })

    const trackStock = watch('track_stock')

    const images = watch('images')

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return

        setUploading(true)
        const file = e.target.files[0]

        // Valider le fichier image
        const { validateImageFile, validateImageDimensions } = await import('@/lib/image-validation')

        const fileValidation = validateImageFile(file)
        if (!fileValidation.valid) {
            alert(fileValidation.error)
            setUploading(false)
            return
        }

        const dimensionsValidation = await validateImageDimensions(file)
        if (!dimensionsValidation.valid) {
            alert(dimensionsValidation.error)
            setUploading(false)
            return
        }

        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('products')
            .upload(filePath, file)

        if (uploadError) {
            console.error(uploadError)
            alert('Erreur upload image')
        } else {
            const { data } = supabase.storage.from('products').getPublicUrl(filePath)
            setValue('images', [...images, data.publicUrl])
        }
        setUploading(false)
    }

    const removeImage = (indexToRemove: number) => {
        setValue('images', images.filter((_, i) => i !== indexToRemove))
    }

    const onSubmit: SubmitHandler<ProductFormData> = async (data) => {
        try {
            const payload = {
                name: data.name,
                description: data.description,
                long_description: data.longDescription || data.description,
                price: Math.round(parseFloat(data.price) * 100),
                category: data.category,
                is_available: data.is_available,
                images: data.images,
                rating: data.rating || 4.8,
                reviews: data.reviews || 0,
                stock_quantity: data.stock_quantity,
                track_stock: data.track_stock,
                low_stock_threshold: data.low_stock_threshold,
            }

            let dbError
            if (isEditMode && initialData?.id) {
                const { error: updateError } = await supabase
                    .from('products')
                    .update(payload)
                    .eq('id', initialData.id)
                dbError = updateError
            } else {
                const { error: insertError } = await supabase
                    .from('products')
                    .insert([payload])
                dbError = insertError
            }

            if (dbError) {
                console.error(dbError)
                alert('Erreur lors de la sauvegarde : ' + dbError.message)
            } else {
                router.push('/admin/products')
                router.refresh()
            }
        } catch (error: any) {
            alert('Erreur : ' + error.message)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/admin/products" className="p-2 hover:bg-white rounded-full transition-colors text-gray-500 shadow-sm border border-gray-200">
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 font-serif">
                            {isEditMode ? 'Modifier le Produit' : 'Nouveau Produit'}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {isEditMode ? 'Mettez à jour les informations du produit' : 'Créez un nouveau produit pour votre catalogue'}
                        </p>
                    </div>
                </div>

                {/* Informations de base */}
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200 space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <span className="text-purple-600 font-semibold">1</span>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">Informations de base</h2>
                    </div>

                    <FormInput
                        label="Nom du produit"
                        type="text"
                        placeholder="Bouquet de roses rouges"
                        required
                        disabled={isSubmitting}
                        error={errors.name}
                        {...register('name')}
                    />

                    <FormTextarea
                        label="Description courte"
                        rows={3}
                        placeholder="Description affichée dans les listes de produits..."
                        required
                        disabled={isSubmitting}
                        error={errors.description}
                        {...register('description')}
                    />

                    <FormTextarea
                        label="Description détaillée"
                        rows={5}
                        placeholder="Description complète affichée sur la page produit..."
                        disabled={isSubmitting}
                        error={errors.longDescription}
                        {...register('longDescription')}
                    />

                    <div className="grid md:grid-cols-2 gap-6">
                        <FormInput
                            label="Prix (€)"
                            type="text"
                            placeholder="29.99"
                            required
                            disabled={isSubmitting}
                            error={errors.price}
                            {...register('price', {
                                onChange: (e) => {
                                    // Validation onChange pour le prix
                                    const value = e.target.value
                                    if (value && !/^\d*\.?\d{0,2}$/.test(value)) {
                                        e.target.value = value.slice(0, -1)
                                    }
                                }
                            })}
                        />

                        <FormSelect
                            label="Catégorie"
                            required
                            disabled={isSubmitting}
                            error={errors.category}
                            options={CATEGORIES}
                            {...register('category')}
                        />
                    </div>

                    <FormCheckbox
                        label="Produit disponible"
                        description="Le produit sera visible et achetable sur le site"
                        disabled={isSubmitting}
                        {...register('is_available')}
                    />
                </div>

                {/* Gestion du Stock */}
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200 space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <span className="text-purple-600 font-semibold">3</span>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">Gestion du Stock</h2>
                    </div>

                    <FormCheckbox
                        label="Suivre le stock de ce produit"
                        description="Si activé, le produit sera marqué comme indisponible si la quantité atteint 0"
                        disabled={isSubmitting}
                        {...register('track_stock')}
                    />

                    {trackStock && (
                        <div className="grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
                            <FormInput
                                label="Quantité en stock"
                                type="number"
                                min="0"
                                required
                                disabled={isSubmitting}
                                error={errors.stock_quantity}
                                {...register('stock_quantity', { valueAsNumber: true })}
                            />

                            <FormInput
                                label="Seuil de stock faible"
                                type="number"
                                min="0"
                                required
                                disabled={isSubmitting}
                                error={errors.low_stock_threshold}
                                {...register('low_stock_threshold', { valueAsNumber: true })}
                            />
                        </div>
                    )}
                </div>

                {/* Images */}
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200 space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <span className="text-purple-600 font-semibold">4</span>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">Images du produit</h2>
                    </div>

                    {errors.images && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                            <span className="text-red-500">⚠</span>
                            {errors.images.message}
                        </p>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {images.map((url, index) => (
                            <div key={index} className="relative group aspect-square">
                                <Image
                                    src={url}
                                    alt={`Product ${index + 1}`}
                                    fill
                                    className="object-cover rounded-lg border-2 border-gray-200"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ))}

                        {images.length < 5 && (
                            <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-colors">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={uploading || isSubmitting}
                                    className="hidden"
                                />
                                {uploading ? (
                                    <Loader2 className="animate-spin text-purple-600" size={32} />
                                ) : (
                                    <>
                                        <Upload className="text-gray-400 mb-2" size={32} />
                                        <span className="text-sm text-gray-500">Ajouter</span>
                                    </>
                                )}
                            </label>
                        )}
                    </div>
                    <p className="text-sm text-gray-500">
                        Maximum 5 images • JPG, PNG ou WebP • Max 5MB • Max 2000x2000px
                    </p>
                </div>

                {/* Métadonnées */}
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200 space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <span className="text-purple-600 font-semibold">5</span>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">Métadonnées (optionnel)</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <FormInput
                            label="Note moyenne"
                            type="number"
                            step="0.1"
                            min="0"
                            max="5"
                            placeholder="4.8"
                            disabled={isSubmitting}
                            error={errors.rating}
                            {...register('rating', { valueAsNumber: true })}
                        />

                        <FormInput
                            label="Nombre d'avis"
                            type="number"
                            min="0"
                            placeholder="0"
                            disabled={isSubmitting}
                            error={errors.reviews}
                            {...register('reviews', { valueAsNumber: true })}
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-4 pb-8">
                    <Link
                        href="/admin/products"
                        className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Annuler
                    </Link>
                    <button
                        type="submit"
                        disabled={isSubmitting || uploading}
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Enregistrement...
                            </>
                        ) : (
                            isEditMode ? 'Mettre à jour' : 'Créer le produit'
                        )}
                    </button>
                </div>
            </div>
        </form>
    )
}
