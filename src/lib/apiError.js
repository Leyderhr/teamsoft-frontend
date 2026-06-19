import { i18n } from '@/i18n'

export async function parseApiError(error, fallback = 'Ocurrió un error en el servidor') {
  // Si el error no trae respuesta del backend, devolvemos el error genérico.
  if (!error || !error.response) return error?.message || fallback;

  let body;
  try {
    // Leemos el error como texto puro primero (es la forma más segura para no crashear)
    // y luego lo parseamos a JSON. 
    const text = await error.response.text();
    body = JSON.parse(text);
  } catch (err) {
    // Si el backend mandó un error sin JSON (ej. fallo de servidor 500), devolvemos el texto base
    return error.message || fallback;
  }

  // Envoltorio super seguro para intentar traducir sin que la app crashee
  const translateSafe = (key, params = []) => {
    try {
      if (i18n && i18n.global && typeof i18n.global.t === 'function') {
        const result = i18n.global.t(key, params);
        // vue-i18n devuelve la misma llave si no encuentra la traducción
        return result !== key ? result : null;
      }
    } catch (e) {
      console.warn("Advertencia de traducción:", e);
    }
    return null;
  };

  try {
    // === 1. NUEVA ESTRUCTURA DEL BACKEND ===
    if (body && body.errorCode) {
      const code = String(body.errorCode).trim();

      // DTO Validation Errors
      if (code === 'VALIDATION_FAILED' && body.parameters) {
        let fieldCodes = [];
        
        if (Array.isArray(body.parameters)) {
          fieldCodes = body.parameters;
        } else if (typeof body.parameters === 'object') {
          fieldCodes = Object.values(body.parameters);
        }

        if (fieldCodes.length > 0) {
          const translatedErrors = fieldCodes.filter(Boolean).map(errItem => {
            const cleanErrCode = String(errItem).trim();
            const translation = translateSafe(`errors.${cleanErrCode}`);
            
            // Si la traducción no existe en tu errors.json, te muestra el código crudo (ej: ERR_VAL_...)
            return translation ? translation : cleanErrCode; 
          });
          return translatedErrors.join(' · ');
        }
      }

      // Business Logic Errors (Service)
      const params = Array.isArray(body.parameters) ? body.parameters : [];
      const translation = translateSafe(`errors.${code}`, params);
      return translation ? translation : code;
    }

    // === 2. ESTRUCTURAS ANTIGUAS Y COMPATIBILIDAD ===
    const raw = body.error ?? body.message ?? body['Error: '];
    if (typeof raw === 'string') {
      const translation = translateSafe(`errors.${raw.trim()}`);
      if (translation) return translation;
    }

    // Manejo nativo de Spring Boot
    if (body.fieldErrors && typeof body.fieldErrors === 'object') {
      return Object.values(body.fieldErrors).filter(Boolean).join(' · ');
    }

    if (Array.isArray(body.messages) && body.messages.length) {
      return body.messages.filter(Boolean).join(' · ');
    }

    return (typeof raw === 'string' && raw) || body.detail || fallback;

  } catch (e) {
    // En caso de cualquier otro fallo matemático, devuelve el error por defecto y no rompe tu UI
    return error.message || fallback;
  }
}