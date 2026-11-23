export type EstadoEstudiante = 'Activo' | 'Inactivo';

export interface Estudiante {
  id: number;
  nombre: string;
  apellido: string;
  edad: number;
  grado: string;
  correo: string;
  estado: EstadoEstudiante;
  version: number;
}

export interface EstudianteInput {
  nombre: string;
  apellido: string;
  edad: number;
  grado: string;
  correo: string;
  estado: EstadoEstudiante;
  version: number;
}

export interface EstudianteQuery {
  search: string;
  estado: string;
  page: number;
  pageSize: number;
  sortBy: string;
  sortDir: 'asc' | 'desc';
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface GradoCount {
  grado: string;
  cantidad: number;
}

export interface Estadisticas {
  total: number;
  activos: number;
  inactivos: number;
  edadPromedio: number;
  porGrado: GradoCount[];
}
