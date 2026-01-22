import React, { useState, useEffect, useRef } from 'react'
import { getEstablecimientos, createEstablecimiento, updateEstablecimiento, deleteEstablecimiento, getResumenEstablecimientos } from '../services/api'
import { getTipoExamenLabel } from '../utils/estadoExamen'

const TIPOS_EXAMEN = [
  'EXAMEN_MEDICO_GENERAL',
  'EXAMEN_AUDIOMETRICO',
  'EXAMEN_OCUPACIONAL',
  'EXAMEN_PSICOLOGICO',
  'EXAMEN_TOXICOLOGICO',
  'EXAMEN_ESPIRACION',
  'EXAMEN_RADIOLOGICO'
]

function GestionMinas() {
  const [establecimientos, setEstablecimientos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingEstablecimiento, setEditingEstablecimiento] = useState(null)
  const [establecimientoSearch, setEstablecimientoSearch] = useState('')
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    ubicacion: '',
    examenesRequeridos: []
  })

  useEffect(() => {
    loadEstablecimientos()
  }, [])

  const loadEstablecimientos = async () => {
    try {
      setLoading(true)
      const response = await getEstablecimientos()
      setEstablecimientos(response.data)
    } catch (err) {
      setError('Error al cargar establecimientos: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleExamenToggle = (tipoExamen) => {
    setFormData(prev => {
      const examenes = prev.examenesRequeridos || []
      const index = examenes.findIndex(e => e.tipoExamen === tipoExamen)
      
      if (index >= 0) {
        return {
          ...prev,
          examenesRequeridos: examenes.filter((_, i) => i !== index)
        }
      } else {
        return {
          ...prev,
          examenesRequeridos: [...examenes, { tipoExamen, observaciones: '' }]
        }
      }
    })
  }

  const handleExamenObservacionesChange = (tipoExamen, observaciones) => {
    setFormData(prev => {
      const examenes = prev.examenesRequeridos || []
      const index = examenes.findIndex(e => e.tipoExamen === tipoExamen)
      
      if (index >= 0) {
        const newExamenes = [...examenes]
        newExamenes[index] = { ...newExamenes[index], observaciones }
        return {
          ...prev,
          examenesRequeridos: newExamenes
        }
      }
      return prev
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setError(null)
      if (editingEstablecimiento) {
        await updateEstablecimiento(editingEstablecimiento.id, formData)
      } else {
        await createEstablecimiento(formData)
      }
      setShowForm(false)
      setEditingEstablecimiento(null)
      setFormData({
        nombre: '',
        descripcion: '',
        ubicacion: '',
        examenesRequeridos: []
      })
      loadEstablecimientos()
    } catch (err) {
      setError('Error al guardar establecimiento: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleEdit = (establecimiento) => {
    setEditingEstablecimiento(establecimiento)
    setFormData({
      nombre: establecimiento.nombre,
      descripcion: establecimiento.descripcion || '',
      ubicacion: establecimiento.ubicacion || '',
      examenesRequeridos: establecimiento.examenesRequeridos || []
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este establecimiento?')) {
      return
    }

    try {
      await deleteEstablecimiento(id)
      loadEstablecimientos()
    } catch (err) {
      setError('Error al eliminar establecimiento: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingEstablecimiento(null)
    setFormData({
      nombre: '',
      descripcion: '',
      ubicacion: '',
      examenesRequeridos: []
    })
  }

  const isExamenSelected = (tipoExamen) => {
    return formData.examenesRequeridos?.some(e => e.tipoExamen === tipoExamen) || false
  }

  const getExamenObservaciones = (tipoExamen) => {
    const examen = formData.examenesRequeridos?.find(e => e.tipoExamen === tipoExamen)
    return examen?.observaciones || ''
  }

  const handlePrintResumen = async () => {
    try {
      setLoading(true)
      const response = await getResumenEstablecimientos()
      const resumenData = response.data
      
      const html = generarHTMLResumenEstablecimientos(resumenData)
      
      const printWindow = window.open('', '_blank')
      printWindow.document.write(html)
      printWindow.document.close()
      setTimeout(() => {
        printWindow.print()
      }, 250)
    } catch (err) {
      setError('Error al generar resumen: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  const generarHTMLResumenEstablecimientos = (resumenData) => {
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Resumen de Establecimientos y Aptitudes</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; color: #000; }
          .header { margin-bottom: 30px; }
          .header h1 { margin: 0; font-size: 24px; font-weight: bold; }
          .header p { margin: 5px 0 0 0; font-size: 12px; color: #666; }
          .est-section { margin-bottom: 25px; page-break-inside: avoid; border-bottom: 1px solid #ccc; padding-bottom: 15px; }
          .est-header h2 { margin: 0 0 8px 0; font-size: 16px; font-weight: bold; }
          .est-header p { margin: 4px 0 0 0; font-size: 12px; color: #666; }
          .est-info { margin-bottom: 10px; }
          .info-item { margin-bottom: 6px; display: inline-block; width: 100%; }
          .info-label { font-weight: bold; font-size: 11px; color: #333; display: inline-block; width: 180px; }
          .info-value { font-size: 12px; color: #000; }
          .examen-list { margin-top: 10px; }
          .examen-list h4 { margin: 0 0 6px 0; font-size: 12px; font-weight: bold; }
          .examen-badge { display: inline; padding: 0; margin: 0 15px 4px 0; font-size: 12px; color: #000; font-weight: normal; }
          .no-examenes { color: #666; font-style: italic; padding: 8px 0; font-size: 12px; }
          .descripcion { color: #333; font-size: 12px; margin-top: 8px; line-height: 1.4; }
          .footer { text-align: center; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ccc; color: #666; font-size: 11px; }
          @media print { body { margin: 30px; background-color: white; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${resumenData.titulo}</h1>
          <p>Generado el ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' })} a las ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
    `

    if (resumenData.establecimientos && resumenData.establecimientos.length > 0) {
      resumenData.establecimientos.forEach((est, index) => {
        if (!est) return

        html += `
          <div class="est-section">
            <div class="est-header">
              <h2>${est.nombre || 'Sin nombre'}</h2>
              ${est.ubicacion ? `<p>Ubicación: ${est.ubicacion}</p>` : ''}
            </div>
            <div class="est-info">
              <div class="info-item"><span class="info-label">Exámenes Requeridos:</span> <span class="info-value">${est.examenesRequeridos?.length || 0}</span></div>
            </div>
        `

        if (est.descripcion) {
          html += `<div class="descripcion">Descripción: ${est.descripcion}</div>`
        }

        if (est.examenesRequeridos && est.examenesRequeridos.length > 0) {
          html += '<div class="examen-list"><h4>Exámenes Requeridos:</h4>'
          est.examenesRequeridos.forEach(examen => {
            if (!examen) return
            html += `<div class="examen-badge">- ${examen.tipoExamenLabel || 'Sin tipo'}${examen.observaciones ? ` (${examen.observaciones})` : ''}</div>`
          })
          html += '</div>'
        } else {
          html += '<div class="no-examenes">No hay exámenes requeridos configurados</div>'
        }

        html += '</div>'
      })
    }

    html += `
        <div class="footer">
          <p>Tecin Mina - Sistema de Gestión de Exámenes Médicos | Total de establecimientos: ${resumenData.establecimientos?.length || 0}</p>
        </div>
      </body>
      </html>
    `

    return html
  }

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-navy-900 dark:text-gold-100">Gestión de Minas</h1>
        <p className="mt-2 text-sm text-navy-500 dark:text-navy-200">Administre los establecimientos y sus exámenes requeridos</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-navy-50 dark:bg-navy-800 shadow rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-navy-900 dark:text-gold-100">Establecimientos</h2>
            <p className="text-sm text-navy-500 dark:text-navy-300 mt-1">Gestione las minas y sus exámenes requeridos</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrintResumen}
              className="bg-navy-600 hover:bg-navy-700 dark:bg-navy-700 dark:hover:bg-navy-600 text-gold-100 px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2"
              disabled={loading || establecimientos.length === 0}
            >
              <span>🖨️</span> Imprimir Resumen
            </button>
            <button
              onClick={() => {
                if (showForm) {
                  // close form and reset
                  setShowForm(false)
                  setEditingEstablecimiento(null)
                  setFormData({ nombre: '', descripcion: '', ubicacion: '', examenesRequeridos: [] })
                } else {
                  setShowForm(true)
                }
              }}
              className="bg-gold-500 hover:bg-gold-600 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2"
              disabled={loading}
            >
              <span>➕</span> Nueva Mina
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-navy-700 dark:text-gold-100 mb-2">🔍 Buscar Establecimiento</label>
          <div className="relative">
            <input
              type="text"
              value={establecimientoSearch}
              onChange={(e) => setEstablecimientoSearch(e.target.value)}
              placeholder="Busque por nombre o ubicación..."
              className="w-full px-4 py-3 border border-navy-200 dark:border-navy-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-gold-400 dark:bg-navy-800 dark:text-gold-100 text-sm"
            />
            {establecimientoSearch && (
              <button
                onClick={() => setEstablecimientoSearch('')}
                className="absolute right-3 top-3 text-navy-400 hover:text-navy-600 dark:hover:text-gold-300"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 bg-navy-50 dark:bg-navy-900 rounded-lg">
            <h3 className="text-lg font-medium mb-4">{editingEstablecimiento ? 'Editar Establecimiento' : 'Nuevo Establecimiento'}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-navy-700 dark:text-gold-100 mb-1">Nombre *</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-navy-200 dark:border-navy-700 rounded-md shadow-sm focus:outline-none focus:ring-gold-300 focus:border-gold-400 dark:bg-navy-800 dark:text-gold-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 dark:text-gold-100 mb-1">Ubicación</label>
                <input
                  type="text"
                  name="ubicacion"
                  value={formData.ubicacion}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-navy-200 dark:border-navy-700 rounded-md shadow-sm focus:outline-none focus:ring-gold-300 focus:border-gold-400 dark:bg-navy-800 dark:text-gold-100"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-navy-700 dark:text-gold-100 mb-1">Descripción</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-navy-200 dark:border-navy-700 rounded-md shadow-sm focus:outline-none focus:ring-gold-300 focus:border-gold-400 dark:bg-navy-800 dark:text-gold-100"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-navy-700 dark:text-gold-100 mb-2">Exámenes Requeridos</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {TIPOS_EXAMEN.map(tipo => (
                  <div key={tipo} className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        type="checkbox"
                        checked={isExamenSelected(tipo)}
                        onChange={() => handleExamenToggle(tipo)}
                        className="h-4 w-4 text-gold-500 focus:ring-gold-300 border-navy-200 dark:border-navy-700 rounded"
                      />
                    </div>
                    <div className="ml-3 flex-1">
                      <label className="text-sm font-medium text-navy-700 dark:text-gold-100">
                        {getTipoExamenLabel(tipo)}
                      </label>
                      {isExamenSelected(tipo) && (
                        <input
                          type="text"
                          placeholder="Observaciones (opcional)"
                          value={getExamenObservaciones(tipo)}
                          onChange={(e) => handleExamenObservacionesChange(tipo, e.target.value)}
                          className="mt-1 w-full px-2 py-1 text-xs border border-navy-200 dark:border-navy-700 rounded focus:outline-none focus:ring-gold-300 focus:border-gold-400 dark:bg-navy-800 dark:text-gold-100"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button type="submit" className="bg-gold-500 hover:bg-gold-600 text-white px-4 py-2 rounded-md text-sm font-medium">
                {editingEstablecimiento ? 'Actualizar' : 'Guardar'}
              </button>
              <button type="button" onClick={handleCancel} className="bg-navy-200 dark:bg-navy-700 hover:opacity-90 text-navy-900 dark:text-gold-100 px-4 py-2 rounded-md text-sm font-medium">
                Cancelar
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="text-center py-8 text-navy-500 dark:text-navy-300">Cargando...</div>
        ) : establecimientos.length === 0 ? (
          <p className="text-center py-8 text-navy-500 dark:text-navy-300">No hay establecimientos registrados.</p>
        ) : (
          <div className="space-y-4">
            {establecimientos.filter(est => 
              establecimientoSearch === '' ||
              est.nombre.toLowerCase().includes(establecimientoSearch.toLowerCase()) ||
              (est.ubicacion || '').toLowerCase().includes(establecimientoSearch.toLowerCase())
            ).length > 0 ? (
              establecimientos.filter(est => 
                establecimientoSearch === '' ||
                est.nombre.toLowerCase().includes(establecimientoSearch.toLowerCase()) ||
                (est.ubicacion || '').toLowerCase().includes(establecimientoSearch.toLowerCase())
              ).map(establecimiento => (
                <div
                  key={establecimiento.id}
                  className="border border-navy-200 dark:border-navy-700 rounded-lg p-5 hover:shadow-lg transition-shadow bg-white dark:bg-navy-800 cursor-pointer"
                  onClick={() => handleEdit(establecimiento)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-navy-900 dark:text-gold-100">{establecimiento.nombre}</h3>
                      {establecimiento.ubicacion && (
                        <p className="text-sm text-navy-500 dark:text-navy-300 mt-1">📍 {establecimiento.ubicacion}</p>
                      )}
                      {establecimiento.descripcion && (
                        <p className="text-sm text-navy-500 dark:text-navy-300 mt-2 line-clamp-2">{establecimiento.descripcion}</p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEdit(establecimiento) }}
                        className="text-gold-600 hover:text-gold-800 dark:text-gold-400 dark:hover:text-gold-300 text-sm font-medium px-3 py-1 rounded hover:bg-gold-50 dark:hover:bg-navy-700 transition-colors"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(establecimiento.id) }}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium px-3 py-1 rounded hover:bg-red-50 dark:hover:bg-navy-700 transition-colors"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-navy-700 dark:text-gold-100 mb-2">Exámenes Requeridos:</h4>
                    {establecimiento.examenesRequeridos && establecimiento.examenesRequeridos.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {establecimiento.examenesRequeridos.map((examen, index) => (
                          <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gold-100 dark:bg-gold-900 text-gold-800 dark:text-gold-100 border border-gold-200 dark:border-gold-700">
                            ✓ {getTipoExamenLabel(examen.tipoExamen)}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-navy-500 dark:text-navy-300 italic">No hay exámenes requeridos configurados</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-navy-500 dark:text-navy-300">No hay establecimientos que coincidan con "{establecimientoSearch}"</p>
                <button
                  onClick={() => setEstablecimientoSearch('')}
                  className="text-gold-600 hover:text-gold-800 dark:text-gold-400 text-sm mt-2"
                >
                  Limpiar búsqueda
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default GestionMinas
