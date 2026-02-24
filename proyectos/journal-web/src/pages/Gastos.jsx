import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
import { Plus, X, TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { db } from '../db/database'

dayjs.locale('es')

const CATEGORIAS = [
  { nombre: 'Alimentación', emoji: '🍔' },
  { nombre: 'Transporte',   emoji: '🚌' },
  { nombre: 'Salud',        emoji: '💊' },
  { nombre: 'Entretenimiento', emoji: '🎬' },
  { nombre: 'Educación',    emoji: '📚' },
  { nombre: 'Ropa',         emoji: '👗' },
  { nombre: 'Hogar',        emoji: '🏠' },
  { nombre: 'Trabajo',      emoji: '💼' },
  { nombre: 'Ahorro',       emoji: '🐷' },
  { nombre: 'Otro',         emoji: '📦' },
]

function Gastos() {
  const [mesActual]            = useState(dayjs())
  const [gastos, setGastos]    = useState([])
  const [modalAbierto, setModal] = useState(false)
  const [tipo, setTipo]        = useState('gasto')
  const [monto, setMonto]      = useState('')
  const [descripcion, setDesc] = useState('')
  const [categoria, setCat]    = useState(CATEGORIAS[0].nombre)
  const [fecha, setFecha]      = useState(dayjs().format('YYYY-MM-DD'))

  useEffect(() => {
    cargarGastos()
  }, [mesActual])

  async function cargarGastos() {
    const data = await db.gastos
      .where('fecha')
      .between(
        mesActual.startOf('month').format('YYYY-MM-DD'),
        mesActual.endOf('month').format('YYYY-MM-DD'),
        true, true
      )
      .toArray()
    setGastos(data.sort((a, b) => b.fecha.localeCompare(a.fecha)))
  }

  async function agregarGasto() {
    if (!monto || isNaN(monto) || Number(monto) <= 0) return
    await db.gastos.add({
      fecha,
      monto: Number(monto),
      categoria,
      descripcion,
      tipo,
    })
    setMonto('')
    setDesc('')
    setCat(CATEGORIAS[0].nombre)
    setFecha(dayjs().format('YYYY-MM-DD'))
    setTipo('gasto')
    setModal(false)
    cargarGastos()
  }

  async function eliminarGasto(id) {
    await db.gastos.delete(id)
    cargarGastos()
  }

  const totalIngresos = gastos
    .filter(g => g.tipo === 'ingreso')
    .reduce((acc, g) => acc + g.monto, 0)

  const totalGastos = gastos
    .filter(g => g.tipo === 'gasto')
    .reduce((acc, g) => acc + g.monto, 0)

  const balance = totalIngresos - totalGastos

  const formatMonto = (n) =>
    n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })

  const emojiCategoria = (nombre) =>
    CATEGORIAS.find(c => c.nombre === nombre)?.emoji || '📦'

  return (
    <div className="max-w-2xl mx-auto">

      {/* Encabezado */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-amber-900">💸 Gastos</h2>
          <p className="text-amber-500 capitalize">{mesActual.format('MMMM YYYY')}</p>
        </div>
        <button
          onClick={() => setModal(true)}
          className="bg-amber-900 text-amber-50 px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-amber-800 transition-all"
        >
          <Plus size={18} /> Agregar
        </button>
      </div>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} className="text-green-500" />
            <span className="text-xs text-green-600 font-medium">Ingresos</span>
          </div>
          <p className="text-xl font-bold text-green-600">{formatMonto(totalIngresos)}</p>
        </div>

        <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown size={16} className="text-red-400" />
            <span className="text-xs text-red-500 font-medium">Gastos</span>
          </div>
          <p className="text-xl font-bold text-red-500">{formatMonto(totalGastos)}</p>
        </div>

        <div className={`border rounded-2xl p-4 ${balance >= 0 ? 'bg-blue-50 border-blue-100' : 'bg-red-50 border-red-100'}`}>
          <div className="flex items-center gap-2 mb-1">
            <Wallet size={16} className={balance >= 0 ? 'text-blue-500' : 'text-red-400'} />
            <span className={`text-xs font-medium ${balance >= 0 ? 'text-blue-600' : 'text-red-500'}`}>Balance</span>
          </div>
          <p className={`text-xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-500'}`}>
            {formatMonto(balance)}
          </p>
        </div>
      </div>

      {/* Lista de movimientos */}
      {gastos.length === 0 ? (
        <div className="text-center py-20 text-amber-300">
          <p className="text-6xl mb-4">💰</p>
          <p className="text-lg">Sin movimientos este mes.</p>
          <p className="text-sm">¡Agrega tu primer registro!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {gastos.map(g => (
            <div
              key={g.id}
              className="bg-white border border-amber-100 rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm"
            >
              <span className="text-2xl">{emojiCategoria(g.categoria)}</span>
              <div className="flex-1">
                <p className="font-medium text-amber-900 text-sm">
                  {g.descripcion || g.categoria}
                </p>
                <p className="text-xs text-amber-400">
                  {g.categoria} · {dayjs(g.fecha).format('D MMM')}
                </p>
              </div>
              <span className={`font-bold text-sm ${g.tipo === 'ingreso' ? 'text-green-500' : 'text-red-400'}`}>
                {g.tipo === 'ingreso' ? '+' : '-'}{formatMonto(g.monto)}
              </span>
              <button onClick={() => eliminarGasto(g.id)}>
                <X size={16} className="text-amber-200 hover:text-red-400 transition-all" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-80 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-amber-900 text-lg">Nuevo movimiento</h3>
              <button onClick={() => setModal(false)}>
                <X size={20} className="text-amber-400 hover:text-amber-700" />
              </button>
            </div>

            {/* Tipo */}
            <div className="flex rounded-xl overflow-hidden border border-amber-200 mb-4">
              <button
                onClick={() => setTipo('gasto')}
                className={`flex-1 py-2 text-sm font-semibold transition-all
                  ${tipo === 'gasto' ? 'bg-red-400 text-white' : 'text-amber-400 hover:bg-amber-50'}`}
              >
                Gasto
              </button>
              <button
                onClick={() => setTipo('ingreso')}
                className={`flex-1 py-2 text-sm font-semibold transition-all
                  ${tipo === 'ingreso' ? 'bg-green-400 text-white' : 'text-amber-400 hover:bg-amber-50'}`}
              >
                Ingreso
              </button>
            </div>

            {/* Monto */}
            <input
              type="number"
              placeholder="Monto"
              value={monto}
              onChange={e => setMonto(e.target.value)}
              className="w-full border border-amber-200 rounded-xl px-4 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-amber-300"
            />

            {/* Descripción */}
            <input
              type="text"
              placeholder="Descripción (opcional)"
              value={descripcion}
              onChange={e => setDesc(e.target.value)}
              className="w-full border border-amber-200 rounded-xl px-4 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-amber-300"
            />

            {/* Categoría */}
            <select
              value={categoria}
              onChange={e => setCat(e.target.value)}
              className="w-full border border-amber-200 rounded-xl px-4 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-amber-300"
            >
              {CATEGORIAS.map(c => (
                <option key={c.nombre} value={c.nombre}>
                  {c.emoji} {c.nombre}
                </option>
              ))}
            </select>

            {/* Fecha */}
            <input
              type="date"
              value={fecha}
              onChange={e => setFecha(e.target.value)}
              className="w-full border border-amber-200 rounded-xl px-4 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-amber-300"
            />

            <button
              onClick={agregarGasto}
              className="w-full bg-amber-900 text-amber-50 rounded-xl py-2 font-semibold flex items-center justify-center gap-2 hover:bg-amber-800 transition-all"
            >
              <Plus size={18} /> Guardar
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

export default Gastos