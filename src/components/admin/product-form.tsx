'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, Upload, X, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

type ProductData = {
    id?: string
    name: string
    description: string
    price: string // Handling as string for input, converting to number for DB
    category: string
    is_available: boolean
    images: string[]
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

    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [formData, setFormData] = useState<ProductData>({
        name: '',
        description: '',
        price: '',
        category: 'anniversaire',
        is_available: true,
        images: [],
        ...initialData
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleToggle = () => {
        setFormData(prev => ({ ...prev, is_available: !prev.is_available }))
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return

        setUploading(true)
        const file = e.target.files[0]
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
            // Get Public URL
            const { data } = supabase.storage.from('products').getPublicUrl(filePath)

            setFormData(prev => ({
                ...prev,
                images: [...prev.images, data.publicUrl]
            }))
        }
        setUploading(false)
    }

    const removeImage = (indexToRemove: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== indexToRemove)
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const payload = {
            name: formData.name,
            description: formData.description,
            price: Math.round(parseFloat(formData.price) * 100), // Convert Euros to Cents for DB
            category: formData.category,
            is_available: formData.is_available,
            images: formData.images,
            // Add slug if needed
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
        setLoading(false)
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/products" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 font-serif">
                        {isEditMode ? 'Modifier le Produit' : 'Nouveau Produit'}
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 font-medium"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-black font-medium flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading && <Loader2 className="animate-spin" size={18} />}
                        Enregistrer
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                        <h2 className="font-semibold text-gray-900">Informations Générales</h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du produit</label>
                            <input
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Ex: Bouquet Printanier"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                name="description"
                                rows={4}
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Description détaillée..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                        <h2 className="font-semibold text-gray-900">Médias</h2>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {formData.images.map((url, idx) => (
                                <div key={idx} className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden border border-gray-200 group">
                                    <Image src={url} alt={`Produit ${idx + 1}`} fill className="object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(idx)}
                                        className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}

                            {/* Upload Button */}
                            <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-colors text-gray-400 hover:text-purple-600">
                                {uploading ? (
                                    <Loader2 className="animate-spin" size={24} />
                                ) : (
                                    <>
                                        <Upload size={24} />
                                        <span className="text-xs mt-2 font-medium">Ajouter</span>
                                    </>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                    disabled={uploading}
                                />
                            </label>
                        </div>
                    </div>
                </div>

                {/* Right Column: Details & Settings */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                        <h2 className="font-semibold text-gray-900">Détails de Vente</h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Prix (€)</label>
                            <input
                                name="price"
                                type="number"
                                step="0.01"
                                required
                                value={formData.price}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                            >
                                {CATEGORIES.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                        <h2 className="font-semibold text-gray-900">Paramètres</h2>

                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">En vente</span>
                            <button
                                type="button"
                                onClick={handleToggle}
                                className={`w-11 h-6 flex items-center rounded-full transition-colors ${formData.is_available ? 'bg-green-500' : 'bg-gray-300'}`}
                            >
                                <span className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${formData.is_available ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    )
}
