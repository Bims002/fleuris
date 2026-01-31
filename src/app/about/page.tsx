import { Navbar } from '@/components/navbar'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'À Propos | Fleuris',
    description: 'Découvrez Fleuris, votre service de livraison de fleurs fraîches.',
}

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-white">
            <Navbar />
            <div className="pt-32 pb-20 px-6 sm:px-12 lg:px-24">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-5xl font-bold text-gray-900 mb-6 font-serif">À Propos de Fleuris</h1>

                    <div className="space-y-8 text-gray-600 leading-relaxed">
                        <p className="text-xl">
                            Fleuris est né d'une passion : celle de rendre accessible l'art floral à tous, partout en France.
                        </p>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Notre Mission</h2>
                            <p>
                                Nous croyons que chaque moment mérite d'être célébré avec des fleurs fraîches et magnifiques.
                                Notre mission est de livrer des émotions, pas seulement des bouquets.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Notre Engagement</h2>
                            <ul className="list-disc pl-8 space-y-2">
                                <li>Des fleurs fraîches sélectionnées avec soin</li>
                                <li>Livraison rapide en main propre sous 24h</li>
                                <li>Un service client à votre écoute</li>
                                <li>Des prix transparents sans frais cachés</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Comment ça marche ?</h2>
                            <div className="grid md:grid-cols-3 gap-6 mt-6">
                                <div className="bg-purple-50 p-6 rounded-xl">
                                    <div className="text-3xl font-bold text-purple-600 mb-2">1</div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Choisissez</h3>
                                    <p className="text-sm">Parcourez notre catalogue et sélectionnez le bouquet parfait</p>
                                </div>
                                <div className="bg-purple-50 p-6 rounded-xl">
                                    <div className="text-3xl font-bold text-purple-600 mb-2">2</div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Personnalisez</h3>
                                    <p className="text-sm">Ajoutez un message et choisissez la date de livraison</p>
                                </div>
                                <div className="bg-purple-50 p-6 rounded-xl">
                                    <div className="text-3xl font-bold text-purple-600 mb-2">3</div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Recevez</h3>
                                    <p className="text-sm">Livraison rapide en main propre, sans carton</p>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </main>
    )
}
