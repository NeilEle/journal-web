import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  Wallet,
  BookOpen,
} from 'lucide-react'

const links = [
  { to: '/',         icon: LayoutDashboard, label: 'Inicio'     },
  { to: '/calendario', icon: CalendarDays,  label: 'Calendario' },
  { to: '/habitos',  icon: CheckSquare,     label: 'Hábitos'    },
  { to: '/gastos',   icon: Wallet,          label: 'Gastos'     },
  { to: '/diario',   icon: BookOpen,        label: 'Diario'     },
]

function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-amber-900 text-amber-50 flex flex-col p-6 gap-1">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">📓 Journal Web</h1>
        <p className="text-amber-400 text-xs mt-1">Tu bullet journal digital</p>
      </div>

      {links.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm
             ${isActive
               ? 'bg-amber-700 font-semibold shadow-inner'
               : 'hover:bg-amber-800 text-amber-200'}`
          }
        >
          <Icon size={18} />
          {label}
        </NavLink>
      ))}

      <div className="mt-auto pt-6 border-t border-amber-800">
        <p className="text-xs text-amber-500 text-center">
          {new Date().getFullYear()} · Journal Web
        </p>
      </div>
    </aside>
  )
}

export default Sidebar