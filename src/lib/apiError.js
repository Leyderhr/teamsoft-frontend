// Traduce errores de la API (ky HTTPError) a un mensaje legible para el usuario.
// Cubre las formas que produce el GlobalExceptionHandler del backend:
//   { status, error }                              -> regla de negocio / no encontrado
//   { status, error: 'Validation failed', fieldErrors }
//   { status, error: 'Validation failed', messages }
//   { status, error: 'Malformed JSON request', message, details }
// y la forma antigua { 'Error: ': code } por compatibilidad.

const CODE_MESSAGES = {
  fo_weights_most_sum_one:
    'Los pesos de los factores habilitados deben sumar exactamente 1.0',
  impossible_get_proposal:
    'No fue posible generar una propuesta con la configuración y las personas fijadas actuales. Ajusta los factores o revisa los miembros fijados.',
}

function messageFromBody(body, fallback) {
  if (!body || typeof body !== 'object') return fallback

  const raw = body.error ?? body.message ?? body['Error: ']

  // Código de negocio conocido -> mensaje amigable
  if (typeof raw === 'string' && CODE_MESSAGES[raw]) return CODE_MESSAGES[raw]

  // Errores de validación por campo (@Valid)
  if (body.fieldErrors && typeof body.fieldErrors === 'object') {
    const parts = Object.values(body.fieldErrors).filter(Boolean)
    if (parts.length) return parts.join(' · ')
  }

  // Errores de validación de parámetros
  if (Array.isArray(body.messages) && body.messages.length) {
    return body.messages.filter(Boolean).join(' · ')
  }

  return (typeof raw === 'string' && raw) || body.detail || fallback
}

/**
 * Extrae un mensaje legible de un error de la API.
 * @param {unknown} error  Error lanzado por ky (HTTPError con .response) u otro.
 * @param {string} fallback Mensaje por defecto si no se puede parsear.
 * @returns {Promise<string>}
 */
export async function parseApiError(error, fallback = 'Ocurrió un error en el servidor') {
  const response = error?.response
  if (response && typeof response.json === 'function') {
    try {
      return messageFromBody(await response.json(), fallback)
    } catch {
      /* cuerpo no-JSON o ya consumido */
    }
  }
  return error?.message || fallback
}
