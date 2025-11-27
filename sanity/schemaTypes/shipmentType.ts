import { RocketIcon } from "@sanity/icons"; // Usamos este que sabemos que funciona
import { defineField, defineType } from "sanity";

export const shipmentType = defineType({
  name: "shipment",
  title: "Envío",
  type: "document",
  icon: RocketIcon,
  fields: [
    defineField({
      name: "order",
      title: "Pedido Asociado",
      type: "reference",
      to: [{ type: "order" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "vehicle",
      title: "Vehículo Asignado",
      type: "reference",
      to: [{ type: "vehicle" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "driverName",
      title: "Nombre del Chofer",
      type: "string",
    }),
    defineField({
      name: "destinationAddress",
      title: "Dirección de Destino",
      type: "string",
    }),
    defineField({
      name: "status",
      title: "Estado del Envío",
      type: "string",
      options: {
        list: [
          { title: "En Preparación", value: "preparing" },
          { title: "En Tránsito", value: "in_transit" },
          { title: "Entregado", value: "delivered" },
          { title: "Fallido", value: "failed" },
        ],
      },
      initialValue: "preparing",
    }),
    defineField({
      name: "departureDate",
      title: "Fecha de Salida",
      type: "datetime",
    }),
  ],
  preview: {
    select: {
      title: "order.orderNumber",
      subtitle: "status",
      media: "vehicle.image",
    },
    prepare(select) {
      return {
        title: `Envío #${select.title ? select.title.slice(-6) : '...'}`,
        subtitle: select.subtitle,
        media: select.media,
      };
    },
  },
});