export const ESTADO_EXAMEN = {
  VIGENTE: 'VIGENTE',
  POR_VENCER: 'POR_VENCER',
  VENCIDO: 'VENCIDO'
}

export const getEstadoColor = (estado) => {
  switch (estado) {
    case ESTADO_EXAMEN.VIGENTE:
      return 'bg-green-100 text-green-800'
    case ESTADO_EXAMEN.POR_VENCER:
      return 'bg-yellow-100 text-yellow-800'
    case ESTADO_EXAMEN.VENCIDO:
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export const getEstadoLabel = (estado) => {
  switch (estado) {
    case ESTADO_EXAMEN.VIGENTE:
      return 'Vigente'
    case ESTADO_EXAMEN.POR_VENCER:
      return 'Por Vencer'
    case ESTADO_EXAMEN.VENCIDO:
      return 'Vencido'
    default:
      return estado
  }
}

export const getTipoExamenLabel = (tipo) => {
  const labels = {
    EXAMEN_MEDICO_GENERAL: 'Examen Médico General',
    EXAMEN_AUDIOMETRICO: 'Examen Audiométrico',
    EXAMEN_OCUPACIONAL: 'Examen Ocupacional',
    EXAMEN_PSICOLOGICO: 'Examen Psicológico',
    EXAMEN_TOXICOLOGICO: 'Examen Toxicológico',
    EXAMEN_ESPIRACION: 'Examen de Espiración',
    EXAMEN_RADIOLOGICO: 'Examen Radiológico'
  }
  return labels[tipo] || tipo
}
