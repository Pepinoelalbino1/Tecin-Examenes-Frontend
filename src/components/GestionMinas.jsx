import React, { useState, useEffect } from 'react'
import { getEstablecimientos, createEstablecimiento, updateEstablecimiento, deleteEstablecimiento } from '../services/api'
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
          <h2 className="text-xl font-semibold">Establecimientos</h2>
          <button
            onClick={() => setShowForm(true)}
            className="bg-gold-500 hover:bg-gold-600 text-white px-4 py-2 rounded-md text-sm font-medium"
            disabled={loading}
          >
            + Nueva Mina
          </button>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Exámenes Requeridos</label>
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
            {establecimientos.map(establecimiento => (
              <div key={establecimiento.id} className="border border-navy-200 dark:border-navy-700 rounded-lg p-4 hover:shadow-md transition-shadow bg-navy-50 dark:bg-navy-800">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-navy-900 dark:text-gold-100">{establecimiento.nombre}</h3>
                    {establecimiento.ubicacion && (
                      <p className="text-sm text-navy-500 dark:text-navy-300">📍 {establecimiento.ubicacion}</p>
                    )}
                    {establecimiento.descripcion && (
                      <p className="text-sm text-navy-500 dark:text-navy-300 mt-1">{establecimiento.descripcion}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(establecimiento)}
                      className="text-gold-600 hover:text-gold-800 text-sm font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(establecimiento.id)}
                      className="text-red-600 hover:text-red-900 text-sm font-medium"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-navy-700 dark:text-gold-100 mb-2">Exámenes Requeridos:</h4>
                  {establecimiento.examenesRequeridos && establecimiento.examenesRequeridos.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {establecimiento.examenesRequeridos.map((examen, index) => (
                        <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-navy-100 dark:bg-navy-700 text-navy-800 dark:text-gold-100">
                          {getTipoExamenLabel(examen.tipoExamen)}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-navy-500 dark:text-navy-300">No hay exámenes requeridos configurados</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default GestionMinas
