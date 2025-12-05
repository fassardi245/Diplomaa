import { backendClient } from "@/sanity/lib/backendClient";

export async function getSalesByCategory() {
  const query = `
    *[_type == "order"] {
      products[] {
        quantity,
        product->{
          categories[]->{
            title
          }
        }
      }
    }
  `;

  const orders = await backendClient.fetch(query);

  const categoryCount: { [key: string]: number } = {};

  orders.forEach((order: any) => {
    const items = order.products || [];

    items.forEach((item: any) => {
      const rawTitle = item.product?.categories?.[0]?.title;
      const categoryName = rawTitle ? rawTitle.trim() : "Sin Categoría";
      
      const quantity = item.quantity || 1;

      if (categoryCount[categoryName]) {
        categoryCount[categoryName] += quantity;
      } else {
        categoryCount[categoryName] = quantity;
      }
    });
  });

  // --- CAMBIO AQUÍ: COLORES REALES ---
  // Usamos códigos HEX para asegurar que se vean diferentes
  const colors = [
    "#3b82f6", // Azul brillante
    "#ef4444", // Rojo
    "#10b981", // Verde esmeralda
    "#f59e0b", // Ámbar/Naranja
    "#8b5cf6", // Violeta
    "#ec4899", // Rosa
    "#06b6d4", // Cian
  ];

  return Object.keys(categoryCount).map((catName, index) => ({
    browser: catName, 
    visitors: categoryCount[catName], 
    // Usamos el operador módulo (%) para rotar los colores si hay muchas categorías
    fill: colors[index % colors.length] 
  }));
}