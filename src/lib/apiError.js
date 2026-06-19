import { i18n } from '@/i18n'

const CODE_MESSAGES = {
  fo_weights_most_sum_one:
    'Los pesos de los factores habilitados deben sumar exactamente 1.0',
  impossible_get_proposal:
    'No fue posible generar una propuesta con la configuración y las personas fijadas actuales. Ajusta los factores o revisa los miembros fijados.',
}

export async function parseApiError(error, fallback = 'Ocurrió un error en el servidor') {
  const response = error?.response
  if (response && typeof response.json === 'function') {
    try {
      const body = await response.json()

      // === ESTRUCTURAS NUEVAS DEL BACKEND ===
      if (body.errorCode) {
        
        // 1. Errores de Validación (DTO)
        if (body.errorCode === 'VALIDATION_FAILED' && body.parameters && typeof body.parameters === 'object') {
          // Extraemos los códigos de error (ej: "ERR_VAL_PERSON_NAME", "ERR_VAL_PERSON_ADDRESS")
          const fieldCodes = Object.values(body.parameters)
          
          return fieldCodes
            .filter(Boolean)
            .map(code => i18n.global.t(`errors.${code}`))
            .join(' · ')
        }

        // 2. Errores de Negocio (Service)
        // body.parameters puede ser [2] para interpolar en el texto (ej: "No encontrado {0}")
        const params = Array.isArray(body.parameters) ? body.parameters : []
        return i18n.global.t(`errors.${body.errorCode}`, params)
      }

      // === ESTRUCTURA LEGACY Y POR DEFECTO (Compatibilidad) ===
      const raw = body.error ?? body.message ?? body['Error: ']
      
      // Intentar primero traducir el error heredado
      if (typeof raw === 'string' && CODE_MESSAGES[raw]) {
         const tKey = `errors.${raw}`
         const translation = i18n.global.t(tKey)
         if (translation !== tKey) return translation
         return CODE_MESSAGES[raw]
      }

      // Validaciones de Spring Boot nativas (fieldErrors)
      if (body.fieldErrors && typeof body.fieldErrors === 'object') {
        const parts = Object.values(body.fieldErrors).filter(Boolean)
        if (parts.length) return parts.join(' · ')
      }

      // Validaciones en listado (messages)
      if (Array.isArray(body.messages) && body.messages.length) {
        return body.messages.filter(Boolean).join(' · ')
      }

      return (typeof raw === 'string' && raw) || body.detail || fallback
    } catch {
      /* cuerpo no-JSON o ya consumido */
    }
  }
  return error?.message || fallback
}