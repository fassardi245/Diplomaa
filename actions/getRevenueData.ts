import  stripe  from "@/lib/stripe";

export async function getRevenueData() {
  // 1. Calcular fecha de hace 90 días
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const startTimestamp = Math.floor(ninetyDaysAgo.getTime() / 1000);

  // 2. Pedir a Stripe los pagos (SIN filtrar por status aquí)
  const payments = await stripe.paymentIntents.list({
    created: { gte: startTimestamp },
    limit: 100, 
    // status: 'succeeded' <-- ELIMINADO PORQUE CAUSA EL ERROR
  });

  // 3. Filtrar manualmente solo los que fueron exitosos
  const successfulPayments = payments.data.filter(
    (payment) => payment.status === 'succeeded'
  );


  // 4. Agrupar los datos por día
  const dailyRevenue: { [key: string]: number } = {};

  successfulPayments.forEach((payment) => {
    // Convertir timestamp de Stripe a fecha legible (YYYY-MM-DD)
    const date = new Date(payment.created * 1000).toISOString().split('T')[0];
    
    // Sumar el monto (Stripe devuelve centavos, dividimos por 100)
    const amount = payment.amount / 100;

    if (dailyRevenue[date]) {
      dailyRevenue[date] += amount;
    } else {
      dailyRevenue[date] = amount;
    }
  });

  // 5. Convertir a Array para el gráfico y Ordenar por fecha
  const chartData = Object.keys(dailyRevenue)
    .map((date) => ({
      date,
      ingresos: dailyRevenue[date],
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return chartData;
}