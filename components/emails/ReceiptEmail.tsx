import * as React from 'react';
import { Html, Body, Container, Section, Text, Hr, Preview, Head, Link } from '@react-email/components';

interface ReceiptEmailProps {
  orderNumber: string;
  customerName: string;
  invoiceUrl: string | null;
}

export const ReceiptEmail = ({ orderNumber, customerName, invoiceUrl }: ReceiptEmailProps) => (
  <Html>
    <Head />
    <Preview>Tu compra #{orderNumber} está confirmada</Preview>
    <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#ffffff' }}>
      <Container style={{ margin: '0 auto', padding: '20px', border: '1px solid #eaeaea' }}>
        <Text style={{ fontSize: '24px', fontWeight: 'bold' }}>¡Gracias por tu compra!</Text>
        <Text>Hola {customerName},</Text>
        <Text>Tu pedido <strong>#{orderNumber}</strong> ha sido procesado correctamente.</Text>
        
        {invoiceUrl && (
          <Section style={{ marginTop: '20px', marginBottom: '20px' }}>
            <Link 
              href={invoiceUrl} 
              style={{ padding: '12px 20px', backgroundColor: '#000', color: '#fff', borderRadius: '5px', textDecoration: 'none' }}
            >
              Descargar Factura Oficial
            </Link>
          </Section>
        )}
        
        <Hr />
        <Text style={{ fontSize: '12px', color: '#666' }}>Si tienes dudas, responde a este correo.</Text>
      </Container>
    </Body>
  </Html>
);
export default ReceiptEmail;