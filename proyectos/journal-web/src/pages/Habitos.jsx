import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
import { Plus, X, Check } from 'lucide-react'
import { db } from '../db/database'

dayjs.locale('es')

const COLORES = [
  { bg: 'bg-red-400',    ring: 'ring-red-400',    hex: '#f87171' },
  { bg: 'bg-blue-400',   ring: 'ring-blue-400',   hex: '#60a5fa' },
  { bg: 'bg-green-400',  ring: 'ring-green-400',  hex: '#4ade80' },
  { bg: 'bg-purple-400', ring: 'ring-purple-400', hex: '#c084fc' },
  { bg: 'bg-amber-400',  ring: 'ring-amber-400',  hex: '#fbbf24' },
  { bg: 'bg-pink-400',   ring: 'ring-pink-400',   hex: '#f472b6' },
]

function Habitos() {
  const [mesActual]              = useState(dayjs())
  const [habitos, setHabitos]    = useState([])
  const [registros, setRegistros]= useState([])
  const [modalAbierto, setModal] = useState(false)
  const [nuevoNombre, setNombre] = useState('')
  const [nuevoColor, setColor]   = useState(COLORES[0].bg)

  const totalDias  = mesActual.daysInMonth()
  const diasArray  = Array.from({ length: totalDias }, (_, i) => i + 1)

  useEffect(() => {
    cargarDatos()
  }, [])

  async function cargarDatos() {
    const h = await db.habitos.toArray()
    const r = await db.registros
      .where('fecha')
      .between(
        mesActual.startOf('month').format('YYYY-MM-DD'),
        mesActual.endOf('month').format('YYYY-MM-DD'),
        true, true
      )
      .toArray()
    setHabitos(h)
    setRegistros(r)
  }

  async function agregarHabito() {
    if (!nuevoNombre.trim()) return
    await db.habitos.add({ nombre: nuevoNombre, color: nuevoColor })
    setNombre('')
    setColor(COLORES[0].bg)
    setModal(false)
    cargarDatos()
  }

  async function eliminarHabito(id) {
    await db.habitos.delete(id)
    await db.registros.where('habitoId').equals(id).delete()
    cargarDatos()
  }

  async function toggleDia(habitoId, dia) {
    const fecha = mesActual.date(dia).format('YYYY-MM-DD')
    const existente = registros.find(
      r => r.habitoId === habitoId && r.fecha === fecha
    )
    if (existente) {
      await db.registros.delete(existente.id)
    } else {
      await db.registros.add({ habitoId, fecha, completado: 1 })
    }
    cargarDatos()
  }

  function estaCompletado(habitoId, dia) {
    const fecha = mesActual.date(dia).format('YYYY-MM-DD')
    return registros.some(r => r.habitoId === habitoId && r.fecha === fecha)
  }

  function progreso(habitoId) {
    const completados = registros.filter(r => r.habitoId === habitoId).length
    return Math.round((completados / totalDias) * 100)
  }

  const hoy = dayjs().date()

  return (
    <div className="max-w-full">

      {/* Encabezado */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-amber-900">✅ Hábitos</h2>
          <p className="text-amber-500 capitalize">{mesActual.format('MMMM YYYY')}</p>
        </div>
        <button
          onClick={() => setModal(true)}
          className="bg-amber-900 text-amber-50 px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-amber-800 transition-all"
        >
          <Plus size={18} /> Nuevo hábito
        </button>
      </div>

      {/* Tabla de hábitos */}
      {habitos.length === 0 ? (
        <div className="text-center py-20 text-amber-300">
          <p className="text-6xl mb-4">🌱</p>
          <p className="text-lg">Aún no tienes hábitos.</p>
          <p className="text-sm">¡Agrega tu primero!</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-amber-100 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-amber-900 text-amber-50">
                <th className="text-left px-4 py-3 rounded-tl-2xl min-w-36">Hábito</th>
                {diasArray.map(d => (
                  <th
                    key={d}
                    className={`w-8 text-center py-3 text-xs font-medium
                      ${d === hoy && mesActual.month() === dayjs().month()
                        ? 'text-amber-300 font-bold'
                        : 'text-amber-300'}`}
                  >
                    {d}
                  </th>
                ))}
                <th className="px-4 py-3 rounded-tr-2xl text-amber-300">%</th>
              </tr>
            </thead>
            <tbody>
              {habitos.map((habito, idx) => (
                <tr
                  key={habito.id}
                  className={idx % 2 === 0 ? 'bg-white' : 'bg-amber-50'}
                >
                  {/* Nombre del hábito */}
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${habito.color}`} />
                      <span className="font-medium text-amber-900 truncate max-w-28">
                        {habito.nombre}
                      </span>
                      <button
                        onClick={() => eliminarHabito(habito.id)}
                        className="ml-auto text-amber-200 hover:text-red-400 transition-all"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </td>

                  {/* Días */}
                  {diasArray.map(dia => {
                    const completado = estaCompletado(habito.id, dia)
                    const esHoy = dia === hoy && mesActual.month() === dayjs().month()
                    return (
                      <td key={dia} className="text-center py-2">
                        <button
                          onClick={() => toggleDia(habito.id, dia)}
                          className={`
                            w-6 h-6 rounded-md mx-auto flex items-center justify-center transition-all
                            ${completado
                              ? `${habito.color} text-white shadow-sm`
                              : esHoy
                                ? 'border-2 border-amber-400 hover:bg-amber-100'
                                : 'border border-amber-100 hover:bg-amber-100'
                            }
                          `}
                        >
                          {completado && <Check size={12} />}
                        </button>
                      </td>
                    )
                  })}

                  {/* Porcentaje */}
                  <td className="px-4 py-2 text-center">
                    <span className={`text-xs font-bold ${
                      progreso(habito.id) >= 70
                        ? 'text-green-500'
                        : progreso(habito.id) >= 40
                          ? 'text-amber-500'
                          : 'text-red-400'
                    }`}>
                      {progreso(habito.id)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal nuevo hábito */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-80 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-amber-900 text-lg">Nuevo hábito</h3>
              <button onClick={() => setModal(false)}>
                <X size={20} className="text-amber-400 hover:text-amber-700" />
              </button>
            </div>

            <input
              type="text"
              placeholder="Ej: Meditar, Leer, Ejercicio..."
              value={nuevoNombre}
              onChange={e => setNombre(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && agregarHabito()}
              className="w-full border border-amber-200 rounded-xl px-4 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-amber-300"
            />

            <p className="text-xs text-amber-500 mb-2 font-medium">Color del hábito</p>
            <div className="flex gap-2 mb-6">
              {COLORES.map(c => (
                <button
                  key={c.bg}
                  onClick={() => setColor(c.bg)}
                  className={`w-8 h-8 rounded-full ${c.bg} transition-all
                    ${nuevoColor === c.bg ? 'ring-2 ring-offset-2 ring-amber-900 scale-110' : ''}`}
                />
              ))}
            </div>

            <button
              onClick={agregarHabito}
              className="w-full bg-amber-900 text-amber-50 rounded-xl py-2 font-semibold flex items-center justify-center gap-2 hover:bg-amber-800 transition-all"
            >
              <Plus size={18} /> Crear hábito
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

export default Habitos