
import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Section,
    Text,
} from '@react-email/components';
import * as React from 'react';

interface AdminNewOrderEmailProps {
    orderId: string;
    customerName: string;
    totalAmount: number;
    items: Array<{
        name: string;
        quantity: number;
    }>;
}

export const AdminNewOrderEmail = ({
    orderId,
    customerName,
    totalAmount,
    items,
}: AdminNewOrderEmailProps) => (
    <Html>
        <Head />
        <Preview>Nouvelle commande sur Fleuris ! 🌸</Preview>
        <Body style={main}>
            <Container style={container}>
                <Heading style={h1}>Nouvelle Commande Recevable !</Heading>
                <Text style={text}>
                    Une nouvelle commande vient d'être payée par <strong>{customerName}</strong>.
                </Text>
                <Section style={section}>
                    <Text style={label}>Commande ID:</Text>
                    <Text style={value}>#{orderId.slice(0, 8)}</Text>
                    
                    <Text style={label}>Total:</Text>
                    <Text style={value}>{totalAmount.toFixed(2)}€</Text>
                </Section>
                <Hr style={hr} />
                <Section>
                    <Text style={h2}>Articles :</Text>
                    {items.map((item, index) => (
                        <Text key={index} style={itemText}>
                            • {item.quantity}x {item.name}
                        </Text>
                    ))}
                </Section>
                <Hr style={hr} />
                <Text style={footer}>
                    Fleuris - Gestion des commandes
                </Text>
            </Container>
        </Body>
    </Html>
);

const main = {
    backgroundColor: '#ffffff',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
    margin: '0 auto',
    padding: '20px 0 48px',
    maxWidth: '580px',
};

const h1 = {
    color: '#333',
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    margin: '30px 0',
};

const h2 = {
    color: '#333',
    fontSize: '18px',
    fontWeight: 'bold',
    margin: '10px 0',
};

const section = {
    padding: '24px',
    border: '1px solid #f0f0f0',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9',
};

const label = {
    color: '#666',
    fontSize: '12px',
    textTransform: 'uppercase' as const,
    marginBottom: '4px',
};

const value = {
    color: '#333',
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '16px',
};

const hr = {
    borderColor: '#e6ebf1',
    margin: '20px 0',
};

const itemText = {
    color: '#333',
    fontSize: '14px',
    margin: '4px 0',
};

const footer = {
    color: '#8898aa',
    fontSize: '12px',
    textAlign: 'center' as const,
    marginTop: '32px',
};
