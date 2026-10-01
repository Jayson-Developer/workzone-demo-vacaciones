/* Datos mock — Mantenimiento de Asistentes Exec (relación Director - Asistente) */

export type EstadoRelacion = 'Activo' | 'Inactivo';

export interface AsistenteRelacion {
  id: string;
  director: string;
  areas: string[];
  asistente: string;
  estado: EstadoRelacion;
}

export interface DirectorExec {
  name: string;
  areas: string[];
}

export const DIRECTORES_EXEC: DirectorExec[] = [
  { name: 'Carlos Vargas',   areas: ['Dirección General', 'Operaciones', 'Finanzas'] },
  { name: 'Ana Beltrán',     areas: ['Marketing', 'Ventas'] },
  { name: 'Luis Salazar',      areas: ['Recursos Humanos'] },
  { name: 'Patricia Salas',  areas: ['Tecnología', 'Innovación'] },
  { name: 'Jorge Medina',    areas: ['Legal', 'Regulatorio'] },
];

export const ASISTENTES_EXEC: string[] = [
  'Maribel Castro',
  'Pedro Pérez',
  'Lucía Díaz',
  'Rosa Quispe',
  'Andrés Vela',
];

export const RELACIONES_INICIALES: AsistenteRelacion[] = [
  { id: 'rel-1', director: 'Carlos Vargas', areas: ['Dirección General', 'Operaciones', 'Finanzas'], asistente: 'Maribel Castro', estado: 'Activo' },
  { id: 'rel-2', director: 'Ana Beltrán',   areas: ['Marketing', 'Ventas'],                           asistente: 'Pedro Pérez',    estado: 'Activo' },
  { id: 'rel-3', director: 'Luis Salazar',    areas: ['Recursos Humanos'],                              asistente: 'Lucía Díaz',     estado: 'Inactivo' },
];

const STORAGE_KEY = 'wz_asistentes_exec';

export const loadRelaciones = (): AsistenteRelacion[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return RELACIONES_INICIALES;
  try {
    return JSON.parse(raw) as AsistenteRelacion[];
  } catch {
    return RELACIONES_INICIALES;
  }
};

export const saveRelaciones = (rows: AsistenteRelacion[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
};

export const getInitials = (name: string): string =>
  name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('');
