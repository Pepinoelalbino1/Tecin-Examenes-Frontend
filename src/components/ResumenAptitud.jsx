import React, { useState, useEffect } from 'react'
import { getResumenAptitud } from '../services/api'

function ResumenAptitud() {
  const [resumen, setResumen] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [filterUsuario, setFilterUsuario] = useState('')
  const [filterMina, setFilterMina] = useState('')

  useEffect(() => {
    loadResumen()
  }, [])

  const loadResumen = async () => {
    try {
      setLoading(true)
      const response = await getResumenAptitud()
      setResumen(response.data)
    } catch (err) {
      setError('Error al cargar resumen: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  const filteredResumen = resumen.filter(item => {
    const matchUsuario = filterUsuario === '' || 
      item.nombreUsuario.toLowerCase().includes(filterUsuario.toLowerCase()) ||
      item.documento.toLowerCase().includes(filterUsuario.toLowerCase())
    
    const matchMina = filterMina === '' ||
      item.minas.some(mina => 
        mina.nombreEstablecimiento.toLowerCase().includes(filterMina.toLowerCase())
      )
    
    return matchUsuario && matchMina
  })

  const getAllMinas = () => {
    const minasSet = new Set()
    resumen.forEach(item => {
      item.minas.forEach(mina => {
        minasSet.add(JSON.stringify({ id: mina.establecimientoId, nombre: mina.nombreEstablecimiento }))
      })
    })
    return Array.from(minasSet).map(m => JSON.parse(m))
  }

  const getAptasCount = (minaId) => {
    return resumen.filter(item => 
      item.minas.some(m => m.establecimientoId === minaId && m.apto)
    ).length
  }

  const getTotalUsuarios = () => resumen.length
  const getTotalAptos = () => resumen.filter(item => item.minas.some(m => m.apto)).length

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-navy-900 dark:text-gold-100">Resumen General</h1>
        <p className="mt-2 text-sm text-navy-500 dark:text-navy-200">Vista general de usuarios y minas a las que pueden acceder</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-navy-50 dark:bg-navy-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-gold-500 rounded-md p-3">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-navy-500 dark:text-navy-300 truncate">Total Usuarios</dt>
                <dd className="text-lg font-semibold text-navy-900 dark:text-gold-100">{getTotalUsuarios()}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-navy-50 dark:bg-navy-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-navy-500 dark:text-navy-300 truncate">Usuarios Aptos</dt>
                <dd className="text-lg font-semibold text-navy-900 dark:text-gold-100">{getTotalAptos()}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-navy-50 dark:bg-navy-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-navy-500 dark:text-navy-300 truncate">Total Minas</dt>
                <dd className="text-lg font-semibold text-navy-900 dark:text-gold-100">{getAllMinas().length}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-navy-50 dark:bg-navy-800 shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por Usuario</label>
            <input
              type="text"
              value={filterUsuario}
              onChange={(e) => setFilterUsuario(e.target.value)}
              placeholder="Nombre o documento..."
              className="w-full px-3 py-2 border border-navy-200 dark:border-navy-700 rounded-md shadow-sm focus:outline-none focus:ring-gold-300 focus:border-gold-400 dark:bg-navy-800 dark:text-gold-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por Mina</label>
            <input
              type="text"
              value={filterMina}
              onChange={(e) => setFilterMina(e.target.value)}
              placeholder="Nombre de mina..."
              className="w-full px-3 py-2 border border-navy-200 dark:border-navy-700 rounded-md shadow-sm focus:outline-none focus:ring-gold-300 focus:border-gold-400 dark:bg-navy-800 dark:text-gold-100"
            />
          </div>
        </div>
      </div>

      {/* Tabla de Resumen */}
      <div className="bg-navy-50 dark:bg-navy-800 shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="text-center py-8 text-navy-500 dark:text-navy-300">Cargando...</div>
        ) : filteredResumen.length === 0 ? (
          <div className="text-center py-8 text-navy-500 dark:text-navy-300">No hay datos disponibles</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-navy-200">
              <thead className="bg-navy-50 dark:bg-navy-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 dark:text-navy-300 uppercase tracking-wider">Usuario</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 dark:text-navy-300 uppercase tracking-wider">Documento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 dark:text-navy-300 uppercase tracking-wider">Minas Disponibles</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 dark:text-navy-300 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="bg-navy-50 dark:bg-navy-800 divide-y divide-navy-200">
                {filteredResumen.map((item) => {
                  const minasAptas = item.minas.filter(m => m.apto)
                  const totalMinas = item.minas.length
                  
                  return (
                    <tr key={item.usuarioId} className="hover:bg-navy-100 dark:hover:bg-navy-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-navy-900 dark:text-gold-100">{item.nombreUsuario}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-navy-500 dark:text-navy-300">{item.documento}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {item.minas.map((mina, index) => (
                            <span
                              key={index}
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                mina.apto
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                              title={mina.apto ? 'Apto' : 'No Apto'}
                            >
                              {mina.nombreEstablecimiento}
                              {mina.apto ? ' ✓' : ' ✗'}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <span className="text-navy-600 dark:text-navy-300">
                            {minasAptas.length} de {totalMinas} minas
                          </span>
                          {minasAptas.length > 0 && (
                            <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              Aptas: {minasAptas.length}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default ResumenAptitud
