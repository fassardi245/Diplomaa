import { UserIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const userType = defineType({
  name: "usuario",
  title: "Usuario",
  type: "document",
  icon: UserIcon,
  fields: [
    defineField({ name: "clerkId", type: "string"}),
    defineField({ name: "email", type: "string" }),
    
    defineField({
      name: "rolesAsignados", // Le cambié el nombre para que tenga sentido en plural
      title: "Grupos o Permisos Asignados",
      type: "array", // <--- ESTO PERMITE MUCHOS
      of: [
        { 
          type: "reference", 
          // Sigue apuntando a Grupo o Accion (Composite)
          to: [{ type: "grupo" }, { type: "accion" }] 
        }
      ],
      validation: (Rule) => Rule.required().min(1), // Al menos uno
    }),
  ],
  preview: {
    select: {
      title: "email",
      role0: "rolesAsignados.0.nombre",
      role1: "rolesAsignados.1.nombre",
    },
    prepare(selection) {
        const { title, role0, role1 } = selection;
        const subtitle = [role0, role1].filter(Boolean).join(", ") + "...";
        return { title, subtitle };
    }
  },
});