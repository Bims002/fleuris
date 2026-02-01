import { Navbar } from '@/components/navbar'
import { Metadata } from 'next'
import { ContactForm } from '@/components/forms/contact-form'
import { Mail } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Contactez-nous | Fleuris',
    description: 'Une question sur nos bouquets ou votre commande ? Contactez l’équipe Fleuris. Nous vous répondons sous 24h.',
}

export default function ContactPage() {
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
                            <a href="mailto:support@fleuris.store" className="text-lg text-purple-600 hover:underline">
                                support@fleuris.store
                            </a>
                            <p className="text-sm text-gray-500 mt-3">Nous répondons sous 24h</p>
                        </div>
                    </div>

                    <ContactForm />
                </div>
            </div>
        </main>
    )
}
