import * as React from 'react';
import { Html, Body, Container, Section, Text, Hr, Preview, Head } from '@react-email/components';

interface LowStockAlertProps {
  productName: string;
  remainingStock: number;
  productId: string;
}

export const LowStockAlertEmail = ({ productName, remainingStock }: LowStockAlertProps) => (
  <Html>
    <Head />
    <Preview>⚠️ ALERTA: Stock Crítico - {productName}</Preview>
    <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#f3f4f6' }}>
      <Container style={{ margin: '0 auto', padding: '20px', backgroundColor: '#ffffff' }}>
        <Section style={{ backgroundColor: '#ef4444', padding: '10px', borderRadius: '5px' }}>
          <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center', margin: 0 }}>
            ALERTA DE INVENTARIO
          </Text>
        </Section>
        <Text style={{ fontSize: '16px' }}>Hola Admin,</Text>
        <Text>El producto <strong>{productName}</strong> se está agotando.</Text>
        <Hr />
        <Text style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>
          Quedan: {remainingStock} unidades
        </Text>
        <Hr />
        <Text style={{ fontSize: '12px', color: '#666' }}>Por favor repone stock pronto.</Text>
      </Container>
    </Body>
  </Html>
);
export default LowStockAlertEmail;