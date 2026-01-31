'use client'

import { Navbar } from '@/components/navbar'
import { Mail, Loader2, CheckCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { contactSchema, type ContactFormData } from '@/lib/validations'
import { FormInput, FormTextarea } from '@/components/ui/form-fields'

export default function ContactPage() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, isSubmitSuccessful },
        reset,
    } = useForm<ContactFormData>({
        resolver: zodResolver(contactSchema),
        mode: 'onBlur', // Validation au blur (perte de focus)
    })

    const onSubmit = async (data: ContactFormData) => {
        // Simuler l'envoi (à remplacer par une vraie API)
        await new Promise(resolve => setTimeout(resolve, 1000))

        console.log('Contact form submitted:', data)

        // Réinitialiser le formulaire après succès
        reset()
    }

    return (
        <main className="min-h-screen bg-white">
            <Navbar />
            <div className="pt-32 pb-20 px-6 sm:px-12 lg:px-24">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-5xl font-bold text-gray-900 mb-4 font-serif">Nous Contacter</h1>
                    <p className="text-xl text-gray-500 mb-12">Notre équipe est à votre écoute</p>

                    <div className="max-w-md mx-auto mb-12">
                        <div className="bg-purple-50 p-8 rounded-xl text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 text-white rounded-full mb-4">
                                <Mail size={28} />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Email</h3>
                            <a href="mailto:support@fleuris.com" className="text-lg text-purple-600 hover:underline">
                                support@fleuris.com
                            </a>
                            <p className="text-sm text-gray-500 mt-3">Nous répondons sous 24h</p>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-8 md:p-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Envoyez-nous un message</h2>

                        {isSubmitSuccessful && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                                <div>
                                    <p className="text-sm font-medium text-green-800">Message envoyé avec succès !</p>
                                    <p className="text-xs text-green-700 mt-1">Nous vous répondrons dans les plus brefs délais.</p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <FormInput
                                    label="Nom complet"
                                    type="text"
                                    placeholder="Jean Dupont"
                                    required
                                    disabled={isSubmitting}
                                    error={errors.name}
                                    {...register('name')}
                                />

                                <FormInput
                                    label="Email"
                                    type="email"
                                    placeholder="jean@exemple.com"
                                    required
                                    disabled={isSubmitting}
                                    error={errors.email}
                                    {...register('email')}
                                />
                            </div>

                            <FormInput
                                label="Sujet"
                                type="text"
                                placeholder="Question sur ma commande"
                                required
                                disabled={isSubmitting}
                                error={errors.subject}
                                {...register('subject')}
                            />

                            <FormTextarea
                                label="Message"
                                rows={6}
                                placeholder="Décrivez votre demande..."
                                required
                                disabled={isSubmitting}
                                error={errors.message}
                                {...register('message')}
                            />

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full md:w-auto px-8 py-3 bg-purple-600 text-white rounded-full font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        Envoi en cours...
                                    </>
                                ) : (
                                    'Envoyer le message'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    )
}
