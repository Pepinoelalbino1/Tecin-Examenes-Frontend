import React, { useState, useEffect } from 'react'
import { getUsuarios, getEstablecimientos, verificarAptitud } from '../services/api'
import { getEstadoColor, getEstadoLabel, getTipoExamenLabel } from '../utils/estadoExamen'

function VerificarAptitud() {
  const [usuarios, setUsuarios] = useState([])
  const [establecimientos, setEstablecimientos] = useState([])
  const [selectedUsuario, setSelectedUsuario] = useState(null)
  const [selectedEstablecimiento, setSelectedEstablecimiento] = useState(null)
  const [aptitud, setAptitud] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [usuarioSearch, setUsuarioSearch] = useState('')
  const [showUsuarioDropdown, setShowUsuarioDropdown] = useState(false)
  const [establecimientoSearch, setEstablecimientoSearch] = useState('')
  const [showEstDropdown, setShowEstDropdown] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [usuariosRes, establecimientosRes] = await Promise.all([
        getUsuarios(),
        getEstablecimientos()
      ])
      setUsuarios(usuariosRes.data)
      setEstablecimientos(establecimientosRes.data)
    } catch (err) {
      setError('Error al cargar datos: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  const handleVerificar = async () => {
    if (!selectedUsuario || !selectedEstablecimiento) {
      setError('Por favor seleccione un usuario y un establecimiento')
      return
    }

    try {
      setError(null)
      setLoading(true)
      const response = await verificarAptitud(selectedUsuario, selectedEstablecimiento)
      setAptitud(response.data)
    } catch (err) {
      setError('Error al verificar aptitud: ' + (err.response?.data?.message || err.message))
      setAptitud(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-navy-900 dark:text-gold-100">Verificación de Aptitud</h1>
        <p className="mt-2 text-sm text-navy-500 dark:text-navy-200">Verifique si un usuario es apto para trabajar en un establecimiento</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-navy-50 dark:bg-navy-800 shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="relative">
            <label className="block text-sm font-medium text-navy-700 dark:text-gold-100 mb-2">Usuario</label>
            <input
              type="text"
              value={usuarioSearch}
              onChange={(e) => { setUsuarioSearch(e.target.value); setShowUsuarioDropdown(true); }}
              onFocus={() => setShowUsuarioDropdown(true)}
              placeholder="Buscar por nombre o documento..."
              disabled={loading}
              className="w-full px-3 py-2 border border-navy-200 dark:border-navy-700 rounded-md shadow-sm focus:outline-none focus:ring-gold-300 focus:border-gold-400 dark:bg-navy-800 dark:text-gold-100"
            />
            {showUsuarioDropdown && (
              <ul className="absolute z-10 mt-1 w-full bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 rounded-md shadow-lg max-h-56 overflow-auto">
                {usuarios.filter(u => (
                  usuarioSearch === '' ||
                  u.nombre.toLowerCase().includes(usuarioSearch.toLowerCase()) ||
                  (u.documento || '').toLowerCase().includes(usuarioSearch.toLowerCase())
                )).map(u => (
                  <li
                    key={u.id}
                    onMouseDown={() => { setSelectedUsuario(u.id); setUsuarioSearch(`${u.nombre} - ${u.documento}`); setShowUsuarioDropdown(false); }}
                    className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-navy-700 cursor-pointer text-sm"
                  >
                    {u.nombre} - {u.documento}
                  </li>
                ))}
                {usuarios.length === 0 && (
                  <li className="px-3 py-2 text-sm text-gray-500">No hay usuarios</li>
                )}
              </ul>
            )}
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-navy-700 dark:text-gold-100 mb-2">Establecimiento (Mina)</label>
            <input
              type="text"
              value={establecimientoSearch}
              onChange={(e) => { setEstablecimientoSearch(e.target.value); setShowEstDropdown(true); }}
              onFocus={() => setShowEstDropdown(true)}
              placeholder="Buscar establecimiento..."
              disabled={loading}
              className="w-full px-3 py-2 border border-navy-200 dark:border-navy-700 rounded-md shadow-sm focus:outline-none focus:ring-gold-300 focus:border-gold-400 dark:bg-navy-800 dark:text-gold-100"
            />
            {showEstDropdown && (
              <ul className="absolute z-10 mt-1 w-full bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 rounded-md shadow-lg max-h-56 overflow-auto">
                {establecimientos.filter(est => (
                  establecimientoSearch === '' ||
                  est.nombre.toLowerCase().includes(establecimientoSearch.toLowerCase())
                )).map(est => (
                  <li
                    key={est.id}
                    onMouseDown={() => { setSelectedEstablecimiento(est.id); setEstablecimientoSearch(est.nombre); setShowEstDropdown(false); }}
                    className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-navy-700 cursor-pointer text-sm"
                  >
                    {est.nombre}
                  </li>
                ))}
                {establecimientos.length === 0 && (
                  <li className="px-3 py-2 text-sm text-gray-500">No hay establecimientos</li>
                )}
              </ul>
            )}
          </div>
        </div>

        <button
          onClick={handleVerificar}
          disabled={loading || !selectedUsuario || !selectedEstablecimiento}
          className="w-full md:w-auto bg-gold-500 hover:bg-gold-600 disabled:bg-navy-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-md text-sm font-medium"
        >
          {loading ? 'Verificando...' : 'Verificar Aptitud'}
        </button>
      </div>

      {aptitud && (
        <div className="bg-navy-50 dark:bg-navy-800 shadow rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-navy-900 dark:text-gold-100 mb-4">Resultado de Verificación</h2>
            <div className="bg-navy-50 dark:bg-navy-900 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-navy-500 dark:text-navy-300">Usuario</p>
                  <p className="text-lg font-semibold text-navy-900 dark:text-gold-100">{aptitud.nombreUsuario}</p>
                </div>
                <div>
                  <p className="text-sm text-navy-500 dark:text-navy-300">Establecimiento</p>
                  <p className="text-lg font-semibold text-navy-900 dark:text-gold-100">{aptitud.nombreEstablecimiento}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-lg font-medium text-navy-700 dark:text-gold-100">Estado:</span>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                aptitud.apto 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {aptitud.apto ? 'APTO' : 'NO APTO'}
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-navy-900 dark:text-gold-100 mb-4">Exámenes Requeridos</h3>
            {aptitud.examenes && aptitud.examenes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-navy-50 dark:bg-navy-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 dark:text-navy-300 uppercase tracking-wider">Tipo de Examen</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 dark:text-navy-300 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 dark:text-navy-300 uppercase tracking-wider">Presente y Vigente</th>
                    </tr>
                  </thead>
                  <tbody className="bg-navy-50 dark:bg-navy-800 divide-y divide-navy-200">
                    {aptitud.examenes.map((examen, index) => (
                      <tr key={index} className="hover:bg-navy-100 dark:hover:bg-navy-800">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-navy-900 dark:text-gold-100">
                          {getTipoExamenLabel(examen.tipoExamen)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {examen.estado ? (
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoColor(examen.estado)}`}>
                              {getEstadoLabel(examen.estado)}
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-navy-100 dark:bg-navy-700 text-navy-800 dark:text-gold-100">
                              No Presente
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {examen.presente ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              ✓ Sí
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              ✗ No
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-navy-500 dark:text-navy-300">Este establecimiento no tiene exámenes requeridos configurados.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default VerificarAptitud
