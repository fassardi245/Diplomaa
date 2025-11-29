import { BasketIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const orderType = defineType({
  name: "order",
  title: "Order",
  type: "document",
  icon: BasketIcon,
  fields: [
    defineField({
      name: "orderNumber",
      title: "Order Number",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "invoice",
      title: "Invoice Info",
      type: "object",
      fields: [
        { name: "id", type: "string" },
        { name: "number", type: "string" },
        { name: "hosted_invoice_url", type: "url" },
      ],
    }),
    defineField({
      name: "stripeCheckoutSessionId",
      title: "Stripe Checkout Session ID",
      type: "string",
    }),
    defineField({
      name: "stripeCustomerId",
      title: "Stripe Customer ID",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "clerkUserId",
      title: "Store User ID",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "customerName",
      title: "Customer Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "email",
      title: "Customer Email",
      type: "string",
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: "stripePaymentIntentId",
      title: "Stripe Payment Intent ID",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    
    // --- NUEVO: Dirección de envío guardada desde Stripe ---
    defineField({
      name: "shippingAddress",
      title: "Shipping Address",
      type: "object",
      fields: [
        { name: "line1", type: "string" },
        { name: "line2", type: "string" },
        { name: "city", type: "string" },
        { name: "state", type: "string" },
        { name: "postal_code", type: "string" },
        { name: "country", type: "string" },
      ],
      description: "Si está vacío, se considera Retiro en el Local",
    }),

    defineField({
      name: "products",
      title: "Products",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "product",
              title: "Product Reference",
              type: "reference",
              to: [{ type: "product" }],
              weak: true, 
            }),
            defineField({
              name: "name",
              title: "Product Name (Snapshot)",
              type: "string",
            }),
            defineField({
              name: "quantity",
              title: "Quantity Purchased",
              type: "number",
            }),
            defineField({
              name: "price",
              title: "Price per Unit",
              type: "number",
            }),
            // --- NUEVO: Guardamos la URL de la imagen aquí ---
            defineField({
              name: "image",
              title: "Product Image URL",
              type: "string", 
            }),
            defineField({
              name: "shippingMethodName",
              title: "Shipping Method Name",
              type: "string",
    }),
          ],
          // En schemaTypes/orderType.ts

          preview: {
            select: {
              product: "product.name",
              snapshotName: "name",
              quantity: "quantity",
              image: "image",
              price: "price",
            },
            prepare(select) {
              return {
                title: `${select.snapshotName || select.product} x ${select.quantity}`,
                subtitle: select.price ? `$${select.price * select.quantity}` : 'Precio no disponible',
                // SOLUCIÓN: Agregamos 'as any' al final para evitar el error de tipo estricto
                // O simplemente pon 'media: BasketIcon' si esto sigue molestando.
                media: select.image ? { asset: { url: select.image } } as any : BasketIcon, 
              };
            },
          },
        }),
      ],
    }),
    defineField({
      name: "totalPrice",
      title: "Total Price",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "currency",
      title: "Currency",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "amountDiscount",
      title: "Amount Discount",
      type: "number",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "shippingCost",
      title: "Costo de Envío",
      type: "number",
    }),
    defineField({
      name: "status",
      title: "Order Status",
      type: "string",
      options: {
        list: [
          { title: "Pendiente", value: "pendiente" },
          { title: "Pagado", value: "pagado" },
          { title: "En camino", value: "en camino" },
          { title: "Entregado", value: "entregado" },
          { title: "Cancelado", value: "cancelado" },
          { title: "Devuelto", value: "devuelto" },
        ],
      },
    }),
    defineField({
      name: "orderDate",
      title: "Order Date",
      type: "datetime",
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      name: "customerName",
      amount: "totalPrice",
      currency: "currency",
      orderId: "orderNumber",
      email: "email",
    },
    prepare(select) {
      const orderIdSnippet = `${select.orderId.slice(0, 5)}...${select.orderId.slice(-5)}`;
      return {
        title: `${select.name} (${orderIdSnippet})`,
        subtitle: `${select.amount} ${select.currency}, ${select.email}`,
        media: BasketIcon,
      };
    },
  },
});