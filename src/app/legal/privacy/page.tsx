import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Politique de Confidentialité | Fleuris',
    description: 'Comment Fleuris protège et utilise vos données personnelles.',
}

export default function PrivacyPage() {
    return (
        <>
            <h1>Politique de Confidentialité</h1>
            <p>
                Chez Fleuris, nous accordons une grande importance à la confidentialité de vos données. Cette politique décrit comment nous collectons, utilisons et protégeons vos informations personnelles.
            </p>

            <h3>1. Données collectées</h3>
            <p>
                Nous collectons les informations nécessaires au traitement de vos commandes :
            </p>
            <ul>
                <li>Nom, prénom, email et numéro de téléphone du client.</li>
                <li>Adresse de livraison et informations nécessaires pour le livreur (digicode, étage).</li>
                <li>Nom et adresse du destinataire (si différent du client).</li>
                <li>Historique de vos commandes.</li>
            </ul>
            <p>
                Nous ne stockons <strong>aucune donnée bancaire</strong>. Les paiements sont intégralement gérés par notre partenaire certifié Stripe.
            </p>

            <h3>2. Utilisation des données</h3>
            <p>
                Vos données sont utilisées uniquement pour :
            </p>
            <ul>
                <li>Traiter et livrer vos commandes.</li>
                <li>Vous informer de l'état de votre commande (confirmations, suivi).</li>
                <li>Améliorer votre expérience sur notre site.</li>
                <li>Respecter nos obligations légales (comptabilité).</li>
            </ul>

            <h3>3. Partage des données</h3>
            <p>
                Vos données ne sont jamais vendues à des tiers. Elles peuvent être transmises à nos équipes de livraison uniquement dans le but d'assurer la bonne exécution de la commande.
            </p>

            <h3>4. Vos droits</h3>
            <p>
                Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles. Vous pouvez exercer ce droit en nous contactant à privacy@fleuris.com ou depuis votre espace client.
            </p>
        </>
    )
}
