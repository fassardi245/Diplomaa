import { UserIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const driverType = defineType({
  name: "driver",
  title: "Chofer",
  type: "document",
  icon: UserIcon,
  fields: [
    defineField({
      name: "name",
      title: "Nombre Completo",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "license",
      title: "Licencia de Conducir",
      type: "string",
    }),
    defineField({
      name: "status",
      title: "Estado",
      type: "string",
      options: {
        list: [
          { title: "🟢 Disponible", value: "available" },
          { title: "🚚 En Viaje", value: "busy" },
          { title: "🏖️ De Licencia", value: "off_duty" },
        ],
        layout: "radio",
      },
      initialValue: "available",
    }),
    defineField({
      name: "photo",
      title: "Foto del Chofer",
      type: "image",
      options: { hotspot: true },
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "status",
      media: "photo",
    },
  },
});