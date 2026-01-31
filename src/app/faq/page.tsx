import { Navbar } from '@/components/navbar'
import { Metadata } from 'next'
import { ChevronDown } from 'lucide-react'

export const metadata: Metadata = {
    title: 'FAQ | Fleuris',
    description: 'Questions fréquentes sur la livraison de fleurs Fleuris.',
}

export default function FAQPage() {
    const faqs = [
        {
            question: "Quels sont les délais de livraison ?",
            answer: "Nous livrons en 24h pour toute commande passée avant 14h. Pour les occasions spéciales, vous pouvez programmer une livraison jusqu'à 7 jours à l'avance."
        },
        {
            question: "Comment sont livrées les fleurs ?",
            answer: "Nos fleurs sont livrées en main propre par nos livreurs. Elles ne sont jamais expédiées dans un carton pour garantir leur fraîcheur et leur beauté."
        },
        {
            question: "Que se passe-t-il si le destinataire est absent ?",
            answer: "Notre livreur laissera un avis de passage et contactera le destinataire pour convenir d'un nouveau créneau de livraison."
        },
        {
            question: "Puis-je modifier ma commande après validation ?",
            answer: "Vous pouvez modifier votre commande jusqu'à 2h après validation en nous contactant directement. Au-delà, la préparation est déjà en cours."
        },
        {
            question: "Les fleurs sont-elles garanties fraîches ?",
            answer: "Absolument ! Toutes nos fleurs sont sélectionnées le jour même de la livraison. Si vous n'êtes pas satisfait, contactez-nous dans les 24h."
        },
        {
            question: "Puis-je ajouter un message personnalisé ?",
            answer: "Oui, lors de la commande vous pouvez ajouter un message qui sera imprimé sur une carte élégante accompagnant le bouquet."
        },
        {
            question: "Quels moyens de paiement acceptez-vous ?",
            answer: "Nous acceptons toutes les cartes bancaires (Visa, Mastercard, American Express) via notre système de paiement sécurisé Stripe."
        },
        {
            question: "Livrez-vous partout en France ?",
            answer: "Nous livrons actuellement dans les principales villes françaises. Entrez votre code postal lors de la commande pour vérifier la disponibilité."
        }
    ]

    return (
        <main className="min-h-screen bg-white">
            <Navbar />
            <div className="pt-32 pb-20 px-6 sm:px-12 lg:px-24">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-5xl font-bold text-gray-900 mb-4 font-serif">Questions Fréquentes</h1>
                    <p className="text-xl text-gray-500 mb-12">Tout ce que vous devez savoir sur Fleuris</p>

                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <details key={index} className="group bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                                <summary className="flex justify-between items-center cursor-pointer list-none">
                                    <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                                    <ChevronDown className="text-gray-400 group-open:rotate-180 transition-transform" size={20} />
                                </summary>
                                <p className="mt-4 text-gray-600 leading-relaxed">{faq.answer}</p>
                            </details>
                        ))}
                    </div>

                    <div className="mt-12 p-8 bg-purple-50 rounded-2xl text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Vous ne trouvez pas votre réponse ?</h2>
                        <p className="text-gray-600 mb-4">Notre équipe est là pour vous aider</p>
                        <a href="/contact" className="inline-block px-6 py-3 bg-purple-600 text-white rounded-full font-semibold hover:bg-purple-700 transition-colors">
                            Nous contacter
                        </a>
                    </div>
                </div>
            </div>
        </main>
    )
}
