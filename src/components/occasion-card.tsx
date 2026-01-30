'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

interface OccasionCardProps {
    title: string
    description: string
    slug: string
    colorClass: string // Tailwind bg class for abstract presentation
}

export function OccasionCard({ title, description, slug, colorClass }: OccasionCardProps) {
    return (
        <Link href={`/products?occasion=${slug}`}>
            <motion.div
                whileHover={{ y: -5 }}
                className="group relative h-80 rounded-3xl overflow-hidden cursor-pointer bg-gray-50 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300"
            >
                {/* Abstract Background / Image Placeholder */}
                <div className={`absolute inset-0 ${colorClass} opacity-10 group-hover:opacity-20 transition-opacity`} />

                {/* Content */}
                <div className="absolute inset-0 p-8 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <h3 className="text-2xl font-bold text-gray-900 font-serif leading-tight">
                            {title}
                        </h3>
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0 shadow-sm">
                            <ArrowRight size={18} className="text-gray-900" />
                        </div>
                    </div>

                    <div>
                        <p className="text-gray-600 font-medium mb-2 transform translate-y-4 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 delay-75">
                            {description}
                        </p>
                        <div className="h-1 w-12 bg-gray-900 rounded-full" />
                    </div>
                </div>
            </motion.div>
        </Link>
    )
}
