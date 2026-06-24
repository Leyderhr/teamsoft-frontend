import { api } from '@/lib/api'

const importService = {
  // Paso 1: sube el CSV y obtiene fileId + encabezados + preview (POST /import/parse)
  async parse(file) {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('import/parse', { body: formData }).json()
  },
  // Paso 2: ejecuta la importación con el mapeo de configuración (POST /import/execute)
  async execute(payload) {
    return api.post('import/execute', { json: payload }).json()
  }
}

export default importService
