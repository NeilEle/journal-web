import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
import { db } from '../db/database'

dayjs.locale('es')

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

const COLORES = [
  { valor: 'bg-red-400',    texto: 'text-red-400',    nombre: 'Rojo'    },
  { valor: 'bg-blue-400',   texto: 'text-blue-400',   nombre: 'Azul'    },
  { valor: 'bg-green-400',  texto: 'text-green-400',  nombre: 'Verde'   },
  { valor: 'bg-purple-400', texto: 'text-purple-400', nombre: 'Morado'  },
  { valor: 'bg-amber-400',  texto: 'text-amber-400',  nombre: 'Naranja' },
]

function Calendario() {
  const [mesActual, setMesActual]     = useState(dayjs())
  const [eventos, setEventos]         = useState([])
  const [modalAbierto, setModal]      = useState(false)
  const [diaSeleccionado, setDia]     = useState(null)
  const [nuevoTitulo, setTitulo]      = useState('')
  const [nuevoColor, setColor]        = useState(COLORES[0].valor)

  const hoy = dayjs()

  // Carga eventos del mes actual
  useEffect(() => {
    cargarEventos()
  }, [mesActual])

  async function cargarEventos() {
    const inicio = mesActual.startOf('month').format('YYYY-MM-DD')
    const fin    = mesActual.endOf('month').format('YYYY-MM-DD')
    const data   = await db.eventos
      .where('fecha').between(inicio, fin, true, true)
      .toArray()
    setEventos(data)
  }

  async function agregarEvento() {
    if (!nuevoTitulo.trim()) return
    const fecha = mesActual.date(diaSeleccionado).format('YYYY-MM-DD')
    await db.eventos.add({ fecha, titulo: nuevoTitulo, color: nuevoColor })
    setTitulo('')
    setColor(COLORES[0].valor)
    setModal(false)
    cargarEventos()
  }

  async function eliminarEvento(id) {
    await db.eventos.delete(id)
    cargarEventos()
  }

  const primerDia   = mesActual.startOf('month')
  const totalDias   = mesActual.daysInMonth()
  const offsetInicio = (primerDia.day() + 6) % 7

  const dias = []
  for (let i = 0; i < offsetInicio; i++) dias.push(null)
  for (let i = 1; i <= totalDias; i++)   dias.push(i)

  const esHoy = (dia) =>
    dia &&
    hoy.date() === dia &&
    hoy.month() === mesActual.month() &&
    hoy.year() === mesActual.year()

  const eventosDelDia = (dia) => {
    if (!dia) return []
    const fecha = mesActual.date(dia).format('YYYY-MM-DD')
    return eventos.filter(e => e.fecha === fecha)
  }

  const abrirModal = (dia) => {
    setDia(dia)
    setModal(true)
  }

  return (
    <div className="max-w-2xl mx-auto">

      {/* Encabezado */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => setMesActual(m => m.subtract(1, 'month'))}
          className="p-2 rounded-full hover:bg-amber-200 transition-all">
          <ChevronLeft size={24} className="text-amber-900" />
        </button>
        <div className="text-center">
          <h2 className="text-3xl font-bold text-amber-900 capitalize">
            {mesActual.format('MMMM')}
          </h2>
          <p className="text-amber-600 text-sm">{mesActual.format('YYYY')}</p>
        </div>
        <button onClick={() => setMesActual(m => m.add(1, 'month'))}
          className="p-2 rounded-full hover:bg-amber-200 transition-all">
          <ChevronRight size={24} className="text-amber-900" />
        </button>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 mb-2">
        {DIAS.map(dia => (
          <div key={dia} className="text-center text-xs font-bold text-amber-500 py-2 uppercase tracking-wider">
            {dia}
          </div>
        ))}
      </div>

      {/* Cuadrícula */}
      <div className="grid grid-cols-7 gap-1">
        {dias.map((dia, i) => (
          <div
            key={i}
            onClick={() => dia && abrirModal(dia)}
            className={`
              min-h-14 p-1 rounded-xl flex flex-col transition-all
              ${!dia ? '' : esHoy(dia)
                ? 'bg-amber-900 text-amber-50 shadow-md'
                : 'hover:bg-amber-100 text-amber-800 cursor-pointer'
              }
            `}
          >
            <span className={`text-sm font-bold px-1 ${esHoy(dia) ? 'text-amber-50' : ''}`}>
              {dia}
            </span>
            <div className="flex flex-col gap-0.5 mt-0.5">
              {eventosDelDia(dia).slice(0, 2).map(ev => (
                <div key={ev.id} className={`${ev.color} text-white text-xs rounded px-1 truncate`}>
                  {ev.titulo}
                </div>
              ))}
              {eventosDelDia(dia).length > 2 && (
                <span className="text-xs text-amber-400">+{eventosDelDia(dia).length - 2} más</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Hoy */}
      <div className="mt-6 text-center text-sm text-amber-500">
        Hoy es <span className="font-semibold text-amber-700">{hoy.format('dddd, D [de] MMMM [de] YYYY')}</span>
      </div>

      {/* Modal agregar evento */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-80 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-amber-900 text-lg">
                {diaSeleccionado} de {mesActual.format('MMMM')}
              </h3>
              <button onClick={() => setModal(false)}>
                <X size={20} className="text-amber-400 hover:text-amber-700" />
              </button>
            </div>

            {/* Eventos existentes */}
            {eventosDelDia(diaSeleccionado).length > 0 && (
              <div className="mb-4 flex flex-col gap-2">
                {eventosDelDia(diaSeleccionado).map(ev => (
                  <div key={ev.id} className="flex items-center justify-between">
                    <span className={`${ev.color} text-white text-sm rounded-lg px-3 py-1 flex-1 mr-2`}>
                      {ev.titulo}
                    </span>
                    <button onClick={() => eliminarEvento(ev.id)}>
                      <X size={16} className="text-red-400 hover:text-red-600" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Nuevo evento */}
            <input
              type="text"
              placeholder="Nombre del evento..."
              value={nuevoTitulo}
              onChange={e => setTitulo(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && agregarEvento()}
              className="w-full border border-amber-200 rounded-xl px-4 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-amber-300"
            />

            {/* Selector de color */}
            <div className="flex gap-2 mb-4">
              {COLORES.map(c => (
                <button
                  key={c.valor}
                  onClick={() => setColor(c.valor)}
                  className={`w-7 h-7 rounded-full ${c.valor} transition-all ${nuevoColor === c.valor ? 'ring-2 ring-offset-2 ring-amber-900 scale-110' : ''}`}
                />
              ))}
            </div>

            <button
              onClick={agregarEvento}
              className="w-full bg-amber-900 text-amber-50 rounded-xl py-2 font-semibold flex items-center justify-center gap-2 hover:bg-amber-800 transition-all"
            >
              <Plus size={18} /> Agregar evento
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

export default Calendario