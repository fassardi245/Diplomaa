import { TrolleyIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const productType = defineType({
  name: "product",
  title: "Productos",
  type: "document",
  icon: TrolleyIcon,
  fields: [
    defineField({
      name: "name",
      title: "Nombre del producto",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "images",
      title: "Imágenes del producto",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
    }),
    defineField({
      name: "intro",
      title: "Introducción del producto",
      type: "string",
    }),
    defineField({
      name: "description",
      title: "Descripción",
      type: "string",
    }),
    defineField({
      name: "price",
      title: "Precio",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "discount",
      title: "Descuento",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "categories",
      title: "Categorías",
      type: "array",
      of: [{ type: "reference", to: { type: "category" } }],
    }),
    defineField({
      name: "stock",
      title: "Stock disponible",
      type: "number",
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: "status",
      title: "Estado del producto",
      type: "string",
      options: {
        list: [
          { title: "Nuevo", value: "new" },
          { title: "Destacado", value: "hot" },
          { title: "En oferta", value: "sale" },
        ],
      },
    }),
    defineField({
      name: "variant",
      title: "Tipo de producto",
      type: "string",
      options: {
        list: [
          { title: "Remera", value: "remera" },
          { title: "Campera", value: "campera" },
          { title: "Pantalón", value: "pantalon" },
          { title: "Buzo", value: "buzo" },
          { title: "Short", value: "short" },
          { title: "Otros", value: "otros" },
        ],
      },
    }),
  ],
  preview: {
    select: {
      title: "name",
      media: "images",
      subtitle: "price",
    },
    prepare(selection) {
      const { title, subtitle, media } = selection;
      const image = media && media[0];
      return {
        title: title,
        subtitle: `$${subtitle}`,
        media: image,
      };
    },
  },
});
