'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function SignUpPage() {
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        // URL de redirection après confirmation email (si activé)
        let redirectTo = undefined;
        if (typeof window !== 'undefined') {
            redirectTo = window.location.origin + '/auth/callback';
        }

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: redirectTo,
                // On passe le nom complet dans les métadonnées pour le trigger SQL
                data: {
                    full_name: fullName,
                }
            },
        })

        if (error) {
            setMessage({ text: error.message, type: 'error' })
        } else {
            setMessage({ text: "Compte créé ! Vérifiez vos emails pour confirmer.", type: 'success' })
            // Optionnel : Rediriger après quelques secondes ou laisser l'utilisateur lire le message
        }
        setLoading(false)
    }

    const messageClass = message?.type === 'error'
        ? 'bg-red-50 text-red-700'
        : 'bg-green-50 text-green-700';

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-10">
                    <Link href="/" className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                        Fleuris
                    </Link>
                    <h2 className="mt-6 text-2xl font-bold text-gray-900">Créer un compte</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Rejoignez-nous pour commander plus simplement
                    </p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-gray-100"
                >
                    <form className="space-y-6" onSubmit={handleSignUp}>
                        {/* Full Name */}
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                                Nom complet
                            </label>
                            <div className="mt-1">
                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    autoComplete="name"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                                    placeholder="Jean Dupont"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Mot de passe
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                                />
                            </div>
                        </div>

                        {message && (
                            <div className={'p-3 rounded-lg text-sm ' + messageClass}>
                                {message.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-colors"
                        >
                            {loading ? 'Création en cours...' : 'S\'inscrire'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Déjà un compte ?{' '}
                            <Link href="/login" className="font-medium text-purple-600 hover:text-purple-500">
                                Se connecter
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
