import Link from 'next/link'
import { Heart } from 'lucide-react'

export function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="bg-gray-50 border-t border-gray-100 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">

                    {/* Brand Column */}
                    <div className="col-span-1 md:col-span-1">
                        <Link href="/" className="block mb-6">
                            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent font-serif">
                                Fleuris
                            </span>
                        </Link>
                        <p className="text-gray-500 text-sm leading-relaxed mb-6">
                            L'art de la fleur, livré avec émotion. Des bouquets uniques créés avec passion pour tous vos moments précieux.
                        </p>
                        <div className="flex gap-4">
                            <a
                                href="https://www.tiktok.com/@fleuris.store"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-white rounded-full text-gray-400 hover:text-black hover:shadow-sm transition-all"
                                aria-label="TikTok"
                            >
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div>
                        <h4 className="font-serif font-bold text-gray-900 mb-6">Boutique</h4>
                        <ul className="space-y-3 text-sm text-gray-500">
                            <li><Link href="/products" className="hover:text-purple-600 transition-colors">Tous les Bouquets</Link></li>
                            <li><Link href="/products?occasion=anniversaire" className="hover:text-purple-600 transition-colors">Anniversaire</Link></li>
                            <li><Link href="/products?occasion=amour" className="hover:text-purple-600 transition-colors">Amour & Romance</Link></li>
                            <li><Link href="/products?occasion=remerciements" className="hover:text-purple-600 transition-colors">Remerciements</Link></li>
                            <li><Link href="/products?occasion=deuil" className="hover:text-purple-600 transition-colors">Deuil</Link></li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h4 className="font-serif font-bold text-gray-900 mb-6">Aide & Info</h4>
                        <ul className="space-y-3 text-sm text-gray-500">
                            <li><Link href="/account/orders" className="hover:text-purple-600 transition-colors">Suivre ma commande</Link></li>
                            <li><Link href="/faq" className="hover:text-purple-600 transition-colors">FAQ</Link></li>
                            <li><Link href="/contact" className="hover:text-purple-600 transition-colors">Nous Contacter</Link></li>
                            <li><Link href="/shipping" className="hover:text-purple-600 transition-colors">Livraison</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="font-serif font-bold text-gray-900 mb-6">Légal</h4>
                        <ul className="space-y-3 text-sm text-gray-500">
                            <li><Link href="/legal/terms" className="hover:text-purple-600 transition-colors">CGV</Link></li>
                            <li><Link href="/legal/privacy" className="hover:text-purple-600 transition-colors">Politique de Confidentialité</Link></li>
                            <li><Link href="/legal/cookies" className="hover:text-purple-600 transition-colors">Gestion des cookies</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-gray-400">
                        © {currentYear} Fleuris. Tous droits réservés.
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                        Fait avec <Heart size={12} className="text-red-500 fill-red-500" /> en France
                    </p>
                </div>
            </div>
        </footer>
    )
}
