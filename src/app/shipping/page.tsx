import { Navbar } from '@/components/navbar'
import { Metadata } from 'next'
import { Truck, Clock, MapPin, Package } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Livraison | Fleuris',
    description: 'Informations sur la livraison de vos fleurs Fleuris.',
}

export default function ShippingPage() {
    return (
        <main className="min-h-screen bg-white">
            <Navbar />
            <div className="pt-32 pb-20 px-6 sm:px-12 lg:px-24">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-5xl font-bold text-gray-900 mb-4 font-serif">Livraison</h1>
                    <p className="text-xl text-gray-500 mb-12">Tout savoir sur la livraison de vos bouquets</p>

                    <div className="grid md:grid-cols-2 gap-6 mb-12">
                        <div className="bg-purple-50 p-6 rounded-xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center">
                                    <Truck size={20} />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Livraison Gratuite</h3>
                            </div>
                            <p className="text-gray-600">
                                Profitez de la livraison gratuite sur toutes vos commandes, sans minimum d'achat.
                            </p>
                        </div>

                        <div className="bg-purple-50 p-6 rounded-xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center">
                                    <Clock size={20} />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Livraison 24h</h3>
                            </div>
                            <p className="text-gray-600">
                                Commandez avant 14h pour une livraison le lendemain en main propre.
                            </p>
                        </div>

                        <div className="bg-purple-50 p-6 rounded-xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center">
                                    <Package size={20} />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Sans Carton</h3>
                            </div>
                            <p className="text-gray-600">
                                Vos fleurs sont livrées en main propre, jamais dans un carton, pour préserver leur beauté.
                            </p>
                        </div>

                        <div className="bg-purple-50 p-6 rounded-xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center">
                                    <MapPin size={20} />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Suivi en Temps Réel</h3>
                            </div>
                            <p className="text-gray-600">
                                Recevez des notifications par email à chaque étape de la livraison.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-8 text-gray-600 leading-relaxed">
                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Comment ça marche ?</h2>
                            <ol className="space-y-4">
                                <li className="flex gap-4">
                                    <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">1</span>
                                    <div>
                                        <strong className="text-gray-900">Passez votre commande</strong>
                                        <p>Choisissez votre bouquet et indiquez l'adresse de livraison.</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">2</span>
                                    <div>
                                        <strong className="text-gray-900">Préparation</strong>
                                        <p>Nos équipes préparent votre bouquet avec soin le jour de la livraison.</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">3</span>
                                    <div>
                                        <strong className="text-gray-900">Livraison</strong>
                                        <p>Votre bouquet est livré en main propre au destinataire.</p>
                                    </div>
                                </li>
                            </ol>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">En cas d'absence</h2>
                            <p>
                                Si le destinataire est absent, notre livreur laissera un avis de passage et le contactera
                                pour convenir d'un nouveau créneau de livraison dans les 24h.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Zones de livraison</h2>
                            <p>
                                Nous livrons actuellement dans les principales villes de France. Lors de votre commande,
                                entrez votre code postal pour vérifier si nous livrons dans votre zone.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </main>
    )
}
