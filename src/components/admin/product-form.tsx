'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, Upload, X, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productFormSchema } from '@/lib/validations'
import { FormInput, FormTextarea, FormSelect, FormCheckbox } from '@/components/ui/form-fields'
import { useState } from 'react'
import { z } from 'zod'

type ProductFormData = z.infer<typeof productFormSchema>

type ProductData = {
    id?: string
    name: string
    description: string
    long_description?: string
    price: number
    category: string
    is_available: boolean
    images: string[]
    rating?: number
    reviews?: number
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
        resolver: zodResolver(productFormSchema),
        mode: 'onBlur', // Validation générale au blur
        defaultValues: {
            name: initialData?.name || '',
            description: initialData?.description || '',
            longDescription: initialData?.long_description || '',
            price: initialData?.price ? (initialData.price / 100).toString() : '',
            category: (initialData?.category as any) || 'anniversaire',
            is_available: initialData?.is_available ?? true,
            images: initialData?.images || [],
            rating: initialData?.rating || 4.8,
            reviews: initialData?.reviews || 0,
        }
    })

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

    const onSubmit = async (data: ProductFormData) => {
        try {
            const payload = {
                name: data.name,
                description: data.description,
                long_description: data.longDescription || data.description,
                price: Math.round(parseFloat(data.price) * 100), // Convert to cents
                category: data.category,
                is_available: data.is_available,
                images: data.images,
                rating: data.rating || 4.8,
                reviews: data.reviews || 0,
            }

            let error
            if (isEditMode && initialData?.id) {
                const { error: updateError } = await supabase
                    .from('products')
                    .update(payload)
                    .eq('id', initialData.id)
                error = updateError
            } else {
                const { error: insertError } = await supabase
                    .from('products')
                    .insert([payload])
                error = insertError
            }

            if (error) {
                console.error(error)
                alert('Erreur lors de la sauvegarde : ' + error.message)
            } else {
                router.push('/admin/products')
                router.refresh()
            }
        } catch (error: any) {
            alert('Erreur : ' + error.message)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/products" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 font-serif">
                        {isEditMode ? 'Modifier le Produit' : 'Nouveau Produit'}
                    </h1>
                </div>
            </div>

            {/* Informations de base */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Informations de base</h2>

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

            {/* Images */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Images du produit</h2>

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
                                className="object-cover rounded-lg"
                            />
                            <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
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
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">Métadonnées (optionnel)</h2>

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
        </form>
    )
}
