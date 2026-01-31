import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Mentions Légales | Fleuris',
    description: 'Informations légales sur la société Fleuris.',
}

export default function MentionsPage() {
    return (
        <>
            <h1>Mentions Légales</h1>

            <h3>1. Éditeur du site</h3>
            <p>
                Le site <strong>Fleuris</strong> est édité par :<br />
                <strong>Société Fleuris SAS</strong><br />
                Au capital de 10 000 €<br />
                Siren : 123 456 789 RCS Paris<br />
                Siège social : 123 Avenue des Champs, 75000 Paris, France<br />
                Email : contact@fleuris.com
            </p>

            <h3>2. Directeur de la publication</h3>
            <p>
                Monsieur Jean Floriste, en qualité de Président.
            </p>

            <h3>3. Hébergement</h3>
            <p>
                Le site est hébergé par :<br />
                <strong>Vercel Inc.</strong><br />
                440 N Barranca Ave #4133<br />
                Covina, CA 91723<br />
                États-Unis
            </p>

            <h3>4. Propriété intellectuelle</h3>
            <p>
                L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
            </p>
        </>
    )
}
