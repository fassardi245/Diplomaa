import { defineField, defineType } from 'sanity'

export const auditLogType = defineType({
  name: 'auditLog',
  title: 'Registro de Auditoría',
  type: 'document',
  fields: [
    defineField({
      name: 'action',
      title: 'Acción',
      type: 'string',
    }),
    defineField({
      name: 'entityType',
      title: 'Tipo de Entidad',
      type: 'string',
    }),
    defineField({
      name: 'entityId',
      title: 'ID Entidad',
      type: 'string',
    }),
    defineField({
      name: 'userEmail',
      title: 'Usuario',
      type: 'string',
    }),
    defineField({
      name: 'timestamp',
      title: 'Fecha y Hora',
      type: 'datetime',
    }),
    defineField({
      name: 'details',
      title: 'Detalles (JSON)',
      type: 'text', // Usamos 'text' porque es un JSON largo
      rows: 5,
    }),
  ],
  preview: {
    select: {
      title: 'action',
      subtitle: 'entityType',
    },
  },
})