'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

export function CookieConsentBanner() {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Vérifier si l'utilisateur a déjà fait un choix
        const consent = localStorage.getItem('fleuris-cookie-consent')

        if (!consent) {
            setIsVisible(true)
            // Initialiser le consentement en mode refusé par défaut
            if (typeof window !== 'undefined' && window.gtag) {
                window.gtag('consent', 'default', {
                    analytics_storage: 'denied',
                    ad_storage: 'denied'
                })
            }
        } else if (consent === 'necessary' || consent === 'all') {
            // Activer analytics si l'utilisateur a accepté
            if (typeof window !== 'undefined' && window.gtag) {
                window.gtag('consent', 'update', {
                    analytics_storage: 'granted',
                    ad_storage: consent === 'all' ? 'granted' : 'denied'
                })
            }
        }
    }, [])

    const handleAcceptNecessary = () => {
        localStorage.setItem('fleuris-cookie-consent', 'necessary')
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('consent', 'update', {
                analytics_storage: 'granted',
                ad_storage: 'denied'
            })
        }
        setIsVisible(false)
    }

    const handleAcceptAll = () => {
        localStorage.setItem('fleuris-cookie-consent', 'all')
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('consent', 'update', {
                analytics_storage: 'granted',
                ad_storage: 'granted'
            })
        }
        setIsVisible(false)
    }

    const handleClose = () => {
        localStorage.setItem('fleuris-cookie-consent', 'declined')
        if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('consent', 'update', {
                analytics_storage: 'denied',
                ad_storage: 'denied'
            })
        }
        setIsVisible(false)
    }

    if (!isVisible) return null

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
            <div className="max-w-6xl mx-auto bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl shadow-2xl border border-gray-700 backdrop-blur-lg">
                <div className="p-6 md:p-8">
                    {/* Close button */}
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                        aria-label="Fermer"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                        {/* Icon & Text */}
                        <div className="flex-1">
                            <div className="flex items-start gap-4">
                                <span className="text-4xl">🍪</span>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">
                                        Gestion des cookies
                                    </h3>
                                    <p className="text-gray-300 text-sm leading-relaxed mb-3">
                                        Nous utilisons des cookies pour améliorer votre expérience de navigation,
                                        analyser le trafic du site et comprendre comment vous interagissez avec nos services.
                                    </p>
                                    <p className="text-gray-400 text-xs">
                                        Les cookies nécessaires incluent l'analyse de trafic anonymisée pour améliorer nos services.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            <button
                                onClick={handleAcceptNecessary}
                                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-full font-semibold text-sm transition-all duration-200 border border-gray-600 whitespace-nowrap"
                            >
                                Cookies nécessaires
                            </button>
                            <button
                                onClick={handleAcceptAll}
                                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-semibold text-sm transition-all duration-200 shadow-lg hover:shadow-xl whitespace-nowrap"
                            >
                                Tous les cookies
                            </button>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="mt-4 pt-4 border-t border-gray-700">
                        <details className="text-xs text-gray-400">
                            <summary className="cursor-pointer hover:text-gray-300 transition-colors">
                                En savoir plus sur les cookies
                            </summary>
                            <div className="mt-3 space-y-2 pl-4">
                                <p>
                                    <strong className="text-gray-300">Cookies nécessaires :</strong> Essentiels au fonctionnement du site
                                    (panier, authentification) + analyse de trafic anonymisée (Google Analytics).
                                </p>
                                <p>
                                    <strong className="text-gray-300">Tous les cookies :</strong> Cookies nécessaires + cookies marketing
                                    pour personnaliser votre expérience et afficher des publicités pertinentes.
                                </p>
                                <p className="text-gray-500">
                                    Vous pouvez modifier vos préférences à tout moment en supprimant les cookies de votre navigateur.
                                </p>
                            </div>
                        </details>
                    </div>
                </div>
            </div>
        </div>
    )
}
