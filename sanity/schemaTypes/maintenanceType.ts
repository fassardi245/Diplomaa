import { WrenchIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const maintenanceType = defineType({
  name: "maintenance",
  title: "Mantenimiento",
  type: "document",
  icon: WrenchIcon,
  fields: [
    defineField({
      name: "vehicle",
      title: "Vehículo",
      type: "reference",
      to: [{ type: "vehicle" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "type",
      title: "Tipo de Servicio",
      type: "string",
      options: {
        list: [
          { title: "Preventivo (Service)", value: "Preventivo" },
          { title: "Correctivo (Reparación)", value: "Correctivo" },
          { title: "Limpieza / Estética", value: "Estetico" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Detalle del Trabajo",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "cost",
      title: "Costo Total ($)",
      type: "number",
    }),
    defineField({
      name: "date",
      title: "Fecha de Ingreso",
      type: "date",
      options: { dateFormat: "YYYY-MM-DD" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "status",
      title: "Estado del Mantenimiento",
      type: "string",
      options: {
        list: [
          { title: "En Proceso", value: "in_progress" },
          { title: "Finalizado", value: "completed" },
        ],
        layout: "radio"
      },
      initialValue: "in_progress"
    }),
  ],
  preview: {
    select: {
      title: "vehicle.plate",
      subtitle: "type",
      media: "vehicle.image",
    },
  },
});