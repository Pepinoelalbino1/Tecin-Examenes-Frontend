import React, { useState, useEffect } from 'react'
import { getUsuarios, getExamenesByUsuario, createExamen, updateExamen, deleteExamen, createUsuario } from '../services/api'
import { getEstadoColor, getEstadoLabel, getTipoExamenLabel } from '../utils/estadoExamen'
import { format } from 'date-fns'

const TIPOS_EXAMEN = [
  'EXAMEN_MEDICO_GENERAL',
  'EXAMEN_AUDIOMETRICO',
  'EXAMEN_OCUPACIONAL',
  'EXAMEN_PSICOLOGICO',
  'EXAMEN_TOXICOLOGICO',
  'EXAMEN_ESPIRACION',
  'EXAMEN_RADIOLOGICO'
]

function UsuarioExamenes() {
  const [usuarios, setUsuarios] = useState([])
  const [examenes, setExamenes] = useState([])
  const [selectedUsuario, setSelectedUsuario] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [showUsuarioForm, setShowUsuarioForm] = useState(false)
  const [editingExamen, setEditingExamen] = useState(null)
  const [formData, setFormData] = useState({
    tipoExamen: '',
    fechaEmision: '',
    fechaCaducidad: '',
    observaciones: ''
  })
  const [usuarioForm, setUsuarioForm] = useState({
    nombre: '',
    documento: '',
    email: ''
  })
  const [usuarioErrors, setUsuarioErrors] = useState({ nombre: '', documento: '', email: '' })
  const [formErrors, setFormErrors] = useState({ tipoExamen: '', fechaEmision: '', fechaCaducidad: '' })
  const [usuarioSearch, setUsuarioSearch] = useState('')
  const [showUsuarioDropdown, setShowUsuarioDropdown] = useState(false)

  useEffect(() => {
    loadUsuarios()
  }, [])

  useEffect(() => {
    if (selectedUsuario) {
      loadExamenes(selectedUsuario)
    }
  }, [selectedUsuario])

  const loadUsuarios = async () => {
    try {
      setLoading(true)
      const response = await getUsuarios()
      setUsuarios(response.data)
    } catch (err) {
      setError('Error al cargar usuarios: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  const loadExamenes = async (usuarioId) => {
    try {
      setLoading(true)
      const response = await getExamenesByUsuario(usuarioId)
      setExamenes(response.data)
    } catch (err) {
      setError('Error al cargar exámenes: ' + (err.response?.data?.message || err.message))
    } finally {
      setLoading(false)
    }
  }

  const handleUsuarioChange = (e) => {
    const usuarioId = e.target.value ? parseInt(e.target.value) : null
    setSelectedUsuario(usuarioId)
    setExamenes([])
  }

  const validateExamField = (name, value, otherValues = {}) => {
    if (name === 'tipoExamen') return value ? '' : 'El tipo de examen es obligatorio'
    if (name === 'fechaEmision') return value ? '' : 'La fecha de emisión es obligatoria'
    if (name === 'fechaCaducidad') {
      if (!value) return 'La fecha de caducidad es obligatoria'
      if (otherValues.fechaEmision && new Date(value) < new Date(otherValues.fechaEmision)) {
        return 'La caducidad no puede ser anterior a la emisión'
      }
      return ''
    }
    return ''
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (name === 'tipoExamen' || name === 'fechaEmision' || name === 'fechaCaducidad') {
      const otherValues = { ...formData, [name]: value }
      const err = validateExamField(name, value, otherValues)
      setFormErrors(prev => ({ ...prev, [name]: err }))
      if (name === 'fechaEmision' && otherValues.fechaCaducidad) {
        const cadErr = validateExamField('fechaCaducidad', otherValues.fechaCaducidad, otherValues)
        setFormErrors(prev => ({ ...prev, fechaCaducidad: cadErr }))
      }
    }
  }

  const handleUsuarioInputChange = (e) => {
    const { name, value } = e.target
    if (name === 'documento') {
      const digits = value.replace(/\D/g, '').slice(0, 8)
      setUsuarioForm(prev => ({ ...prev, documento: digits }))
      // clear documento error when user reaches 8 digits
      if (digits.length === 8) setUsuarioErrors(prev => ({ ...prev, documento: '' }))
      return
    }

    setUsuarioForm(prev => ({ ...prev, [name]: value }))

    if (name === 'nombre') {
      setUsuarioErrors(prev => ({ ...prev, nombre: value.trim() ? '' : 'El nombre es obligatorio' }))
    }

    if (name === 'email') {
      const emailValid = /^\S+@\S+\.\S+$/.test(value)
      setUsuarioErrors(prev => ({ ...prev, email: value ? (emailValid ? '' : 'Email inválido') : '' }))
    }
  }

  const handleDocumentoBlur = () => {
    if (usuarioForm.documento.length !== 8) {
      setUsuarioErrors(prev => ({ ...prev, documento: 'El DNI debe tener 8 dígitos' }))
    } else {
      setUsuarioErrors(prev => ({ ...prev, documento: '' }))
    }
  }

  const handleSubmitUsuario = async (e) => {
    e.preventDefault()
    try {
      setError(null)
      // validate usuario fields
      const nombreErr = usuarioForm.nombre.trim() ? '' : 'El nombre es obligatorio'
      const documentoErr = usuarioForm.documento.length === 8 ? '' : 'El DNI debe tener 8 dígitos'
      const emailErr = usuarioForm.email ? (/^\S+@\S+\.\S+$/.test(usuarioForm.email) ? '' : 'Email inválido') : ''
      setUsuarioErrors({ nombre: nombreErr, documento: documentoErr, email: emailErr })
      if (nombreErr || documentoErr || emailErr) return
      await createUsuario(usuarioForm)
      setShowUsuarioForm(false)
      setUsuarioForm({ nombre: '', documento: '', email: '' })
      loadUsuarios()
    } catch (err) {
      setError('Error al crear usuario: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setError(null)
      // validate exam fields before submit
      const tipoErr = validateExamField('tipoExamen', formData.tipoExamen)
      const emisionErr = validateExamField('fechaEmision', formData.fechaEmision)
      const cadErr = validateExamField('fechaCaducidad', formData.fechaCaducidad, formData)
      setFormErrors({ tipoExamen: tipoErr, fechaEmision: emisionErr, fechaCaducidad: cadErr })
      if (tipoErr || emisionErr || cadErr) return
      const data = {
        ...formData,
        usuarioId: selectedUsuario
      }

      if (editingExamen) {
        await updateExamen(editingExamen.id, data)
      } else {
        await createExamen(data)
      }

      setShowForm(false)
      setEditingExamen(null)
      setFormData({
        tipoExamen: '',
        fechaEmision: '',
        fechaCaducidad: '',
        observaciones: ''
      })
      loadExamenes(selectedUsuario)
    } catch (err) {
      setError('Error al guardar examen: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleEdit = (examen) => {
    setEditingExamen(examen)
    setFormData({
      tipoExamen: examen.tipoExamen,
      fechaEmision: format(new Date(examen.fechaEmision), 'yyyy-MM-dd'),
      fechaCaducidad: format(new Date(examen.fechaCaducidad), 'yyyy-MM-dd'),
      observaciones: examen.observaciones || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este examen?')) {
      return
    }

    try {
      await deleteExamen(id)
      loadExamenes(selectedUsuario)
    } catch (err) {
      setError('Error al eliminar examen: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingExamen(null)
    setFormData({
      tipoExamen: '',
      fechaEmision: '',
      fechaCaducidad: '',
      observaciones: ''
    })
  }

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-navy-900 dark:text-gold-100">Gestión de Exámenes Médicos</h1>
        <p className="mt-2 text-sm text-navy-500 dark:text-navy-200">Administre los exámenes médicos de los usuarios</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-navy-50 dark:bg-navy-800 shadow rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Usuarios</h2>
          <button
            onClick={() => setShowUsuarioForm(!showUsuarioForm)}
            className="bg-gold-500 hover:bg-gold-600 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            + Nuevo Usuario
          </button>
        </div>

        {showUsuarioForm && (
          <form onSubmit={handleSubmitUsuario} className="mb-6 p-4 bg-navy-50 dark:bg-navy-900 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Nuevo Usuario</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-navy-700 dark:text-gold-100 mb-1">Nombre *</label>
                <input
                  type="text"
                  name="nombre"
                  value={usuarioForm.nombre}
                  onChange={handleUsuarioInputChange}
                  required
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-gold-300 focus:border-gold-400 dark:bg-navy-800 dark:text-gold-100 ${usuarioErrors.nombre ? 'border-red-500' : 'border-navy-200 dark:border-navy-700'}`}
                />
                {usuarioErrors.nombre && (
                  <p className="mt-1 text-sm text-red-600">{usuarioErrors.nombre}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 dark:text-gold-100 mb-1">Documento *</label>
                <input
                  type="text"
                  name="documento"
                  value={usuarioForm.documento}
                  onChange={handleUsuarioInputChange}
                  onBlur={handleDocumentoBlur}
                  inputMode="numeric"
                  maxLength={8}
                  required
                  className={
                    `w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-gold-300 focus:border-gold-400 dark:bg-navy-800 dark:text-gold-100 ${usuarioErrors.documento ? 'border-red-500' : 'border-navy-200 dark:border-navy-700'}`
                  }
                />
                {usuarioErrors.documento && (
                  <p className="mt-1 text-sm text-red-600">{usuarioErrors.documento}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 dark:text-gold-100 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={usuarioForm.email}
                  onChange={handleUsuarioInputChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-gold-300 focus:border-gold-400 dark:bg-navy-800 dark:text-gold-100 ${usuarioErrors.email ? 'border-red-500' : 'border-navy-200 dark:border-navy-700'}`}
                />
                {usuarioErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{usuarioErrors.email}</p>
                )}
              </div>
            </div>
              <div className="mt-4 flex gap-2">
              <button
                type="submit"
                disabled={Boolean(usuarioErrors.nombre || usuarioErrors.documento || usuarioErrors.email) || !usuarioForm.nombre.trim() || usuarioForm.documento.length !== 8}
                className={`bg-gold-500 hover:bg-gold-600 text-white px-4 py-2 rounded-md text-sm font-medium ${ (usuarioErrors.nombre || usuarioErrors.documento || usuarioErrors.email || !usuarioForm.nombre.trim() || usuarioForm.documento.length !== 8) ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                Guardar
              </button>
              <button type="button" onClick={() => setShowUsuarioForm(false)} className="bg-navy-200 dark:bg-navy-700 hover:opacity-90 text-navy-900 dark:text-gold-100 px-4 py-2 rounded-md text-sm font-medium">
                Cancelar
              </button>
            </div>
          </form>
        )}

        <div className="relative md:w-1/2">
          <label className="block text-sm font-medium text-navy-700 dark:text-gold-100 mb-2">Buscar Usuario</label>
          <input
            type="text"
            value={usuarioSearch}
            onChange={(e) => { setUsuarioSearch(e.target.value); setShowUsuarioDropdown(true); }}
            onFocus={() => setShowUsuarioDropdown(true)}
            placeholder="Buscar por nombre o documento..."
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
                  onMouseDown={() => { setSelectedUsuario(u.id); setUsuarioSearch(`${u.nombre} - ${u.documento}`); setShowUsuarioDropdown(false); setExamenes([]); }}
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
      </div>

      {selectedUsuario && (
        <div className="bg-navy-50 dark:bg-navy-800 shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Exámenes del Usuario</h2>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gold-500 hover:bg-gold-600 text-white px-4 py-2 rounded-md text-sm font-medium"
              disabled={loading}
            >
              + Nuevo Examen
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="mb-6 p-4 bg-navy-50 dark:bg-navy-900 rounded-lg">
              <h3 className="text-lg font-medium mb-4">{editingExamen ? 'Editar Examen' : 'Nuevo Examen'}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-navy-700 dark:text-gold-100 mb-1">Tipo de Examen *</label>
                  <select
                    name="tipoExamen"
                    value={formData.tipoExamen}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-gold-300 focus:border-gold-400 dark:bg-navy-800 dark:text-gold-100 ${formErrors.tipoExamen ? 'border-red-500' : 'border-navy-200 dark:border-navy-700'}`}
                  >
                    <option value="">-- Seleccione --</option>
                    {TIPOS_EXAMEN.map(tipo => (
                      <option key={tipo} value={tipo}>
                        {getTipoExamenLabel(tipo)}
                      </option>
                    ))}
                  </select>
                  {formErrors.tipoExamen && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.tipoExamen}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-700 dark:text-gold-100 mb-1">Fecha de Emisión *</label>
                  <input
                    type="date"
                    name="fechaEmision"
                    value={formData.fechaEmision}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-gold-300 focus:border-gold-400 dark:bg-navy-800 dark:text-gold-100 ${formErrors.fechaEmision ? 'border-red-500' : 'border-navy-200 dark:border-navy-700'}`}
                  />
                  {formErrors.fechaEmision && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.fechaEmision}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-navy-700 dark:text-gold-100 mb-1">Fecha de Caducidad *</label>
                  <input
                    type="date"
                    name="fechaCaducidad"
                    value={formData.fechaCaducidad}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-gold-300 focus:border-gold-400 dark:bg-navy-800 dark:text-gold-100 ${formErrors.fechaCaducidad ? 'border-red-500' : 'border-navy-200 dark:border-navy-700'}`}
                  />
                  {formErrors.fechaCaducidad && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.fechaCaducidad}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-navy-700 dark:text-gold-100 mb-1">Observaciones</label>
                  <textarea
                    name="observaciones"
                    value={formData.observaciones}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-navy-200 dark:border-navy-700 rounded-md shadow-sm focus:outline-none focus:ring-gold-300 focus:border-gold-400 dark:bg-navy-800 dark:text-gold-100"
                  />
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  type="submit"
                  disabled={Boolean(formErrors.tipoExamen || formErrors.fechaEmision || formErrors.fechaCaducidad) || !formData.tipoExamen || !formData.fechaEmision || !formData.fechaCaducidad}
                  className={`bg-gold-500 hover:bg-gold-600 text-white px-4 py-2 rounded-md text-sm font-medium ${ (formErrors.tipoExamen || formErrors.fechaEmision || formErrors.fechaCaducidad || !formData.tipoExamen || !formData.fechaEmision || !formData.fechaCaducidad) ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  {editingExamen ? 'Actualizar' : 'Guardar'}
                </button>
                <button type="button" onClick={handleCancel} className="bg-navy-200 dark:bg-navy-700 hover:opacity-90 text-navy-900 dark:text-gold-100 px-4 py-2 rounded-md text-sm font-medium">
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="text-center py-8 text-navy-500 dark:text-navy-300">Cargando...</div>
          ) : examenes.length === 0 ? (
            <p className="text-center py-8 text-navy-500 dark:text-navy-300">No hay exámenes registrados para este usuario.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-navy-50 dark:bg-navy-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 dark:text-navy-300 uppercase tracking-wider">Tipo de Examen</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 dark:text-navy-300 uppercase tracking-wider">Fecha de Emisión</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 dark:text-navy-300 uppercase tracking-wider">Fecha de Caducidad</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 dark:text-navy-300 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 dark:text-navy-300 uppercase tracking-wider">Observaciones</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-navy-500 dark:text-navy-300 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-navy-50 dark:bg-navy-800 divide-y divide-navy-200">
                  {examenes.map(examen => (
                    <tr key={examen.id} className="hover:bg-navy-100 dark:hover:bg-navy-800">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-navy-900 dark:text-gold-100">
                        {getTipoExamenLabel(examen.tipoExamen)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-navy-500 dark:text-navy-300">
                        {format(new Date(examen.fechaEmision), 'dd/MM/yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-navy-500 dark:text-navy-300">
                        {format(new Date(examen.fechaCaducidad), 'dd/MM/yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoColor(examen.estado)}`}>
                          {getEstadoLabel(examen.estado)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-navy-500 dark:text-navy-300">
                        {examen.observaciones || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(examen)}
                          className="text-gold-600 hover:text-gold-800 mr-4"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(examen.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default UsuarioExamenes
