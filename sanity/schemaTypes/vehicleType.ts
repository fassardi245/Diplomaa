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
      options: {
        source: "plate",
        maxLength: 96,
      },
    }),
    defineField({
      name: "model",
      title: "Modelo y Marca",
      type: "string", // Ej: "Ford Transit 2023"
    }),
    defineField({
      name: "status",
      title: "Estado Actual",
      type: "string",
      options: {
        list: [
          { title: "🟢 Disponible", value: "available" },
          { title: "🚚 En Ruta", value: "in_transit" },
          { title: "🔧 En Mantenimiento", value: "maintenance" },
        ],
        layout: "radio", // Se verán como botoncitos
      },
      initialValue: "available",
    }),
    defineField({
      name: "fuelLevel",
      title: "Nivel de Combustible (%)",
      type: "number",
      validation: (Rule) => Rule.min(0).max(100),
    }),
    defineField({
      name: "image",
      title: "Foto del Vehículo",
      type: "image",
      options: {
        hotspot: true,
      },
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