// src/types/index.ts

export interface Usuario {
  id?: string; // El UID de Firebase Auth
  nombre: string;
  email: string;
  createdAt?: string; // Lo añadimos en el registro de la Fase 1
}

export interface Evento {
  id?: string; // El ID del documento en Firestore
  titulo: string;
  descripcion: string;
  fecha: string; // Formato YYYY-MM-DD
  hora: string; // Formato HH:mm
  ubicacion: string;
  creadorId: string;
  asistentes: string[]; // Arreglo de strings (IDs de los usuarios que confirman)
}

export interface Comentario {
  id?: string;
  usuarioId: string; // ID del usuario que comenta
  texto: string;
  calificacion: number; // 1 a 5
}
