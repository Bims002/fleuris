'use client'

import { createClient } from '@supabase/supabase-js'

// You need to set these env vars or replace them here for the script to run standalone
// But better to run this within the Next.js context or just use the Supabase JS client inside a temporary helper page.
// Since I can't easily run standalone node scripts with these env vars without setup, I'll create a Next.js API route to seed the DB.
// Actually, a temporary page is easier to trigger.

const products = [
    {
        name: "Chrysanthème Mauve Impérial",
        price: 5090,
        category: "deuil",
        description: "Une élégance sobre et respectueuse. Ce bouquet de chrysanthèmes mauves est soigneusement composé pour exprimer vos condoléances avec dignité et tendresse.",
        image: "https://images.unsplash.com/photo-1606822369651-7f9a1f5928f5?w=800&q=80"
    },
    {
        name: "Duo Roses & Lys",
        price: 5090,
        category: "amour",
        description: "L'alliance parfaite de la passion et de la pureté. Des roses éclatantes mariées à la noblesse des lys pour un message d'amour sans équivoque.",
        image: "https://images.unsplash.com/photo-1562690868-60bbe7293e94?w=800&q=80"
    },
    {
        name: "Orchidée Blanche Phalaenopsis",
        price: 4790,
        category: "anniversaire",
        description: "Un symbole de beauté durable et de raffinement absolu. Cette orchidée blanche en pot est le cadeau idéal pour marquer une occasion spéciale avec élégance.",
        image: "https://images.unsplash.com/photo-1566938064504-a6390f07b53c?w=800&q=80"
    },
    {
        name: "Roses Rouges Passion (20 tiges)",
        price: 4000,
        category: "amour",
        description: "Dites 'Je t'aime' avec intensité. Un bouquet généreux de 20 roses rouges veloutées, sélectionnées pour leur tenue et leur parfum envoûtant.",
        image: "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=800&q=80"
    },
    {
        name: "Panier Pétales de Saison",
        price: 5090,
        category: "felicitations",
        description: "Un panier champêtre et joyeux, débordant de fleurs de saison aux couleurs douces. Parfait pour célébrer une naissance ou dire merci.",
        image: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=800&q=80"
    },
    {
        name: "Gerberas & Lisianthus",
        price: 5490,
        category: "anniversaire",
        description: "Une explosion de couleurs et de joie ! Ce bouquet rond mixe la modernité des gerberas et la délicatesse des lisianthus pour un rendu pétillant.",
        image: "https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?w=800&q=80"
    },
    {
        name: "La Grande Couronne Blanche",
        price: 28900,
        category: "deuil",
        description: "Un hommage grandiose et solennel. Cette couronne monumentale de fleurs blanches incarne la pureté et le respect éternel.",
        image: "https://images.unsplash.com/photo-1596627684814-22b28c5c76dd?w=800&q=80"
    },
    {
        name: "Bouquet Signature Vianney",
        price: 4460,
        category: "felicitations",
        description: "Notre création exclusive du moment. Un assemblage harmonieux réalisé selon l'inspiration de nos artisans fleuristes avec les plus belles fleurs de l'arrivage.",
        image: "https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?w=800&q=80"
    },
    {
        name: "Roses Multicolores",
        price: 4000,
        category: "amitie", // New category or map to others
        description: "La vie en couleurs ! Un bouquet vitaminé de roses variées pour apporter du peps et de la bonne humeur à votre intérieur.",
        image: "https://images.unsplash.com/photo-1559563362-c667ba5f5480?w=800&q=80"
    },
    {
        name: "Tulipes Jaunes Soleil",
        price: 3990,
        category: "anniversaire",
        description: "Un rayon de soleil en bouquet. Ces tulipes jaunes éclatantes symbolisent la joie de vivre et le renouveau du printemps.",
        image: "https://images.unsplash.com/photo-1520763185298-1b434c919102?w=800&q=80"
    }
]

export default function Seeder() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const seed = async () => {
        for (const p of products) {
            await supabase.from('products').insert({
                name: p.name,
                description: p.description,
                price: p.price,
                category: p.category,
                images: [p.image],
                is_available: true
            })
        }
        alert('Import terminé !')
    }

    return (
        <div className="p-10">
            <button onClick={seed} className="bg-black text-white px-6 py-3 rounded">
                Lancer l'import VianneyFlora
            </button>
        </div>
    )
}
