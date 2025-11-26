import { RocketIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const vehicleType = defineType({
  name: "vehicle",
  title: "Vehículo",
  type: "document",
  icon: RocketIcon,
  fields: [
    defineField({
      name: "plate",
      title: "Patente / Placa",
      type: "string",
      validation: (Rule) => Rule.required().min(6).max(10),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "plate", maxLength: 96 },
    }),
    defineField({
      name: "model",
      title: "Modelo y Marca",
      type: "string",
    }),
    defineField({
      name: "status",
      title: "Estado Actual",
      type: "string",
      options: {
        list: [
          { title: "Disponible", value: "available" },
          { title: "En Ruta", value: "in_transit" },
          { title: "Mantenimiento", value: "maintenance" },
        ],
        layout: "radio",
      },
      initialValue: "available",
    }),
    defineField({
      name: "fuelLevel",
      title: "Nivel de Combustible (%)",
      type: "number",
      validation: (Rule) => Rule.min(0).max(100),
    }),
    // --- CAMPOS NUEVOS ---
    defineField({
      name: "mileage",
      title: "Kilometraje",
      type: "number",
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: "lastMaintenance",
      title: "Última Revisión",
      type: "date",
      options: { dateFormat: 'YYYY-MM-DD' } // Corregido: Sin calendarTodayLabel
    }),
    defineField({
      name: "currentRoute",
      title: "Ruta Actual",
      type: "string",
    }),
    defineField({
      name: "image",
      title: "Foto",
      type: "image",
      options: { hotspot: true },
    }),
  ],
  preview: {
    select: {
      title: "plate",
      subtitle: "model",
      media: "image",
    },
  },
});