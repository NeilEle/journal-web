import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Calendario from './pages/Calendario'
import Habitos from './pages/Habitos'
import Gastos from './pages/Gastos'
import Diario from './pages/Diario'

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-amber-50">
        <Sidebar />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-24 md:pb-8">
          <Routes>
            <Route path="/"           element={<Dashboard />}  />
            <Route path="/calendario" element={<Calendario />} />
            <Route path="/habitos"    element={<Habitos />}    />
            <Route path="/gastos"     element={<Gastos />}     />
            <Route path="/diario"     element={<Diario />}     />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App