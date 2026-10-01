export type SpaceId = 'mis-vacaciones' | 'aprobaciones' | 'reportes';

export type PageId =
  | 'inicio'
  | 'solicitar-vacaciones'
  | 'mis-solicitudes'
  | 'solicitudes-pendientes'
  | 'gestion-anulaciones'
  | 'reporte-vacaciones'
  | 'trazabilidad'
  | 'mantenimiento-asistentes';

export type NavigateFn = (pageId: PageId, spaceId?: SpaceId) => void;
