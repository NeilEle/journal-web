import Dexie from 'dexie'

export const db = new Dexie('JournalWeb')

db.version(1).stores({
  eventos:  '++id, fecha, titulo, color',
  habitos:  '++id, nombre, color, frecuencia',
  registros:'++id, habitoId, fecha, completado',
  gastos:   '++id, fecha, monto, categoria, descripcion, tipo',
  entradas: '++id, fecha, contenido, humor',
})