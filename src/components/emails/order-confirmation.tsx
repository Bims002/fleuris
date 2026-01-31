import * as React from 'react';

interface OrderConfirmationEmailProps {
  orderNumber: string;
  customerName: string;
  orderDate: string;
  deliveryDate: string;
  deliveryTime: string;
  deliveryAddress: string;
  cardMessage?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
}

export const OrderConfirmationEmail: React.FC<OrderConfirmationEmailProps> = ({
  orderNumber,
  customerName,
  orderDate,
  deliveryDate,
  deliveryTime,
  deliveryAddress,
  cardMessage,
  items,
  totalAmount,
}) => (
  <html>
    <head>
      <meta charSet="utf-8" />
    </head>
    <body style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.6', color: '#333', maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '3px solid #9333ea', paddingBottom: '20px' }}>
        <h1 style={{ color: '#9333ea', margin: '0', fontSize: '32px', fontFamily: 'Georgia, serif' }}>Fleuris</h1>
        <p style={{ color: '#666', margin: '5px 0 0 0' }}>Votre fleuriste en ligne</p>
      </div>

      {/* Confirmation */}
      <div style={{ backgroundColor: '#f3e8ff', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h2 style={{ color: '#9333ea', margin: '0 0 10px 0' }}>✓ Commande confirmée !</h2>
        <p style={{ margin: '0', fontSize: '16px' }}>
          Bonjour {customerName},<br />
          Merci pour votre commande. Nous avons bien reçu votre paiement et préparons votre bouquet avec soin.
        </p>
      </div>

      {/* Order Details */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#333', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>Détails de la commande</h3>
        <table style={{ width: '100%', marginTop: '15px' }}>
          <tbody>
            <tr>
              <td style={{ padding: '8px 0', color: '#666' }}>Numéro de commande</td>
              <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 'bold' }}>#{orderNumber}</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 0', color: '#666' }}>Date de commande</td>
              <td style={{ padding: '8px 0', textAlign: 'right' }}>{orderDate}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Delivery Info */}
      <div style={{ marginBottom: '30px', backgroundColor: '#f9fafb', padding: '20px', borderRadius: '8px' }}>
        <h3 style={{ color: '#333', margin: '0 0 15px 0' }}>📅 Informations de livraison</h3>
        <p style={{ margin: '5px 0' }}><strong>Date :</strong> {deliveryDate}</p>
        <p style={{ margin: '5px 0' }}><strong>Créneau :</strong> {deliveryTime}</p>
        <p style={{ margin: '5px 0' }}><strong>Adresse :</strong> {deliveryAddress}</p>
      </div>

      {/* Card Message */}
      {cardMessage && (
        <div style={{ marginBottom: '30px', backgroundColor: '#fef3c7', padding: '15px', borderLeft: '4px solid #f59e0b', borderRadius: '4px' }}>
          <p style={{ margin: '0', fontSize: '14px', color: '#92400e' }}>
            <strong>💌 Message sur la carte :</strong><br />
            <em>"{cardMessage}"</em>
          </p>
        </div>
      )}

      {/* Products */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#333', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>Produits commandés</h3>
        <table style={{ width: '100%', marginTop: '15px' }}>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px 0' }}>
                  <strong>{item.name}</strong><br />
                  <span style={{ color: '#666', fontSize: '14px' }}>Quantité : {item.quantity}</span>
                </td>
                <td style={{ padding: '12px 0', textAlign: 'right' }}>
                  {item.price.toFixed(2)}€
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Total */}
      <div style={{ backgroundColor: '#f3e8ff', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <table style={{ width: '100%' }}>
          <tbody>
            <tr>
              <td style={{ padding: '5px 0', color: '#666' }}>Sous-total</td>
              <td style={{ padding: '5px 0', textAlign: 'right' }}>{totalAmount.toFixed(2)}€</td>
            </tr>
            <tr>
              <td style={{ padding: '5px 0', color: '#666' }}>Livraison</td>
              <td style={{ padding: '5px 0', textAlign: 'right' }}>Gratuite</td>
            </tr>
            <tr style={{ borderTop: '2px solid #9333ea' }}>
              <td style={{ padding: '10px 0 0 0', fontSize: '18px', fontWeight: 'bold' }}>Total</td>
              <td style={{ padding: '10px 0 0 0', textAlign: 'right', fontSize: '20px', fontWeight: 'bold', color: '#9333ea' }}>
                {totalAmount.toFixed(2)}€
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <a href={`${process.env.NEXT_PUBLIC_SITE_URL}/account/orders`} style={{
          display: 'inline-block',
          backgroundColor: '#9333ea',
          color: 'white',
          padding: '12px 30px',
          textDecoration: 'none',
          borderRadius: '8px',
          fontWeight: 'bold'
        }}>
          Suivre ma commande
        </a>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '20px', textAlign: 'center', color: '#666', fontSize: '14px' }}>
        <p style={{ margin: '5px 0' }}>Merci de votre confiance !</p>
        <p style={{ margin: '5px 0' }}>L'équipe Fleuris</p>
        <p style={{ margin: '15px 0 5px 0', fontSize: '12px' }}>
          Des questions ? Contactez-nous à <a href="mailto:contact@fleuris.fr" style={{ color: '#9333ea' }}>contact@fleuris.fr</a>
        </p>
      </div>
    </body>
  </html>
);
