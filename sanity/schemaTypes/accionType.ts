import { BoltIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const accionType = defineType({
  name: "accion", // <--- Este nombre debe coincidir con la referencia en grupo.ts
  title: "Acción ",
  type: "document",
  icon: BoltIcon,
  fields: [
    defineField({
      name: "titulo",
      title: "Nombre del Permiso",
      type: "string", // Ej: "Ver Flota"
    }),
    defineField({
      name: "slug",
      title: "Código Identificador",
      type: "slug", // Ej: "ver_flota"
      options: { source: "titulo" },
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { title: "titulo", subtitle: "slug.current" },
  },
});