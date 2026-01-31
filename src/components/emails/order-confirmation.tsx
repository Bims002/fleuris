
import * as React from 'react';

interface OrderConfirmationEmailProps {
  orderId: string;
  customerName: string;
  totalAmount: number;
}

export const OrderConfirmationEmail: React.FC<OrderConfirmationEmailProps> = ({
  orderId,
  customerName,
  totalAmount,
}) => (
  <div style={{ fontFamily: 'sans-serif', lineHeight: 1.5, color: '#333' }}>
    <h1 style={{ color: '#7c3aed' }}>Merci pour votre commande, {customerName} !</h1>
    <p>Nous avons bien reçu votre commande <strong>#{orderId.slice(0, 8)}</strong>.</p>
    <p>
      Elle est actuellement en cours de préparation par nos artisans fleuristes.
    </p>
    <div style={{ margin: '20px 0', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
      <h2 style={{ fontSize: '18px', margin: '0 0 10px 0' }}>Récapitulatif</h2>
      <p style={{ margin: 0 }}><strong>Total payé :</strong> {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(totalAmount / 100)}</p>
    </div>
    <p>
      Vous recevrez un nouvel email lorsque votre bouquet sera en route.
    </p>
    <p style={{ fontSize: '12px', color: '#666', marginTop: '30px' }}>
      L'équipe Fleuris 🌸
    </p>
  </div>
);
