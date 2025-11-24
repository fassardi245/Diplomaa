import { UsersIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const grupoType = defineType({
  name: "grupo", // <--- NOMBRE IMPORTANTE
  title: "Grupo ",
  type: "document",
  icon: UsersIcon,
  fields: [
    defineField({
      name: "nombre",
      title: "Nombre del Grupo", // Ej: "Admin", "Logística"
      type: "string",
    }),
    // AQUÍ ESTÁ LA MAGIA DEL PATRÓN COMPOSITE:
    // Un solo array que puede tener Hojas (Acciones) u otros Composites (Grupos)
    defineField({
      name: "hijos",
      title: "Contenido del Grupo",
      type: "array",
      of: [
        { 
          type: "reference", 
          // AQUÍ ESTÁ EL TRUCO: Pones los dos tipos en el mismo 'to'
          to: [
            { type: "accion" }, 
            { type: "grupo" }
          ] 
        },
      ],
      description: "Puedes seleccionar tanto Acciones sueltas como otros Grupos.",
    }),
  ],
  preview: {
    select: {
      title: "nombre",
    },
  },
});