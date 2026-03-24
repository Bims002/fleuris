
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

interface ContactSubmissionEmailProps {
    name: string;
    email: string;
    subject: string;
    message: string;
}

export const ContactSubmissionEmail = ({
    name,
    email,
    subject,
    message,
}: ContactSubmissionEmailProps) => (
    <Html>
        <Head />
        <Preview>Nouveau message de {name} via le formulaire 📩</Preview>
        <Body style={main}>
            <Container style={container}>
                <Heading style={h1}>Nouveau message de contact</Heading>
                <Section style={section}>
                    <Text style={label}>De:</Text>
                    <Text style={value}>{name} ({email})</Text>
                    
                    <Text style={label}>Sujet:</Text>
                    <Text style={value}>{subject}</Text>
                </Section>
                <Hr style={hr} />
                <Section>
                    <Text style={h2}>Message :</Text>
                    <Text style={messageBody}>{message}</Text>
                </Section>
                <Hr style={hr} />
                <Text style={footer}>
                    Fleuris - Site Web
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

const messageBody = {
    color: '#333',
    fontSize: '14px',
    lineHeight: '24px',
    whiteSpace: 'pre-wrap' as const,
};

const hr = {
    borderColor: '#e6ebf1',
    margin: '20px 0',
};

const footer = {
    color: '#8898aa',
    fontSize: '12px',
    textAlign: 'center' as const,
    marginTop: '32px',
};
