import { api } from '@/lib/api'

const importService = {
  async uploadFile(file) {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('import/upload', { body: formData }).json()
  },
  async executeImport(payload) {
    return api.post('import/execute', { json: payload }).json()
  },
  async getConfig() {
    return api.get('import/config').json()
  },
  async saveConfig(config) {
    return api.put('import/config', { json: config }).json()
  }
}

export default importService
