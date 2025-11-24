// =========================================================
// PATRÓN DE DISEÑO COMPOSITE - IMPLEMENTACIÓN SEGURIDAD
// =========================================================

/**
 * 1. COMPONENT (Clase Abstracta)
 * Define la interfaz común para objetos simples (Acciones) y complejos (Grupos).
 */
export abstract class Component {
  constructor(public nombre: string) {}

  // El método polimórfico clave: ¿Tengo este permiso?
  abstract tienePermiso(slugBuscado: string): boolean;
}

/**
 * 2. LEAF (Hoja - Acción)
 * Representa un permiso atómico. No tiene hijos.
 * Ej: "ver_flota", "editar_vehiculo".
 */
export class Accion extends Component {
  constructor(nombre: string, public slug: string) {
    super(nombre);
  }

  tienePermiso(slugBuscado: string): boolean {
    // En una hoja, el permiso existe si el slug coincide exactamente.
    return this.slug === slugBuscado;
  }
}

/**
 * 3. COMPOSITE (Compuesto - Grupo)
 * Representa un Rol que contiene otros componentes (Acciones u otros Grupos).
 * Delega la búsqueda de permisos a sus hijos recursivamente.
 */
export class Grupo extends Component {
  // Lista de hijos (pueden ser Acciones o Grupos)
  private hijos: Component[] = [];

  constructor(nombre: string) {
    super(nombre);
  }

  // Método para agregar hijos al árbol
  agregarHijo(componente: Component) {
    this.hijos.push(componente);
  }

  tienePermiso(slugBuscado: string): boolean {
    // Recorre sus hijos y pregunta si ALGUNO tiene el permiso.
    // Esto funciona recursivamente si hay grupos dentro de grupos.
    return this.hijos.some((hijo) => hijo.tienePermiso(slugBuscado));
  }
}

/**
 * 4. CLIENTE (Usuario)
 * El usuario tiene asignada una LISTA de componentes (Múltiples Roles).
 * Usa el patrón para verificar sus accesos.
 */
export class Usuario {
  constructor(
    public clerkId: string,
    public email: string | null,
    // Un usuario puede tener múltiples roles (Array de Components)
    private rolesAsignados: Component[] 
  ) {}

  /**
   * Método público para verificar seguridad en el Frontend.
   * Recorre todos los grupos asignados al usuario.
   */
  puedo(accion: string): boolean {
    // Si el usuario no tiene roles, no puede hacer nada.
    if (!this.rolesAsignados || this.rolesAsignados.length === 0) {
      return false;
    }

    // Preguntamos a cada Rol/Grupo si tiene el permiso.
    return this.rolesAsignados.some((rol) => rol.tienePermiso(accion));
  }
}