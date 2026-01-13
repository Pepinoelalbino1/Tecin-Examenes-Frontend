import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import UsuarioExamenes from './components/UsuarioExamenes'
import GestionMinas from './components/GestionMinas'
import VerificarAptitud from './components/VerificarAptitud'
import ResumenAptitud from './components/ResumenAptitud'

function Navigation() {
  const location = useLocation()
  
  const isActive = (path) => location.pathname === path
  return (
    <nav className="bg-navy-900 text-gold-200 shadow-lg dark:bg-navy-800 dark:text-gold-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold">Sistema de Exámenes Médicos</h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/') 
                    ? 'border-gold-400 text-white' 
                    : 'border-transparent text-gold-100 hover:text-white hover:border-gold-200'
                }`}
              >
                Exámenes de Usuarios
              </Link>
              <Link
                to="/minas"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/minas') 
                    ? 'border-gold-400 text-white' 
                    : 'border-transparent text-gold-100 hover:text-white hover:border-gold-200'
                }`}
              >
                Gestión de Minas
              </Link>
              <Link
                to="/verificar"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/verificar') 
                    ? 'border-gold-400 text-white' 
                    : 'border-transparent text-gold-100 hover:text-white hover:border-gold-200'
                }`}
              >
                Verificar Aptitud
              </Link>
              <Link
                to="/resumen"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/resumen') 
                    ? 'border-gold-400 text-white' 
                    : 'border-transparent text-gold-100 hover:text-white hover:border-gold-200'
                }`}
              >
                Resumen General
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <button
              id="theme-toggle"
              aria-label="Toggle dark mode"
              className="ml-4 px-3 py-1 rounded-md bg-transparent border border-gold-300 text-gold-200 hover:opacity-90"
            >
              🌙 / ☀️
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

function App() {
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem('theme') === 'dark'
    } catch (e) {
      return false
    }
  })

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
    const btn = document.getElementById('theme-toggle')
    if (btn) {
      btn.onclick = () => setDark((d) => !d)
    }
  }, [dark])

  return (
    <Router>
      <div className={`min-h-screen bg-navy-50 dark:bg-navy-900`}>
        <Navigation />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<UsuarioExamenes />} />
            <Route path="/minas" element={<GestionMinas />} />
            <Route path="/verificar" element={<VerificarAptitud />} />
            <Route path="/resumen" element={<ResumenAptitud />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
