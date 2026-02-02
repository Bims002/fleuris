import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'
import { ArrowLeft, Upload, X, Loader2, Plus, Trash2 } from 'lucide-react'
import { productFormSchema, ProductFormData } from '@/lib/validations'
import { FormInput, FormSelect, FormCheckbox, FormTextarea } from '@/components/ui/form-fields'

type ProductData = {
    id?: string
    name: string
    description: string
    long_description?: string
    longDescription?: string
    price: number | string
    category: string
    is_available: boolean
    images: string[]
    rating?: number
    reviews?: number
    stock_quantity?: number
    track_stock?: boolean
    low_stock_threshold?: number
    pricing_type?: 'fixed' | 'tiered'
    price_voluminous?: number | string
    options?: { id: string; name: string; price: number }[]
}

const CATEGORIES = [
    { value: 'anniversaire', label: 'Anniversaire' },
    { value: 'amour', label: 'Amour & Romance' },
    { value: 'remerciements', label: 'Remerciements' },
    { value: 'deuil', label: 'Deuil' },
    { value: 'mariage', label: 'Mariage' },
    { value: 'naissance', label: 'Naissance' }
]

const PRICING_TYPES = [
    { value: 'fixed', label: 'Prix Fixe' },
    { value: 'tiered', label: 'Par Taille (Standard / Volumineux)' }
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
        mode: 'onBlur',
        defaultValues: {
            name: initialData?.name || '',
            description: initialData?.description || '',
            longDescription: initialData?.longDescription || initialData?.long_description || '',
            price: (typeof initialData?.price === 'number' ? (initialData.price / 100).toFixed(2) : initialData?.price) || '',
            category: (initialData?.category as any) || 'anniversaire',
            is_available: initialData?.is_available ?? true,
            images: initialData?.images || [],
            rating: initialData?.rating || 4.8,
            reviews: initialData?.reviews || 0,
            track_stock: initialData?.track_stock ?? true,
            stock_quantity: initialData?.stock_quantity ?? 0,
            low_stock_threshold: initialData?.low_stock_threshold ?? 5,
            pricing_type: initialData?.pricing_type || 'fixed',
            price_voluminous: (typeof initialData?.price_voluminous === 'number' ? (initialData.price_voluminous / 100).toFixed(2) : initialData?.price_voluminous) || '',
            options: initialData?.options || []
        }
    })

    const trackStock = watch('track_stock')
    const images = watch('images')
    const pricingType = watch('pricing_type')
    const options = watch('options') || []

    const addOption = () => {
        const id = Math.random().toString(36).substring(2, 9)
        setValue('options', [...options, { id, name: '', price: 0 }])
    }

    const removeOption = (id: string) => {
        setValue('options', options.filter(opt => opt.id !== id))
    }

    const updateOption = (id: string, field: 'name' | 'price', value: string | number) => {
        setValue('options', options.map(opt =>
            opt.id === id ? { ...opt, [field]: value } : opt
        ))
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        // ... (existing image upload logic)
        if (!e.target.files || e.target.files.length === 0) return
        setUploading(true)
        const file = e.target.files[0]
        const { validateImageFile, validateImageDimensions } = await import('@/lib/image-validation')
        const fileValidation = validateImageFile(file)
        if (!fileValidation.valid) { alert(fileValidation.error); setUploading(false); return; }
        const dimensionsValidation = await validateImageDimensions(file)
        if (!dimensionsValidation.valid) { alert(dimensionsValidation.error); setUploading(false); return; }
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `${fileName}`
        const { error: uploadError } = await supabase.storage.from('products').upload(filePath, file)
        if (uploadError) { console.error(uploadError); alert('Erreur upload image'); }
        else {
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
                pricing_type: data.pricing_type,
                price_voluminous: data.pricing_type === 'tiered' && data.price_voluminous ? Math.round(parseFloat(data.price_voluminous) * 100) : null,
                options: data.options || []
            }

            let dbError
            if (isEditMode && initialData?.id) {
                const { error: updateError } = await supabase.from('products').update(payload).eq('id', initialData.id)
                dbError = updateError
            } else {
                const { error: insertError } = await supabase.from('products').insert([payload])
                dbError = insertError
            }

            if (dbError) { alert('Erreur : ' + dbError.message) }
            else { router.push('/admin/products'); router.refresh(); }
        } catch (error: any) { alert('Erreur : ' + error.message) }
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
                    </div>
                </div>

                {/* 1. Informations de base */}
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200 space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <span className="text-purple-600 font-semibold">1</span>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">Informations de base</h2>
                    </div>

                    <FormInput label="Nom du produit" type="text" required error={errors.name} {...register('name')} />
                    <FormTextarea label="Description courte" rows={2} required error={errors.description} {...register('description')} />
                    <FormTextarea label="Description détaillée" rows={4} error={errors.longDescription} {...register('longDescription')} />

                    <div className="grid md:grid-cols-2 gap-6">
                        <FormSelect label="Catégorie" required options={CATEGORIES} error={errors.category} {...register('category')} />
                        <FormCheckbox label="Disponible" {...register('is_available')} />
                    </div>
                </div>

                {/* 2. Tarification */}
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200 space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">2</span>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">Tarification</h2>
                    </div>

                    <FormSelect label="Type de prix" options={PRICING_TYPES} {...register('pricing_type')} />

                    <div className="grid md:grid-cols-2 gap-6">
                        <FormInput
                            label={pricingType === 'tiered' ? "Prix Standard (€)" : "Prix (€)"}
                            type="text"
                            required
                            error={errors.price}
                            {...register('price')}
                        />

                        {pricingType === 'tiered' && (
                            <FormInput
                                label="Prix Volumineux (€)"
                                type="text"
                                required
                                error={errors.price_voluminous}
                                {...register('price_voluminous')}
                                className="animate-in fade-in slide-in-from-left-2 duration-300"
                            />
                        )}
                    </div>
                </div>

                {/* 3. Options du produit */}
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200 space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-green-600 font-semibold">3</span>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">Options (Vases, Emballages...)</h2>
                    </div>

                    <div className="space-y-4">
                        {options.map((opt, index) => (
                            <div key={opt.id} className="flex gap-4 items-start bg-gray-50 p-4 rounded-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        placeholder="Nom (ex: Vase en verre)"
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none"
                                        value={opt.name}
                                        onChange={(e) => updateOption(opt.id, 'name', e.target.value)}
                                    />
                                </div>
                                <div className="w-32">
                                    <input
                                        type="number"
                                        placeholder="Prix (€)"
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none"
                                        value={opt.price / 100}
                                        onChange={(e) => updateOption(opt.id, 'price', Math.round(parseFloat(e.target.value) * 100))}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeOption(opt.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={addOption}
                            className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50 transition-all flex items-center justify-center gap-2"
                        >
                            <Plus size={20} />
                            Ajouter une option
                        </button>
                    </div>
                </div>

                {/* 4. Gestion du Stock */}
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200 space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                            <span className="text-orange-600 font-semibold">4</span>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">Gestion du Stock</h2>
                    </div>

                    <FormCheckbox label="Suivre le stock" {...register('track_stock')} />

                    {trackStock && (
                        <div className="grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
                            <FormInput label="Quantité" type="number" required {...register('stock_quantity', { valueAsNumber: true })} />
                            <FormInput label="Seuil d'alerte" type="number" required {...register('low_stock_threshold', { valueAsNumber: true })} />
                        </div>
                    )}
                </div>

                {/* 5. Images */}
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200 space-y-6">
                    <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                        <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                            <span className="text-pink-600 font-semibold">5</span>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">Images</h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {images.map((url: string, index: number) => (
                            <div key={index} className="relative aspect-square">
                                <Image src={url} alt="Bouquet" fill className="object-cover rounded-lg border border-gray-200" />
                                <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full"><X size={14} /></button>
                            </div>
                        ))}
                        {images.length < 5 && (
                            <label className="aspect-square border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                {uploading ? <Loader2 className="animate-spin" /> : <Upload className="text-gray-400" />}
                            </label>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-4 pb-12">
                    <button type="submit" disabled={isSubmitting} className="px-8 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all shadow-lg active:scale-95 disabled:opacity-50">
                        {isSubmitting ? 'Enregistrement...' : (isEditMode ? 'Enregistrer les modifications' : 'Créer le produit')}
                    </button>
                </div>
            </div>
        </form>
    )
}
