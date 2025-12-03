import { ErrorOutlineIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const claimType = defineType({
  name: "claim",
  title: "Reclamo",
  type: "document",
  icon: ErrorOutlineIcon,
  fields: [
    defineField({
      name: "order",
      title: "Pedido Asociado",
      type: "reference",
      to: [{ type: "order" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "reason",
      title: "Motivo del Reclamo",
      type: "string",
      options: {
        list: [
          { title: "Producto Dañado", value: "damaged" },
          { title: "Producto Incorrecto", value: "wrong_item" },
          { title: "Arrepentimiento de Compra", value: "regret" },
          { title: "Otro", value: "other" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Descripción Detallada",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "status",
      title: "Estado del Reclamo",
      type: "string",
      options: {
        list: [
          { title: "Pendiente de Revisión", value: "pending" },
          { title: "Aprobado", value: "approved" },
          { title: "Rechazado", value: "rejected" },
          { title: "Resuelto", value: "resolved" },
        ],
      },
      initialValue: "pending",
    }),
    defineField({
      name: "date",
      title: "Fecha del Reclamo",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "adminResponse",
      title: "Respuesta del Administrador",
      type: "text",
      rows: 3,
      description: "Mensaje visible para el cliente explicando la resolución.",
    }),
  ],
  preview: {
    select: {
      title: "order.orderNumber",
      subtitle: "status",
    },
    prepare(select) {
      return {
        title: `Reclamo: ${select.title}`,
        subtitle: select.subtitle,
      };
    },
  },
});