import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Gestion des Cookies | Fleuris',
    description: 'Information sur l\'utilisation des cookies sur Fleuris.',
}

export default function CookiesPage() {
    return (
        <>
            <h1>Gestion des Cookies</h1>

            <h3>1. Qu'est-ce qu'un cookie ?</h3>
            <p>
                Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, mobile) lors de la visite d'un site. Il permet de conserver des données utilisateur afin de faciliter la navigation et de permettre certaines fonctionnalités.
            </p>

            <h3>2. Cookies utilisés</h3>
            <p>
                Fleuris utilise des cookies pour :
            </p>
            <ul>
                <li><strong>Fonctionnement indispensable :</strong> Gérer votre panier d'achat et votre session utilisateur. Sans ces cookies, vous ne pouvez pas passer commande.</li>
                <li><strong>Analytique (Optionnel) :</strong> Nous aider à comprendre comment le site est utilisé pour l'améliorer (via des outils anonymisés).</li>
            </ul>

            <h3>3. Gestion de vos préférences</h3>
            <p>
                Vous pouvez à tout moment désactiver les cookies via les paramètres de votre navigateur. Notez cependant que la désactivation des cookies fonctionnels peut empêcher le bon déroulement d'une commande.
            </p>
        </>
    )
}
