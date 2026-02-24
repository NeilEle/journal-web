import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
import { useNavigate } from 'react-router-dom'
import { db } from '../db/database'

dayjs.locale('es')

const HUMORES = [
  { valor: 'excelente', emoji: '🤩' },
  { valor: 'bien',      emoji: '😊' },
  { valor: 'neutral',   emoji: '😐' },
  { valor: 'mal',       emoji: '😔' },
  { valor: 'terrible',  emoji: '😢' },
]

function Dashboard() {
  const navigate   = useNavigate()
  const hoy        = dayjs()
  const [resumen, setResumen] = useState({
    eventos: [],
    habitos: { total: 0, completados: 0 },
    balance: 0,
    humor: null,
  })

  useEffect(() => {
    cargarResumen()
  }, [])

  async function cargarResumen() {
    const fechaHoy = hoy.format('YYYY-MM-DD')

    const eventos = await db.eventos
      .where('fecha').equals(fechaHoy)
      .toArray()

    const habitos = await db.habitos.toArray()
    const registrosHoy = await db.registros
      .where('fecha').equals(fechaHoy)
      .toArray()

    const ingresos = await db.gastos
      .where('fecha').between(
        hoy.startOf('month').format('YYYY-MM-DD'),
        hoy.endOf('month').format('YYYY-MM-DD'),
        true, true
      ).toArray()

    const balance = ingresos.reduce((acc, g) =>
      g.tipo === 'ingreso' ? acc + g.monto : acc - g.monto, 0)

    const entradaHoy = await db.entradas
      .where('fecha').equals(fechaHoy)
      .first()

    setResumen({
      eventos,
      habitos: { total: habitos.length, completados: registrosHoy.length },
      balance,
      humor: entradaHoy?.humor || null,
    })
  }

  const emojiHumor = (valor) =>
    HUMORES.find(h => h.valor === valor)?.emoji || null

  return (
    <div className="max-w-2xl mx-auto">

      {/* Saludo */}
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-amber-900">
          {hoy.hour() < 12 ? '🌅' : hoy.hour() < 19 ? '☀️' : '🌙'} Buenos {hoy.hour() < 12 ? 'días' : hoy.hour() < 19 ? 'tardes' : 'noches'}
        </h2>
        <p className="text-amber-500 capitalize text-lg mt-1">
          {hoy.format('dddd, D [de] MMMM [de] YYYY')}
        </p>
      </div>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-2 gap-4 mb-8">

        {/* Eventos hoy */}
        <div
          onClick={() => navigate('/')}
          className="bg-white border border-amber-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <p className="text-3xl mb-2">📅</p>
          <p className="text-2xl font-bold text-amber-900">{resumen.eventos.length}</p>
          <p className="text-sm text-amber-500">evento{resumen.eventos.length !== 1 ? 's' : ''} hoy</p>
          {resumen.eventos.slice(0, 2).map(e => (
            <p key={e.id} className="text-xs text-amber-400 truncate mt-1">· {e.titulo}</p>
          ))}
        </div>

        {/* Hábitos */}
        <div
          onClick={() => navigate('/habitos')}
          className="bg-white border border-amber-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <p className="text-3xl mb-2">✅</p>
          <p className="text-2xl font-bold text-amber-900">
            {resumen.habitos.completados}/{resumen.habitos.total}
          </p>
          <p className="text-sm text-amber-500">hábitos completados</p>
          <div className="mt-2 h-2 bg-amber-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full transition-all"
              style={{
                width: resumen.habitos.total > 0
                  ? `${(resumen.habitos.completados / resumen.habitos.total) * 100}%`
                  : '0%'
              }}
            />
          </div>
        </div>

        {/* Balance */}
        <div
          onClick={() => navigate('/gastos')}
          className="bg-white border border-amber-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <p className="text-3xl mb-2">💸</p>
          <p className={`text-2xl font-bold ${resumen.balance >= 0 ? 'text-green-500' : 'text-red-400'}`}>
            {resumen.balance.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
          </p>
          <p className="text-sm text-amber-500">balance del mes</p>
        </div>

        {/* Diario */}
        <div
          onClick={() => navigate('/diario')}
          className="bg-white border border-amber-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <p className="text-3xl mb-2">
            {resumen.humor ? emojiHumor(resumen.humor) : '📖'}
          </p>
          <p className="text-2xl font-bold text-amber-900">
            {resumen.humor ? 'Escrito' : 'Pendiente'}
          </p>
          <p className="text-sm text-amber-500">entrada de hoy</p>
        </div>

      </div>

      {/* Frase inspiracional */}
      <div className="bg-amber-900 text-amber-50 rounded-2xl p-6 text-center">
        <p className="text-lg font-medium italic">
          "Un pequeño paso cada día construye grandes cambios."
        </p>
        <p className="text-amber-400 text-sm mt-2">— Journal Web</p>
      </div>

    </div>
  )
}

export default Dashboard