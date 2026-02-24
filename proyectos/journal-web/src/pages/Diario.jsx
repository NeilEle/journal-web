import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
import { Save, ChevronDown, ChevronUp } from 'lucide-react'
import { db } from '../db/database'

dayjs.locale('es')

const HUMORES = [
  { valor: 'excelente', emoji: '🤩', label: 'Excelente' },
  { valor: 'bien',      emoji: '😊', label: 'Bien'      },
  { valor: 'neutral',   emoji: '😐', label: 'Neutral'   },
  { valor: 'mal',       emoji: '😔', label: 'Mal'       },
  { valor: 'terrible',  emoji: '😢', label: 'Terrible'  },
]

function Diario() {
  const [fechaHoy]               = useState(dayjs().format('YYYY-MM-DD'))
  const [contenido, setContenido]= useState('')
  const [humor, setHumor]        = useState('bien')
  const [guardado, setGuardado]  = useState(false)
  const [entradas, setEntradas]  = useState([])
  const [expandida, setExpandida]= useState(null)

  useEffect(() => {
    cargarEntradas()
    cargarEntradaHoy()
  }, [])

  async function cargarEntradaHoy() {
    const entrada = await db.entradas
      .where('fecha').equals(fechaHoy)
      .first()
    if (entrada) {
      setContenido(entrada.contenido)
      setHumor(entrada.humor)
      setGuardado(true)
    }
  }

  async function cargarEntradas() {
    const data = await db.entradas.toArray()
    setEntradas(data.sort((a, b) => b.fecha.localeCompare(a.fecha)))
  }

  async function guardarEntrada() {
    if (!contenido.trim()) return
    const existente = await db.entradas
      .where('fecha').equals(fechaHoy)
      .first()
    if (existente) {
      await db.entradas.update(existente.id, { contenido, humor })
    } else {
      await db.entradas.add({ fecha: fechaHoy, contenido, humor })
    }
    setGuardado(true)
    cargarEntradas()
  }

  const emojiHumor = (valor) =>
    HUMORES.find(h => h.valor === valor)?.emoji || '😊'

  return (
    <div className="max-w-2xl mx-auto">

      {/* Encabezado */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-amber-900">📖 Diario</h2>
        <p className="text-amber-500 capitalize">
          {dayjs().format('dddd, D [de] MMMM [de] YYYY')}
        </p>
      </div>

      {/* Entrada de hoy */}
      <div className="bg-white border border-amber-100 rounded-2xl p-6 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-amber-900">✍️ Entrada de hoy</h3>
          {guardado && (
            <span className="text-xs text-green-500 font-medium bg-green-50 px-3 py-1 rounded-full">
              ✓ Guardado
            </span>
          )}
        </div>

        {/* Selector de humor */}
        <div className="mb-4">
          <p className="text-xs text-amber-500 font-medium mb-2">¿Cómo te sientes hoy?</p>
          <div className="flex gap-2">
            {HUMORES.map(h => (
              <button
                key={h.valor}
                onClick={() => { setHumor(h.valor); setGuardado(false) }}
                className={`flex flex-col items-center p-2 rounded-xl transition-all flex-1
                  ${humor === h.valor
                    ? 'bg-amber-900 text-white scale-105 shadow-md'
                    : 'bg-amber-50 hover:bg-amber-100'}`}
              >
                <span className="text-xl">{h.emoji}</span>
                <span className="text-xs mt-1">{h.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Área de texto */}
        <textarea
          value={contenido}
          onChange={e => { setContenido(e.target.value); setGuardado(false) }}
          placeholder="Escribe sobre tu día... ¿qué pasó? ¿cómo te sentiste? ¿qué aprendiste?"
          rows={6}
          className="w-full border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-900 placeholder-amber-300 resize-none focus:outline-none focus:ring-2 focus:ring-amber-300 leading-relaxed"
        />

        <button
          onClick={guardarEntrada}
          className="mt-3 w-full bg-amber-900 text-amber-50 rounded-xl py-2 font-semibold flex items-center justify-center gap-2 hover:bg-amber-800 transition-all"
        >
          <Save size={18} /> Guardar entrada
        </button>
      </div>

      {/* Historial */}
      <div>
        <h3 className="font-bold text-amber-900 mb-4">📚 Entradas anteriores</h3>

        {entradas.filter(e => e.fecha !== fechaHoy).length === 0 ? (
          <div className="text-center py-10 text-amber-300">
            <p className="text-4xl mb-2">📝</p>
            <p className="text-sm">Aquí aparecerán tus entradas pasadas.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {entradas
              .filter(e => e.fecha !== fechaHoy)
              .map(entrada => (
                <div
                  key={entrada.id}
                  className="bg-white border border-amber-100 rounded-xl overflow-hidden shadow-sm"
                >
                  <button
                    onClick={() => setExpandida(expandida === entrada.id ? null : entrada.id)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-amber-50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{emojiHumor(entrada.humor)}</span>
                      <div className="text-left">
                        <p className="font-medium text-amber-900 text-sm capitalize">
                          {dayjs(entrada.fecha).format('dddd, D [de] MMMM')}
                        </p>
                        <p className="text-xs text-amber-400">
                          {entrada.contenido.slice(0, 50)}{entrada.contenido.length > 50 ? '...' : ''}
                        </p>
                      </div>
                    </div>
                    {expandida === entrada.id
                      ? <ChevronUp size={16} className="text-amber-400" />
                      : <ChevronDown size={16} className="text-amber-400" />
                    }
                  </button>

                  {expandida === entrada.id && (
                    <div className="px-4 pb-4 pt-1 border-t border-amber-50">
                      <p className="text-sm text-amber-800 leading-relaxed whitespace-pre-wrap">
                        {entrada.contenido}
                      </p>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>

    </div>
  )
}

export default Diario