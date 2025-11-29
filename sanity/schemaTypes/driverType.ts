import { UserIcon } from "lucide-react";
import { defineField, defineType } from "sanity";

export const driverType = defineType({
  name: "driver",
  title: "Driver",
  type: "document",
  icon: UserIcon,
  fields: [
    defineField({
      name: "name",
      title: "Full Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "licenseNumber",
      title: "License Number",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "photo",
      title: "Profile Photo",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      initialValue: "available", // <--- Valor por defecto
      options: {
        list: [
          // Solo dejamos estos dos estados. "De licencia" se elimina.
          { title: "Disponible", value: "available" },
          { title: "En Viaje", value: "busy" }, 
        ],
        layout: "radio", // Opcional: se ve mejor en el Studio
      },
      // Opcional: readOnly true si quieres que NADIE lo toque a mano desde el Studio
      // readOnly: true, 
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "status",
      media: "photo",
    },
    prepare(selection) {
      const { title, subtitle, media } = selection;
      const statusMap: Record<string, string> = {
        available: "🟢 Disponible",
        busy: "🚚 En Viaje",
      };
      return {
        title: title,
        subtitle: statusMap[subtitle] || subtitle,
        media: media,
      };
    },
  },
});