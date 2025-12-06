import { MasterDetailIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const logType = defineType({
  name: "auditLog", // <--- IMPORTANTE: Coincide con _type: 'auditLog' de tu código
  title: "Registro de Auditoría",
  type: "document",
  icon: MasterDetailIcon,
  readOnly: true, 
  fields: [
    defineField({
      name: "action",
      title: "Acción",
      type: "string", // Ej: "CREAR", "ELIMINAR"
    }),
    defineField({
      name: "entityType",
      title: "Tipo de Entidad",
      type: "string", // Ej: "Producto"
    }),
    defineField({
      name: "entityId",
      title: "ID Entidad",
      type: "string",
    }),
    defineField({
      name: "userEmail",
      title: "Usuario",
      type: "string", 
    }),
    defineField({
      name: "changes",
      title: "Detalles del Cambio (JSON)",
      type: "text", // Usamos text porque tu código guarda un JSON.stringify
      rows: 3
    }),
    defineField({
      name: "timestamp",
      title: "Fecha y Hora",
      type: "datetime",
    }),
    defineField({
      name: "ipAddress",
      title: "IP",
      type: "string",
    }),
  ],
  preview: {
    select: {
      title: "action",
      subtitle: "userEmail",
      entity: "entityType",
      date: "timestamp"
    },
    prepare({ title, subtitle, entity, date }) {
      return {
        title: `[${entity}] ${title}`,
        subtitle: `${subtitle} - ${new Date(date).toLocaleDateString()}`
      };
    },
  },
});