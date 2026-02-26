import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarDays,
  CheckSquare,
  Wallet,
  BookOpen,
} from 'lucide-react'

const links = [
  { to: '/',           icon: LayoutDashboard, label: 'Inicio'     },
  { to: '/calendario', icon: CalendarDays,    label: 'Calendario' },
  { to: '/habitos',    icon: CheckSquare,     label: 'Hábitos'    },
  { to: '/gastos',     icon: Wallet,          label: 'Gastos'     },
  { to: '/diario',     icon: BookOpen,        label: 'Diario'     },
]

function Sidebar() {
  return (
    <>
      {/* SIDEBAR — solo visible en escritorio */}
      <aside className="hidden md:flex w-64 min-h-screen bg-amber-900 text-amber-50 flex-col p-6 gap-1">
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

      {/* BARRA INFERIOR — solo visible en móvil */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-amber-900 z-50 flex justify-around items-center px-2 py-2 shadow-lg border-t border-amber-800">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all
               ${isActive
                 ? 'text-amber-50'
                 : 'text-amber-500'}`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-amber-700' : ''}`}>
                  <Icon size={20} />
                </div>
                <span className="text-xs">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  )
}

export default Sidebar