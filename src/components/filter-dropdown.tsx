'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, X } from 'lucide-react'

interface FilterProps {
    label: string
    options: { label: string, value: string }[]
    activeValue: string | null
    onChange: (value: string | null) => void
}

export function FilterDropdown({ label, options, activeValue, onChange }: FilterProps) {
    const [isOpen, setIsOpen] = useState(false)

    // Construction des classes CSS sans template strings imbriqués complexes
    const buttonBaseClasses = "flex items-center gap-2 px-4 py-2 rounded-full border transition-all text-sm font-medium";
    const buttonStateClasses = activeValue
        ? 'border-gray-900 bg-gray-900 text-white'
        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300';

    const iconClasses = `transform transition-transform ${isOpen ? 'rotate-180' : ''}`;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`${buttonBaseClasses} ${buttonStateClasses}`}
            >
                <span>{activeValue ? options.find(o => o.value === activeValue)?.label : label}</span>
                {activeValue ? (
                    <X size={14} onClick={(e) => { e.stopPropagation(); onChange(null); }} />
                ) : (
                    <ChevronDown size={14} className={iconClasses} />
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-20 overflow-hidden"
                    >
                        {options.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => {
                                    onChange(option.value)
                                    setIsOpen(false)
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-purple-600 transition-colors"
                            >
                                {option.label}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
