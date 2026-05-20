// Formatea "YYYY-MM-DD" a "19 de mayo de 2025"
export function formatFecha(fecha: string): string {
  const [year, month, day] = fecha.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Formatea "HH:mm" (24h) a "3:30 PM"
export function formatHora(hora: string): string {
  const [h, m] = hora.split(":").map(Number);
  const date = new Date();
  date.setHours(h, m, 0, 0);
  return date.toLocaleTimeString("es-ES", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// Valida que la cadena tenga formato de email básico
export function esEmailValido(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// Devuelve true si la fecha (Date) es hoy o en el futuro
export function esFechaFutura(date: Date): boolean {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const copia = new Date(date);
  copia.setHours(0, 0, 0, 0);
  return copia >= hoy;
}
