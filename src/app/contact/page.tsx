import { Navbar } from '@/components/navbar'
import { Metadata } from 'next'
import { Mail } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Contact | Fleuris',
    description: 'Contactez l\'équipe Fleuris pour toute question.',
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
                            <a href="mailto:support@fleuris.com" className="text-lg text-purple-600 hover:underline">
                                support@fleuris.com
                            </a>
                            <p className="text-sm text-gray-500 mt-3">Nous répondons sous 24h</p>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-8 md:p-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Envoyez-nous un message</h2>
                        <form className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                        Nom complet
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="Jean Dupont"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="jean@exemple.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                                    Sujet
                                </label>
                                <input
                                    type="text"
                                    id="subject"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Question sur ma commande"
                                />
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                    Message
                                </label>
                                <textarea
                                    id="message"
                                    rows={6}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Décrivez votre demande..."
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full md:w-auto px-8 py-3 bg-purple-600 text-white rounded-full font-semibold hover:bg-purple-700 transition-colors"
                            >
                                Envoyer le message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    )
}
