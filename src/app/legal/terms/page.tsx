import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Conditions Générales de Vente (CGV) | Fleuris',
    description: 'Consultez nos conditions générales de vente. Livraison de fleurs, paiement, et politique de retour.',
}

export default function TermsPage() {
    return (
        <>
            <h1>Conditions Générales de Vente</h1>
            <p className="text-sm text-gray-500 mb-8">Dernière mise à jour : 30 Janvier 2026</p>

            <h3>1. Objet</h3>
            <p>
                Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre <strong>Fleuris</strong> et ses clients pour la vente de produits floraux via le site internet.
            </p>

            <h3>2. Produits</h3>
            <p>
                Les produits proposés sont des bouquets de fleurs fraîches et des plantes. Les photos sont présentées à titre indicatif. En raison de la nature artisanale et périssable des fleurs, le bouquet livré peut varier légèrement selon l'approvisionnement saisonnier, tout en respectant l'esprit, les couleurs et la valeur du produit choisi.
            </p>

            <h3>3. Prix</h3>
            <p>
                Les prix sont indiqués en euros (€) toutes taxes comprises (TTC). Fleuris se réserve le droit de modifier ses prix à tout moment, mais les produits seront facturés sur la base des tarifs en vigueur au moment de la validation de la commande.
            </p>

            <h3>4. Commande</h3>
            <p>
                La validation de la commande vaut acceptation des présentes CGV. Le client reçoit un email de confirmation récapitulant sa commande. Fleuris se réserve le droit d'annuler toute commande d'un client avec lequel il existerait un litige relatif au paiement d'une commande antérieure.
            </p>

            <h3>5. Paiement</h3>
            <p>
                Le paiement est exigible immédiatement à la commande. Le règlement s'effectue par carte bancaire via notre prestataire de paiement sécurisé Stripe. Aucune donnée bancaire n'est conservée par Fleuris.
            </p>

            <h3>6. Livraison</h3>
            <p>
                Les livraisons sont effectuées en main propre par nos livreurs. Le client est responsable de l'exactitude des coordonnées du destinataire. En cas d'absence, un avis de passage sera laissé ou le destinataire sera contacté pour convenir d'un nouveau créneau (pouvant engendrer des frais supplémentaires selon la zone).
            </p>

            <h3>7. Droit de Rétractation</h3>
            <p>
                Conformément à l'article L221-28 du Code de la Consommation, le droit de rétractation ne peut être exercé pour les contrats de fourniture de biens susceptibles de se détériorer ou de se périmer rapidement (fleurs fraîches, plantes).
            </p>

            <h3>8. Service Client</h3>
            <p>
                Pour toute question ou réclamation, notre service client est joignable via le formulaire de contact du site ou par email à support@fleuris.store.
            </p>
        </>
    )
}
