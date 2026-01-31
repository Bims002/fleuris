import { Navbar } from '@/components/navbar'
import { OccasionCard } from '@/components/occasion-card'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Livraison de Fleurs Originales & Artisanales',
  description: 'Commandez des bouquets uniques pour toutes les occasions. Livraison express en 24h par des artisans fleuristes passionnés.',
}

export default function Home() {
  const occasions = [
    { title: "Pour un Anniversaire", description: "Célébrez une année de plus avec éclat.", slug: "anniversaire", colorClass: "bg-pink-500" },
    { title: "Déclarer son Amour", description: "Les plus belles roses pour dire je t'aime.", slug: "amour", colorClass: "bg-red-600" },
    { title: "Remerciements", description: "Exprimez votre gratitude avec élégance.", slug: "remerciements", colorClass: "bg-yellow-400" },
    { title: "Deuil et Soutien", description: "Des fleurs pour accompagner vos pensées.", slug: "deuil", colorClass: "bg-purple-900" },
  ]

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section - Émotionnelle & Minimaliste */}
      <section className="relative pt-32 pb-20 px-6 sm:px-12 lg:px-24 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="z-10">
            <span className="text-purple-600 font-medium tracking-wider uppercase text-sm mb-4 block">
              Livraison de fleurs artisanales
            </span>
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-gray-900 leading-[0.9] mb-8 font-serif tracking-tight">
              Dites-le <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
                avec des fleurs.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-500 max-w-lg mb-10 leading-relaxed font-light">
              Des bouquets uniques conçus avec passion.
              Livrés en main propre, sans carton, juste de l'émotion.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/products" className="px-8 py-4 rounded-full bg-gray-900 text-white font-semibold text-lg hover:bg-black transition-all transform hover:scale-105 shadow-lg text-center">
                Envoyer des fleurs
              </Link>
              <Link href="/about" className="px-8 py-4 rounded-full bg-gray-50 text-gray-900 border border-gray-200 font-semibold text-lg hover:bg-gray-100 transition-all text-center">
                Comment ça marche ?
              </Link>
            </div>
          </div>

          {/* Visual Abstract Art / Placeholder for Hero Image */}
          <div className="relative h-[500px] w-full bg-gray-100 rounded-[3rem] overflow-hidden group">
            {/* Imagine a beautiful flower video or high-res image here */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-pink-50 to-white opacity-80" />
            <div className="absolute inset-0 flex items-center justify-center text-gray-300 font-serif italic text-4xl">
              Visuel Bouquet Signature
            </div>

            {/* Floating Element 1 */}
            <div className="absolute top-10 right-10 w-24 h-24 bg-white/40 backdrop-blur-md rounded-full shadow-lg animate-pulse" />
            {/* Floating Element 2 */}
            <div className="absolute bottom-20 left-10 w-32 h-32 bg-pink-200/20 backdrop-blur-md rounded-full shadow-lg" />
          </div>
        </div>
      </section>

      {/* Marquee / Trust Indicators */}
      <div className="w-full bg-gray-900 text-white py-4 overflow-hidden">
        <div className="flex justify-around text-center text-xs md:text-sm font-medium tracking-widest uppercase opacity-80">
          <span>Livraison 24h</span>
          <span>Savoir-faire Artisanal</span>
          <span>Fraîcheur Garantie</span>
          <span>Paiement Sécurisé</span>
        </div>
      </div>

      {/* Occasions Section */}
      <section className="py-24 px-6 sm:px-12 lg:px-24 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-serif">
                Pour chaque moment
              </h2>
              <p className="text-gray-500 text-lg">Choisissez selon l'occasion.</p>
            </div>
            <Link href="/products" className="hidden md:flex items-center gap-2 text-purple-600 font-semibold hover:text-purple-700 transition-colors">
              Tout voir <ArrowRight size={20} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {occasions.map((occ) => (
              <OccasionCard key={occ.slug} {...occ} />
            ))}
          </div>

          <Link href="/products" className="mt-8 md:hidden flex items-center justify-center gap-2 text-purple-600 font-semibold hover:text-purple-700 transition-colors w-full border border-purple-100 py-3 rounded-xl">
            Tout voir <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </main>
  )
}

function ArrowRight({ size, className }: { size?: number, className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}
