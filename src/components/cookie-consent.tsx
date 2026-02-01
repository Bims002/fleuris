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
        <div className="fixed bottom-0 left-0 right-0 z-50 p-3">
            <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200">
                <div className="p-4">
                    {/* Close button */}
                    <button
                        onClick={handleClose}
                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Fermer"
                    >
                        <X size={16} />
                    </button>

                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                        {/* Icon & Text */}
                        <div className="flex-1">
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">🍪</span>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-1">
                                        Cookies
                                    </h3>
                                    <p className="text-gray-600 text-xs leading-relaxed">
                                        Nous utilisons des cookies pour améliorer votre expérience et analyser le trafic.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-2 w-full md:w-auto">
                            <button
                                onClick={handleAcceptNecessary}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-xs transition-all duration-200 whitespace-nowrap"
                            >
                                Nécessaires
                            </button>
                            <button
                                onClick={handleAcceptAll}
                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-xs transition-all duration-200 whitespace-nowrap"
                            >
                                Accepter
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
